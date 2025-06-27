import i18next, { Resource } from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import { ELanguageNamespaces, ELocales } from "src/constants/enum"

import enApp from "./locales/en/app.json"
import viApp from "./locales/vi/app.json"

const resources: Resource = {
  [ELocales.VIETNAMESE]: {
    [ELanguageNamespaces.APP]: viApp
  },
  [ELocales.ENGLISH]: {
    [ELanguageNamespaces.APP]: enApp
  }
}

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    supportedLngs: Object.values(ELocales),
    fallbackLng: ELocales.ENGLISH,
    react: {
      useSuspense: false
    },
    ns: Object.values(ELanguageNamespaces),
    defaultNS: ELanguageNamespaces.APP,
    resources,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    }
  })

export default i18next
