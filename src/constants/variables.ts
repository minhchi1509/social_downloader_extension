import i18next from "i18next"

import { EDownloadSeperateType } from "src/constants/enum"

export const getIgDownloadAllTypeOptions = () => [
  { label: i18next.t("download_types.instagram.post"), value: "POST" },
  { label: i18next.t("download_types.instagram.reel"), value: "REEL" },
  {
    label: i18next.t("download_types.instagram.highlight"),
    value: "HIGHLIGHT"
  },
  { label: i18next.t("download_types.instagram.story"), value: "STORY" }
]

export const getThreadsDownloadAllTypeOptions = () => [
  { label: i18next.t("download_types.threads.post"), value: "POST" }
]

export const getXDownloadAllTypeOptions = () => [
  { label: i18next.t("download_types.x.media"), value: "MEDIA" }
]

export const getWeiboDownloadAllTypeOptions = () => [
  { label: i18next.t("download_types.weibo.media"), value: "MEDIA" }
]

export const getFbDownloadAllTypeOptions = () => ({
  PROFILE: [
    { label: i18next.t("download_types.facebook.photo"), value: "PHOTO" },
    { label: i18next.t("download_types.facebook.video"), value: "VIDEO" },
    { label: i18next.t("download_types.facebook.reel"), value: "REEL" },
    {
      label: i18next.t("download_types.facebook.highlight"),
      value: "HIGHLIGHT"
    },
    {
      label: i18next.t("download_types.facebook.album_by_id"),
      value: "ALBUM_BY_ID"
    }
  ],
  GROUP: [
    { label: i18next.t("download_types.facebook.photo"), value: "PHOTO" },
    { label: i18next.t("download_types.facebook.video"), value: "VIDEO" },
    {
      label: i18next.t("download_types.facebook.album_by_id"),
      value: "ALBUM_BY_ID"
    }
  ]
})

export const getDownloadSeperateTypeOptions = () => [
  {
    group: "Facebook",
    options: [
      {
        label: `${i18next.t("download_types.facebook.post")} (Facebook)`,
        value: EDownloadSeperateType.FACEBOOK_POST
      },
      {
        label: `${i18next.t("download_types.facebook.reel")} (Facebook)`,
        value: EDownloadSeperateType.FACEBOOK_REEL
      },
      {
        label: `${i18next.t("download_types.facebook.video")} (Facebook)`,
        value: EDownloadSeperateType.FACEBOOK_VIDEO
      },
      {
        label: `${i18next.t("download_types.facebook.story")} (Facebook)`,
        value: EDownloadSeperateType.FACEBOOK_STORY
      },
      {
        label: `${i18next.t("download_types.facebook.comment_video")} (Facebook)`,
        value: EDownloadSeperateType.FACEBOOK_COMMENT_VIDEO
      }
    ]
  },
  {
    group: "Instagram",
    options: [
      {
        label: `${i18next.t("download_types.instagram.post")} (Instagram)`,
        value: EDownloadSeperateType.INSTAGRAM_POST
      },
      {
        label: `${i18next.t("download_types.instagram.reel")} (Instagram)`,
        value: EDownloadSeperateType.INSTAGRAM_REEL
      },
      {
        label: `${i18next.t("download_types.instagram.highlight")} (Instagram)`,
        value: EDownloadSeperateType.INSTAGRAM_HIGHLIGHT
      }
    ]
  },
  {
    group: "Threads",
    options: [
      {
        label: `${i18next.t("download_types.threads.post")} (Threads)`,
        value: EDownloadSeperateType.THREADS_POST
      }
    ]
  },
  {
    group: "X",
    options: [
      {
        label: `${i18next.t("download_types.x.post")} (X)`,
        value: EDownloadSeperateType.X_POST
      }
    ]
  },
  {
    group: "Weibo",
    options: [
      {
        label: `${i18next.t("download_types.weibo.post")} (Weibo)`,
        value: EDownloadSeperateType.WEIBO_POST
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
