"use client"

import { CondorNavigation, CondorFooter } from "@/components/condor"
import { HomepageSectionRenderer, type SectionConfig, type HomepageData } from "@/components/condor/section-renderer"
import { defaultHomepageSections } from "@/lib/design-tokens"

/**
 * Condor Egypt — Homepage
 * 
 * This page uses the dynamic section renderer pattern.
 * Sections are rendered in order based on configuration.
 * Currently uses default config — will be replaced by API fetch from dashboard.
 */
export default function HomePage() {
  // TODO: Fetch from /api/homepage-config once backend is built
  const sections: SectionConfig[] = defaultHomepageSections

  // TODO: Fetch from respective APIs once backend is built  
  // For now, components handle their own data fetching or use placeholders
  const data: HomepageData = {
    heroSlides: undefined,    // HeroSlider uses its own placeholders
    brands: undefined,        // BrandsCarousel uses its own placeholders
    categories: undefined,    // CategoriesGrid uses its own placeholders
    featuredProducts: undefined, // FeaturedProducts fetches from existing /api/products
  }

  return (
    <div className="min-h-screen bg-dark-600 overflow-x-hidden">
      <CondorNavigation />

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" />

      {/* Dynamic Homepage Sections */}
      <HomepageSectionRenderer sections={sections} data={data} />

      <CondorFooter />
    </div>
  )
}
