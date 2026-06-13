"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FeaturedProducts } from "@/components/condor/featured-products"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"

export default function ProductsPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const brandId = searchParams.get("brand")
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "/api/products?limit=50"
        if (brandId) url += `&brand=${brandId}`
        
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch (err) {
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [brandId])

  return (
    <div className="min-h-screen bg-dark-600 flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-24 pb-12">
        {loading ? (
          <section className="section-padding bg-dark-500 relative">
            <div className="condor-container relative z-10">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="section-title mb-3">{t("products")}</h2>
                  <div className="h-1 w-20 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="dark-card overflow-hidden">
                    <div className="aspect-square bg-dark-100 animate-pulse rounded" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-dark-100 animate-pulse rounded w-20" />
                      <div className="h-4 bg-dark-100 animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-dark-100 animate-pulse rounded w-full" />
                      <div className="h-8 bg-dark-100 animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <FeaturedProducts 
            products={products} 
            title={t("products")} 
            showViewAll={false} 
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
