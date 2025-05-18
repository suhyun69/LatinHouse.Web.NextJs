import { NextResponse } from 'next/server'
import { supabaseJs } from '@/lib/supabase-js-client'

export async function POST(
  request: Request
) {
  const body = await request.json()
  const { email, id, nickname, gender, created_by } = body
  
  const { data, error } = await supabaseJs
    .from('profiles')
    .insert({
      email,
      id,
      nickname,
      gender,
      created_at: new Date().toISOString(),
      created_by
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}