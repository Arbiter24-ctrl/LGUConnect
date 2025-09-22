import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { User } from './types'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this-in-production')

export interface SessionPayload {
  userId: number
  email: string
  role: string
  expiresAt: Date
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  return token
}

export async function verifySession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, secret)
    return payload as SessionPayload
  } catch (error) {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password)
  return hashedInput === hashedPassword
}

export async function getUserByEmail(email: string): Promise<User | null> {
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

export async function createUser(userData: {
  email: string
  password: string
  first_name: string
  last_name: string
  phone?: string
  role?: string
  barangay?: string
  address?: string
}): Promise<User | null> {
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
