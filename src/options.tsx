import { StyleProvider } from "@ant-design/cssinjs"
import { theme as AntdTheme, ConfigProvider } from "antd"
import { I18nextProvider } from "react-i18next"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"

import "./style.css"

import AppRoutes from "src/routes/AppRoutes"
import useExtensionState from "src/store/extension-state"

import i18next from "./i18n"

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
        <I18nextProvider i18n={i18next}>
          <StyleProvider hashPriority="high">
            <AppRoutes />
            <Toaster />
          </StyleProvider>
        </I18nextProvider>
      </ConfigProvider>
    </MemoryRouter>
  )
}

export default Options
