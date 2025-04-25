import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { CouponTemplateView } from '../templates/route'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const createdBy = searchParams.get("created_by")

  let query = supabase
    .from('coupons')
    .select(`
      id,
      template,
      name,
      lesson:lesson_no (
        no, title
      ),
      amount,
      status,
      owner: owner (
        id, nickname, avatar_url
      ),
      used_at,
      created_at
    `)
    .eq('status', 'grantable')
  if (createdBy) query = query.eq("created_by", createdBy)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: (data as unknown) as CouponTemplateView[] }, { status: 200 })
} 