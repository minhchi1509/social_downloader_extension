import FacebookDownloadAllForm from "src/components/features/download-all/facebook/FacebookDownloadAllForm"
import { Card, CardContent } from "src/components/shared/Card"
import PageContainer from "src/components/shared/PageContainer"

const FacebookDownloadAllPage = () => {
  return (
    <PageContainer
      title="Tải xuống hàng loạt Facebook"
      className="flex flex-col">
      <Card className="bg-white flex-1">
        <CardContent className="p-6">
          <FacebookDownloadAllForm />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default FacebookDownloadAllPage
