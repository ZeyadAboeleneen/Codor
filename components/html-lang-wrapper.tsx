"use client"

import { useEffect } from "react"
import { useLocale } from "next-intl"

export function HtmlLangWrapper({ children }: { children: React.ReactNode }) {
  const locale = useLocale()

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"
    }
  }, [locale])

  return <>{children}</>
}
