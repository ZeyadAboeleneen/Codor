"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, X, Save, Cpu, ImagePlus, UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import type { Product } from "./models-tab"
import { uploadImageFile } from "@/lib/supabase-storage"

interface Brand { id: string; name_en: string; name_ar: string }

export interface Model {
  id: string
  name_en: string
  name_ar?: string
  slug: string
  product_id: string
  product_name_en?: string
  product_name_ar?: string
  brand_id: string
  brand_name_en?: string
  brand_name_ar?: string
  price: number
  before_sale_price?: number
  hp?: string
  kw?: string
  voltage?: string
  phase?: string
  max_head?: string
  max_flow?: string
  specifications?: Record<string, string>
  images: string[]
  description_en?: string
  description_ar?: string
  stock: number
  is_active: boolean
  is_featured: boolean
  sort_order: number
}

interface ModelsTabProps {
  models: Model[]
  setModels: React.Dispatch<React.SetStateAction<Model[]>>
  products: Product[]
  brands: Brand[]
  getAuthToken: () => string
}

const emptyForm = {
  name_en: "", name_ar: "", brand_id: "", product_id: "", price: "", before_sale_price: "",
  hp: "", kw: "", voltage: "", phase: "", max_head: "", max_flow: "",
  description_en: "", description_ar: "", is_featured: false, stock: "0"
}

