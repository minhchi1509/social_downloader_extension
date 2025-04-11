import { ERemoteMessageType } from "src/constants/enum"
import { checkExtensionVersion } from "src/utils/common.util"

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage()
})

let xHeadersData: any = null

chrome.runtime.onInstalled.addListener(async () => {
  const rules = [
    {
      id: 1,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          {
            header: "Origin",
            operation: "remove"
          }
        ]
      },
      condition: {
        urlFilter: "https://www.facebook.com/api/graphql/*",
        resourceTypes: ["xmlhttprequest"]
      }
    }
  ]

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [1],
    addRules: rules as any
  })

  console.log(
    "Rule to remove Origin header for Facebook GraphQL API has been applied."
  )
})

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const headers = details.requestHeaders || []
    const authorization =
      headers.find((h) => h.name.toLowerCase() === "authorization")?.value || ""
    const xCsrfToken =
      headers.find((h) => h.name.toLowerCase() === "x-csrf-token")?.value || ""

    // Lưu header mới nhất
    if (authorization && xCsrfToken) {
      xHeadersData = {
        authorization,
        xCsrfToken
      }
    }
  },
  { urls: ["*://x.com/i/api/graphql/*"] },
  ["requestHeaders", "extraHeaders"]
)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === ERemoteMessageType.RETRIEVE_X_ACCOUNT_CREDENTIALS) {
    sendResponse(xHeadersData)
  }
})

checkExtensionVersion()
