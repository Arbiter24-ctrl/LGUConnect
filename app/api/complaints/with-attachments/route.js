import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/complaints/with-attachments - Fetch recent complaints that have attachments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Number.parseInt(searchParams.get("hours") || "48") // Default to last 48 hours
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const barangay_id = searchParams.get("barangay_id") // Optional barangay filtering

    // Calculate the cutoff date
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000)
    const cutoffDateString = cutoffDate.toISOString()

    console.log(`📸 Fetching complaints with attachments from ${cutoffDateString}`)
    if (barangay_id) {
      console.log(`📍 Filtering by barangay_id: ${barangay_id}`)
    }

    // Build WHERE conditions
    const whereConditions = ["c.created_at >= ?"]
    const params = [cutoffDateString]

    if (barangay_id) {
      whereConditions.push("c.barangay_id = ?")
      params.push(barangay_id)
    }

    const whereClause = whereConditions.join(" AND ")

    const sql = `
      SELECT DISTINCT
        c.*,
        cat.name as category_name,
        cat.color as category_color,
        u.first_name,
        u.last_name,
        u.email,
        b.name as barangay_name,
        c.suggested_department,
        c.estimated_resolution_days,
        c.classification_source,
        c.classification_confidence,
        COUNT(ca.id) as attachment_count
      FROM complaints c
      LEFT JOIN complaint_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN barangays b ON c.barangay_id = b.id
      LEFT JOIN complaint_attachments ca ON c.id = ca.complaint_id
      WHERE ${whereClause}
      GROUP BY c.id
      HAVING attachment_count > 0
      ORDER BY c.created_at DESC
      LIMIT ?
    `

    params.push(limit)
    const complaints = await db.findMany(sql, params)
    console.log(`📸 Found ${complaints.length} complaints with attachments`)

    // For each complaint, fetch its attachments
    const complaintsWithAttachments = await Promise.all(
      complaints.map(async (complaint) => {
        const attachmentsSql = `
          SELECT id, file_path, file_type, file_size, created_at
          FROM complaint_attachments 
          WHERE complaint_id = ?
          ORDER BY created_at ASC
        `
        
        const attachments = await db.findMany(attachmentsSql, [complaint.id])
        
        return {
          ...complaint,
          attachments: attachments.map(att => ({
            id: att.id,
            type: att.file_type,
            url: att.file_path,
            size: att.file_size,
            caption: complaint.title
          }))
        }
      })
    )

    console.log(`📸 Processed ${complaintsWithAttachments.length} complaints with full attachment data`)

    return NextResponse.json({
      success: true,
      data: complaintsWithAttachments,
      meta: {
        total: complaintsWithAttachments.length,
        hours_back: hours,
        cutoff_date: cutoffDateString,
        barangay_id: barangay_id || null,
        filtered_by_barangay: !!barangay_id
      }
    })

  } catch (error) {
    console.error("Error fetching complaints with attachments:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch complaints with attachments",
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}
