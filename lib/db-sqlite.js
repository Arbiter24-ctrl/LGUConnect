import Database from 'better-sqlite3'
import path from 'path'

// SQLite database configuration
const dbPath = path.join(process.cwd(), 'complaint_management.db')
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Database utility functions
export const dbConnection = {
  // Execute query with parameters
  async query(sqlQuery, params = []) {
    try {
      const stmt = db.prepare(sqlQuery)
      const result = stmt.all(...(params || []))
      return result
    } catch (error) {
      console.error("Database query error:", error)
      throw error
    }
  },

  // Get single record
  async findOne(sqlQuery, params = []) {
    try {
      const stmt = db.prepare(sqlQuery)
      const result = stmt.get(...(params || []))
      return result || null
    } catch (error) {
      console.error("Database findOne error:", error)
      throw error
    }
  },

  // Get multiple records
  async findMany(sqlQuery, params = []) {
    return await this.query(sqlQuery, params)
  },

  // Insert record and return ID
  async insert(sqlQuery, params = []) {
    try {
      const stmt = db.prepare(sqlQuery)
      const result = stmt.run(...(params || []))
      return result.lastInsertRowid
    } catch (error) {
      console.error("Database insert error:", error)
      throw error
    }
  },

  // Update records
  async update(sqlQuery, params = []) {
    try {
      const stmt = db.prepare(sqlQuery)
      const result = stmt.run(...(params || []))
      return result.changes
    } catch (error) {
      console.error("Database update error:", error)
      throw error
    }
  },

  // Delete records
  async delete(sqlQuery, params = []) {
    try {
      const stmt = db.prepare(sqlQuery)
      const result = stmt.run(...(params || []))
      return result.changes
    } catch (error) {
      console.error("Database delete error:", error)
      throw error
    }
  },

  // Close connection
  async close() {
    db.close()
  }
}

export default dbConnection
