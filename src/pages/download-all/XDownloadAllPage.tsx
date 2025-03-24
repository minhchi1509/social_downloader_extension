import XDownloadAllForm from "src/components/features/download-all/x/XDownloadAllForm"
import { Card, CardContent } from "src/components/shared/Card"
import PageContainer from "src/components/shared/PageContainer"

const XDownloadAllPage = () => {
  return (
    <PageContainer title="Tải xuống hàng loạt X" className="flex flex-col">
      <Card className="bg-white flex-1">
        <CardContent className="p-6">
          <XDownloadAllForm />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default XDownloadAllPage
