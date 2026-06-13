import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getUserFromSession } from "@/lib/auth"

/**
 * Validates admin access using JWT session
 */
export async function requireAdmin() {
  const user = await getUserFromSession()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  if (!supabaseAdmin) {
    console.error("supabaseAdmin is not initialized. Check SUPABASE_SERVICE_ROLE_KEY.")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  return null // null means OK
}

/**
 * Generic GET handler to fetch all items
 */
export async function handleGetItems(tableName: string, orderByCol: string = "order", ascending: boolean = true) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    let result = await supabaseAdmin!
      .from(tableName)
      .select("*")
      .order(orderByCol, { ascending })
    
    // If ordering column doesn't exist, fallback to created_at
    if (result.error && result.error.message?.includes('column') && orderByCol !== 'created_at') {
      result = await supabaseAdmin!
        .from(tableName)
        .select("*")
        .order('created_at', { ascending })
    }
    
    if (result.error) throw result.error
    return NextResponse.json(result.data)
  } catch (error: any) {
    console.error(`Error fetching from ${tableName}:`, error)
    return NextResponse.json({ error: error.message || "Failed to fetch data" }, { status: 500 })
  }
}

/**
 * Generic POST handler for creating an item
 */
export async function handleCreateItem(tableName: string, req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const data = await req.json()
    
    // Auto-increment sort_order if not provided (skip if column doesn't exist)
    if (data.order === undefined && tableName !== "users" && tableName !== "reviews") {
      try {
        const { data: highest, error: sortError } = await supabaseAdmin!
          .from(tableName)
          .select("sort_order")
          .order("sort_order", { ascending: false })
          .limit(1)
        
        if (!sortError) {
          data.sort_order = highest && highest.length > 0 ? (highest[0].sort_order || 0) + 1 : 1
        }
      } catch {
        // sort_order column might not exist, skip
      }
    }
    
    // Remove fields that might not exist in the target table
    // to prevent Supabase from throwing errors
    const cleanData = { ...data }
    delete cleanData.order

    const { data: newItem, error } = await supabaseAdmin!
      .from(tableName)
      .insert([cleanData])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, item: newItem })
  } catch (error: any) {
    console.error(`Error creating in ${tableName}:`, error)
    return NextResponse.json({ error: error.message || "Failed to create item" }, { status: 500 })
  }
}

/**
 * Generic PUT handler for updating an item
 */
export async function handleUpdateItem(tableName: string, req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const data = await req.json()
    // Support either id or _id from frontend
    const id = data.id || data._id
    
    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 })
    }

    // Clean up frontend specifics
    delete data._id
    delete data.id
    
    const { error } = await supabaseAdmin!
      .from(tableName)
      .update(data)
      .eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error updating in ${tableName}:`, error)
    return NextResponse.json({ error: error.message || "Failed to update item" }, { status: 500 })
  }
}

/**
 * Generic DELETE handler
 */
export async function handleDeleteItem(tableName: string, req: Request) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Missing item ID" }, { status: 400 })
    }

    const { error } = await supabaseAdmin!
      .from(tableName)
      .delete()
      .eq("id", id)
      
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error deleting from ${tableName}:`, error)
    return NextResponse.json({ error: error.message || "Failed to delete item" }, { status: 500 })
  }
}
