import { NextResponse } from "next/server"
import { supabase, supabaseAdmin } from "@/lib/supabase"

/**
 * Generic GET handler for fetching all active items sorted by order
 */
export async function handleGetActive(tableName: string) {
  try {
    const client = supabaseAdmin || supabase
    const { data: items, error } = await client
      .from(tableName)
      .select("*")
      .eq("is_active", true)
      .order("order", { ascending: true })

    if (error) {
      console.error(`Error fetching from ${tableName}:`, error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (error) {
    console.error(`Error fetching from ${tableName}:`, error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
