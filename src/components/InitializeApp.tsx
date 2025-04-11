import { Spin } from "antd"
import axios from "axios"
import { FC, PropsWithChildren, useEffect, useState } from "react"

import { ESocialProvider, EStorageKey } from "src/constants/enum"
import { IAccounts } from "src/interfaces/account.interface"
import { TTheme } from "src/interfaces/common.interface"
import useAuth from "src/store/auth"
import useExtensionState from "src/store/extension-state"
import { chromeUtils } from "src/utils/chrome.util"

const InitializeApp: FC<PropsWithChildren> = ({ children }) => {
  const { updateAccountData } = useAuth()
  const { setExtensionState } = useExtensionState()
  const [isInitialized, setIsInitialized] = useState(true)

  const getBlobFileUrl = async (url: string) => {
    const { data } = await axios.get(url, {
      responseType: "blob"
    })
    return URL.createObjectURL(data)
  }

  const initializeApp = async () => {
    try {
      const accountsInStorage = await chromeUtils.getStorage<IAccounts>(
        EStorageKey.ACCOUNTS
      )
      const { data } = await axios.get(
        "https://raw.githubusercontent.com/minhchi1509/social_downloader_extension/main/package.json"
      )
      const extensionLatestVersion = data.version
      const { version: currentVersion } = chrome.runtime.getManifest()
      const isUpdateAvailable = currentVersion !== extensionLatestVersion
      const theme = await chromeUtils.getStorage<TTheme>(EStorageKey.THEME)

      if (accountsInStorage) {
        const updatedAccounts = { ...accountsInStorage }
        const providers = Object.keys(accountsInStorage) as ESocialProvider[]

        for (const provider of providers) {
          if (updatedAccounts[provider]) {
            updatedAccounts[provider].avatar = await getBlobFileUrl(
              updatedAccounts[provider].avatar
            )
          }
        }
        updateAccountData(updatedAccounts)
        setExtensionState({
          isUpdateAvailable,
          currentVersion: extensionLatestVersion,
          theme: theme || "light"
        })
        document.documentElement.setAttribute("class", theme || "light")
      }
    } catch (error) {
      console.log("Đã có lỗi xảy ra khi khởi tạo extension", error)
    } finally {
      setIsInitialized(false)
    }
  }

  useEffect(() => {
    initializeApp()
  }, [])

  return isInitialized ? (
    <div className="h-screen flex items-center justify-center">
      <Spin />
    </div>
  ) : (
    children
  )
}

export default InitializeApp
