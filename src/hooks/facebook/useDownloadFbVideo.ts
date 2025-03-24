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

const useDownloadFbVideo = () => {
  const { updateProcess } = useDownloadProcesses()

  const startDownloadAllVideos = async (
    userId: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      const baseQuery = {
        scale: 1,
        id: btoa(`app_collection:${userId}:1560653304174514:133`)
      }
      const profileVideos: IMedia[] = []
      let hasNextPage = false
      let endCursor = ""
      let retryCount = 0

      do {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }
        const docID = "27205790585732100"
        const query = {
          ...baseQuery,
          count: 8,
          cursor: endCursor
        }
        const responseData = await facebookService.makeRequestToFb(docID, query)

        const originalVideosId = responseData?.data?.node?.pageItems?.edges
        const pageInfor = responseData?.data?.node?.pageItems?.page_info

        if (!originalVideosId || !pageInfor) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu video từ Facebook")
          }
          continue
        }

        const formattedVideos: IMedia[] = await Promise.all(
          originalVideosId.map(async ({ node }: any) => {
            const id = node.node.id
            const videoUrl = node.url
            const downloadUrl =
              await facebookService.getVideoDownloadUrl(videoUrl)
            return { id, downloadUrl }
          })
        )

        await downloadByBatch(
          formattedVideos,
          async (video: IMedia, videoIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
              return
            }
            await chromeUtils.downloadFile({
              url: video.downloadUrl,
              filename: `facebook_downloader/${userId}/videos/${profileVideos.length + videoIndex}.mp4`
            })
          },
          8
        )
        profileVideos.push(...formattedVideos)
        updateProcess(ESocialProvider.FACEBOOK, processId, {
          totalDownloadedItems: profileVideos.length
        })
        hasNextPage = pageInfor.has_next_page
        endCursor = pageInfor.end_cursor
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

  return { startDownloadAllVideos }
}

export default useDownloadFbVideo
