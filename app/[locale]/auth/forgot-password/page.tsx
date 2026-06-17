"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { ArrowLeft } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

export default function ForgotPasswordPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t("somethingWentWrong"))
      } else {
        setMessage(data.message)
      }
    } catch (err) {
      setError(t("networkError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-500 px-4">
      <div className="max-w-md w-full bg-dark-400 border border-white/10 p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-white">{t("forgotPasswordTitle")}</h1>
        <p className="text-sm text-gray-400 mb-6 text-center">
          {t("forgotPasswordDesc")}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder={t("yourEmail")}
            className="w-full px-4 py-2 border border-white/10 bg-dark-500 text-white rounded-lg focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gold-500 text-dark-900 py-2.5 rounded-lg hover:bg-gold-400 font-semibold transition ${locale === "ar" ? "flex-row-reverse" : ""}`}
          >
            {loading ? t("sending") : t("sendResetLink")}
          </button>
        </form>

        {message && <p className="text-green-400 text-sm mt-4">{message}</p>}
        {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

        <div className="text-center mt-6">
          <Link href="/auth/login" className={`inline-flex items-center text-gray-400 hover:text-gold-400 mb-6 transition-colors ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                        <ArrowLeft className={`h-4 w-4 ${locale === "ar" ? "ml-2 rotate-180" : "mr-2"}`} />
                        {t("backToLoginPage")}
                      </Link>
        </div>
      </div>
    </div>
  )
}
