import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get("brand")
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100)
    
    let query = supabase
      .from("products")
      .select(`
        *,
        brand:brands(id, name_en, name_ar, slug)
      `)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (brandId) {
      query = query.eq("brand_id", brandId)
    }

    const { data: products, error } = await query

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // Format products for frontend
    const formattedProducts = products.map(product => ({
      id: product.id,
      slug: product.slug,
      brand_id: product.brand_id,
      brand: product.brand,
      name_ar: product.name_ar,
      name_en: product.name_en,
      description_ar: product.description_ar,
      description_en: product.description_en,
      image_url: product.image_url,
      images: product.image_url ? [product.image_url] : [], // Backwards compatibility
      isActive: product.is_active,
    }))

    return NextResponse.json(formattedProducts, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
