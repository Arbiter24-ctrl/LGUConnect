import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/track?code=TRK-XXXXXX - Track complaint by tracking code
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackingCode = searchParams.get('code')

    if (!trackingCode) {
      return NextResponse.json({ 
        success: false, 
        error: "Tracking code is required" 
      }, { status: 400 })
    }

    // Find complaint by tracking code
    const sql = `
      SELECT 
        c.id,
        c.title,
        c.description,
        c.status,
        c.priority,
        c.reference_number,
        c.tracking_code,
        c.location_address,
        c.anonymous_name,
        c.anonymous_email,
        c.anonymous_phone,
        c.created_at,
        c.updated_at,
        cc.name as category_name,
        cc.color as category_color,
        b.name as barangay_name
      FROM complaints c
      LEFT JOIN complaint_categories cc ON c.category_id = cc.id
      LEFT JOIN barangays b ON c.barangay_id = b.id
      WHERE c.tracking_code = ?
    `
    
    const complaint = await db.findOne(sql, [trackingCode])

    if (!complaint) {
      return NextResponse.json({ 
        success: false, 
        error: "Complaint not found. Please check your tracking code." 
      }, { status: 404 })
    }

    // Get status history
    const statusHistorySql = `
      SELECT 
        old_status,
        new_status,
        notes,
        created_at
      FROM complaint_status_history
      WHERE complaint_id = ?
      ORDER BY created_at ASC
    `
    
    const statusHistory = await db.findMany(statusHistorySql, [complaint.id])

    const response = {
      success: true,
      data: {
        complaint: {
          id: complaint.id,
          title: complaint.title,
          description: complaint.description,
          status: complaint.status,
          priority: complaint.priority,
          reference_number: complaint.reference_number,
          tracking_code: complaint.tracking_code,
          location_address: complaint.location_address,
          category_name: complaint.category_name,
          category_color: complaint.category_color,
          barangay_name: complaint.barangay_name,
          created_at: complaint.created_at,
          updated_at: complaint.updated_at,
          // Only show contact info if provided
          contact_info: complaint.anonymous_name ? {
            name: complaint.anonymous_name,
            email: complaint.anonymous_email,
            phone: complaint.anonymous_phone
          } : null
        },
        status_history: statusHistory
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error tracking complaint:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to track complaint" 
    }, { status: 500 })
  }
}
