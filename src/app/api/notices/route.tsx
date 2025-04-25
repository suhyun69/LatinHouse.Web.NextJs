import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ProfileView } from '../profiles/[profile_id]/route'

export type NoticeRequest = {
  from: string
  to: string
  title: string
  text: string
  type: string
  status: string
}

export type NoticeView = {
  id: string
  from: ProfileView
  title: string
  content: string
  type: string
  status: string
  created_at: string
}

export async function POST(
  request: Request,
) {
  const body = await request.json()
  const { from, to, title, content, type, status, created_by } = body

  const { data, error } = await supabase
    .from('notices')
    .insert([
      {
        from,
        to,
        title,
        content,
        type,
        status,
        created_at: new Date().toISOString(),
        created_by
      },
    ])
    .select()
    .single()

  if (error){
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ noti_id: data.id }, { status: 201 })
}

export async function GET(
  request: Request,
) {
  const { searchParams } = new URL(request.url)
  const { to } = Object.fromEntries(searchParams.entries())

  const { data, error } = await supabase
    .from('notices')
    .select(`
      id,
      from: from(
        id, nickname, avatar_url
      ),
      title,
      content,
      type,
      status,
      created_at
    `)
    .eq('to', to)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return NextResponse.json(
      { error: { message: error.message, code: error.code ?? 'db_error' } },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json({ error: { message: 'No data found' } }, { status: 404 })
  }

  const noticeViews: NoticeView[] = data.map((notice) => ({
    id: notice.id,
    from: (notice.from as unknown) as ProfileView,
    title: notice.title,
    content: notice.content,
    type: notice.type,
    status: notice.status,
    created_at: notice.created_at,
  }))

  return NextResponse.json({ data: noticeViews }, { status: 200 })
}