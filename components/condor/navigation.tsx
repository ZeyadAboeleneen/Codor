"use client"

import { useState, useEffect, useRef } from "react"
import { Link, usePathname } from "@/i18n/routing"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Menu, X, User, Heart, LogOut, Settings,
  Search, ShoppingCart, Phone, ChevronDown, ChevronLeft
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useFavorites } from "@/lib/favorites-context"
import { useCart } from "@/lib/cart-context"
import { useScroll } from "@/lib/scroll-context"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "./language-switcher"

const NAV_LINKS = [
  { href: "/", labelKey: "home" },
  { href: "/products", labelKey: "products" },
  { href: "/about", labelKey: "about" },
  { href: "/contact", labelKey: "contact" },
]

export function CondorNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { isScrolled } = useScroll()
  const { state: authState, logout } = useAuth()
  const { state: favoritesState } = useFavorites()
  const { state: cartState } = useCart()
  const pathname = usePathname()
  const t = useTranslations()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setShowUserMenu(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  // Focus search input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const isActiveLink = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const handleLogout = () => {
    logout()
    setShowUserMenu(false)
  }

  const cartCount = cartState?.count || 0

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? "bg-dark-600/95 backdrop-blur-xl border-b border-white/5 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="condor-container">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ─── Mobile Menu Toggle (Visible only on mobile, right side in RTL) ─── */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 -mr-2 text-gray-300 hover:text-gold-400 transition-colors"
                aria-label="Toggle Menu"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* ─── Right Side: Logo (RTL) ─── */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:transform-none flex items-center gap-3 group flex-shrink-0 z-10">
              <Image
                src="/condor-logo-gold.png"
                alt="Condor Egypt"
                width={200}
                height={60}
                className="h-8 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            {/* ─── Center: Desktop Navigation ─── */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-lg ${
                    isActiveLink(link.href)
                      ? "text-gold-400"
                      : "text-gray-300 hover:text-gold-400 hover:bg-dark-600/5"
                  }`}
                >
                  {t(link.labelKey)}
                  {isActiveLink(link.href) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* ─── Left Side: Icons (RTL) ─── */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              {/* Search Button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-dark-600/5"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Favorites */}
              <Link
                href="/favorites"
                className="relative p-2 text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-dark-600/5"
                aria-label="Favorites"
              >
                <Heart className="h-5 w-5" />
                {favoritesState.count > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 h-4 w-4 bg-gold-500 text-dark-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {favoritesState.count}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative p-2 text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-dark-600/5"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -left-0.5 h-4 w-4 bg-gold-500 text-dark-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu - Desktop */}
              {authState.isAuthenticated ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                    className="p-2 text-gray-300 hover:text-gold-400 transition-colors rounded-lg hover:bg-dark-600/5"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 top-full mt-2 w-56 bg-dark-300 border border-white/10 shadow-xl rounded-xl overflow-hidden z-50"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-4 border-b border-white/5">
                          <p className="text-sm font-medium text-white">{authState.user?.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{authState.user?.email}</p>
                        </div>
                        <div className="py-1">
                          {authState.user?.role !== "admin" && (
                            <Link
                              href="/account"
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-600/5 hover:text-gold-400 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="h-4 w-4" />
                              {t("myAccount")}
                            </Link>
                          )}
                          {authState.user?.role === "admin" && (
                            <Link
                              href="/admin/dashboard"
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-dark-600/5 hover:text-gold-400 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="h-4 w-4" />
                              {t("adminDashboard")}
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            {t("signOut")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-gold-400 hover:bg-dark-600/5"
                    >
                      {t("signIn")}
                    </Button>
                  </Link>
                </div>
              )}

              {/* WhatsApp Quick Contact */}
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden xl:inline">{t("contactUs")}</span>
              </a>

              {/* Mobile Menu Toggle removed from here as it's now at the beginning of the container */}
            </div>
          </div>
        </div>

        {/* ─── Search Bar ─── */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="condor-container py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="w-full bg-dark-300 border border-white/10 rounded-xl pr-12 pl-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/20 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                      }
                      if (e.key === "Escape") setShowSearch(false)
                    }}
                  />
                  <button
                    onClick={() => setShowSearch(false)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Mobile Menu ─── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[45] lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-dark-500 border-l border-white/5 z-[46] lg:hidden overflow-y-auto"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <Image
                  src="/condor-logo-gold.png"
                  alt="Condor Egypt"
                  width={140}
                  height={40}
                  className="h-8 w-auto"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Menu Links */}
              <div className="py-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-6 py-4 transition-colors ${
                      isActiveLink(link.href)
                        ? "text-gold-400 bg-gold-500/5 border-r-2 border-gold-500"
                        : "text-gray-300 hover:text-gold-400 hover:bg-dark-600/5"
                    }`}
                  >
                    <span className="text-base font-medium">{t(link.labelKey)}</span>
                    <ChevronLeft className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>

              {/* User Section */}
              <div className="border-t border-white/5 py-4 px-6">
                {authState.isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{authState.user?.name}</p>
                        <p className="text-xs text-gray-400">{authState.user?.email}</p>
                      </div>
                    </div>
                    {authState.user?.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-2 py-2 text-sm text-gray-300 hover:text-gold-400 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        {t("adminDashboard")}
                      </Link>
                    )}
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false) }}
                      className="flex items-center gap-2 w-full py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("signOut")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center w-full py-3 bg-gold-500 text-dark-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
                    >
                      {t("signIn")}
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center w-full py-3 border border-gold-500/30 text-gold-400 rounded-lg hover:bg-gold-500/10 transition-colors"
                    >
                      {t("signUp")}
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Language Switcher */}
              <div className="border-t border-white/5 py-4 px-6 flex justify-center">
                <LanguageSwitcher />
              </div>

              {/* WhatsApp */}
              <div className="border-t border-white/5 p-6">
                <a
                  href="https://wa.me/201234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {t("contactViaWhatsapp")}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
