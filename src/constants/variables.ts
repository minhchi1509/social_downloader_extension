import { EDownloadSeperateType } from "src/constants/enum"

export const IG_DOWNLOAD_ALL_TYPE = [
  { label: "Ảnh/video trên bài viết", value: "POST" },
  { label: "Reels", value: "REEL" },
  { label: "Story nổi bật", value: "HIGHLIGHT" },
  { label: "Story", value: "STORY" }
]

export const THREADS_DOWNLOAD_ALL_TYPE = [
  { label: "Ảnh/video trên bài viết", value: "POST" }
]

export const X_DOWNLOAD_ALL_TYPE = [
  { label: "Ảnh/video trên trang cá nhân", value: "MEDIA" }
]

export const FB_DOWNLOAD_ALL_TYPE = {
  PROFILE: [
    { label: "Ảnh", value: "PHOTO" },
    { label: "Video", value: "VIDEO" },
    { label: "Reels", value: "REEL" },
    { label: "Story nổi bật", value: "HIGHLIGHT" },
    { label: "Album ảnh (theo ID)", value: "ALBUM_BY_ID" }
  ],
  GROUP: [
    { label: "Ảnh", value: "PHOTO" },
    { label: "Video", value: "VIDEO" },
    { label: "Album ảnh (theo ID)", value: "ALBUM_BY_ID" }
  ]
}

export const DOWNLOAD_SEPARATELY_TYPE = [
  { label: "Ảnh/video trên bài viết", value: "POST" },
  { label: "Reels", value: "REEL" },
  { label: "Story nổi bật", value: "HIGHLIGHT" },
  { label: "Story", value: "STORY" },
  { label: "Ảnh đại diện (HD)", value: "AVATAR" }
]

export const DOWNLOAD_SEPERATE_TYPE_OPTIONS = [
  {
    group: "Facebook",
    options: [
      {
        label: "Ảnh/video trên bài viết (Facebook)",
        value: EDownloadSeperateType.FACEBOOK_POST
      },
      {
        label: "Reels/Watch (Facebook)",
        value: EDownloadSeperateType.FACEBOOK_REEL
      },
      {
        label: "Video (Facebook)",
        value: EDownloadSeperateType.FACEBOOK_VIDEO
      },
      {
        label: "Story/Highlight (Facebook)",
        value: EDownloadSeperateType.FACEBOOK_STORY
      },
      {
        label: "Video ở bình luận (Facebook)",
        value: EDownloadSeperateType.FACEBOOK_COMMENT_VIDEO
      }
    ]
  },
  {
    group: "Instagram",
    options: [
      {
        label: "Ảnh/video trên bài viết (Instagram)",
        value: EDownloadSeperateType.INSTAGRAM_POST
      },
      {
        label: "Reels (Instagram)",
        value: EDownloadSeperateType.INSTAGRAM_REEL
      },
      {
        label: "Story nổi bật (Instagram)",
        value: EDownloadSeperateType.INSTAGRAM_HIGHLIGHT
      }
    ]
  },
  {
    group: "Threads",
    options: [
      {
        label: "Ảnh/video trên bài viết (Threads)",
        value: EDownloadSeperateType.THREADS_POST
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

export const PROCESS_TEXT = {
  RUNNING: "Đang tải",
  COMPLETED: "Hoàn thành",
  FAILED: "Thất bại"
}

export const DOWNLOAD_STORIES_IN_HIGHLIGHT_BATCH_SIZE = 15
export const REQUEST_ACCEPT_HEADER =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
export const MAX_RETRY_REQUEST = 15
