import { EDownloadSeperateType, ESocialProvider } from "src/constants/enum"
import { URL_PATTERN } from "src/constants/regex"
import threadsService from "src/services/threads.service"
import { chromeUtils } from "src/utils/chrome.util"
import { extractIdFromUrl, isVerifyAccount } from "src/utils/common.util"

export const downloadThreadsPostMedia = async (postUrl: string) => {
  if (!isVerifyAccount(ESocialProvider.THREADS)) {
    throw new Error("Vui lòng xác thực tài khoản Threads trước khi tải xuống!")
  }
  const postId = extractIdFromUrl(
    postUrl,
    URL_PATTERN[EDownloadSeperateType.THREADS_POST]
  )

  const postData = await threadsService.geThreadstPostDataByUrl(postUrl)
  const downloadPhotos = postData.images.map((image) =>
    chromeUtils.downloadFile(
      {
        url: image.downloadUrl,
        filename: `threads_post_${postId}/${image.id}.jpg`
      },
      false
    )
  )
  const downloadVideos = postData.videos.map((video) =>
    chromeUtils.downloadFile(
      {
        url: video.downloadUrl,
        filename: `threads_post_${postId}/${video.id}.mp4`
      },
      false
    )
  )
  const downloadAudios = postData.audios.map((audio) =>
    chromeUtils.downloadFile(
      {
        url: audio.downloadUrl,
        filename: `threads_post_${postId}/${audio.id}.mp3`
      },
      false
    )
  )
  await Promise.all([...downloadPhotos, ...downloadVideos, ...downloadAudios])
}
