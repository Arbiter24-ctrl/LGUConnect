import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ApiResponse, ComplaintCategory } from "@/lib/types"

// GET /api/categories - Get all complaint categories
export async function GET() {
  try {
    const categories = await db.findMany("SELECT * FROM complaint_categories ORDER BY name")

    const response = {
      success: true,
      data: categories,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 })
  }
}
