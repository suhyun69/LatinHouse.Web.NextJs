"use client"

import { useLoginProfile } from "@/hooks/useLoginProfile"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { LessonView } from "@/app/api/lessons/[lesson_no]/route"
import { CouponRequest } from "@/app/api/coupons/route"
import { CouponForm } from "@/components/coupon-form"
import { CouponTemplateRequest } from "@/app/api/coupons/templates/route"
import { HeaderTitle } from "@/components/header-title"

export default function CouponCreatePage() {
  const router = useRouter()

  const [postedLessons, setPostedLessons] = useState<LessonView[]>([])

  const { loginProfile } = useLoginProfile()
  useEffect(() => {
    if (loginProfile === undefined) return // 아직 로딩 중

    if (!loginProfile) {
      setTimeout(() => {
        toast.success("로그인이 필요합니다.")
        router.replace("/") // replace() 사용 권장
      }, 0)
      return
    }
  
    if (!loginProfile?.is_instructor) {
      setTimeout(() => {
        toast.success("권한이 없습니다.")
        router.replace("/") // replace() 사용 권장
      }, 0)
      return
    }
  
    const fetchPostedLessons = async () => {
      try {
        const response = await fetch(`/api/lessons?created_by=${loginProfile?.id}`)
        const result = await response.json()
      
        if (!response.ok) {
          toast.error(result?.message || '수업을 조회하는데 실패했습니다.')
        }
      
        setPostedLessons(result.data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
      }
    }

    fetchPostedLessons()
  }, [loginProfile])

  const handleSubmit = async (data: CouponTemplateRequest) => {
    const templateResponse = await fetch('/api/coupons/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        created_by: loginProfile?.id
      }),
    })
    const templateResult = await templateResponse.json()
  
    if (!templateResponse.ok) {
      toast.error(templateResult?.message || '쿠폰 템플릿 생성에 실패했습니다.')
      return
    }
  
    const couponRequest: CouponRequest = {
      template: templateResult.coupon_template,
      name: data.name,
      lesson_no: data.lesson_no,
      amount: data.amount,
    }
  
    try {
      await Promise.all(
        Array.from({ length: data.quantity }).map(() =>
          fetch('/api/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...couponRequest,
              created_by: loginProfile?.id
            }),
          })
        )
      )
  
      toast.success('쿠폰을 생성했습니다.')
      router.push(`/couponMng`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '쿠폰 생성 중 오류가 발생했습니다.')
    }
  }  

  return (
    <>
      <HeaderTitle title="쿠폰 생성"/>
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <CouponForm 
            lessons={postedLessons}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </>
  )
}