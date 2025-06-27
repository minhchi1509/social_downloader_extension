import { Card } from "antd"
import { useTranslation } from "react-i18next"

import XDownloadAllForm from "src/components/features/download-all/x/XDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const XDownloadAllPage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer
      title={t("page_titles.x_download_all")}
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <XDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default XDownloadAllPage
