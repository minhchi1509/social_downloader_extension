import dayjs from "dayjs"

import { igAxiosInstance } from "src/configs/axios.config"
import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions, IMedia } from "src/interfaces/common.interface"
import { IIGPost } from "src/interfaces/instagram.interface"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  downloadStatisticCsvFile,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadIgPost = () => {
  const { updateProcess } = useDownloadProcesses()

  const downloadCsvFile = async (posts: IIGPost[], username: string) => {
    const csvPostsData = posts.map((post, index) => ({
      ordinal_number: index + 1,
      post_url: `https://instagram.com/p/${post.code}`,
      caption: post.title,
      taken_at: post.takenAt,
      total_media: post.totalMedia,
      video_count: post.videoCount,
      image_count: post.imageCount,
      like_count: post.likeCount,
      comment_count: post.commentCount
    }))
    const filename = `instagram_downloader/${username}/posts/posts_statistic.csv`
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
      const allPosts: IIGPost[] = []
      const baseQuery = {
        data: { count: 12 },
        username,
        __relay_internal__pv__PolarisIsLoggedInrelayprovider: true,
        __relay_internal__pv__PolarisFeedShareMenurelayprovider: true
      }
      let retryCount = 0

      do {
        if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
          return
        }
        const { data } = await igAxiosInstance.get("/", {
          params: {
            doc_id: "8656566431124939",
            variables: JSON.stringify({
              ...baseQuery,
              after: endCursor
            })
          }
        })

        const posts: any[] =
          data?.data?.["xdt_api__v1__feed__user_timeline_graphql_connection"]
            ?.edges
        const pageInfor =
          data?.data?.["xdt_api__v1__feed__user_timeline_graphql_connection"]
            ?.page_info

        if (!posts || !pageInfor) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error(
              "Đã xảy ra lỗi khi lấy dữ liệu bài viết từ Instagram"
            )
          }
          continue
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
            takenAt: dayjs
              .unix(postData.taken_at)
              .format("DD/MM/YYYY HH:mm:ss"),
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

        await downloadByBatch(
          formattedPosts,
          async (post: IIGPost, postIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
              return
            }
            const mediaList = [...post.videos, ...post.images]
            await Promise.all(
              mediaList.map(async (media) => {
                await chromeUtils.downloadFile(
                  {
                    url: media.downloadUrl,
                    filename: `instagram_downloader/${username}/posts/post_${
                      allPosts.length + postIndex
                    }/${media.id}.${media.downloadUrl.split(".").pop()}`
                  },
                  waitUntilCompleted
                )
              })
            )
            updateProcess(ESocialProvider.INSTAGRAM, processId, {
              totalDownloadedItems: allPosts.length + postIndex
            })
          },
          1,
          (batchIndex: number) => {
            updateProcess(ESocialProvider.INSTAGRAM, processId, {
              totalDownloadedItems: allPosts.length + batchIndex
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
      updateProcess(ESocialProvider.INSTAGRAM, processId, {
        status: "COMPLETED"
      })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(ESocialProvider.INSTAGRAM, processId, { status: "FAILED" })
    }
  }

  return { startDownloadAllPosts }
}

export default useDownloadIgPost
