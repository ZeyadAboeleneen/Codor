"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { translations, useTranslation } from "./translations"

type Language = "en" | "ar"

type CountryConfig = {
  code: string
  name: string
  currencyCode: string
  currencySymbol: string
  languages: Language[]
  locale: string
}

const getInstantRate = (currencyCode: string): number => {
  const cached = getCachedRate(currencyCode)
  if (cached !== null) return cached
  return FALLBACK_EXCHANGE_RATES_EGP[currencyCode] ?? 1
}

export type LocaleSettings = {
  countryCode: string
  countryName: string
  language: Language
  currencyCode: string
  currencySymbol: string
  locale: string
  exchangeRate: number
}

type LocaleContextValue = {
  settings: LocaleSettings
  refreshRate: () => Promise<void>
  setSettings: (countryCode: string, language: Language) => Promise<void>
  showModal: boolean
  selectCountry: string
  selectLanguage: Language
  setSelectCountry: (code: string) => void
  setSelectLanguage: (lang: Language) => void
  isSaving: boolean
}

const DEFAULT_COUNTRY: CountryConfig = {
  code: "EG",
  name: "Egypt",
  currencyCode: "EGP",
  currencySymbol: "E£",
  languages: ["ar", "en"],
  locale: "ar-EG"
}

const COUNTRY_OPTIONS: CountryConfig[] = [
  DEFAULT_COUNTRY,
  {
    code: "SA",
    name: "Saudi Arabia",
    currencyCode: "SAR",
    currencySymbol: "﷼",
    languages: ["ar", "en"],
    locale: "ar-SA"
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currencyCode: "AED",
    currencySymbol: "د.إ",
    languages: ["ar", "en"],
    locale: "ar-AE"
  },
  {
    code: "KW",
    name: "Kuwait",
    currencyCode: "KWD",
    currencySymbol: "د.ك",
    languages: ["ar", "en"],
    locale: "ar-KW"
  },
  {
    code: "QA",
    name: "Qatar",
    currencyCode: "QAR",
    currencySymbol: "ر.ق",
    languages: ["ar", "en"],
    locale: "ar-QA"
  },
  {
    code: "GB",
    name: "United Kingdom",
    currencyCode: "GBP",
    currencySymbol: "£",
    languages: ["en", "ar"],
    locale: "en-GB"
  },
  {
    code: "EG",
    name: "Egypt",
    currencyCode: "EGP",
    currencySymbol: "E£",
    languages: ["ar", "en"],
    locale: "ar-EG"
  },
  {
    code: "OM",
    name: "Oman",
    currencyCode: "OMR",
    currencySymbol: "ر.ع.",
    languages: ["ar", "en"],
    locale: "ar-OM"
  },
  {
    code: "BH",
    name: "Bahrain",
    currencyCode: "BHD",
    currencySymbol: "د.ب",
    languages: ["ar", "en"],
    locale: "ar-BH"
  },
  {
    code: "IQ",
    name: "Iraq",
    currencyCode: "IQD",
    currencySymbol: "د.ع",
    languages: ["ar", "en"],
    locale: "ar-IQ"
  },
  {
    code: "JO",
    name: "Jordan",
    currencyCode: "JOD",
    currencySymbol: "د.ا",
    languages: ["ar", "en"],
    locale: "ar-JO"
  },
  {
    code: "TR",
    name: "Turkey",
    currencyCode: "TRY",
    currencySymbol: "₺",
    languages: ["en"],
    locale: "tr-TR"
  },
  {
    code: "LB",
    name: "Lebanon",
    currencyCode: "LBP",
    currencySymbol: "ل.ل",
    languages: ["ar", "en"],
    locale: "ar-LB"
  }
]

const STORAGE_KEY = "ala_locale_settings_v2"

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined)

const createSettings = (config: CountryConfig, language: Language, rate = 1): LocaleSettings => ({
  countryCode: config.code,
  countryName: config.name,
  language: config.languages.includes(language) ? language : config.languages[0],
  currencyCode: config.currencyCode,
  currencySymbol: config.currencySymbol,
  locale: language === "ar" ? config.locale : "en-US",
  exchangeRate: rate
})

// Cache for exchange rates with timestamp
const RATE_CACHE_KEY = "ala_exchange_rates_cache_v2"
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Rates are EGP-based (units of local currency per 1 EGP)
// because all product prices are stored in EGP in the database
const FALLBACK_EXCHANGE_RATES_EGP: Record<string, number> = {
  EGP: 1,
  USD: 0.0206,
  AED: 0.0757,
  SAR: 0.0773,
  KWD: 0.00635,
  QAR: 0.0751,
  GBP: 0.0163,
  OMR: 0.00793,
  BHD: 0.00776,
  IQD: 27.01,
  JOD: 0.01462,
  TRY: 0.660,
  LBP: 1845,
}

type RateCache = {
  [currencyCode: string]: {
    rate: number
    timestamp: number
  }
}

const getCachedRate = (currencyCode: string): number | null => {
  if (typeof window === "undefined") return null
  try {
    const cached = localStorage.getItem(RATE_CACHE_KEY)
    if (!cached) return null
    const cache: RateCache = JSON.parse(cached)
    const cachedData = cache[currencyCode]
    if (!cachedData) return null
    // Check if cache is still valid (within 24 hours)
    if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.rate
    }
    return null
  } catch {
    return null
  }
}

