import { Card } from "antd"

import ThreadsDownloadAllForm from "src/components/features/download-all/threads/ThreadsDownloadAllForm"
import PageContainer from "src/components/shared/PageContainer"

const ThreadsDownloadAllPage = () => {
  return (
    <PageContainer
      title="Tải xuống hàng loạt Threads"
      className="flex flex-col">
      <Card className="flex-1 shadow border rounded-xl">
        <ThreadsDownloadAllForm />
      </Card>
    </PageContainer>
  )
}

export default ThreadsDownloadAllPage
