import { igAxiosInstance } from "src/configs/axios.config"
import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
import { IIGReel } from "src/interfaces/instagram.interface"
import instagramService from "src/services/instagram.service"
import useDownloadProcess from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  downloadStatisticCsvFile,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadIgReel = () => {
  const { updateProcess } = useDownloadProcess()

  const downloadCsvFile = async (reels: IIGReel[], username: string) => {
    const csvReelsData = reels.map((reel, index) => ({
      ordinal_number: index + 1,
      reel_url: `https://instagram.com/reel/${reel.code}`,
      title: reel.title,
      taken_at: reel.takenAt,
      like_count: reel.likeCount,
      comment_count: reel.commentCount
    }))
    const filename = `instagram_downloader/${username}/reels/reels_statistic.csv`
    await downloadStatisticCsvFile(csvReelsData, filename)
  }

  const startDownloadAllReels = async (
    username: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let hasMore = true
      let endCursor = ""
      const allReels: IIGReel[] = []
      const { id: igUserId } =
        await instagramService.getInstagramIdAndAvatarByUsername(username)
      const baseQuery = {
        data: {
          include_feed_video: true,
          page_size: 12,
          target_user_id: igUserId
        }
      }
      let retryCount = 0

      do {
        if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
          return
        }
        const { data } = await igAxiosInstance.get("/", {
          params: {
            doc_id: "8526372674115715",
            variables: JSON.stringify({
              ...baseQuery,
              after: endCursor
            })
          }
        })

        const reelsCode: string[] = data?.data?.[
          "xdt_api__v1__clips__user__connection_v2"
        ]?.edges?.map(({ node: reel }: any) => reel.media.code)
        const pageInfor =
          data?.data?.["xdt_api__v1__clips__user__connection_v2"]?.page_info

        if (!reelsCode || !pageInfor) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu reel từ Instagram")
          }
          continue
        }

        const formattedReels: IIGReel[] = await Promise.all(
          reelsCode.map((reelCode) =>
            instagramService.getIgReelDataByUrl(
              `https://www.instagram.com/reel/${reelCode}`
            )
          )
        )

        await downloadByBatch(
          formattedReels,
          async (reel: IIGReel, reelIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
              return
            }
            await chromeUtils.downloadFile(
              {
                url: reel.downloadUrl,
                filename: `instagram_downloader/${username}/reels/${
                  allReels.length + reelIndex
                }.mp4`
              },
              waitUntilCompleted
            )
          },
          12,
          (batchIndex: number) => {
            updateProcess(ESocialProvider.INSTAGRAM, processId, {
              totalDownloadedItems: allReels.length + batchIndex
            })
          }
        )
        allReels.push(...formattedReels)

        hasMore = pageInfor.has_next_page
        endCursor = pageInfor.end_cursor
        retryCount = 0
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      } while (hasMore)
      if (allReels.length) {
        await downloadCsvFile(allReels, username)
      }
      updateProcess(ESocialProvider.INSTAGRAM, processId, {
        status: "COMPLETED"
      })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(ESocialProvider.INSTAGRAM, processId, { status: "FAILED" })
    }
  }

  return { startDownloadAllReels }
}

export default useDownloadIgReel
