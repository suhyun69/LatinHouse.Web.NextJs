import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { LessonView } from "./[lesson_no]/route"

export type LessonRequest = {
  no?: number
  image_url?: string
  title: string
  genre: string
  instructor_lo?: string
  instructor_la?: string
  start_date_time: string
  end_date_time: string
  datetime_sub_texts?: string[]
  region: string
  place: string
  place_url?: string
  price: number
  discounts?: DiscountRequest[]
  max_discount_amount?: number
  discount_sub_texts?: string[]
  bank: string
  account_number: string
  account_owner: string
  contacts?: ContactRequest[]
  notices?: string[]
  is_active: boolean
  is_auto_accept: boolean
  is_refundable_in_period: boolean
}

export type DiscountRequest = {
  type: string
  condition?: string
  date?: string
  amount: number
}

export type ContactRequest = {
  type: string
  address: string
  name?: string
}

export async function POST(
  request: Request,
) {
  const body = await request.json()
  const { image_url, title, genre, instructor_lo, instructor_la, 
    start_date_time, end_date_time, datetime_sub_texts, 
    region, place, place_url, 
    price, discounts, max_discount_amount, discount_sub_texts, bank, account_number, account_owner, 
    notices, contacts, 
    is_active, is_auto_accept, is_refundable_in_period,
    created_by } = body

    const { data, error } = await supabase
    .from('lessons')
    .insert([
      {
        image_url,
        title,
        genre,
        instructor_lo,
        instructor_la,
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

    return NextResponse.json({ lesson_no: data.no }, { status: 201 })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const { created_by } = Object.fromEntries(searchParams.entries())

  let query = supabase
  .from('lessons')
  .select(`
    no,
    image_url,
    title,
    genre,
    instructor_lo:instructor_lo (
      id, nickname, avatar_url
    ),
    instructor_la:instructor_la (
      id, nickname, avatar_url
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
  if (created_by) {
    query = query.eq('created_by', created_by)
  }

  const { data, error } = await query

  if (error) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: (data as unknown) as LessonView[] }, { status: 200 })
} 