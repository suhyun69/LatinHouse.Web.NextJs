import { NextResponse } from 'next/server'
import { supabaseJs } from '@/lib/supabase-js-client'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ profile_id: string }> }
) {
  const { profile_id } = await context.params
  const body = await request.json()
  const { updated_by } = body

  // Supabase에 프로필 수정
  const { data, error } = await supabaseJs
    .from('profiles')
    .update({
      is_instructor: true,
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