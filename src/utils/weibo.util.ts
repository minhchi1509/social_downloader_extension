import axios from "axios"
import i18next from "i18next"

import {
  EDownloadSeperateType,
  ESocialProvider,
  EWeiboMediaType
} from "src/constants/enum"
import { URL_PATTERN } from "src/constants/regex"
import { IWeiboMedia, IWeiboPost } from "src/interfaces/weibo.interface"
import weiboService from "src/services/weibo.service"
import { chromeUtils } from "src/utils/chrome.util"
import {
  downloadByBatch,
  extractIdFromUrl,
  isVerifyAccount
} from "src/utils/common.util"

export const downloadWeiboMedia = async (
  mediaUrl: string,
  filename: string
) => {
  const { data } = await axios.get(mediaUrl, {
    responseType: "blob",
    headers: {
      Referer: "https://weibo.com"
    }
  })
  const blobUrl = URL.createObjectURL(data)
  await chromeUtils.downloadFile({
    url: blobUrl,
    filename,
    conflictAction: "overwrite"
  })
  URL.revokeObjectURL(blobUrl)
}

export const formatWeiboPostData = (postData: any): IWeiboPost => {
  const postId = postData.idstr
  const picIds = postData.pic_ids || []
  const picsInfor = postData.pic_infos || {}
  const videoUrl =
    postData.page_info?.media_info?.playback_list?.[0]?.play_info?.url
  const mixMediaInfor = postData.mix_media_info?.items || []

  if (picIds.length === 0) {
    if (!videoUrl) {
      return {
        id: postId,
        mediaList: []
      }
    }
    return {
      id: postId,
      mediaList: [
        {
          id: postId,
          type: EWeiboMediaType.VIDEO,
          downloadUrl: videoUrl
        }
      ]
    }
  }
  if (mixMediaInfor.length > 0) {
    return {
      id: postId,
      mediaList: mixMediaInfor.map((media: any) => {
        const mediaId = media.id
        let mediaType = ""
        let downloadUrl = ""

        if (media.type === "pic") {
          const mediaData = media.data
          mediaType = mediaData.type
          if (mediaType !== EWeiboMediaType.PHOTO) {
            downloadUrl = mediaData.video_hd || mediaData.video
          } else {
            downloadUrl =
              mediaData?.largest?.url ||
              mediaData?.original?.url ||
              mediaData?.large?.url
          }
        } else if (media.type === "video") {
          const mediaInfor = media.data.media_info
          downloadUrl = mediaInfor.mp4_hd_url || mediaInfor.mp4_sd_url
        } else {
          throw new Error("New media type detected: " + media.type)
        }

        return {
          id: mediaId,
          type: mediaType,
          downloadUrl
        }
      })
    }
  }
  return {
    id: postId,
    mediaList: picIds.map((picId: string) => {
      const picData = picsInfor[picId]
      const mediaType = picData.type
      let downloadUrl = ""

      switch (mediaType) {
        case EWeiboMediaType.PHOTO:
          downloadUrl =
            picData.largest.url || picData.original.url || picData.large.url
          break
        case EWeiboMediaType.GIF:
          downloadUrl = picData.video
          break
        case EWeiboMediaType.LIVE_PHOTO:
          downloadUrl = picData.video
          break
        default:
          throw new Error("New media type detected in pic_infos: " + mediaType)
      }

      return {
        id: picId,
        type: mediaType,
        downloadUrl
      }
    })
  }
}

export const downloadWeiboPostMedia = async (postUrl: string) => {
  if (!isVerifyAccount(ESocialProvider.WEIBO)) {
    throw new Error(i18next.t("error_messages.authenticate_weibo_first"))
  }
  const postId = extractIdFromUrl(
    postUrl,
    URL_PATTERN[EDownloadSeperateType.WEIBO_POST]
  )
  const postData = await weiboService.getWeiboPostDataById(postId)
  await downloadByBatch(
    postData.mediaList,
    async (media: IWeiboMedia, mediaIndex: number) => {
      const downloadPath = `weibo_post_${postId}/${mediaIndex}.${media.type === EWeiboMediaType.PHOTO ? "jpg" : "mp4"}`
      await downloadWeiboMedia(media.downloadUrl, downloadPath)
    },
    5
  )
}
