import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions, IMedia } from "src/interfaces/common.interface"
import facebookService from "src/services/facebook.service"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadFbPhoto = () => {
  const { updateProcess } = useDownloadProcesses()

  const startDownloadAllPhotos = async (
    userId: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      const baseQuery = {
        scale: 1,
        id: btoa(`app_collection:${userId}:2305272732:5`)
      }
      const profilePhotos: IMedia[] = []
      let hasNextPage = false
      let endCursor = ""
      let retryCount = 0

      do {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }
        const docID = "9464814726967704"
        const query = {
          ...baseQuery,
          count: 8,
          cursor: endCursor
        }

        const responseData = await facebookService.makeRequestToFb(docID, query)

        const originalPhotos = responseData?.data?.node?.pageItems?.edges
        const pageInfor = responseData?.data?.node?.pageItems?.page_info

        if (!originalPhotos || !pageInfor) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error("Đã xảy ra lỗi khi lấy dữ liệu ảnh từ Facebook")
          }
          continue
        }

        const formattedPhotosList: IMedia[] = originalPhotos.map(
          ({ node }: any) => ({
            id: node.node.id,
            downloadUrl: node.node.viewer_image.uri
          })
        )

        await downloadByBatch(
          formattedPhotosList,
          async (photo: IMedia, photoIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
              return
            }
            await chromeUtils.downloadFile({
              url: photo.downloadUrl,
              filename: `facebook_downloader/${userId}/photos/${profilePhotos.length + photoIndex}.jpg`
            })
          },
          8
        )

        profilePhotos.push(...formattedPhotosList)
        updateProcess(ESocialProvider.FACEBOOK, processId, {
          totalDownloadedItems: profilePhotos.length
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

  return { startDownloadAllPhotos }
}

export default useDownloadFbPhoto
