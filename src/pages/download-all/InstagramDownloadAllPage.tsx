import { Card } from "antd"

import IgDownloadAllForm from "src/components/features/download-all/instagram/IgDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const InstagramDownloadAllPage = () => {
  return (
    <PageContainer
      title="Tải xuống hàng loạt Instagram"
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <IgDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default InstagramDownloadAllPage
