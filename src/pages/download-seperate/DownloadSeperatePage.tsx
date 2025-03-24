import DownloadSeperateForm from "src/components/features/download-seperate/DownloadSeperateForm"
import { Card, CardContent } from "src/components/shared/Card"
import PageContainer from "src/components/shared/PageContainer"

const DownloadSeperatePage = () => {
  return (
    <PageContainer title="Tải xuống riêng lẻ" className="flex flex-col">
      <Card className="bg-white flex-1">
        <CardContent className="p-6">
          <DownloadSeperateForm />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default DownloadSeperatePage
