import { EDownloadSeperateType } from "src/constants/enum"
import { URL_PATTERN } from "src/constants/regex"
import { DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE } from "src/constants/variables"
import { IIGStory } from "src/interfaces/instagram.interface"
import instagramService from "src/services/instagram.service"
import { chromeUtils } from "src/utils/chrome.util"
import { downloadByBatch, extractIdFromUrl } from "src/utils/common.util"

export const downloadIgPostMedia = async (postUrl: string) => {
  const postData = await instagramService.getIgPostDataByUrl(postUrl)
  const mediaList = [...postData.videos, ...postData.images]
  await Promise.all(
    mediaList.map(async (media) => {
      await chromeUtils.downloadFile(
        {
          url: media.downloadUrl,
          filename: `ig_post_${postData.code}/${media.id}.${media.downloadUrl
            .split(".")
            .pop()}`
        },
        false
      )
    })
  )
}

export const downloadIgReelMedia = async (reelUrl: string) => {
  const reelData = await instagramService.getIgReelDataByUrl(reelUrl)
  await chromeUtils.downloadFile({
    url: reelData.downloadUrl,
    filename: `ig_reel_${reelData.code}.mp4`
  })
}

export const downloadIgHighlightStories = async (highlightUrl: string) => {
  const highlightId = extractIdFromUrl(
    highlightUrl,
    URL_PATTERN[EDownloadSeperateType.INSTAGRAM_HIGHLIGHT]
  )
  const stories = await instagramService.getAllStoriesByHighlightId(highlightId)
  await downloadByBatch(
    stories,
    async (story: IIGStory, storyIndex: number) => {
      await chromeUtils.downloadFile(
        {
          url: story.downloadUrl,
          filename: `ig_highlight_${highlightId}/story_${storyIndex}.${
            story.isVideo ? "mp4" : "jpg"
          }`
        },
        false
      )
    },
    DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE
  )
}
