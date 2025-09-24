const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Database path
const dbPath = path.join(__dirname, '..', 'complaint_management.db')

console.log('🚀 Adding Comments Table...\n')

try {
  const db = new sqlite3.Database(dbPath)

  // Create complaint_comments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS complaint_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaint_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating complaint_comments table:', err.message)
    } else {
      console.log('✅ complaint_comments table created successfully')
    }
  })

  // Create trigger to update updated_at
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_complaint_comments_updated_at
    AFTER UPDATE ON complaint_comments
    BEGIN
      UPDATE complaint_comments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END
  `, (err) => {
    if (err) {
      console.error('❌ Error creating trigger:', err.message)
    } else {
      console.log('✅ Updated_at trigger created successfully')
    }
  })

  // Insert some sample comments
  db.exec(`
    INSERT OR IGNORE INTO complaint_comments (complaint_id, user_id, content) VALUES
    (1, 1, 'Thank you for reporting this issue. We will investigate and take appropriate action.'),
    (1, 2, 'I have assigned this to the maintenance team for immediate attention.'),
    (2, 1, 'This complaint has been forwarded to the relevant department.'),
    (2, 2, 'We are working on a solution and will update you soon.')
  `, (err) => {
    if (err) {
      console.error('❌ Error inserting sample comments:', err.message)
    } else {
      console.log('✅ Sample comments inserted successfully')
    }
  })

  db.close((err) => {
    if (err) {
      console.error('❌ Error closing database:', err.message)
    } else {
      console.log('✅ Database connection closed successfully')
      console.log('\n🎉 Comments table setup completed!')
    }
  })

} catch (error) {
  console.error('❌ Error:', error.message)
}
