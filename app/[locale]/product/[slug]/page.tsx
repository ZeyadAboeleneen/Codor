"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ShoppingCart, ArrowRight, Info, Cpu } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/use-currency"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useCurrencyFormatter()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`/api/products/by-slug/${slug}`)
        if (res.ok) {
          const result = await res.json()
          setData(result)
        } else {
          console.error("Failed to fetch product details")
        }
      } catch (err) {
        console.error("Error fetching product details:", err)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchProductDetails()
  }, [slug])

  const handleAddToCart = (model: any) => {
    addToCart({
      id: model.id,
      name: `${data.name_ar} - ${model.name_ar || model.name_en}`,
      price: model.price,
      quantity: 1,
      image: model.images?.[0] || data.image_url || "/placeholder.svg",
    })
    toast.success("تم إضافة الموديل إلى السلة")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-600 flex flex-col">
        <Navigation />
        <main className="flex-grow pt-32 pb-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-600 flex flex-col">
        <Navigation />
        <main className="flex-grow pt-32 pb-12 flex items-center justify-center text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">المنتج غير موجود</h1>
            <button onClick={() => router.push('/products')} className="text-gold-500 hover:underline">
              العودة للمنتجات
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-600 flex flex-col" dir="rtl">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-12">
        {/* Breadcrumb & Navigation */}
        <div className="condor-container mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة</span>
          </button>
        </div>

        {/* Product Overview Section */}
        <section className="condor-container mb-16">
          <div className="bg-dark-500 rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row">
            {/* Image Box */}
            <div className="w-full md:w-1/3 bg-dark-300 relative aspect-square md:aspect-auto flex items-center justify-center p-8">
              {data.brand && (
                <div className="absolute top-4 right-4 z-10 bg-dark-900/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg">
                  <span className="text-gold-400 font-bold text-sm">{data.brand.name_ar}</span>
                </div>
              )}
              <div className="relative w-full h-full min-h-[300px]">
                <Image
                  src={data.image_url || "/placeholder.svg"}
                  alt={data.name_ar}
                  fill
                  className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {data.name_ar}
              </h1>
              <h2 className="text-xl text-gray-400 mb-6 font-medium">
                {data.name_en}
              </h2>
              
              <div className="w-20 h-1 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full mb-8" />
              
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg">
                  {data.description_ar}
                </p>
                {data.description_en && (
                  <p className="text-gray-500 leading-relaxed mt-4" dir="ltr">
                    {data.description_en}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Models Section */}
        <section className="condor-container">
          <div className="flex items-center gap-3 mb-8">
            <Cpu className="w-8 h-8 text-gold-500" />
            <h2 className="text-2xl font-bold text-white">الموديلات المتاحة</h2>
          </div>

          {data.models && data.models.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full text-right text-white min-w-[800px]">
                <thead className="bg-dark-500 text-gold-400 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 font-semibold rounded-tr-xl">الموديل</th>
                    <th className="px-6 py-4 font-semibold">القدرة (حصان)</th>
                    <th className="px-6 py-4 font-semibold">كيلو وات</th>
                    <th className="px-6 py-4 font-semibold">أقصى رفع</th>
                    <th className="px-6 py-4 font-semibold">الفولت</th>
                    <th className="px-6 py-4 font-semibold">السعر</th>
                    <th className="px-6 py-4 font-semibold rounded-tl-xl text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="bg-dark-400 divide-y divide-white/5">
                  {data.models.map((model: any) => (
                    <tr key={model.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold">
                        <div className="flex flex-col">
                          <span>{model.name_en}</span>
                          {model.name_ar && <span className="text-sm text-gray-400">{model.name_ar}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">{model.hp || "-"}</td>
                      <td className="px-6 py-4">{model.kw || "-"}</td>
                      <td className="px-6 py-4">{model.max_head || "-"}</td>
                      <td className="px-6 py-4">{model.voltage || "-"}</td>
                      <td className="px-6 py-4 text-gold-400 font-bold text-lg">
                        {formatPrice(model.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleAddToCart(model)}
                          disabled={model.stock === 0}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            model.stock === 0
                              ? "bg-dark-300 text-gray-500 cursor-not-allowed"
                              : "bg-gold-500 text-dark-900 hover:bg-gold-400 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                          }`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>{model.stock === 0 ? "غير متوفر" : "إضافة"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-dark-500 rounded-xl p-12 text-center border border-white/5">
              <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl text-white font-semibold mb-2">لا توجد موديلات مضافة</h3>
              <p className="text-gray-400">هذا المنتج لا يحتوي على موديلات مسجلة حتى الآن.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
