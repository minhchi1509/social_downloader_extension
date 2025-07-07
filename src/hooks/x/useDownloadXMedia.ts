import { xAxiosInstance } from "src/configs/axios.config"
import { ESocialProvider } from "src/constants/enum"
import { MAX_RETRY_REQUEST } from "src/constants/variables"
import { IDownloadAllOptions } from "src/interfaces/common.interface"
import { IXMedia } from "src/interfaces/x.interface"
import xService from "src/services/x.service"
import useDownloadProcesses from "src/store/download-process"
import { chromeUtils } from "src/utils/chrome.util"
import {
  delay,
  downloadByBatch,
  isDownloadProcessExist
} from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const useDownloadXMedia = () => {
  const { updateProcess } = useDownloadProcesses()

  const startDownloadAllMedia = async (
    username: string,
    processId: string,
    { waitUntilCompleted, delayTimeInSecond }: IDownloadAllOptions
  ) => {
    try {
      let retryCount = 0
      const userId = await xService.getXUserIdFromUsername(username)
      let nextCursor = ""
      let totalDownloadedItems = 0
      const features = {
        rweb_video_screen_enabled: false,
        profile_label_improvements_pcf_label_in_post_enabled: true,
        rweb_tipjar_consumption_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled:
          false,
        premium_content_api_read_enabled: false,
        communities_web_enable_tweet_community_results_fetch: true,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        responsive_web_grok_analyze_button_fetch_trends_enabled: false,
        responsive_web_grok_analyze_post_followups_enabled: true,
        responsive_web_jetfuel_frame: false,
        responsive_web_grok_share_attachment_enabled: true,
        articles_preview_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        tweet_awards_web_tipping_enabled: false,
        responsive_web_grok_analysis_button_from_backend: true,
        creator_subscriptions_quote_tweet_preview_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
          true,
        rweb_video_timestamps_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        responsive_web_grok_image_annotation_enabled: true,
        responsive_web_enhance_cards_enabled: false
      }
      const fieldToggles = { withArticlePlainText: false }
      const baseVariables = {
        userId,
        count: 20,
        includePromotedContent: false,
        withClientEventToken: false,
        withBirdwatchNotes: false,
        withVoice: true,
        withV2Timeline: true
      }

      while (true) {
        if (!isDownloadProcessExist(ESocialProvider.X, processId)) {
          return
        }
        const { data: responseData } = await xAxiosInstance.get(
          "/0j5qf4xg1BY6ImWCPiaZxg/UserMedia",
          {
            params: {
              features: JSON.stringify(features),
              fieldToggles: JSON.stringify(fieldToggles),
              variables: JSON.stringify({
                ...baseVariables,
                cursor: nextCursor
              })
            }
          }
        )
        const instructionsList =
          responseData?.data?.user?.result?.timeline_v2.timeline?.instructions

        const originalMediaList =
          instructionsList?.at(-1)?.entries?.at(0)?.content?.items ||
          instructionsList?.[0]?.moduleItems ||
          []
        const nextCursorData = instructionsList?.at(-1)?.entries?.at(-1)
          ?.content?.value
        if (originalMediaList.length === 0) {
          retryCount++
          if (retryCount >= MAX_RETRY_REQUEST - 10) {
            break
          }
          continue
        }

        const formattedMediaList: IXMedia[] = []
        for (let i = 0; i < originalMediaList.length; i++) {
          const media = originalMediaList[i]

          const subMediaList =
            media?.item?.itemContent?.tweet_results?.result?.legacy
              ?.extended_entities?.media
          if (!subMediaList) {
            continue
          }

          for (let j = 0; j < subMediaList.length; j++) {
            const mediaData = subMediaList[j]
            const id = mediaData.media_key
            const isVideo = mediaData.type === "video"
            let downloadUrl = mediaData.media_url_https
            if (isVideo) {
              downloadUrl = mediaData?.video_info?.variants?.at(-1)?.url
            }
            formattedMediaList.push({
              id,
              downloadUrl,
              isVideo
            })
          }
        }

        await downloadByBatch(
          formattedMediaList,
          async (media: IXMedia, mediaIndex: number) => {
            if (!isDownloadProcessExist(ESocialProvider.X, processId)) {
              return
            }
            await chromeUtils.downloadFile(
              {
                url: media.downloadUrl,
                filename: `x_downloader/${username}/media/${totalDownloadedItems + mediaIndex}_${media.id}.${media.isVideo ? "mp4" : "jpg"}`
              },
              waitUntilCompleted
            )
          },
          100
        )
        totalDownloadedItems += formattedMediaList.length
        retryCount = 0
        updateProcess(ESocialProvider.X, processId, {
          totalDownloadedItems
        })
        nextCursor = nextCursorData
        if (!waitUntilCompleted) {
          await delay((delayTimeInSecond || 0) * 1000)
        }
      }
      updateProcess(ESocialProvider.X, processId, { status: "COMPLETED" })
    } catch (error) {
      showErrorToast((error as Error).message)
      updateProcess(ESocialProvider.X, processId, { status: "FAILED" })
    }
  }
  return { startDownloadAllMedia }
}

export default useDownloadXMedia
