import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { supabase, supabaseAdmin } from "@/lib/supabase"
import type { Order } from "@/lib/models/types"

// Transform Supabase order to match Order interface (used internally)
const transformOrder = (order: any): Order => {
  return {
    id: order.id,
    order_id: order.order_id,
    user_id: order.user_id,
    items: order.items || [],
    total: order.total || 0,
    status: order.status || 'pending',
    shippingAddress: order.shipping_address || {},
    paymentMethod: order.payment_method || 'cod',
    paymentDetails: order.payment_details,
    discount_code: order.discount_code,
    discount_amount: order.discount_amount || 0,
    created_at: order.created_at ? new Date(order.created_at) : new Date(),
    updated_at: order.updated_at ? new Date(order.updated_at) : new Date(),
  }
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  console.log("🔍 [API] GET /api/orders - Request received")

  try {
    const { searchParams } = new URL(request.url)
    const hasLimitParam = searchParams.has("limit")
    const hasPageParam = searchParams.has("page")
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 200)
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
    const skip = (page - 1) * limit

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("🔐 [API] Token present:", !!token)

    if (!token) {
      console.log("❌ [API] No authorization token provided")
      return NextResponse.json({ error: "Authorization required" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!)
      console.log("✅ [API] Token verified for user:", decoded.email, "Role:", decoded.role)
    } catch (jwtError) {
      console.error("❌ [API] JWT verification failed:", jwtError)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Use admin client to bypass RLS for reading orders
    const client = supabaseAdmin || supabase
    
    if (!supabaseAdmin) {
      console.warn("Warning: SUPABASE_SERVICE_ROLE_KEY not set, using anon key. RLS policies may block order reading.")
    }

    let query = client
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (hasPageParam) {
      query = query.range(skip, skip + limit - 1)
    } else if (hasLimitParam) {
      query = query.limit(limit)
    }

    // If user role, only show their orders
    if (decoded.role === "user") {
      query = query.eq("user_id", decoded.userId)
      console.log("👤 [API] Filtering orders for user:", decoded.userId)
    } else {
      console.log("👑 [API] Admin access - fetching all orders")
    }

    const { data: orders, error } = await query

    let totalCount: number | undefined
    let totalPages: number | undefined

    if (hasPageParam) {
      let countQuery = client
        .from("orders")
        .select("id", { count: "estimated", head: true })

      if (decoded.role === "user") {
        countQuery = countQuery.eq("user_id", decoded.userId)
      }

      const { count } = await countQuery
      totalCount = count || 0
      totalPages = Math.max(Math.ceil((totalCount || 0) / limit), 1)
    }

    if (error) {
      console.error("Error fetching orders:", error)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    console.log(`✅ [API] Found ${orders?.length || 0} orders`)

    if (orders && orders.length > 0) {
      console.log("📦 [API] Sample orders:")
      orders.slice(0, 2).forEach((order: any, index: number) => {
        console.log(`   ${index + 1}. Order ${order.order_id} - ${order.total} (${order.status})`)
      })
    }

    const responseTime = Date.now() - startTime
    console.log(`⏱️ [API] Request completed in ${responseTime}ms`)

    // Transform orders to match expected format (maintaining backward compatibility)
    const transformedOrders = (orders || []).map((order: any) => ({
      _id: order.id, // For backward compatibility
      id: order.order_id,
      userId: order.user_id,
      items: order.items || [],
      total: order.total || 0,
      status: order.status || 'pending',
      shippingAddress: order.shipping_address || {},
      paymentMethod: order.payment_method || 'cod',
      paymentDetails: order.payment_details,
      discountCode: order.discount_code,
      discountAmount: order.discount_amount || 0,
      createdAt: order.created_at ? new Date(order.created_at) : new Date(),
      updatedAt: order.updated_at ? new Date(order.updated_at) : new Date(),
    }))

    if (hasPageParam) {
      const safeTotalCount = typeof totalCount === "number" && !Number.isNaN(totalCount) ? totalCount : transformedOrders.length
      const safeTotalPages = typeof totalPages === "number" && !Number.isNaN(totalPages) ? totalPages : 1

      const headers = {
        "X-Total-Count": String(safeTotalCount),
        "X-Page": String(page),
        "X-Limit": String(limit),
        "X-Total-Pages": String(safeTotalPages),
        "Cache-Control": "no-store",
      }

      return NextResponse.json(transformedOrders, { status: 200, headers })
    }

    return NextResponse.json(transformedOrders)
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("❌ [API] Error in GET /api/orders:", error)
    console.error("🔍 [API] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    })

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

const GUEST_USER_ID = "00000000-0000-0000-0000-000000000000"

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log("🔍 [API] POST /api/orders - Request received")

  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    console.log("🔐 [API] Token present:", !!token)

    // Parse request body first
    const orderData = await request.json()
    console.log("📝 [API] Order data received:")
    console.log("   Items count:", orderData.items?.length || 0)
    console.log("   Total:", orderData.total)
    console.log("   Payment method:", orderData.paymentMethod)
    console.log("   Customer:", orderData.shippingAddress?.name)
    
    // Debug gift package items
    if (orderData.items) {
      orderData.items.forEach((item: any, index: number) => {
        if (item.isGiftPackage) {
          console.log(`   🎁 [API] Gift Package Item ${index + 1}:`)
          console.log(`      Name: ${item.name}`)
          console.log(`      isGiftPackage: ${item.isGiftPackage}`)
          console.log(`      packageDetails:`, item.packageDetails)
          console.log(`      selectedProducts:`, item.selectedProducts)
        }
      })
    }

    let userId = "guest"

    if (userId === "guest") {
      const userClient = supabaseAdmin || supabase

      const { data: guestUser } = await userClient
        .from("users")
        .select("id")
        .eq("id", GUEST_USER_ID)
        .maybeSingle()

      if (!guestUser) {
        const { error: guestInsertError } = await userClient
          .from("users")
          .insert({
            id: GUEST_USER_ID,
            email: "guest@alanoudalqadi.com",
            password: "guest-password-placeholder",
            name: "Guest",
            role: "user",
          })
          .single()

        if (guestInsertError) {
          console.error("Error creating guest user:", guestInsertError)
          return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
        }
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        userId = decoded.userId
        console.log("✅ [API] Authenticated user:", decoded.email)
      } catch (jwtError) {
        console.log("⚠️ [API] Invalid token, proceeding as guest order")
      }
    } else {
      console.log("👤 [API] Guest order (no token provided)")
    }

    // If still a guest, try to link the order to an existing account using the shipping email
    if (userId === "guest") {
      const shippingEmail: string | undefined = orderData.shippingAddress?.email
      const normalizedEmail = shippingEmail?.trim()

      if (normalizedEmail) {
        const userClient = supabaseAdmin || supabase
        const { data: existingUser, error: existingUserError } = await userClient
          .from("users")
          .select("id, email")
          .eq("email", normalizedEmail)
          .maybeSingle()

        if (existingUser) {
          userId = existingUser.id
          console.log("🔗 [API] Linked guest order to existing user by email:", existingUser.email)
        } else if (existingUserError) {
          console.error("Error looking up user by email for order linking:", existingUserError)
        }
      }
    }

    // Validate stock availability before creating order
    for (const item of orderData.items as any[]) {
      // Skip validation for gift packages and custom sizes
      if (item.isGiftPackage || item.size === "custom") {
        continue
      }

      // Try by product_id (slug) first, then fall back to id (UUID)
      let { data: product } = await supabase
        .from("products")
        .select("sizes")
        .eq("product_id", item.productId)
        .maybeSingle()

      if (!product) {
        const result = await supabase
          .from("products")
          .select("sizes")
          .eq("id", item.productId)
          .maybeSingle()
        product = result.data
      }

      // If product still not found, skip stock check rather than block the order
      if (!product) {
        console.warn(`⚠️ [API] Product ${item.productId} not found for stock check — skipping`)
        continue
      }

      // Find the size in the product
      const sizeObj = product.sizes?.find((s: any) => s.size === item.size)
      if (sizeObj && sizeObj.stockCount !== undefined) {
        // Check if requested quantity exceeds available stock
        if (item.quantity > sizeObj.stockCount) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${item.name} - Size ${item.size}. Available: ${sizeObj.stockCount}, Requested: ${item.quantity}`
            },
            { status: 400 }
          )
        }
      }
    }

    // Generate unique order ID
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log("🆔 [API] Generated order ID:", orderId)

    // Prepare order document for Supabase
    const newOrder = {
      order_id: orderId,
      order_number: orderId,
      user_id: userId === "guest" ? GUEST_USER_ID : userId,
      items: orderData.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        size: item.size,
        volume: item.volume,
        image: item.image,
        category: item.category,
        quantity: Number(item.quantity),
        // Preserve gift package details
        isGiftPackage: item.isGiftPackage || false,
        selectedProducts: item.selectedProducts || undefined,
        packageDetails: item.packageDetails || undefined,
        // Preserve custom measurements
        customMeasurements: item.customMeasurements || undefined,
      })),
      total: Number(orderData.total),
      status: "pending",
      shipping_address: {
        name: orderData.shippingAddress.name,
        email: orderData.shippingAddress.email || "",
        phone: orderData.shippingAddress.phone || "",
        secondaryPhone: orderData.shippingAddress.secondaryPhone,
        address: orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        country: orderData.shippingAddress.country || orderData.shippingAddress.governorate || "",
        countryCode: orderData.shippingAddress.countryCode || "",
        postalCode: orderData.shippingAddress.postalCode || "",
        governorate: orderData.shippingAddress.governorate || "",
      },
      payment_method: orderData.paymentMethod || "cod",
      payment_details: orderData.paymentDetails || null,
      discount_code: orderData.discountCode || null,
      discount_amount: orderData.discountAmount || 0,
    }

    console.log("💾 [API] Inserting order into database...")
    console.log("📄 [API] Order document summary:")
    console.log("   Order ID:", newOrder.order_id)
    console.log("   User ID:", newOrder.user_id)
    console.log("   Items:", newOrder.items.length)
    console.log("   Total:", newOrder.total)
    console.log("   Status:", newOrder.status)
    console.log("   Discount:", newOrder.discount_code, newOrder.discount_amount)
    
    // Debug gift package items being saved
    newOrder.items.forEach((item: any, index: number) => {
      if (item.isGiftPackage) {
        console.log(`   🎁 [API] Saving Gift Package Item ${index + 1}:`)
        console.log(`      Name: ${item.name}`)
        console.log(`      isGiftPackage: ${item.isGiftPackage}`)
        console.log(`      packageDetails:`, item.packageDetails)
        console.log(`      selectedProducts:`, item.selectedProducts)
      }
    })

    // Use admin client to bypass RLS for order creation
    const client = supabaseAdmin || supabase
    
    if (!supabaseAdmin) {
      console.warn("Warning: SUPABASE_SERVICE_ROLE_KEY not set, using anon key. RLS policies may block order creation.")
    }

    const { data: result, error: insertError } = await client
      .from("orders")
      .insert(newOrder)
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting order:", insertError)
      const errorMessage = insertError.message || "Failed to create order"
      // Check for common RLS errors
      if (errorMessage.includes("new row violates row-level security") || errorMessage.includes("RLS")) {
        return NextResponse.json({ 
          error: "Database configuration error. Please contact support." 
        }, { status: 500 })
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    console.log("✅ [API] Order inserted with ID:", result.id)

    // Update stock counts after order creation
    for (const item of newOrder.items as any[]) {
      // Skip stock update for gift packages and custom sizes
      if (item.isGiftPackage || item.size === "custom") {
        continue
      }

      const productClient = supabaseAdmin || supabase

      // Try by product_id (slug) first, then fall back to id (UUID)
      let { data: product } = await productClient
        .from("products")
        .select("id, sizes, is_out_of_stock")
        .eq("product_id", item.productId)
        .maybeSingle()

      if (!product) {
        const result = await productClient
          .from("products")
          .select("id, sizes, is_out_of_stock")
          .eq("id", item.productId)
          .maybeSingle()
        product = result.data
      }

      if (product && product.sizes) {
        const sizeIndex = product.sizes.findIndex((s: any) => s.size === item.size)
        if (sizeIndex !== -1 && product.sizes[sizeIndex].stockCount !== undefined) {
          const newStockCount = product.sizes[sizeIndex].stockCount - item.quantity

          const updatedSizes = [...product.sizes]
          updatedSizes[sizeIndex] = {
            ...updatedSizes[sizeIndex],
            stockCount: Math.max(0, newStockCount)
          }

          const allSizesOutOfStock = updatedSizes.every((s: any) =>
            s.stockCount === undefined || s.stockCount <= 0
          )

          await productClient
            .from("products")
            .update({
              sizes: updatedSizes,
              is_out_of_stock: allSizesOutOfStock
            })
            .eq("id", product.id)
        }
      }
    }

    // Verify insertion (use same client)
    const { data: insertedOrder } = await client
      .from("orders")
      .select("*")
      .eq("id", result.id)
      .single()

    console.log("🔍 [API] Verification - Order found in database:", !!insertedOrder)

    if (insertedOrder) {
      console.log("✅ [API] Order verification successful:")
      console.log("   Database ID:", insertedOrder.id)
      console.log("   Order ID:", insertedOrder.order_id)
      console.log("   Customer:", insertedOrder.shipping_address?.name)
      console.log("   Total:", insertedOrder.total)
      console.log("   Status:", insertedOrder.status)
    }

    // Get order counts
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: 'exact', head: true })

    const { count: userOrders } = userId !== "guest" 
      ? await supabase
          .from("orders")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", userId)
      : { count: 0 }

    console.log("📊 [API] Database stats after insertion:")
    console.log("   Total orders:", totalOrders)
    if (userId !== "guest") {
      console.log("   User orders:", userOrders)
    }

    const responseTime = Date.now() - startTime
    console.log(`⏱️ [API] Order creation completed in ${responseTime}ms`)

    // Return order in expected format (with _id for backward compatibility)
    const transformedOrder = {
      _id: result.id,
      id: result.order_id,
      userId: result.user_id,
      items: result.items || [],
      total: result.total || 0,
      status: result.status || 'pending',
      shippingAddress: result.shipping_address || {},
      paymentMethod: result.payment_method || 'cod',
      paymentDetails: result.payment_details,
      discountCode: result.discount_code,
      discountAmount: result.discount_amount || 0,
      createdAt: result.created_at ? new Date(result.created_at) : new Date(),
      updatedAt: result.updated_at ? new Date(result.updated_at) : new Date(),
    }

    return NextResponse.json({
      success: true,
      order: transformedOrder,
      message: "Order created successfully",
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("❌ [API] Error in POST /api/orders:", error)
    console.error("🔍 [API] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      responseTime: `${responseTime}ms`,
    })

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
