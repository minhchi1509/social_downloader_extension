import { EWeiboMediaType } from "src/constants/enum"
import { IMedia } from "src/interfaces/common.interface"

export interface IWeiboMedia extends IMedia {
  type: EWeiboMediaType
}

export interface IWeiboPost {
  id: string
  mediaList: IWeiboMedia[]
}
