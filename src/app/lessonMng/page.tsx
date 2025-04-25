"use client"

import React, { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { useLoginProfile } from "@/hooks/useLoginProfile"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LessonView } from "../api/lessons/[lesson_no]/route"
import { LessonPostedList } from "@/components/lesson-posted-list"
import { PaymentView } from "../api/payments/route"
import { LessonFollowerList } from "@/components/lesson-follower-list"
import { LessonFollowingList } from "@/components/lesson-following-list"
import { CouponView } from "../api/coupons/route"
import { ProfileView } from "../api/profiles/[profile_id]/route"

export default function LessonManagementPage() {
  const router = useRouter()

  const [followers, setFollowers] = useState<PaymentView[]>([])  
  const [lessonsPosted, setLessonsPosted] = useState<LessonView[]>([])
  const [lessonsFollowing, setLessonsFollowing] = useState<PaymentView[]>([])

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

    const fetchLessonsPosted = async () => {
      try {
        const response = await fetch(`/api/lessons?created_by=${loginProfile.id}`)
        const result = await response.json()
  
        if (!response.ok) {
          toast.error(result?.message || '수업을 조회하는데 실패했습니다.')
          return
        }
  
        setLessonsPosted(result.data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
      }
    }
  
    const fetchLessonsFollowing = async () => {
      try {
        const response = await fetch(`/api/payments?created_by=${loginProfile.id}`)
        const result = await response.json()
  
        if (!response.ok) {
          toast.error(result?.message || '수업을 조회하는데 실패했습니다.')
          return
        }
  
        setLessonsFollowing(result.data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
      }
    }
  
    fetchLessonsPosted()
    fetchLessonsFollowing()
  }, [loginProfile])

  const fetchFollowers = async (lesson: LessonView) => {
    try {
      const response = await fetch(`/api/payments?lesson_no=${lesson.no}`)
      const result = await response.json()
    
      if (!response.ok) {
        toast.error(result?.message || '수강생을 조회하는데 실패했습니다.')
      }
    
      setFollowers(result.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }
  
  const fetchGrantableCoupons = async (): Promise<CouponView[]> => {
    try {
      const response = await fetch(`/api/coupons/grantable?created_by=${loginProfile?.id}`)
      const result = await response.json()
  
      if (!response.ok) {
        toast.error(result?.message || '쿠폰을 조회하는데 실패했습니다.')
        return []
      }
  
      return result.data as CouponView[]
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
      return []
    }
  }

  const handleRowClick = async (lesson: LessonView) => {
    fetchFollowers(lesson)
    fetchGrantableCoupons()
  }

  const handleApproveLessonRequest = async (payment: PaymentView) => {
    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'approved', updated_by: loginProfile?.id })
      })
      const result = await response.json()
    
      if (!response.ok) {
        toast.error(result?.message || '수업요청 승인에 실패했습니다.')
      }

      const updated = followers.map(f =>
        f.id === result.data.id
          ? { ...f, ...result.data }
          : f
      )
      setFollowers(updated)
      toast.success('수업 요청을 승인했습니다.')

      await fetch(`/api/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: loginProfile?.id || '',
          to: payment.follower.id || '',
          title: `"${payment.checkout.lesson.title}" 수업 신청 승인.`,
          content: `"${loginProfile?.nickname}"님이 "${payment.checkout.lesson.title}" 수업을 신청을 승인했습니다.`,
          type: 'notice',
          status: 'unread',
          created_by: loginProfile?.id || ''
        })
      })

    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  const handleDenyLessonRequest = async (payment: PaymentView) => {
    try {
        const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected', updated_by: loginProfile?.id })
      })
      const result = await response.json()
    
      if (!response.ok) { 
        toast.error(result?.message || '수업요청 거절에 실패했습니다.')
      }
    
      const updated = followers.map(f =>
        f.id === result.data.id
          ? { ...f, ...result.data }
          : f
      )
      setFollowers(updated)
      toast.success('수업 요청을 거절했습니다.')

      await fetch(`/api/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: loginProfile?.id || '',
          to: payment.follower.id || '',
          title: `"${payment.checkout.lesson.title}" 수업 신청 거절.`,
          content: `"${loginProfile?.nickname}"님이 "${payment.checkout.lesson.title}" 수업 신청을 거절했습니다.`,
          type: 'notice',
          status: 'unread',
          created_by: loginProfile?.id || ''
        })
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  const handleApproveCancellingRequest = async (payment: PaymentView) => {
    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled', updated_by: loginProfile?.id })
      })
      const result = await response.json()
    
      if (!response.ok) {
        toast.error(result?.message || '수업 취소요청 승인에 실패했습니다.')
      }

      const updated = followers.map(f =>
        f.id === result.data.id
          ? { ...f, ...result.data }
          : f
      )
      setFollowers(updated)
      toast.success('수업 취소요청을 승인했습니다.')

      await fetch(`/api/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: loginProfile?.id || '',
          to: payment.follower.id || '',
          title: `"${payment.checkout.lesson.title}" 수업 취소 요청 승인.`,
          content: `"${loginProfile?.nickname}"님이 "${payment.checkout.lesson.title}" 수업 취소 요청을 승인했습니다.`,
          type: 'notice',
          status: 'unread',
          created_by: loginProfile?.id || ''
        })
      })
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  // const handleDenyCancellingRequest = async (payment: PaymentView) => {
  //   try {
  //       const response = await fetch(`/api/payments/${payment.id}`, {
  //       method: 'PATCH',
  //       body: JSON.stringify({ status: 'approved', updated_by: loginProfile?.id })
  //     })
  //     const result = await response.json()
    
  //     if (!response.ok) { 
  //       toast.error(result?.message || '수업 취소요청 거절에 실패했습니다.')
  //     }
    
  //     const updated = followers.map(f =>
  //       f.id === result.data.id
  //         ? { ...f, ...result.data }
  //         : f
  //     )
  //     setFollowers(updated)
      
  //     toast.success('수업 취소요청을 거절했습니다.')
  //   } catch (err) {
  //     toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
  //   }
  // }

  const handleCancel = async (payment: PaymentView) => {
    try {
        const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelling', updated_by: loginProfile?.id })
      })
      const result = await response.json()
    
      if (!response.ok) { 
        toast.error(result?.message || '수업 신청 취소에 실패했습니다.')
      }
    
      const updated = lessonsFollowing.map(f =>
        f.id === result.data.id
          ? { ...f, ...result.data }
          : f
      )
      setLessonsFollowing(updated)
      toast.success('수업 신청을 취소했습니다.')

      await fetch(`/api/notices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: loginProfile?.id || '',
          to: payment.checkout.lesson.created_by || '',
          title: `"${payment.checkout.lesson.title}" 수업 신청 취소 요청.`,
          content: `"${loginProfile?.nickname}"님이 "${payment.checkout.lesson.title}" 수업 신청 취소를 요청했습니다.`,
          type: 'notice',
          status: 'unread',
          created_by: loginProfile?.id || ''
        })
      })

    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  async function handleGrant(selectedProfile: ProfileView, selectedCoupon: CouponView): Promise<boolean> {

    const response = await fetch(`/api/coupons/${selectedCoupon.id}/grant`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({profile_id: selectedProfile.id, updated_by: loginProfile?.id})
    })

    if (!response.ok) return false

    sendNotice(selectedProfile, selectedCoupon)

    return true
  }

  async function sendNotice(to: ProfileView, coupon: CouponView) {

    fetch(`/api/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: loginProfile?.id || '',
        to: to?.id || '',
        title: `"${coupon?.name || ''}" 쿠폰 지급.`,
        content: `"${loginProfile?.nickname || ''}"님이 "${coupon?.name || ''}" 쿠폰을 지급했습니다.`,
        type: 'notice',
        status: 'unread',
        created_by: loginProfile?.id || ''
      })
    })
  }
  
  return (
    <>  
      <Header/>
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">수업 관리</h1>
          </div>
          <Tabs defaultValue="following" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="following">내가 신청한 수업</TabsTrigger>
              {loginProfile?.is_instructor && (
                <TabsTrigger value="posted" >내가 개설한 수업</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="following">
              <LessonFollowingList payments={lessonsFollowing} onCancel={handleCancel} />
            </TabsContent>
            {loginProfile?.is_instructor && (
              <TabsContent value="posted">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle>개설 수업 목록</CardTitle>
                        <CardDescription>
                          내가 개설한 수업 목록입니다.
                        </CardDescription>
                      </div>
                      <Button onClick={() => router.push('/lessonMng/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        수업 생성
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <LessonPostedList lessons={lessonsPosted} onRowClick={handleRowClick}/>
                    <LessonFollowerList payments={followers} 
                      approveLessonRequest={handleApproveLessonRequest} 
                      denyLessonRequest={handleDenyLessonRequest}
                      approveCancellingRequest={handleApproveCancellingRequest}
                      // denyCancellingRequest={handleDenyCancellingRequest}
                      fetchCouponsGrantable={fetchGrantableCoupons}
                      handleGrant={handleGrant}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </>
  )
}