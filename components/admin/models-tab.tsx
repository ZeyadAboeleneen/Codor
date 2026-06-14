"use client"

import React, { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, X, Save, Package, UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { uploadImageFile } from "@/lib/supabase-storage"

interface Brand { id: string; name_en: string; name_ar: string }

export interface Product {
  id: string
  name_en: string
  name_ar: string
  slug: string
  brand_id: string
  brand_name_en?: string
  brand_name_ar?: string
  image_url?: string
  description_en?: string
  description_ar?: string
  is_active: boolean
  sort_order: number
}

interface ProductsTabProps {
  products: Product[]
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
  brands: Brand[]
  getAuthToken: () => string
}

const emptyForm = { name_en: "", name_ar: "", slug: "", brand_id: "", image_url: "", description_en: "", description_ar: "" }

export function ProductsTab({ products, setProducts, brands, getAuthToken }: ProductsTabProps) {
  const t = useTranslations()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterBrand, setFilterBrand] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false) }

  const startEdit = (product: Product) => {
    setEditing(product)
    setForm({
      name_en: product.name_en,
      name_ar: product.name_ar,
      slug: product.slug,
      brand_id: product.brand_id,
      image_url: product.image_url || "",
      description_en: product.description_en || "",
      description_ar: product.description_ar || ""
    })
    setShowForm(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const publicUrl = await uploadImageFile(file, "products")
      setForm(prev => ({ ...prev, image_url: publicUrl }))
      toast.success(t("imageUploadSuccess"))
    } catch (error: any) {
      toast.error(error.message || t("imageUploadError"))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name_en || !form.name_ar || !form.brand_id) { toast.error(t("nameAndBrandRequired")); return }

    const token = getAuthToken()
    const slug = form.slug || form.name_en.toLowerCase().replace(/\s+/g, "-")
    const payload = { ...form, slug, is_active: true }

    try {
      if (editing) {
        const res = await fetch("/api/admin/models", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editing.id, ...payload }),
        })
        if (res.ok) {
          const brand = brands.find(b => b.id === payload.brand_id)
          setProducts(products.map(p => p.id === editing.id ? { ...p, ...payload, brand_name_en: brand?.name_en, brand_name_ar: brand?.name_ar } as Product : p))
          toast.success(t("productUpdated"))
        } else { toast.error(t("updateFailed")) }
      } else {
        const res = await fetch("/api/admin/models", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const data = await res.json()
          const brand = brands.find(b => b.id === payload.brand_id)
          const newProduct = { ...data.item, brand_name_en: brand?.name_en, brand_name_ar: brand?.name_ar }
          setProducts([...products, newProduct])
          toast.success(t("productAdded"))
        } else { toast.error(t("addFailed")) }
      }
      resetForm()
    } catch { toast.error(t("errorOccurred")) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDeleteProduct"))) return
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/admin/models?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { setProducts(products.filter(p => p.id !== id)); toast.success(t("productDeleted")) }
    } catch { toast.error(t("deleteFailed")) }
  }

  const toggleActive = async (product: Product) => {
    const token = getAuthToken()
    try {
      const res = await fetch("/api/admin/models", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: product.id, is_active: !product.is_active }),
      })
      if (res.ok) { setProducts(products.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p)) }
    } catch { toast.error(t("updateFailed")) }
  }

  const filteredProducts = filterBrand === "all" ? products : products.filter(p => p.brand_id === filterBrand)
  const getBrandName = (brandId: string) => brands.find(b => b.id === brandId)?.name_en || brandId

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Package className="h-5 w-5 text-gold-400" /> {t("productsTitle")} ({filteredProducts.length})
        </h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={filterBrand} onValueChange={setFilterBrand}>
            <SelectTrigger className="bg-dark-500 border-white/10 text-white w-full sm:w-[180px]">
              <SelectValue placeholder={t("allBrandsFilter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allBrandsFilter")}</SelectItem>
              {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name_en}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setShowForm(true) }} className="bg-gold-500 text-dark-900 hover:bg-gold-400 whitespace-nowrap" size="sm">
            <Plus className="h-4 w-4 ml-2" /> {t("addProductButton")}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-dark-400 border-white/10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">{editing ? t("editProduct") : t("addNewProduct")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-gray-300 text-sm">{t("brandSelect")}</Label>
                <Select value={form.brand_id} onValueChange={v => setForm({...form, brand_id: v})}>
                  <SelectTrigger className="mt-1 bg-dark-500 border-white/10 text-white"><SelectValue placeholder={t("brandSelect")} /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name_en} ({b.name_ar})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm">{t("productNameEn")}</Label>
                  <Input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" required />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">{t("productNameAr")}</Label>
                  <Input value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" required />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-sm">{t("productImage")}</Label>
                <div className="mt-2 flex flex-col gap-4 p-4 border border-dashed border-white/20 rounded-xl bg-dark-500/50">
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-dark-300 text-white hover:bg-dark-200 border border-white/10"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <UploadCloud className="h-4 w-4 ml-2" />}
                      {t("uploadFromDevice")}
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    <span className="text-gray-500 text-sm">{t("orUrl")}</span>
                    <Input
                      value={form.image_url}
                      onChange={e => setForm({...form, image_url: e.target.value})}
                      placeholder="https://..."
                      className="bg-dark-500 border-white/10 text-white flex-1"
                    />
                  </div>
                  {form.image_url && (
                    <div className="w-24 h-24 bg-white/5 rounded-lg p-3 flex items-center justify-center border border-white/10">
                      <Image src={form.image_url} alt="Product preview" width={72} height={72} className="object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm">Slug</Label>
                  <Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="apm-peripheral" className="mt-1 bg-dark-500 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">{t("productDescAr")}</Label>
                  <Input value={form.description_ar} onChange={e => setForm({...form, description_ar: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" />
                </div>
              </div>

              <Button type="submit" className="w-full bg-gold-500 text-dark-900 hover:bg-gold-400 font-semibold h-12" disabled={isUploading}>
                <Save className="h-5 w-5 ml-2" /> {editing ? t("saveChanges") : t("addProductButton")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {filteredProducts.length === 0 ? (
        <Card className="bg-dark-400 border-white/10">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">{brands.length === 0 ? t("addBrandFirst") : t("addNewProduct")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredProducts.map(product => (
            <Card key={product.id} className="bg-dark-400 border-white/10 hover:border-gold-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {product.image_url ? (
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
                        <Image src={product.image_url} alt={product.name_en} width={48} height={48} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                        <Package className="h-6 w-6 text-gold-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{product.name_en}</p>
                      <p className="text-xs text-gray-500"><span className="text-gold-400">{getBrandName(product.brand_id)}</span> • slug: {product.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`cursor-pointer text-xs ${product.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`} onClick={() => toggleActive(product)}>
                      {product.is_active ? t("activeStatus") : t("inactiveStatus")}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(product)} className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
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
