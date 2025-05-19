import { NextResponse } from 'next/server'
import { supabaseJs } from '@/lib/supabase-js-client'
import { ProfileView } from '@/app/types/profiles'

export async function GET(
  request: Request,
  context: { params: Promise<{ email: string }> }
) {
  const { email } = await context.params

  const { data, error } = await supabaseJs
    .from('profiles')
    .select('id, nickname, gender, avatar_url, is_instructor, is_admin')
    .eq('email', email)
    .single()

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code ?? 'db_error' } },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json({ error: { message: 'No data' } }, { status: 404 })
  }

  const profileView: ProfileView = {
    id: data.id,
    nickname: data.nickname,
    gender: data.gender,
    avatar_url: data.avatar_url,
    is_instructor: data.is_instructor,
    is_admin: data.is_admin,
  }

  return NextResponse.json({ data: profileView }, { status: 200 })
}