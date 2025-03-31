import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
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
    {
      waitUntilCompleted,
      delayTimeInSecond,
      isMergeIntoOneFolder
    }: IDownloadAllOptions
  ) => {
    try {
      const allPosts: IThreadsPost[] = []
      let currentCursor = ""
      let retryCount = 0
      const userID = await threadsService.getUserIdByUsername(username)

      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.THREADS, processId)) {
          return
        }
        const responseData = await threadsService.getProfileBulkPosts(
          userID,
          currentCursor
        )
        if (!responseData) {
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu bài viết từ Threads")
          }
          retryCount += 1
          continue
        }
        const { data: posts, pagination } = responseData
        const postsHaveMedia = posts.filter((post) => post.totalMedia > 0)

        await downloadByBatch(postsHaveMedia, async (post, postIndex) => {
          if (!isDownloadProcessExist(ESocialProvider.THREADS, processId)) {
            return
          }

          const downloadPhotos = post.images.map((image) =>
            chromeUtils.downloadFile(
              {
                url: image.downloadUrl,
                filename: `threads_downloader/${username}/posts/post_${allPosts.length + postIndex}${isMergeIntoOneFolder ? "_" : "/"}${image.id}.jpg`
              },
              waitUntilCompleted
            )
          )
          const downloadVideos = post.videos.map((video) =>
            chromeUtils.downloadFile(
              {
                url: video.downloadUrl,
                filename: `threads_downloader/${username}/posts/post_${allPosts.length + postIndex}${isMergeIntoOneFolder ? "_" : "/"}${video.id}.mp4`
              },
              waitUntilCompleted
            )
          )
          const downloadAudios = post.audios.map((audio) =>
            chromeUtils.downloadFile(
              {
                url: audio.downloadUrl,
                filename: `threads_downloader/${username}/posts/post_${allPosts.length + postIndex}${isMergeIntoOneFolder ? "_" : "/"}${audio.id}.mp3`
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
        })
        allPosts.push(...posts)
        currentCursor = pagination.nextCursor
        retryCount = 0
        if (!pagination.hasNextPage) {
          break
        }
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      }
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
