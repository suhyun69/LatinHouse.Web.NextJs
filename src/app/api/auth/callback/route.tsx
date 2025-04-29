import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // GET 요청이 오면 /auth/callback 페이지로 리다이렉트
  const requestUrl = new URL(request.url)
  return NextResponse.redirect(new URL('/auth/callback', requestUrl.origin))
}

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json()

    console.log('access_token:', access_token)

    if (!access_token) {
      throw new Error('Access token not provided')
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // access_token을 직접 세션으로 교환하는 방법은 supabase auth API 사용
    const { data: { user }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token: '' // refresh_token이 없는 경우 빈 문자열 전달
    })

    console.log('111')

    if (error) throw error

    console.log('user:', user)

    if (user) {
      // 기존 프로필 확인
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select()
        .eq('uid', user.id)
        .single()

      if (existingProfile) {
        return NextResponse.redirect(new URL('/', request.url))
      } else {
        return NextResponse.redirect(new URL('/signup', request.url))
      }
    }

    throw new Error('Authentication failed')
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL('/error', request.url))
  }
}
