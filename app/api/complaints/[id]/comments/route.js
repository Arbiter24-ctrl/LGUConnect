import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/complaints/[id]/comments - Get comments for a complaint
export async function GET(request, { params }) {
  try {
    const complaintId = Number.parseInt(params.id)

    const sql = `
      SELECT 
        c.*,
        u.first_name,
        u.last_name
      FROM complaint_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.complaint_id = ?
      ORDER BY c.created_at ASC
    `

    const comments = await db.findMany(sql, [complaintId])

    return NextResponse.json({
      success: true,
      data: comments
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch comments" 
    }, { status: 500 })
  }
}

// POST /api/complaints/[id]/comments - Add a comment to a complaint
export async function POST(request, { params }) {
  try {
    const complaintId = Number.parseInt(params.id)
    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Comment content is required" 
      }, { status: 400 })
    }

    // For now, we'll use a default user_id of 1 (admin)
    // In a real app, this would come from authentication
    const userId = 1

    const sql = `
      INSERT INTO complaint_comments (complaint_id, user_id, content)
      VALUES (?, ?, ?)
    `

    const commentId = await db.insert(sql, [complaintId, userId, content.trim()])

    return NextResponse.json({
      success: true,
      data: { id: commentId },
      message: "Comment added successfully"
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to add comment" 
    }, { status: 500 })
  }
}
