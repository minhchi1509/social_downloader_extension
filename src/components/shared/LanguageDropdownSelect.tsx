import { Card, Select } from "antd"
import { useTranslation } from "react-i18next"

import { EnglandFlagIcon, GlobalIcon, VietnamFlagIcon } from "src/assets/icons"
import { ELocales } from "src/constants/enum"

const LanguageDropdownSelect = () => {
  const { t, i18n } = useTranslation()

  return (
    <Card className="shadow border rounded-xl">
      <div className="flex items-center">
        <div className="flex flex-1 gap-2 items-center">
          <GlobalIcon className="size-8" />
          <p>{t("language.title")}</p>
        </div>
        <Select
          style={{ width: 150 }}
          value={localStorage.getItem("i18nextLng")}
          options={[
            {
              value: ELocales.ENGLISH,
              label: (
                <div className="flex items-center gap-2">
                  <EnglandFlagIcon className="size-5" />
                  {t("language.english")}
                </div>
              )
            },
            {
              value: ELocales.VIETNAMESE,
              label: (
                <div className="flex items-center gap-2">
                  <VietnamFlagIcon className="size-5" />
                  {t("language.vietnamese")}
                </div>
              )
            }
          ]}
          onChange={(value) => i18n.changeLanguage(value)}
        />
      </div>
    </Card>
  )
}

export default LanguageDropdownSelect
