"use client"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-500">
      <Navigation />
      <div className="pt-32 pb-16 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white">404</h1>
              <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
              <p className="text-gray-400">
                The page you're looking for doesn't exist or has been moved.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Link href="/">
                  <Button className="bg-black text-white hover:bg-dark-700">
                    Go home
                  </Button>
                </Link>
                <Button
                  onClick={() => window.history.back()}
                  variant="outline"
                >
                  Go back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

