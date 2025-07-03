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
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"

import { AlbumIdExampleImage } from "src/assets/images"
import { ESocialProvider } from "src/constants/enum"
import { APP_ROUTES } from "src/constants/route"
import {
  DOWNLOAD_TYPE_TAG_COLOR,
  getFbDownloadAllTypeOptions,
  PROCESS_STATUS_TAG_COLOR
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
  const { t } = useTranslation()
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
        throw new Error(t("alerts.authenticate_facebook"))
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
        title: t("table_headers.id"),
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
        render: (record: IDownloadProcessDetail<TFacebookDownloadAllType>) =>
          record.status === "RUNNING" ? (
            <Button
              type="primary"
              danger
              onClick={() =>
                removeProcess(ESocialProvider.FACEBOOK, record.id)
              }>
              {t("actions.cancel")}
            </Button>
          ) : null
      }
    ],
    [t]
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
            {t("alerts.authenticate_facebook")} (
            <span>
              <Link to={APP_ROUTES.ACCOUNTS}>{t("alerts.here")}</Link>
            </span>
            )
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
            label={t("form_labels.target")}
            name="target"
            rules={[
              {
                required: true,
                message: t("form_placeholders.select_target")
              }
            ]}
            style={{ flex: 1 }}>
            <Select>
              <Select.Option value="PROFILE">
                {t("download_targets.profile")}
              </Select.Option>
              <Select.Option value="GROUP">
                {t("download_targets.group")}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item<IFacebookDownloadAllForm>
            label={t("form_labels.download_type")}
            name="type"
            rules={[
              {
                required: true,
                message: t("form_placeholders.select_download_type")
              }
            ]}
            style={{ flex: 1 }}>
            <Select>
              {getFbDownloadAllTypeOptions()[target]?.map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IFacebookDownloadAllForm>
            label={
              downloadType === "ALBUM_BY_ID"
                ? t("form_labels.album_id")
                : target === "PROFILE"
                  ? t("form_labels.id_username")
                  : t("table_headers.id")
            }
            name="username"
            rules={[
              {
                required: true,
                message: `${downloadType === "ALBUM_BY_ID" ? t("form_placeholders.enter_album_id") : target === "PROFILE" ? t("form_placeholders.enter_username") : t("form_placeholders.select_target")}!`
              }
            ]}
            style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>
        <div className="flex gap-3 items-center">
          {downloadType === "HIGHLIGHT" ? (
            <Form.Item<IFacebookDownloadAllForm>
              label={t("form_labels.download_options")}
              name="isMergeIntoOneFolder"
              initialValue={false}
              style={{ flex: 8 }}>
              <Select>
                <Select.Option value={false}>
                  {t("download_options.separate_folders")}
                </Select.Option>
                <Select.Option value={true}>
                  {t("download_options.merge_into_one")}
                </Select.Option>
              </Select>
            </Form.Item>
          ) : null}
          <Form.Item<IFacebookDownloadAllForm>
            label={t("form_labels.delay_options")}
            name="waitUntilCompleted"
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
            <Form.Item<IFacebookDownloadAllForm>
              label={t("form_labels.delay_time")}
              name="delayTimeInSecond"
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
        {downloadType === "ALBUM_BY_ID" ? (
          <img src={AlbumIdExampleImage} alt="" className="mb-6" />
        ) : null}

        <Form.Item wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {t("actions.download")}
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
