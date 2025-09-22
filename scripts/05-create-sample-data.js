const Database = require('better-sqlite3')
const path = require('path')
const crypto = require('crypto')

// Create SQLite database connection
const dbPath = path.join(__dirname, '..', 'complaint_management.db')
const db = new Database(dbPath)

console.log('🌱 Adding Sample Data to Complaint Management System...\n')

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Hash function for passwords
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex')
}

try {
  // Add additional users
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, phone, role, barangay, address) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const additionalUsers = [
    // More residents
    ['ana.garcia@email.com', hashPassword('password123'), 'Ana', 'Garcia', '+63 912 345 6792', 'resident', 'Barangay San Miguel', '123 Garcia Street, San Miguel City'],
    ['carlos.rodriguez@email.com', hashPassword('password123'), 'Carlos', 'Rodriguez', '+63 912 345 6793', 'resident', 'Barangay San Miguel', '456 Rodriguez Avenue, San Miguel City'],
    ['lisa.fernandez@email.com', hashPassword('password123'), 'Lisa', 'Fernandez', '+63 912 345 6794', 'resident', 'Barangay San Miguel', '789 Fernandez Road, San Miguel City'],
    ['miguel.torres@email.com', hashPassword('password123'), 'Miguel', 'Torres', '+63 912 345 6795', 'resident', 'Barangay San Miguel', '321 Torres Lane, San Miguel City'],
    ['sofia.martinez@email.com', hashPassword('password123'), 'Sofia', 'Martinez', '+63 912 345 6796', 'resident', 'Barangay San Miguel', '654 Martinez Street, San Miguel City'],
    
    // More officials
    ['pedro.santos@barangay.com', hashPassword('official123'), 'Pedro', 'Santos', '+63 912 345 6797', 'official', 'Barangay San Miguel', '987 Santos Office, San Miguel City'],
    ['carmen.lopez@barangay.com', hashPassword('official123'), 'Carmen', 'Lopez', '+63 912 345 6798', 'official', 'Barangay San Miguel', '147 Lopez Building, San Miguel City'],
    ['roberto.gonzalez@barangay.com', hashPassword('official123'), 'Roberto', 'Gonzalez', '+63 912 345 6799', 'official', 'Barangay San Miguel', '258 Gonzalez Center, San Miguel City']
  ]

  additionalUsers.forEach(user => {
    insertUser.run(user[0], user[1], user[2], user[3], user[4], user[5], user[6], user[7])
  })

  console.log('✅ Additional users created')

  // Get user IDs for creating complaints
  const getUsers = db.prepare('SELECT id, role FROM users')
  const users = getUsers.all()
  const residents = users.filter(u => u.role === 'resident')
  const officials = users.filter(u => u.role === 'official')

  // Get category IDs
  const getCategories = db.prepare('SELECT id, name FROM complaint_categories')
  const categories = getCategories.all()

  // Create sample complaints
  const insertComplaint = db.prepare(`
    INSERT INTO complaints (
      user_id, category_id, title, description, priority, status, 
      location_address, assigned_to, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const sampleComplaints = [
    // Waste Management complaints
    {
      title: "Garbage not collected for 3 days",
      description: "The garbage truck has not come to our street for 3 consecutive days. The garbage bins are overflowing and creating a health hazard. The smell is unbearable and we're concerned about diseases.",
      category: "Waste Management",
      priority: "high",
      status: "submitted",
      location: "123 Garcia Street, San Miguel City"
    },
    {
      title: "Illegal dumping in vacant lot",
      description: "Someone has been dumping construction debris and household waste in the vacant lot behind our house. This is attracting rats and creating an eyesore in our neighborhood.",
      category: "Waste Management",
      priority: "medium",
      status: "in_progress",
      location: "456 Rodriguez Avenue, San Miguel City"
    },
    {
      title: "Broken garbage bins",
      description: "The public garbage bins on the corner of our street are broken and garbage is spilling out. We need new bins installed.",
      category: "Waste Management",
      priority: "medium",
      status: "resolved",
      location: "789 Fernandez Road, San Miguel City"
    },

    // Infrastructure complaints
    {
      title: "Pothole on main road",
      description: "There's a large pothole on the main road that's getting bigger every day. It's dangerous for vehicles and motorcycles. Several people have already had accidents because of it.",
      category: "Infrastructure",
      priority: "high",
      status: "in_progress",
      location: "Main Road, San Miguel City"
    },
    {
      title: "Streetlight not working",
      description: "The streetlight in front of our house has been out for 2 weeks. It's very dark at night and we're worried about safety. Please repair or replace it soon.",
      category: "Infrastructure",
      priority: "medium",
      status: "submitted",
      location: "321 Torres Lane, San Miguel City"
    },
    {
      title: "Drainage system clogged",
      description: "The drainage system on our street is completely clogged. When it rains, water floods the street and sometimes enters our houses. This has been happening for months.",
      category: "Infrastructure",
      priority: "high",
      status: "submitted",
      location: "654 Martinez Street, San Miguel City"
    },
    {
      title: "Damaged sidewalk",
      description: "The sidewalk in front of the school is damaged and uneven. It's dangerous for children walking to school. Some tiles are missing and others are cracked.",
      category: "Infrastructure",
      priority: "medium",
      status: "resolved",
      location: "School Street, San Miguel City"
    },

    // Noise Disturbance complaints
    {
      title: "Loud karaoke until 2 AM",
      description: "Our neighbor has been having loud karaoke parties every weekend until 2 AM. The noise is unbearable and we can't sleep. We've tried talking to them but they won't listen.",
      category: "Noise Disturbance",
      priority: "medium",
      status: "submitted",
      location: "123 Garcia Street, San Miguel City"
    },
    {
      title: "Construction noise during quiet hours",
      description: "There's construction work happening next door that starts at 6 AM and continues until 8 PM, including weekends. The noise is excessive and violates the local noise ordinance.",
      category: "Noise Disturbance",
      priority: "medium",
      status: "in_progress",
      location: "456 Rodriguez Avenue, San Miguel City"
    },

    // Safety/Security complaints
    {
      title: "Suspicious individuals loitering",
      description: "There are suspicious individuals loitering around the park at night. They seem to be involved in illegal activities. We need increased police patrol in the area.",
      category: "Safety/Security",
      priority: "high",
      status: "submitted",
      location: "Central Park, San Miguel City"
    },
    {
      title: "Broken street security camera",
      description: "The security camera on the corner of our street has been broken for weeks. This is a security concern as the camera was helping deter crime in our area.",
      category: "Safety/Security",
      priority: "medium",
      status: "in_progress",
      location: "789 Fernandez Road, San Miguel City"
    },
    {
      title: "Unsafe pedestrian crossing",
      description: "The pedestrian crossing near the school is unsafe. There's no traffic light and cars don't stop for pedestrians. We need a proper traffic light or speed bumps.",
      category: "Safety/Security",
      priority: "high",
      status: "resolved",
      location: "School Crossing, San Miguel City"
    },

    // Public Health complaints
    {
      title: "Stagnant water breeding mosquitoes",
      description: "There's stagnant water in the drainage system that's breeding mosquitoes. This is a health hazard, especially with dengue cases in the area. We need immediate action.",
      category: "Public Health",
      priority: "high",
      status: "submitted",
      location: "321 Torres Lane, San Miguel City"
    },
    {
      title: "Unsanitary food vendor",
      description: "There's a food vendor near the school who doesn't follow proper hygiene practices. The food preparation area is dirty and there are no handwashing facilities.",
      category: "Public Health",
      priority: "medium",
      status: "in_progress",
      location: "School Area, San Miguel City"
    },
    {
      title: "Sewage leak in public area",
      description: "There's a sewage leak in the public area near the market. The smell is terrible and it's a health hazard for people walking by. This needs immediate attention.",
      category: "Public Health",
      priority: "high",
      status: "resolved",
      location: "Market Area, San Miguel City"
    },

    // Other complaints
    {
      title: "Lost dog in neighborhood",
      description: "There's a lost dog wandering around our neighborhood. It looks scared and hungry. We've tried to catch it but it runs away. Can someone help find its owner?",
      category: "Other",
      priority: "low",
      status: "submitted",
      location: "654 Martinez Street, San Miguel City"
    },
    {
      title: "Request for community garden",
      description: "We would like to request permission to start a community garden in the vacant lot. This would benefit the neighborhood and provide fresh vegetables for families.",
      category: "Other",
      priority: "low",
      status: "submitted",
      location: "Community Lot, San Miguel City"
    }
  ]

  // Create complaints with realistic dates
  const now = new Date()
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)

  const dateOptions = [oneMonthAgo, twoWeeksAgo, oneWeekAgo, threeDaysAgo, oneDayAgo, now]

  sampleComplaints.forEach((complaint, index) => {
    const category = categories.find(c => c.name === complaint.category)
    const user = residents[Math.floor(Math.random() * residents.length)]
    const assignedOfficial = officials[Math.floor(Math.random() * officials.length)]
    const createdDate = dateOptions[Math.floor(Math.random() * dateOptions.length)]
    const updatedDate = new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000)

    insertComplaint.run(
      user.id,
      category.id,
      complaint.title,
      complaint.description,
      complaint.priority,
      complaint.status,
      complaint.location,
      complaint.status === 'in_progress' || complaint.status === 'resolved' ? assignedOfficial.id : null,
      createdDate.toISOString(),
      updatedDate.toISOString()
    )
  })

  console.log('✅ Sample complaints created')

  // Create complaint status history for some complaints
  const insertStatusHistory = db.prepare(`
    INSERT INTO complaint_status_history (
      complaint_id, old_status, new_status, changed_by, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)

  // Get some complaints to add status history
  const getComplaints = db.prepare('SELECT id, status, created_at FROM complaints WHERE status IN (?, ?)')
  const inProgressComplaints = getComplaints.all('in_progress', 'resolved')

  inProgressComplaints.forEach(complaint => {
    const official = officials[Math.floor(Math.random() * officials.length)]
    const statusChangeDate = new Date(complaint.created_at)
    statusChangeDate.setHours(statusChangeDate.getHours() + Math.random() * 48)

    insertStatusHistory.run(
      complaint.id,
      'submitted',
      'in_progress',
      official.id,
      'Complaint assigned to official for investigation',
      statusChangeDate.toISOString()
    )

    if (complaint.status === 'resolved') {
      const resolutionDate = new Date(statusChangeDate.getTime() + Math.random() * 72 * 60 * 60 * 1000)
      insertStatusHistory.run(
        complaint.id,
        'in_progress',
        'resolved',
        official.id,
        'Issue has been resolved successfully',
        resolutionDate.toISOString()
      )
    }
  })

  console.log('✅ Status history created')

  // Create some complaint attachments (mock data)
  const insertAttachment = db.prepare(`
    INSERT INTO complaint_attachments (
      complaint_id, file_path, file_type, file_size, created_at
    ) VALUES (?, ?, ?, ?, ?)
  `)

  const getComplaintsForAttachments = db.prepare('SELECT id FROM complaints LIMIT 8')
  const complaintsForAttachments = getComplaintsForAttachments.all()

  const mockAttachments = [
    { type: 'image', path: '/uploads/complaints/photo1.jpg', size: 1024000 },
    { type: 'image', path: '/uploads/complaints/photo2.jpg', size: 2048000 },
    { type: 'image', path: '/uploads/complaints/photo3.jpg', size: 1536000 },
    { type: 'video', path: '/uploads/complaints/video1.mp4', size: 5120000 },
    { type: 'image', path: '/uploads/complaints/photo4.jpg', size: 3072000 },
    { type: 'image', path: '/uploads/complaints/photo5.jpg', size: 2560000 },
    { type: 'video', path: '/uploads/complaints/video2.mp4', size: 8192000 },
    { type: 'image', path: '/uploads/complaints/photo6.jpg', size: 1792000 }
  ]

  complaintsForAttachments.forEach((complaint, index) => {
    const attachment = mockAttachments[index % mockAttachments.length]
    const attachmentDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    
    insertAttachment.run(
      complaint.id,
      attachment.path,
      attachment.type,
      attachment.size,
      attachmentDate.toISOString()
    )
  })

  console.log('✅ Mock attachments created')

  // Create AI classification logs for some complaints
  const insertAIClassification = db.prepare(`
    INSERT INTO ai_classifications (
      complaint_id, ai_suggested_category_id, ai_suggested_priority, 
      confidence_score, model_version, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `)

  const getComplaintsForAI = db.prepare('SELECT id, category_id FROM complaints LIMIT 10')
  const complaintsForAI = getComplaintsForAI.all()

  complaintsForAI.forEach(complaint => {
    const suggestedCategory = categories[Math.floor(Math.random() * categories.length)]
    const confidence = 0.7 + Math.random() * 0.3 // 0.7 to 1.0
    const priority = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
    const aiDate = new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000)

    insertAIClassification.run(
      complaint.id,
      suggestedCategory.id,
      priority,
      confidence,
      'v1.0',
      aiDate.toISOString()
    )
  })

  console.log('✅ AI classification logs created')

  // Display summary
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()
  const complaintCount = db.prepare('SELECT COUNT(*) as count FROM complaints').get()
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM complaint_categories').get()

  console.log('\n📊 Sample Data Summary:')
  console.log(`👥 Users: ${userCount.count}`)
  console.log(`📝 Complaints: ${complaintCount.count}`)
  console.log(`📂 Categories: ${categoryCount.count}`)
  console.log('\n🔐 Additional Test User Credentials:')
  console.log('Ana Garcia: ana.garcia@email.com / password123')
  console.log('Carlos Rodriguez: carlos.rodriguez@email.com / password123')
  console.log('Lisa Fernandez: lisa.fernandez@email.com / password123')
  console.log('Miguel Torres: miguel.torres@email.com / password123')
  console.log('Sofia Martinez: sofia.martinez@email.com / password123')
  console.log('\n👮 Additional Official Credentials:')
  console.log('Pedro Santos: pedro.santos@barangay.com / official123')
  console.log('Carmen Lopez: carmen.lopez@barangay.com / official123')
  console.log('Roberto Gonzalez: roberto.gonzalez@barangay.com / official123')

  console.log('\n✅ Sample data creation completed successfully!')

} catch (error) {
  console.error('❌ Error creating sample data:', error.message)
} finally {
  db.close()
}
