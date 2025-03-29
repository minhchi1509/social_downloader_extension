import { EDownloadSeperateType } from "src/constants/enum"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
import {
  TFacebookDownloadAllType,
  TIgDownloadAllType,
  TThreadsDownloadAllType,
  TXDownloadAllType
} from "src/interfaces/download-process.interface"

export interface IDownloadAllForm<T> extends IDownloadAllOptions {
  username: string
  type: T
}

export interface IIgDownloadAllForm
  extends IDownloadAllForm<TIgDownloadAllType> {}

export interface IThreadsDownloadAllForm
  extends IDownloadAllForm<TThreadsDownloadAllType> {}

export interface IFacebookDownloadAllForm
  extends IDownloadAllForm<TFacebookDownloadAllType> {
  target: "PROFILE" | "GROUP"
}

export interface IXDownloadAllForm
  extends IDownloadAllForm<TXDownloadAllType> {}

export interface IDownloadSeperateForm {
  url: string
  type: EDownloadSeperateType
}
