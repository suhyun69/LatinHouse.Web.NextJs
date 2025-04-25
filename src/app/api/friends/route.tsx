import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ProfileView } from '../profiles/[profile_id]/route'

export type FriendRequest = {
  from: string
  to: string
}

export async function POST(request: Request) {
  const body = await request.json()
  const { from, to, created_by } = body

  // 1. 먼저 중복 확인
  const { data: existing, error: checkError } = await supabase
    .from("friends")
    .select("id")
    .eq("from", from)
    .eq("to", to)
    .maybeSingle()

  if (checkError) {
    return NextResponse.json(
      { error: checkError.message },
      { status: 500 }
    )
  }

  if (existing) {
    return NextResponse.json(
      { error: "이미 친구 요청이 존재합니다." },
      { status: 409 } // Conflict
    )
  }

  // 2. 중복이 없으면 insert
  const { data, error } = await supabase
    .from("friends")
    .insert({
      from,
      to,
      created_at: new Date().toISOString(),
      created_by,
    })
    .select(`
      friend: to(
        id, nickname, avatar_url, gender, is_instructor
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { data: data.friend as unknown as ProfileView },
    { status: 201 }
  )
}


export async function GET(
  request: Request,
) {
  const { searchParams } = new URL(request.url)
  const { from } = Object.fromEntries(searchParams.entries())

  const { data, error } = await supabase
    .from('friends')
    .select(`
      friend: to(
        id, nickname, avatar_url, gender, is_instructor
      )
    `)
    .eq('from', from)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code ?? 'db_error' } },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json({ error: { message: 'No data' } }, { status: 404 })
  }

  return NextResponse.json({ data: data.map((friend) => friend.friend) }, { status: 200 })
}

export async function DELETE(request: Request) {
  const body = await request.json()
  const { from, to } = body

  const { data, error } = await supabase
    .from("friends")
    .delete()
    .eq("from", from)
    .eq("to", to)
    .select("friend:to ( id, nickname, avatar_url, gender, is_instructor )") // 삭제된 친구 정보 확인 가능
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "친구 관계를 찾을 수 없습니다." }, { status: 404 })
  }

  return NextResponse.json(
    { data: data.friend as unknown as ProfileView },
    { status: 200 }
  )
}
