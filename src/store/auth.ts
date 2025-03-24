import axios from "axios"
import { create } from "zustand"

import { ESocialProvider, EStorageKey } from "src/constants/enum"
import { IAccounts } from "src/interfaces/account.interface"
import facebookService from "src/services/facebook.service"
import instagramService from "src/services/instagram.service"
import threadsService from "src/services/threads.service"
import xService from "src/services/x.service"
import { chromeUtils } from "src/utils/chrome.util"

interface IAuthStore {
  accounts: IAccounts
  authenticate: (socialProvider: ESocialProvider) => Promise<void>
  logout: (socialProvider: ESocialProvider) => Promise<void>
  updateAccountData: (accountData: any) => void
}

const useAuth = create<IAuthStore>((setState, getState) => ({
  accounts: {
    [ESocialProvider.FACEBOOK]: null,
    [ESocialProvider.INSTAGRAM]: null,
    [ESocialProvider.THREADS]: null,
    [ESocialProvider.X]: null
  },

  authenticate: async <T extends ESocialProvider>(socialProvider: T) => {
    const authenticateFunction = {
      [ESocialProvider.INSTAGRAM]: instagramService.getInstagramAccountData,
      [ESocialProvider.THREADS]: threadsService.getThreadsAccountData,
      [ESocialProvider.FACEBOOK]: facebookService.getFacebookAccountData,
      [ESocialProvider.X]: xService.getXAccountData
    }
    const accountData = await authenticateFunction[socialProvider]()
    const accountsInStorage = await chromeUtils.getStorage<IAccounts>(
      EStorageKey.ACCOUNTS
    )
    await chromeUtils.setStorage(EStorageKey.ACCOUNTS, {
      ...accountsInStorage,
      [socialProvider]: accountData
    })

    const { data } = await axios.get(accountData?.avatar || "", {
      responseType: "blob"
    })
    URL.revokeObjectURL(getState().accounts[socialProvider]?.avatar || "")
    const avatarUrl = URL.createObjectURL(data)
    setState((state) => ({
      accounts: {
        ...state.accounts,
        [socialProvider]: { ...accountData, avatar: avatarUrl }
      }
    }))
  },

  updateAccountData: (newAccounts: IAccounts) => {
    setState((state) => ({
      accounts: { ...state.accounts, ...newAccounts }
    }))
  },

  logout: async <T extends ESocialProvider>(socialProvider: T) => {
    const accountsInStorage = await chromeUtils.getStorage<IAccounts>(
      EStorageKey.ACCOUNTS
    )
    delete accountsInStorage?.[socialProvider]
    await chromeUtils.setStorage(EStorageKey.ACCOUNTS, accountsInStorage)
    URL.revokeObjectURL(getState().accounts[socialProvider]?.avatar || "")
    setState((state) => ({
      accounts: {
        ...state.accounts,
        [socialProvider]: null
      }
    }))
  }
}))

export default useAuth
