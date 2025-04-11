import { Card } from "antd"

import DownloadSeperateForm from "src/components/features/download-seperate/DownloadSeperateForm"
import PageContainer from "src/components/shared/PageContainer"

const DownloadSeperatePage = () => {
  return (
    <PageContainer title="Tải xuống riêng lẻ" className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <DownloadSeperateForm />
      </Card>
    </PageContainer>
  )
}

export default DownloadSeperatePage
