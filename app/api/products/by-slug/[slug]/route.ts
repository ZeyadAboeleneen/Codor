import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    const { data: product, error: productError } = await supabase
      .from("products")
      .select(`
        *,
        brand:brands(id, name_en, name_ar, slug, logo_url)
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .single()

    if (productError || !product) {
      console.error("Error fetching product:", productError)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const { data: models, error: modelsError } = await supabase
      .from("models")
      .select("*")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("price", { ascending: true })

    if (modelsError) {
      console.error("Error fetching models:", modelsError)
    }

    const formattedData = {
      id: product.id,
      slug: product.slug,
      brand_id: product.brand_id,
      brand: product.brand,
      name_ar: product.name_ar,
      name_en: product.name_en,
      description_ar: product.description_ar,
      description_en: product.description_en,
      image_url: product.image_url,
      models: models || []
    }

    return NextResponse.json(formattedData, { status: 200 })
  } catch (error) {
    console.error("Error in GET /api/products/by-slug/[slug]:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
