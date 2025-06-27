import { Card } from "antd"
import { useTranslation } from "react-i18next"

import DownloadSeperateForm from "src/components/features/download-seperate/DownloadSeperateForm"
import PageContainer from "src/components/shared/PageContainer"

const DownloadSeperatePage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer
      title={t("page_titles.download_separate")}
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <DownloadSeperateForm />
      </Card>
    </PageContainer>
  )
}

export default DownloadSeperatePage
