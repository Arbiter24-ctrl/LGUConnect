const Database = require('better-sqlite3')
const path = require('path')

// Create SQLite database connection
const dbPath = path.join(__dirname, '..', 'complaint_management.db')
const db = new Database(dbPath)

console.log('🔧 Adding Missing Tables to Database...\n')

// Enable foreign keys
db.pragma('foreign_keys = ON')

try {
  // Create complaint_attachments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaint_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
    )
  `)

  // Create complaint_status_history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaint_status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      old_status TEXT CHECK (old_status IN ('submitted', 'in_progress', 'resolved', 'closed')),
      new_status TEXT NOT NULL CHECK (new_status IN ('submitted', 'in_progress', 'resolved', 'closed')),
      changed_by INTEGER NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (changed_by) REFERENCES users(id)
    )
  `)

  // Create ai_classifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_classifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      original_category_id INTEGER,
      ai_suggested_category_id INTEGER NOT NULL,
      ai_suggested_priority TEXT NOT NULL CHECK (ai_suggested_priority IN ('low', 'medium', 'high')),
      confidence_score REAL,
      model_version TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (original_category_id) REFERENCES complaint_categories(id),
      FOREIGN KEY (ai_suggested_category_id) REFERENCES complaint_categories(id)
    )
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint_id ON complaint_attachments(complaint_id);
    CREATE INDEX IF NOT EXISTS idx_complaint_status_history_complaint_id ON complaint_status_history(complaint_id);
    CREATE INDEX IF NOT EXISTS idx_complaint_status_history_changed_by ON complaint_status_history(changed_by);
    CREATE INDEX IF NOT EXISTS idx_ai_classifications_complaint_id ON ai_classifications(complaint_id);
  `)

  console.log('✅ Missing tables created successfully!')

  // Display all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  console.log('\n📋 Current tables in database:')
  tables.forEach(table => {
    console.log(`  - ${table.name}`)
  })

} catch (error) {
  console.error('❌ Error creating missing tables:', error.message)
} finally {
  db.close()
}
