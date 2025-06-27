import { Card } from "antd"
import { useTranslation } from "react-i18next"

import FacebookDownloadAllForm from "src/components/features/download-all/facebook/FacebookDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const FacebookDownloadAllPage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer
      title={t("page_titles.facebook_download_all")}
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <FacebookDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default FacebookDownloadAllPage
