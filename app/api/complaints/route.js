import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { ApiResponse, Complaint } from "@/lib/types"
import { classifyComplaint } from "@/lib/hybrid-classifier"
import { translateToEnglish } from "@/lib/utils"

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

    // Resolve a valid user id. If none provided, use a seeded resident or create an Anonymous user
    let finalUserId = user_id ? Number(user_id) : null
    if (!finalUserId) {
      // Try seeded resident first
      const seededResident = await db.findOne(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        ['resident@barangay.com']
      )
      if (seededResident?.id) {
        finalUserId = seededResident.id
      } else {
        // Fallback to any resident
        const anyResident = await db.findOne(
          "SELECT id FROM users WHERE role = 'resident' LIMIT 1",
          []
        )
        if (anyResident?.id) {
          finalUserId = anyResident.id
        } else {
          // Create a minimal Anonymous user
          const anonEmail = `anonymous_${Date.now()}@local`
          const anonPasswordHash = '0000000000000000000000000000000000000000000000000000000000000000'
          const insertAnonSql = `
            INSERT INTO users (email, password_hash, first_name, last_name, role)
            VALUES (?, ?, ?, ?, ?)
          `
          finalUserId = await db.insert(insertAnonSql, [
            anonEmail,
            anonPasswordHash,
            'Anonymous',
            'User',
            'resident'
          ])
        }
      }
    }

    let classification = null
    try {
      // Auto-translate Cebuano/Filipino to English before analysis
      const [titleEn, descriptionEn] = await Promise.all([
        translateToEnglish(title),
        translateToEnglish(description)
      ])
      classification = await classifyComplaint(titleEn, descriptionEn, location_address)
      console.log(`[Hybrid] Classification result (${classification.source}):`, classification)
    } catch (error) {
      console.error("[Hybrid] Classification failed:", error)
      // Continue without classification if it fails
    }

    // Normalize priority to match DB constraint (low|medium|high)
    const normalizedPriority = (classification?.priority || 'medium').toLowerCase()

    const sql = `
      INSERT INTO complaints (
        user_id, category_id, title, description,
        location_lat, location_lng, location_address, barangay_id,
        priority, anonymous_name, anonymous_email, anonymous_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ['low', 'medium', 'high'].includes(normalizedPriority) ? normalizedPriority : 'medium',
      anonymous_name || null,
      anonymous_email || null,
      anonymous_phone || null,
    ])

    // Optional: store classification elsewhere. Skipping ai_classifications insert due to schema mismatch.

    // Log status history
    await db.insert(
      "INSERT INTO complaint_status_history (complaint_id, new_status, changed_by) VALUES (?, ?, ?)",
      [
        complaintId,
        "submitted",
        finalUserId || null,
      ]
    )

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
