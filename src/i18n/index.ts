import Cookies from 'js-cookie'

import { changeLanguage } from "i18next";
import { SupportedLanguages } from './language';
import { LOCALE_COOKIE_NAME } from "@/constant";

export type Locale = typeof SupportedLanguages[number]

export const setLocale = (locale: Locale, reloadPage = true) => {
  Cookies.set(LOCALE_COOKIE_NAME, locale,  { expires: 365 })
  changeLanguage(locale)
  reloadPage && window.location.reload()
}

export const getLocale = ():Locale => {
  return Cookies.get(LOCALE_COOKIE_NAME) as Locale || SupportedLanguages[0]
}