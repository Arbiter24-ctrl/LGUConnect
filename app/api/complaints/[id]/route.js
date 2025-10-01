import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/complaints/[id] - Get single complaint with details
export async function GET(request, { params }) {
  try {
    const complaintId = Number.parseInt(params.id)

    const sql = `
      SELECT 
        c.*,
        cat.name as category_name,
        cat.color as category_color,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        assigned.first_name as assigned_first_name,
        assigned.last_name as assigned_last_name
      FROM complaints c
      LEFT JOIN complaint_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users assigned ON c.assigned_to = assigned.id
      WHERE c.id = ?
    `

    const complaint = await db.findOne(sql, [complaintId])

    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 })
    }

    // Get attachments
    const attachments = await db.findMany("SELECT * FROM complaint_attachments WHERE complaint_id = ?", [complaintId])

    // Get status history
    const statusHistory = await db.findMany(
      `
      SELECT 
        sh.*,
        u.first_name,
        u.last_name
      FROM complaint_status_history sh
      LEFT JOIN users u ON sh.changed_by = u.id
      WHERE sh.complaint_id = ?
      ORDER BY sh.created_at DESC
    `,
      [complaintId],
    )

    const response = {
      success: true,
      data: {
        ...complaint,
        attachments,
        status_history: statusHistory,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching complaint:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch complaint" }, { status: 500 })
  }
}

// PATCH /api/complaints/[id] - Update complaint status
export async function PATCH(request, { params }) {
  try {
    const complaintId = Number.parseInt(params.id)
    const body = await request.json()
    const { status, assigned_to, resolution_notes, changed_by } = body

    // Get current complaint
    const currentComplaint = await db.findOne("SELECT status FROM complaints WHERE id = ?", [complaintId])

    if (!currentComplaint) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 })
    }

    // Update complaint
    const updateFields = []
    const updateParams = []

    if (status) {
      updateFields.push("status = ?")
      updateParams.push(status)
    }
    if (assigned_to !== undefined) {
      updateFields.push("assigned_to = ?")
      updateParams.push(assigned_to)
    }
    if (resolution_notes) {
      updateFields.push("resolution_notes = ?")
      updateParams.push(resolution_notes)
    }
    if (status === "resolved") {
        updateFields.push("resolved_at = CURRENT_TIMESTAMP")
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateParams.push(complaintId)

    await db.update(`UPDATE complaints SET ${updateFields.join(", ")} WHERE id = ?`, updateParams)

    // Log status change if status was updated
    if (status && status !== currentComplaint.status) {
      await db.insert(
        "INSERT INTO complaint_status_history (complaint_id, old_status, new_status, changed_by) VALUES (?, ?, ?, ?)",
        [complaintId, currentComplaint.status, status, changed_by],
      )
    }

    const response = {
      success: true,
      message: "Complaint updated successfully",
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error updating complaint:", error)
    return NextResponse.json({ success: false, error: "Failed to update complaint" }, { status: 500 })
  }
}
