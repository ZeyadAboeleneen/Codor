"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Eye, ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

interface ProductType {
  id: string
  slug: string
  name_ar: string
  name_en: string
  description_ar?: string
  description_en?: string
  image_url?: string
  brand?: {
    id: string
    name_ar: string
    name_en: string
  }
}

interface ProductCardProps {
  product: ProductType
  index?: number
}

export function ProductCard({
  product,
  index = 0,
}: ProductCardProps) {
  const t = useTranslations()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="product-card group h-full flex flex-col bg-dark-400 rounded-xl border border-white/5 hover:border-gold-500/30 transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-dark-300 rounded-t-xl">
          <Link
            href={`/product/${product.slug}`}
            className="block w-full h-full"
            prefetch
          >
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name_en}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105 p-6"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading={index < 4 ? "eager" : "lazy"}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-dark-900/0 group-hover:bg-dark-900/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-12 h-12 rounded-full bg-dark-600/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </Link>

          {/* Brand Badge */}
          {product.brand && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              <span className="px-2.5 py-1 bg-dark-900/80 backdrop-blur-sm border border-white/10 text-gold-400 text-xs font-bold rounded-md">
                {product.brand.name_en}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between text-right">
          <div>
            {/* Name */}
            <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-gold-400 transition-colors">
              {product.name_en}
            </h3>

            {/* Description */}
            {(product.description_ar || product.description_en) && (
              <p className="text-xs sm:text-sm text-gray-400 mb-4 line-clamp-2">
                {product.description_ar || product.description_en}
              </p>
            )}
          </div>

          {/* Explore Button */}
          <Link
            href={`/product/${product.slug}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500 hover:text-dark-900 hover:border-gold-500 transition-all duration-300 mt-2 text-sm font-medium"
          >
            <span>{t("exploreModels")}</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
