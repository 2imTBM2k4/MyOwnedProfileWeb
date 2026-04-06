import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Server-side password check
export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    
    // Get password from server-side env (not NEXT_PUBLIC_)
    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    if (password === correctPassword) {
      // Create a simple auth token (in production, use JWT)
      const token = Buffer.from(`${Date.now()}-${Math.random()}`).toString('base64')
      
      // Set HTTP-only cookie (more secure than sessionStorage)
      const cookieStore = await cookies()
      cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// Logout
export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_token')
  return NextResponse.json({ success: true })
}

// Check if authenticated
export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')
  
  if (token) {
    return NextResponse.json({ authenticated: true })
  }
  
  return NextResponse.json({ authenticated: false }, { status: 401 })
}
