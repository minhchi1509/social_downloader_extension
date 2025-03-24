import { IMedia } from "src/interfaces/common.interface"
import { IIGPost } from "src/interfaces/instagram.interface"

export interface IThreadsPost extends IIGPost {
  audioCount: number
  audios: IMedia[]
}
