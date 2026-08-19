import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { fr } from './locales/fr';

export const SUPPORTED_LOCALES = ['fr', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
    },
    lng: DEFAULT_LOCALE,
    fallbackLng: false,
    supportedLngs: [...SUPPORTED_LOCALES],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'locale',
      caches: ['localStorage'],
    },
    returnNull: false,
    parseMissingKeyHandler: (key) => {
      throw new Error(`Missing translation key: ${key}`);
    },
  });

export default i18n;
