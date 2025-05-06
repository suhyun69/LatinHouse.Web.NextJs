import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { code, signup_data } = await request.json()
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.session?.user) throw error || new Error('Login failed')

  const user = data.session.user

  if (signup_data) {
    const { error: updateError } = await supabase.auth.updateUser({ data: { signup_data } })
    if (updateError) throw updateError
  }

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('uid', user.id)
    .single()

  return NextResponse.json({ redirectTo: existingProfile ? '/' : '/signup/finalize' })
}