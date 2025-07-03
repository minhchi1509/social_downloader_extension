import axios from "axios"
import i18next from "i18next"

import { fbAxiosInstance } from "src/configs/axios.config"
import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IFacebookAccount } from "src/interfaces/account.interface"
import { IGetListResponse, IMedia } from "src/interfaces/common.interface"
import {
  IFacebookPost,
  IFacebookStory
} from "src/interfaces/facebook.interface"
import useAuth from "src/store/auth"
import { chromeUtils } from "src/utils/chrome.util"

const makeRequestToFb = async (docID: string, query: any) => {
  try {
    const fbAccountData = useAuth.getState().accounts[ESocialProvider.FACEBOOK]
    if (!fbAccountData) {
      throw new Error(i18next.t("error_messages.facebook_authenticate_first"))
    }
    const formData = new FormData()
    formData.set("__a", "1")
    formData.set("__comet_req", "15")
    formData.set("fb_dtsg", fbAccountData.fbDtsg)
    formData.set("av", fbAccountData.id)
    formData.set("doc_id", docID)
    formData.set("variables", JSON.stringify(query))
    const { data } = await fbAxiosInstance.post("/", formData)
    return data
  } catch (error) {
    throw new Error(i18next.t("error_messages.facebook_request_error"))
  }
}

const getFacebookAccountData = async () => {
  try {
    const cookies = await chromeUtils.getChromeCookies("facebook.com")
    const axiosInstance = axios.create({
      baseURL: "https://www.facebook.com",
      headers: {
        cookie: cookies,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
      }
    })
    const { data: rawData } = await axiosInstance.get("/")

    const profileRegex = /"story_bucket_owner":(.*?),"story_bucket_type":/
    const fbDtsgRegex = /"DTSGInitialData".*?"token":"(.*?)"/
    const originalProfileInfor = rawData.match(profileRegex)
    const fbDtsg = rawData.match(fbDtsgRegex)?.[1]
    if (!originalProfileInfor || !fbDtsg) {
      throw new Error()
    }
    const profileInfor = JSON.parse(originalProfileInfor[1])

    const id = profileInfor.id
    const fullName = profileInfor.name
    const avatar = profileInfor.profile_picture.uri
    const fbAccountData: IFacebookAccount = {
      id,
      username: fullName,
      avatar,
      cookies,
      fbDtsg
    }
    return fbAccountData
  } catch (error) {
    throw new Error(i18next.t("error_messages.facebook_account_error"))
  }
}

const getFbIdFromUsername = async (username: string) => {
  try {
    const { data } = await fbAxiosInstance.get(
      `https://www.facebook.com/${username}`
    )
    const userId = data.match(/"userID":"(\d+)"/)[1]
    return userId as string
  } catch (error) {
    throw new Error(
      i18next.t("error_messages.facebook_user_id_error", { username })
    )
  }
}

const getGroupIdFromName = async (groupName: string) => {
  try {
    const { data } = await fbAxiosInstance.get(
      `https://www.facebook.com/groups/${groupName}`
    )
    const groupId = data.match(/"groupID":"(\d+)"/)[1]
    if (!groupId) {
      throw new Error()
    }
    return groupId as string
  } catch (error) {
    throw new Error(
      i18next.t("error_messages.facebook_group_id_error", { groupName })
    )
  }
}

const getFbIdFromUrl = async (url: string) => {
  if (!URL.canParse(url)) {
    throw new Error(i18next.t("error_messages.invalid_url"))
  }
  const { data } = await fbAxiosInstance.get(url)
  const userId = data?.match(/"userID":"(\d+)"/)?.[1]
  if (!userId) {
    throw new Error(
      i18next.t("error_messages.facebook_user_id_error", { username: "URL" })
    )
  }
  return userId as string
}

