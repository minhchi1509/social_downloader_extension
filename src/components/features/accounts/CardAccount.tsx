import { Avatar, Button, Card } from "antd"
import { ComponentType, FC, SVGProps, useState } from "react"
import { useTranslation } from "react-i18next"

import { CheckCircleIcon } from "src/assets/icons"
import { ESocialProvider } from "src/constants/enum"
import useAuth from "src/store/auth"
import { showErrorToast } from "src/utils/toast.util"

interface ICardAccountProps {
  socialName: ESocialProvider
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const CardAccount: FC<ICardAccountProps> = ({
  socialName,
  icon: SocialIcon
}) => {
  const { logout, authenticate, accounts } = useAuth()
  const { t } = useTranslation()
  const accountDataBySocialName = accounts[socialName]
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true)
      await authenticate(socialName)
    } catch (error) {
      await logout(socialName)
      showErrorToast((error as Error).message)
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <Card className="shadow border rounded-xl">
      <div className="overflow-hidden flex flex-col">
        <div className="flex flex-row items-center gap-4 pb-2 space-y-0">
          <SocialIcon className="size-12" />
          <div>
            <h3 className="font-bold text-lg">{socialName}</h3>
            {accountDataBySocialName && (
              <div className="flex items-center text-xs text-green-600 font-semibold">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                {t("status.authenticated")}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          {accountDataBySocialName ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <Avatar
                size={40}
                src={accountDataBySocialName.avatar}
                className="cursor-pointer"
              />
              <div className="flex flex-col">
                <p>
                  <span className="font-bold">{t("account_info.id")}</span>:{" "}
                  {accountDataBySocialName.id}
                </p>
                <p>
                  <span className="font-bold">{t("account_info.name")}</span>:{" "}
                  {accountDataBySocialName.username}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center">
              <p className="text-gray-500 text-sm text-center">
                {t("status.not_authenticated")}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6">
          <Button
            onClick={handleAuthenticate}
            className="w-full"
            type="primary"
            loading={isAuthenticating}>
            {accountDataBySocialName
              ? t("actions.authenticate_again")
              : t("actions.authenticate")}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default CardAccount
