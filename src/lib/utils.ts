import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { toZonedTime } from 'date-fns-tz'
import { Discount, LessonView } from "@/app/api/lessons/[lesson_no]/route"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (typeof value === "number" && value === 0)
  )
}

export function getGenderText(gender: string): string {
  const genderMap: { [key: string]: string } = {
    'M': 'Male',
    'F': 'Female'
  }
  return genderMap[gender] || gender
}


export function toKstDate(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return toZonedTime(dateObj, 'Asia/Seoul')
}

export function toKstDateTimeString(date: string | Date | null | undefined, formatStr: string = 'yyyy-MM-dd'): string {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''
  
  return format(toZonedTime(dateObj, 'Asia/Seoul'), formatStr)
}


export function isValidNonNegativeNumber(value: unknown): boolean {
  if (typeof value === "number") return value >= 0
  if (typeof value === "string") {
    const num = Number(value)
    return !isNaN(num) && num >= 0
  }
  return false
}

export function isValidTimeFormat(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/ // 00:00 ~ 23:59
  return timeRegex.test(value)
}


export function getGenderByGenreText(gender: string, genre: string): string {
  switch (genre) {
    case "S":
      return gender === "M" ? "살세로" : "살세라"
    case "B":
      return gender === "M" ? "바차테로" : "바차테라"
    default:
      return gender === "M" ? "남성" : "여성"
  }
}

export function getDiscountText(discount: Discount, genre: string) {
  switch (discount.type) {
    case "earlybird":
      return "얼리버드 할인"
    case "gender":
      return `${getGenderByGenreText(discount.condition || '', genre || '')} 할인`
    case "couple":
      return "커플 할인"
    default:
      return ``
  }
}

export function validateInstructors(instructor_lo: string | undefined, instructor_la: string | undefined): boolean {
  return !!(instructor_lo || instructor_la)
}


export function getGenreText(genre: string) {
  switch (genre) {
    case "S":
      return "살사"
    case "B":
      return "바차타"
    case "K":
      return "키좀바"
    default:
      return genre
  }
}

export function getRegionText(region: string) {
  switch (region) {
    case "HD":
      return "홍대"
    case "GN":
      return "강남"
    case "AP":
      return "압구정"
    default:
      return region
  }
}


type LessonStatus = {
  text: '비활성' | '오픈예정' | '종료' | '진행 중';
  style: string;
}

export const getLessonStatus = (lesson: LessonView): LessonStatus => {
  if (!lesson.is_active) return { text: '비활성', style: 'bg-gray-100 text-gray-800' }
  
  const now = new Date();
  if (now < toKstDate(lesson.start_date_time)) return { text: '오픈예정', style: 'bg-blue-100 text-blue-800' }
  if (now > toKstDate(lesson.end_date_time)) return { text: '종료', style: 'bg-red-100 text-red-800' }
  return { text: '진행 중', style: 'bg-green-100 text-green-800' }
}

export function getBankText(bank: string): string {
  switch (bank) {
    case "sh":
      return "신한은행"
    default:
      return bank
  }
}

export function getCouponStatusInfo(status: string): { variant: "default" | "secondary" | "destructive", text: string } {
  switch (status) {
    case 'grantable':
      return {
        variant: "default",
        text: '지급가능'
      }
    case 'granted':
      return {
        variant: "secondary",
        text: '지급완료'
      }
    case 'used':
      return {
        variant: "destructive",
        text: '사용됨'
      }
    default:
      return {
        // grantable
        variant: "default",
        text: '지급가능'
      }
  }
}


export function getPaymentStatusText(status: string): string {
  switch (status) {
    case 'rejected':
      return '거절'
    case 'requested':
      return '신청완료'
    case 'approved':
      return '승인완료'
    case 'cancelling':
      return '취소요청'
    case 'cancelled':
      return '취소됨'
    default:
      return status

    /*
      requested -> rejected`
      requested -> approved

      approved -> cancelling
      cancelling -> cancelled
      cancelling -> approved
    */
  }
}

// utils.tsx 또는 utils.ts

import { PaymentView } from "@/app/api/payments/route"

/**
 * 결제 정보에서 할인 적용 금액을 계산합니다.
 * @param payment - PaymentView 객체
 * @returns 할인 적용 후 최종 금액 (숫자)
 */
export function getDiscountedAmount(payment: PaymentView): number {
  const price = payment.checkout.lesson.price
  const discountSum = payment.checkout.discounts.reduce((acc, d) => acc + d.amount, 0)
  return price - discountSum
}
