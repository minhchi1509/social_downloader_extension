import axios from "axios"
import i18next from "i18next"

import { weiboAxiosInstance } from "src/configs/axios.config"
import { IWeiboAccount } from "src/interfaces/account.interface"
import { IGetListResponse } from "src/interfaces/common.interface"
import { IWeiboPost } from "src/interfaces/weibo.interface"
import { chromeUtils } from "src/utils/chrome.util"
import { formatWeiboPostData } from "src/utils/weibo.util"

const getWeiboAccountData = async (): Promise<IWeiboAccount> => {
  try {
    const cookies = await chromeUtils.getChromeCookies("weibo.com")
    const axiosInstance = axios.create({
      baseURL: "https://weibo.com",
      headers: {
        cookie: cookies
      }
    })
    const { data: rawData } = await axiosInstance.get("/")
    const accountDataRegex =
      /try\{window\.\$CONFIG\s*=\s*([\s\S]*?);\}catch\(e\)\{window\.\$CONFIG\s*=\s*\{\};\}/
    const match = rawData.match(accountDataRegex)
    if (!match) {
      throw new Error()
    }
    const accountDataString = match[1]
    const accountData = JSON.parse(accountDataString).user
    const userId = accountData.id
    const userName = accountData.screen_name
    const avatarUrl =
      accountData.avatar_large ||
      accountData.avatar_hd ||
      accountData.profile_image_url
    return {
      id: userId,
      username: userName,
      avatar: avatarUrl,
      cookies
    }
  } catch (error) {
    throw new Error(i18next.t("error_messages.weibo_account_error"))
  }
}

const getProfileBulkMedia = async (
  userId: string,
  page: number
): Promise<IGetListResponse<IWeiboPost>> => {
  const { data: responseData } = await weiboAxiosInstance.get("/mymblog", {
    params: {
      uid: userId,
      page,
      feature: 0
    }
  })

  const originalPostsData = responseData.data.list.filter(
    (p: any) => p.user.idstr === userId
  )
  const posts: IWeiboPost[] = originalPostsData.map((post: any) =>
    formatWeiboPostData(post)
  )

  return {
    data: posts,
    pagination: {
      hasNextPage: !!responseData.data.since_id,
      nextCursor: ""
    }
  }
}

const getWeiboPostDataById = async (postId: string): Promise<IWeiboPost> => {
  try {
    const { data: postData } = await weiboAxiosInstance.get("/show", {
      params: {
        id: postId,
        isGetLongText: true
      }
    })
    return formatWeiboPostData(postData)
  } catch (error) {
    throw new Error(i18next.t("error_messages.weibo_post_error"))
  }
}

const weiboService = {
  getWeiboAccountData,
  getProfileBulkMedia,
  getWeiboPostDataById
}

export default weiboService
