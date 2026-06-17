"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ShoppingCart, ArrowRight, Info, Cpu } from "lucide-react"
import { useCurrencyFormatter } from "@/hooks/use-currency"
import { useCart } from "@/lib/cart-context"
import { toast } from "sonner"

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations()
  const slug = params.slug as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useCurrencyFormatter()
  const { addItem: addToCart } = useCart()

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
      productId: model.id,
      name: `${data.name_en} - ${model.name_en || model.name_ar}`,
      price: model.price,
      quantity: 1,
      size: model.size || "",
      volume: model.volume || "",
      image: model.images?.[0] || data.image_url || "/placeholder.svg",
      category: data.category || "",
    })
    toast.success(t("modelAddedToCart"))
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
            <h1 className="text-2xl font-bold mb-4">{t("productNotFound")}</h1>
            <button onClick={() => router.push('/products')} className="text-gold-500 hover:underline">
              {t("backToProducts")}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-600 flex flex-col">
      <Navigation />

      <main className="flex-grow pt-24 pb-12">
        <div className="condor-container mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-gold-500 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>{t("goBack")}</span>
          </button>
        </div>

        <section className="condor-container mb-16">
          <div className="bg-dark-500 rounded-2xl border border-white/5 overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 bg-dark-300 relative aspect-square md:aspect-auto flex items-center justify-center p-8">
              {data.brand && (
                <div className="absolute top-4 right-4 z-10 bg-dark-900/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-lg">
                  <span className="text-gold-400 font-bold text-sm">{data.brand.name_en}</span>
                </div>
              )}
              <div className="relative w-full h-full min-h-[300px]">
                <Image
                  src={data.image_url || "/placeholder.svg"}
                  alt={data.name_en}
                  fill
                  className="object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {data.name_en}
              </h1>

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

        <section className="condor-container">
          <div className="flex items-center gap-3 mb-8">
            <Cpu className="w-8 h-8 text-gold-500" />
            <h2 className="text-2xl font-bold text-white">{t("availableModels")}</h2>
          </div>

          {data.models && data.models.length > 0 ? (
            <>
              {/* Mobile: card layout */}
              <div className="flex flex-col gap-4 md:hidden">
                {data.models.map((model: any) => (
                  <div key={model.id} className="bg-dark-400 rounded-xl border border-white/10 p-4 text-white">
                    <div className="text-gold-400 font-bold text-lg mb-3">{model.name_en}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                      <div className="text-gray-400">{t("powerHP")}</div>
                      <div className="font-medium">{model.hp || "-"}</div>
                      <div className="text-gray-400">{t("powerKW")}</div>
                      <div className="font-medium">{model.kw || "-"}</div>
                      <div className="text-gray-400">{t("maxHead")}</div>
                      <div className="font-medium">{model.max_head || "-"}</div>
                      <div className="text-gray-400">{t("voltageLabel")}</div>
                      <div className="font-medium">{model.voltage || "-"}</div>
                      <div className="text-gray-400">{t("priceLabel")}</div>
                      <div className="font-bold text-gold-400">{formatPrice(model.price)}</div>
                    </div>
                    <button
                      onClick={() => handleAddToCart(model)}
                      disabled={model.stock === 0}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        model.stock === 0
                          ? "bg-dark-300 text-gray-500 cursor-not-allowed"
                          : "bg-gold-500 text-dark-900 hover:bg-gold-400 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{model.stock === 0 ? t("stockUnavailable") : t("addModel")}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Desktop: table layout */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-right text-white min-w-[800px]">
                  <thead className="bg-dark-500 text-gold-400 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-semibold rounded-tr-xl">{t("modelName")}</th>
                      <th className="px-6 py-4 font-semibold">{t("powerHP")}</th>
                      <th className="px-6 py-4 font-semibold">{t("powerKW")}</th>
                      <th className="px-6 py-4 font-semibold">{t("maxHead")}</th>
                      <th className="px-6 py-4 font-semibold">{t("voltageLabel")}</th>
                      <th className="px-6 py-4 font-semibold">{t("priceLabel")}</th>
                      <th className="px-6 py-4 font-semibold rounded-tl-xl text-center">{t("actionLabel")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-dark-400 divide-y divide-white/5">
                    {data.models.map((model: any) => (
                      <tr key={model.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold">
                          <div className="flex flex-col">
                            <span>{model.name_en}</span>
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
                            <span>{model.stock === 0 ? t("stockUnavailable") : t("addModel")}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-dark-500 rounded-xl p-12 text-center border border-white/5">
              <Info className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl text-white font-semibold mb-2">{t("noModelsYet")}</h3>
              <p className="text-gray-400">{t("noModelsYet")}</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
