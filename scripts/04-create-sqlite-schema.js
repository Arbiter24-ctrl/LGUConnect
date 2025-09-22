const Database = require('better-sqlite3')
const path = require('path')

// Create SQLite database
const dbPath = path.join(__dirname, '..', 'complaint_management.db')
const db = new Database(dbPath)

console.log('🚀 Creating SQLite Database...\n')

try {
  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      role TEXT DEFAULT 'resident' CHECK (role IN ('resident', 'official', 'admin')),
      barangay TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create complaint categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaint_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#6B7280',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create complaints table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
      status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'in_progress', 'resolved', 'closed')),
      location_lat REAL,
      location_lng REAL,
      location_address TEXT,
      assigned_to INTEGER,
      resolution_notes TEXT,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  // Insert default categories
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO complaint_categories (name, description, color) 
    VALUES (?, ?, ?)
  `)

  const categories = [
    ['Waste Management', 'Issues related to garbage collection, disposal, and cleanliness', '#EF4444'],
    ['Infrastructure', 'Road repairs, streetlights, drainage, and public facilities', '#3B82F6'],
    ['Noise Disturbance', 'Loud music, construction noise, and other sound-related issues', '#F59E0B'],
    ['Safety/Security', 'Crime reports, unsafe areas, and security concerns', '#DC2626'],
    ['Public Health', 'Health hazards, sanitation, and medical emergencies', '#10B981'],
    ['Other', 'Miscellaneous complaints not covered by other categories', '#6B7280']
  ]

  categories.forEach(category => {
    insertCategory.run(category[0], category[1], category[2])
  })

  // Create test users
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, phone, role, barangay, address) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const users = [
    ['admin@barangay.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'User', '+63 912 345 6789', 'admin', 'Barangay San Miguel', '123 Admin Street, San Miguel City'],
    ['official@barangay.com', '3fae19dadf1a05245ffa9cd28f3e4530dc42d16511f743883da4e0f5c70fdc12', 'Juan', 'Dela Cruz', '+63 912 345 6790', 'official', 'Barangay San Miguel', '456 Official Street, San Miguel City'],
    ['resident@barangay.com', '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', 'Maria', 'Santos', '+63 912 345 6791', 'resident', 'Barangay San Miguel', '789 Resident Street, San Miguel City']
  ]

  users.forEach(user => {
    insertUser.run(user[0], user[1], user[2], user[3], user[4], user[5], user[6], user[7])
  })

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_category_id ON complaints(category_id);
    CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
    CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
    CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);
  `)

  console.log('✅ SQLite database created successfully!')
  console.log('📁 Database location:', dbPath)
  console.log('\n🔐 Test User Credentials:')
  console.log('Admin: admin@barangay.com / admin123')
  console.log('Official: official@barangay.com / official123')
  console.log('Resident: resident@barangay.com / resident123')

} catch (error) {
  console.error('❌ Error creating database:', error.message)
} finally {
  db.close()
}
