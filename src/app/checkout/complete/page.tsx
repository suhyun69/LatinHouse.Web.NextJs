"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { HeaderTitle } from "@/components/header-title"

export default function CheckoutCompletePage() {
  const router = useRouter()

  return (

    <>
      <HeaderTitle title="Complete" />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mt-12 grid gap-6 max-w-5xl mx-auto place-items-center grid-cols-1">
          <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                신청이 완료되었습니다
              </h2>
              <div className="mt-8 space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  홈으로 돌아가기
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/lessonMng')}
                >
                  신청 내역 확인하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 