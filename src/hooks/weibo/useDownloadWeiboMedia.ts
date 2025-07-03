import { ESocialProvider, EWeiboMediaType } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
import { IWeiboMedia } from "src/interfaces/weibo.interface"
import weiboService from "src/services/weibo.service"
import useDownloadProcesses from "src/store/download-process"
import { downloadByBatch, isDownloadProcessExist } from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"
import { downloadWeiboMedia } from "src/utils/weibo.util"

const useDownloadWeiboMedia = () => {
  const { updateProcess } = useDownloadProcesses()

  const startDownloadAllMedia = async (
    username: string,
    processId: string,
    { isMergeIntoOneFolder }: IDownloadAllOptions
  ) => {
    try {
      let retryCount = 0
      let currentPage = 1
      let totalDownloadedItems = 0
      let totalDownloadedPosts = 0

      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.WEIBO, processId)) {
          return
        }
        const responseData = await weiboService.getProfileBulkMedia(
          username,
          currentPage
        )
        if (!responseData) {
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu từ Weibo")
          }
          retryCount += 1
          continue
        }
        const { data: posts, pagination } = responseData

        //Download photos
        for (let i = 0; i < posts.length; i++) {
          const post = posts[i]
          if (post.mediaList.length === 0) {
            continue
          }
          if (!isDownloadProcessExist(ESocialProvider.WEIBO, processId)) {
            return
          }
          await downloadByBatch(
            post.mediaList,
            async (media: IWeiboMedia, mediaIndex: number) => {
              if (!isDownloadProcessExist(ESocialProvider.WEIBO, processId)) {
                return
              }
              const downloadPath = `weibo_downloader/${username}/posts/post_${totalDownloadedPosts + i + 1}_${post.id}${isMergeIntoOneFolder ? "_" : "/"}${mediaIndex}.${media.type === EWeiboMediaType.PHOTO ? "jpg" : "mp4"}`
              await downloadWeiboMedia(media.downloadUrl, downloadPath)
            },
            5
          )

          totalDownloadedItems += post.mediaList.length
          updateProcess(ESocialProvider.WEIBO, processId, {
            totalDownloadedItems
          })
        }

        totalDownloadedPosts += posts.length

        currentPage += 1
        retryCount = 0

        if (!pagination.hasNextPage) {
          break
        }
      }
      updateProcess(ESocialProvider.WEIBO, processId, { status: "COMPLETED" })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(ESocialProvider.WEIBO, processId, { status: "FAILED" })
    }
  }
  return { startDownloadAllMedia }
}

export default useDownloadWeiboMedia
