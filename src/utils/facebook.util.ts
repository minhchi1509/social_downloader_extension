import { fbAxiosInstance } from "src/configs/axios.config"
import { EDownloadSeperateType, ESocialProvider } from "src/constants/enum"
import { URL_PATTERN } from "src/constants/regex"
import {
  DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE,
  MAX_RETRY_REQUEST
} from "src/constants/variables"
import { IFacebookStory } from "src/interfaces/facebook.interface"
import facebookService from "src/services/facebook.service"
import { chromeUtils } from "src/utils/chrome.util"
import {
  downloadByBatch,
  extractIdFromUrl,
  isVerifyAccount
} from "src/utils/common.util"

export const downloadFbPostMedia = async (postUrl: string) => {
  try {
    if (!isVerifyAccount(ESocialProvider.FACEBOOK)) {
      throw new Error(
        "Vui lòng xác thực tài khoản Facebook trước khi tải xuống!"
      )
    }
    const { data: rawData } = await fbAxiosInstance.get(postUrl)
    const temp = JSON.parse(
      rawData.match(
        /"frame_sublayout_subattachments":(.*?),"mediaset_token"/
      )?.[1] ||
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
    let retryCount = 0

    while (totalDownloadedItems < totalPostMedia) {
      if (retryCount >= MAX_RETRY_REQUEST) {
        throw new Error()
      }
      const query = { ...baseQuery, nodeID: cursor }
      const responseData = await facebookService.makeRequestToFb(docID, query)
      if (typeof responseData !== "string") {
        retryCount += 1
        continue
      }
      const temp = responseData?.split("\n")?.[0]
      const mediaData =
        JSON.parse(temp)?.data?.mediaset?.currMedia?.edges?.[0]?.node
      const originalNextCursorData = responseData?.match(
        /"nextMediaAfterNodeId":(.*?)\},"extensions":/
      )?.[1]
      if (!mediaData || !originalNextCursorData) {
        retryCount += 1
        continue
      }
      const nextMediaData = JSON.parse(originalNextCursorData)
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
      retryCount = 0
      cursor = nextMediaData?.id
      totalDownloadedItems += 1
    }
  } catch (error) {
    throw new Error(
      (error as Error).message || "Đã xảy ra lỗi khi lấy dữ liệu của bài viết!"
    )
  }
}

export const downloadFbStoryMedia = async (storyUrl: string) => {
  if (!isVerifyAccount(ESocialProvider.FACEBOOK)) {
    throw new Error("Vui lòng xác thực tài khoản Facebook trước khi tải xuống!")
  }
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
  if (!isVerifyAccount(ESocialProvider.FACEBOOK)) {
    throw new Error("Vui lòng xác thực tài khoản Facebook trước khi tải xuống!")
  }
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
  if (!isVerifyAccount(ESocialProvider.FACEBOOK)) {
    throw new Error("Vui lòng xác thực tài khoản Facebook trước khi tải xuống!")
  }
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
    if (!isVerifyAccount(ESocialProvider.FACEBOOK)) {
      throw new Error(
        "Vui lòng xác thực tài khoản Facebook trước khi tải xuống!"
      )
    }
    const commentUrlSearchParams = new URL(commentUrl).searchParams
    const commentId =
      commentUrlSearchParams.get("reply_comment_id") ||
      commentUrlSearchParams.get("comment_id")
    if (!commentId) {
      throw new Error()
    }
    const { data: rawData } = await fbAxiosInstance.get(commentUrl)
    const videoDataRegex = new RegExp(
      `"legacy_fbid":"${commentId}".*?"attachments":(\\[.*?\\])(?=,"is_markdown_enabled")`
    )
    const videoDataMatch = rawData.match(videoDataRegex)
    if (!videoDataMatch) {
      throw new Error()
    }

    const videoData = JSON.parse(videoDataMatch[1])
    const downloadUrlList =
      videoData[0].style_type_renderer.attachment.media
        .videoDeliveryResponseFragment.videoDeliveryResponseResult
        .progressive_urls

    const hdVideo = downloadUrlList.find(
      (v: any) => v.metadata.quality === "HD"
    )
    const sdVideo = downloadUrlList.find(
      (v: any) => v.metadata.quality === "SD"
    )
    const downloadUrl = hdVideo.progressive_url || sdVideo.progressive_url
    await chromeUtils.downloadFile({
      url: downloadUrl,
      filename: `fb_comment_video_${commentId}.mp4`
    })
  } catch (error) {
    throw new Error(
      (error as Error).message ||
        "Đã xảy ra lỗi khi lấy dữ liệu của video trong bình luận"
    )
  }
}
