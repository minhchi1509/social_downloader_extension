import { Card } from "antd"

import XDownloadAllForm from "src/components/features/download-all/x/XDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const XDownloadAllPage = () => {
  return (
    <PageContainer title="Tải xuống hàng loạt X" className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <XDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default XDownloadAllPage
