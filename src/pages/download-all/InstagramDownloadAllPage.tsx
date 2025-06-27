import { Card } from "antd"
import { useTranslation } from "react-i18next"

import IgDownloadAllForm from "src/components/features/download-all/instagram/IgDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const InstagramDownloadAllPage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer
      title={t("page_titles.instagram_download_all")}
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <IgDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default InstagramDownloadAllPage
