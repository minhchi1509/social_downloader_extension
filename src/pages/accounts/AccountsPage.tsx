import { useTranslation } from "react-i18next"

import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
  WeiboIcon,
  XIcon
} from "src/assets/icons"
import CardAccount from "src/components/features/accounts/CardAccount"
import PageContainer from "src/components/shared/PageContainer"
import { ESocialProvider } from "src/constants/enum"

const SOCIAL_ACCOUNTS = [
  {
    socialName: ESocialProvider.FACEBOOK,
    icon: FacebookIcon
  },
  {
    socialName: ESocialProvider.INSTAGRAM,
    icon: InstagramIcon
  },
  {
    socialName: ESocialProvider.THREADS,
    icon: ThreadsIcon
  },
  {
    socialName: ESocialProvider.X,
    icon: XIcon
  },
  {
    socialName: ESocialProvider.WEIBO,
    icon: WeiboIcon
  }
]

const AccountsPage = () => {
  const { t } = useTranslation()

  return (
    <PageContainer title={t("page_titles.accounts")}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SOCIAL_ACCOUNTS.map((account) => (
          <CardAccount key={account.socialName} {...account} />
        ))}
      </div>
    </PageContainer>
  )
}

export default AccountsPage
