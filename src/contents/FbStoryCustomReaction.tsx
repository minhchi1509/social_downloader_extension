import { StyleProvider } from "@ant-design/cssinjs"
import { Button, ConfigProvider, Popover, theme } from "antd"
import cssText from "data-text:./fb-story-custom-reaction.scss"
import antdResetCssText from "data-text:antd/dist/reset.css"
import globalCssText from "data-text:src/style.css"
import { PlasmoCSConfig, PlasmoCSUIJSXContainer, PlasmoRender } from "plasmo"
import { useState } from "react"
import { createRoot } from "react-dom/client"

import { MoreIcon } from "src/assets/icons"
import CustomReactionBox from "src/components/contents/CustomReactionBox"

import "src/components/contents/ContentToaster"

export const config: PlasmoCSConfig = {
  matches: ["https://www.facebook.com/*"],
  all_frames: true
}

const CONTAINER_ID = "engage-csui-container"

const createStyle = () => {
  const baseFontSize = 16

  let updatedCssText = globalCssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize
    return `${pixelsValue}px`
  })

  const combinedCss = updatedCssText + antdResetCssText + cssText
  const styleElement = document.createElement("style")
  styleElement.id = "engage-csui-style"
  styleElement.textContent = combinedCss
  document.head.appendChild(styleElement)
}

let root: ReturnType<typeof createRoot> | null = null

const renderComponent = (container: HTMLElement) => {
  root = createRoot(container)
  root.render(<FbStoryCustomReaction />)
}

export const getRootContainer = () =>
  new Promise((resolve) => {
    const checkAndResolve = () => {
      const targetElement = document.querySelector(
        "div.x11lhmoz.x78zum5.x1q0g3np.xsdox4t.xbudbmw.x10l6tqk.xwa60dl.xl56j7k.xtuxyv6"
      )
      const existingContainer = document.getElementById(CONTAINER_ID)

      if (targetElement && !existingContainer) {
        createStyle()
        const container = document.createElement("div")
        container.id = CONTAINER_ID
        targetElement.appendChild(container)
        renderComponent(container)
        resolve(container)
      }

      if (!targetElement && existingContainer) {
        root?.unmount()
        existingContainer.remove()
        document.getElementById("engage-csui-style")?.remove()
      }
    }

    const observer = new MutationObserver(checkAndResolve)
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    checkAndResolve()
  })

const FbStoryCustomReaction = () => {
  const [openPopover, setOpenPopover] = useState(false)

  const isStoryPaused = () => {
    const svgPath = document.querySelector(
      'svg path[d="m18.477 12.906-9.711 5.919A1.148 1.148 0 0 1 7 17.919V6.081a1.148 1.148 0 0 1 1.766-.906l9.711 5.919a1.046 1.046 0 0 1 0 1.812z"]'
    )
    return svgPath ? true : false
  }

  const getToggleStoryButtonState = () =>
    document.querySelector(
      'div.x1i10hfl.xjbqb8w.x1ejq31n.x18oe1m7.x1sy0etr.xstzfhl.x972fbf.x10w94by.x1qhh985.x14e42zd.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x14z9mp.xat24cr.x1lziwak.xexx8yu.xyri2b.x18d9i69.x1c1uobl.x16tdsg8.x1hl2dhg.xggy1nq.x1fmog5m.xu25z0z.x140muxe.xo1y3bh.x1n2onr6.x87ps6o.x1lku1pv.x1a2a7pz[role="button"] div.x1ypdohk.xdj266r.x2fvf9.xat24cr.xdwrcjd'
    ) as HTMLButtonElement

  const handleOpenChange = (newOpen: boolean) => {
    setOpenPopover(newOpen)
    if (newOpen) {
      if (!isStoryPaused()) {
        getToggleStoryButtonState()?.click()
      }
    } else {
      if (isStoryPaused()) {
        getToggleStoryButtonState()?.click()
      }
    }
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm
      }}>
      <StyleProvider hashPriority="high">
        <Popover
          content={<CustomReactionBox />}
          open={openPopover}
          onOpenChange={handleOpenChange}
          trigger="hover">
          <div className="h-full flex items-center justify-center">
            <Button
              shape="circle"
              icon={<MoreIcon className="w-5 h-5" />}
              className="w-10 h-10"
            />
          </div>
        </Popover>
      </StyleProvider>
    </ConfigProvider>
  )
}

export const render: PlasmoRender<PlasmoCSUIJSXContainer> = async ({
  createRootContainer
}) => {
  await createRootContainer?.()
}

export default FbStoryCustomReaction
