import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()

  const startDownloadAllPhotos = async (
    target: "PROFILE" | "GROUP",
    targetId: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let currentCursor = ""
      let retryCount = 0
      let downloadedItems = 0
      const downloadFunc =
        target === "PROFILE"
          ? facebookService.getProfileBulkPhotos
          : facebookService.getGroupBulkPhotos
      const downloadPath = `facebook_downloader/${target.toLowerCase()}_${targetId}/photos`
      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
          return
        }
        const responseData = await downloadFunc(targetId, currentCursor)
        if (!responseData) {
          if (retryCount >= MAX_RETRY_REQUEST) {
            throw new Error(t("error_messages.facebook_photo_fetch_error"))
          }
          retryCount += 1
          continue
        }
        const { data: photos, pagination } = responseData
        await downloadByBatch(
          photos,
          async (photo: IMedia, photoIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.FACEBOOK, processId)) {
              return
            }
            await chromeUtils.downloadFile(
              {
                url: photo.downloadUrl,
                filename: `${downloadPath}/${downloadedItems + photoIndex}.jpg`
              },
              waitUntilCompleted
            )
          },
          8
        )
        downloadedItems += photos.length
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

  return { startDownloadAllPhotos }
}

export default useDownloadFbPhoto
