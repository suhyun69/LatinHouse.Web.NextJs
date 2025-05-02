// /api/auth/callback/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    throw new Error('No user session established')
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.json(
      { error: (error as Error).message || 'Unknown error' },
      { status: 200 }
    )
  }
}
