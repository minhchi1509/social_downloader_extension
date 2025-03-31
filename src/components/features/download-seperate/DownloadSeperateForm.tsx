import { Alert, Button, Form, Input, Select } from "antd"
import { useState } from "react"
import { Link } from "react-router-dom"

import { EDownloadSeperateType } from "src/constants/enum"
import { APP_ROUTES } from "src/constants/route"
import { DOWNLOAD_SEPERATE_TYPE_OPTIONS } from "src/constants/variables"
import { IDownloadSeperateForm } from "src/interfaces/form.interface"
import {
  downloadFbCommentVideo,
  downloadFbPostMedia,
  downloadFbReel,
  downloadFbStoryMedia,
  downloadFbVideo
} from "src/utils/facebook.util"
import {
  downloadIgHighlightStories,
  downloadIgPostMedia,
  downloadIgReelMedia
} from "src/utils/instagram.util"
import { downloadThreadsPostMedia } from "src/utils/threads.util"
import { showErrorToast, showSuccessToast } from "src/utils/toast.util"
import { downloadXPostMedia } from "src/utils/x.util"

const { Option, OptGroup } = Select

const downloadSeperateFunction = {
  [EDownloadSeperateType.FACEBOOK_POST]: downloadFbPostMedia,
  [EDownloadSeperateType.FACEBOOK_STORY]: downloadFbStoryMedia,
  [EDownloadSeperateType.FACEBOOK_VIDEO]: downloadFbVideo,
  [EDownloadSeperateType.FACEBOOK_REEL]: downloadFbReel,
  [EDownloadSeperateType.FACEBOOK_COMMENT_VIDEO]: downloadFbCommentVideo,

  [EDownloadSeperateType.INSTAGRAM_POST]: downloadIgPostMedia,
  [EDownloadSeperateType.INSTAGRAM_REEL]: downloadIgReelMedia,
  [EDownloadSeperateType.INSTAGRAM_HIGHLIGHT]: downloadIgHighlightStories,

  [EDownloadSeperateType.THREADS_POST]: downloadThreadsPostMedia,

  [EDownloadSeperateType.X_POST]: downloadXPostMedia
}

const DownloadSeperateForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm<IDownloadSeperateForm>()

  const handleSubmit = async (values: IDownloadSeperateForm) => {
    try {
      setIsSubmitting(true)
      await downloadSeperateFunction[values.type](values.url)
      showSuccessToast("Tải xuống thành công!")
    } catch (error) {
      showErrorToast((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Alert
        className="mb-3"
        message={
          <div>
            Hãy đảm bảo rằng bạn đã xác thực tài khoản
            Facebook/Instagram/Threads/X (
            <span>
              <Link to={APP_ROUTES.ACCOUNTS}>tại đây</Link>
            </span>
            ) trước khi sử dụng các tính năng tương ứng dưới đây!
          </div>
        }
        type="warning"
        showIcon
        closable
      />
      <Form
        form={form}
        name="basic"
        autoComplete="off"
        onFinish={handleSubmit}
        layout="vertical"
        labelAlign="left">
        <div className="flex gap-3 items-center">
          <Form.Item<IDownloadSeperateForm>
            style={{ flex: 1 }}
            label="Loại:"
            name="type"
            rules={[
              { required: true, message: "Vui lòng chọn loại tải xuống!" }
            ]}>
            <Select>
              {DOWNLOAD_SEPERATE_TYPE_OPTIONS.map((group) => (
                <OptGroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </OptGroup>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IDownloadSeperateForm>
            style={{ flex: 1 }}
            label="Đường dẫn:"
            name="url"
            rules={[{ required: true, message: "Vui lòng nhập đường dẫn!" }]}>
            <Input />
          </Form.Item>
        </div>
        <Form.Item wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Tải
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default DownloadSeperateForm
