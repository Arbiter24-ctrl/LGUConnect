import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { classifyComplaint } from "@/lib/ai-classifier"
import { translateToEnglish } from "@/lib/utils"

// GET /api/complaints - Fetch complaints with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const user_id = searchParams.get("user_id")
    const barangay_id = searchParams.get("barangay_id")
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
    if (barangay_id) {
      whereConditions.push("c.barangay_id = ?")
      params.push(barangay_id)
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
        assigned.last_name as assigned_last_name,
        b.name as barangay_name,
        c.suggested_department,
        c.estimated_resolution_days,
        c.classification_source,
        c.classification_confidence
      FROM complaints c
      LEFT JOIN complaint_categories cat ON c.category_id = cat.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users assigned ON c.assigned_to = assigned.id
      LEFT JOIN barangays b ON c.barangay_id = b.id
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
    console.log('📝 POST /api/complaints - Starting complaint creation...')
    
    const body = await request.json()
    console.log('📋 Request body:', JSON.stringify(body, null, 2))
    
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
      console.log('❌ Missing required fields:', { category_id, title, description, barangay_id })
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }
    
    console.log('✅ Required fields validation passed')
    
    // Generate unique reference numbers
    const generateReferenceNumber = () => {
      const timestamp = Date.now().toString().slice(-6)
      const random = Math.random().toString(36).substring(2, 5).toUpperCase()
      return `CM-${timestamp}-${random}`
    }

    const generateTrackingCode = () => {
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      return `TRK-${random}`
    }

    const referenceNumber = generateReferenceNumber()
    const trackingCode = generateTrackingCode()

    // For anonymous complaints, use null user_id to indicate anonymous
    const finalUserId = user_id ? Number(user_id) : null

    // Auto-translate Cebuano/Filipino to English for better AI understanding
    console.log('🌐 Performing auto-translation...')
    let translatedTitle = title
    let translatedDescription = description
    
    try {
      const [titleEn, descriptionEn] = await Promise.all([
        translateToEnglish(title),
        translateToEnglish(description)
      ])
      translatedTitle = titleEn
      translatedDescription = descriptionEn
      console.log('✅ Translation completed')
    } catch (translationError) {
      console.warn('⚠️ Translation failed, using original text:', translationError.message)
    }

    // Perform AI classification using translated text
    console.log('🤖 Performing AI classification...')
    let classification = null
    let classificationError = null
    
    try {
      classification = await classifyComplaint(translatedTitle, translatedDescription, location_address)
      console.log('✅ AI classification completed:', classification)
    } catch (error) {
      console.error('⚠️ AI classification failed:', error)
      classificationError = error.message
      // Use default classification
      classification = {
        category: 'Other',
        subcategory: 'General',
        priority: 'medium',
        urgency_score: 5,
        sentiment: 'neutral',
        keywords: [title.split(' ')[0] || 'complaint'],
        suggested_department: 'Administrative Office',
        estimated_resolution_days: 7,
        confidence: 0.5,
        source: 'default'
      }
    }

    console.log('💾 Inserting complaint into database...')
    
    const sql = `
      INSERT INTO complaints (
        user_id, category_id, title, description,
        location_lat, location_lng, location_address, barangay_id,
        priority, status, anonymous_name, anonymous_email, anonymous_phone,
        reference_number, tracking_code, suggested_department, estimated_resolution_days,
        classification_source, classification_confidence, processing_time_ms,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const insertParams = [
      finalUserId,
      category_id,
      title,
      description,
      location_lat || null,
      location_lng || null,
      location_address || null,
      barangay_id,
      classification.priority || 'medium', // Use AI-suggested priority
      'submitted', // status
      anonymous_name || null,
      anonymous_email || null,
      anonymous_phone || null,
      referenceNumber,
      trackingCode,
      classification.suggested_department || 'Administrative Office',
      classification.estimated_resolution_days || 7,
      classification.source || 'default',
      classification.confidence || 0.5,
      classification.processing_time || 0,
      new Date().toISOString(),
      new Date().toISOString()
    ]

    console.log('📋 Insert parameters:', insertParams)
    const complaintId = await db.insert(sql, insertParams)
    console.log('✅ Complaint inserted successfully, ID:', complaintId)

    // Insert AI classification record
    if (classification && !classificationError) {
      console.log('📝 Inserting AI classification record...')
      try {
        await db.insert(
          `INSERT INTO ai_classifications (
            complaint_id, original_category_id, ai_suggested_category_id,
            ai_suggested_priority, confidence_score, model_version,
            classification_source, processing_time_ms, ml_confidence, ai_confidence
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            complaintId,
            category_id, // original category selected by user
            category_id, // for now, keep the same (could be different if AI suggests different category)
            classification.priority,
            classification.confidence,
            'v1.0',
            classification.source,
            classification.processing_time || 0,
            classification.ml_confidence || null,
            classification.ai_confidence || null
          ]
        )
        console.log('✅ AI classification record inserted successfully')
      } catch (classError) {
        console.error('⚠️ Failed to insert AI classification record:', classError)
      }
    }

    // Insert status history
    console.log('📝 Inserting status history...')
    // For anonymous complaints, use a system user ID (1) for status history
    const statusChangedBy = finalUserId || 1
    await db.insert(
      "INSERT INTO complaint_status_history (complaint_id, new_status, changed_by) VALUES (?, ?, ?)",
      [complaintId, "submitted", statusChangedBy]
    )
    console.log('✅ Status history inserted successfully')

    return NextResponse.json({ 
      success: true, 
      message: "Complaint submitted successfully",
      data: { 
        id: complaintId,
        reference_number: referenceNumber,
        tracking_code: trackingCode
      }
    })

  } catch (error) {
    console.error("Error creating complaint:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Failed to create complaint",
      details: error.message 
    }, { status: 500 })
  }
}
