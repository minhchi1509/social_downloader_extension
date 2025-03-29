import axios from "axios"
import dayjs from "dayjs"

import { threadsAxiosInstance } from "src/configs/axios.config"
import { IThreadsAccount } from "src/interfaces/account.interface"
import { IGetListResponse, IMedia } from "src/interfaces/common.interface"
import { IThreadsPost } from "src/interfaces/threads.interface"
import { chromeUtils } from "src/utils/chrome.util"

const getThreadsAccountData = async () => {
  try {
    const cookies = await chromeUtils.getChromeCookies("threads.net")
    const axiosInstance = axios.create({
      baseURL: "https://www.threads.net/",
      headers: {
        cookie: cookies,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
      }
    })
    const { data: rawData } = await axiosInstance.get("/")
    const profileRegex = /"viewer":(.*?)},/
    const igAppIdRegex = /"APP_ID":"(\d+)"/
    const originalProfileInfor = rawData.match(profileRegex)?.[1]
    const igAppId = rawData.match(igAppIdRegex)?.[1]
    if (!originalProfileInfor || !igAppId) {
      throw new Error()
    }
    const profileInfor = JSON.parse(originalProfileInfor)
    const threadsProfile: IThreadsAccount = {
      id: profileInfor.id,
      username: profileInfor.username,
      avatar: profileInfor.profile_picture_url,
      cookies,
      igAppId
    }
    return threadsProfile
  } catch (error) {
    throw new Error(
      "Không thể lấy dữ liệu tài khoản Threads. Đảm bảo rằng bạn đã đăng nhập vào Threads trên trình duyệt"
    )
  }
}

const getUserIdByUsername = async (username: string) => {
  const { data } = await threadsAxiosInstance.get(
    `https://www.threads.net/@${username}`
  )
  const userId = data.match(/"user_id":"(\d+)"/)?.[1]
  if (!userId) {
    throw new Error("Không thể lấy thông tin người dùng")
  }
  return userId as string
}

const geThreadstPostDataByUrl = async (
  postUrl: string
): Promise<IThreadsPost> => {
  try {
    const regex = /"thread_items":\[(.*?)\],"thread_type":/
    const { data: responseData } = await threadsAxiosInstance.get(postUrl)

    const match = responseData.match(regex)
    if (!match) {
      throw new Error()
    }

    const postData = JSON.parse(match[1]).post
    const haveMedia =
      postData?.carousel_media ||
      postData?.image_versions2?.candidates?.length > 0 ||
      postData?.video_versions ||
      postData?.audio
    if (!haveMedia) {
      return {
        id: postData.pk,
        code: postData.code,
        title: postData.caption?.text,
        takenAt: dayjs.unix(postData.taken_at).format("DD/MM/YYYY HH:mm:ss"),
        totalMedia: 0,
        videoCount: 0,
        imageCount: 0,
        audioCount: 0,
        likeCount: postData.like_and_view_counts_disabled
          ? null
          : postData.like_count,
        commentCount: postData.text_post_app_info.direct_reply_count,
        images: [],
        videos: [],
        audios: []
      }
    }

    const originalMediaList: any[] = Array.from(
      postData.carousel_media || [postData]
    )
    const videos: IMedia[] = originalMediaList
      .filter((media) => !!media.video_versions)
      .map((media) => ({
        id: media.id,
        downloadUrl: media.video_versions[0].url
      }))

    const images: IMedia[] = originalMediaList
      .filter((media) => !!!media.video_versions && !!media.image_versions2)
      .map((media) => ({
        id: media.id,
        downloadUrl: media.image_versions2.candidates[0].url
      }))

    const audios: IMedia[] = originalMediaList
      .filter((media) => !!media.audio)
      .map((media, index) => ({
        id: `audio_${index}`,
        downloadUrl: media.audio.audio_src
      }))

    return {
      id: postData.pk,
      code: postData.code,
      title: postData.caption?.text,
      takenAt: dayjs.unix(postData.taken_at).format("DD/MM/YYYY HH:mm:ss"),
      totalMedia: originalMediaList.length,
      videoCount: videos.length,
      imageCount: images.length,
      audioCount: audios.length,
      likeCount: postData.like_and_view_counts_disabled
        ? null
        : postData.like_count,
      commentCount: postData.text_post_app_info.direct_reply_count,
      videos,
      images,
      audios
    }
  } catch (error) {
    throw new Error(`Đã xảy ra lỗi khi lấy dữ liệu bài viết`)
  }
}

