import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface NoticeUpdateBody {
  status?: string
  created_by?: string
}

// PATCH /api/notices/[notice_id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ notice_id: string }> }
) {
  const { notice_id } = await context.params

  if (!notice_id) {
    return NextResponse.json({ error: 'Notice ID가 필요합니다.' }, { status: 400 })
  }

  const body = (await req.json()) as NoticeUpdateBody

  const { status, created_by } = body

  const { data, error } = await supabase
    .from('notices')
    .update({
      status,
      created_by,
      updated_at: new Date().toISOString(),
    })
    .eq('id', notice_id)

  if (error) {
    console.error(error)
    return NextResponse.json({ error: '알림 업데이트 실패' }, { status: 500 })
  }

  return NextResponse.json({ message: '알림 업데이트 성공', data })
}
