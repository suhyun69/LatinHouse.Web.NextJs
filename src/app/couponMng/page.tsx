"use client"

import React, { useEffect, useState } from "react"
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
import { CouponTemplateView } from "../api/coupons/templates/route"
import { CouponView } from "../api/coupons/route"
import { CouponTemplateIssuedList } from "@/components/coupon-template-issued-list"
import { CouponOwnedList } from "@/components/coupon-owned-list"
import { CouponIssuedList } from "@/components/coupon-issued-list"
import { ProfileView } from "../api/profiles/[profile_id]/route"

export default function CouponManagementPage() {
  const router = useRouter()

  const [issuedCouponTemplates, setIssuedCouponTemplates] = useState<CouponTemplateView[]>([]) 
  const [issuedCoupons, setIssuedCoupons] = useState<CouponView[]>([])
  const [myCoupons, setMyCoupons] = useState<CouponView[]>([])
  const [friends, setFriends] = useState<ProfileView[]>([])

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
  
    const fetchAll = async () => {
      try {
        const [templateRes, ownedCouponRes] = await Promise.all([
          fetch(`/api/coupons/templates?created_by=${loginProfile.id}`),
          fetch(`/api/coupons?owner=${loginProfile.id}`),
        ])
  
        const [templateData, myCouponData] = await Promise.all([
          templateRes.json(),
          ownedCouponRes.json(),
        ])
  
        if (!templateRes.ok) {
          toast.error(templateData?.message || '쿠폰 템플릿 조회에 실패했습니다.')
        } else {
          setIssuedCouponTemplates(templateData.data)
        }
  
        if (!ownedCouponRes.ok) {
          toast.error(myCouponData?.message || '보유 쿠폰 조회에 실패했습니다.')
        } else {
          setMyCoupons(myCouponData.data)
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
      }
    }
    
    const fetchFriends = async () => {
      try {
        const response = await fetch(`/api/friends?from=${loginProfile.id}`)
        const result = await response.json()
  
        if (!response.ok) {
          toast.error(result?.message || '친구를 조회하는데 실패했습니다.')
          return
        }
  
        setFriends(result.data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
      }
    }
  
    fetchAll()
    fetchFriends()
  }, [loginProfile])  

  const handleRowClick = async (template: CouponTemplateView) => {
    try {
      const response = await fetch(`/api/coupons?template=${template.template}`)
      const result = await response.json()
    
      if (!response.ok) {
        toast.error(result?.message || '쿠폰을 조회하는데 실패했습니다.')
      }
    
      setIssuedCoupons(result.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  async function handleGrant(selectedCoupon: CouponView, selectedProfile: ProfileView): Promise<boolean> {

    const response = await fetch(`/api/coupons/${selectedCoupon.id}/grant`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({profile_id: selectedProfile.id, updated_by: loginProfile?.id})
    })

    if (!response.ok) return false

    const updated = issuedCoupons.map(coupon =>
      coupon.id === selectedCoupon.id
        ? { ...coupon, owner: selectedProfile, status: 'granted' }
        : coupon
    )
    setIssuedCoupons(updated)

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
            <h1 className="text-3xl font-bold">쿠폰 관리</h1>
          </div>
          <Tabs defaultValue="owned" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="owned">내 쿠폰</TabsTrigger>
              {loginProfile?.is_instructor && (
                <TabsTrigger value="issued">내가 발행한 쿠폰</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="owned">
              <Card>
                <CardHeader>
                  <CardTitle>쿠폰 목록</CardTitle>
                  <CardDescription>
                    내가 소유한 쿠폰 목록입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CouponOwnedList coupons={myCoupons} />
                </CardContent>
              </Card>
            </TabsContent>
            {loginProfile?.is_instructor && (
            <TabsContent value="issued">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle>발행 쿠폰 목록</CardTitle>
                      <CardDescription>
                        내가 발행한 쿠폰 목록입니다.
                      </CardDescription>
                    </div>
                    <Button onClick={() => router.push('/couponMng/create')}>
                      <Plus className="mr-2 h-4 w-4" />
                      쿠폰 생성
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CouponTemplateIssuedList templates={issuedCouponTemplates} onRowClick={handleRowClick} />
                  <CouponIssuedList coupons={issuedCoupons} couponTargets={friends} handleGrant={handleGrant} />
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