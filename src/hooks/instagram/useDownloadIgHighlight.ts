import { ESocialProvider } from "src/constants/enum"
import { DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE } from "src/constants/variables"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
import { IIGStory } from "src/interfaces/instagram.interface"
import instagramService from "src/services/instagram.service"
import useDownloadProcess from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadIgHighlight = () => {
  const { updateProcess } = useDownloadProcess()

  const startDownloadAllHightlights = async (
    username: string,
    processId: string,
    {
      waitUntilCompleted,
      delayTimeInSecond,
      isMergeIntoOneFolder
    }: IDownloadAllOptions
  ) => {
    try {
      const allHighlightsId =
        await instagramService.getAllHighlightsIdOfUser(username)
      for (let i = 0; i < allHighlightsId.length; i++) {
        if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
          break
        }
        const highlightId = allHighlightsId[i]
        const stories = await instagramService.getAllStoriesByHighlightId(
          allHighlightsId[i]
        )
        await downloadByBatch(
          stories,
          async (story: IIGStory, storyIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
              return
            }
            const downloadPath = `instagram_downloader/${username}/highlights/highlight_${highlightId}${isMergeIntoOneFolder ? "_" : "/"}${storyIndex}.${story.isVideo ? "mp4" : "jpg"}`

            await chromeUtils.downloadFile(
              {
                url: story.downloadUrl,
                filename: downloadPath
              },
              waitUntilCompleted
            )
          },
          DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE
        )
        updateProcess(ESocialProvider.INSTAGRAM, processId, {
          totalDownloadedItems: i + 1
        })
        if (delayTimeInSecond) {
          await delay(delayTimeInSecond * 1000)
        }
      }
      updateProcess(ESocialProvider.INSTAGRAM, processId, {
        status: "COMPLETED"
      })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(ESocialProvider.INSTAGRAM, processId, {
        status: "FAILED"
      })
    }
  }

  return { startDownloadAllHightlights }
}

export default useDownloadIgHighlight
