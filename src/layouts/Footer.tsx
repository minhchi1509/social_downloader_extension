import { Typography } from "antd"
import { useTranslation } from "react-i18next"

import { FacebookIcon, GithubIcon } from "src/assets/icons"

const Footer = () => {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 mx-auto items-center justify-center">
      <Typography>
        {t("footer.made_by")} <span className="font-bold">minhchi1509</span>
      </Typography>
      <div className="flex gap-1 items-center">
        <a
          className="text-inherit"
          href="https://github.com/minhchi1509/social_downloader_extension"
          target="_blank">
          <GithubIcon className="size-6" />
        </a>
        <a href="https://facebook.com/minhchi1509" target="_blank">
          <FacebookIcon className="size-6" />
        </a>
      </div>
    </div>
  )
}

export default Footer
