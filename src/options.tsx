import { StyleProvider } from "@ant-design/cssinjs"
import { ConfigProvider } from "antd"
import { MemoryRouter } from "react-router-dom"
import { Toaster } from "sonner"

import "./style.css"

import AppRoutes from "src/routes/AppRoutes"

const Options = () => {
  return (
    <MemoryRouter>
      <ConfigProvider>
        <StyleProvider hashPriority="high">
          <AppRoutes />
          <Toaster />
        </StyleProvider>
      </ConfigProvider>
    </MemoryRouter>
  )
}

export default Options
