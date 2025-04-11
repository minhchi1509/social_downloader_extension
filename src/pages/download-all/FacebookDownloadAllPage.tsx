import { Card } from "antd"

import FacebookDownloadAllForm from "src/components/features/download-all/facebook/FacebookDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const FacebookDownloadAllPage = () => {
  return (
    <PageContainer
      title="Tải xuống hàng loạt Facebook"
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <FacebookDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default FacebookDownloadAllPage
