"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Phone, MapPin, Send, Instagram, Facebook, MessageSquare } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useTranslations, useLocale } from "next-intl"

export default function ContactPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({ name: "", email: "", subject: "", message: "" })
        setTimeout(() => setSuccess(false), 5000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || t("failedToSendMessage"))
      }
    } catch (error) {
      console.error("Contact form error:", error)
      setError(t("anErrorOccurred"))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-dark-600">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 md:pt-28 pb-20 bg-gradient-to-b from-dark-600 via-dark-600 to-dark-500">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Link href="/" className={`inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors ${locale === "ar" ? "flex-row-reverse" : ""}`}>
              <ArrowLeft className={`h-4 w-4 ${locale === "ar" ? "ml-2 rotate-180" : "mr-2"}`} />
              {t("backToHome")}
            </Link>
            <h1 className="text-4xl md:text-5xl font-light tracking-[0.35em] font-serif uppercase mb-6">{t("getInTouch")}</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t("contactHeroDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="shadow-lg border-0 rounded-2xl bg-dark-400 border-white/10">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-light tracking-wider font-serif mb-6">{t("sendUsMessage")}</h2>

                  {success && (
                    <Alert className="mb-6 border-green-500/30 bg-green-500/10">
                      <AlertDescription className="text-green-400">
                        {t("thankYouMessage")}
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="mb-6 border-red-500/30 bg-red-500/10">
                      <AlertDescription className="text-red-400">{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                          {t("fullName")}
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder={t("yourFullName")}
                          required
                          className="border-white/10 bg-dark-500 text-white focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                          {t("emailAddress")}
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder={t("yourEmail")}
                          required
                          className="border-white/10 bg-dark-500 text-white focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium mb-2 block">
                        {t("subject")}
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder={t("howCanWeHelp")}
                        required
                        className="border-white/10 bg-dark-500 text-white focus:border-gold-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                        {t("message")}
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder={t("tellUsMore")}
                        rows={6}
                        required
                        className="border-white/10 bg-dark-500 text-white focus:border-gold-500 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className={`w-full bg-gold-500 text-dark-900 hover:bg-gold-400 font-semibold ${locale === "ar" ? "flex-row-reverse" : ""}`}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white ${locale === "ar" ? "ml-2" : "mr-2"}`}></div>
                          {t("sending")}
                        </>
                      ) : (
                        <>
                          <Send className={`h-4 w-4 ${locale === "ar" ? "ml-2" : "mr-2"}`} />
                          {t("sendMessage")}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-light tracking-wider font-serif mb-6">{t("contactInformation")}</h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  {t("contactInfoDesc")}
                </p>
              </div>

              <div className="space-y-6">
                <div className={`flex items-center ${locale === "ar" ? "flex-row-reverse space-x-reverse" : "space-x-4"}`}>
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className={locale === "ar" ? "text-right" : "text-left"}>
                    <h3 className="font-bold text-white mb-1">{t("email")}</h3>
                    <p className="text-gray-400 text-sm dir-ltr">condor.egyy@gmail.com</p>
                  </div>
                </div>

                <div className={`flex items-center ${locale === "ar" ? "flex-row-reverse space-x-reverse" : "space-x-4"}`}>
                  <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className={locale === "ar" ? "text-right" : "text-left"}>
                    <h3 className="font-bold text-white mb-1">{t("phoneNumber")}</h3>
                    <p className="text-gray-400 text-sm dir-ltr">WhatsApp: +20 10 28126522</p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5">
                <h3 className={`font-bold text-white mb-4 ${locale === "ar" ? "text-right" : "text-left"}`}>{t("followUs")}</h3>
                <div className={`flex items-center gap-3 ${locale === "ar" ? "justify-start flex-row-reverse" : "justify-start"}`}>
                  <a
                    href="https://www.instagram.com/condor.egy?igsh=MTc2cHcydWc3OTB0&utm_source=qr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/share/1BFNEcNQXS/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:condor.egyy@gmail.com"
                    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                  <a
                    href="https://wa.me/201028126522"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:bg-gold-500/10 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-dark-500">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-light tracking-wider font-serif mb-6">{t("frequentlyAskedQuestions")}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {t("faqDesc")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="font-medium font-serif tracking-wide">{t("faq1Question")}</h3>
              <p className="text-gray-400 text-sm">
                {t("faq1Answer")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="font-medium font-serif tracking-wide">{t("faq2Question")}</h3>
              <p className="text-gray-400 text-sm">
                {t("faq2Answer")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="font-medium font-serif tracking-wide">{t("faq3Question")}</h3>
              <p className="text-gray-400 text-sm">
                {t("faq3Answer")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="font-medium font-serif tracking-wide">{t("faq4Question")}</h3>
              <p className="text-gray-400 text-sm">
                {t("faq4Answer")}
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
