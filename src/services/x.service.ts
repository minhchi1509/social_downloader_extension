import axios from "axios"

import { xAxiosInstance } from "src/configs/axios.config"
import { ERemoteMessageType } from "src/constants/enum"
import { IXAccount } from "src/interfaces/account.interface"
import { IXMedia } from "src/interfaces/x.interface"
import { chromeUtils } from "src/utils/chrome.util"
import { delay } from "src/utils/common.util"

const getXAccountData = async (): Promise<IXAccount> => {
  try {
    const cookies = await chromeUtils.getChromeCookies("x.com")
    const axiosInstance = axios.create({
      baseURL: "https://x.com"
    })
    const { data: rawData } = await axiosInstance.get("/")
    const idRegex = /"users":{"entities":{"(.*?)"/
    const usernameRegex = /"screen_name":"(.*?)"/
    const fullNameRegex = /"name":"(.*?)"/
    const avatarRegex = /"profile_image_url_https":"(.*?)"/
    const id = rawData.match(idRegex)?.[1]
    const fullName = rawData.match(fullNameRegex)?.[1]
    const avatar = rawData.match(avatarRegex)?.[1]
    const username = rawData.match(usernameRegex)?.[1]
    if (!fullName || !avatar || !id || !username) {
      throw new Error()
    }

    const xTab = await chromeUtils.openNewTab({ url: "https://x.com/home" })
    await delay(1000)
    if (xTab.id) {
      await chromeUtils.closeTab(xTab.id)
    }

    const xAccountData: IXAccount = {
      id,
      username,
      avatar,
      cookies,
      accessToken: "",
      csrfToken: ""
    }

    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: ERemoteMessageType.RETRIEVE_X_ACCOUNT_CREDENTIALS },
        (response) => {
          if (response) {
            xAccountData.accessToken = response.authorization
            xAccountData.csrfToken = response.xCsrfToken
            resolve("")
          }
          reject("")
        }
      )
    })

    return xAccountData
  } catch (error) {
    throw new Error(
      "Không thể lấy dữ liệu tài khoản X. Đảm bảo rằng bạn đã đăng nhập vào X trên trình duyệt"
    )
  }
}

const getXUserIdFromUsername = async (username: string): Promise<string> => {
  try {
    const { data: responseData } = await xAxiosInstance.get(
      "/vqu78dKcEkW-UAYLw5rriA/useFetchProfileSections_canViewExpandedProfileQuery",
      {
        params: {
          variables: JSON.stringify({ screenName: username })
        }
      }
    )
    const base64UserId = responseData.data.user_result_by_screen_name.result.id
    const userId = atob(base64UserId).split(":")[1]
    return userId
  } catch (error) {
    throw new Error(`Không thể lấy ID từ user ${username}`)
  }
}

const getPostMediaById = async (postId: string): Promise<IXMedia[]> => {
  try {
    const features = {
      rweb_video_screen_enabled: false,
      profile_label_improvements_pcf_label_in_post_enabled: true,
      rweb_tipjar_consumption_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      creator_subscriptions_tweet_preview_api_enabled: true,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
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
      responsive_web_grok_show_grok_translated_post: false,
      responsive_web_grok_analysis_button_from_backend: true,
      creator_subscriptions_quote_tweet_preview_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
        true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_grok_image_annotation_enabled: true,
      responsive_web_enhance_cards_enabled: false
    }
    const fieldToggles = {
      withArticleRichContentState: true,
      withArticlePlainText: false,
      withGrokAnalyze: false,
      withDisallowedReplyControls: false
    }
    const variables = {
      focalTweetId: postId,
      with_rux_injections: false,
      rankingMode: "Relevance",
      includePromotedContent: true,
      withCommunity: true,
      withQuickPromoteEligibilityTweetFields: true,
      withBirdwatchNotes: true,
      withVoice: true
    }
    const { data: responseData } = await xAxiosInstance.get(
      "/jbkn58DkVk8bIkDp8IEAsQ/TweetDetail",
      {
        params: {
          features: JSON.stringify(features),
          fieldToggles: JSON.stringify(fieldToggles),
          variables: JSON.stringify(variables)
        }
      }
    )
    const mediaList: any[] =
      responseData.data.threaded_conversation_with_injections_v2.instructions[0]
        .entries[0].content.itemContent.tweet_results.result.legacy
        .extended_entities.media
    const formattedMediaList: IXMedia[] = mediaList.map((media) => {
      const id = media.id_str
      const isVideo = media.type === "video"
      const downloadUrl = !isVideo
        ? media.media_url_https
        : media.video_info.variants.at(-1).url
      return { id, isVideo, downloadUrl }
    })
    return formattedMediaList
  } catch (error) {
    throw new Error(`Không thể lấy dữ liệu bài viết với ID ${postId}`)
  }
}

const xService = {
  getXAccountData,
  getXUserIdFromUsername,
  getPostMediaById
}

export default xService
