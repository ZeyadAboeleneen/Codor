"use client"

import { useLocale } from "next-intl"
import { Link, usePathname } from "@/i18n/routing"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const nextLocale = locale === 'ar' ? 'en' : 'ar'

  return (
    <Link
      href={pathname}
      locale={nextLocale}
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-lg
        text-sm font-medium transition-all duration-300
        hover:bg-dark-600/5 hover:text-gold-400
        border border-white/5 bg-dark-600/20 backdrop-blur-sm
      `}
      aria-label="Toggle language"
    >
      <Globe className="h-4 w-4" />
      <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
    </Link>
  )
}
