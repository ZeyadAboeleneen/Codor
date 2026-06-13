"use client"

/**
 * Homepage Section Renderer
 * 
 * This component dynamically renders homepage sections based on configuration.
 * Sections can be reordered, hidden/shown, and configured from the dashboard.
 * 
 * Usage:
 *   <HomepageSectionRenderer sections={sectionsFromDB} data={fetchedData} />
 */

import { HeroSlider } from "./hero-slider"
import { BrandsCarousel } from "./brands-carousel"
import { CategoriesGrid } from "./categories-grid"
import { FeaturedProducts } from "./featured-products"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"

export interface SectionConfig {
  id: string
  type: "hero" | "brands" | "categories" | "featured_products" | "custom"
  title?: string
  titleAr?: string
  order: number
  isActive: boolean
  config?: Record<string, any>
}

export interface HomepageData {
  heroSlides?: any[]
  brands?: any[]
  categories?: any[]
  featuredProducts?: any[]
}

interface HomepageSectionRendererProps {
  sections: SectionConfig[]
  data: HomepageData
}

function RenderSection({ section, data }: { section: SectionConfig; data: HomepageData }) {
  const locale = useLocale()
  
  // Pick the right title based on locale
  const getTitle = () => {
    if (locale === 'ar') {
      return section.titleAr || section.title
    }
    return section.title || section.titleAr
  }

  switch (section.type) {
    case "hero":
      return <HeroSlider slides={data.heroSlides} />

    case "brands":
      return (
        <BrandsCarousel
          brands={data.brands}
          title={getTitle()}
        />
      )

    case "categories":
      return (
        <CategoriesGrid
          categories={data.categories}
          title={getTitle()}
        />
      )

    case "featured_products":
      return (
        <FeaturedProducts
          products={data.featuredProducts}
          title={getTitle()}
        />
      )

    case "custom":
      // Future: render custom HTML/markdown sections
      return null

    default:
      return null
  }
}

export function HomepageSectionRenderer({ sections, data }: HomepageSectionRendererProps) {
  // Sort by order, filter active only
  const activeSections = sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.order - b.order)

  return (
    <>
      {activeSections.map((section) => (
        <RenderSection key={section.id} section={section} data={data} />
      ))}
    </>
  )
}
