import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const modelId = url.searchParams.get("modelId")
    const brandId = url.searchParams.get("brandId")
    const featured = url.searchParams.get("featured")

    const client = supabaseAdmin || supabase

    let query = client
      .from("variants")
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true })

    if (modelId) query = query.eq("model_id", modelId)
    if (brandId) query = query.eq("brand_id", brandId)
    if (featured === "true") query = query.eq("is_featured", true)

    const { data: items, error } = await query

    if (error) {
      console.error("Error fetching variants:", error)
      return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (error) {
    console.error("Error fetching variants:", error)
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 })
  }
}
