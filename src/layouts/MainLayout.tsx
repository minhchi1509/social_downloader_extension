import { Layout } from "antd"
import { Outlet } from "react-router-dom"

import InitializeApp from "src/components/InitializeApp"
import Footer from "src/layouts/Footer"
import Sidebar from "src/layouts/sidebar/Sidebar"

const { Content, Footer: AntdFooter } = Layout

const MainLayout = () => {
  return (
    <InitializeApp>
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar />
        <Layout>
          <Content
            style={{
              padding: 24,
              paddingBottom: 24
            }}
            className="bg-zinc-50 dark:bg-zinc-900">
            <Outlet />
          </Content>
          <AntdFooter
            style={{ paddingTop: 0, paddingBottom: 8 }}
            className="bg-zinc-50 dark:bg-zinc-900">
            <Footer />
          </AntdFooter>
        </Layout>
      </Layout>
    </InitializeApp>
  )
}

export default MainLayout
