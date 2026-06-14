import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const brandId = url.searchParams.get("brandId")

    const client = supabaseAdmin || supabase

    let query = client
      .from("models")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true })

    if (brandId) query = query.eq("brand_id", brandId)

    const { data: items, error } = await query

    if (error) {
      console.error("Error fetching models:", error)
      return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}
