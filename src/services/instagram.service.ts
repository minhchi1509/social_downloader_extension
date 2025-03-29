import axios from "axios"
import dayjs from "dayjs"

import { igAxiosInstance } from "src/configs/axios.config"
import { IInstagramAccount } from "src/interfaces/account.interface"
import { IGetListResponse, IMedia } from "src/interfaces/common.interface"
import {
  IIGPost,
  IIGProfile,
  IIGReel,
  IIGStory
} from "src/interfaces/instagram.interface"
import { chromeUtils } from "src/utils/chrome.util"

const getInstagramAccountData = async () => {
  try {
    const cookies = await chromeUtils.getChromeCookies("instagram.com")
    const axiosInstance = axios.create({
      baseURL: "https://www.instagram.com/",
      headers: {
        cookie: cookies,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
      }
    })
    const { data: rawData } = await axiosInstance.get("/")
    const profileRegex = /\{[^{}]*"username":"[^"]*"[^{}]*\}/
    const csrfTokenRegex = /"csrf_token":"(.*?)"/
    const originalProfileInfor = rawData.match(profileRegex)
    const csrfToken = rawData.match(csrfTokenRegex)?.[1]
    if (!originalProfileInfor || !csrfToken) {
      throw new Error()
    }
    const profileInfor = JSON.parse(originalProfileInfor[0])
    const id = profileInfor.id
    const username = profileInfor.username
    const avatar = profileInfor.profile_pic_url_hd
    const instagramProfile: IInstagramAccount = {
      id,
      username,
      avatar,
      cookies,
      csrfToken
    }
    return instagramProfile
  } catch (error) {
    throw new Error(
      "Không thể lấy dữ liệu tài khoản Instagram. Đảm bảo rằng bạn đã đăng nhập vào Instagram trên trình duyệt"
    )
  }
}

const getInstagramIdAndAvatarByUsername = async (username: string) => {
  const { data } = await igAxiosInstance.get(
    `https://www.instagram.com/web/search/topsearch/?query=${username}`
  )

  const user = data?.users?.find(
    (user: any) => user?.user?.username === username
  )

  if (!user) {
    throw new Error(`Tên người dùng ${username} không tồn tại`)
  }
  return {
    id: user.user.pk as string,
    avatarUrl: user.user.profile_pic_url as string
  }
}

const getProfileStatistics = async (username: string) => {
  const { id } = await getInstagramIdAndAvatarByUsername(username)
  const { data } = await igAxiosInstance.get("/", {
    params: {
      doc_id: "8508998995859778",
      variables: JSON.stringify({
        id,
        render_surface: "PROFILE"
      })
    }
  })

  const user = data.data.user
  const profileData: IIGProfile = {
    id: user.pk || user.pk,
    username: user.username,
    full_name: user.full_name,
    avatar_url: user.hd_profile_pic_url_info.url,
    follower: user.follower_count,
    following: user.following_count,
    is_private_account: user.is_private,
    total_posts: user.media_count
  }
  return profileData
}

const getAllStoriesByHighlightId = async (highlightId: string) => {
  const { data } = await igAxiosInstance.get(
    `https://www.instagram.com/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables={"highlight_reel_ids":[${highlightId}],"reel_ids":[],"location_ids":[],"precomposed_overlay":false}`
  )
  const storiesMedia: any[] = data.data?.reels_media?.[0]?.items
  if (!storiesMedia) {
    throw new Error("Không thể lấy story từ highlight")
  }

  const result: IIGStory[] = storiesMedia.map((story) => ({
    id: story.id,
    isVideo: story.is_video,
    takenAt: story.taken_at_timestamp,
    downloadUrl: story.is_video
      ? story.video_resources[0].src
      : story.display_url
  }))

  return result
}

