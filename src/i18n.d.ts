import "i18next"

import appLanguage from "./i18n/locales/en/app.json"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: ["app"]
    resources: {
      app: typeof appLanguage
    }
  }
}
