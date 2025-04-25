"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface HeaderTitleProps {
  title: string
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 h-16 flex items-center relative">
      <button 
        onClick={() => router.back()} 
        className="absolute left-4 hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>
      <h1 className="text-xl font-bold text-center w-full">{title}</h1>
    </div>
  )
} 