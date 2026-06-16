import { useAppStore } from '../store/useAppStore'
import { tr } from '../locales/tr'
import { en } from '../locales/en'

const translations = {
  tr,
  en
}

export function useTranslation() {
  const language = useAppStore((state) => state.language)

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return { t, language }
}