const getAllHighlightsIdOfUser = async (username: string) => {
  const { id: userId } = await getInstagramIdAndAvatarByUsername(username)
  const { data } = await igAxiosInstance.get("/", {
    params: {
      doc_id: "8198469583554901",
      variables: JSON.stringify({
        user_id: userId
      })
    }
  })
  const highlightsData: any[] = data.data.highlights.edges
  const allHighlightsId: string[] = highlightsData.map(
    (highlight) => highlight.node.id.split(":")[1]
  )

  return allHighlightsId
}

const getActiveStoriesByUsername = async (
  username: string
): Promise<IIGStory[]> => {
  try {
    const { id: userId } = await getInstagramIdAndAvatarByUsername(username)
    const { data: responseData } = await igAxiosInstance.get("/", {
      params: {
        query_hash: "45246d3fe16ccc6577e0bd297a5db1ab",
        variables: JSON.stringify({
          highlight_reel_ids: [],
          reel_ids: [userId],
          location_ids: [],
          precomposed_overlay: false
        })
      }
    })
    if (!responseData.data?.reels_media?.length) {
      throw new Error()
    }
    const originalStoriesData = responseData.data.reels_media[0].items
    const result: IIGStory[] = originalStoriesData.map((story: any) => ({
      id: story.id,
      takenAt: story.taken_at_timestamp,
      isVideo: story.is_video,
      downloadUrl: story.is_video
        ? story.video_resources[0].src
        : story.display_url
    }))
    return result
  } catch (error) {
    throw new Error(`Đã xảy ra lỗi khi lấy dữ liệu story của ${username}`)
  }
}

const getIgPostDataByUrl = async (postUrl: string): Promise<IIGPost> => {
  try {
    const regex =
      /"xdt_api__v1__media__shortcode__web_info":\{"items":\[(.*?)\]\}\},"extensions":/
    const { data: responseData } = await igAxiosInstance.get(postUrl)

    const match = responseData.match(regex)
    if (!match) {
      throw new Error()
    }

    const originalPostData = JSON.parse(match[1])

    const originalMediaList: any[] = Array.from(
      originalPostData.carousel_media || [originalPostData]
    )
    const videos: IMedia[] = originalMediaList
      .filter((media) => media.media_type === 2)
      .map((media) => ({
        downloadUrl: media.video_versions[0].url,
        id: media.id
      }))

    const images: IMedia[] = originalMediaList
      .filter((media) => media.media_type === 1)
      .map((media) => ({
        downloadUrl: media.image_versions2.candidates[0].url,
        id: media.id
      }))

    return {
      id: originalPostData.id,
      code: originalPostData.code,
      title: originalPostData.caption?.text,
      takenAt: dayjs
        .unix(originalPostData.taken_at)
        .format("DD/MM/YYYY HH:mm:ss"),
      totalMedia: originalMediaList.length,
      videoCount: videos.length,
      imageCount: images.length,
      likeCount: originalPostData.like_and_view_counts_disabled
        ? null
        : originalPostData.like_count,
      commentCount: originalPostData.comment_count,
      videos,
      images
    }
  } catch (error) {
    throw new Error("Đã xảy ra lỗi khi lấy dữ liệu bài viết")
  }
}

const getIgReelDataByUrl = async (reelUrl: string): Promise<IIGReel> => {
  try {
    const regex =
      /"xdt_api__v1__media__shortcode__web_info":\{"items":\[(.*?)\]\}\},"extensions":/
    const { data: responseData } = await igAxiosInstance.get(reelUrl)

    const match = responseData.match(regex)
    if (!match) {
      throw new Error()
    }

    const originalReelData = JSON.parse(match[1])

    return {
      id: originalReelData.id,
      code: originalReelData.code,
      commentCount: originalReelData.comment_count,
      takenAt: dayjs
        .unix(originalReelData.taken_at)
        .format("DD/MM/YYYY HH:mm:ss"),
      title: originalReelData.caption?.text,
      likeCount: originalReelData.like_and_view_counts_disabled
        ? null
        : originalReelData.like_count,
      downloadUrl: originalReelData.video_versions[0].url
    }
  } catch (error) {
    throw new Error("Đã xảy ra lỗi khi lấy dữ liệu reel")
  }
}

