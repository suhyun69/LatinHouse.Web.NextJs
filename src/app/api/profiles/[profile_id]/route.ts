import { NextResponse } from 'next/server'
import { supabaseJs } from '@/lib/supabase-js-client'
import { ProfileView } from '@/app/types/profiles'

export async function GET(
  request: Request,
  context: { params: Promise<{ profile_id: string }> }
) {
  const { profile_id } = await context.params

  const { data, error } = await supabaseJs
    .from('profiles')
    .select('id, nickname, gender, avatar_url, is_instructor, is_admin')
    .eq('id', profile_id)
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ profile_id: string }> }
) {
  const { profile_id } = await context.params
  const body = await request.json()
  const { avatar_url, updated_by } = body

  // Supabase에 프로필 수정
  const { data, error } = await supabaseJs
    .from('profiles')
    .update({
      // is_instructor,
      avatar_url,
      updated_at: new Date().toISOString(),
      updated_by
    })
    .eq('id', profile_id)
    .select()
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

  return NextResponse.json({ profile_id: data.id }, { status: 200 })
} 