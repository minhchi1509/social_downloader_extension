import { ESocialProvider } from "src/constants/enum"
import { DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE } from "src/constants/variables"
import { IIGStory } from "src/interfaces/instagram.interface"
import instagramService from "src/services/instagram.service"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import { downloadByBatch, isDownloadProcessExist } from "src/utils/common.util"

const useDownloadIgActiveStories = () => {
  const { updateProcess } = useDownloadProcesses()

  const downloadActiveStories = async (username: string, processId: string) => {
    const activeStories =
      await instagramService.getActiveStoriesByUsername(username)
    await downloadByBatch(
      activeStories,
      async (story: IIGStory, storyIndex: number) => {
        if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
          return
        }
        await chromeUtils.downloadFile(
          {
            url: story.downloadUrl,
            filename: `instagram_downloader/${username}/active_stories/${storyIndex}.${
              story.isVideo ? "mp4" : "jpg"
            }`
          },
          false
        )
      },
      DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE,
      (batchIndex: number) => {
        updateProcess(ESocialProvider.INSTAGRAM, processId, {
          totalDownloadedItems: batchIndex
        })
      }
    )
    updateProcess(ESocialProvider.INSTAGRAM, processId, {
      status: "COMPLETED"
    })
  }
  return { downloadActiveStories }
}

export default useDownloadIgActiveStories