const getProfileBulkPosts = async (
  username: string,
  nextCursor: string
): Promise<IGetListResponse<IIGPost> | null> => {
  try {
    const docID = "8656566431124939"
    const query = {
      data: { count: 12 },
      username,
      __relay_internal__pv__PolarisIsLoggedInrelayprovider: true,
      __relay_internal__pv__PolarisFeedShareMenurelayprovider: true,
      after: nextCursor
    }
    const { data: responseData } = await igAxiosInstance.get("/", {
      params: {
        doc_id: docID,
        variables: JSON.stringify(query)
      }
    })

    const posts: any[] =
      responseData?.data?.[
        "xdt_api__v1__feed__user_timeline_graphql_connection"
      ]?.edges
    const pageInfor =
      responseData?.data?.[
        "xdt_api__v1__feed__user_timeline_graphql_connection"
      ]?.page_info
    if (!posts || !pageInfor) {
      return null
    }
    const formattedPosts: IIGPost[] = posts.map((post) => {
      const postData = post.node
      const originalMediaList: any[] = Array.from(
        postData.carousel_media || [postData]
      )
      const videos: IMedia[] = originalMediaList
        .filter((media) => media.media_type === 2)
        .map((media) => ({
          downloadUrl: media.video_versions[0].url,
          id: media.id
        }))

      const images: IMedia[] = originalMediaList
        .filter((media) => media.media_type === 1)
        .map((media) => ({
          downloadUrl: media.image_versions2.candidates[0].url,
          id: media.id
        }))

      return {
        id: postData.id,
        code: postData.code,
        title: postData.caption?.text,
        takenAt: dayjs.unix(postData.taken_at).format("DD/MM/YYYY HH:mm:ss"),
        totalMedia: originalMediaList.length,
        videoCount: videos.length,
        imageCount: images.length,
        likeCount: postData.like_and_view_counts_disabled
          ? null
          : postData.like_count,
        commentCount: postData.comment_count,
        videos,
        images
      }
    })
    const hasNextPage = pageInfor.has_next_page
    const endCursor = pageInfor.end_cursor
    return {
      data: formattedPosts,
      pagination: {
        hasNextPage,
        nextCursor: endCursor
      }
    }
  } catch (error) {
    return null
  }
}

const getProfileBulkReels = async (
  userId: string,
  nextCursor: string
): Promise<IGetListResponse<IIGReel> | null> => {
  try {
    const docID = "8526372674115715"
    const query = {
      data: {
        include_feed_video: true,
        page_size: 12,
        target_user_id: userId
      },
      after: nextCursor
    }
    const { data: responseData } = await igAxiosInstance.get("/", {
      params: {
        doc_id: docID,
        variables: JSON.stringify(query)
      }
    })
    const reelsCode: string[] = responseData?.data?.[
      "xdt_api__v1__clips__user__connection_v2"
    ]?.edges?.map(({ node: reel }: any) => reel.media.code)
    const pageInfor =
      responseData?.data?.["xdt_api__v1__clips__user__connection_v2"]?.page_info
    if (!reelsCode || !pageInfor) {
      return null
    }
    const formattedReels: IIGReel[] = await Promise.all(
      reelsCode.map((reelCode) =>
        instagramService.getIgReelDataByUrl(
          `https://www.instagram.com/reel/${reelCode}`
        )
      )
    )
    const hasNextPage = pageInfor.has_next_page
    const endCursor = pageInfor.end_cursor
    return {
      data: formattedReels,
      pagination: {
        hasNextPage,
        nextCursor: endCursor
      }
    }
  } catch (error) {
    return null
  }
}

const instagramService = {
  getInstagramAccountData,
  getInstagramIdAndAvatarByUsername,
  getProfileStatistics,
  getAllStoriesByHighlightId,
  getAllHighlightsIdOfUser,
  getActiveStoriesByUsername,
  getIgPostDataByUrl,
  getIgReelDataByUrl,
  getProfileBulkPosts,
  getProfileBulkReels
}

export default instagramService
