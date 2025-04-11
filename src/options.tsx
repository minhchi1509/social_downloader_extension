import { StyleProvider } from "@ant-design/cssinjs"
import { theme as AntdTheme, ConfigProvider } from "antd"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"

import "./style.css"

import AppRoutes from "src/routes/AppRoutes"
import useExtensionState from "src/store/extension-state"

const Options = () => {
  const {
    extensionState: { theme }
  } = useExtensionState()
  return (
    <MemoryRouter>
      <ConfigProvider
        theme={{
          algorithm:
            theme === "light"
              ? AntdTheme.defaultAlgorithm
              : AntdTheme.darkAlgorithm
        }}>
        <StyleProvider hashPriority="high">
          <AppRoutes />
          <Toaster />
        </StyleProvider>
      </ConfigProvider>
    </MemoryRouter>
  )
}

export default Options
