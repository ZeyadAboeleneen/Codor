import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin, handleCreateItem, handleUpdateItem, handleDeleteItem } from "@/lib/admin-api-utils"

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    // Fetch models and join with products and brands
    const { data, error } = await supabaseAdmin!
      .from("models")
      .select(`
        *,
        product:products ( name_en, name_ar ),
        brand:brands ( name_en, name_ar )
      `)
      .order("sort_order", { ascending: true })
    
    if (error) throw error

    const formatted = data.map(item => ({
      ...item,
      product_name_en: item.product?.name_en,
      product_name_ar: item.product?.name_ar,
      brand_name_en: item.brand?.name_en,
      brand_name_ar: item.brand?.name_ar
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return handleCreateItem("models", req)
}

export async function PUT(req: Request) {
  return handleUpdateItem("models", req)
}

export async function DELETE(req: Request) {
  return handleDeleteItem("models", req)
}
