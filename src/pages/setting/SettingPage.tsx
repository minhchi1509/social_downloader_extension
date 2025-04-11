import PageContainer from "src/components/shared/PageContainer"
import ThemeSwitcher from "src/components/shared/ThemeSwitcher"

const SettingPage = () => {
  return (
    <PageContainer title="Cài đặt" className="flex flex-col">
      <ThemeSwitcher />
    </PageContainer>
  )
}

export default SettingPage
