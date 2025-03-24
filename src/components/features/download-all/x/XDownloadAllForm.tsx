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
import { useMemo } from "react"
import { v4 as uuidv4 } from "uuid"

import { ESocialProvider } from "src/constants/enum"
import {
  DOWNLOAD_TYPE_TAG_COLOR,
  PROCESS_STATUS_TAG_COLOR,
  PROCESS_TEXT,
  X_DOWNLOAD_ALL_TYPE
} from "src/constants/variables"
import useDownloadXMedia from "src/hooks/x/useDownloadXMedia"
import {
  IDownloadProcessDetail,
  TProcessStatus,
  TXDownloadAllType
} from "src/interfaces/download-process.interface"
import { IXDownloadAllForm } from "src/interfaces/form.interface"
import useDownloadProcesses from "src/store/download-process"
import { showErrorToast } from "src/utils/toast.util"

const XDownloadAllForm = () => {
  const { removeProcess, addProcess, getDownloadProcessBySocial } =
    useDownloadProcesses()
  const [form] = Form.useForm<IXDownloadAllForm>()
  const { startDownloadAllMedia } = useDownloadXMedia()

  const isWaitUntilCompleted = Form.useWatch("waitUntilCompleted", form)
  const xDownloadProcesses = getDownloadProcessBySocial(ESocialProvider.X)

  const handleSubmit = async (values: IXDownloadAllForm) => {
    try {
      const processId = uuidv4()
      addProcess(ESocialProvider.X, {
        id: processId,
        username: values.username,
        downloadType: values.type,
        totalDownloadedItems: 0,
        status: "RUNNING"
      })
      if (values.type === "MEDIA") {
        await startDownloadAllMedia(values.username, processId, { ...values })
      }
    } catch (error) {
      showErrorToast((error as Error).message)
    }
  }

  const tableColumns: TableColumnsType<
    IDownloadProcessDetail<TXDownloadAllType>
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
        render: (downloadType: TXDownloadAllType) => (
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
        render: (record: IDownloadProcessDetail<TXDownloadAllType>) =>
          record.status === "RUNNING" ? (
            <Button
              type="primary"
              danger
              onClick={() => removeProcess(ESocialProvider.X, record.id)}>
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
          <Form.Item<IXDownloadAllForm>
            label="Username:"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên người dùng!" }
            ]}
            style={{ flex: 8 }}>
            <Input addonBefore="https://x.com/" />
          </Form.Item>
          <Form.Item<IXDownloadAllForm>
            label="Loại tải:"
            name="type"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại tải!"
              }
            ]}
            initialValue="MEDIA"
            style={{ flex: 4 }}>
            <Select>
              {X_DOWNLOAD_ALL_TYPE.map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IXDownloadAllForm>
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
            <Form.Item<IXDownloadAllForm>
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
          <Button type="primary" htmlType="submit">
            Tải
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={tableColumns}
        dataSource={xDownloadProcesses}
        pagination={{
          pageSize: 5
        }}
      />
    </div>
  )
}

export default XDownloadAllForm
