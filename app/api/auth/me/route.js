import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { db } from '@/lib/db'
import { ApiResponse, User } from '@/lib/types'

export async function GET() {
  try {
    const session = await verifySession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
    );
  }

    // Get fresh user data from database
    const user = await db.findOne(
      'SELECT id, email, first_name, last_name, phone, role, barangay, address, created_at, updated_at FROM users WHERE id = ?',
      [session.userId]
    )

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
        );
    }

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
      );
  }
}
