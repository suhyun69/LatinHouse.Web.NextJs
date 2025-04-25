import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { ProfileView } from "../../profiles/[profile_id]/route"

export type LessonView = {
  no: number
  image_url: string
  title: string
  genre: string
  instructor_lo: ProfileView
  instructor_la: ProfileView
  start_date_time: string
  end_date_time: string
  datetime_sub_texts: string[]
  region: string
  place: string
  place_url: string 
  price: number
  discounts: Discount[]
  max_discount_amount: number
  discount_sub_texts: string[]
  bank: string
  account_number: string  
  account_owner: string
  contacts: Contact[]
  notices: string[]
  is_active: boolean
  is_auto_accept: boolean
  is_refundable_in_period: boolean  
  created_at: string
  created_by: string
  updated_at: string
  updated_by: string
}

export type Discount = {
  type: string
  condition?: string
  date?: string
  amount: number
}

export type Contact = {
  type: string
  address: string
  name?: string
}

export async function GET(
  request: Request,
  context: { params: Promise<{ lesson_no: string }> }
) {
  const { lesson_no } = await context.params

  const { data, error } = await supabase
    .from('lessons')
    .select(`
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
    `)
    .eq('no', lesson_no)
    .single()

  if (error) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code ?? 'db_error' } },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json({ error: { message: 'No lesson found' } }, { status: 404 })
  }

  const lessonView: LessonView = {
    no: data.no,
    image_url: data.image_url,
    title: data.title,
    genre: data.genre,
    instructor_lo: data.instructor_lo as unknown as ProfileView,
    instructor_la: data.instructor_la as unknown as ProfileView,
    start_date_time: data.start_date_time,
    end_date_time: data.end_date_time,
    datetime_sub_texts: data.datetime_sub_texts,
    region: data.region,
    place: data.place,
    place_url: data.place_url,
    price: data.price,
    discounts: data.discounts,
    max_discount_amount: data.max_discount_amount,
    discount_sub_texts: data.discount_sub_texts,
    bank: data.bank,
    account_number: data.account_number,
    account_owner: data.account_owner,
    contacts: data.contacts,
    notices: data.notices,
    is_active: data.is_active,
    is_auto_accept: data.is_auto_accept,
    is_refundable_in_period: data.is_refundable_in_period,
    created_at: data.created_at,
    created_by: data.created_by,
    updated_at: data.updated_at,
    updated_by: data.updated_by
  }

  return NextResponse.json({ data: lessonView }, { status: 200 })
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ lesson_no: number }> }
) {
  const { lesson_no } = await context.params

  const body = await request.json()
  const { image_url, title, genre, instructor_lo, instructor_la, 
    start_date_time, end_date_time, datetime_sub_texts, 
    region, place, place_url, 
    price, discounts, max_discount_amount, discount_sub_texts, bank, account_number, account_owner, 
    notices, contacts, 
    is_active, is_auto_accept, is_refundable_in_period,
    updated_by } = body

  const { data, error } = await supabase
    .from('lessons')
    .update({
      image_url,
      title,
      genre,
      instructor_lo: instructor_lo || null,
      instructor_la: instructor_la || null,
      start_date_time: new Date(start_date_time).toISOString(),
      end_date_time: new Date(end_date_time).toISOString(),
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
      notices,
      contacts,
      is_active,
      is_auto_accept,
      is_refundable_in_period,
      updated_at: new Date().toISOString(),
      updated_by
    })
    .eq('no', lesson_no)
    .select()
    .single()

  if (error) {
    console.error('수업 수정 오류:', error)
    return NextResponse.json(
      { error: { message: error.message, code: error.code ?? 'db_error' } },
      { status: 500 }
    )
  }

  if (!data) {
    return NextResponse.json({ error: { message: 'No data' } }, { status: 404 })
  }

  return NextResponse.json({ lesson_no: data.no }, { status: 200 })
}