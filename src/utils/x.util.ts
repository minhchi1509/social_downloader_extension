import i18next from "i18next"

import { EDownloadSeperateType, ESocialProvider } from "src/constants/enum"
import { URL_PATTERN } from "src/constants/regex"
import xService from "src/services/x.service"
import { chromeUtils } from "src/utils/chrome.util"
import { extractIdFromUrl, isVerifyAccount } from "src/utils/common.util"

export const downloadXPostMedia = async (postUrl: string) => {
  if (!isVerifyAccount(ESocialProvider.X)) {
    throw new Error(i18next.t("error_messages.authenticate_x_first"))
  }
  const postId = extractIdFromUrl(
    postUrl,
    URL_PATTERN[EDownloadSeperateType.X_POST]
  )
  const postMedia = await xService.getPostMediaById(postId)
  await Promise.all(
    postMedia.map(async (media, mediaIndex) => {
      await chromeUtils.downloadFile({
        url: media.downloadUrl,
        filename: `x_post_${postId}/${mediaIndex + 1}.${media.isVideo ? "mp4" : "jpg"}`
      })
    })
  )
}
