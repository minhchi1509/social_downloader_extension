import { Typography } from "antd"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { APP_ROUTES } from "src/constants/route"

const Footer = () => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-1 mx-auto items-center justify-center">
      <Typography>
        {t("footer.made_by")} <span className="font-bold">minhchi1509.</span>
      </Typography>
      <div className="flex gap-1">
        <p>{t("footer.useful_extension")}</p>
        <Link to={APP_ROUTES.SUPPORT_ME}>
          <a href="">{t("footer.here")}</a>
        </Link>
      </div>
    </div>
  )
}

export default Footer
