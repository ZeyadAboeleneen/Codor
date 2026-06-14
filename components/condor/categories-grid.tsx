"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from "next-intl"

// Placeholder data — will be replaced by API fetch
const PLACEHOLDER_CATEGORIES = [
  {
    _id: "1",
    name: "Centrifugal",
    nameKey: "centrifugalPumps",
    descKey: "centrifugalDesc",
    slug: "centrifugal",
    image: "/hero-pump-1.png",
    order: 1,
    isActive: true,
  },
  {
    _id: "2",
    name: "Submersible",
    nameKey: "submersiblePumps",
    descKey: "submersibleDesc",
    slug: "submersible",
    image: "/hero-pump-2.png",
    order: 2,
    isActive: true,
  },
  {
    _id: "3",
    name: "Peripheral",
    nameKey: "peripheralPumps",
    descKey: "peripheralDesc",
    slug: "peripheral",
    image: "/hero-pump-1.png",
    order: 3,
    isActive: true,
  },
  {
    _id: "4",
    name: "High Pressure",
    nameKey: "highPressurePumps",
    descKey: "pressureDesc",
    slug: "pressure",
    image: "/hero-pump-2.png",
    order: 4,
    isActive: true,
  },
]

interface Category {
  _id: string
  name: string
  nameAr?: string
  nameKey?: string
  descKey?: string
  slug: string
  descriptionAr?: string
  image: string
  order: number
  isActive: boolean
}

interface CategoriesGridProps {
  categories?: Category[]
  title?: string
}

export function CategoriesGrid({ categories, title }: CategoriesGridProps) {
  const t = useTranslations()
  const displayTitle = title || t("browseByCategory")
  const displayCategories = categories && categories.length > 0 ? categories : PLACEHOLDER_CATEGORIES

  return (
    <section id="categories" className="section-padding bg-dark-600 relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-dark-radial pointer-events-none" />

      <div className="condor-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="section-title mb-3">{displayTitle}</h2>
          <div className="section-divider mb-4" />
          <p className="section-subtitle mx-auto">
            {t("categorySubtitle")}
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {displayCategories.map((cat, index) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link href={`/products?category=${cat.slug}`}>
                <div className="gold-card group relative overflow-hidden p-1 cursor-pointer">
                  {/* Image Container */}
                  <div className="relative aspect-square sm:aspect-[4/3] rounded-lg overflow-hidden bg-dark-500">
                    <Image
                      src={cat.image}
                      alt={cat.nameKey ? t(cat.nameKey) : ((cat as any).nameAr || cat.name)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent" />

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                      <h3 className="text-sm sm:text-lg font-bold text-white mb-0.5 sm:mb-1 font-cairo line-clamp-1">
                        {cat.nameKey ? t(cat.nameKey) : ((cat as any).nameAr || cat.name)}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-gold-400/80 uppercase tracking-wider font-medium line-clamp-1">
                        {cat.name}
                      </p>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gold-500/0 border border-gold-500/0 flex items-center justify-center transition-all duration-300 group-hover:bg-gold-500 group-hover:border-gold-500">
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 text-gold-500 group-hover:text-dark-900 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
