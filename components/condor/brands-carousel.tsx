"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BrandsCarousel() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch("/api/brands")
        if (res.ok) {
          const data = await res.json()
          setBrands(data.filter((b: any) => b.is_active !== false))
        }
      } catch (error) {
        console.error("Failed to fetch brands", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBrands()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const currentScroll = scrollContainerRef.current.scrollLeft
      
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (loading || brands.length === 0) {
    return null
  }

  return (
    <section className="py-16 bg-dark-500 border-y border-white/5 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-gold-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6" dir="rtl">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="w-8 h-1 bg-gold-500 rounded-full inline-block" />
              علاماتنا التجارية
            </h2>
            <p className="text-gray-400 text-base pr-11 max-w-xl">
              تصفح منتجاتنا عبر أفضل العلامات التجارية العالمية في مجال مضخات المياه
            </p>
          </div>
          
          <div className="flex items-center gap-4 self-end sm:self-auto">
            <div className="hidden sm:flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => scroll('right')} 
                className="rounded-full bg-dark-400 border-white/10 text-white hover:bg-gold-500/20 hover:text-gold-400 hover:border-gold-500/30"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => scroll('left')} 
                className="rounded-full bg-dark-400 border-white/10 text-white hover:bg-gold-500/20 hover:text-gold-400 hover:border-gold-500/30"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            
            <Link href="/products" className="group flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 font-medium transition-colors bg-gold-500/10 px-4 py-2 rounded-full border border-gold-500/20 hover:bg-gold-500/20">
              كل المنتجات
              <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar snap-x snap-mandatory"
          dir="rtl"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brands.map((brand) => (
            <Link 
              key={brand.id} 
              href={`/products?brand=${brand.id}`}
              className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start group"
            >
              <div className="h-full bg-dark-400/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-dark-300 hover:border-gold-500/40 hover:shadow-[0_8px_30px_rgb(200,169,96,0.1)] hover:-translate-y-1 relative overflow-hidden">
                
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/0 via-gold-500/0 to-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative w-full h-24 mb-6 flex items-center justify-center bg-white/5 rounded-xl p-4 group-hover:bg-white/10 transition-colors">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.name_ar}
                      fill
                      className="object-contain filter grayscale-[50%] brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-500 group-hover:scale-110 p-2"
                    />
                  ) : (
                    <div className="text-gray-400 font-bold text-xl uppercase tracking-wider group-hover:text-gold-400 transition-colors">
                      {brand.name_en}
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-gold-400 transition-colors">
                  {brand.name_ar}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {brand.name_en}
                </p>
                
                {/* Arrow Indicator */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 text-gold-400" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Hide Scrollbar CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  )
}
