import { FC, PropsWithChildren } from "react"

import useExtensionState from "src/store/extension-state"
import { cn } from "src/utils/common.util"

interface IPageContainerProps extends PropsWithChildren {
  title?: string
  className?: string
}

const PageContainer: FC<IPageContainerProps> = ({
  children,
  title,
  className
}) => {
  const { extensionState } = useExtensionState()

  return (
    <div
      className={cn(
        "mx-auto container max-w-7xl h-full bg-zinc-50 dark:bg-zinc-900",
        className
      )}>
      {extensionState.isUpdateAvailable ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in-up mb-5">
          <div className="flex flex-col">
            <span className="font-semibold text-lg">
              🚀 Đã có phiên bản mới của Social Downloader!
            </span>
            <span className="text-sm text-white/90">
              Bạn hãy vui lòng tải phiên bản mới nhất về để có những trải nghiệm
              tốt nhất.
            </span>
          </div>
          <a
            href="https://github.com/minhchi1509/social_downloader_extension/?tab=readme-ov-file#c%C3%A0i-%C4%91%E1%BA%B7t"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 bg-white text-blue-600 font-medium px-4 py-2 rounded-xl hover:bg-blue-100 transition flex items-center">
            Cập nhật
          </a>
        </div>
      ) : null}
      {title && <h1 className="text-2xl font-semibold mb-5">{title}</h1>}
      {children}
    </div>
  )
}

export default PageContainer
