import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { customAlphabet } from 'nanoid';
import { LessonView } from '../../lessons/[lesson_no]/route';

const nanoid = customAlphabet('0123456789ABCDEFGHJKLMNOPQRSTUVWXYZ', 8);

export type CouponTemplateRequest = {
  name: string
  lesson_no: number
  amount: number
  quantity: number
}

export type CouponTemplateView = {
  template: string
  name: string
  lesson: LessonView
  amount: number
  created_at: string
}

export async function POST(
  request: Request,
) {
  const body = await request.json()
  const { name, lesson_no, amount, created_by } = body

  const { data, error } = await supabase
    .from('coupon_templates')
    .insert([
      {
        template: nanoid(),
        name,
        lesson_no,
        amount,
        created_at: new Date().toISOString(),
        created_by
      },
    ])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ coupon_template: data.template }, { status: 201 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const createdBy = searchParams.get("created_by")

  let query = supabase
    .from('coupon_templates')
    .select(`
      template,
      name,
      lesson:lesson_no (
        no, title
      ),
      amount,
      created_at
    `)
  if (createdBy) query = query.eq("created_by", createdBy)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: (data as unknown) as CouponTemplateView[] }, { status: 200 })
} 