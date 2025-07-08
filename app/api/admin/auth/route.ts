import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }
    
    // Get the admin password from environment variable
    const adminPassword = process.env.BLOG_ADMIN_PASSWORD
    
    if (!adminPassword) {
      console.error('BLOG_ADMIN_PASSWORD environment variable is not set')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    // Timing-safe password comparison
    const isValid = password.length === adminPassword.length && 
                   crypto.timingSafeEqual(
                     Buffer.from(password, 'utf8'),
                     Buffer.from(adminPassword, 'utf8')
                   )
    
    if (isValid) {
      // Generate a simple session token (in a real app, use JWT or proper session management)
      const sessionToken = crypto.randomBytes(32).toString('hex')
      
      // In a real application, you would store this token in a database or Redis
      // For simplicity, we'll just return success
      
      return NextResponse.json({ 
        success: true, 
        message: 'Authentication successful',
        // Don't return the token in this simple implementation
      })
    } else {
      // Add a small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}