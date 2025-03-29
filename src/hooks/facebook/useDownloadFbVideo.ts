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
    target: "PROFILE" | "GROUP",
    targetId: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let currentCursor = ""
      let retryCount = 0
      let downloadedItems = 0
      const downloadFunc =
        target === "PROFILE"
          ? facebookService.getProfileBulkVideos
          : facebookService.getGroupBulkVideos
      const downloadPath = `facebook_downloader/${target.toLowerCase()}_${targetId}/videos`

      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }
        const responseData = await downloadFunc(targetId, currentCursor)
        if (!responseData) {
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu video từ Facebook")
          }
          retryCount += 1
          continue
        }
        const { data: videos, pagination } = responseData
        await downloadByBatch(
          videos,
          async (video: IMedia, videoIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
              return
            }
            await chromeUtils.downloadFile(
              {
                url: video.downloadUrl,
                filename: `${downloadPath}/${downloadedItems + videoIndex}.mp4`
              },
              waitUntilCompleted
            )
          },
          8
        )
        downloadedItems += videos.length
        currentCursor = pagination.nextCursor
        retryCount = 0
        updateProcess(ESocialProvider.FACEBOOK, processId, {
          totalDownloadedItems: downloadedItems
        })
        if (!pagination.hasNextPage) {
          break
        }
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      }
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
