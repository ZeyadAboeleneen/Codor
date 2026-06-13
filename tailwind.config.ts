import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		// ─── Condor Egypt Color Palette ───────────────────
  		colors: {
  			// Gold primary accent
  			gold: {
  				50: '#FDF8ED',
  				100: '#F9EDCC',
  				200: '#F2D98A',
  				300: '#E8C24E',
  				400: '#D4AC3C',
  				500: '#C8A960',
  				600: '#A07D3A',
  				700: '#7A5E2B',
  				800: '#5C461F',
  				900: '#3E2F15',
  			},
  			// Dark backgrounds
  			dark: {
  				50: '#2A2A2A',
  				100: '#1E1E1E',
  				200: '#181818',
  				300: '#141414',
  				400: '#111111',
  				500: '#0D0D0D',
  				600: '#0A0A0A',
  				700: '#080808',
  				800: '#050505',
  				900: '#030303',
  			},
  			// shadcn/ui CSS variable colors (preserved)
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		// ─── Typography ──────────────────────────────────
  		fontFamily: {
  			cairo: ['"Cairo"', '"Noto Sans Arabic"', 'sans-serif'],
  			noto: ['"Noto Sans Arabic"', '"Cairo"', 'sans-serif'],
  			heading: ['"Cairo"', '"Noto Sans Arabic"', 'sans-serif'],
  			body: ['"Noto Sans Arabic"', '"Cairo"', 'sans-serif'],
  		},
  		// ─── Border Radius ───────────────────────────────
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// ─── Box Shadow ──────────────────────────────────
  		boxShadow: {
  			'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
  			'card-hover': '0 8px 40px rgba(200, 169, 96, 0.15)',
  			'glow': '0 0 20px rgba(200, 169, 96, 0.2)',
  			'glow-strong': '0 0 40px rgba(200, 169, 96, 0.3)',
  			'glow-xl': '0 0 60px rgba(200, 169, 96, 0.15)',
  			'inner-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  		},
  		// ─── Keyframes ───────────────────────────────────
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'scroll-left': {
  				'0%': { transform: 'translateX(0)' },
  				'100%': { transform: 'translateX(-50%)' }
  			},
  			'scroll-right': {
  				'0%': { transform: 'translateX(-50%)' },
  				'100%': { transform: 'translateX(0)' }
  			},
  			'fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' }
  			},
  			'fade-in-up': {
  				'0%': { opacity: '0', transform: 'translateY(20px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'slide-up': {
  				'0%': { transform: 'translateY(100%)' },
  				'100%': { transform: 'translateY(0)' }
  			},
  			'pulse-gold': {
  				'0%, 100%': { boxShadow: '0 0 0 0 rgba(200, 169, 96, 0.4)' },
  				'50%': { boxShadow: '0 0 0 10px rgba(200, 169, 96, 0)' }
  			},
  			'shimmer': {
  				'0%': { backgroundPosition: '-200% 0' },
  				'100%': { backgroundPosition: '200% 0' }
  			}
  		},
  		// ─── Animations ──────────────────────────────────
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'scroll-left': 'scroll-left 30s linear infinite',
  			'scroll-right': 'scroll-right 30s linear infinite',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'fade-in-up': 'fade-in-up 0.5s ease-out',
  			'slide-up': 'slide-up 0.5s ease-out',
  			'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  		},
  		// ─── Background Image ────────────────────────────
  		backgroundImage: {
  			'gold-gradient': 'linear-gradient(135deg, #C8A960 0%, #A07D3A 100%)',
  			'gold-gradient-h': 'linear-gradient(90deg, #C8A960 0%, #D4AC3C 50%, #A07D3A 100%)',
  			'dark-gradient': 'linear-gradient(180deg, #0A0A0A 0%, #111111 100%)',
  			'dark-radial': 'radial-gradient(ellipse at center, rgba(200, 169, 96, 0.05) 0%, transparent 70%)',
  			'shimmer': 'linear-gradient(90deg, transparent 0%, rgba(200, 169, 96, 0.1) 50%, transparent 100%)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
