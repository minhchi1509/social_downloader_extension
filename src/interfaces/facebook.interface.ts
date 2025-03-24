import { IMedia } from "src/interfaces/common.interface"

export interface IFacebookStory extends IMedia {
  isVideo: boolean
  thumbnailUrl?: string
}

export interface IFacebookPost extends IMedia {
  isVideo: boolean
}
