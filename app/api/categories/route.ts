import { NextResponse } from "next/server"
import { handleGetActive } from "@/lib/api-utils"

export async function GET() {
  return handleGetActive("categories")
}