const getProfileBulkPhotos = async (
  userId: string,
  nextCursor: string = ""
): Promise<IGetListResponse<IMedia> | null> => {
  try {
    const docID = "9464814726967704"
    const query = {
      scale: 1,
      id: btoa(`app_collection:${userId}:2305272732:5`),
      count: 8,
      cursor: nextCursor
    }
    const responseData = await makeRequestToFb(docID, query)
    const originalPhotos = responseData?.data?.node?.pageItems?.edges
    const pageInfor = responseData?.data?.node?.pageItems?.page_info
    if (!originalPhotos || !pageInfor) {
      return null
    }
    const formattedPhotosList: IMedia[] = originalPhotos.map(
      ({ node }: any) => ({
        id: node.node.id,
        downloadUrl: node.node.viewer_image.uri
      })
    )
    return {
      data: formattedPhotosList,
      pagination: {
        hasNextPage: pageInfor.has_next_page,
        nextCursor: pageInfor.end_cursor
      }
    }
  } catch (error) {
    return null
  }
}

const getProfileBulkReels = async (
  userId: string,
  nextCursor: string = ""
): Promise<IGetListResponse<IMedia> | null> => {
  try {
    const docID = "9608255752564845"
    const query = {
      scale: 1,
      id: btoa(`app_collection:${userId}:168684841768375:260`),
      renderLocation: null,
      useDefaultActor: true,
      __relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider:
        true,
      __relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider:
        true,
      count: 10,
      cursor: nextCursor
    }
    const responseTextData = await makeRequestToFb(docID, query)
    if (typeof responseTextData !== "string") {
      return null
    }
    const originalData = JSON.parse(responseTextData.split("\n")?.[0] ?? "null")
      ?.data?.node?.aggregated_fb_shorts
    const originalReelsData = originalData?.edges
    const pageInfor = originalData?.page_info
    if (!originalReelsData || !pageInfor) {
      return null
    }
    const formattedReels: IMedia[] = originalReelsData.map((item: any) => {
      const reelData = item.profile_reel_node.node.attachments[0].media
      const id = reelData.id
      const downloadUrlList =
        reelData.videoDeliveryResponseFragment.videoDeliveryResponseResult
          .progressive_urls
      const hdDownloadUrl = downloadUrlList.find(
        (url: any) => url.metadata.quality === "HD"
      )?.progressive_url
      const sdDownloadUrl = downloadUrlList.find(
        (url: any) => url.metadata.quality === "SD"
      )?.progressive_url
      const downloadUrl = hdDownloadUrl || sdDownloadUrl
      return { id, downloadUrl }
    })
    return {
      data: formattedReels,
      pagination: {
        hasNextPage: pageInfor.has_next_page,
        nextCursor: pageInfor.end_cursor
      }
    }
  } catch (error) {
    return null
  }
}

const getProfileBulkHighlightsId = async (
  userId: string,
  nextCursor: string = ""
): Promise<IGetListResponse<string> | null> => {
  try {
    const docID = "9516333321764857"
    const query = {
      scale: 1,
      id: btoa(
        `profile_tile_view:${userId}:intro:intro_featured_highlights_content:hscroll_cards:profile_timeline:3:7`
      ),
      count: 9,
      cursor: nextCursor
    }
    const responseData = await makeRequestToFb(docID, query)
    const originalHighlightsData =
      responseData?.data.node?.profile_tile_items?.edges
    const pageInfor = responseData?.data?.node?.profile_tile_items?.page_info
    if (!originalHighlightsData || !pageInfor) {
      return null
    }
    const highlightsId: string[] = originalHighlightsData.map(
      ({ node }: any) => node.node.id
    )
    return {
      data: highlightsId,
      pagination: {
        hasNextPage: pageInfor.has_next_page,
        nextCursor: pageInfor.end_cursor
      }
    }
  } catch (error) {
    return null
  }
}

const getPhotoDownloadUrl = async (photoId: string, userId: string) => {
  const query = {
    feed_location: "COMET_MEDIA_VIEWER",
    id: btoa(`S:_I${userId}:VK:${photoId}`),
    scale: 1
  }
  const docID = "9230003843719229"
  const { data: responseData } = await makeRequestToFb(docID, query)
  const menuItems = responseData.node.nfx_action_menu_items
  const downloadMenuItem = menuItems.find(
    (item: any) => item.__typename === "PhotoDownloadMenuItem"
  )?.story?.attachments?.[0]?.media?.download_link
  if (!downloadMenuItem) {
    throw new Error(
      i18next.t("error_messages.facebook_photo_download_link_error")
    )
  }
  return downloadMenuItem as string
}

