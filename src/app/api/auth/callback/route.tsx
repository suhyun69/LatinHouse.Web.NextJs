import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { code, signup_data } = await request.json()
  if (!code) throw new Error('Authorization code not provided')

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // ✅ 서버에서 직접 세션 설정
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session?.user) throw error || new Error('Login failed')

  const user = data.session.user

  // ✅ 메타데이터에 signup_data 저장
  if (signup_data) {
    const { error: updateError } = await supabase.auth.updateUser({
      data: { signup_data },
    })
    if (updateError) throw updateError
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('uid', user.id)
    .single()

  const baseUrl = new URL(request.url).origin
  const redirectTo = existingProfile ? '/' : '/signup/finalize'
  return NextResponse.redirect(`${baseUrl}${redirectTo}`)
}
