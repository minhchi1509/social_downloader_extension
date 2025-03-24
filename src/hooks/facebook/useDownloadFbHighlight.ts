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
      const baseQuery = {
        scale: 1,
        id: btoa(
          `profile_tile_view:${userId}:intro:intro_featured_highlights_content:hscroll_cards:profile_timeline:3:7`
        )
      }
      const profileHighlightsId: string[] = []
      let hasNextPage = false
      let endCursor = ""
      let retryCount = 0

      do {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }
        const docID = "9516333321764857"
        const query = {
          ...baseQuery,
          count: 9,
          cursor: endCursor
        }
        const responseData = await facebookService.makeRequestToFb(docID, query)

        const originalHighlightsData =
          responseData?.data.node?.profile_tile_items?.edges
        const pageInfor =
          responseData?.data?.node?.profile_tile_items?.page_info

        if (!originalHighlightsData || !pageInfor) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error(
              "Đã xảy ra lỗi khi lấy dữ liệu highlight từ Facebook"
            )
          }
          continue
        }

        const highlightsId: string[] = originalHighlightsData.map(
          ({ node }: any) => node.node.id
        )

        for (let i = 0; i < highlightsId.length; i++) {
          const highlightId = highlightsId[i]
          const highlightStories =
            await facebookService.getStoryMedia(highlightId)
          if (!highlightStories) {
            continue
          }
          const { ownerId, stories } = highlightStories

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
                  filename: `facebook_downloader/${ownerId}/highlights/hightlight_${highlightId}/${storyIndex}.${story.isVideo ? "mp4" : "jpg"}`
                },
                waitUntilCompleted
              )
            },
            DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE
          )
          updateProcess(ESocialProvider.FACEBOOK, processId, {
            totalDownloadedItems: profileHighlightsId.length + i + 1
          })
        }

        profileHighlightsId.push(...highlightsId)
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

  return { startDownloadAllHighlights }
}

export default useDownloadFbHighlight
