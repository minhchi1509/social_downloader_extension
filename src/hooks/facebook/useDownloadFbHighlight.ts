import { ESocialProvider } from "src/constants/enum"
import {
  DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE,
  MAX_RETRY_REQUEST
} from "src/constants/variables"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
import { IFacebookStory } from "src/interfaces/facebook.interface"
import facebookService from "src/services/facebook.service"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadFbHighlight = () => {
  const { updateProcess } = useDownloadProcesses()

  const startDownloadAllHighlights = async (
    userId: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let currentCursor = ""
      let retryCount = 0
      let downloadedItems = 0
      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }

        const responseData = await facebookService.getProfileBulkHighlightsId(
          userId,
          currentCursor
        )

        if (!responseData) {
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error(
              "Đã xảy ra lỗi khi lấy dữ liệu highlight từ Facebook"
            )
          }
          retryCount += 1
          continue
        }

        const { data: highlightsId, pagination } = responseData
        for (let i = 0; i < highlightsId.length; i++) {
          const highlightId = highlightsId[i]
          const { ownerId, stories } =
            await facebookService.getStoryMedia(highlightId)

          await downloadByBatch(
            stories,
            async (story: IFacebookStory, storyIndex: number) => {
              if (
                !isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)
              ) {
                return
              }
              await chromeUtils.downloadFile(
                {
                  url: story.downloadUrl,
                  filename: `facebook_downloader/profile_${ownerId}/highlights/hightlight_${highlightId}/${storyIndex}.${story.isVideo ? "mp4" : "jpg"}`
                },
                waitUntilCompleted
              )
            },
            DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE
          )
          updateProcess(ESocialProvider.FACEBOOK, processId, {
            totalDownloadedItems: downloadedItems + i + 1
          })
        }

        downloadedItems += highlightsId.length
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

  return { startDownloadAllHighlights }
}

export default useDownloadFbHighlight
