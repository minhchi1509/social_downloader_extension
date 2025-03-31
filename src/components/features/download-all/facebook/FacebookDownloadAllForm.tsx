import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  TableColumnsType,
  Tag
} from "antd"
import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

import { AlbumIdExampleImage } from "src/assets/images"
import { ESocialProvider } from "src/constants/enum"
import { APP_ROUTES } from "src/constants/route"
import {
  DOWNLOAD_TYPE_TAG_COLOR,
  FB_DOWNLOAD_ALL_TYPE,
  PROCESS_STATUS_TAG_COLOR,
  PROCESS_TEXT
} from "src/constants/variables"
import useDownloadFbAlbum from "src/hooks/facebook/useDownloadFbAlbum"
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
import { isVerifyAccount } from "src/utils/common.util"
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
  const { startDownloadAlbumById } = useDownloadFbAlbum()

  const isWaitUntilCompleted = Form.useWatch("waitUntilCompleted", form)
  const downloadType = Form.useWatch("type", form)
  const target = Form.useWatch("target", form)
  const fbDownloadProcesses = getDownloadProcessBySocial(
    ESocialProvider.FACEBOOK
  )

  const downloadAllFunctions: { [key in TFacebookDownloadAllType]: Function } =
    {
      PHOTO: (
        id: string,
        processId: string,
        options: IFacebookDownloadAllForm
      ) => startDownloadAllPhotos(target, id, processId, { ...options }),
      REEL: startDownloadAllReels,
      VIDEO: (
        id: string,
        processId: string,
        options: IFacebookDownloadAllForm
      ) => startDownloadAllVideos(target, id, processId, { ...options }),
      HIGHLIGHT: startDownloadAllHighlights,
      ALBUM_BY_ID: startDownloadAlbumById
    }

  const handleSubmit = async (values: IFacebookDownloadAllForm) => {
    try {
      setIsSubmitting(true)
      if (!isVerifyAccount(ESocialProvider.FACEBOOK)) {
        throw new Error(
          "Vui lòng xác thực tài khoản Facebook trước khi tải xuống!"
        )
      }
      let id = values.username
      if (values.type !== "ALBUM_BY_ID") {
        id = await (values.target === "PROFILE"
          ? facebookService.getFbIdFromUsername(values.username)
          : facebookService.getGroupIdFromName(values.username))
      }
      setIsSubmitting(false)
      const processId = uuidv4()
      addProcess(ESocialProvider.FACEBOOK, {
        id: processId,
        username: values.username,
        downloadType: values.type,
        totalDownloadedItems: 0,
        status: "RUNNING"
      })
      await downloadAllFunctions[values.type](id, processId, { ...values })
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
        title: "ID",
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

  useEffect(() => {
    form.setFieldsValue({ type: undefined })
  }, [target, form])

  return (
    <div>
      <Alert
        className="mb-3"
        message={
          <div>
            Hãy đảm bảo rằng bạn đã xác thực tài khoản Facebook (
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
        labelAlign="left"
        initialValues={{
          target: "PROFILE",
          waitUntilCompleted: true,
          delayTimeInSecond: 0
        }}>
        <div className="flex gap-3 items-center">
          <Form.Item<IFacebookDownloadAllForm>
            label="Đối tượng:"
            name="target"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn đối tượng!"
              }
            ]}
            style={{ flex: 1 }}>
            <Select>
              <Select.Option value="PROFILE">Người dùng</Select.Option>
              <Select.Option value="GROUP">Nhóm</Select.Option>
            </Select>
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
            style={{ flex: 1 }}>
            <Select>
              {FB_DOWNLOAD_ALL_TYPE[target]?.map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IFacebookDownloadAllForm>
            label={
              downloadType === "ALBUM_BY_ID"
                ? "ID Album:"
                : target === "PROFILE"
                  ? "ID/Username người dùng:"
                  : "ID nhóm:"
            }
            name="username"
            rules={[
              {
                required: true,
                message: `${downloadType === "ALBUM_BY_ID" ? "Vui lòng nhập ID của album" : target === "PROFILE" ? "Vui lòng nhập ID/Username của người dùng" : "Vui lòng nhập ID của nhóm"}!`
              }
            ]}
            style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>
        <div className="flex gap-3 items-center">
          {downloadType === "HIGHLIGHT" ? (
            <Form.Item<IFacebookDownloadAllForm>
              label="Tùy chọn tải xuống:"
              name="isMergeIntoOneFolder"
              initialValue={false}
              style={{ flex: 8 }}>
              <Select>
                <Select.Option value={false}>
                  Tạo riêng thư mục cho từng highlight
                </Select.Option>
                <Select.Option value={true}>
                  Gộp ảnh và video vào chung một thư mục
                </Select.Option>
              </Select>
            </Form.Item>
          ) : null}
          <Form.Item<IFacebookDownloadAllForm>
            label="Tùy chọn cho tiến trình tải:"
            name="waitUntilCompleted"
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
        {downloadType === "ALBUM_BY_ID" ? (
          <img src={AlbumIdExampleImage} alt="" className="mb-6" />
        ) : null}

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
