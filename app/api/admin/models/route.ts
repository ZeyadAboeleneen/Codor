import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin, handleCreateItem, handleUpdateItem, handleDeleteItem } from "@/lib/admin-api-utils"

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    // Fetch products and join with brands to get brand details
    const { data, error } = await supabaseAdmin!
      .from("products")
      .select(`
        *,
        brand:brands ( name_en, name_ar )
      `)
      .order("sort_order", { ascending: true })
    
    if (error) throw error

    // Flatten the brand data for the frontend
    const formatted = data.map(item => ({
      ...item,
      brand_name_en: item.brand?.name_en,
      brand_name_ar: item.brand?.name_ar
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return handleCreateItem("products", req)
}

export async function PUT(req: Request) {
  return handleUpdateItem("products", req)
}

export async function DELETE(req: Request) {
  return handleDeleteItem("products", req)
}
