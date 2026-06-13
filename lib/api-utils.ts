import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

/**
 * Generic GET handler for fetching all active items sorted by order
 */
export async function handleGetActive(collectionName: string) {
  try {
    const db = await getDatabase()
    const items = await db
      .collection(collectionName)
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray()
      
    // Transform _id to string
    const formatted = items.map(item => ({
      ...item,
      _id: item._id.toString()
    }))
    
    return NextResponse.json(formatted)
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

/**
 * Setup default indexes for new collections
 */
export async function ensureCondorIndexes() {
  try {
    const db = await getDatabase()
    
    await Promise.all([
      db.collection("hero_slides").createIndex({ isActive: 1, order: 1 }),
      db.collection("brands").createIndex({ isActive: 1, order: 1 }),
      db.collection("brands").createIndex({ slug: 1 }, { unique: true }),
      db.collection("categories").createIndex({ slug: 1 }, { unique: true }),
      db.collection("categories").createIndex({ isActive: 1, order: 1 }),
      db.collection("models").createIndex({ isActive: 1, order: 1 }),
      db.collection("models").createIndex({ brandId: 1, isActive: 1 }),
      db.collection("models").createIndex({ slug: 1 }),
      db.collection("variants").createIndex({ isActive: 1, order: 1 }),
      db.collection("variants").createIndex({ modelId: 1, isActive: 1 }),
      db.collection("variants").createIndex({ brandId: 1, isActive: 1 }),
      db.collection("variants").createIndex({ isFeatured: 1, isActive: 1 }),
      db.collection("contact_messages").createIndex({ createdAt: -1 }),
      db.collection("homepage_sections").createIndex({ isActive: 1, order: 1 }),
    ])
    
    return true
  } catch (error) {
    console.error("Failed to create Condor indexes:", error)
    return false
  }
}
