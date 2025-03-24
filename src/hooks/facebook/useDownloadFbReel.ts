import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions, IMedia } from "src/interfaces/common.interface"
import facebookService from "src/services/facebook.service"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadFbReel = () => {
  const { updateProcess } = useDownloadProcesses()

  const startDownloadAllReels = async (
    userId: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      const baseQuery = {
        scale: 1,
        id: btoa(`app_collection:${userId}:168684841768375:260`),
        feedLocation: "COMET_MEDIA_VIEWER",
        feedbackSource: 65,
        focusCommentID: null,
        renderLocation: null,
        useDefaultActor: true,
        __relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider:
          false,
        __relay_internal__pv__IsWorkUserrelayprovider: false
      }
      const profileReels: IMedia[] = []
      let hasNextPage = false
      let endCursor = ""
      let retryCount = 0

      do {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }
        const docID = "8445448972232150"
        const query = {
          ...baseQuery,
          count: 10,
          cursor: endCursor
        }
        const responseText = await facebookService.makeRequestToFb(docID, query)

        const originalReelsData = JSON.parse(
          responseText?.split("\n")?.[0] ?? "null"
        )?.data?.node?.aggregated_fb_shorts

        if (!originalReelsData) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu reel từ Facebook")
          }
          continue
        }

        const formattedReels: IMedia[] = originalReelsData.edges.map(
          (item: any) => {
            const reel =
              item.profile_reel_node.node.short_form_video_context
                .playback_video.videoDeliveryLegacyFields
            const id = reel.id
            const downloadUrl =
              reel.browser_native_hd_url || reel.browser_native_sd_url
            return { id, downloadUrl }
          }
        )

        await downloadByBatch(
          formattedReels,
          async (reel: IMedia, reelIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
              return
            }
            await chromeUtils.downloadFile({
              url: reel.downloadUrl,
              filename: `facebook_downloader/${userId}/reels/${profileReels.length + reelIndex}.mp4`
            })
          },
          10
        )

        profileReels.push(...formattedReels)
        updateProcess(ESocialProvider.FACEBOOK, processId, {
          totalDownloadedItems: profileReels.length
        })
        hasNextPage = originalReelsData.page_info.has_next_page
        endCursor = originalReelsData.page_info.end_cursor
        retryCount = 0
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      } while (hasNextPage)
      updateProcess(ESocialProvider.FACEBOOK, processId, {
        status: "COMPLETED"
      })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(ESocialProvider.FACEBOOK, processId, { status: "FAILED" })
    }
  }

  return { startDownloadAllReels }
}

export default useDownloadFbReel
