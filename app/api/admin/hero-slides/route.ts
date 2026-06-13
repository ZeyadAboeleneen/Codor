import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireAdmin, handleCreateItem, handleUpdateItem, handleDeleteItem } from "@/lib/admin-api-utils"

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { data, error } = await supabaseAdmin!
      .from("hero_slides")
      .select(`
        *,
        product:products ( name_en, name_ar )
      `)
      .order("sort_order", { ascending: true })
    
    if (error) throw error

    const formatted = data.map(item => ({
      ...item,
      product_name_en: item.product?.name_en,
      product_name_ar: item.product?.name_ar
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    // Check limit before creating
    const { count, error: countError } = await supabaseAdmin!
      .from("hero_slides")
      .select("*", { count: 'exact', head: true })
      
    if (countError) throw countError
    
    if (count && count >= 7) {
      return NextResponse.json({ error: "Maximum limit of 7 hero slides reached." }, { status: 400 })
    }

    return handleCreateItem("hero_slides", req)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create hero slide" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  return handleUpdateItem("hero_slides", req)
}

export async function DELETE(req: Request) {
  return handleDeleteItem("hero_slides", req)
}
