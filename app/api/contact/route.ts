import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const client = supabaseAdmin || supabase
    const { error } = await client.from("contact_messages").insert({
      name: name,
      full_name: name,
      email,
      phone: phone || "",
      subject,
      message,
      is_read: false,
    })

    if (error) {
      console.error("Contact form error:", error)
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
        if (decoded.role !== "admin") {
          return NextResponse.json({ error: "Admin access required" }, { status: 403 })
        }
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    }

    const client = supabaseAdmin || supabase
    const { data: messages, error } = await client
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching contact messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    const formatted = (messages || []).map((msg: any) => ({
      _id: msg.id,
      id: msg.id,
      name: msg.name || msg.full_name || "",
      email: msg.email,
      phone: msg.phone || "",
      subject: msg.subject,
      message: msg.message,
      isRead: msg.is_read || false,
      createdAt: msg.created_at,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Authorization required" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id, isRead } = await request.json()
    if (!id) return NextResponse.json({ error: "Message ID is required" }, { status: 400 })

    const client = supabaseAdmin || supabase
    const { error } = await client
      .from("contact_messages")
      .update({ is_read: isRead ?? true })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating contact message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Authorization required" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "Message ID is required" }, { status: 400 })

    const client = supabaseAdmin || supabase
    const { error } = await client.from("contact_messages").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete message" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
