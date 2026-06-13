"use client"

import React, { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, X, Save, Image as ImageIcon, UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import type { Product } from "./models-tab"
import { uploadImageFile } from "@/lib/supabase-storage"

export interface HeroSlide {
  id: string
  title_ar: string
  title_en: string
  subtitle_ar?: string
  subtitle_en?: string
  image_url: string
  link_url?: string
  product_id?: string
  product_name_en?: string
  product_name_ar?: string
  sort_order: number
  is_active: boolean
}

interface HeroTabProps {
  slides: HeroSlide[]
  setSlides: React.Dispatch<React.SetStateAction<HeroSlide[]>>
  products: Product[]
  getAuthToken: () => string
}

const emptyForm = {
  title_ar: "", title_en: "", subtitle_ar: "", subtitle_en: "", image_url: "", link_url: "", product_id: "none", sort_order: ""
}

export function HeroTab({ slides, setSlides, products, getAuthToken }: HeroTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<HeroSlide | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false) }

  const startEdit = (slide: HeroSlide) => {
    setEditing(slide)
    setForm({
      title_ar: slide.title_ar, title_en: slide.title_en,
      subtitle_ar: slide.subtitle_ar || "", subtitle_en: slide.subtitle_en || "",
      image_url: slide.image_url, link_url: slide.link_url || "",
      product_id: slide.product_id || "none",
      sort_order: (slide.sort_order || 0).toString()
    })
    setShowForm(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      setIsUploading(true)
      const publicUrl = await uploadImageFile(file, "hero_slides")
      setForm(prev => ({ ...prev, image_url: publicUrl }))
      toast.success("تم رفع الصورة بنجاح")
    } catch (error: any) {
      toast.error(error.message || "فشل رفع الصورة")
      console.error(error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title_en || !form.title_ar || !form.image_url) { toast.error("العنوان والصورة مطلوبين"); return }

    const token = getAuthToken()
    const payload = {
      title_ar: form.title_ar, title_en: form.title_en,
      subtitle_ar: form.subtitle_ar || null, subtitle_en: form.subtitle_en || null,
      image_url: form.image_url,
      link_url: form.link_url || null,
      product_id: form.product_id === "none" ? null : form.product_id,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: true
    }

    try {
      if (editing) {
        const res = await fetch("/api/admin/hero-slides", {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editing.id, ...payload }),
        })
        if (res.ok) { 
          const product = products.find(p => p.id === payload.product_id)
          setSlides(slides.map(s => s.id === editing.id ? { ...s, ...payload, product_name_ar: product?.name_ar, product_name_en: product?.name_en } as HeroSlide : s)); 
          toast.success("تم تحديث الشريحة") 
        }
        else { toast.error("فشل التحديث") }
      } else {
        const res = await fetch("/api/admin/hero-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        })
        if (res.ok) { 
          const data = await res.json(); 
          const product = products.find(p => p.id === payload.product_id)
          setSlides([...slides, { ...data.item, product_name_ar: product?.name_ar, product_name_en: product?.name_en }]); 
          toast.success("تم الإضافة بنجاح") 
        }
        else { 
            const error = await res.json()
            toast.error(error.error || "فشل الإضافة") 
        }
      }
      resetForm()
    } catch { toast.error("حدث خطأ") }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return
    try {
      const token = getAuthToken()
      const res = await fetch(`/api/admin/hero-slides?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) { setSlides(slides.filter(s => s.id !== id)); toast.success("تم الحذف") }
    } catch { toast.error("فشل الحذف") }
  }

  const toggleActive = async (slide: HeroSlide) => {
    const token = getAuthToken()
    try {
      await fetch("/api/admin/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: slide.id, is_active: !slide.is_active }),
      })
      setSlides(slides.map(s => s.id === slide.id ? { ...s, is_active: !s.is_active } : s))
    } catch { toast.error("فشل التحديث") }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-gold-400" />
          صور الهيرو الرئيسية ({slides.length} / 7)
        </h2>
        <Button 
          onClick={() => { resetForm(); setShowForm(true) }} 
          className="bg-gold-500 text-dark-900 hover:bg-gold-400" 
          size="sm"
          disabled={slides.length >= 7 && !editing}
        >
          <Plus className="h-4 w-4 ml-2" /> إضافة صورة
        </Button>
      </div>

      {showForm && (
        <Card className="bg-dark-400 border-white/10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white">{editing ? "تعديل الشريحة" : "إضافة شريحة جديدة"}</CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm">العنوان الرئيسي (إنجليزي) *</Label>
                  <Input value={form.title_en} onChange={e => setForm({...form, title_en: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" required />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">العنوان الرئيسي (عربي) *</Label>
                  <Input value={form.title_ar} onChange={e => setForm({...form, title_ar: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" required />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm">العنوان الفرعي (إنجليزي)</Label>
                  <Input value={form.subtitle_en} onChange={e => setForm({...form, subtitle_en: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">العنوان الفرعي (عربي)</Label>
                  <Input value={form.subtitle_ar} onChange={e => setForm({...form, subtitle_ar: e.target.value})} className="mt-1 bg-dark-500 border-white/10 text-white" />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label className="text-gray-300 text-sm">صورة الهيرو (الخلفية) *</Label>
                
                <div className="flex flex-col gap-4 p-4 border-2 border-dashed border-white/10 rounded-xl bg-dark-500/50 hover:border-gold-500/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <Button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isUploading}
                      className="bg-dark-300 text-white hover:bg-dark-200 border border-white/10"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <UploadCloud className="h-4 w-4 ml-2" />}
                      رفع صورة من الجهاز
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <span className="text-gray-500 text-sm">أو</span>
                    <Input 
                      value={form.image_url} 
                      onChange={e => setForm({...form, image_url: e.target.value})} 
                      placeholder="رابط الصورة (URL)" 
                      className="bg-dark-500 border-white/10 text-white flex-1" 
                    />
                  </div>
                  
                  {form.image_url && (
                    <div className="w-full h-48 relative rounded-lg overflow-hidden border border-white/10">
                      <Image src={form.image_url} alt="preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 text-sm">ربط الصورة بمنتج (عند الضغط عليها)</Label>
                  <Select value={form.product_id} onValueChange={v => setForm({...form, product_id: v})}>
                    <SelectTrigger className="mt-1 bg-dark-500 border-white/10 text-white"><SelectValue placeholder="بدون ربط" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون ربط</SelectItem>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name_ar}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">إذا اخترت منتج، الضغط على الصورة سينقل العميل إليه</p>
                </div>
                <div>
                  <Label className="text-gray-300 text-sm">أو ضع رابط خارجي / مخصص</Label>
                  <Input value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} placeholder="/offers" className="mt-1 bg-dark-500 border-white/10 text-white" disabled={form.product_id !== "none"} />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 text-sm">الترتيب (Sort Order)</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} placeholder="1" className="mt-1 bg-dark-500 border-white/10 text-white w-32" />
              </div>

              <Button type="submit" className="w-full bg-gold-500 text-dark-900 hover:bg-gold-400 font-semibold h-12" disabled={isUploading}>
                <Save className="h-5 w-5 ml-2" /> {editing ? "تحديث الشريحة" : "إضافة الشريحة"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {slides.length === 0 ? (
        <Card className="bg-dark-400 border-white/10">
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">لا توجد صور. ابدأ بإضافة الصورة الأولى.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {slides.map(slide => (
            <Card key={slide.id} className="bg-dark-400 border-white/10 hover:border-gold-500/30 transition-colors overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-40 relative flex-shrink-0 bg-dark-500">
                  <Image src={slide.image_url} alt={slide.title_ar} fill className="object-cover" />
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">{slide.title_ar}</h3>
                      <p className="text-sm text-gray-400 mt-1">{slide.subtitle_ar}</p>
                      
                      <div className="mt-3">
                        {slide.product_id ? (
                          <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-400/10 text-xs">
                            🔗 مرتبطة بمنتج: {slide.product_name_ar || "Unknown"}
                          </Badge>
                        ) : slide.link_url ? (
                          <Badge variant="outline" className="text-gray-400 border-gray-400/30 bg-gray-400/10 text-xs">
                            🔗 رابط: {slide.link_url}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`cursor-pointer text-xs ${slide.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`} onClick={() => toggleActive(slide)}>
                        {slide.is_active ? "مفعّل" : "معطّل"}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(slide)} className="text-blue-400 hover:text-blue-300 h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(slide.id)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
