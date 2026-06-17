"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, ShoppingCart, Check } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useCurrencyFormatter } from "@/hooks/use-currency"

export function CartSuccessNotification() {
  const { state, hideNotification } = useCart()
  const { formatPrice } = useCurrencyFormatter()

  return (
    <AnimatePresence>
      {state.showNotification && state.lastAddedItem && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-20 right-4 z-50 w-96"
        >
          <Card className="shadow-xl border-0 bg-dark-600 relative overflow-hidden">
            {/* Gold transparent rectangles */}
            <motion.div 
              className="absolute -inset-4 bg-gradient-to-r from-gold-500/10 to-gold-600/10 rounded-lg -z-10"
              animate={{
                rotate: [0, 0.3, 0, -0.3, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute -inset-2 bg-gradient-to-r from-gold-500/15 to-gold-600/15 rounded-lg -z-10"
              animate={{
                rotate: [0, -0.2, 0, 0.2, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gold-500/10 border border-gold-500/20 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-gold-500" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gold-500 mb-1">Added to cart!</p>
                      <div className="flex items-center space-x-3">
                        <Image
                          src={state.lastAddedItem.image || "/placeholder.svg"}
                          alt={state.lastAddedItem.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{state.lastAddedItem.name}</p>
                          <p className="text-xs text-gray-400">
                            {state.lastAddedItem.size} • {formatPrice(state.lastAddedItem.price)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={hideNotification}
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    <Link href="/cart" onClick={hideNotification}>
                      <Button size="sm" className="bg-gold-500 text-dark-900 hover:bg-gold-400 font-semibold text-xs px-3 py-1 rounded-full">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        View Cart ({state.count})
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={hideNotification}
                      className="text-xs px-4 py-2 border-white/10 bg-transparent text-gray-300 hover:text-gold-400 hover:border-gold-500/30 hover:bg-gold-500/10 rounded-full"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
