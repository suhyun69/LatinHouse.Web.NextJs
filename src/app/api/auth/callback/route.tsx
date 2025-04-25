import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    
    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) throw error

      if (user) {
        // 기존 프로필 확인
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select()
          .eq('uid', user.id)
          .single()

        if (existingProfile) {
          // 기존 프로필이 있는 경우 로그인 처리
          return NextResponse.redirect(
            new URL(`/api/login?profile=${encodeURIComponent(JSON.stringify(existingProfile))}`, 
            requestUrl.origin)
          )
        } else {
          return NextResponse.redirect(
            new URL(`/signup}`, requestUrl.origin)
          )
        }
      }
    }

    throw new Error('Authentication failed')
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
} 