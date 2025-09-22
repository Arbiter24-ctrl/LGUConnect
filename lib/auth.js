import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Use a consistent JWT secret
const secret = new TextEncoder().encode('your-super-secret-jwt-key-change-this-in-production-12345')

console.log('🔑 Auth: Using hardcoded JWT secret for consistency')

export async function createSession(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

export async function verifySession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) {
      console.log('🔍 Auth: No session token found')
      return null
    }

    console.log('🔍 Auth: Session token found, verifying...')
    const { payload } = await jwtVerify(token, secret)
    console.log('✅ Auth: Session verified successfully')
    return payload
  } catch (error) {
    console.log('❌ Auth: Session verification failed:', error.message)
    return null
  }
}

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, hashedPassword) {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

export async function getUserByEmail(email) {
  try {
    const { db } = await import('./db')
    const user = await db.findOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )
    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export async function createUser(userData) {
  try {
    const { db } = await import('./db')
    const hashedPassword = await hashPassword(userData.password)
    
    const userId = await db.insert(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, barangay, address) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.email,
        hashedPassword,
        userData.first_name,
        userData.last_name,
        userData.phone || null,
        userData.role || 'resident',
        userData.barangay || null,
        userData.address || null
      ]
    )

    const user = await db.findOne('SELECT * FROM users WHERE id = ?', [userId])
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
