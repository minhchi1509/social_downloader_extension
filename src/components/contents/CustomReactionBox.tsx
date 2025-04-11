import EmojiPicker, {
  EmojiClickData,
  Theme as EmojiPickerTheme
} from "emoji-picker-react"

import { makeRequestToFacebookFromContent } from "src/utils/common.util"
import { showErrorToast, showSuccessToast } from "src/utils/toast.util"

const CustomReactionBox = () => {
  const handleEmojiClick = async ({ emoji }: EmojiClickData) => {
    try {
      const storyID = document
        .querySelector("div.x6s0dn4.x78zum5.x5yr21d.xl56j7k.x1n2onr6.xh8yej3")
        ?.getAttribute("data-id")
      if (!storyID) {
        showErrorToast("Không tìm thấy story ID")
        return
      }
      const docID = "4826141330837571"
      const query = {
        input: {
          lightweight_reaction_actions: { offsets: [0], reaction: emoji },
          story_id: storyID,
          story_reply_type: "LIGHT_WEIGHT",
          actor_id: "100054783412028",
          client_mutation_id: "17"
        }
      }
      showSuccessToast("Thả cảm xúc story thành công")
      await makeRequestToFacebookFromContent(docID, query)
    } catch (error) {
      showErrorToast("Thả cảm xúc story thất bại")
    }
  }
  return (
    <EmojiPicker
      theme={EmojiPickerTheme.DARK}
      onEmojiClick={handleEmojiClick}
      skinTonesDisabled
    />
  )
}

export default CustomReactionBox
