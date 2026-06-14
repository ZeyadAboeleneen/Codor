import { NextResponse } from "next/server"
import { handleGetItems, handleCreateItem, handleUpdateItem, handleDeleteItem, requireAdmin } from "@/lib/admin-api-utils"

export async function GET() {
  return handleGetItems("categories", "order")
}

export async function POST(req: Request) {
  return handleCreateItem("categories", req)
}

export async function PUT(req: Request) {
  return handleUpdateItem("categories", req)
}

export async function DELETE(req: Request) {
  return handleDeleteItem("categories", req)
}
