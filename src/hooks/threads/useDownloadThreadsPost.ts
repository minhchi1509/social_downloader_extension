import dayjs from "dayjs"

import { threadsAxiosInstance } from "src/configs/axios.config"
import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions, IMedia } from "src/interfaces/common.interface"
import { IThreadsPost } from "src/interfaces/threads.interface"
import threadsService from "src/services/threads.service"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  downloadStatisticCsvFile,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadThreadsPost = () => {
  const { updateProcess } = useDownloadProcesses()

  const downloadCsvFile = async (posts: IThreadsPost[], username: string) => {
    const csvPostsData = posts.map((post, index) => ({
      ordinal_number: index + 1,
      post_url: `https://www.threads.net/@${username}/post/${post.code}`,
      caption: post.title,
      taken_at: post.takenAt,
      total_media: post.totalMedia,
      video_count: post.videoCount,
      image_count: post.imageCount,
      audio_count: post.audioCount,
      like_count: post.likeCount,
      comment_count: post.commentCount
    }))
    const filename = `threads_downloader/${username}/posts/posts_statistic.csv`
    await downloadStatisticCsvFile(csvPostsData, filename)
  }

  const startDownloadAllPosts = async (
    username: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let hasMore = true
      let endCursor = ""
      const allPosts: IThreadsPost[] = []
      const userID = await threadsService.getUserIdByUsername(username)

      const baseQuery = {
        before: null,
        first: 10,
        last: null,
        userID,
        __relay_internal__pv__BarcelonaIsLoggedInrelayprovider: true,
        __relay_internal__pv__BarcelonaIsInlineReelsEnabledrelayprovider: true,
        __relay_internal__pv__BarcelonaOptionalCookiesEnabledrelayprovider:
          true,
        __relay_internal__pv__BarcelonaShowReshareCountrelayprovider: true,
        __relay_internal__pv__BarcelonaQuotedPostUFIEnabledrelayprovider: false,
        __relay_internal__pv__BarcelonaIsCrawlerrelayprovider: false,
        __relay_internal__pv__BarcelonaShouldShowFediverseM075Featuresrelayprovider:
          true
      }
      let retryCount = 0

      do {
        if (!isDownloadProcessExist(ESocialProvider.THREADS, processId)) {
          return
        }
        const { data } = await threadsAxiosInstance.get("/", {
          params: {
            doc_id: "27451289061182391",
            variables: JSON.stringify({
              ...baseQuery,
              after: endCursor
            })
          }
        })

        const posts: any[] = data?.data?.mediaData?.edges
        const pageInfor = data?.data?.mediaData?.page_info

        if (!posts || !pageInfor) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu bài viết từ Threads")
          }
          continue
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
              takenAt: dayjs
                .unix(postData.taken_at)
                .format("DD/MM/YYYY HH:mm:ss"),
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
            .filter(
              (media) => !!!media.video_versions && !!media.image_versions2
            )
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
            takenAt: dayjs
              .unix(postData.taken_at)
              .format("DD/MM/YYYY HH:mm:ss"),
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

        const postsHaveMedia = formattedPosts.filter(
          (post) => post.totalMedia > 0
        )

        await downloadByBatch(
          postsHaveMedia,
          async (post: IThreadsPost, postIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.THREADS, processId)) {
              return
            }
            const downloadPhotos = post.images.map((image) =>
              chromeUtils.downloadFile(
                {
                  url: image.downloadUrl,
                  filename: `threads_downloader/${username}/posts/post_${allPosts.length + postIndex}/${image.id}.jpg`
                },
                waitUntilCompleted
              )
            )
            const downloadVideos = post.videos.map((video) =>
              chromeUtils.downloadFile(
                {
                  url: video.downloadUrl,
                  filename: `threads_downloader/${username}/posts/post_${allPosts.length + postIndex}/${video.id}.mp4`
                },
                waitUntilCompleted
              )
            )
            const downloadAudios = post.audios.map((audio) =>
              chromeUtils.downloadFile(
                {
                  url: audio.downloadUrl,
                  filename: `threads_downloader/${username}/posts/post_${allPosts.length + postIndex}/${audio.id}.mp3`
                },
                waitUntilCompleted
              )
            )
            await Promise.all([
              ...downloadPhotos,
              ...downloadVideos,
              ...downloadAudios
            ])
            updateProcess(ESocialProvider.THREADS, processId, {
              totalDownloadedItems: allPosts.length + postIndex
            })
          }
        )
        allPosts.push(...formattedPosts)
        hasMore = pageInfor.has_next_page
        endCursor = pageInfor.end_cursor
        retryCount = 0
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      } while (hasMore)
      if (allPosts.length) {
        await downloadCsvFile(allPosts, username)
      }
      updateProcess(ESocialProvider.THREADS, processId, { status: "COMPLETED" })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(ESocialProvider.THREADS, processId, { status: "FAILED" })
    }
  }

  return { startDownloadAllPosts }
}

export default useDownloadThreadsPost
