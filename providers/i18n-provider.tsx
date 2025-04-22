"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { type Language, type I18nConfig, getI18nConfig, getTranslation, defaultConfig } from "@/lib/i18n"

type TranslationFunction = (key: string, fallback?: string) => string

interface I18nContextType {
  language: Language
  setLanguage: (language: Language) => void
  dir: "ltr" | "rtl"
  t: TranslationFunction
}

const I18nContext = createContext<I18nContextType>({
  language: defaultConfig.language,
  setLanguage: () => {},
  dir: defaultConfig.direction,
  t: (key) => key,
})

export const useI18n = () => useContext(I18nContext)

interface I18nProviderProps {
  children: ReactNode
  initialLanguage?: Language
}

export function I18nProvider({ children, initialLanguage = "en" }: I18nProviderProps) {
  const [config, setConfig] = useState<I18nConfig>(getI18nConfig(initialLanguage))
  const [t, setT] = useState<TranslationFunction>(() => getTranslation(initialLanguage))

  const setLanguage = (language: Language) => {
    const newConfig = getI18nConfig(language)
    setConfig(newConfig)
    setT(() => getTranslation(language))

    // Save language preference to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("language", language)
    }

    // Update document direction
    if (typeof document !== "undefined") {
      document.documentElement.dir = newConfig.direction
      document.documentElement.lang = language
    }
  }

  // Initialize from localStorage if available
  useEffect(() => {
    if (typeof window === "undefined") return

    const savedLanguage = localStorage.getItem("language") as Language | null
    if (savedLanguage && savedLanguage !== config.language) {
      setLanguage(savedLanguage)
    } else if (initialLanguage !== config.language) {
      setLanguage(initialLanguage)
    }

    // Set initial document direction
    document.documentElement.dir = config.direction
    document.documentElement.lang = config.language
  }, [])

  return (
    <I18nContext.Provider
      value={{
        language: config.language,
        setLanguage,
        dir: config.direction,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}
