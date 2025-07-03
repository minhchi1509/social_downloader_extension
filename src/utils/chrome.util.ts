const getChromeCookies = async (domain: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ domain }, function (cookies) {
      if (cookies.length > 0) {
        let cookieList = cookies
          .map((cookie) => `${cookie.name}=${cookie.value}`)
          .join(";")
        resolve(cookieList)
      } else {
        reject("Cookie not found for domain: " + domain)
      }
    })
  })
}

const openNewTab = async (options: chrome.tabs.CreateProperties) => {
  const tab = await chrome.tabs.create(options)
  return tab
}

const closeTab = async (tabId: number): Promise<void> => {
  await chrome.tabs.remove(tabId)
}

const getStorage = async <T>(key: string): Promise<T | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, function (result) {
      resolve(result[key])
    })
  })
}

const setStorage = async <T>(key: string, value: T): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, function () {
      resolve()
    })
  })
}

const removeStorage = async (key: string): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, function () {
      resolve()
    })
  })
}

const downloadFile = async (
  options: chrome.downloads.DownloadOptions,
  waitUntilCompleted: boolean = true
) => {
  return new Promise(async (resolve, reject) => {
    chrome.downloads.download(options, (downloadId) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }
      if (!waitUntilCompleted) {
        return resolve("Start downloading")
      } else {
        chrome.downloads.onChanged.addListener(
          function onDownloadChanged(downloadDelta) {
            if (downloadDelta.id === downloadId && downloadDelta.state) {
              if (downloadDelta.state.current === "complete") {
                resolve("Download completed")
                chrome.downloads.onChanged.removeListener(onDownloadChanged)
              } else if (downloadDelta.state.current === "interrupted") {
                reject("Download interrupted")
                chrome.downloads.onChanged.removeListener(onDownloadChanged)
              }
            }
          }
        )
      }
    })
  })
}

export const chromeUtils = {
  getChromeCookies,
  getStorage,
  setStorage,
  removeStorage,
  downloadFile,
  openNewTab,
  closeTab
}
