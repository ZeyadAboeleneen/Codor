/**
 * Condor Egypt — Database Models
 * Hierarchical Product System: Brand → Model → Variant
 */

/**
 * Brand (ماركة)
 * Top-level entity. e.g. Leo, DAB, Pedrollo
 */
export interface Brand {
  _id?: string
  id: string
  name: string
  nameAr?: string
  slug: string
  logo: string
  description?: string
  descriptionAr?: string
  website?: string
  order: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Model (موديل)
 * Belongs to a Brand. e.g. APM, CPM, PKm
 */
export interface ProductModel {
  _id?: string
  id: string
  name: string
  nameAr?: string
  slug: string
  brandId: string
  brandName?: string
  image?: string
  description?: string
  descriptionAr?: string
  specifications?: Record<string, string>
  order: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Variant (فئة / منتج)
 * Belongs to a Model. e.g. APM 0.5HP, APM 1HP
 * This is what the customer actually buys.
 */
export interface Variant {
  _id?: string
  id: string
  name: string
  nameAr?: string
  modelId: string
  modelName?: string
  brandId: string
  brandName?: string
  price: number
  originalPrice?: number
  currency: string // EGP
  // Technical specs
  power?: string         // e.g. "0.5 HP", "1 HP"
  capacity?: string      // e.g. "40 L/min"
  maxHead?: string       // e.g. "30 m"
  voltage?: string       // e.g. "220V"
  phase?: string         // e.g. "Single", "Three"
  // Additional specs as key-value
  specifications?: Record<string, string>
  images: string[]
  description?: string
  descriptionAr?: string
  isActive: boolean
  isOutOfStock: boolean
  isFeatured: boolean
  order: number
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Category Model
 * For grouping by usage type
 */
export interface Category {
  _id?: string
  id: string
  name: string
  nameAr: string
  slug: string
  description?: string
  descriptionAr?: string
  image: string
  icon?: string
  order: number
  isActive: boolean
  productCount?: number
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Hero Slide Model
 */
export interface HeroSlide {
  _id?: string
  id: string
  title: string
  titleEn?: string
  subtitle: string
  subtitleEn?: string
  image: string
  ctaPrimary: {
    text: string
    link: string
  }
  ctaSecondary?: {
    text: string
    link: string
  }
  order: number
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Homepage Configuration Model
 */
export interface HomepageSection {
  _id?: string
  id: string
  type: "hero" | "brands" | "categories" | "featured_products" | "custom"
  title?: string
  titleAr?: string
  order: number
  isActive: boolean
  config?: Record<string, any>
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Contact Message
 */
export interface ContactMessage {
  _id?: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  isRead: boolean
  createdAt?: Date
}
