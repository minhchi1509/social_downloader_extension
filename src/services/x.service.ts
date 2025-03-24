import axios from "axios"

import { xAxiosInstance } from "src/configs/axios.config"
import { ERemoteMessageType } from "src/constants/enum"
import { IXAccount } from "src/interfaces/account.interface"
import { chromeUtils } from "src/utils/chrome.util"
import { delay } from "src/utils/common.util"

const getXAccountData = async (): Promise<IXAccount> => {
  try {
    const cookies = await chromeUtils.getChromeCookies("x.com")
    const axiosInstance = axios.create({
      baseURL: "https://x.com"
    })
    const { data: rawData } = await axiosInstance.get("/")
    const idRegex = /"users":{"entities":{"(.*?)"/
    const usernameRegex = /"screen_name":"(.*?)"/
    const fullNameRegex = /"name":"(.*?)"/
    const avatarRegex = /"profile_image_url_https":"(.*?)"/
    const id = rawData.match(idRegex)?.[1]
    const fullName = rawData.match(fullNameRegex)?.[1]
    const avatar = rawData.match(avatarRegex)?.[1]
    const username = rawData.match(usernameRegex)?.[1]
    if (!fullName || !avatar || !id || !username) {
      throw new Error()
    }

    const xTab = await chromeUtils.openNewTab({ url: "https://x.com/home" })
    await delay(1000)
    if (xTab.id) {
      await chromeUtils.closeTab(xTab.id)
    }

    const xAccountData: IXAccount = {
      id,
      username,
      avatar,
      cookies,
      accessToken: "",
      csrfToken: ""
    }

    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: ERemoteMessageType.RETRIEVE_X_ACCOUNT_CREDENTIALS },
        (response) => {
          if (response) {
            xAccountData.accessToken = response.authorization
            xAccountData.csrfToken = response.xCsrfToken
            resolve("")
          }
          reject("")
        }
      )
    })

    return xAccountData
  } catch (error) {
    throw new Error(
      "Không thể lấy dữ liệu tài khoản X. Đảm bảo rằng bạn đã đăng nhập vào X trên trình duyệt"
    )
  }
}

const getXUserIdFromUsername = async (username: string): Promise<string> => {
  try {
    const { data: responseData } = await xAxiosInstance.get(
      "/vqu78dKcEkW-UAYLw5rriA/useFetchProfileSections_canViewExpandedProfileQuery",
      {
        params: {
          variables: JSON.stringify({ screenName: username })
        }
      }
    )
    const base64UserId = responseData.data.user_result_by_screen_name.result.id
    const userId = atob(base64UserId).split(":")[1]
    return userId
  } catch (error) {
    throw new Error(`Không thể lấy ID từ user ${username}`)
  }
}

const xService = {
  getXAccountData,
  getXUserIdFromUsername
}

export default xService
