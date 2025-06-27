import { Card } from "antd"
import { useTranslation } from "react-i18next"

import ThreadsDownloadAllForm from "src/components/features/download-all/threads/ThreadsDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const ThreadsDownloadAllPage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer
      title={t("page_titles.threads_download_all")}
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <ThreadsDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default ThreadsDownloadAllPage
