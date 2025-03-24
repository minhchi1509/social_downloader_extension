import { fbAxiosInstance } from "src/configs/axios.config"
import { EDownloadSeperateType } from "src/constants/enum"
import { URL_PATTERN } from "src/constants/regex"
import { DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE } from "src/constants/variables"
import { IFacebookStory } from "src/interfaces/facebook.interface"
import facebookService from "src/services/facebook.service"
import { chromeUtils } from "src/utils/chrome.util"
import { downloadByBatch, extractIdFromUrl } from "src/utils/common.util"

export const downloadFbPostMedia = async (postUrl: string) => {
  try {
    const { data: rawData } = await fbAxiosInstance.get(postUrl)
    const temp = JSON.parse(
      rawData.match(
        /"all_subattachments":(.*?),"comet_product_tag_feed_overlay_renderer"/
      )?.[1]
    )
    const mediaSetToken = rawData.match(/"mediaset_token":"(.*?)"/)?.[1]
    if (!temp || !mediaSetToken) {
      throw new Error()
    }
    const totalPostMedia = temp.count
    const firstMediaId = temp.nodes[0].media.id
    let totalDownloadedItems = 0
    let cursor = firstMediaId
    const baseQuery = {
      isMediaset: true,
      renderLocation: "comet_media_viewer",
      mediasetToken: mediaSetToken,
      scale: 1,
      feedLocation: "COMET_MEDIA_VIEWER"
    }
    const docID = "9478994358856279"

    while (totalDownloadedItems < totalPostMedia) {
      const query = { ...baseQuery, nodeID: cursor }
      const responseData = await facebookService.makeRequestToFb(docID, query)
      const mediaData = JSON.parse(responseData?.split("\n")?.[0])?.data
        ?.mediaset?.currMedia?.edges?.[0]?.node
      if (!mediaData) {
        continue
      }
      const isVideo = mediaData.__isMedia === "Video"
      let downloadUrl = ""
      if (isVideo) {
        const videoData =
          mediaData.videoDeliveryResponseFragment.videoDeliveryResponseResult
            .progressive_urls
        const hdUrl = videoData.find(
          (item: any) => item.metadata.quality === "HD"
        )
        const sdUrl = videoData.find(
          (item: any) => item.metadata.quality === "SD"
        )
        downloadUrl = hdUrl.progressive_url || sdUrl.progressive_url
      } else {
        downloadUrl = mediaData.image.uri
      }

      await chromeUtils.downloadFile({
        url: downloadUrl,
        filename: `fb_post/${totalDownloadedItems + 1}.${
          isVideo ? "mp4" : "jpg"
        }`
      })

      const nextMediaData = JSON.parse(
        responseData.match(/"nextMediaAfterNodeId":(.*?)\},"extensions":/)?.[1]
      )
      cursor = nextMediaData?.id
      totalDownloadedItems += 1
    }
  } catch (error) {
    console.log("Đã xảy ra lỗi khi lấy dữ liệu của bài viết:", error)
    throw new Error("Đã xảy ra lỗi khi lấy dữ liệu của bài viết")
  }
}

export const downloadFbStoryMedia = async (storyUrl: string) => {
  const storyId = extractIdFromUrl(
    storyUrl,
    URL_PATTERN[EDownloadSeperateType.FACEBOOK_STORY]
  )

  const { stories } = await facebookService.getStoryMedia(storyId)
  await downloadByBatch(
    stories,
    async (storyMedia: IFacebookStory, index: number) => {
      await chromeUtils.downloadFile({
        url: storyMedia.downloadUrl,
        filename: `fb_story_${storyId}/${index}.${storyMedia.isVideo ? "mp4" : "jpg"}`
      })
    },
    DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE
  )
}

export const downloadFbVideo = async (videoUrl: string) => {
  const videoId = extractIdFromUrl(
    videoUrl,
    URL_PATTERN[EDownloadSeperateType.FACEBOOK_VIDEO]
  )
  const downloadUrl = await facebookService.getVideoDownloadUrl(videoUrl)
  await chromeUtils.downloadFile({
    url: downloadUrl,
    filename: `fb_video_${videoId}.mp4`
  })
}

export const downloadFbReel = async (reelUrl: string) => {
  const reelId = extractIdFromUrl(
    reelUrl,
    URL_PATTERN[EDownloadSeperateType.FACEBOOK_REEL]
  )
  const reelDownloadUrl = await facebookService.getFbDownloadReelUrl(reelUrl)
  await chromeUtils.downloadFile({
    url: reelDownloadUrl,
    filename: `fb_reel_${reelId}.mp4`
  })
}

export const downloadFbCommentVideo = async (commentUrl: string) => {
  try {
    const commentId = new URL(commentUrl).searchParams.get("comment_id")
    if (!commentId) {
      throw new Error()
    }
    const { data: rawData } = await fbAxiosInstance.get(commentUrl)
    const videoDataRegex = /"progressive_urls":(.*?),"hls_playlist_urls":/
    const videoDataMatch = rawData.match(videoDataRegex)
    if (!videoDataMatch) {
      throw new Error()
    }

    const videoData = JSON.parse(videoDataMatch[1])

    const hdVideo = videoData.find((v: any) => v.metadata.quality === "HD")
    const sdVideo = videoData.find((v: any) => v.metadata.quality === "SD")
    const downloadUrl = hdVideo.progressive_url || sdVideo.progressive_url
    await chromeUtils.downloadFile({
      url: downloadUrl,
      filename: `fb_comment_video_${commentId}.mp4`
    })
  } catch (error) {
    console.log(
      "Đã xảy ra lỗi khi lấy dữ liệu của video trong bình luận:",
      error
    )
    throw new Error("Đã xảy ra lỗi khi lấy dữ liệu của video trong bình luận")
  }
}
