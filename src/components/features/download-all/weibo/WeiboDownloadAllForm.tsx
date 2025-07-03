import { Button, Form, Input, Select, Table, TableColumnsType, Tag } from "antd"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"

import { ESocialProvider } from "src/constants/enum"
import {
  DOWNLOAD_TYPE_TAG_COLOR,
  getWeiboDownloadAllTypeOptions,
  PROCESS_STATUS_TAG_COLOR
} from "src/constants/variables"
import useDownloadWeiboMedia from "src/hooks/weibo/useDownloadWeiboMedia"
import {
  IDownloadProcessDetail,
  TProcessStatus,
  TWeiboDownloadAllType
} from "src/interfaces/download-process.interface"
import { IWeiboDownloadAllForm } from "src/interfaces/form.interface"
import useDownloadProcesses from "src/store/download-process"
import { isVerifyAccount } from "src/utils/common.util"
import { showErrorToast } from "src/utils/toast.util"

const WeiboDownloadAllForm = () => {
  const { t } = useTranslation()
  const { removeProcess, addProcess, getDownloadProcessBySocial } =
    useDownloadProcesses()
  const [form] = Form.useForm<IWeiboDownloadAllForm>()
  const { startDownloadAllMedia } = useDownloadWeiboMedia()

  const weiboDownloadProcesses = getDownloadProcessBySocial(
    ESocialProvider.WEIBO
  )

  const handleSubmit = async (values: IWeiboDownloadAllForm) => {
    try {
      if (!isVerifyAccount(ESocialProvider.WEIBO)) {
        throw new Error(t("alerts.authenticate_weibo"))
      }
      const processId = uuidv4()
      addProcess(ESocialProvider.WEIBO, {
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
    IDownloadProcessDetail<TWeiboDownloadAllType>
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
        render: (downloadType: TWeiboDownloadAllType) => (
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
        render: (record: IDownloadProcessDetail<TWeiboDownloadAllType>) =>
          record.status === "RUNNING" ? (
            <Button
              type="primary"
              danger
              onClick={() => removeProcess(ESocialProvider.WEIBO, record.id)}>
              {t("actions.cancel")}
            </Button>
          ) : null
      }
    ],
    [t]
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
          <Form.Item<IWeiboDownloadAllForm>
            label={t("form_labels.download_type")}
            name="type"
            rules={[
              {
                required: true,
                message: t("form_placeholders.select_download_type")
              }
            ]}
            initialValue="MEDIA"
            style={{ flex: 1 }}>
            <Select>
              {getWeiboDownloadAllTypeOptions(t).map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IWeiboDownloadAllForm>
            label="User ID:"
            name="username"
            rules={[
              { required: true, message: t("form_placeholders.enter_username") }
            ]}
            style={{ flex: 1 }}>
            <Input />
          </Form.Item>
        </div>
        <div className="flex gap-3 items-center">
          <Form.Item<IWeiboDownloadAllForm>
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
          <Form.Item<IWeiboDownloadAllForm>
            label={t("form_labels.delay_options")}
            name="waitUntilCompleted"
            initialValue={true}
            style={{ flex: 8 }}>
            <Select>
              <Select.Option value={true}>
                {t("download_options.wait_until_completed")}
              </Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit">
            {t("actions.download")}
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={tableColumns}
        dataSource={weiboDownloadProcesses}
        pagination={{
          pageSize: 5
        }}
      />
    </div>
  )
}

export default WeiboDownloadAllForm
