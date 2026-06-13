"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link } from "@/i18n/routing"
import { ArrowLeft } from "lucide-react"
import { ProductCard } from "./product-card"
import { useTranslations } from "next-intl"

interface FeaturedProductsProps {
  products?: any[]
  title?: string
  showViewAll?: boolean
}

export function FeaturedProducts({
  products: propProducts,
  title,
  showViewAll = true,
}: FeaturedProductsProps) {
  const t = useTranslations()
  const displayTitle = title || t("featuredProducts")
  const [products, setProducts] = useState<any[]>(propProducts || [])
  const [loading, setLoading] = useState(!propProducts)

  // Fetch products if not provided as props
  useEffect(() => {
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts)
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?page=1&limit=8")
        if (res.ok) {
          const data = await res.json()
          setProducts(data.slice(0, 8))
        }
      } catch (err) {
        console.error("Error fetching featured products:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [propProducts])

  return (
    <section className="section-padding bg-dark-500 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-500/3 blur-[150px] rounded-full pointer-events-none" />

      <div className="condor-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="section-title mb-3">{displayTitle}</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full" />
          </div>
          {showViewAll && (
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-gold-400 hover:text-gold-300 transition-colors text-sm font-medium group"
            >
              عرض كل المنتجات
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          )}
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="dark-card overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-4 space-y-3">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-full" />
                  <div className="h-8 skeleton w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">لا توجد منتجات متاحة حالياً.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>

            {/* Mobile View All */}
            {showViewAll && (
              <div className="mt-10 text-center md:hidden">
                <Link
                  href="/products"
                  className="btn-gold-outline px-8 py-3 rounded-xl inline-flex items-center gap-2"
                >
                  عرض كل المنتجات
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
