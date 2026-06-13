import { handleGetItems, handleCreateItem, handleUpdateItem, handleDeleteItem } from "@/lib/admin-api-utils"

export async function GET() {
  return handleGetItems("brands", "created_at", true)
}

export async function POST(req: Request) {
  return handleCreateItem("brands", req)
}

export async function PUT(req: Request) {
  return handleUpdateItem("brands", req)
}

export async function DELETE(req: Request) {
  return handleDeleteItem("brands", req)
}
