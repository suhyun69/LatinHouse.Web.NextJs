import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { PaymentView } from '../route'

export async function PATCH(
  request: Request,
  context: { params: Promise<{ payment_id: string }> }
) {
  const { payment_id } = await context.params

  const body = await request.json()
  const { status, updated_by } = body

  const { data, error } = await supabase
    .from('payments')
    .update({
      status: status,
      updated_at: new Date().toISOString(),
      updated_by: updated_by
    })
    .eq('id', payment_id)
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

  return NextResponse.json({ data: data as PaymentView }, { status: 200 })
}
