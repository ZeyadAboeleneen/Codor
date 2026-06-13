import type { Metadata } from "next"
import "../globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ProductProvider } from "@/lib/product-context"
import { OrderProvider } from "@/lib/order-context"
import { FavoritesProvider } from "@/lib/favorites-context"
import { CartProvider } from "@/lib/cart-context"
import { LocaleProvider } from "@/lib/locale-context"
import { ScrollProvider } from "@/lib/scroll-context"
import { CartSuccessNotification } from "@/components/cart-success-notification"
import { Toaster } from "@/components/ui/toaster"
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
export const metadata: Metadata = {
  title: "كوندور مصر — مضخات المياه الإيطالية | Condor Egypt",
  description: "كوندور مصر الوكيل المعتمد لمضخات المياه الإيطالية. اكتشف تشكيلتنا من مضخات الطرد المركزي، الغاطسة، الضغط العالي والمزيد. جودة إيطالية بضمان مصري.",
  keywords: "مضخات مياه, مضخات إيطالية, كوندور مصر, Condor Egypt, Pedrollo, مضخات طرد مركزي, مضخات غاطسة, مضخات ضغط عالي, water pumps Egypt",
  generator: "condor-egypt",
  icons: {
    icon: "/condor-icon.svg",
    shortcut: "/condor-icon.svg",
    apple: "/condor-icon.svg",
  },
  openGraph: {
    title: "كوندور مصر — مضخات المياه الإيطالية",
    description: "الوكيل المعتمد لمضخات المياه الإيطالية في مصر. جودة عالمية بأسعار تنافسية.",
    type: "website",
    locale: "ar_EG",
  },
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode,
  params: { locale: string }
}) {
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body bg-dark-600 text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider>
            <AuthProvider>
              <ProductProvider>
                <OrderProvider>
                  <FavoritesProvider>
                    <CartProvider>
                      <ScrollProvider>
                        {children}
                        <CartSuccessNotification />
                        <Toaster />
                      </ScrollProvider>
                    </CartProvider>
                  </FavoritesProvider>
                </OrderProvider>
              </ProductProvider>
            </AuthProvider>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
