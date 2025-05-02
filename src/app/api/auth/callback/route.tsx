import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) throw new Error('Authorization code not found')

    // 카카오 토큰 요청
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.KAKAO_REST_API_KEY!,
        redirect_uri: process.env.KAKAO_REDIRECT_URI!, // 이 URI가 현재 이 API 엔드포인트여야 함
        code,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('Kakao token fetch error', tokenData)
      throw new Error('Failed to fetch token from Kakao')
    }

    const { access_token, refresh_token } = tokenData

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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
        return NextResponse.redirect(new URL('/', req.url))
      } else {
        return NextResponse.redirect(new URL('/signup', req.url))
      }
    }

    throw new Error('No user session established')
  } catch (err) {
    console.error('Callback error', err)
    return NextResponse.redirect(new URL('/error', req.url))
  }
}
