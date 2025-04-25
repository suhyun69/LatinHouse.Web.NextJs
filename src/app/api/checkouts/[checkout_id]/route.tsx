import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { DiscountRequest } from "../../lessons/route"
import { LessonView } from "../../lessons/[lesson_no]/route"
import { AppliedDiscount } from "../route"
import { ProfileView } from "../../profiles/[profile_id]/route"

export type CheckoutView = {
  id: string
  lesson: LessonView
  discounts: AppliedDiscount[]
  created_by: ProfileView
}

export async function GET(
  request: Request,
  context: { params: Promise<{ checkout_id: string }> }
) {
  const { checkout_id } = await context.params

  const { data, error } = await supabase
    .from('checkouts')
    .select(`
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
      discounts,
      created_by: created_by(
        id, nickname, gender, is_instructor, avatar_url
      )
    `)
    .eq('id', checkout_id)
    .single()

  if (error) {
    console.error(error)
    return NextResponse.json({ error: { message: error.message, code: error.code ?? 'db_error' } }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: { message: 'No lesson found' } }, { status: 404 })
  }

  const checkoutView: CheckoutView = {
    id: data.id,
    lesson: (data.lesson as unknown) as LessonView,
    discounts: (data.discounts as unknown) as DiscountRequest[],
    created_by: (data.created_by as unknown) as ProfileView
  }

  return NextResponse.json({ data: checkoutView }, { status: 200 })
}