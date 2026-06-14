"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Link, useRouter } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, RefreshCw, Building2, Package, Cpu, MessageSquare, Mail,
  Image as ImageIcon, ShoppingCart, Users, Ticket, TrendingUp,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"
import { BrandsTab } from "@/components/admin/brands-tab"
import { ProductsTab } from "@/components/admin/models-tab"
import { VariantsTab as ModelsTab } from "@/components/admin/variants-tab"
import { HeroTab } from "@/components/admin/hero-tab"
import { OrdersTab } from "@/components/admin/orders-tab"
import { UsersTab } from "@/components/admin/users-tab"
import { DiscountCodesTab } from "@/components/admin/discount-codes-tab"
import { MessagesTab } from "@/components/admin/messages-tab"

interface ContactMessage {
  _id: string
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const t = useTranslations()
  const { state: authState } = useAuth()

  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [orderStats, setOrderStats] = useState<{ total: number; revenue: number; pending: number } | null>(null)
  const [userCount, setUserCount] = useState<number>(0)
  const [discountCount, setDiscountCount] = useState<number>(0)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getAuthToken = () => authState.token || (typeof window !== "undefined" ? localStorage.getItem("token") || "" : "")

  const fetchData = useCallback(async () => {
    try {
      const token = getAuthToken()
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      const opts = { headers, cache: "no-store" as RequestCache }

      const [heroRes, brandsRes, productsRes, modelsRes, messagesRes, ordersRes, usersRes, discountRes] =
        await Promise.all([
          fetch("/api/admin/hero-slides", opts),
          fetch("/api/admin/brands", opts),
          fetch("/api/admin/models", opts),
          fetch("/api/admin/variants", opts),
          fetch("/api/contact", opts),
          fetch("/api/admin/all-orders?limit=1&page=1", opts),
          fetch("/api/admin/users?limit=1&page=1", opts),
          fetch("/api/discount-codes", opts),
        ])

      if (heroRes.ok) setHeroSlides(await heroRes.json())
      if (brandsRes.ok) setBrands(await brandsRes.json())
      if (productsRes.ok) setProducts(await productsRes.json())
      if (modelsRes.ok) setModels(await modelsRes.json())
      if (messagesRes.ok) setMessages(await messagesRes.json())

      if (ordersRes.ok) {
        const orderData = await ordersRes.json()
        setOrderStats({
          total: orderData.total || 0,
          revenue: orderData.stats?.revenue || 0,
          pending: orderData.stats?.statusCounts?.pending || 0,
        })
      }

      if (usersRes.ok) {
        const userData = await usersRes.json()
        setUserCount(userData.total || 0)
      }

      if (discountRes.ok) {
        const discountData = await discountRes.json()
        setDiscountCount(Array.isArray(discountData) ? discountData.length : 0)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [authState.token])

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role === "admin") {
      fetchData()
    } else if (!authState.isLoading) {
      router.push("/")
    }
  }, [authState.isAuthenticated, authState.isLoading, authState.user?.role, fetchData, router])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  if (authState.isLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-500">
        <Navigation />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4" />
            <p className="text-gray-400">{t("adminLoading")}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated || authState.user?.role !== "admin") return null

  const unreadMessages = messages.filter((m) => !m.isRead).length

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(p)

