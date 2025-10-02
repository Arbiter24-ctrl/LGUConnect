import { NextResponse } from "next/server"
import { db } from "@/lib/db"

// GET /api/complaints/stats - Get complaint statistics
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const barangay_id = searchParams.get("barangay_id")
    const barangay_name = searchParams.get("barangay_name")
    
    // Build WHERE clause for barangay filtering
    let whereClause = ""
    let params = []
    
    if (barangay_id) {
      whereClause = "WHERE c.barangay_id = ?"
      params.push(barangay_id)
    } else if (barangay_name) {
      whereClause = "WHERE b.name = ?"
      params.push(barangay_name)
    }
    
    // Get today's date for filtering today's complaints
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
    
    // Query for today's complaints
    const todayQuery = `
      SELECT COUNT(*) as count
      FROM complaints c
      LEFT JOIN barangays b ON c.barangay_id = b.id
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} c.created_at >= ? AND c.created_at < ?
    `
    const todayParams = [...params, todayStart.toISOString(), todayEnd.toISOString()]
    
    // Query for pending complaints
    const pendingQuery = `
      SELECT COUNT(*) as count
      FROM complaints c
      LEFT JOIN barangays b ON c.barangay_id = b.id
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} c.status IN ('submitted', 'in_progress')
    `
    const pendingParams = [...params]
    
    // Query for total complaints
    const totalQuery = `
      SELECT COUNT(*) as count
      FROM complaints c
      LEFT JOIN barangays b ON c.barangay_id = b.id
      ${whereClause}
    `
    const totalParams = [...params]
    
    // Query for resolved complaints
    const resolvedQuery = `
      SELECT COUNT(*) as count
      FROM complaints c
      LEFT JOIN barangays b ON c.barangay_id = b.id
      ${whereClause}
      ${whereClause ? 'AND' : 'WHERE'} c.status = 'resolved'
    `
    const resolvedParams = [...params]
    
    // Execute all queries
    const [todayResult, pendingResult, totalResult, resolvedResult] = await Promise.all([
      db.findOne(todayQuery, todayParams),
      db.findOne(pendingQuery, pendingParams),
      db.findOne(totalQuery, totalParams),
      db.findOne(resolvedQuery, resolvedParams)
    ])
    
    const stats = {
      today: todayResult?.count || 0,
      pending: pendingResult?.count || 0,
      total: totalResult?.count || 0,
      resolved: resolvedResult?.count || 0
    }
    
    return NextResponse.json({
      success: true,
      data: stats
    })
    
  } catch (error) {
    console.error("Error fetching complaint stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch complaint statistics" },
      { status: 500 }
    )
  }
}
