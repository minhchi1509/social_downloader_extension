import { Card } from "antd"
import { useTranslation } from "react-i18next"

import WeiboDownloadAllForm from "src/components/features/download-all/weibo/WeiboDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const WeiboDownloadAllPage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer
      title={t("page_titles.weibo_download_all")}
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <WeiboDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default WeiboDownloadAllPage
