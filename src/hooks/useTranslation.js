import { useState, useEffect } from 'react';
import { i18n } from '../utils/i18n.js';

export function useTranslation() {
  const [language, setLanguage] = useState(i18n.getCurrentLanguage());

  useEffect(() => {
    const handleLanguageChange = (newLanguage) => {
      setLanguage(newLanguage);
    };

    i18n.addListener(handleLanguageChange);

    return () => {
      i18n.removeListener(handleLanguageChange);
    };
  }, []);

  return {
    t: (key, defaultValue) => i18n.t(key, defaultValue),
    language,
    setLanguage: (lang) => i18n.setLanguage(lang),
    availableLanguages: i18n.getAvailableLanguages()
  };
}