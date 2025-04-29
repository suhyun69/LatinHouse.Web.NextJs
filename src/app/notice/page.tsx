"use client"

import React, { useState, useEffect } from "react"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLoginProfile } from "@/hooks/useLoginProfile"
import { NoticeView } from "../api/notices/route"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { NoticeList } from "@/components/notice-list"

export default function NotiPage() {
  const router = useRouter()
  
  const [notices, setNotices] = useState<NoticeView[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [selectedNotice, setSelectedNotice] = React.useState<NoticeView | null>(null)

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
  
    const fetchNotis = async () => {
      try {
        const response = await fetch(`/api/notices?to=${loginProfile.id}`)
        const result = await response.json()
  
        if (!response.ok) {
          toast.error(result?.message || '알림을 조회하는데 실패했습니다.')
          return
        }
  
        setNotices(result.data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
      }
    }
  
    fetchNotis()
  }, [loginProfile])

  const handleRowClick = (notice: NoticeView) => {
    setDialogOpen(true)
    setSelectedNotice(notice)
  }

  const addFriend = async (notice: NoticeView) => {
    if (!loginProfile?.id) {
      toast.error('로그인 정보가 없습니다.')
      return
    }
  
    const friendRequests = [
      { from: notice.friend_id, to: loginProfile.id, created_by: loginProfile.id },
      { from: loginProfile.id, to: notice.friend_id, created_by: loginProfile.id }
    ]
  
    try {
      // 친구 요청 양방향 등록
      const friendResponses = await Promise.all(
        friendRequests.map((data) =>
          fetch(`/api/friends`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          })
        )
      )
  
      // 둘 중 하나라도 실패했는지 검사
      if (!friendResponses.every((res) => res.ok)) {
        throw new Error('친구 등록 실패')
      }
  
      // 알림 상태 업데이트
      const noticeResponse = await fetch(`/api/notices/${notice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'read',
          created_by: loginProfile.id,
        }),
      })
  
      if (!noticeResponse.ok) {
        throw new Error('알림 상태 업데이트 실패')
      }
  
      toast.success('친구 요청을 수락했습니다.')
      setNotices((prev) =>
        prev.map((n) =>
          n.id === notice.id ? { ...n, status: 'read' } : n
        )
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '친구 요청 수락에 실패했습니다.')
    }
  }
  
  return (
    <>  
      <Header/>
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">알림 관리</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>알림 목록</CardTitle>
              <CardDescription>
                내가 받은 알림 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NoticeList notices={notices} onRowClick={handleRowClick} />
            </CardContent>
          </Card>
          
        </div>
      </div>

      {/* 🔔 Alert Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{selectedNotice?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedNotice?.content || 'No message.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>닫기</AlertDialogCancel>
            {selectedNotice?.type === 'friend_confirm' && selectedNotice?.status === 'unread' && (
              <AlertDialogCancel onClick={() => addFriend(selectedNotice)}>수락</AlertDialogCancel>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
