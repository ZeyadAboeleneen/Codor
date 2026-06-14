"use client"

import { useState, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, ExternalLink, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

interface Order {
  _id: string
  id: string
  userId: string
  items: any[]
  total: number
  status: string
  shippingAddress: {
    name?: string
    email?: string
    phone?: string
    city?: string
    governorate?: string
  }
  paymentMethod: string
  discountCode?: string
  discountAmount?: number
  createdAt: string
}

interface OrdersTabProps {
  getAuthToken: () => string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
}

export function OrdersTab({ getAuthToken }: OrdersTabProps) {
  const t = useTranslations()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState<any>(null)

  const statusLabels: Record<string, string> = {
    pending: t("statusPending"),
    processing: t("statusProcessing"),
    shipped: t("statusShipped"),
    delivered: t("statusDelivered"),
    cancelled: t("statusCancelled"),
  }

  const paymentLabels: Record<string, string> = {
    cod: t("paymentCOD"),
    visa: "Visa",
    mastercard: "Mastercard",
  }

  const fetchOrders = useCallback(async (p = page, s = search, sf = statusFilter) => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const params = new URLSearchParams({ page: String(p), limit: "20" })
      if (s) params.set("search", s)
      if (sf && sf !== "all") params.set("status", sf)

      const res = await fetch(`/api/admin/all-orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }, [getAuthToken, page, search, statusFilter])

  useEffect(() => {
    fetchOrders(page, search, statusFilter)
  }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchOrders(1, search, statusFilter)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(price)

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t("totalOrdersCard"), value: stats.totalOrders, color: "text-white" },
            { label: t("revenueCard"), value: formatPrice(stats.revenue), color: "text-gold-400" },
            { label: t("pendingCard"), value: stats.statusCounts?.pending || 0, color: "text-yellow-400" },
            { label: t("deliveredCard"), value: stats.statusCounts?.delivered || 0, color: "text-green-400" },
          ].map((s) => (
            <Card key={s.label} className="bg-dark-400 border-white/10">
              <CardContent className="p-3">
                <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-gold-400" />
          {t("ordersTitle")} ({total})
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchOrders(page, search, statusFilter)}
          className="bg-transparent border-white/10 text-gray-300 hover:text-gold-400"
        >
          <RefreshCw className="h-4 w-4 ml-2" />
          {t("refresh")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchOrders")}
              className="pr-10 bg-dark-400 border-white/10 text-white placeholder:text-gray-500 text-sm"
            />
          </div>
          <Button type="submit" size="sm" className="bg-gold-500 text-dark-900 hover:bg-gold-400">
            {t("searchLabel")}
          </Button>
        </form>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="bg-dark-400 border-white/10 text-white w-full sm:w-44">
            <SelectValue placeholder={t("allStatusesFilter")} />
          </SelectTrigger>
          <SelectContent className="bg-dark-400 border-white/10">
            <SelectItem value="all">{t("allStatusesFilter")}</SelectItem>
            <SelectItem value="pending">{t("statusPending")}</SelectItem>
            <SelectItem value="processing">{t("statusProcessing")}</SelectItem>
            <SelectItem value="shipped">{t("statusShipped")}</SelectItem>
            <SelectItem value="delivered">{t("statusDelivered")}</SelectItem>
            <SelectItem value="cancelled">{t("statusCancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{t("loadingProducts")}</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="bg-dark-400 border-white/10">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">{t("noProducts")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order._id} className="bg-dark-400 border-white/10 hover:border-white/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-mono text-sm text-white font-medium">{order.id}</p>
                      <Badge className={`text-[10px] border ${statusColors[order.status] || "bg-gray-500/20 text-gray-400"}`}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span>{order.shippingAddress?.name || "—"}</span>
                      {order.shippingAddress?.email && <span>{order.shippingAddress.email}</span>}
                      {order.shippingAddress?.phone && <span>{order.shippingAddress.phone}</span>}
                      <span>{order.shippingAddress?.city || order.shippingAddress?.governorate || "—"}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span>{order.items?.length || 0} {t("items")}</span>
                      <span>{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                      {order.discountCode && <span>{order.discountCode}</span>}
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-white font-bold text-sm">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(order.total)}
                    </p>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button size="sm" variant="outline" className="bg-transparent border-white/10 text-gray-300 hover:text-gold-400 hover:border-gold-500/30">
                        <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                        {t("viewAll")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page <= 1} className="bg-transparent border-white/10 text-gray-300">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-400">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page >= totalPages} className="bg-transparent border-white/10 text-gray-300">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
