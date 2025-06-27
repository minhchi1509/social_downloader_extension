import { FC, PropsWithChildren } from "react"

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
  return (
    <div
      className={cn(
        "mx-auto container max-w-7xl h-full bg-zinc-50 dark:bg-zinc-900",
        className
      )}>
      {title && <h1 className="text-2xl font-semibold mb-5">{title}</h1>}
      {children}
    </div>
  )
}

export default PageContainer
