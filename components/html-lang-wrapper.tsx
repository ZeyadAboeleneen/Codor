"use client"

import { useEffect } from "react"

export function HtmlLangWrapper({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = settings.language === "ar" ? "ar" : "en"
      document.documentElement.dir = settings.language === "ar" ? "rtl" : "ltr"
    }
  }, [settings.language])

  return <>{children}</>
}

