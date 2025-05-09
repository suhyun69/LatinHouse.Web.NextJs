"use client"

import { Header } from "@/components/header"
// import { useRouter } from "next/navigation"
// import { useLoginProfile } from "@/hooks/useLoginProfile"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"
import { RenderMessage } from "@/components/render-message"
import { Discount, LessonView } from "@/app/api/lessons/[lesson_no]/route"
import LessonDetail from "@/components/lesson-detail"
import { useLoginProfile } from "@/hooks/useLoginProfile"
import { CouponView } from "@/app/api/coupons/route"
import { AppliedDiscount, CheckoutRequest } from "@/app/api/checkouts/route"
import { useRouter } from "next/navigation"
import { Metadata } from 'next'

// 이 함수는 서버에서만 실행됨 (SEO, OG에 사용됨)
export async function generateMetadata({ params }: { params: { lesson_no: string } }): Promise<Metadata> {
  const lesson_no = params.lesson_no

  // 🔁 lesson 데이터 서버에서 fetch
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/lessons/${lesson_no}`, {
    cache: 'no-cache',
    headers: {
      // API 보호 필요 시 헤더에 인증 정보도 포함 가능
    }
  })

  if (!res.ok) {
    return {
      title: 'LatinHouse',
      description: '살사/바차타 수업 모아보기',
    }
  }

  const { data: lesson } = await res.json()

  return {
    title: `${lesson.title}`,
    description: `${lesson.title}`,
    openGraph: {
      title: `${lesson.title}`,
      description: lesson.description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/lessons/${lesson_no}`,
      images: [
        {
          url: lesson.thumbnail_url || `${process.env.NEXT_PUBLIC_SITE_URL}/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${lesson.title}`,
        },
      ],
      siteName: 'LatinHouse',
      locale: 'ko_KR',
      type: 'article',
    }
  }
}

export default function LessonDetailPage({ params }: { params: Promise<{ lesson_no: string }> }) {
  const router = useRouter()
  const { lesson_no } = use(params)

  const [lesson, setLesson] = useState<LessonView | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { loginProfile } = useLoginProfile()

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/lessons/${lesson_no}`)
        const result = await response.json()

        if (!response.ok) {
          toast.error('수업을 조회하는데 실패했습니다.')
          return
        }

        if (!result.data.is_active) {
          setTimeout(() => {
            toast.error("수업을 찾을 수 없습니다.")
            router.replace("/")
          }, 0)
          return
        }

        setLesson(result.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다.'
        toast.error(message)
        setError(message)
      }
    }

    fetchLesson()
  }, [lesson_no])

  if (error) return <RenderMessage message={error} isError />
  if (!lesson) return <RenderMessage message="Loading..." />

  const isJoinable = loginProfile !== null
    && lesson.is_active 
    && new Date(lesson.start_date_time) > new Date()
    && lesson.instructor_lo?.id !== loginProfile.id 
    && lesson.instructor_la?.id !== loginProfile.id

  const handleJoin = async () => {

    // 로그인 체크
    if (!loginProfile || loginProfile === undefined) {
      toast.error('로그인 후 이용해주세요.')
      return
    }
    
    // 쿠폰 데이터 조회
    const couponResponse = await fetch(`/api/coupons?owner=${loginProfile?.id}&lesson_no=${lesson?.no}`)
    const couponResult = await couponResponse.json()

    if (!couponResponse.ok) toast.error('쿠폰 데이터를 조회하는데 실패했습니다.')

    // 쿠폰 템플릿 기준 1개만 조회
    const coupons = couponResult.data as CouponView[]
    const uniqueCoupons: CouponView[] = Array.from(
      coupons
        .filter((c) => (c as CouponView).status !== 'used')
        .reduce(
          (map, c) => map.has(c.template) ? map : map.set(c.template, c),
          new Map<string, CouponView>()
        )
        .values()
    )

    const earlybirds = lesson.discounts
    .filter(
      (d): d is Discount & { date: string } =>
        d.type === 'earlybird' &&
        typeof d.date === 'string' &&
        new Date(d.date) > new Date()
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 1)

    const others = lesson.discounts
      .filter((d) => d.type !== 'earlybird')

      const appliedDiscounts: AppliedDiscount[] = [
        // earlybirds는 그대로
        ...earlybirds.map((discount: Discount): AppliedDiscount => ({
          type: discount.type,
          condition: discount.condition,
          date: discount.date,
          amount: discount.amount,
        })),
      
        // others는 필터링 추가
        ...others
          .filter((discount: Discount) => {
            if (discount.type === 'gender') {
              return discount.condition === loginProfile.gender
            }
            return true
          })
          .map((discount: Discount): AppliedDiscount => ({
            type: discount.type,
            condition: discount.condition,
            date: discount.date,
            amount: discount.amount,
          })),
      
        // 쿠폰은 그대로
        ...uniqueCoupons.map((coupon: CouponView): AppliedDiscount => ({
          type: 'coupon',
          amount: coupon.amount,
          text: coupon.name,
          coupon_code: coupon.id,
        })),
      ]
      

    const checkoutRequest: CheckoutRequest = {
      lesson_no: lesson?.no,
      discounts: appliedDiscounts
    }

    // 결제 데이터 생성
    const response = await fetch(`/api/checkouts`, {
      method: 'POST',
      body: JSON.stringify({
        ...checkoutRequest,
        created_by: loginProfile?.id
      }),
    })
    const result = await response.json()
  
    if (!response.ok) {
      toast.error('결제 데이터를 생성하는데 실패했습니다.')
      return
    }
  
    router.push(`/checkout/${result.checkout_id}`)
  }

  return (
    <>
      <Header/>
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <LessonDetail lesson={lesson} isJoinable={isJoinable} onSubmit={handleJoin} />
        </div>
      </div>
    </>
  )
}
