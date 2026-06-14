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
    const status = searchParams.get("status") || ""
    const search = searchParams.get("search") || ""
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200)
    const skip = (page - 1) * limit

    const client = supabaseAdmin || supabase

    let query = client
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(skip, skip + limit - 1)

    if (status) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(
        `order_id.ilike.%${search}%,shipping_address->>name.ilike.%${search}%,shipping_address->>email.ilike.%${search}%`
      )
    }

    const { data: orders, error, count } = await query

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    const transformed = (orders || []).map((order: any) => ({
      _id: order.id,
      id: order.order_id,
      userId: order.user_id,
      items: order.items || [],
      total: order.total || 0,
      status: order.status || "pending",
      shippingAddress: order.shipping_address || {},
      paymentMethod: order.payment_method || "cod",
      discountCode: order.discount_code,
      discountAmount: order.discount_amount || 0,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }))

    // Stats
    const { data: statsData } = await client
      .from("orders")
      .select("total, status")

    const revenue = (statsData || []).reduce((sum: number, o: any) => sum + (o.total || 0), 0)
    const statusCounts = (statsData || []).reduce((acc: any, o: any) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      orders: transformed,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      stats: {
        revenue,
        statusCounts,
        totalOrders: statsData?.length || 0,
      },
    })
  } catch (error) {
    console.error("Get all orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
