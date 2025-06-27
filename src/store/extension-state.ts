import { create } from "zustand"

import { EStorageKey } from "src/constants/enum"
import { TTheme } from "src/interfaces/common.interface"
import { chromeUtils } from "src/utils/chrome.util"

interface IExtensionState {
  theme: TTheme
}

interface IExtensionStateStore {
  extensionState: IExtensionState
  setExtensionState: (newState: Partial<IExtensionState>) => void
  setTheme: (theme: TTheme) => Promise<void> | void
}

const useExtensionState = create<IExtensionStateStore>((set) => ({
  extensionState: {
    theme: "light"
  },
  setExtensionState: (newState) => {
    set((state) => ({
      extensionState: { ...state.extensionState, ...newState }
    }))
  },
  setTheme: async (theme) => {
    set((state) => ({
      extensionState: { ...state.extensionState, theme }
    }))
    await chromeUtils.setStorage(EStorageKey.THEME, theme)
    document.documentElement.setAttribute("class", theme)
  }
}))

export default useExtensionState
