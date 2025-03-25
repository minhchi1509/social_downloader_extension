import axios from "axios"

import { fbAxiosInstance } from "src/configs/axios.config"
import { ESocialProvider } from "src/constants/enum"
import { IFacebookAccount } from "src/interfaces/account.interface"
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
      throw new Error("Vui lòng xác thực tài khoản Facebook trước")
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
    throw new Error("Đã xảy ra lỗi khi gửi yêu cầu đến Facebook")
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
    throw new Error(
      "Không thể lấy dữ liệu tài khoản Facebook. Đảm bảo rằng bạn đã đăng nhập vào Facebook trên trình duyệt"
    )
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
    throw new Error(`Không thể lấy Facebook ID của người dùng ${username}`)
  }
}

const getFbIdFromUrl = async (url: string) => {
  if (!URL.canParse(url)) {
    throw new Error("URL không hợp lệ")
  }
  const { data } = await fbAxiosInstance.get(url)
  const userId = data?.match(/"userID":"(\d+)"/)?.[1]
  if (!userId) {
    throw new Error("Không thể lấy Facebook ID của người dùng từ URL")
  }
  return userId as string
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
    throw new Error("Không thể lấy link tải ảnh")
  }
  return downloadMenuItem as string
}

const getStoryMedia = async (storyId: string) => {
  const data = await makeRequestToFb("8367440913325249", {
    bucketID: storyId,
    focusCommentID: null,
    scale: 1
  })

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
            storyData.videoDeliveryResponseFragment.videoDeliveryResponseResult
              .progressive_urls
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
  throw new Error(`Không thể lấy dữ liệu story ${storyId}`)
}

const getVideoDownloadUrl = async (videoUrl: string) => {
  try {
    const { data: responseData } = await fbAxiosInstance.get(videoUrl, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
      }
    })
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
    throw new Error("Đã xảy ra lỗi khi lấy link tải video")
  }
}

const getPostMedia = async (postUrl: string) => {
  try {
    const { data: rawData } = await fbAxiosInstance.get(postUrl)
    const postMediaRegex =
      /"all_subattachments":(.*?),"comet_product_tag_feed_overlay_renderer"/
    const postMediaMatch = rawData.match(postMediaRegex)
    if (!postMediaMatch) {
      throw new Error("Không thể lấy dữ liệu media của bài viết")
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
    throw error || new Error("Đã xảy ra lỗi khi lấy dữ liệu của bài viết")
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
    throw new Error("Đã xảy ra lỗi khi lấy link tải reel")
  }
}

const facebookService = {
  makeRequestToFb,
  getFacebookAccountData,
  getFbIdFromUsername,
  getStoryMedia,
  getVideoDownloadUrl,
  getPostMedia,
  getFbDownloadReelUrl,
  getFbIdFromUrl,
  getPhotoDownloadUrl
}

export default facebookService
