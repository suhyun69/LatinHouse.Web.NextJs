import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ProfileView } from '../profiles/[profile_id]/route'
import { CheckoutView } from '../checkouts/[checkout_id]/route'

export type PaymentView = {
  id: string
  checkout: CheckoutView
  status: string
  is_paid: boolean
  created_at: string
  follower: ProfileView
}
export async function POST(
  request: Request,
) {
  const body = await request.json()
  const { lesson_no, checkout_id, created_by } = body

  const { data, error } = await supabase
    .from('payments')
    .insert([
      {
        lesson_no,
        checkout_id,
        created_at: new Date().toISOString(),
        created_by
      },
    ])
    .select()
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ payment_id: data.id }, { status: 201 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const { created_by, lesson_no } = Object.fromEntries(searchParams.entries());

  let query = supabase
    .from('payments')
    .select(`
      id,
      checkout: checkout_id (
        id,
        lesson: lesson_no (
          no,
          image_url,
          title,
          genre,
          instructor_lo:instructor_lo (
            id, nickname, gender, is_instructor, avatar_url
          ),
          instructor_la:instructor_la (
            id, nickname, gender, is_instructor, avatar_url
          ),
          start_date_time,
          end_date_time,
          datetime_sub_texts,
          region,
          place,
          place_url,
          price,
          discounts,
          max_discount_amount,
          discount_sub_texts,
          bank,
          account_number,
          account_owner,
          contacts,
          notices,
          is_active,
          is_auto_accept,
          is_refundable_in_period,
          created_at,
          created_by,
          updated_at,
          updated_by
        ),
        discounts
      ),
      status,
      created_at,
      follower: created_by (
        id, nickname, gender, is_instructor, avatar_url
      )
    `)
  if (created_by) query = query.eq("created_by", created_by)
  if (lesson_no) query = query.eq("lesson_no", lesson_no)

  const { data, error } = await query

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: (data as unknown) as PaymentView[] }, { status: 200 })
} 