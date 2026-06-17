"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react"
import { useTranslations } from "next-intl"

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/share/1BFNEcNQXS/?mibextid=wwXIfr",
    icon: Facebook,
    label: "Facebook",
    color: "hover:bg-blue-600/20 hover:text-blue-400",
  },
  {
    href: "https://www.instagram.com/condor.egy?igsh=MTc2cHcydWc3OTB0&utm_source=qr",
    icon: Instagram,
    label: "Instagram",
    color: "hover:bg-pink-600/20 hover:text-pink-400",
  },
  {
    href: "https://wa.me/201028126522",
    icon: MessageCircle,
    label: "WhatsApp",
    color: "hover:bg-green-600/20 hover:text-green-400",
  },
]

export function CondorFooter() {
  const t = useTranslations()

  const FOOTER_CATEGORIES = [
    { href: "/products?category=centrifugal", labelKey: "centrifugalPumps" },
    { href: "/products?category=submersible", labelKey: "submersiblePumps" },
    { href: "/products?category=peripheral", labelKey: "peripheralPumps" },
    { href: "/products?category=pressure", labelKey: "highPressurePumps" },
  ]

  const FOOTER_LINKS = [
    { href: "/", labelKey: "home" },
    { href: "/products", labelKey: "products" },
    { href: "/about", labelKey: "about" },
    { href: "/contact", labelKey: "contact" },
  ]

  return (
    <footer className="bg-dark-700 border-t border-white/5">
      {/* Main Footer */}
      <div className="condor-container py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12">
          {/* Column 1: Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <Image
              src="/condor-logo-gold.png"
              alt="Condor Egypt"
              width={180}
              height={50}
              className="h-12 w-auto"
            />
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {t("footerBrandDesc")}
            </p>
            {/* Social Links */}
            <div className="flex gap-2 sm:gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-lg bg-dark-600/5 border border-white/5 flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-gold-400 font-semibold mb-5 text-base">{t("categoriesFooter")}</h3>
            <ul className="space-y-3">
              {FOOTER_CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/40 group-hover:bg-gold-400 transition-colors" />
                    {t(cat.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-gold-400 font-semibold mb-5 text-base">{t("quickLinks")}</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-gold-400 transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gold-500/40 group-hover:bg-gold-400 transition-colors" />
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-gold-400 font-semibold mb-5 text-base">{t("contactUsFooter")}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-gold-400" />
                </div>
                <span className="text-gray-400 text-sm">
                  {t("cairoEgypt")}
                </span>
              </li>
              <li>
                <a
                  href="tel:+201028126522"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-gold-400" />
                  </div>
                  <span className="text-gray-400 text-sm group-hover:text-gold-400 transition-colors" dir="ltr">
                    +20 10 2812 6522
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:condor.egyy@gmail.com"
                  className="flex items-start gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-gold-400" />
                  </div>
                  <span className="text-gray-400 text-sm group-hover:text-gold-400 transition-colors">
                    condor.egyy@gmail.com
                  </span>
                </a>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="condor-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} Condor Egypt. {t("allRightsReserved")}
            </p>
            <p className="text-gray-400 text-xs">
              {t("madeBy")}{" "}
              <a
                href="https://www.instagram.com/digitiva.co"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gold-400 transition-colors"
              >
                Digitiva
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/201028126522"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:bg-green-400 transition-all duration-300 hover:scale-110 animate-pulse-gold"
        aria-label="Contact on WhatsApp"
        style={{ animationName: 'none' }}
      >
        <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
      </a>
    </footer>
  )
}
