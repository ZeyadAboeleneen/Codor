import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { handleCreateItem, handleUpdateItem, handleDeleteItem, requireAdmin } from "@/lib/admin-api-utils"

export async function GET() {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const db = await getDatabase()
    const items = await db.collection("homepage_sections").find().sort({ order: 1 }).toArray()
    
    const formatted = items.map(item => ({
      ...item,
      _id: item._id.toString()
    }))
    
    return NextResponse.json(formatted)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return handleCreateItem("homepage_sections", req)
}

export async function PUT(req: Request) {
  return handleUpdateItem("homepage_sections", req)
}

export async function DELETE(req: Request) {
  return handleDeleteItem("homepage_sections", req)
}
