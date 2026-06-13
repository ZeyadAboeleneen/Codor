"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Link, useRouter } from "@/i18n/routing"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft, RefreshCw, Building2, Package, Cpu, MessageSquare, Mail, Image as ImageIcon
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"
import { BrandsTab } from "@/components/admin/brands-tab"
import { ProductsTab } from "@/components/admin/models-tab" // Note file name mapped to component
import { VariantsTab as ModelsTab } from "@/components/admin/variants-tab" // Note file name mapped to component
import { HeroTab } from "@/components/admin/hero-tab"
import { Badge } from "@/components/ui/badge"

interface ContactMessage {
  _id: string
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
  const { state: authState } = useAuth()
  
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const getAuthToken = () => authState.token || localStorage.getItem("token") || ""

  const fetchData = useCallback(async () => {
    try {
      const token = getAuthToken()
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      const opts = { headers, cache: "no-store" as RequestCache }

      const [heroRes, brandsRes, productsRes, modelsRes, messagesRes] = await Promise.all([
        fetch("/api/admin/hero-slides", opts),
        fetch("/api/admin/brands", opts),
        fetch("/api/admin/models", opts), // returns products
        fetch("/api/admin/variants", opts), // returns models
        fetch("/api/contact", opts),
      ])

      if (heroRes.ok) setHeroSlides(await heroRes.json())
      if (brandsRes.ok) setBrands(await brandsRes.json())
      if (productsRes.ok) setProducts(await productsRes.json())
      if (modelsRes.ok) setModels(await modelsRes.json())
      
      // Keep MongoDB structure for messages for now as we didn't migrate it
      if (messagesRes.ok) setMessages(await messagesRes.json())
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
            <p className="text-gray-400">جاري تحميل لوحة التحكم...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated || authState.user?.role !== "admin") return null

  const unreadMessages = messages.filter(m => !m.isRead).length

  return (
    <div className="min-h-screen bg-dark-500">
      <Navigation />

      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-gold-400 transition-colors mb-4 text-sm">
              <ArrowLeft className="ml-2 h-4 w-4 rotate-180" /> العودة للرئيسية
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">لوحة التحكم</h1>
                <p className="text-gray-400 text-sm mt-1">مرحباً، {authState.user?.name}</p>
              </div>
              <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="bg-transparent border-white/10 text-gray-300 hover:text-gold-400 hover:border-gold-500/30" size="sm">
                <RefreshCw className={`ml-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> تحديث
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
            {[
              { label: "صور الهيرو", value: heroSlides.length, icon: ImageIcon, color: "text-orange-400", bg: "bg-orange-500/10" },
              { label: "الماركات", value: brands.length, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "المنتجات", value: products.length, icon: Package, color: "text-purple-400", bg: "bg-purple-500/10" },
              { label: "الموديلات", value: models.length, icon: Cpu, color: "text-gold-400", bg: "bg-gold-500/10" },
              { label: "الرسائل", value: messages.length, icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10", badge: unreadMessages },
            ].map(stat => (
              <Card key={stat.label} className="bg-dark-400 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center relative`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      {stat.badge ? (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{stat.badge}</span>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <Tabs defaultValue="hero" className="space-y-6" dir="rtl">
              <div className="overflow-x-auto">
                <TabsList className="inline-flex h-11 items-center rounded-xl bg-dark-400 border border-white/10 p-1 min-w-max">
                  <TabsTrigger value="hero" className="whitespace-nowrap text-sm px-4 py-2 rounded-lg data-[state=active]:bg-gold-500 data-[state=active]:text-dark-900">
                    <ImageIcon className="h-4 w-4 ml-2" /> صور الهيرو
                  </TabsTrigger>
                  <TabsTrigger value="brands" className="whitespace-nowrap text-sm px-4 py-2 rounded-lg data-[state=active]:bg-gold-500 data-[state=active]:text-dark-900">
                    <Building2 className="h-4 w-4 ml-2" /> الماركات
                  </TabsTrigger>
                  <TabsTrigger value="products" className="whitespace-nowrap text-sm px-4 py-2 rounded-lg data-[state=active]:bg-gold-500 data-[state=active]:text-dark-900">
                    <Package className="h-4 w-4 ml-2" /> المنتجات
                  </TabsTrigger>
                  <TabsTrigger value="models" className="whitespace-nowrap text-sm px-4 py-2 rounded-lg data-[state=active]:bg-gold-500 data-[state=active]:text-dark-900">
                    <Cpu className="h-4 w-4 ml-2" /> الموديلات
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="whitespace-nowrap text-sm px-4 py-2 rounded-lg data-[state=active]:bg-gold-500 data-[state=active]:text-dark-900 relative">
                    <MessageSquare className="h-4 w-4 ml-2" /> الرسائل
                    {unreadMessages > 0 && (
                      <span className="mr-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadMessages}</span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

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
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-gold-400" />
                    رسائل التواصل ({messages.length})
                  </h2>
                  {messages.length === 0 ? (
                    <Card className="bg-dark-400 border-white/10">
                      <CardContent className="py-12 text-center">
                        <Mail className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                        <p className="text-gray-400">لا توجد رسائل.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-3">
                      {messages.map(msg => (
                        <Card key={msg._id} className={`border-white/10 transition-colors ${msg.isRead ? "bg-dark-400" : "bg-dark-400 border-r-2 border-r-gold-500"}`}>
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-white text-sm">{msg.name}</p>
                                  {!msg.isRead && <Badge className="bg-gold-500/20 text-gold-400 border-gold-500/30 text-[10px]">جديد</Badge>}
                                </div>
                                <p className="text-gold-400 text-sm font-medium mb-1">{msg.subject}</p>
                                <p className="text-gray-400 text-sm line-clamp-2">{msg.message}</p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                  <span>{msg.email}</span>
                                  {msg.phone && <span>• {msg.phone}</span>}
                                  <span>• {new Date(msg.createdAt).toLocaleDateString("ar-EG")}</span>
                                </div>
                              </div>
                              <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} className="text-gold-400 hover:text-gold-300 text-sm whitespace-nowrap">
                                رد بالإيميل ↗
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
