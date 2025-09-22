import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

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

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
