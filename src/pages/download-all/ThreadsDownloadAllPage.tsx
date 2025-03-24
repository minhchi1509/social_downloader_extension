import ThreadsDownloadAllForm from "src/components/features/download-all/threads/ThreadsDownloadAllForm"
import { Card, CardContent } from "src/components/shared/Card"
import PageContainer from "src/components/shared/PageContainer"

const ThreadsDownloadAllPage = () => {
  return (
    <PageContainer
      title="Tải xuống hàng loạt Threads"
      className="flex flex-col">
      <Card className="bg-white flex-1">
        <CardContent className="p-6">
          <ThreadsDownloadAllForm />
        </CardContent>
      </Card>
    </PageContainer>
  )
}

export default ThreadsDownloadAllPage
