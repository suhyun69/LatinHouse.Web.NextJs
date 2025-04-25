import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { customAlphabet } from 'nanoid';
import { LessonView } from '../lessons/[lesson_no]/route';
import { ProfileView } from '../profiles/[profile_id]/route';

const nanoid = customAlphabet('0123456789ABCDEFGHJKLMNOPQRSTUVWXYZ', 8);

export type CouponRequest = {
  template: string
  name: string
  lesson_no: number
  amount: number
}

export type CouponView = {
  id: string
  template: string
  name: string
  lesson: LessonView
  amount: number
  status: string
  owner: ProfileView
  used_at: Date
  created_at: Date
}

export async function POST(
  request: Request,
) {
  const body = await request.json()
  const { template, name, lesson_no, amount, created_by } = body

  const { data, error } = await supabase
    .from('coupons')
    .insert([
      {
        id: nanoid(),
        template,
        name,
        lesson_no,
        amount,
        status: 'grantable',
        created_at: new Date().toISOString(),
        created_by
      },
    ])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ coupon_code: data.code }, { status: 201 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const { created_by, owner, template } = Object.fromEntries(searchParams.entries());

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
  if (template) query = query.eq("template", template)
  if (created_by) query = query.eq("created_by", created_by)
  if (owner) {
    query = query.eq("owner", owner)
    query = query.not("status", "eq", "used")
  }

  const { data, error } = await query

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: (data as unknown) as CouponView[] }, { status: 200 })
} 