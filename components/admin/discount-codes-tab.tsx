"use client"

import { useState, useCallback, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ticket, Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight, X } from "lucide-react"

interface DiscountCode {
  id: string
  code: string
  type: string
  value: number
  minOrderAmount?: number
  maxUses?: number
  currentUses: number
  isActive: boolean
  expiresAt?: string | null
  description?: string
  buyX?: number
  getX?: number
  discountPercentage?: number
}

interface DiscountCodesTabProps {
  getAuthToken: () => string
}

export function DiscountCodesTab({ getAuthToken }: DiscountCodesTabProps) {
  const t = useTranslations()
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
    description: "",
    buyX: "",
    getX: "",
    discountPercentage: "",
  })

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const res = await fetch("/api/discount-codes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setCodes(data || [])
      }
    } catch (error) {
      console.error("Error fetching discount codes:", error)
    } finally {
      setLoading(false)
    }
  }, [getAuthToken])

  useEffect(() => {
    fetchCodes()
  }, [fetchCodes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")
    try {
      const token = getAuthToken()
      const res = await fetch("/api/discount-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code: form.code,
          type: form.type,
          value: form.value ? Number(form.value) : undefined,
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
          description: form.description || undefined,
          buyX: form.buyX ? Number(form.buyX) : undefined,
          getX: form.getX ? Number(form.getX) : undefined,
          discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : undefined,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(t("discountCodeAdded"))
        setShowForm(false)
        setForm({ code: "", type: "percentage", value: "", minOrderAmount: "", maxUses: "", expiresAt: "", description: "", buyX: "", getX: "", discountPercentage: "" })
        fetchCodes()
      } else {
        setError(data.error || t("discountCodeAddFailed"))
      }
    } catch {
      setError(t("discountCodeAddError"))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (code: DiscountCode) => {
    setTogglingId(code.id)
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/discount-codes?id=${code.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !code.isActive }),
      })
      if (res.ok) {
        setCodes((prev) =>
          prev.map((c) => (c.id === code.id ? { ...c, isActive: !code.isActive } : c))
        )
      }
    } catch (error) {
      console.error("Error toggling discount code:", error)
    } finally {
      setTogglingId(null)
    }
  }

  const deleteCode = async (id: string) => {
    setDeletingId(id)
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/discount-codes?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setCodes((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error("Error deleting discount code:", error)
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  const typeLabels: Record<string, string> = {
    percentage: t("discountTypePercentage"),
    fixed: t("discountTypeFixed"),
    buyXgetX: t("discountTypeBuyXGetX"),
    buyXgetYpercent: t("discountTypeBuyXGetYPercent"),
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Ticket className="h-5 w-5 text-gold-400" />
          {t("discountCodesTitle")} ({codes.length})
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCodes}
            className="bg-transparent border-white/10 text-gray-300 hover:text-gold-400"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => { setShowForm(true); setError(""); setSuccess("") }}
            className="bg-gold-500 text-dark-900 hover:bg-gold-400"
          >
            <Plus className="h-4 w-4 ml-1" />
            {t("addDiscountCode")}
          </Button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">{success}</div>
      )}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {showForm && (
        <Card className="bg-dark-400 border-gold-500/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">{t("addNewDiscountCode")}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">{t("discountCodeField")} *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER20"
                    required
                    className="bg-dark-500 border-white/10 text-white uppercase"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">{t("discountType")} *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger className="bg-dark-500 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-400 border-white/10">
                      <SelectItem value="percentage">{t("discountTypePercentage")}</SelectItem>
                      <SelectItem value="fixed">{t("discountTypeFixed")}</SelectItem>
                      <SelectItem value="buyXgetX">{t("discountTypeBuyXGetX")}</SelectItem>
                      <SelectItem value="buyXgetYpercent">{t("discountTypeBuyXGetYPercent")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(form.type === "percentage" || form.type === "fixed") && (
                  <div>
                    <Label className="text-gray-300 text-sm mb-1 block">
                      {form.type === "percentage" ? t("discountValuePct") : t("discountValueFixed")} *
                    </Label>
                    <Input
                      type="number"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      placeholder={form.type === "percentage" ? "20" : "50"}
                      min="0"
                      required
                      className="bg-dark-500 border-white/10 text-white"
                    />
                  </div>
                )}

                {form.type === "buyXgetX" && (
                  <>
                    <div>
                      <Label className="text-gray-300 text-sm mb-1 block">{t("buyQuantityX")}</Label>
                      <Input
                        type="number"
                        value={form.buyX}
                        onChange={(e) => setForm({ ...form, buyX: e.target.value })}
                        placeholder="2"
                        min="1"
                        className="bg-dark-500 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm mb-1 block">{t("getQuantityX")}</Label>
                      <Input
                        type="number"
                        value={form.getX}
                        onChange={(e) => setForm({ ...form, getX: e.target.value })}
                        placeholder="1"
                        min="1"
                        className="bg-dark-500 border-white/10 text-white"
                      />
                    </div>
                  </>
                )}

                {form.type === "buyXgetYpercent" && (
                  <>
                    <div>
                      <Label className="text-gray-300 text-sm mb-1 block">{t("buyQuantityX")}</Label>
                      <Input
                        type="number"
                        value={form.buyX}
                        onChange={(e) => setForm({ ...form, buyX: e.target.value })}
                        placeholder="2"
                        min="1"
                        className="bg-dark-500 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm mb-1 block">{t("discountPct")}</Label>
                      <Input
                        type="number"
                        value={form.discountPercentage}
                        onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                        placeholder="50"
                        min="0"
                        max="100"
                        className="bg-dark-500 border-white/10 text-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">{t("minOrderAmount")}</Label>
                  <Input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder={t("optional")}
                    min="0"
                    className="bg-dark-500 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">{t("maxUses")}</Label>
                  <Input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                    placeholder={t("optional")}
                    min="1"
                    className="bg-dark-500 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">{t("expiryDate")}</Label>
                  <Input
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="bg-dark-500 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm mb-1 block">{t("descriptionOptional")}</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder={t("optional")}
                    className="bg-dark-500 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="bg-transparent border-white/10 text-gray-300"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gold-500 text-dark-900 hover:bg-gold-400"
                >
                  {submitting ? <RefreshCw className="h-4 w-4 animate-spin ml-2" /> : null}
                  {t("addCode")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{t("loadingCodes")}</p>
        </div>
      ) : codes.length === 0 ? (
        <Card className="bg-dark-400 border-white/10">
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">{t("noDiscountCodes")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {codes.map((code) => (
            <Card
              key={code.id}
              className={`border-white/10 transition-colors ${code.isActive ? "bg-dark-400" : "bg-dark-500 opacity-70"}`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-mono text-white font-bold tracking-wider">{code.code}</p>
                      <Badge className={`text-[10px] border ${
                        code.isActive
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }`}>
                        {code.isActive ? t("discountActive") : t("discountInactive")}
                      </Badge>
                      <Badge className="text-[10px] border bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {typeLabels[code.type] || code.type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      {(code.type === "percentage" || code.type === "fixed") && (
                        <span>
                          {t("discountValue")}: {code.type === "percentage" ? `${code.value}%` : `${code.value} ${t("egp")}`}
                        </span>
                      )}
                      {code.buyX && code.getX && (
                        <span>{t("buyQuantityX")} {code.buyX} → {t("getQuantityX")} {code.getX}</span>
                      )}
                      {code.buyX && code.discountPercentage && (
                        <span>{t("buyQuantityX")} {code.buyX} → {code.discountPercentage}%</span>
                      )}
                      {code.minOrderAmount && <span>{t("minOrder")}: {code.minOrderAmount} {t("egp")}</span>}
                      <span>
                        {t("usageCount")}: {code.currentUses}{code.maxUses ? `/${code.maxUses}` : ""}
                      </span>
                      {code.expiresAt && (
                        <span>{t("expiresLabel")}: {new Date(code.expiresAt).toLocaleDateString()}</span>
                      )}
                      {code.description && <span>{code.description}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(code)}
                      disabled={togglingId === code.id}
                      className="bg-transparent border-white/10 text-gray-300 hover:text-gold-400 hover:border-gold-500/30 text-xs"
                    >
                      {togglingId === code.id ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : code.isActive ? (
                        <><ToggleRight className="h-3.5 w-3.5 ml-1 text-green-400" /> {t("disableCode")}</>
                      ) : (
                        <><ToggleLeft className="h-3.5 w-3.5 ml-1" /> {t("enableCode")}</>
                      )}
                    </Button>

                    {confirmDelete === code.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => deleteCode(code.id)}
                          disabled={deletingId === code.id}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-2"
                        >
                          {t("confirm")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDelete(null)}
                          className="bg-transparent border-white/10 text-gray-400 text-xs h-7 px-2"
                        >
                          {t("cancel")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDelete(code.id)}
                        className="bg-transparent border-white/10 text-red-400 hover:text-red-300 hover:border-red-500/30 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