  return (
    <div className="min-h-screen bg-dark-500">
      <Navigation />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-gold-400 transition-colors mb-4 text-sm">
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" /> {t("backToHome")}
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{t("dashboard")}</h1>
                <p className="text-gray-400 text-sm mt-1">{t("welcome")}، {authState.user?.name}</p>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="bg-transparent border-white/10 text-gray-300 hover:text-gold-400 hover:border-gold-500/30"
                size="sm"
              >
                <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {t("refresh")}
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8"
          >
            {[
              {
                label: t("totalOrders"),
                value: orderStats?.total ?? "—",
                sub: orderStats ? `${orderStats.pending} ${t("pendingOrders")}` : undefined,
                icon: ShoppingCart,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                label: t("revenueLabel"),
                value: orderStats ? formatPrice(orderStats.revenue) : "—",
                icon: TrendingUp,
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
              {
                label: t("usersLabel"),
                value: userCount,
                icon: Users,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
              },
              {
                label: t("discountCodesLabel"),
                value: discountCount,
                icon: Ticket,
                color: "text-orange-400",
                bg: "bg-orange-500/10",
              },
              {
                label: t("messagesLabel"),
                value: messages.length,
                icon: MessageSquare,
                color: "text-gold-400",
                bg: "bg-gold-500/10",
                badge: unreadMessages,
              },
            ].map((stat) => (
              <Card key={stat.label} className="bg-dark-400 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 mb-1 truncate">{stat.label}</p>
                      <p className="text-xl font-bold text-white truncate">{stat.value}</p>
                      {stat.sub && <p className="text-[10px] text-gray-500 mt-0.5">{stat.sub}</p>}
                    </div>
                    <div
                      className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center relative flex-shrink-0`}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      {stat.badge ? (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {stat.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Secondary Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8"
          >
            {[
              { label: t("heroImages"), value: heroSlides.length, icon: ImageIcon, color: "text-orange-400", bg: "bg-orange-500/10" },
              { label: t("brandsLabel"), value: brands.length, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: t("productsLabel"), value: products.length, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: t("modelsLabel"), value: models.length, icon: Cpu, color: "text-gold-400", bg: "bg-gold-500/10" },
            ].map((stat) => (
              <Card key={stat.label} className="bg-dark-400 border-white/10">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs defaultValue="orders" className="space-y-6" dir="rtl">
              <div className="overflow-x-auto">
                <TabsList className="inline-flex h-11 items-center rounded-xl bg-dark-400 border border-white/10 p-1 min-w-max gap-0.5">
                  {[
                    { value: "orders", label: t("ordersTab"), icon: ShoppingCart },
                    { value: "users", label: t("usersTab"), icon: Users },
                    { value: "discounts", label: t("discountsTab"), icon: Ticket },
                    { value: "hero", label: t("heroTab"), icon: ImageIcon },
                    { value: "brands", label: t("brandsTab"), icon: Building2 },
                    { value: "products", label: t("productsTab"), icon: Package },
                    { value: "models", label: t("modelsTab"), icon: Cpu },
                    {
                      value: "messages",
                      label: t("messagesTab"),
                      icon: MessageSquare,
                      badge: unreadMessages,
                    },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="whitespace-nowrap text-sm px-3 py-2 rounded-lg data-[state=active]:bg-gold-500 data-[state=active]:text-dark-900 relative"
                    >
                      <tab.icon className="h-4 w-4 ml-1.5 inline-block" />
                      {tab.label}
                      {tab.badge ? (
                        <span className="mr-1.5 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
                          {tab.badge}
                        </span>
                      ) : null}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="orders">
                <OrdersTab getAuthToken={getAuthToken} />
              </TabsContent>

              <TabsContent value="users">
                <UsersTab getAuthToken={getAuthToken} />
              </TabsContent>

              <TabsContent value="discounts">
                <DiscountCodesTab getAuthToken={getAuthToken} />
              </TabsContent>

              <TabsContent value="hero">
                <HeroTab slides={heroSlides} setSlides={setHeroSlides} products={products} getAuthToken={getAuthToken} />
              </TabsContent>

              <TabsContent value="brands">
                <BrandsTab brands={brands} setBrands={setBrands} getAuthToken={getAuthToken} />
              </TabsContent>

              <TabsContent value="products">
                <ProductsTab products={products} setProducts={setProducts} brands={brands} getAuthToken={getAuthToken} />
              </TabsContent>

              <TabsContent value="models">
                <ModelsTab models={models} setModels={setModels} products={products} brands={brands} getAuthToken={getAuthToken} />
              </TabsContent>

              <TabsContent value="messages">
                <MessagesTab
                  messages={messages}
                  setMessages={setMessages}
                  getAuthToken={getAuthToken}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
