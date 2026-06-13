/**
 * Condor Egypt — Centralized Design Tokens
 * 
 * All spacing, typography, colors, and component variants are defined here.
 * Import these tokens instead of using hardcoded values in components.
 */

// ─── Color Palette ───────────────────────────────────────────────
export const colors = {
  // Primary Gold
  gold: {
    50: '#FDF8ED',
    100: '#F9EDCC',
    200: '#F2D98A',
    300: '#E8C24E',
    400: '#D4AC3C',
    500: '#C8A960', // Primary gold
    600: '#A07D3A',
    700: '#7A5E2B',
    800: '#5C461F',
    900: '#3E2F15',
  },
  // Dark Backgrounds
  dark: {
    50: '#2A2A2A',
    100: '#1E1E1E',
    200: '#181818',
    300: '#141414',
    400: '#111111',
    500: '#0D0D0D',
    600: '#0A0A0A', // Main background
    700: '#080808',
    800: '#050505',
    900: '#030303',
  },
  // Neutrals
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  // Status Colors
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const

// ─── Typography Scale ────────────────────────────────────────────
export const typography = {
  fontFamily: {
    heading: '"Cairo", "Noto Sans Arabic", sans-serif',
    body: '"Noto Sans Arabic", "Cairo", sans-serif',
    mono: '"Fira Code", "Cascadia Code", monospace',
  },
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
    arabic: '1.8',    // Optimized for Arabic text
    loose: '2',
  },
} as const

// ─── Spacing Scale ───────────────────────────────────────────────
export const spacing = {
  section: {
    xs: 'py-8',
    sm: 'py-12',
    md: 'py-16',
    lg: 'py-20',
    xl: 'py-24',
    '2xl': 'py-32',
  },
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  gap: {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  },
} as const

// ─── Border Radius ───────────────────────────────────────────────
export const radius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
} as const

// ─── Shadows ─────────────────────────────────────────────────────
export const shadows = {
  card: '0 4px 20px rgba(0, 0, 0, 0.3)',
  cardHover: '0 8px 40px rgba(200, 169, 96, 0.15)',
  glow: '0 0 20px rgba(200, 169, 96, 0.2)',
  glowStrong: '0 0 40px rgba(200, 169, 96, 0.3)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
} as const

// ─── Transitions ─────────────────────────────────────────────────
export const transitions = {
  fast: 'transition-all duration-200 ease-out',
  normal: 'transition-all duration-300 ease-out',
  slow: 'transition-all duration-500 ease-out',
  bounce: 'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
} as const

// ─── Z-Index Scale ───────────────────────────────────────────────
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  popover: 50,
  toast: 60,
} as const

// ─── Framer Motion Variants ──────────────────────────────────────
export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  },
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideInRight: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  },
  cardHover: {
    whileHover: {
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  },
  buttonHover: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
  },
} as const

// ─── Component Variant Classes ───────────────────────────────────

/** Button variants using design tokens */
export const buttonVariants = {
  primary: 'bg-gradient-to-r from-gold-500 to-gold-600 text-dark-900 font-semibold hover:from-gold-400 hover:to-gold-500 shadow-lg hover:shadow-gold-500/25',
  secondary: 'bg-dark-100 text-gold-400 border border-gold-500/30 hover:border-gold-500/60 hover:bg-dark-50',
  outline: 'bg-transparent text-gold-400 border border-gold-500/40 hover:bg-gold-500/10 hover:border-gold-500',
  ghost: 'bg-transparent text-neutral-300 hover:text-gold-400 hover:bg-white/5',
  danger: 'bg-red-600 text-white hover:bg-red-700',
} as const

/** Card variants using design tokens */
export const cardVariants = {
  default: 'bg-dark-400 border border-white/5 rounded-xl',
  elevated: 'bg-dark-300 border border-white/10 rounded-xl shadow-card',
  gold: 'bg-dark-300 border border-gold-500/20 rounded-xl hover:border-gold-500/40',
  glass: 'bg-white/5 backdrop-blur-md border border-white/10 rounded-xl',
  product: 'bg-dark-400 border border-white/5 rounded-xl overflow-hidden group hover:border-gold-500/30 transition-all duration-300',
} as const

/** Section heading styles */
export const sectionStyles = {
  heading: 'text-3xl md:text-4xl lg:text-5xl font-bold text-white',
  subheading: 'text-lg md:text-xl text-neutral-400 max-w-2xl',
  divider: 'h-1 w-20 bg-gradient-to-r from-gold-500 to-gold-600 rounded-full',
  wrapper: 'relative overflow-hidden',
} as const

// ─── Homepage Section Configuration ──────────────────────────────
export interface HomepageSection {
  id: string
  type: 'hero' | 'brands' | 'categories' | 'featured_products' | 'custom'
  title?: string
  titleAr?: string
  order: number
  isActive: boolean
  config?: Record<string, any>
}

export const defaultHomepageSections: HomepageSection[] = [
  { id: 'hero', type: 'hero', order: 1, isActive: true },
  { id: 'brands', type: 'brands', titleAr: 'علاماتنا التجارية', title: 'Our Brands', order: 2, isActive: true },
  { id: 'categories', type: 'categories', titleAr: 'تصفح الفئات', title: 'Browse Categories', order: 3, isActive: false },
  { id: 'featured_products', type: 'featured_products', titleAr: 'منتجات مميزة', title: 'Featured Products', order: 4, isActive: true },
]
