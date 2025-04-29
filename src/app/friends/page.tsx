"use client"

import React, { useState, useEffect } from "react"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useLoginProfile } from "@/hooks/useLoginProfile"
import FriendList from "@/components/friend-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { FriendAddDialog } from "@/components/friend-add-dialog"
import { ProfileView } from "../api/profiles/[profile_id]/route"

export default function FriendsPage() {
  const router = useRouter()
  
  const [friends, setFriends] = useState<ProfileView[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)

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
  
    fetchFriends()
  }, [loginProfile])

  const handleAdd = async (selectedProfiles: ProfileView[]) => {
    try {
      const responses = await Promise.all(
        selectedProfiles.map((profile) =>

          // ✅ 2. 알림 생성 요청 (단일 fetch도 배열에 포함)
          fetch(`/api/notices`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: loginProfile?.id || '',
              to: profile.id || '',
              title: `"${loginProfile?.nickname}"님이 친구 요청을 보냈습니다.`,
              content: `"${loginProfile?.nickname}"님이 친구 요청을 보냈습니다.`,
              type: 'friend_confirm',
              friend_id: loginProfile?.id,
              status: 'unread',
              created_by: loginProfile?.id || ''
            })
          })

          /*
          fetch(`/api/friends`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: loginProfile?.id,
              to: profile.id,
              created_by: loginProfile?.id,
            }),
          })
          */
        )
      )
  
      const results = await Promise.all(responses.map((res) => res.json()))
  
      const failed = results.find((_, i) => !responses[i].ok)
      if (failed) {
        toast.error(failed?.message || '일부 친구 추가 요청이 실패했습니다.')
      } else {
        toast.success('친구 요청이 전송되었습니다.')
      }
  
      // 예: 성공한 데이터만 모아서 상태 업데이트
      const successfulData: ProfileView[] = results
      .map((res, i) => (responses[i].ok ? res.data : null))
      .filter(Boolean)
      .flat()

      // 중복 제거: id 기준으로 새로운 친구만 필터링 후 추가
      const newUniqueFriends = successfulData.filter(
        (newFriend) => !friends.some((existing) => existing.id === newFriend.id)
      )

      setFriends([...friends, ...newUniqueFriends])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  const handleClickFriend = async (profileId: string) => {
    router.push(`/profile/${profileId}`)
  }

  const handleDeleteFriend = async (profileId: string) => {
    try {
      const response = await fetch(`/api/friends`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: loginProfile?.id,
          to: profileId,
          created_by: loginProfile?.id,
        }),
      })
      const result = await response.json()

      if (!response.ok) {
        toast.error(result?.message || '친구 목록을 삭제하는데 실패했습니다.')
        return
      }

      toast.success('친구 목록을 삭제했습니다.')
      setFriends(friends.filter((friend) => friend.id !== profileId))

    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
    }
  }

  return (
    <>  
      <Header/>
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">친구 관리</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>친구 목록</CardTitle>
                  <CardDescription>
                  내 친구 목록입니다.
                  </CardDescription>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  친구 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FriendList friends={friends} onFriendClick={handleClickFriend} onDeleteFriend={handleDeleteFriend} />
            </CardContent>
          </Card>
        </div>
      </div>

      <FriendAddDialog 
        dialogOpen={dialogOpen} 
        onDialogOpenChange={setDialogOpen}
        onAdd={handleAdd}
        loginProfile={loginProfile}
      />
    </>
  )
}
