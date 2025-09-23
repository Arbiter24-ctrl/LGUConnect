import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/barangays - Fetch all barangays
export async function GET() {
  try {
    const sql = `
      SELECT id, name, description, contact_info
      FROM barangays
      ORDER BY name ASC
    `
    
    const barangays = await db.findMany(sql, [])

    const response = {
      success: true,
      data: barangays,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching barangays:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch barangays" }, { status: 500 })
  }
}
