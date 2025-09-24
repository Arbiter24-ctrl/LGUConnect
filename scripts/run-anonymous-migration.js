const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// Create SQLite database
const dbPath = path.join(__dirname, '..', 'complaint_management.db')
const db = new Database(dbPath)

console.log('🚀 Running Anonymous Fields Migration...\n')

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Add barangay_id column
  try {
    db.exec('ALTER TABLE complaints ADD COLUMN barangay_id INTEGER')
    console.log('✅ Added barangay_id column to complaints table')
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  barangay_id column already exists')
    } else {
      throw error
    }
  }

  // Add anonymous contact fields
  try {
    db.exec('ALTER TABLE complaints ADD COLUMN anonymous_name VARCHAR(255)')
    console.log('✅ Added anonymous_name column to complaints table')
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  anonymous_name column already exists')
    } else {
      throw error
    }
  }

  try {
    db.exec('ALTER TABLE complaints ADD COLUMN anonymous_email VARCHAR(255)')
    console.log('✅ Added anonymous_email column to complaints table')
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  anonymous_email column already exists')
    } else {
      throw error
    }
  }

  try {
    db.exec('ALTER TABLE complaints ADD COLUMN anonymous_phone VARCHAR(50)')
    console.log('✅ Added anonymous_phone column to complaints table')
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('ℹ️  anonymous_phone column already exists')
    } else {
      throw error
    }
  }

  // Create barangays table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS barangays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      contact_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('✅ Created barangays table')

  // Insert Tagum City barangays
  const insertBarangay = db.prepare(`
    INSERT OR IGNORE INTO barangays (id, name, description, contact_info) 
    VALUES (?, ?, ?, ?)
  `)

  const barangays = [
    [1, 'Barangay 1', 'Central business district', 'Contact: 0912-345-6789'],
    [2, 'Barangay 2', 'Residential area', 'Contact: 0912-345-6788'],
    [3, 'Barangay 3', 'Industrial zone', 'Contact: 0912-345-6787'],
    [4, 'Barangay 4', 'Agricultural area', 'Contact: 0912-345-6786'],
    [5, 'Barangay 5', 'Coastal area', 'Contact: 0912-345-6785'],
    [6, 'Barangay 6', 'Urban residential', 'Contact: 0912-345-6784'],
    [7, 'Barangay 7', 'Commercial district', 'Contact: 0912-345-6783'],
    [8, 'Barangay 8', 'Suburban area', 'Contact: 0912-345-6782'],
    [9, 'Barangay 9', 'Rural community', 'Contact: 0912-345-6781'],
    [10, 'Barangay 10', 'Mixed residential', 'Contact: 0912-345-6780'],
    [11, 'Barangay 11', 'Industrial zone', 'Contact: 0912-345-6779'],
    [12, 'Barangay 12', 'Agricultural community', 'Contact: 0912-345-6778'],
    [13, 'Barangay 13', 'Coastal residential', 'Contact: 0912-345-6777'],
    [14, 'Barangay 14', 'Urban commercial', 'Contact: 0912-345-6776'],
    [15, 'Barangay 15', 'Suburban residential', 'Contact: 0912-345-6775'],
    [16, 'Barangay 16', 'Rural agricultural', 'Contact: 0912-345-6774'],
    [17, 'Barangay 17', 'Mixed commercial', 'Contact: 0912-345-6773'],
    [18, 'Barangay 18', 'Industrial residential', 'Contact: 0912-345-6772'],
    [19, 'Barangay 19', 'Coastal commercial', 'Contact: 0912-345-6771'],
    [20, 'Barangay 20', 'Urban residential', 'Contact: 0912-345-6770'],
    [21, 'Barangay 21', 'Suburban commercial', 'Contact: 0912-345-6769'],
    [22, 'Barangay 22', 'Rural mixed', 'Contact: 0912-345-6768'],
    [23, 'Barangay 23', 'Agricultural coastal', 'Contact: 0912-345-6767']
  ]

  barangays.forEach(barangay => {
    insertBarangay.run(barangay[0], barangay[1], barangay[2], barangay[3])
  })
  console.log('✅ Inserted 23 Tagum City barangays')

  console.log('\n🎉 Migration completed successfully!')
  console.log('📁 Database location:', dbPath)

} catch (error) {
  console.error('❌ Error running migration:', error.message)
} finally {
  db.close()
}
