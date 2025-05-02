import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  return NextResponse.redirect(new URL('/auth/callback', requestUrl.origin))
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) throw new Error('Authorization code not provided')

    // 카카오 토큰 요청
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY!,
        redirect_uri: process.env.KAKAO_REDIRECT_URI!,
        code: code,
      }).toString(),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('Kakao token error:', tokenData)
      throw new Error('Failed to fetch access token from Kakao')
    }

    const { access_token, refresh_token } = tokenData

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Supabase에서 OAuth 사용자 세션 설정 시도
    const { data: { user }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) throw error

    if (user) {
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
    return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 200 })
  }
}

/*
export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json()

    if (!access_token || !refresh_token) {
      throw new Error('Access token or refresh token not provided')
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    })

    if (error) {
      throw error
    }

    if (user) {
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
    return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 200 })
  }
}
*/