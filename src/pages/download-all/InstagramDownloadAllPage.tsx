import IgDownloadAllForm from "src/components/features/download-all/instagram/IgDownloadAllForm"
import { Card, CardContent } from "src/components/shared/Card"
import PageContainer from "src/components/shared/PageContainer"

const InstagramDownloadAllPage = () => {
  return (
    <PageContainer
      title="Tải xuống hàng loạt Instagram"
      className="flex flex-col">
      <Card className="bg-white flex-1">
        <CardContent className="p-6">
          <IgDownloadAllForm />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default InstagramDownloadAllPage
