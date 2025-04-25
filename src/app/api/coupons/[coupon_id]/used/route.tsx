import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ coupon_id: string }> }
) {
  const { coupon_id } = await context.params

  // const body = await request.json()
  // const { profile_id } = body

  const { data, error } = await supabase
    .from('coupons')
    .update({
      status: 'used',
      used_at: new Date().toISOString()
    })
    .eq('id', coupon_id)
    .select()
    .single()

    if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code ?? 'db_error' } },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json({ error: { message: 'No coupon found' } }, { status: 404 })
  }

  return NextResponse.json({ coupon_code: data.code }, { status: 200 })
}
