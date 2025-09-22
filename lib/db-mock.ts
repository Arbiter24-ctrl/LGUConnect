// Mock database for testing when SQL Server is not available
import type { User, ComplaintCategory } from './types'

// Mock data
const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@barangay.com',
    password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', // admin123
    first_name: 'Admin',
    last_name: 'User',
    phone: '+63 912 345 6789',
    role: 'admin',
    barangay: 'Barangay San Miguel',
    address: '123 Admin Street, San Miguel City',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    email: 'official@barangay.com',
    password_hash: '3fae19dadf1a05245ffa9cd28f3e4530dc42d16511f743883da4e0f5c70fdc12', // official123
    first_name: 'Juan',
    last_name: 'Dela Cruz',
    phone: '+63 912 345 6790',
    role: 'official',
    barangay: 'Barangay San Miguel',
    address: '456 Official Street, San Miguel City',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    email: 'resident@barangay.com',
    password_hash: '2a2b8801afe2d9e5f47c5b786d8d349ce3d0b46f94c84bd5608abe1c2c75bb84', // resident123
    first_name: 'Maria',
    last_name: 'Santos',
    phone: '+63 912 345 6791',
    role: 'resident',
    barangay: 'Barangay San Miguel',
    address: '789 Resident Street, San Miguel City',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const mockCategories: ComplaintCategory[] = [
  {
    id: 1,
    name: 'Waste Management',
    description: 'Issues related to garbage collection, disposal, and cleanliness',
    color: '#EF4444',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Infrastructure',
    description: 'Road repairs, streetlights, drainage, and public facilities',
    color: '#3B82F6',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Noise Disturbance',
    description: 'Loud music, construction noise, and other sound-related issues',
    color: '#F59E0B',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Safety/Security',
    description: 'Crime reports, unsafe areas, and security concerns',
    color: '#DC2626',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Public Health',
    description: 'Health hazards, sanitation, and medical emergencies',
    color: '#10B981',
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Other',
    description: 'Miscellaneous complaints not covered by other categories',
    color: '#6B7280',
    created_at: new Date().toISOString()
  }
]

// Mock database functions
export const db = {
  async query(sqlQuery: string, params?: any[]) {
    console.log('Mock DB Query:', sqlQuery, params)
    
    // Handle different query types
    if (sqlQuery.includes('SELECT * FROM users WHERE email')) {
      const email = params?.[0]
      const user = mockUsers.find(u => u.email === email)
      return user ? [user] : []
    }
    
    if (sqlQuery.includes('SELECT * FROM users WHERE id')) {
      const id = params?.[0]
      const user = mockUsers.find(u => u.id === id)
      return user ? [user] : []
    }
    
    if (sqlQuery.includes('SELECT * FROM complaint_categories')) {
      return mockCategories
    }
    
    if (sqlQuery.includes('INSERT INTO users')) {
      // Mock insert - return a new ID
      return [{ insertId: mockUsers.length + 1 }]
    }
    
    return []
  },

  async findOne(sqlQuery: string, params?: any[]) {
    const results = await this.query(sqlQuery, params)
    return results[0] || null
  },

  async findMany(sqlQuery: string, params?: any[]) {
    return await this.query(sqlQuery, params)
  },

  async insert(sqlQuery: string, params?: any[]) {
    const result = await this.query(sqlQuery, params)
    return result[0]?.insertId || 1
  },

  async update(sqlQuery: string, params?: any[]) {
    return 1 // Mock affected rows
  },

  async delete(sqlQuery: string, params?: any[]) {
    return 1 // Mock affected rows
  },

  async close() {
    console.log('Mock database connection closed')
  }
}

export default db
