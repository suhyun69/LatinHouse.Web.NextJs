import { ProfileView } from "./profiles"

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