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
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

import { ESocialProvider } from "src/constants/enum"
import { APP_ROUTES } from "src/constants/route"
import {
  DOWNLOAD_TYPE_TAG_COLOR,
  getIgDownloadAllTypeOptions,
  PROCESS_STATUS_TAG_COLOR
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
  const { t } = useTranslation()
  const { getDownloadProcessBySocial, removeProcess, addProcess } =
    useDownloadProcess()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm<IIgDownloadAllForm>()
  const downloadType = Form.useWatch("type", form)
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
        throw new Error(t("alerts.authenticate_instagram"))
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
        title: t("table_headers.no"),
        dataIndex: "ordinalNumber",
        key: "ordinalNumber",
        width: 70,
        render: (_, __, index) => index + 1
      },
      {
        title: t("table_headers.download_type"),
        dataIndex: "downloadType",
        key: "downloadType",
        render: (downloadType: TIgDownloadAllType) => (
          <Tag color={DOWNLOAD_TYPE_TAG_COLOR[downloadType]}>
            {downloadType}
          </Tag>
        )
      },
      {
        title: t("table_headers.username"),
        dataIndex: "username",
        key: "username",
        render: (username: string) => (
          <p className="font-bold text-blue-700">{username}</p>
        )
      },
      {
        title: t("table_headers.downloaded_count"),
        dataIndex: "totalDownloadedItems",
        key: "totalDownloadedItems"
      },
      {
        title: t("table_headers.status"),
        dataIndex: "status",
        key: "status",
        render: (status: TProcessStatus) => (
          <Tag color={PROCESS_STATUS_TAG_COLOR[status]}>
            {t(
              `status.${status === "RUNNING" ? "running" : status === "COMPLETED" ? "completed" : "failed"}`
            )}
          </Tag>
        )
      },
      {
        title: t("table_headers.actions"),
        key: "action",
        render: (record: IDownloadProcessDetail<TIgDownloadAllType>) =>
          record.status === "RUNNING" ? (
            <Button
              type="primary"
              danger
              onClick={() =>
                removeProcess(ESocialProvider.INSTAGRAM, record.id)
              }>
              {t("actions.cancel")}
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
            {t("alerts.authenticate_instagram")}{" "}
            <span>
              <Link to={APP_ROUTES.ACCOUNTS}>{t("alerts.here")}</Link>
            </span>
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
            label={t("form_labels.download_type")}
            name="type"
            rules={[
              {
                required: true,
                message: t("form_placeholders.select_download_type")
              }
            ]}
            style={{ flex: 4 }}>
            <Select>
              {getIgDownloadAllTypeOptions(t).map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IIgDownloadAllForm>
            label={t("form_labels.username")}
            name="username"
            rules={[
              { required: true, message: t("form_placeholders.enter_username") }
            ]}
            style={{ flex: 4 }}>
            <Input />
          </Form.Item>
        </div>
        <div className="flex gap-3 items-center">
          {downloadType === "POST" || downloadType === "HIGHLIGHT" ? (
            <Form.Item<IIgDownloadAllForm>
              label={t("form_labels.download_options")}
              name="isMergeIntoOneFolder"
              initialValue={false}
              style={{ flex: 8 }}>
              <Select>
                <Select.Option value={false}>
                  {t("download_options.separate_folders")}{" "}
                  {downloadType === "POST"
                    ? t("download_types.instagram.post_type")
                    : t("download_types.instagram.highlight_type")}
                </Select.Option>
                <Select.Option value={true}>
                  {t("download_options.merge_into_one")}
                </Select.Option>
              </Select>
            </Form.Item>
          ) : null}
          <Form.Item<IIgDownloadAllForm>
            label={t("form_labels.delay_options")}
            name="waitUntilCompleted"
            initialValue={true}
            style={{ flex: 8 }}>
            <Select>
              <Select.Option value={true}>
                {t("download_options.wait_until_completed")}
              </Select.Option>
              <Select.Option value={false}>
                {t("download_options.set_delay")}
              </Select.Option>
            </Select>
          </Form.Item>
          {!isWaitUntilCompleted ? (
            <Form.Item<IIgDownloadAllForm>
              label={t("form_labels.delay_time")}
              name="delayTimeInSecond"
              initialValue={0}
              style={{ flex: 3 }}>
              <InputNumber
                min={0}
                addonAfter={t("time_units.seconds")}
                style={{
                  width: "100%"
                }}
              />
            </Form.Item>
          ) : null}
        </div>

        <Form.Item wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {t("actions.download")}
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
