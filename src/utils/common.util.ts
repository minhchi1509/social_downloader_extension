import { format } from "@fast-csv/format"
import axios from "axios"
import clsx, { ClassValue } from "clsx"
import i18next from "i18next"
import { twMerge } from "tailwind-merge"

import { ESocialProvider } from "src/constants/enum"
import useAuth from "src/store/auth"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const downloadByBatch = async <T>(
  data: T[],
  downloadFunction: (item: T, index: number) => Promise<void>,
  batchSize: number = 1,
  onDownloadBatchCompleted?: (batchIndex: number) => void | Promise<void>
) => {
  for (let i = 0; i < data.length; i += batchSize) {
    const from = i
    const to = Math.min(i + batchSize, data.length)
    const sliceData = data.slice(from, to)
    await Promise.all(
      sliceData.map((item: any, index: number) =>
        downloadFunction(item, from + index + 1)
      )
    )
    if (onDownloadBatchCompleted) {
      await onDownloadBatchCompleted(to)
    }
  }
}

export const createCsvContentFromData = async <T extends object>(data: T[]) => {
  if (data.length === 0) return ""

  return new Promise<string>((resolve) => {
    const csvStream = format({ headers: true })
    let csvContent = ""

    csvStream
      .on("data", (chunk) => {
        csvContent += chunk.toString()
      })
      .on("end", () => {
        resolve(csvContent)
      })

    data.forEach((row) => csvStream.write(row))
    csvStream.end()
  })
}

export const downloadStatisticCsvFile = async <T extends object>(
  data: T[],
  filename: string
) => {
  const csvContent = await createCsvContentFromData(data)
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  await chromeUtils.downloadFile({ url, filename })
  URL.revokeObjectURL(url)
}

export const extractIdFromUrl = (url: string, regexPattern: RegExp) => {
  const match = url.match(regexPattern)
  if (!match) {
    throw new Error(i18next.t("error_messages.invalid_url"))
  }
  return match[1]
}

export const isDownloadProcessExist = (
  socialName: ESocialProvider,
  processId: string
) => {
  const { getDownloadProcessBySocial } = useDownloadProcesses.getState()
  const downloadProcess = getDownloadProcessBySocial(socialName)
  const isProcessExist = downloadProcess.some(
    (process) => process.id === processId
  )
  return isProcessExist
}

export const isVerifyAccount = (socialName: ESocialProvider) => {
  const { accounts } = useAuth.getState()
  if (!accounts[socialName]) {
    return false
  }
  return true
}

export const makeRequestToFacebookFromContent = async (
  docID: string,
  query: any
) => {
  const { data: rawData } = await axios.get("https://www.facebook.com", {
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
    }
  })
  const profileRegex = /"story_bucket_owner":(.*?),"story_bucket_type":/
  const fbDtsgRegex = /"DTSGInitialData".*?"token":"(.*?)"/
  const originalProfileInfor = rawData.match(profileRegex)
  const fbDtsg = rawData.match(fbDtsgRegex)?.[1]
  if (!originalProfileInfor || !fbDtsg) {
    throw new Error(i18next.t("error_messages.threads_user_info_error"))
  }
  const profileInfor = JSON.parse(originalProfileInfor[1])
  const profileId = profileInfor.id
  const formData = new FormData()
  formData.set("__a", "1")
  formData.set("__comet_req", "15")
  formData.set("fb_dtsg", fbDtsg)
  formData.set("av", profileId)
  formData.set("doc_id", docID)
  formData.set("variables", JSON.stringify(query))
  const { data: responseData } = await axios.post(
    "https://www.facebook.com/api/graphql",
    formData
  )
  return responseData
}