export function VariantsTab({ models, setModels, products, brands, getAuthToken }: ModelsTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Model | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterBrand, setFilterBrand] = useState("all")
  const [filterProduct, setFilterProduct] = useState("all")
  const [specKey, setSpecKey] = useState("")
  const [specVal, setSpecVal] = useState("")
  const [customSpecs, setCustomSpecs] = useState<Record<string, string>>({})
  
  // Image states
  const [imagesList, setImagesList] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => { 
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
    setCustomSpecs({})
    setImagesList([]) 
  }

  const startEdit = (v: Model) => {
    setEditing(v)
    setForm({
      name_en: v.name_en, name_ar: v.name_ar || "", brand_id: v.brand_id, product_id: v.product_id,
      price: v.price.toString(), before_sale_price: v.before_sale_price?.toString() || "", stock: (v.stock || 0).toString(),
      hp: v.hp || "", kw: v.kw || "", max_head: v.max_head || "", max_flow: v.max_flow || "",
      voltage: v.voltage || "", phase: v.phase || "",
      description_en: v.description_en || "", description_ar: v.description_ar || "",
      is_featured: v.is_featured,
    })
    setCustomSpecs(v.specifications || {})
    setImagesList(v.images || [])
    setShowForm(true)
  }

  const addSpec = () => {
    if (specKey && specVal) { setCustomSpecs({ ...customSpecs, [specKey]: specVal }); setSpecKey(""); setSpecVal("") }
  }

  const removeSpec = (key: string) => {
    const next = { ...customSpecs }; delete next[key]; setCustomSpecs(next)
  }

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    try {
      setIsUploading(true)
      setUploadProgress({ current: 0, total: files.length })
      
      const newUrls: string[] = []
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(p => ({ ...p, current: i + 1 }))
        const url = await uploadImageFile(files[i], "models")
        newUrls.push(url)
      }
      
      setImagesList(prev => [...prev, ...newUrls])
      toast.success(`تم رفع ${files.length} صورة بنجاح`)
    } catch (error: any) {
      toast.error(error.message || "فشل رفع بعض الصور")
      console.error(error)
    } finally {
      setIsUploading(false)
      setUploadProgress({ current: 0, total: 0 })
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImagesList(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name_en || !form.product_id || !form.brand_id || !form.price) { toast.error("الحقول المطلوبة: الاسم، الماركة، المنتج، السعر"); return }

    const token = getAuthToken()
    const brand = brands.find(b => b.id === form.brand_id)
    const product = products.find(p => p.id === form.product_id)
    const slug = form.name_en.toLowerCase().replace(/\s+/g, "-")

    const payload = {
      name_en: form.name_en, name_ar: form.name_ar, slug,
      brand_id: form.brand_id, product_id: form.product_id,
      price: parseFloat(form.price), before_sale_price: form.before_sale_price ? parseFloat(form.before_sale_price) : null,
      stock: parseInt(form.stock) || 0,
      hp: form.hp || null, kw: form.kw || null,
      max_head: form.max_head || null, max_flow: form.max_flow || null, 
      voltage: form.voltage || null, phase: form.phase || null,
      specifications: Object.keys(customSpecs).length > 0 ? customSpecs : null,
      images: imagesList, 
      description_en: form.description_en || null, description_ar: form.description_ar || null,
      is_active: true, is_featured: form.is_featured,
    }

    try {
      if (editing) {
        const res = await fetch("/api/admin/variants", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editing.id, ...payload }),
        })
        if (res.ok) { 
          setModels(models.map(m => m.id === editing.id ? { 
            ...m, ...payload, 
            brand_name_en: brand?.name_en, brand_name_ar: brand?.name_ar,
            product_name_en: product?.name_en, product_name_ar: product?.name_ar 
          } as Model : m)); 
          toast.success("تم تحديث الموديل") 
        }
        else { toast.error("فشل التحديث") }
      } else {
        const res = await fetch("/api/admin/variants", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        if (res.ok) { 
          const data = await res.json(); 
          const newModel = { 
            ...data.item, 
            brand_name_en: brand?.name_en, brand_name_ar: brand?.name_ar,
            product_name_en: product?.name_en, product_name_ar: product?.name_ar 
          }
          setModels([...models, newModel]); 
          toast.success("تم إضافة الموديل") 
        }
        else { toast.error("فشل الإضافة") }
      }
      resetForm()
    } catch { toast.error("حدث خطأ") }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموديل؟")) return
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/admin/variants?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { setModels(models.filter(m => m.id !== id)); toast.success("تم الحذف") }
    } catch { toast.error("فشل الحذف") }
  }

  const toggleActive = async (model: Model) => {
    const token = getAuthToken()
    try {
      await fetch("/api/admin/variants", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: model.id, is_active: !model.is_active }),
      })
      setModels(models.map(m => m.id === model.id ? { ...m, is_active: !m.is_active } : m))
    } catch { toast.error("فشل التحديث") }
  }

  const filteredProductsForBrand = form.brand_id ? products.filter(p => p.brand_id === form.brand_id) : products
  const filterProductsForList = filterBrand === "all" ? products : products.filter(p => p.brand_id === filterBrand)

  let filtered = models
  if (filterBrand !== "all") filtered = filtered.filter(m => m.brand_id === filterBrand)
  if (filterProduct !== "all") filtered = filtered.filter(m => m.product_id === filterProduct)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-gold-400" /> الموديلات (التفاصيل والأسعار) ({filtered.length})
        </h2>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Select value={filterBrand} onValueChange={v => { setFilterBrand(v); setFilterProduct("all") }}>
            <SelectTrigger className="bg-dark-500 border-white/10 text-white w-[140px]"><SelectValue placeholder="الماركة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الماركات</SelectItem>
              {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name_ar}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterProduct} onValueChange={setFilterProduct}>
            <SelectTrigger className="bg-dark-500 border-white/10 text-white w-[140px]"><SelectValue placeholder="المنتج (النوع)" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المنتجات</SelectItem>
              {filterProductsForList.map(p => <SelectItem key={p.id} value={p.id}>{p.name_ar}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setShowForm(true) }} className="bg-gold-500 text-dark-900 hover:bg-gold-400 whitespace-nowrap" size="sm">
            <Plus className="h-4 w-4 ml-2" /> إضافة موديل
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-dark-400 border-white/10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">{editing ? "تعديل الموديل" : "إضافة موديل جديد"}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Basic Info */}
              <div className="space-y-4">
                <h3 className="text-gold-400 border-b border-white/10 pb-2 text-sm font-semibold">المعلومات الأساسية</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm">الماركة *</Label>
                    <Select value={form.brand_id} onValueChange={v => setForm({...form, brand_id: v, product_id: ""})}>
                      <SelectTrigger className="mt-1 bg-dark-500 border-white/10 text-white"><SelectValue placeholder="اختر الماركة" /></SelectTrigger>
                      <SelectContent>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name_ar}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">المنتج (النوع) *</Label>
                    <Select value={form.product_id} onValueChange={v => setForm({...form, product_id: v})}>
                      <SelectTrigger className="mt-1 bg-dark-500 border-white/10 text-white"><SelectValue placeholder="اختر المنتج" /></SelectTrigger>
                      <SelectContent>
                        {filteredProductsForBrand.length === 0
                          ? <SelectItem value="" disabled>اختر ماركة أولاً</SelectItem>
                          : filteredProductsForBrand.map(p => <SelectItem key={p.id} value={p.id}>{p.name_ar}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm">اسم الموديل (إنجليزي) * (مثال: APm 60)</Label>
                    <Input value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" required />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">اسم الموديل (عربي)</Label>
                    <Input value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                </div>
              </div>

              {/* 2. Pricing & Stock */}
              <div className="space-y-4">
                <h3 className="text-gold-400 border-b border-white/10 pb-2 text-sm font-semibold">السعر والمخزون</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm">السعر (ج.م) *</Label>
                    <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" required />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">السعر قبل الخصم (ج.م)</Label>
                    <Input type="number" value={form.before_sale_price} onChange={e => setForm({...form, before_sale_price: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">المخزون (الكمية)</Label>
                    <Input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                </div>
              </div>

              {/* 3. Specs */}
              <div className="space-y-4">
                <h3 className="text-gold-400 border-b border-white/10 pb-2 text-sm font-semibold">المواصفات الفنية</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm">القوة (HP - حصان)</Label>
                    <Input value={form.hp} onChange={e => setForm({...form, hp: e.target.value})} placeholder="0.5 HP" className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">القدرة الكهربائية (KW)</Label>
                    <Input value={form.kw} onChange={e => setForm({...form, kw: e.target.value})} placeholder="0.37 KW" className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">أقصى ارتفاع (Max Head - m)</Label>
                    <Input value={form.max_head} onChange={e => setForm({...form, max_head: e.target.value})} placeholder="30m" className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">أقصى تدفق (Max Flow - l/min)</Label>
                    <Input value={form.max_flow} onChange={e => setForm({...form, max_flow: e.target.value})} placeholder="40 l/min" className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">الفولت (Voltage)</Label>
                    <Input value={form.voltage} onChange={e => setForm({...form, voltage: e.target.value})} placeholder="220V" className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">الفاز (Phase)</Label>
                    <Input value={form.phase} onChange={e => setForm({...form, phase: e.target.value})} placeholder="Single" className="mt-1 bg-dark-500 border-white/10 text-white" />
                  </div>
                </div>

                {/* Custom Specs */}
                <div className="pt-2">
                  <Label className="text-gray-300 text-sm mb-2 block">مواصفات إضافية</Label>
                  <div className="flex gap-2 mb-2">
                    <Input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="اسم المواصفة (مثال: المنشأ)" className="bg-dark-500 border-white/10 text-white flex-1" />
                    <Input value={specVal} onChange={e => setSpecVal(e.target.value)} placeholder="القيمة (مثال: إيطاليا)" className="bg-dark-500 border-white/10 text-white flex-1" />
                    <Button type="button" onClick={addSpec} variant="outline" size="sm" className="border-gold-500/30 text-gold-400">+</Button>
                  </div>
                  {Object.entries(customSpecs).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                      <span className="text-gold-400">{k}:</span> <span>{v}</span>
                      <button type="button" onClick={() => removeSpec(k)} className="text-red-400 text-xs hover:text-red-300">×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Media (Multiple Uploads) */}
              <div className="space-y-4">
                <h3 className="text-gold-400 border-b border-white/10 pb-2 text-sm font-semibold">الميديا والوصف</h3>
                
                <div className="space-y-3">
                  <Label className="text-gray-300 text-sm">صور الموديل (يمكنك تحديد أكثر من صورة معاً)</Label>
                  
                  <div className="p-4 border-2 border-dashed border-white/10 rounded-xl bg-dark-500/50">
                    <div className="flex items-center gap-4 mb-4">
                      <Button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        disabled={isUploading}
                        className="bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 border border-gold-500/30"
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <UploadCloud className="h-4 w-4 ml-2" />}
                        {isUploading ? `جاري الرفع... ${uploadProgress.current}/${uploadProgress.total}` : 'اختر صور للرفع'}
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleMultipleFileUpload} 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                      />
                    </div>
                    
                    {imagesList.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {imagesList.map((url, i) => (
                          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20 group">
                            <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button" 
                                onClick={() => removeImage(i)}
                                className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 text-sm">وصف (عربي)</Label>
                    <Textarea value={form.description_ar} onChange={e => setForm({...form, description_ar: e.target.value})} rows={3} className="mt-1 bg-dark-500 border-white/10 text-white resize-none" />
                  </div>
                  <div>
                    <Label className="text-gray-300 text-sm">وصف (إنجليزي)</Label>
                    <Textarea value={form.description_en} onChange={e => setForm({...form, description_en: e.target.value})} rows={3} className="mt-1 bg-dark-500 border-white/10 text-white resize-none" />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-lg w-max border border-white/10 hover:border-gold-500/30">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="rounded border-white/20 accent-gold-500 w-4 h-4" />
                <span className="text-white text-sm font-medium">موديل مميز (يظهر في الصفحة الرئيسية)</span>
              </label>

              <Button type="submit" className="w-full bg-gold-500 text-dark-900 hover:bg-gold-400 font-semibold h-12" disabled={isUploading}>
                <Save className="h-5 w-5 ml-2" /> {editing ? "حفظ التعديلات" : "إضافة الموديل"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 ? (
        <Card className="bg-dark-400 border-white/10">
          <CardContent className="py-12 text-center">
            <Cpu className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">لا توجد موديلات. {products.length === 0 ? "أضف منتج أولاً." : "ابدأ بإضافة موديل جديد."}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(v => (
            <Card key={v.id} className="bg-dark-400 border-white/10 hover:border-gold-500/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    {v.images?.[0] ? (
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 border border-white/10">
                        <Image src={v.images[0]} alt={v.name_en} width={56} height={56} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gold-500/10 flex items-center justify-center flex-shrink-0 border border-gold-500/20">
                        <ImagePlus className="h-6 w-6 text-gold-400/50" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white text-lg truncate">{v.name_en} {v.name_ar && <span className="text-gray-400 text-sm font-normal">({v.name_ar})</span>}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="text-gold-400">{v.brand_name_ar || v.brand_id}</span> → <span className="text-blue-400">{v.product_name_ar || v.product_id}</span>
                        {v.hp && <span className="text-gray-300"> • <Badge variant="outline" className="text-[10px] h-4 border-white/10">{v.hp}</Badge></span>}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-gold-400 font-bold">{v.price.toLocaleString()} ج.م</span>
                        {v.before_sale_price && v.before_sale_price > v.price && (
                          <span className="text-gray-500 text-xs line-through">{v.before_sale_price.toLocaleString()} ج.م</span>
                        )}
                        {v.is_featured && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] h-5">مميز</Badge>}
                        {v.images?.length > 1 && <Badge variant="outline" className="text-[10px] h-5 bg-white/5 border-white/10">+{v.images.length - 1} صور</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Badge className={`cursor-pointer text-xs ${v.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`} onClick={() => toggleActive(v)}>
                      {v.is_active ? "مفعّل" : "معطّل"}
                    </Badge>
                    {v.stock === 0 && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">نفذ</Badge>}
                    <Button variant="ghost" size="sm" onClick={() => startEdit(v)} className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0"><Trash2 className="h-4 w-4" /></Button>
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
