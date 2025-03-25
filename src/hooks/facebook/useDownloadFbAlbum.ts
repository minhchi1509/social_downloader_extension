import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
import { IFacebookPost } from "src/interfaces/facebook.interface"
import facebookService from "src/services/facebook.service"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadFbAlbum = () => {
  const { updateProcess } = useDownloadProcesses()

  const startDownloadAlbumById = async (
    albumId: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      const ownerIdOfAlbum = await facebookService.getFbIdFromUrl(
        `https://www.facebook.com/media/set/?set=a.${albumId}`
      )
      let totalDownloadedMedia = 0
      let hasNextPage = false
      let endCursor = ""
      let retryCount = 0

      do {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }
        const docID = "9026124860850231"
        const query = {
          count: 14,
          cursor: endCursor,
          scale: 1,
          id: albumId
        }

        const responseData = await facebookService.makeRequestToFb(docID, query)

        const originalAlbumPhotosData =
          responseData?.data?.node?.grid_media?.edges
        const pageInfor = responseData?.data?.node?.grid_media?.page_info

        if (!originalAlbumPhotosData || !pageInfor) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu album từ Facebook")
          }
          continue
        }

        let albumMediaList: IFacebookPost[] = originalAlbumPhotosData.map(
          ({ node }: any) => {
            return {
              id: node.id,
              isVideo: node.__isMedia === "Video",
              downloadUrl: ""
            }
          }
        )

        albumMediaList = await Promise.all(
          albumMediaList.map(async (media) => {
            const downloadUrl = await (media.isVideo
              ? facebookService.getVideoDownloadUrl(
                  `https://www.facebook.com/${ownerIdOfAlbum}/videos/a.${albumId}/${media.id}`
                )
              : facebookService.getPhotoDownloadUrl(media.id, ownerIdOfAlbum))
            return { ...media, downloadUrl }
          })
        )

        await downloadByBatch(
          albumMediaList,
          async (media: IFacebookPost, mediaIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
              return
            }
            await chromeUtils.downloadFile(
              {
                url: media.downloadUrl,
                filename: `album_${albumId}/${totalDownloadedMedia + mediaIndex}.${media.isVideo ? "mp4" : "jpg"}`
              },
              waitUntilCompleted
            )
          },
          14
        )

        totalDownloadedMedia += albumMediaList.length
        updateProcess(ESocialProvider.FACEBOOK, processId, {
          totalDownloadedItems: totalDownloadedMedia
        })
        hasNextPage = pageInfor.has_next_page
        endCursor = pageInfor.end_cursor
        retryCount = 0
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      } while (hasNextPage)
      updateProcess(ESocialProvider.FACEBOOK, processId, {
        status: "COMPLETED"
      })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(ESocialProvider.FACEBOOK, processId, { status: "FAILED" })
    }
  }
  return { startDownloadAlbumById }
}

export default useDownloadFbAlbum
