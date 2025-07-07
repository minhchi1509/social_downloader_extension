import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  const startDownloadAlbumById = async (
    albumId: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let currentCursor = ""
      let retryCount = 0
      let downloadedItems = 0

      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }
        const responseData = await facebookService.getBulkAlbumMediaById(
          albumId,
          currentCursor
        )
        if (!responseData) {
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error(t("error_messages.facebook_album_fetch_error"))
          }
          retryCount += 1
          continue
        }
        const { data: albumMedia, pagination } = responseData
        await downloadByBatch(
          albumMedia,
          async (media: IFacebookPost, mediaIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
              return
            }
            await chromeUtils.downloadFile(
              {
                url: media.downloadUrl,
                filename: `album_${albumId}/${downloadedItems + mediaIndex}_${media.id}.${media.isVideo ? "mp4" : "jpg"}`
              },
              waitUntilCompleted
            )
          },
          8
        )
        downloadedItems += albumMedia.length
        currentCursor = pagination.nextCursor
        retryCount = 0
        updateProcess(ESocialProvider.FACEBOOK, processId, {
          totalDownloadedItems: downloadedItems
        })
        if (!pagination.hasNextPage) {
          break
        }
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      }
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