const setCachedRate = (currencyCode: string, rate: number) => {
  if (typeof window === "undefined") return
  try {
    const cached = localStorage.getItem(RATE_CACHE_KEY)
    const cache: RateCache = cached ? JSON.parse(cached) : {}
    cache[currencyCode] = {
      rate,
      timestamp: Date.now()
    }
    localStorage.setItem(RATE_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore cache errors
  }
}

// Returns EGP-based rate: how many units of currencyCode equal 1 EGP
const fetchExchangeRate = async (currencyCode: string, fallbackRate?: number): Promise<number> => {
  try {
    // EGP is always 1 (prices are stored in EGP)
    if (currencyCode === "EGP") return 1

    // Check cache first
    const cachedRate = getCachedRate(currencyCode)
    if (cachedRate !== null) {
      return cachedRate
    }

    // Try primary API: exchangerate.host with EGP as base
    try {
      const response = await fetch(`https://api.exchangerate.host/latest?base=EGP&symbols=${currencyCode}`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        const rate = data?.rates?.[currencyCode]
        if (rate && typeof rate === 'number' && rate > 0) {
          setCachedRate(currencyCode, rate)
          return rate
        }
      }
    } catch (error) {
      console.warn("Primary exchange rate API failed, trying fallback...", error)
    }

    // Fallback API: exchangerate-api.com with EGP as base
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/EGP`, {
        cache: 'no-store'
      })
      if (response.ok) {
        const data = await response.json()
        const rate = data?.rates?.[currencyCode]
        if (rate && typeof rate === 'number' && rate > 0) {
          setCachedRate(currencyCode, rate)
          return rate
        }
      }
    } catch (error) {
      console.warn("Fallback exchange rate API failed", error)
    }

    // If all APIs fail, use fallback rate from storage or hardcoded EGP-based fallback
    if (fallbackRate && fallbackRate > 0) {
      console.warn(`Using fallback rate for ${currencyCode}: ${fallbackRate}`)
      return fallbackRate
    }

    const hardcoded = FALLBACK_EXCHANGE_RATES_EGP[currencyCode]
    if (hardcoded) return hardcoded

    console.error(`Failed to fetch exchange rate for ${currencyCode}, using 1`)
    return 1
  } catch (error) {
    console.error("Failed to fetch exchange rate", error)
    return fallbackRate && fallbackRate > 0 ? fallbackRate : (FALLBACK_EXCHANGE_RATES_EGP[currencyCode] ?? 1)
  }
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<LocaleSettings>(() => createSettings(DEFAULT_COUNTRY, "ar", getInstantRate(DEFAULT_COUNTRY.currencyCode)))
  const [selectCountry, setSelectCountry] = useState(DEFAULT_COUNTRY.code)
  const [selectLanguage, setSelectLanguage] = useState<Language>("ar")
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const persist = useCallback((next: LocaleSettings) => {
    setSettingsState(next)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LocaleSettings
        setSelectCountry(parsed.countryCode)
        setSelectLanguage(parsed.language)
        // Apply stored settings immediately
        persist(parsed)
        // Refresh exchange rate in the background to ensure it's current
        const config = COUNTRY_OPTIONS.find(c => c.code === parsed.countryCode) ?? DEFAULT_COUNTRY
        fetchExchangeRate(config.currencyCode, parsed.exchangeRate)
          .then(rate => {
            persist({ ...parsed, exchangeRate: rate })
          })
          .catch(() => {})
      } catch (err) {
        console.warn("Failed to parse locale storage", err)
      }
      setShowModal(false)
      return
    }
    // First visit: auto-apply Egypt + Arabic defaults silently (no popup)
    const defaultSettings = createSettings(DEFAULT_COUNTRY, "ar", getInstantRate(DEFAULT_COUNTRY.currencyCode))
    persist(defaultSettings)
    setSelectCountry(DEFAULT_COUNTRY.code)
    setSelectLanguage("ar")
    setShowModal(false)
  }, [persist])

  const refreshRate = useCallback(async () => {
    const config = COUNTRY_OPTIONS.find(c => c.code === settings.countryCode) ?? DEFAULT_COUNTRY
    // Use current stored rate as fallback in case API fails
    const rate = await fetchExchangeRate(config.currencyCode, settings.exchangeRate)
    persist({ ...settings, exchangeRate: rate })
  }, [persist, settings])

  const setSettings = useCallback(async (countryCode: string, language: Language) => {
    const config = COUNTRY_OPTIONS.find(country => country.code === countryCode) ?? DEFAULT_COUNTRY
    setIsSaving(true)
    // Apply settings instantly (use cached rate if present, otherwise use built-in fallback)
    const instantRate = getInstantRate(config.currencyCode)
    const next = createSettings(config, language, instantRate)
    persist(next)
    setShowModal(false)
    setIsSaving(false)

    // Fetch the actual rate in the background and update when ready
    fetchExchangeRate(config.currencyCode, instantRate)
      .then((rate) => {
        persist({ ...next, exchangeRate: rate })
      })
      .catch(() => {})
  }, [persist])

  const value = useMemo<LocaleContextValue>(() => ({
    settings,
    refreshRate,
    setSettings,
    showModal,
    selectCountry,
    selectLanguage,
    setSelectCountry,
    setSelectLanguage,
    isSaving
  }), [settings, refreshRate, setSettings, showModal, selectCountry, selectLanguage, isSaving])

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider")
  }
  return context
}

