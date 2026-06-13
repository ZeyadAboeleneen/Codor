"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSlides() {
      try {
        const res = await fetch("/api/hero-slides")
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setSlides(data)
          }
        }
      } catch (error) {
        console.error("Failed to fetch hero slides", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSlides()
  }, [])

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    
    return () => clearInterval(timer)
  }, [slides.length])

  if (loading) {
    return (
      <div className="relative h-[60vh] min-h-[500px] w-full bg-dark-500 overflow-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
      </div>
    )
  }

  // Fallback if no slides exist in DB
  const displaySlides = slides.length > 0 ? slides : [
    {
      id: "default",
      title_ar: "مرحباً بك في كوندور مصر",
      subtitle_ar: "أفضل حلول مضخات المياه",
      image_url: "/placeholder.svg?height=800&width=1600",
    }
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displaySlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length)

  return (
    <div className="relative h-[60vh] min-h-[500px] w-full bg-dark-500 overflow-hidden">
      <AnimatePresence initial={false} custom={currentSlide}>
        {displaySlides.map((slide, index) => {
          if (index !== currentSlide) return null
          
          // Determine the link destination
          let linkDestination = null
          if (slide.product_slug) {
            linkDestination = `/product/${slide.product_slug}`
          } else if (slide.link_url) {
            linkDestination = slide.link_url
          }

          const slideContent = (
            <motion.div
              key={slide.id}
              className="absolute inset-0 z-0"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-dark-900/80 to-transparent z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-500 via-transparent to-transparent z-10" />
              <Image
                src={slide.image_url || "/placeholder.svg"}
                alt={slide.title_ar || "Hero Image"}
                fill
                className={`object-cover ${linkDestination ? 'cursor-pointer hover:scale-105 transition-transform duration-[10s]' : ''}`}
                priority={index === 0}
              />
              
              <div className="absolute inset-0 z-20 flex flex-col justify-center px-4 sm:px-6 lg:px-8 container mx-auto" dir="rtl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="max-w-2xl"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.title_ar}
                  </h1>
                  {slide.subtitle_ar && (
                    <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-lg leading-relaxed">
                      {slide.subtitle_ar}
                    </p>
                  )}
                  
                  {linkDestination && (
                    <Button asChild size="lg" className="bg-gold-500 text-dark-900 hover:bg-gold-400 text-lg px-8 h-12">
                      <Link href={linkDestination}>استكشف الآن</Link>
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )

          return linkDestination ? (
             // If there's a link, wrap the whole slide content in a Link so it's clickable
             <Link key={slide.id} href={linkDestination} className="block w-full h-full">
                {slideContent}
             </Link>
          ) : (
             slideContent
          )
        })}
      </AnimatePresence>

      {displaySlides.length > 1 && (
        <>
          <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-2">
            {displaySlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-gold-500 w-8" : "bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 text-white rounded-full w-12 h-12 border border-white/10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/40 text-white rounded-full w-12 h-12 border border-white/10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}
    </div>
  )
}
