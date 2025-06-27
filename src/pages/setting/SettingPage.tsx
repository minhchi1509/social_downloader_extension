import { useTranslation } from "react-i18next"

import LanguageDropdownSelect from "src/components/shared/LanguageDropdownSelect"
import PageContainer from "src/components/shared/PageContainer"
import ThemeSwitcher from "src/components/shared/ThemeSwitcher"

const SettingPage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer
      title={t("page_titles.settings")}
      className="flex flex-col gap-4">
      <ThemeSwitcher />
      <LanguageDropdownSelect />
    </PageContainer>
  )
}

export default SettingPage
