import { create } from "zustand"

import { ESocialProvider } from "src/constants/enum"
import { IDownloadProcess } from "src/interfaces/download-process.interface"

interface IDownloadProcessState {
  [ESocialProvider.FACEBOOK]: IDownloadProcess[ESocialProvider.FACEBOOK][]
  [ESocialProvider.INSTAGRAM]: IDownloadProcess[ESocialProvider.INSTAGRAM][]
  [ESocialProvider.THREADS]: IDownloadProcess[ESocialProvider.THREADS][]
  [ESocialProvider.X]: IDownloadProcess[ESocialProvider.X][]
}

interface IDownloadProcessStore {
  downloadProcesses: IDownloadProcessState
  addProcess: <T extends ESocialProvider>(
    socialName: T,
    newProcess: IDownloadProcess[T]
  ) => void
  removeProcess: (socialName: ESocialProvider, processId: string) => void
  updateProcess: <T extends ESocialProvider>(
    socialName: T,
    processId: string,
    payload: Partial<IDownloadProcess[T]>
  ) => void
  getDownloadProcessBySocial: <T extends ESocialProvider>(
    socialName: T
  ) => IDownloadProcess[T][]
}

const useDownloadProcesses = create<IDownloadProcessStore>((set, getState) => ({
  downloadProcesses: {
    [ESocialProvider.FACEBOOK]: [],
    [ESocialProvider.INSTAGRAM]: [],
    [ESocialProvider.THREADS]: [],
    [ESocialProvider.X]: []
  },
  addProcess: (socialName, newProcess) => {
    set((state) => ({
      downloadProcesses: {
        ...state.downloadProcesses,
        [socialName]: [...state.downloadProcesses[socialName], newProcess]
      }
    }))
  },
  removeProcess: (socialName, processId) => {
    set((state) => ({
      downloadProcesses: {
        ...state.downloadProcesses,
        [socialName]: state.downloadProcesses[socialName].filter(
          (process) => process.id !== processId
        )
      }
    }))
  },
  updateProcess: (socialName, processId, payload) => {
    set((state) => ({
      downloadProcesses: {
        ...state.downloadProcesses,
        [socialName]: state.downloadProcesses[socialName].map((process) =>
          process.id === processId ? { ...process, ...payload } : process
        )
      }
    }))
  },
  getDownloadProcessBySocial: (socialName) => {
    return getState().downloadProcesses[
      socialName
    ] as IDownloadProcess[typeof socialName][]
  }
}))

export default useDownloadProcesses
