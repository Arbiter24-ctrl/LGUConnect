import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/reports/generate - Generate and download reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "summary"
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const barangay = searchParams.get("barangay")
    
    // Build WHERE clause
    const whereConditions = []
    const params = []
    
    if (dateFrom) {
      whereConditions.push("c.created_at >= ?")
      params.push(dateFrom + " 00:00:00")
    }
    
    if (dateTo) {
      whereConditions.push("c.created_at <= ?")
      params.push(dateTo + " 23:59:59")
    }
    
    if (category) {
      whereConditions.push("c.category_id = ?")
      params.push(category)
    }
    
    if (status && status !== 'all') {
      whereConditions.push("c.status = ?")
      params.push(status)
    }
    
    if (barangay) {
      whereConditions.push("b.name = ?")
      params.push(barangay)
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""
    
    let sql = ""
    let csvHeaders = ""
    
    if (type === "summary") {
      sql = `
        SELECT 
          COUNT(*) as total_complaints,
          COUNT(CASE WHEN c.status = 'submitted' THEN 1 END) as submitted,
          COUNT(CASE WHEN c.status = 'in_progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN c.status = 'resolved' THEN 1 END) as resolved,
          COUNT(CASE WHEN c.status = 'closed' THEN 1 END) as closed,
          b.name as barangay_name
        FROM complaints c
        LEFT JOIN barangays b ON c.barangay_id = b.id
        ${whereClause}
        GROUP BY b.name
        ORDER BY b.name
      `
      csvHeaders = "Barangay,Total Complaints,Submitted,In Progress,Resolved,Closed\n"
    } else if (type === "detailed") {
      sql = `
        SELECT 
          c.id,
          c.title,
          c.description,
          c.status,
          c.priority,
          cat.name as category_name,
          b.name as barangay_name,
          c.created_at,
          c.updated_at,
          COALESCE(u.first_name || ' ' || u.last_name, c.anonymous_name) as complainant_name
        FROM complaints c
        LEFT JOIN complaint_categories cat ON c.category_id = cat.id
        LEFT JOIN barangays b ON c.barangay_id = b.id
        LEFT JOIN users u ON c.user_id = u.id
        ${whereClause}
        ORDER BY c.created_at DESC
      `
      csvHeaders = "ID,Title,Description,Status,Priority,Category,Barangay,Created At,Updated At,Complainant\n"
    } else if (type === "status") {
      sql = `
        SELECT 
          c.status,
          COUNT(*) as count,
          b.name as barangay_name
        FROM complaints c
        LEFT JOIN barangays b ON c.barangay_id = b.id
        ${whereClause}
        GROUP BY c.status, b.name
        ORDER BY b.name, c.status
      `
      csvHeaders = "Status,Count,Barangay\n"
    }
    
    const results = await db.findMany(sql, params)
    
    // Convert to CSV
    let csvContent = csvHeaders
    
    results.forEach(row => {
      let values = []
      
      if (type === "summary") {
        // Order: Barangay,Total Complaints,Submitted,In Progress,Resolved,Closed
        values = [
          row.barangay_name || '',
          row.total_complaints || 0,
          row.submitted || 0,
          row.in_progress || 0,
          row.resolved || 0,
          row.closed || 0
        ]
      } else if (type === "detailed") {
        // Order: ID,Title,Description,Status,Priority,Category,Barangay,Created At,Updated At,Complainant
        values = [
          row.id || '',
          row.title || '',
          row.description || '',
          row.status || '',
          row.priority || '',
          row.category_name || '',
          row.barangay_name || '',
          row.created_at || '',
          row.updated_at || '',
          row.complainant_name || ''
        ]
      } else if (type === "status") {
        // Order: Status,Count,Barangay
        values = [
          row.status || '',
          row.count || 0,
          row.barangay_name || ''
        ]
      }
      
      // Escape and format values
      const formattedValues = values.map(value => {
        if (value === null || value === undefined) return '""'
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      
      csvContent += formattedValues.join(',') + '\n'
    })
    
    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="complaint_report_${type}_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
    
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
