import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Save to MongoDB
    const db = await getDatabase()
    await db.collection("contact_messages").insertOne({
      name,
      email,
      phone: phone || "",
      subject,
      message,
      isRead: false,
      createdAt: new Date(),
    })

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const messages = await db
      .collection("contact_messages")
      .find()
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    const formatted = messages.map((msg) => ({
      ...msg,
      _id: msg._id.toString(),
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}
