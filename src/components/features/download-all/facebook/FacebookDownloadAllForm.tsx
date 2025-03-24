import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  TableColumnsType,
  Tag
} from "antd"
import { useMemo, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import { ESocialProvider } from "src/constants/enum"
import {
  DOWNLOAD_TYPE_TAG_COLOR,
  FB_DOWNLOAD_ALL_TYPE,
  PROCESS_STATUS_TAG_COLOR,
  PROCESS_TEXT
} from "src/constants/variables"
import useDownloadFbHighlight from "src/hooks/facebook/useDownloadFbHighlight"
import useDownloadFbPhoto from "src/hooks/facebook/useDownloadFbPhoto"
import useDownloadFbReel from "src/hooks/facebook/useDownloadFbReel"
import useDownloadFbVideo from "src/hooks/facebook/useDownloadFbVideo"
import {
  IDownloadProcessDetail,
  TFacebookDownloadAllType,
  TIgDownloadAllType,
  TProcessStatus
} from "src/interfaces/download-process.interface"
import { IFacebookDownloadAllForm } from "src/interfaces/form.interface"
import facebookService from "src/services/facebook.service"
import useDownloadProcesses from "src/store/download-process"
import { showErrorToast } from "src/utils/toast.util"

const FacebookDownloadAllForm = () => {
  const { getDownloadProcessBySocial, removeProcess, addProcess } =
    useDownloadProcesses()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm<IFacebookDownloadAllForm>()

  const { startDownloadAllPhotos } = useDownloadFbPhoto()
  const { startDownloadAllReels } = useDownloadFbReel()
  const { startDownloadAllVideos } = useDownloadFbVideo()
  const { startDownloadAllHighlights } = useDownloadFbHighlight()

  const isWaitUntilCompleted = Form.useWatch("waitUntilCompleted", form)
  const fbDownloadProcesses = getDownloadProcessBySocial(
    ESocialProvider.FACEBOOK
  )

  const handleSubmit = async (values: IFacebookDownloadAllForm) => {
    try {
      setIsSubmitting(true)
      const userId = await facebookService.getFbIdFromUsername(values.username)
      setIsSubmitting(false)
      const processId = uuidv4()
      addProcess(ESocialProvider.FACEBOOK, {
        id: processId,
        username: values.username,
        downloadType: values.type,
        totalDownloadedItems: 0,
        status: "RUNNING"
      })
      if (values.type === "PHOTO") {
        await startDownloadAllPhotos(userId, processId, { ...values })
      }
      if (values.type === "REEL") {
        await startDownloadAllReels(userId, processId, { ...values })
      }
      if (values.type === "VIDEO") {
        await startDownloadAllVideos(userId, processId, { ...values })
      }
      if (values.type === "HIGHLIGHT") {
        await startDownloadAllHighlights(userId, processId, { ...values })
      }
    } catch (error) {
      showErrorToast((error as Error).message)
      setIsSubmitting(false)
    }
  }

  const tableColumns: TableColumnsType<
    IDownloadProcessDetail<TFacebookDownloadAllType>
  > = useMemo(
    () => [
      {
        title: "STT",
        dataIndex: "ordinalNumber",
        key: "ordinalNumber",
        width: 70,
        render: (_, __, index) => index + 1
      },
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
        render: (username: string) => (
          <p className="font-bold text-blue-700">{username}</p>
        )
      },
      {
        title: "Loại tải",
        dataIndex: "downloadType",
        key: "downloadType",
        render: (downloadType: TIgDownloadAllType) => (
          <Tag color={DOWNLOAD_TYPE_TAG_COLOR[downloadType]}>
            {downloadType}
          </Tag>
        )
      },
      {
        title: "Số lượng đã tải",
        dataIndex: "totalDownloadedItems",
        key: "totalDownloadedItems"
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: TProcessStatus) => (
          <Tag color={PROCESS_STATUS_TAG_COLOR[status]}>
            {PROCESS_TEXT[status]}
          </Tag>
        )
      },
      {
        title: "Hành động",
        key: "action",
        render: (record: IDownloadProcessDetail<TFacebookDownloadAllType>) =>
          record.status === "RUNNING" ? (
            <Button
              type="primary"
              danger
              onClick={() =>
                removeProcess(ESocialProvider.FACEBOOK, record.id)
              }>
              Hủy
            </Button>
          ) : null
      }
    ],
    []
  )

  return (
    <div>
      <Form
        form={form}
        name="basic"
        autoComplete="off"
        onFinish={handleSubmit}
        layout="vertical"
        labelAlign="left">
        <div className="flex gap-3 items-center">
          <Form.Item<IFacebookDownloadAllForm>
            label="Username:"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên người dùng!" }
            ]}
            style={{ flex: 8 }}>
            <Input addonBefore="https://www.facebook.com/" />
          </Form.Item>
          <Form.Item<IFacebookDownloadAllForm>
            label="Loại tải:"
            name="type"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại tải!"
              }
            ]}
            style={{ flex: 4 }}>
            <Select allowClear>
              {FB_DOWNLOAD_ALL_TYPE.map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IFacebookDownloadAllForm>
            label="Tùy chọn cho tiến trình tải:"
            name="waitUntilCompleted"
            initialValue={true}
            style={{ flex: 8 }}>
            <Select>
              <Select.Option value={true}>
                Chờ đợi cho đến khi lượt tải xuống trước đó hoàn thành
              </Select.Option>
              <Select.Option value={false}>
                Thiết lập thời gian delay giữa các lần tải
              </Select.Option>
            </Select>
          </Form.Item>
          {!isWaitUntilCompleted ? (
            <Form.Item<IFacebookDownloadAllForm>
              label="Thời gian delay:"
              name="delayTimeInSecond"
              initialValue={0}
              style={{ flex: 3 }}>
              <InputNumber
                min={0}
                addonAfter="giây"
                style={{
                  width: "100%"
                }}
              />
            </Form.Item>
          ) : null}
        </div>

        <Form.Item wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Tải
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={tableColumns}
        dataSource={fbDownloadProcesses}
        pagination={{
          pageSize: 5
        }}
      />
    </div>
  )
}

export default FacebookDownloadAllForm
