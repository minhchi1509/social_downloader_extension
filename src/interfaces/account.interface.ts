import { ESocialProvider } from "src/constants/enum"

export interface IAccountData {
  id: string
  username: string
  avatar: string
  cookies: string
}

export interface IInstagramAccount extends IAccountData {
  csrfToken: string
}

export interface IThreadsAccount extends IAccountData {
  igAppId: string
}
export interface IFacebookAccount extends IAccountData {
  fbDtsg: string
}

export interface IXAccount extends IAccountData {
  csrfToken: string
  accessToken: string
}

export interface IAccounts {
  [ESocialProvider.FACEBOOK]: IFacebookAccount | null
  [ESocialProvider.INSTAGRAM]: IInstagramAccount | null
  [ESocialProvider.THREADS]: IThreadsAccount | null
  [ESocialProvider.X]: IXAccount | null
}
