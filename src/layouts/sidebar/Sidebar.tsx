import { Layout, Menu, MenuProps, Tag } from "antd"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"

import "./Sidebar.scss"

import {
  Download2Icon,
  DownloadIcon,
  FacebookIcon,
  InstagramIcon,
  LogoIcon,
  SettingIcon,
  ThreadsIcon,
  UserIcon,
  WeiboIcon,
  XIcon
} from "src/assets/icons"
import { APP_ROUTES } from "src/constants/route"

const { Sider } = Layout

type MenuItem = Required<MenuProps>["items"][number]

const Sidebar = () => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const { t } = useTranslation()

  const menuItems: MenuItem[] = [
    {
      key: "download_all",
      icon: <DownloadIcon className="size-4" />,
      label: t("sidebar.download_all"),
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
        },
        {
          key: APP_ROUTES.DOWNLOAD_ALL.WEIBO,
          icon: <WeiboIcon className="size-4" />,
          label: (
            <Link
              to={APP_ROUTES.DOWNLOAD_ALL.WEIBO}
              className="flex gap-2 items-center">
              Weibo
              <Tag color="cyan" className="!text-xs !mr-0">
                {t("tags.experimental")}
              </Tag>
            </Link>
          )
        }
      ]
    },
    {
      key: APP_ROUTES.DOWNLOAD_SEPERATE,
      icon: <Download2Icon className="size-4" />,
      label: (
        <Link to={APP_ROUTES.DOWNLOAD_SEPERATE}>
          {t("sidebar.download_separate")}
        </Link>
      )
    },
    {
      key: APP_ROUTES.ACCOUNTS,
      icon: <UserIcon className="size-4" />,
      label: <Link to={APP_ROUTES.ACCOUNTS}>{t("sidebar.accounts")}</Link>
    },
    {
      key: APP_ROUTES.SETTINGS,
      icon: <SettingIcon className="size-4" />,
      label: <Link to={APP_ROUTES.SETTINGS}>{t("sidebar.settings")}</Link>
    }
  ]

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
        {!collapsed && (
          <p className="font-bold text-lg">{t("sidebar.social_downloader")}</p>
        )}
      </div>

      <Menu
        mode="inline"
        defaultOpenKeys={["download_all"]}
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{
          paddingLeft: "8px",
          borderRight: "none",
          paddingRight: "8px"
        }}
        rootClassName="SidebarMenuRoot"
      />
    </Sider>
  )
}

export default Sidebar
