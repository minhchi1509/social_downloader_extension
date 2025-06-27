import { Card, Switch } from "antd"
import { useTranslation } from "react-i18next"

import { ThemeModeIcon } from "src/assets/icons"
import { TTheme } from "src/interfaces/common.interface"
import useExtensionState from "src/store/extension-state"

const ThemeSwitcher = () => {
  const { t } = useTranslation()
  const {
    extensionState: { theme },
    setTheme
  } = useExtensionState()

  const handleThemeChange = async (isChecked: boolean) => {
    const newTheme: TTheme = isChecked ? "dark" : "light"
    await setTheme(newTheme)
  }

  return (
    <Card className="shadow border rounded-xl">
      <div className="flex items-center">
        <div className="flex flex-1 gap-2 items-center">
          <ThemeModeIcon className="size-8" />
          <p>{t("account_info.dark_mode")}</p>
        </div>
        <Switch checked={theme === "dark"} onChange={handleThemeChange} />
      </div>
    </Card>
  )
}

export default ThemeSwitcher
