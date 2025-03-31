import { EDownloadSeperateType } from "src/constants/enum"

const FACEBOOK_POST_URL_PATTERN =
  /https:\/\/www\.facebook\.com\/[^\/]+\/posts\/([\w-]+)/

const FACEBOOK_STORY_URL_PATTERN =
  /https:\/\/www\.facebook\.com\/stories\/([\w-]+)/

const FACEBOOK_VIDEO_URL_PATTERN =
  /https:\/\/www\.facebook\.com\/[^\/]+\/videos\/([\w-]+)/

const FACEBOOK_REEL_URL_PATTERN =
  /https:\/\/www\.facebook\.com\/(?:reel\/|watch\/\?v=)([\w-]+)/

const INSTAGRAM_POST_URL_PATTERN = /https:\/\/www\.instagram\.com\/p\/([\w-]+)/

const INSTAGRAM_REEL_URL_PATTERN =
  /https:\/\/www\.instagram\.com\/reel\/([\w-]+)/

const INSTAGRAM_HIGHLIGHT_URL_PATTERN =
  /https:\/\/www\.instagram\.com\/stories\/highlights\/([\w-]+)/

const THREADS_POST_URL_PATTERN =
  /https:\/\/www\.threads\.net\/@[^\/]+\/post\/([\w-]+)/

const X_POST_URL_PATTERN = /https:\/\/x\.com\/[^\/]+\/status\/([\w-]+)/

export const URL_PATTERN = {
  [EDownloadSeperateType.FACEBOOK_POST]: FACEBOOK_POST_URL_PATTERN,
  [EDownloadSeperateType.FACEBOOK_STORY]: FACEBOOK_STORY_URL_PATTERN,
  [EDownloadSeperateType.FACEBOOK_VIDEO]: FACEBOOK_VIDEO_URL_PATTERN,
  [EDownloadSeperateType.FACEBOOK_REEL]: FACEBOOK_REEL_URL_PATTERN,

  [EDownloadSeperateType.INSTAGRAM_POST]: INSTAGRAM_POST_URL_PATTERN,
  [EDownloadSeperateType.INSTAGRAM_REEL]: INSTAGRAM_REEL_URL_PATTERN,
  [EDownloadSeperateType.INSTAGRAM_HIGHLIGHT]: INSTAGRAM_HIGHLIGHT_URL_PATTERN,

  [EDownloadSeperateType.THREADS_POST]: THREADS_POST_URL_PATTERN,

  [EDownloadSeperateType.X_POST]: X_POST_URL_PATTERN
}
