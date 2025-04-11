import { Layout, Menu, MenuProps } from "antd"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"

import "./Sidebar.scss"

import {
  DownloadIcon,
  FacebookIcon,
  InstagramIcon,
  LogoIcon,
  SettingIcon,
  ThreadsIcon,
  UserIcon,
  XIcon
} from "src/assets/icons"
import { APP_ROUTES } from "src/constants/route"

const { Sider } = Layout

type MenuItem = Required<MenuProps>["items"][number]

const menuItems: MenuItem[] = [
  {
    key: "download_all",
    icon: <DownloadIcon className="size-4" />,
    label: "Tải hàng loạt",
    children: [
      {
        key: APP_ROUTES.DOWNLOAD_ALL.FACEBOOK,
        icon: <FacebookIcon className="size-4" />,
        label: <Link to={APP_ROUTES.DOWNLOAD_ALL.FACEBOOK}>Facebook</Link>
      },
      {
        key: APP_ROUTES.DOWNLOAD_ALL.INSTAGRAM,
        icon: <InstagramIcon className="size-4" />,
        label: <Link to={APP_ROUTES.DOWNLOAD_ALL.INSTAGRAM}>Instagram</Link>
      },
      {
        key: APP_ROUTES.DOWNLOAD_ALL.THREADS,
        icon: <ThreadsIcon className="size-4" />,
        label: <Link to={APP_ROUTES.DOWNLOAD_ALL.THREADS}>Threads</Link>
      },
      {
        key: APP_ROUTES.DOWNLOAD_ALL.X,
        icon: <XIcon className="size-4" />,
        label: <Link to={APP_ROUTES.DOWNLOAD_ALL.X}>X</Link>
      }
    ]
  },
  {
    key: APP_ROUTES.DOWNLOAD_SEPERATE,
    icon: <DownloadIcon className="size-4" />,
    label: <Link to={APP_ROUTES.DOWNLOAD_SEPERATE}>Tải riêng lẻ</Link>
  },
  {
    key: APP_ROUTES.ACCOUNTS, // Đặt key là pathname của trang tài khoản
    icon: <UserIcon className="size-4" />,
    label: <Link to={APP_ROUTES.ACCOUNTS}>Tài Khoản</Link>
  },
  {
    key: APP_ROUTES.SETTINGS,
    icon: <SettingIcon className="size-4" />,
    label: <Link to={APP_ROUTES.SETTINGS}>Cài đặt</Link>
  }
]

const Sidebar = () => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      theme="light"
      collapsedWidth={64}
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        overflow: "auto",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
      }}
      width={256}>
      <div className="p-4 flex items-center gap-3">
        <LogoIcon className="size-10" />
        {!collapsed && <p className="font-bold text-lg">Social Downloader</p>}
      </div>

      <Menu
        className="SidebarMenu"
        mode="inline"
        defaultOpenKeys={["download_all"]}
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{
          paddingLeft: "8px",
          borderRight: "none",
          paddingRight: "8px"
        }}
      />
    </Sider>
  )
}

export default Sidebar
