import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DiscountRequest } from '../lessons/route'

export type AppliedDiscount = DiscountRequest & {
  text?: string
  coupon_code?: string
}

export type CheckoutRequest = {
  lesson_no: number
  discounts: AppliedDiscount[]
}

export async function POST(
  request: Request,
) {
  const body = await request.json()
  const { lesson_no, discounts, created_by } = body

  const { data, error } = await supabase
    .from('checkouts')
    .insert([
      {
        lesson_no,
        discounts,
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

  return NextResponse.json({ checkout_id: data.id }, { status: 201 })
}