const getStoryMedia = async (storyId: string) => {
  try {
    let retryCount = 0
    while (true) {
      const data = await makeRequestToFb("8367440913325249", {
        bucketID: storyId,
        focusCommentID: null,
        scale: 1
      })
      if (typeof data !== "string") {
        retryCount += 1
        if (retryCount > MAX_RETRY_REQUEST) {
          throw new Error()
        }
        continue
      }

      const storiesDataString = data.match(
        /"unified_stories":\{"edges":(.*?)\},"owner":\{/
      )
      const storyOwnerIdString = data.match(
        /"__isNode":"User","id":"(.*?)","name":/
      )

      if (
        storiesDataString &&
        storiesDataString[1] &&
        storyOwnerIdString &&
        storyOwnerIdString[1]
      ) {
        const storyOwnerId = storyOwnerIdString[1]
        const storiesData: any[] = JSON.parse(storiesDataString[1])

        const stories: IFacebookStory[] = storiesData
          .map((story) => {
            const storyData = story?.node?.attachments?.[0]?.media
            if (!storyData) {
              return undefined
            }
            const id = storyData.id
            const isVideo = storyData.__isMedia === "Video"
            if (isVideo) {
              const videoDataList =
                storyData.videoDeliveryResponseFragment
                  .videoDeliveryResponseResult.progressive_urls
              const hdVideoUrl = videoDataList.find(
                (videoData: any) => videoData.metadata.quality === "HD"
              )?.progressive_url
              const sdVideoUrl = videoDataList.find(
                (videoData: any) => videoData.metadata.quality === "SD"
              )?.progressive_url
              const videoThumbnailUrl =
                storyData.previewImage.uri ||
                storyData.preferred_thumbnail.image.uri
              return {
                id,
                downloadUrl: hdVideoUrl || sdVideoUrl,
                isVideo,
                thumbnailUrl: videoThumbnailUrl
              }
            }

            return {
              id,
              downloadUrl: storyData.image.uri,
              isVideo,
              thumbnailUrl: undefined
            }
          })
          .filter((story) => !!story)
        return { ownerId: storyOwnerId, stories }
      }
    }
  } catch (error) {
    throw new Error(i18next.t("error_messages.facebook_story_data_error"))
  }
}

const getVideoDownloadUrl = async (videoIdOrUrl: string) => {
  try {
    let responseData = ""
    if (URL.canParse(videoIdOrUrl)) {
      const { data } = await fbAxiosInstance.get(videoIdOrUrl)
      responseData = data
    } else {
      const docID = "28794956770150840"
      const query = { scale: 1, videoID: videoIdOrUrl }
      const data = await makeRequestToFb(docID, query)
      responseData = data
    }
    const regex = /"progressive_urls":(.*?),"hls_playlist_urls":/
    const match = responseData.match(regex)
    if (!match) {
      throw new Error()
    }
    const videoDownloadUris = JSON.parse(match[1])
    const hdUri = videoDownloadUris.find(
      (v: any) => v.metadata.quality === "HD"
    )
    const sdUri = videoDownloadUris.find(
      (v: any) => v.metadata.quality === "SD"
    )
    return (hdUri.progressive_url || sdUri.progressive_url) as string
  } catch (error) {
    throw new Error(
      i18next.t("error_messages.facebook_video_download_link_error")
    )
  }
}

const getProfileBulkVideos = async (
  userId: string,
  nextCursor: string = ""
): Promise<IGetListResponse<IMedia> | null> => {
  try {
    const docID = "27205790585732100"
    const query = {
      scale: 1,
      id: btoa(`app_collection:${userId}:1560653304174514:133`),
      count: 8,
      cursor: nextCursor
    }
    const responseData = await facebookService.makeRequestToFb(docID, query)
    const originalVideosId = responseData?.data?.node?.pageItems?.edges
    const pageInfor = responseData?.data?.node?.pageItems?.page_info
    if (!originalVideosId || !pageInfor) {
      return null
    }
    const formattedVideos: IMedia[] = await Promise.all(
      originalVideosId.map(async ({ node }: any) => {
        const id = node.node.id
        const videoUrl = node.url
        const downloadUrl = await getVideoDownloadUrl(videoUrl)
        return { id, downloadUrl }
      })
    )
    return {
      data: formattedVideos,
      pagination: {
        hasNextPage: pageInfor.has_next_page,
        nextCursor: pageInfor.end_cursor
      }
    }
  } catch (error) {
    return null
  }
}

const getGroupBulkVideos = async (
  groupID: string,
  nextCursor: string = ""
): Promise<IGetListResponse<IMedia> | null> => {
  try {
    const docID = "9767488053296437"
    const query = {
      count: 8,
      cursor: nextCursor,
      scale: 1,
      id: groupID
    }
    const responseData = await facebookService.makeRequestToFb(docID, query)
    const originalVideosData =
      responseData?.data?.node?.group_mediaset?.media?.edges
    const pageInfor = responseData?.data?.node?.group_mediaset?.media?.page_info
    if (!originalVideosData || !pageInfor) {
      return null
    }
    const videosInfor: { videoId: string; url: string }[] =
      originalVideosData.map(({ node }: any) => ({
        videoId: node.id,
        url: node.url
      }))
    const formattedVideos: IMedia[] = await Promise.all(
      videosInfor.map(async ({ videoId, url }) => {
        const downloadUrl = await getVideoDownloadUrl(url)
        return { id: videoId, downloadUrl }
      })
    )
    return {
      data: formattedVideos,
      pagination: {
        hasNextPage: pageInfor.has_next_page,
        nextCursor: pageInfor.end_cursor
      }
    }
  } catch (error) {
    return null
  }
}

const getPostMedia = async (postUrl: string) => {
  try {
    const { data: rawData } = await fbAxiosInstance.get(postUrl)
    const postMediaRegex =
      /"all_subattachments":(.*?),"comet_product_tag_feed_overlay_renderer"/
    const postMediaMatch = rawData.match(postMediaRegex)
    if (!postMediaMatch) {
      throw new Error(i18next.t("error_messages.facebook_post_media_error"))
    }
    const postMediaData = JSON.parse(postMediaMatch[1])
    const postMedia: IFacebookPost[] = postMediaData.nodes.map(
      ({ media }: any) => {
        const isVideo = media.__isMedia === "Video"
        const id = media.id
        let downloadUrl = media.viewer_image.uri
        if (isVideo) {
          const videoDataList =
            media.video_grid_renderer.video.videoDeliveryResponseFragment
              .videoDeliveryResponseResult.progressive_urls
          const hdVideoUrl = videoDataList.find(
            (videoData: any) => videoData.metadata.quality === "HD"
          )?.progressive_url
          const sdVideoUrl = videoDataList.find(
            (videoData: any) => videoData.metadata.quality === "SD"
          )?.progressive_url
          downloadUrl = hdVideoUrl || sdVideoUrl
        }
        return {
          id,
          downloadUrl,
          isVideo
        }
      }
    )
    return postMedia
  } catch (error) {
    throw (
      error || new Error(i18next.t("error_messages.facebook_post_data_error"))
    )
  }
}

const getFbDownloadReelUrl = async (reelUrl: string) => {
  try {
    const { data: rawData } = await fbAxiosInstance.get(reelUrl)
    const reelDataRegex = /"progressive_urls":(.*?),"hls_playlist_urls":/
    const reelDataMatch = rawData.match(reelDataRegex)
    if (!reelDataMatch) {
      throw new Error()
    }
    const reelData = JSON.parse(reelDataMatch[1])
    const hdUri = reelData.find((v: any) => v.metadata.quality === "HD")
    const sdUri = reelData.find((v: any) => v.metadata.quality === "SD")
    return (hdUri.progressive_url || sdUri.progressive_url) as string
  } catch (error) {
    throw new Error(
      i18next.t("error_messages.facebook_reel_download_link_error")
    )
  }
}

const getBulkAlbumMediaById = async (
  albumId: string,
  nextCursor: string
): Promise<IGetListResponse<IFacebookPost> | null> => {
  try {
    const docID = "9026124860850231"
    const query = {
      count: 14,
      cursor: nextCursor,
      scale: 1,
      id: albumId
    }
    const responseData = await makeRequestToFb(docID, query)
    const originalAlbumPhotosData = responseData?.data?.node?.grid_media?.edges
    const pageInfor = responseData?.data?.node?.grid_media?.page_info
    if (!originalAlbumPhotosData || !pageInfor) {
      return null
    }
    const albumMediaDetail: {
      id: string
      ownerId: string
      isVideo: boolean
    }[] = originalAlbumPhotosData.map(({ node }: any) => ({
      id: node.id,
      ownerId: node.owner.id,
      isVideo: node.__isMedia === "Video"
    }))

    const result: IFacebookPost[] = await Promise.all(
      albumMediaDetail.map(async ({ id, isVideo, ownerId }) => {
        const downloadUrl = await (isVideo
          ? facebookService.getVideoDownloadUrl(
              `https://www.facebook.com/${ownerId}/videos/${id}`
            )
          : facebookService.getPhotoDownloadUrl(id, ownerId))
        return { id, downloadUrl, isVideo }
      })
    )
    return {
      data: result,
      pagination: {
        hasNextPage: pageInfor.has_next_page,
        nextCursor: pageInfor.end_cursor
      }
    }
  } catch (error) {
    return null
  }
}

const getGroupBulkPhotos = async (
  groupID: string,
  nextCursor: string
): Promise<IGetListResponse<IMedia> | null> => {
  try {
    const docID = "8943995049039923"
    const query = {
      count: 8,
      cursor: nextCursor,
      scale: 1,
      id: groupID
    }
    const responseData = await makeRequestToFb(docID, query)
    const originalGroupPhotosData: any[] =
      responseData?.data?.node?.group_mediaset?.media?.edges
    const pageInfor = responseData?.data?.node?.group_mediaset?.media?.page_info
    if (!originalGroupPhotosData || !pageInfor) {
      return null
    }
    const photosDetailList: { photoId: string; ownerId: string }[] =
      originalGroupPhotosData.map(({ node }) => ({
        photoId: node.id,
        ownerId: node.owner.id
      }))
    const result: IMedia[] = await Promise.all(
      photosDetailList.map(async ({ photoId, ownerId }) => {
        const downloadUrl = await getPhotoDownloadUrl(photoId, ownerId)
        return { id: photoId, downloadUrl }
      })
    )
    return {
      data: result,
      pagination: {
        hasNextPage: pageInfor.has_next_page,
        nextCursor: pageInfor.end_cursor
      }
    }
  } catch (error) {
    return null
  }
}

const getCommentData = async (commentUrl: string) => {
  try {
    const { data: rawData } = await fbAxiosInstance.get(commentUrl)
    const postIdRegex = /"post_id":"(.*?)"/
    const postIdMatch = rawData.match(postIdRegex)
    const postId = postIdMatch?.[1]
    if (!postId) {
      throw new Error()
    }
    const commentId = new URL(commentUrl).searchParams.get("comment_id")
    if (!commentId) {
      throw new Error()
    }
    const docID = "28843177298663113"
    const baseQuery = {
      commentsIntentToken: "RANKED_UNFILTERED_CHRONOLOGICAL_REPLIES_INTENT_V1",
      feedLocation: "TAHOE",
      focusCommentID: null,
      scale: 1,
      useDefaultActor: false,
      id: btoa(`feedback:${postId}`),
      __relay_internal__pv__IsWorkUserrelayprovider: false
    }
    let retryCount = 0
    let nextCursor = ""
    let hasNextPage = true
    do {
      const query = {
        ...baseQuery,
        ...(nextCursor && { commentsAfterCursor: nextCursor })
      }
      let responseData = await makeRequestToFb(docID, query)
      if (typeof responseData === "string") {
        responseData = JSON.parse(responseData.split("\n")?.[0] ?? "null")
      }
      const originalCommentDataList =
        responseData?.data?.node?.comment_rendering_instance_for_feed_location
          ?.comments?.edges
      const pageInfor =
        responseData?.data?.node?.comment_rendering_instance_for_feed_location
          ?.comments?.page_info
      if (!originalCommentDataList || !pageInfor) {
        retryCount += 1
        if (retryCount > MAX_RETRY_REQUEST) {
          throw new Error()
        }
        continue
      }
      retryCount = 0
      hasNextPage = pageInfor.has_next_page
      nextCursor = pageInfor.end_cursor
      const commentData = originalCommentDataList.find(
        ({ node }: any) => node.legacy_fbid === commentId
      )
      if (!commentData) {
        continue
      }
      const expansionToken =
        commentData.node.feedback.expansion_info.expansion_token
      const haveReply = !!commentData.node.feedback.replies_fields.total_count
      const videoList =
        commentData.node.attachments[0].style_type_renderer.attachment.media
          .videoDeliveryResponseFragment.videoDeliveryResponseResult
          .progressive_urls
      const hdVideoUrl = videoList.find(
        (videoData: any) => videoData.metadata.quality === "HD"
      )?.progressive_url
      const sdVideoUrl = videoList.find(
        (videoData: any) => videoData.metadata.quality === "SD"
      )?.progressive_url
      const downloadUrl = hdVideoUrl || sdVideoUrl
      return {
        commentId,
        postId,
        expansionToken,
        haveReply,
        videoDownloadUrl: downloadUrl
      }
    } while (hasNextPage)
    return null
  } catch (error) {
    throw new Error(i18next.t("error_messages.facebook_comment_data_error"))
  }
}

const getReplyCommentData = async (
  commentId: string,
  {
    expansionToken,
    postId,
    parentCommentId
  }: {
    postId: string
    expansionToken: string
    parentCommentId: string
  }
) => {
  try {
    let retryCount = 0
    let hasNextPage = true
    let nextCursor = ""
    const docID = "23910019488599200"
    const baseQuery = {
      clientKey: null,
      expansionToken,
      feedLocation: "DEDICATED_COMMENTING_SURFACE",
      focusCommentID: null,
      repliesAfterCount: null,
      repliesAfterCursor: null,
      repliesBeforeCount: null,
      repliesBeforeCursor: null,
      scale: 1,
      useDefaultActor: false,
      id: btoa(`feedback:${postId}_${parentCommentId}`),
      __relay_internal__pv__IsWorkUserrelayprovider: false
    }
    do {
      const query = {
        ...baseQuery,
        ...(nextCursor && { repliesAfterCursor: nextCursor })
      }
      let responseData = await makeRequestToFb(docID, query)
      if (typeof responseData === "string") {
        responseData = JSON.parse(responseData.split("\n")?.[0] ?? "null")
      }
      const originalCommentDataList =
        responseData?.data?.node?.replies_connection?.edges
      const pageInfor = responseData?.data?.node?.replies_connection?.page_info
      if (!originalCommentDataList || !pageInfor) {
        retryCount += 1
        if (retryCount > MAX_RETRY_REQUEST) {
          throw new Error()
        }
        continue
      }
      retryCount = 0
      hasNextPage = pageInfor.has_next_page
      nextCursor = pageInfor.end_cursor
      const commentData = originalCommentDataList.find(
        ({ node }: any) => node.legacy_fbid === commentId
      )
      if (!commentData) {
        continue
      }
      const videoList =
        commentData.node.attachments[0].style_type_renderer.attachment.media
          .videoDeliveryResponseFragment.videoDeliveryResponseResult
          .progressive_urls
      const hdVideoUrl = videoList.find(
        (videoData: any) => videoData.metadata.quality === "HD"
      )?.progressive_url
      const sdVideoUrl = videoList.find(
        (videoData: any) => videoData.metadata.quality === "SD"
      )?.progressive_url
      const downloadUrl = hdVideoUrl || sdVideoUrl
      return {
        videoDownloadUrl: downloadUrl
      }
    } while (hasNextPage)
    return null
  } catch (error) {
    throw new Error(
      i18next.t("error_messages.facebook_reply_comment_data_error")
    )
  }
}

const facebookService = {
  makeRequestToFb,
  getFacebookAccountData,
  getFbIdFromUsername,
  getGroupIdFromName,
  getStoryMedia,
  getVideoDownloadUrl,
  getPostMedia,
  getFbDownloadReelUrl,
  getFbIdFromUrl,
  getPhotoDownloadUrl,
  getProfileBulkPhotos,
  getGroupBulkPhotos,
  getProfileBulkReels,
  getProfileBulkVideos,
  getGroupBulkVideos,
  getProfileBulkHighlightsId,
  getBulkAlbumMediaById,
  getCommentData,
  getReplyCommentData
}

export default facebookService
