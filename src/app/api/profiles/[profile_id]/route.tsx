import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export type ProfileView = {
  id: string
  nickname: string
  gender: string
  is_instructor: boolean
  is_admin: boolean
  avatar_url: string
}

export type ProfileEditRequest = {
  is_instructor: boolean
  avatar_url: string
}

export async function GET(
  request: Request,
  context: { params: Promise<{ profile_id: string }> }
) {
  const { profile_id } = await context.params

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, gender, is_instructor, is_admin, avatar_url')
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
    is_instructor: data.is_instructor,
    is_admin: data.is_admin,
    avatar_url: data.avatar_url,
  }

  return NextResponse.json({ data: profileView }, { status: 200 })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ profile_id: string }> }
) {
  const { profile_id } = await context.params
  const body = await request.json()
  const { is_instructor, avatar_url, updated_by } = body

  // Supabase에 프로필 수정
  const { data, error } = await supabase
    .from('profiles')
    .update({
      is_instructor,
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