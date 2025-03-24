export interface IDownloadAllOptions {
  waitUntilCompleted: boolean
  delayTimeInSecond?: number
}

export interface IMedia {
  id: string
  downloadUrl: string
}
