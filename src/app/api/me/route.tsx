// ✅ app/api/me/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.user_metadata.profile_id) {
    return NextResponse.json({ profile: null }, { status: 200 })
  }

  return NextResponse.json({ profile: {
    id: user.user_metadata.profile_id,
    nickname: user.user_metadata.nickname,
    gender: user.user_metadata.gender,
    avatar_url: user.user_metadata.avatar_url,
    is_instructor: user.user_metadata.is_instructor || false,
    is_admin: user.user_metadata.is_admin || false,
  } })
}
