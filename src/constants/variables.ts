import { TFunction } from "i18next"

import { EDownloadSeperateType } from "src/constants/enum"

export const getIgDownloadAllTypeOptions = (t: TFunction) => [
  { label: t("download_types.instagram.post"), value: "POST" },
  { label: t("download_types.instagram.reel"), value: "REEL" },
  { label: t("download_types.instagram.highlight"), value: "HIGHLIGHT" },
  { label: t("download_types.instagram.story"), value: "STORY" }
]

export const getThreadsDownloadAllTypeOptions = (t: TFunction) => [
  { label: t("download_types.threads.post"), value: "POST" }
]

export const getXDownloadAllTypeOptions = (t: TFunction) => [
  { label: t("download_types.x.media"), value: "MEDIA" }
]

export const getFbDownloadAllTypeOptions = (t: TFunction) => ({
  PROFILE: [
    { label: t("download_types.facebook.photo"), value: "PHOTO" },
    { label: t("download_types.facebook.video"), value: "VIDEO" },
    { label: t("download_types.facebook.reel"), value: "REEL" },
    { label: t("download_types.facebook.highlight"), value: "HIGHLIGHT" },
    { label: t("download_types.facebook.album_by_id"), value: "ALBUM_BY_ID" }
  ],
  GROUP: [
    { label: t("download_types.facebook.photo"), value: "PHOTO" },
    { label: t("download_types.facebook.video"), value: "VIDEO" },
    { label: t("download_types.facebook.album_by_id"), value: "ALBUM_BY_ID" }
  ]
})

export const getDownloadSeperateTypeOptions = (t: TFunction) => [
  {
    group: "Facebook",
    options: [
      {
        label: t("download_types.facebook.post"),
        value: EDownloadSeperateType.FACEBOOK_POST
      },
      {
        label: t("download_types.facebook.reel"),
        value: EDownloadSeperateType.FACEBOOK_REEL
      },
      {
        label: t("download_types.facebook.video"),
        value: EDownloadSeperateType.FACEBOOK_VIDEO
      },
      {
        label: t("download_types.facebook.story"),
        value: EDownloadSeperateType.FACEBOOK_STORY
      },
      {
        label: t("download_types.facebook.comment_video"),
        value: EDownloadSeperateType.FACEBOOK_COMMENT_VIDEO
      }
    ]
  },
  {
    group: "Instagram",
    options: [
      {
        label: t("download_types.instagram.post"),
        value: EDownloadSeperateType.INSTAGRAM_POST
      },
      {
        label: t("download_types.instagram.reel"),
        value: EDownloadSeperateType.INSTAGRAM_REEL
      },
      {
        label: t("download_types.instagram.highlight"),
        value: EDownloadSeperateType.INSTAGRAM_HIGHLIGHT
      }
    ]
  },
  {
    group: "Threads",
    options: [
      {
        label: t("download_types.threads.post"),
        value: EDownloadSeperateType.THREADS_POST
      }
    ]
  },
  {
    group: "X",
    options: [
      {
        label: t("download_types.x.post"),
        value: EDownloadSeperateType.X_POST
      }
    ]
  }
]

export const DOWNLOAD_TYPE_TAG_COLOR = {
  POST: "blue",
  REEL: "green",
  HIGHLIGHT: "gold",
  STORY: "purple",
  VIDEO: "red",
  PHOTO: "cyan",
  MEDIA: "magenta",
  ALBUM_BY_ID: "lime"
}

export const PROCESS_STATUS_TAG_COLOR = {
  RUNNING: "blue",
  COMPLETED: "green",
  FAILED: "red"
}

export const DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE = 15
export const REQUEST_ACCEPT_HEADER =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
export const MAX_RETRY_REQUEST = 15
