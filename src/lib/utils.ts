import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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