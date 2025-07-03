import { ESocialProvider } from "src/constants/enum"

export type TProcessStatus = "RUNNING" | "COMPLETED" | "FAILED"

export type TIgDownloadAllType = "POST" | "REEL" | "HIGHLIGHT" | "STORY"
export type TThreadsDownloadAllType = "POST"
export type TWeiboDownloadAllType = "MEDIA"
export type TFacebookDownloadAllType =
  | "PHOTO"
  | "VIDEO"
  | "REEL"
  | "HIGHLIGHT"
  | "ALBUM_BY_ID"
export type TXDownloadAllType = "MEDIA"

export interface IDownloadProcessDetail<T> {
  id: string
  username: string
  downloadType: T
  totalDownloadedItems: number
  status: TProcessStatus
}

export interface IDownloadProcess {
  [ESocialProvider.FACEBOOK]: IDownloadProcessDetail<TFacebookDownloadAllType>
  [ESocialProvider.INSTAGRAM]: IDownloadProcessDetail<TIgDownloadAllType>
  [ESocialProvider.THREADS]: IDownloadProcessDetail<TThreadsDownloadAllType>
  [ESocialProvider.X]: IDownloadProcessDetail<TXDownloadAllType>
  [ESocialProvider.WEIBO]: IDownloadProcessDetail<TWeiboDownloadAllType>
}