const getProfileBulkPosts = async (
  userID: string,
  nextCursor: string
): Promise<IGetListResponse<IThreadsPost> | null> => {
  try {
    const docID = "27451289061182391"
    const query = {
      before: null,
      first: 10,
      last: null,
      userID,
      __relay_internal__pv__BarcelonaIsLoggedInrelayprovider: true,
      __relay_internal__pv__BarcelonaIsInlineReelsEnabledrelayprovider: true,
      __relay_internal__pv__BarcelonaOptionalCookiesEnabledrelayprovider: true,
      __relay_internal__pv__BarcelonaShowReshareCountrelayprovider: true,
      __relay_internal__pv__BarcelonaQuotedPostUFIEnabledrelayprovider: false,
      __relay_internal__pv__BarcelonaIsCrawlerrelayprovider: false,
      __relay_internal__pv__BarcelonaShouldShowFediverseM075Featuresrelayprovider:
        true,
      after: nextCursor
    }
    const { data: responseData } = await threadsAxiosInstance.get("/", {
      params: {
        doc_id: docID,
        variables: JSON.stringify(query)
      }
    })
    const posts: any[] = responseData?.data?.mediaData?.edges
    const pageInfor = responseData?.data?.mediaData?.page_info
    if (!posts || !pageInfor) {
      return null
    }
    const formattedPosts: IThreadsPost[] = posts.map((post) => {
      const postData = post.node.thread_items[0].post
      const haveMedia =
        postData?.carousel_media ||
        postData?.image_versions2?.candidates?.length > 0 ||
        postData?.video_versions ||
        postData?.audio
      if (!haveMedia) {
        return {
          id: postData.pk,
          code: postData.code,
          title: postData.caption?.text,
          takenAt: dayjs.unix(postData.taken_at).format("DD/MM/YYYY HH:mm:ss"),
          totalMedia: 0,
          videoCount: 0,
          imageCount: 0,
          audioCount: 0,
          likeCount: postData.like_and_view_counts_disabled
            ? null
            : postData.like_count,
          commentCount: postData.text_post_app_info.direct_reply_count,
          images: [],
          videos: [],
          audios: []
        }
      }

      const originalMediaList: any[] = Array.from(
        postData.carousel_media || [postData]
      )
      const videos: IMedia[] = originalMediaList
        .filter((media) => !!media.video_versions)
        .map((media) => ({
          downloadUrl: media.video_versions[0].url,
          id: media.id
        }))

      const images: IMedia[] = originalMediaList
        .filter((media) => !!!media.video_versions && !!media.image_versions2)
        .map((media) => ({
          downloadUrl: media.image_versions2.candidates[0].url,
          id: media.id
        }))

      const audios: IMedia[] = originalMediaList
        .filter((media) => !!media.audio)
        .map((media, index) => ({
          id: `audio_${index}`,
          downloadUrl: media.audio.audio_src
        }))

      return {
        id: postData.pk,
        code: postData.code,
        title: postData.caption?.text,
        takenAt: dayjs.unix(postData.taken_at).format("DD/MM/YYYY HH:mm:ss"),
        totalMedia: originalMediaList.length,
        videoCount: videos.length,
        imageCount: images.length,
        audioCount: audios.length,
        likeCount: postData.like_and_view_counts_disabled
          ? null
          : postData.like_count,
        commentCount: postData.text_post_app_info.direct_reply_count,
        videos,
        images,
        audios
      }
    })
    const hasNextPage = pageInfor?.has_next_page
    const endCursor = pageInfor?.end_cursor
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

const threadsService = {
  getThreadsAccountData,
  getUserIdByUsername,
  getProfileBulkPosts,
  geThreadstPostDataByUrl
}

export default threadsService
