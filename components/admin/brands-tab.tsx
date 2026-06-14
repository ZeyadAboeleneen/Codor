"use client"

import React, { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, X, Save, Building2, UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { uploadImageFile } from "@/lib/supabase-storage"

interface Brand {
  id: string
  name_en: string
  name_ar: string
  slug: string
  logo_url: string
  description_en?: string
  description_ar?: string
  is_active: boolean
  sort_order: number
}

interface BrandsTabProps {
  brands: Brand[]
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>
  getAuthToken: () => string
}

const emptyForm = {
  name_en: "", name_ar: "", slug: "", logo_url: "", description_en: "", description_ar: ""
}

export function BrandsTab({ brands, setBrands, getAuthToken }: BrandsTabProps) {
  const t = useTranslations()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
  }

  const startEdit = (brand: Brand) => {
    setEditing(brand)
    setForm({
      name_en: brand.name_en,
      name_ar: brand.name_ar || "",
      slug: brand.slug,
      logo_url: brand.logo_url || "",
      description_en: brand.description_en || "",
      description_ar: brand.description_ar || "",
    })
    setShowForm(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setIsUploading(true)
      const publicUrl = await uploadImageFile(file, "brands")
      setForm(prev => ({ ...prev, logo_url: publicUrl }))
      toast.success(t("logoUploadSuccess"))
    } catch (error: any) {
      toast.error(error.message || t("logoUploadError"))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name_en || !form.name_ar) { toast.error(t("brandNameRequired")); return }

    const token = getAuthToken()
    const slug = form.slug || form.name_en.toLowerCase().replace(/\s+/g, "-")
    const payload: Record<string, any> = {
      name_en: form.name_en,
      name_ar: form.name_ar,
      slug,
      logo_url: form.logo_url || null,
    }
    if (form.description_en) payload.description_en = form.description_en
    if (form.description_ar) payload.description_ar = form.description_ar

    try {
      if (editing) {
        const res = await fetch("/api/admin/brands", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editing.id, ...payload }),
        })
        if (res.ok) {
          setBrands(brands.map(b => b.id === editing.id ? { ...b, ...payload } : b))
          toast.success(t("brandUpdated"))
        } else { toast.error(t("updateFailed")) }
      } else {
        const res = await fetch("/api/admin/brands", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const data = await res.json()
          setBrands([...brands, data.item])
          toast.success(t("brandAdded"))
        } else { toast.error(t("addFailed")) }
      }
      resetForm()
    } catch { toast.error(t("errorOccurred")) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDeleteBrand"))) return
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/admin/brands?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setBrands(brands.filter(b => b.id !== id))
        toast.success(t("brandDeleted"))
      }
    } catch { toast.error(t("deleteFailed")) }
  }

  const toggleActive = async (brand: Brand) => {
    const token = getAuthToken()
    const newActive = brand.is_active === false ? true : brand.is_active === true ? false : false
    try {
      const res = await fetch("/api/admin/brands", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: brand.id, is_active: newActive }),
      })
      if (res.ok) {
        setBrands(brands.map(b => b.id === brand.id ? { ...b, is_active: newActive } : b))
      } else {
        toast.error(t("updateFailed"))
      }
    } catch { toast.error(t("updateFailed")) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gold-400" />
          {t("brandsTitle")} ({brands.length})
        </h2>
        <Button onClick={() => { resetForm(); setShowForm(true) }} className="bg-gold-500 text-dark-900 hover:bg-gold-400" size="sm">
          <Plus className="h-4 w-4 ml-2" /> {t("addNewBrand")}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-dark-400 border-white/10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">{editing ? t("editBrand") : t("addNewBrand")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm">{t("brandNameEn")}</Label>
                  <Input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} placeholder="Leo" className="mt-1 bg-dark-500 border-white/10 text-white" required />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">{t("brandNameAr")}</Label>
                  <Input value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} placeholder="Leo" className="mt-1 bg-dark-500 border-white/10 text-white" required />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-sm">{t("brandLogo")}</Label>
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
                      value={form.logo_url}
                      onChange={e => setForm({...form, logo_url: e.target.value})}
                      placeholder="https://..."
                      className="bg-dark-500 border-white/10 text-white flex-1"
                    />
                  </div>
                  {form.logo_url && (
                    <div className="w-24 h-24 bg-white/5 rounded-lg p-3 flex items-center justify-center border border-white/10">
                      <Image src={form.logo_url} alt="Logo preview" width={72} height={72} className="object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm">Slug</Label>
                  <Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="leo" className="mt-1 bg-dark-500 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">{t("descriptionAr")}</Label>
                  <Input value={form.description_ar} onChange={e => setForm({...form, description_ar: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" />
                </div>
              </div>

              <Button type="submit" className="w-full bg-gold-500 text-dark-900 hover:bg-gold-400 font-semibold h-12" disabled={isUploading}>
                <Save className="h-5 w-5 ml-2" /> {editing ? t("saveChanges") : t("addLabel")}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {brands.length === 0 ? (
        <Card className="bg-dark-400 border-white/10">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">{t("noBrandsYet")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {brands.map(brand => (
            <Card key={brand.id} className="bg-dark-400 border-white/10 hover:border-gold-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {brand.logo_url ? (
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden p-1 border border-white/10">
                        <Image src={brand.logo_url} alt={brand.name_en} width={48} height={48} className="object-contain filter grayscale hover:grayscale-0 transition-all" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                        <Building2 className="h-6 w-6 text-gold-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-white">{brand.name_en}</p>
                      <p className="text-xs text-gray-500">slug: {brand.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`cursor-pointer text-xs ${brand.is_active !== false ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}
                      onClick={() => toggleActive(brand)}
                    >
                      {brand.is_active !== false ? t("activeStatus") : t("inactiveStatus")}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(brand)} className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(brand.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
