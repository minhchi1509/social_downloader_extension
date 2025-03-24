import { Alert, Button, Form, Input, Select } from "antd"
import { useState } from "react"

import { DOWNLOAD_SEPARATELY_TYPE } from "src/constants/variables"
import useDownloadActiveStories from "src/hooks/instagram/useDownloadIgActiveStories"
import useDownloadHighlight from "src/hooks/instagram/useDownloadIgHighlight"
import useDownloadPost from "src/hooks/instagram/useDownloadIgPost"
import useDownloadReel from "src/hooks/instagram/useDownloadIgReel"
import { IDownloadSeparatelyForm } from "src/interfaces/form.interface"
import { getProfileStatistics } from "src/services"
import { chromeUtils } from "src/utils/chrome.util"
import { showErrorToast, showSuccessToast } from "src/utils/toast.util"

const DownloadSeparately = () => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [form] = Form.useForm<IDownloadSeparatelyForm>()
  const downloadType = Form.useWatch("type", form)

  const { downloadPostMediaByCode } = useDownloadPost()
  const { downloadReelMediaByCode } = useDownloadReel()
  const { downloadHighlightStoriesByCode } = useDownloadHighlight()
  const { downloadActiveStories } = useDownloadActiveStories()

  const getAddonBeforeByDownloadType = () => {
    switch (downloadType) {
      case "POST":
        return "https://www.instagram.com/p/"
      case "REEL":
        return "https://www.instagram.com/reel/"
      case "HIGHLIGHT":
        return "https://www.instagram.com/stories/highlights/"
      case "STORY":
        return "https://www.instagram.com/stories/"
      case "AVATAR":
        return "https://www.instagram.com/"
      default:
        return ""
    }
  }

  const handleSubmit = async (values: IDownloadSeparatelyForm) => {
    try {
      setIsDownloading(true)
      if (values.type === "POST") {
        await downloadPostMediaByCode(values.id)
      }
      if (values.type === "REEL") {
        await downloadReelMediaByCode(values.id)
      }
      if (values.type === "HIGHLIGHT") {
        await downloadHighlightStoriesByCode(values.id)
      }
      if (values.type === "STORY") {
        await downloadActiveStories(values.id)
      }
      if (values.type === "AVATAR") {
        const profile = await getProfileStatistics(values.id)
        await chromeUtils.downloadFile({
          url: profile.avatar_url,
          filename: `${profile.id}.jpg`
        })
      }
      showSuccessToast("Tải xuống hoàn tất!")
    } catch (error) {
      showErrorToast((error as Error).message)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div>
      <Form
        form={form}
        name="basic"
        autoComplete="off"
        onFinish={handleSubmit}
        layout="vertical"
        labelAlign="left">
        <div className="flex items-center gap-3">
          <Form.Item<IDownloadSeparatelyForm>
            label="Loại tải:"
            name="type"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại tải!"
              }
            ]}
            style={{ flex: 1 }}>
            <Select allowClear>
              {DOWNLOAD_SEPARATELY_TYPE.map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IDownloadSeparatelyForm>
            label="Đường dẫn:"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập thông tin cần tải!"
              }
            ]}
            name="id"
            style={{ flex: 1 }}>
            <Input
              addonBefore={getAddonBeforeByDownloadType()}
              style={{
                width: "100%"
              }}
            />
          </Form.Item>
        </div>
        {downloadType === "AVATAR" ? (
          <Alert
            message="Bạn có thể tải ảnh đại diện của bất kỳ người dùng nào trên Instagram"
            type="info"
            showIcon
            style={{
              marginBottom: "16px"
            }}
          />
        ) : null}
        <Form.Item wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit" loading={isDownloading}>
            Tải
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default DownloadSeparately
