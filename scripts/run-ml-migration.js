import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'complaint_management.db')
const db = new Database(dbPath)
import fs from 'fs'

async function runMLMigration() {
  try {
    console.log('Starting ML migration...')
    
    // Read the SQL file
    const sql = fs.readFileSync('./scripts/07-add-ml-fields-sqlite.sql', 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          console.log('Executing:', statement.trim().substring(0, 50) + '...')
          db.exec(statement.trim())
        } catch (error) {
          // Some statements might fail if columns already exist, that's okay
          if (error.message.includes('duplicate column name') || 
              error.message.includes('already exists')) {
            console.log('Skipping (already exists):', statement.trim().substring(0, 50) + '...')
          } else {
            console.error('Error executing statement:', error.message)
            console.error('Statement:', statement.trim())
          }
        }
      }
    }
    
    console.log('ML migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

runMLMigration()
