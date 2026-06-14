import { NextResponse } from "next/server"
import { handleGetItems, handleCreateItem, handleUpdateItem, handleDeleteItem } from "@/lib/admin-api-utils"

export async function GET() {
  return handleGetItems("homepage_sections", "order")
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
