"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { RenderMessage } from "@/components/render-message"

import { useLoginProfile } from "@/hooks/useLoginProfile"
import CheckoutForm from "@/components/checkout-form"
import { CheckoutView } from "@/app/api/checkouts/[checkout_id]/route"
import { HeaderTitle } from "@/components/header-title"

export default function CheckoutPage({ params }: { params: Promise<{ checkout_id: string }> }) {
  const router = useRouter()
  
  const { checkout_id } = use(params)
  const [checkoutView, setCheckoutView] = useState<CheckoutView | null>(null)
  const [discountedAmount, setDiscountedAmount] = useState<number>(0)

  const { loginProfile } = useLoginProfile()
  useEffect(() => {
    if (!checkout_id) return;
    if (loginProfile === undefined) return;

    const fetchCheckoutData = async () => {
      try {
        const response = await fetch(`/api/checkouts/${checkout_id}`)
        if (!response.ok) {
          toast.error('결제 데이터를 조회하는데 실패했습니다.')
          return
        }
        const result = await response.json()
        setCheckoutView(result.data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
        router.push(`/`)
      }
    }
  
    fetchCheckoutData()
  }, [checkout_id, loginProfile])

  useEffect(() => {

    if (!checkoutView) return

    /*
    if (checkoutView.lesson.start_date_time < new Date().toISOString()) {
      toast.error("이미 종료된 수업입니다.")
      router.replace("/")
    }

    if (checkoutView.lesson.created_by === loginProfile?.id) {
      toast.error("자신이 개설한 수업은 결제할 수 없습니다.")
      router.replace("/")
    }
    */

    if (checkoutView) {
      setDiscountedAmount(checkoutView.lesson.price - checkoutView.discounts.reduce((acc, discount) => acc + discount.amount, 0))
    }
  }, [checkoutView])

  // useEffect(checkoutView) 넣어서 유효성 검사

  const handlePayment = async () => {
    
    try {
      const response = await fetch(`/api/payments`, {
        method: 'POST',
        body: JSON.stringify({
          lesson_no: checkoutView?.lesson.no,
          checkout_id,
          created_by: loginProfile?.id || ''
        })
      })

      if (!response.ok) {
        toast.error('결제 데이터를 저장하는데 실패했습니다.')
        return
      }

      await Promise.all([
        // ✅ 1. 쿠폰 상태 업데이트 요청 배열
        ...checkoutView!.discounts
          .filter(d => d.type === 'coupon')
          .map(d =>
            fetch(`/api/coupons/${d.coupon_code}/used`, {
              method: 'PATCH',
              body: JSON.stringify({}),
              headers: {
                'Content-Type': 'application/json'
              }
            })
          ),
      
        // ✅ 2. 알림 생성 요청 (단일 fetch도 배열에 포함)
        fetch(`/api/notices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: loginProfile?.id || '',
            to: checkoutView?.lesson.created_by || '',
            title: `"${checkoutView?.lesson.title}" 수업 신청.`,
            content: `"${checkoutView?.created_by.nickname}"님이 "${checkoutView?.lesson.title}" 수업을 신청했습니다.`,
            type: 'notice',
            status: 'unread',
            created_by: loginProfile?.id || ''
          })
        })
      ])

      toast.success('신청이 완료되었습니다.') 
      router.push(`/checkout/complete`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다.')
    }
  }

  if (!checkoutView) return <RenderMessage message="Loading..." />

  return (
    <>
      <HeaderTitle title="Checkout" />
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mt-12 grid gap-6 max-w-5xl mx-auto place-items-center grid-cols-1">
          <CheckoutForm 
            lesson={checkoutView.lesson}
            discounts={checkoutView.discounts}
            discountedAmount={discountedAmount}
            onPayment={handlePayment}
          />
        </div>
      </div>
    </>
  )
}
