import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const modelId = url.searchParams.get("modelId")
    const brandId = url.searchParams.get("brandId")
    const featured = url.searchParams.get("featured")

    const db = await getDatabase()
    const query: any = { isActive: true }
    if (modelId) query.modelId = modelId
    if (brandId) query.brandId = brandId
    if (featured === "true") query.isFeatured = true

    const items = await db.collection("variants").find(query).sort({ order: 1 }).toArray()

    const formatted = items.map(item => ({
      ...item,
      _id: item._id.toString()
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching variants:", error)
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 })
  }
}
