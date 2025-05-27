import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { toZonedTime } from 'date-fns-tz'
import { Discount } from "@/app/types/lessons"

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

export function getGenderTextByGenre(gender: string, genre: string): string {
  switch (genre) {
    case "S":
      return gender === "M" ? "살세로" : "살세라"
    case "B":
      return gender === "M" ? "바차테로" : "바차테라"
    default:
      return gender === "M" ? "남성" : "여성"
  }
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

export function getDiscountText(discount: Discount, genre: string) {
  switch (discount.type) {
    case "earlybird":
      return "얼리버드 할인"
    case "gender":
      return `${getGenderTextByGenre(discount.condition || '', genre || '')} 할인`
    case "couple":
      return "커플 할인"
    default:
      return ``
  }
}

export function validateInstructors(instructor_lo: string | undefined, instructor_la: string | undefined): boolean {
  return !!(instructor_lo || instructor_la)
}
