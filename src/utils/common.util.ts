import { format } from "@fast-csv/format"
import clsx, { ClassValue } from "clsx"
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
    throw new Error("URL không hợp lệ")
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
