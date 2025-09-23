import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ApiResponse, Complaint } from "@/lib/types"
import { classifyComplaint } from "@/lib/hybrid-classifier"

// GET /api/complaints - Fetch complaints with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const user_id = searchParams.get("user_id")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const whereConditions = []
    const params = []

    if (status) {
      whereConditions.push("c.status = ?")
      params.push(status)
    }
    if (category) {
      whereConditions.push("c.category_id = ?")
      params.push(category)
    }
    if (priority) {
      whereConditions.push("c.priority = ?")
      params.push(priority)
    }
    if (user_id) {
      whereConditions.push("c.user_id = ?")
      params.push(user_id)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    const sql = `
      SELECT 
        c.*,
        cat.name as category_name,
        cat.color as category_color,
        u.first_name,
        u.last_name,
        u.email,
        assigned.first_name as assigned_first_name,
        assigned.last_name as assigned_last_name
      FROM complaints c
      LEFT JOIN complaint_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users assigned ON c.assigned_to = assigned.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `

    params.push(limit, offset)
    const complaints = await db.findMany(sql, params)

    const response = {
      success: true,
      data: complaints,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching complaints:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch complaints" }, { status: 500 })
  }
}

// POST /api/complaints - Create new complaint
export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      user_id, 
      category_id, 
      title, 
      description, 
      location_lat, 
      location_lng, 
      location_address,
      barangay_id,
      anonymous_name,
      anonymous_email,
      anonymous_phone
    } = body

    // Validate required fields
    if (!category_id || !title || !description || !barangay_id) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // For anonymous submissions, set user_id to 0
    const finalUserId = user_id || 0

    let classification = null
    try {
      classification = await classifyComplaint(title, description, location_address)
      console.log(`[Hybrid] Classification result (${classification.source}):`, classification)
    } catch (error) {
      console.error("[Hybrid] Classification failed:", error)
      // Continue without classification if it fails
    }

    const sql = `
      INSERT INTO complaints (
        user_id, category_id, title, description, 
        location_lat, location_lng, location_address, barangay_id,
        priority, urgency_score, sentiment, keywords, 
        suggested_department, estimated_resolution_days,
        anonymous_name, anonymous_email, anonymous_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const complaintId = await db.insert(sql, [
      finalUserId,
      category_id,
      title,
      description,
      location_lat || null,
      location_lng || null,
      location_address || null,
      barangay_id,
      classification?.priority || "medium",
      classification?.urgency_score || 5,
      classification?.sentiment || "neutral",
      classification?.keywords ? JSON.stringify(classification.keywords) : null,
      classification?.suggested_department || "Administrative Office",
      classification?.estimated_resolution_days || 7,
      anonymous_name || null,
      anonymous_email || null,
      anonymous_phone || null,
    ])

    if (classification) {
      await db.insert(
        `
        INSERT INTO ai_classifications (
          complaint_id, category, subcategory, priority, urgency_score,
          sentiment, keywords, suggested_department, estimated_resolution_days,
          confidence_score, classification_source, processing_time_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          complaintId,
          classification.category,
          classification.subcategory,
          classification.priority,
          classification.urgency_score,
          classification.sentiment,
          JSON.stringify(classification.keywords),
          classification.suggested_department,
          classification.estimated_resolution_days,
          classification.confidence || 0.85,
          classification.source || 'unknown',
          classification.processing_time || 0
        ],
      )
    }

    // Log status history
    await db.insert("INSERT INTO complaint_status_history (complaint_id, new_status, changed_by) VALUES (?, ?, ?)", [
      complaintId,
      "submitted",
      finalUserId,
    ])

    const response = {
      success: true,
      data: { id: complaintId },
      message: "Complaint submitted successfully",
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Error creating complaint:", error)
    return NextResponse.json({ success: false, error: "Failed to create complaint" }, { status: 500 })
  }
}
