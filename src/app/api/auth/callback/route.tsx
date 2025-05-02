// /api/auth/callback/route.ts
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token, signup_data } = await request.json()

    if (!access_token || !refresh_token) {
      throw new Error('Access token or refresh token not provided')
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { user }, error } = await supabase.auth.setSession({
      access_token,
      refresh_token
    })

    const baseUrl = new URL(request.url).origin
    if (error) throw error
    if (!user) throw new Error('No user session established')

    // 프로필 존재 여부 확인
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select()
      .eq('uid', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.redirect(`${baseUrl}/`)
    }

    // ✅ signup_data를 Supabase 서버 세션에 저장
    const { error: sessionError } = await supabase.auth.updateUser({
      data: {
        signup_data,
      }
    })

    if (sessionError) throw sessionError

    return NextResponse.redirect(`${baseUrl}/signup/finalize`)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Unknown error' },
      { status: 200 }
    )
  }
}
