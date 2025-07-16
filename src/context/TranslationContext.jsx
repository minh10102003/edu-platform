import React, { createContext, useContext, useState, useEffect } from 'react'
import { i18n } from '../utils/i18n.js'

const TranslationContext = createContext()

export function TranslationProvider({ children }) {
  const [language, setLanguageState] = useState(i18n.getCurrentLanguage())

  useEffect(() => {
    const handleChange = (newLang) => {
      setLanguageState(newLang)
    }
    i18n.addListener(handleChange)
    return () => i18n.removeListener(handleChange)
  }, [])

  const t = (key, defaultValue) => i18n.t(key, defaultValue)
  const setLanguage = (lang) => i18n.setLanguage(lang)
  const availableLanguages = i18n.getAvailableLanguages()

  return (
    <TranslationContext.Provider
      value={{ t, language, setLanguage, availableLanguages }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  return useContext(TranslationContext)
}
