"use client"

import { useMemo } from "react"
import { useLocale as useLocaleContext } from "@/lib/locale-context"
import { useLocale } from "next-intl"

export const useCurrencyFormatter = () => {
  const { settings } = useLocaleContext()
  const locale = useLocale()

  const formatter = useMemo(() => {
    try {
      return new Intl.NumberFormat(locale === "ar" ? settings.locale : "en-US", {
        style: "currency",
        currency: settings.currencyCode || "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    } catch {
      return new Intl.NumberFormat("en-US", { 
        style: "currency", 
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    }
  }, [settings.currencyCode, locale, settings.locale])

  const formatPrice = (amountUSD: number | undefined | null) => {
    if (!amountUSD || Number.isNaN(amountUSD)) return formatter.format(0)
    const converted = amountUSD * (settings.exchangeRate || 1)
    // Round to nearest integer as per requirement (e.g., 954.4 -> 955)
    const rounded = Math.round(converted)
    return formatter.format(rounded)
  }

  return {
    formatPrice,
    currencyCode: settings.currencyCode,
    currencySymbol: settings.currencySymbol,
    localeSettings: settings
  }
}

