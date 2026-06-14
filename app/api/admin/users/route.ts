import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { supabase, supabaseAdmin } from "@/lib/supabase"

function requireAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.role !== "admin") return null
    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = requireAdmin(request)
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") || ""
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200)
    const skip = (page - 1) * limit

    const client = supabaseAdmin || supabase

    let query = client
      .from("users")
      .select("id, email, name, role, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(skip, skip + limit - 1)

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (role) {
      query = query.eq("role", role)
    }

    const { data: users, error, count } = await query

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = requireAdmin(request)
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { userId, role, name } = await request.json()

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 })

    const updateData: any = {}
    if (role !== undefined) {
      if (!["admin", "user"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }
      updateData.role = role
    }
    if (name !== undefined) updateData.name = name

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const client = supabaseAdmin || supabase

    const { data: user, error } = await client
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select("id, email, name, role, created_at")
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found or update failed" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = requireAdmin(request)
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")

    if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 })

    if (userId === admin.userId) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    const client = supabaseAdmin || supabase

    const { error } = await client.from("users").delete().eq("id", userId)

    if (error) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
