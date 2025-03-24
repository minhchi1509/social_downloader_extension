import {
  FacebookIcon,
  InstagramIcon,
  ThreadsIcon,
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
  }
]

const AccountsPage = () => {
  return (
    <PageContainer title="Quản lý tài khoản">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SOCIAL_ACCOUNTS.map((account) => (
          <CardAccount key={account.socialName} {...account} />
        ))}
      </div>
    </PageContainer>
  )
}

export default AccountsPage
