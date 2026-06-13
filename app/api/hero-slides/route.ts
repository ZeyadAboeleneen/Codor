import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("hero_slides")
      .select(`
        *,
        product:products ( slug )
      `)
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
    
    if (error) throw error

    const formatted = data.map(slide => ({
      ...slide,
      product_slug: slide.product?.slug
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 })
  }
}
