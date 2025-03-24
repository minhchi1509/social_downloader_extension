import { IMedia } from "src/interfaces/common.interface"

export interface IIGProfile {
  id: string
  username: string
  full_name: string
  avatar_url: string
  follower: number
  following: number
  is_private_account: boolean
  total_posts: number
}

export interface IIGPost {
  id: string
  code: string
  title?: string
  takenAt: string
  totalMedia: number
  videoCount: number
  imageCount: number
  likeCount: number | null
  commentCount: number
  videos: IMedia[]
  images: IMedia[]
}

export interface IIGReel {
  id: number
  code: string
  title?: string
  takenAt: string
  likeCount: number | null
  commentCount: number
  downloadUrl: string
}

export interface IIGStory {
  id: string
  downloadUrl: string
  isVideo: boolean
  takenAt: number
}

export interface IIGHighlightStory {
  id: string
  title: string
  totalStories: number
  imageStoryCount: number
  videoStoryCount: number
  stories: IIGStory[]
}
