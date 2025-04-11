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
        "div.x11lhmoz.x78zum5.x1q0g3np.xsdox4t.x10l6tqk.xtzzx4i.xwa60dl.xl56j7k.xtuxyv6 div.x78zum5.xl56j7k"
      )
      const existingContainer = document.getElementById(CONTAINER_ID)

      if (targetElement && !existingContainer) {
        createStyle()
        const container = document.createElement("div")
        container.id = CONTAINER_ID
        targetElement.insertAdjacentElement("afterend", container)
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
      'div.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj div.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1o1ewxj.x3x9cwd.x1e5q0jg.x13rtm0m.x1n2onr6.x87ps6o.x1lku1pv.x1a2a7pz[role="button"]'
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
