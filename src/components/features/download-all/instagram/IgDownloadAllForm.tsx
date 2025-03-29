import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Tag,
  type TableColumnsType
} from "antd"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

import { ESocialProvider } from "src/constants/enum"
import { APP_ROUTES } from "src/constants/route"
import {
  DOWNLOAD_TYPE_TAG_COLOR,
  IG_DOWNLOAD_ALL_TYPE,
  PROCESS_STATUS_TAG_COLOR,
  PROCESS_TEXT
} from "src/constants/variables"
import useDownloadIgActiveStories from "src/hooks/instagram/useDownloadIgActiveStories"
import useDownloadIgHighlight from "src/hooks/instagram/useDownloadIgHighlight"
import useDownloadIgPost from "src/hooks/instagram/useDownloadIgPost"
import useDownloadIgReel from "src/hooks/instagram/useDownloadIgReel"
import {
  IDownloadProcessDetail,
  TIgDownloadAllType,
  TProcessStatus
} from "src/interfaces/download-process.interface"
import { IIgDownloadAllForm } from "src/interfaces/form.interface"
import instagramService from "src/services/instagram.service"
import useDownloadProcess from "src/store/download-process"
import { isVerifyAccount } from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const IgDownloadAllForm = () => {
  const { getDownloadProcessBySocial, removeProcess, addProcess } =
    useDownloadProcess()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm<IIgDownloadAllForm>()
  const { startDownloadAllPosts } = useDownloadIgPost()
  const { startDownloadAllReels } = useDownloadIgReel()
  const { startDownloadAllHightlights } = useDownloadIgHighlight()
  const { downloadActiveStories } = useDownloadIgActiveStories()

  const isWaitUntilCompleted = Form.useWatch("waitUntilCompleted", form)
  const igDownloadProcesses = getDownloadProcessBySocial(
    ESocialProvider.INSTAGRAM
  )

  const handleSubmit = async (values: IIgDownloadAllForm) => {
    try {
      setIsSubmitting(true)
      if (!isVerifyAccount(ESocialProvider.INSTAGRAM)) {
        throw new Error(
          "Vui lòng xác thực tài khoản Instagram trước khi tải xuống!"
        )
      }
      await instagramService.getInstagramIdAndAvatarByUsername(values.username)
      setIsSubmitting(false)
      const processId = uuidv4()
      addProcess(ESocialProvider.INSTAGRAM, {
        id: processId,
        username: values.username,
        downloadType: values.type,
        totalDownloadedItems: 0,
        status: "RUNNING"
      })
      if (values.type === "POST") {
        await startDownloadAllPosts(values.username, processId, { ...values })
      }
      if (values.type === "REEL") {
        await startDownloadAllReels(values.username, processId, { ...values })
      }
      if (values.type === "HIGHLIGHT") {
        await startDownloadAllHightlights(values.username, processId, {
          ...values
        })
      }
      if (values.type === "STORY") {
        await downloadActiveStories(values.username, processId)
      }
    } catch (error) {
      showErrorToast((error as Error).message)
      setIsSubmitting(false)
    }
  }

  const tableColumns: TableColumnsType<
    IDownloadProcessDetail<TIgDownloadAllType>
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
        title: "Username",
        dataIndex: "username",
        key: "username",
        render: (username: string) => (
          <p className="font-bold text-blue-700">{username}</p>
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
        render: (record: IDownloadProcessDetail<TIgDownloadAllType>) =>
          record.status === "RUNNING" ? (
            <Button
              type="primary"
              danger
              onClick={() =>
                removeProcess(ESocialProvider.INSTAGRAM, record.id)
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
      <Alert
        className="mb-3"
        message={
          <div>
            Hãy đảm bảo rằng bạn đã xác thực tài khoản Instagram (
            <span>
              <Link to={APP_ROUTES.ACCOUNTS}>tại đây</Link>
            </span>
            ) trước khi sử dụng các tính năng dưới đây!
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
          <Form.Item<IIgDownloadAllForm>
            label="Loại tải:"
            name="type"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại tải!"
              }
            ]}
            style={{ flex: 4 }}>
            <Select>
              {IG_DOWNLOAD_ALL_TYPE.map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IIgDownloadAllForm>
            label="Username:"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên người dùng!" }
            ]}
            style={{ flex: 8 }}>
            <Input addonBefore="https://www.instagram.com/" />
          </Form.Item>
          <Form.Item<IIgDownloadAllForm>
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
            <Form.Item<IIgDownloadAllForm>
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
        dataSource={igDownloadProcesses}
        pagination={{
          pageSize: 5
        }}
      />
    </div>
  )
}

export default IgDownloadAllForm
