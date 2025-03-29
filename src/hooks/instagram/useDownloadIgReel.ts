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
      const allReels: IIGReel[] = []
      let currentCursor = ""
      let retryCount = 0
      const { id: igUserId } =
        await instagramService.getInstagramIdAndAvatarByUsername(username)

      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
          return
        }
        const responseData = await instagramService.getProfileBulkReels(
          igUserId,
          currentCursor
        )
        if (!responseData) {
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu reel từ Instagram")
          }
          retryCount += 1
          continue
        }
        const { data: reels, pagination } = responseData
        await downloadByBatch(
          reels,
          async (reel, reelIndex) => {
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
          12
        )

        allReels.push(...reels)
        currentCursor = pagination.nextCursor
        retryCount = 0
        updateProcess(ESocialProvider.INSTAGRAM, processId, {
          totalDownloadedItems: allReels.length
        })
        if (!pagination.hasNextPage) {
          break
        }
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      }
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
