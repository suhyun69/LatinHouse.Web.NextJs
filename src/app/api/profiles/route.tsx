import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ProfileView } from './[profile_id]/route'


export type ProfileRequest = {
  id: string
  nickname: string
  gender: string
}

export async function POST(
  request: Request
) {
  const body = await request.json()
  const { uid, id, nickname, gender, created_by } = body

  // TODO: created_by :: 추후 세션 기반 인증 도입 후 서버에서 추출할 예정
  
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      uid,
      id,
      nickname,
      gender,
      created_at: new Date().toISOString(),
      created_by
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ profile_id: data.id }, { status: 201 })
}

export async function GET() {

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, gender, is_instructor, avatar_url')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: data as ProfileView[] }, { status: 200 })
}

