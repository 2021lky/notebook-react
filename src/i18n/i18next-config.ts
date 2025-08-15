import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { SupportedLanguages } from './language';
import { default as CommonZh } from './zh/common'
import { default as CommonEn } from './en/common'
import { default as OperateZh } from './zh/operate'
import { default as OperateEn } from './en/operate'
import { getLocale, setLocale } from './index'
const loadLanguageResources = (lang: string) => ({
  translation: {
    common: lang === 'zh' ? CommonZh : CommonEn,
    operate: lang === 'zh' ? OperateZh : OperateEn
  },
})

type Resource = Record<string, ReturnType<typeof loadLanguageResources>>

export const resources = SupportedLanguages.reduce<Resource>((acc, lang) => {
  acc[lang] = loadLanguageResources(lang)
  return acc
}, {})

// 异步初始化 i18n
i18n.use(initReactI18next)
  .init({
    lng: getLocale(),
    fallbackLng: 'en', 
    resources,
  })

export default i18n;
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang, () => setLocale(lang))
}