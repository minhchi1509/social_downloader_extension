import { useTranslation } from "react-i18next"

import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
import { IIGPost } from "src/interfaces/instagram.interface"
import instagramService from "src/services/instagram.service"
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
  const { t } = useTranslation()

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
    {
      waitUntilCompleted,
      delayTimeInSecond,
      isMergeIntoOneFolder
    }: IDownloadAllOptions
  ) => {
    try {
      const allPosts: IIGPost[] = []
      let currentCursor = ""
      let retryCount = 0

      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
          return
        }
        const responseData = await instagramService.getProfileBulkPosts(
          username,
          currentCursor
        )
        if (!responseData) {
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error(t("error_messages.instagram_post_fetch_error"))
          }
          retryCount += 1
          continue
        }
        const { data: posts, pagination } = responseData
        await downloadByBatch(
          posts,
          async (post: IIGPost, postIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.INSTAGRAM, processId)) {
              return
            }
            const mediaList = [...post.videos, ...post.images]
            await Promise.all(
              mediaList.map(async (media, mediaIndex) => {
                const downloadPath = `instagram_downloader/${username}/posts/post_${allPosts.length + postIndex}_${post.code}${isMergeIntoOneFolder ? "_" : "/"}${mediaIndex + 1}.${media.downloadUrl.split(".").pop()}`
                await chromeUtils.downloadFile(
                  {
                    url: media.downloadUrl,
                    filename: downloadPath
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
        allPosts.push(...posts)
        currentCursor = pagination.nextCursor
        retryCount = 0
        updateProcess(ESocialProvider.FACEBOOK, processId, {
          totalDownloadedItems: allPosts.length
        })
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
