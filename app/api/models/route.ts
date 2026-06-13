import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const brandId = url.searchParams.get("brandId")

    const db = await getDatabase()
    const query: any = { isActive: true }
    if (brandId) query.brandId = brandId

    const items = await db.collection("models").find(query).sort({ order: 1 }).toArray()

    const formatted = items.map(item => ({
      ...item,
      _id: item._id.toString()
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}
