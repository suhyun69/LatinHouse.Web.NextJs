import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileData = searchParams.get('profile')
    
    if (!profileData) {
      throw new Error('Profile data not found')
    }

    // 프로필 데이터를 쿠키에 저장
    const cookieStore = await cookies()
    cookieStore.set('login_profile', profileData, {
      path: '/',
      maxAge: 60 * 60 * 24 * 1, // 1일
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return NextResponse.redirect(new URL('/', request.url))
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}