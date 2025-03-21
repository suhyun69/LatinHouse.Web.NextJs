"use client"

import * as React from "react"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { useRouter } from "next/navigation"

type Profile = {
  profile_id: string
  nickname: string
  gender: string
  isInstructor: boolean
}

export function CardsEditProfile({ profile }: { profile: Profile }) {
  
  // 라우터 설정
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // profile_id는 전달받은 값으로 초기화
  const [profileId] = React.useState(profile.profile_id)
  const [nickname, setNickname] = React.useState(profile.nickname)
  const [sex, setSex] = React.useState(profile.gender)

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      // 입력 값 검증
      if (!nickname || !sex) {
        alert("모든 필드를 입력해주세요.")
        return
      }

      // Supabase에 프로필 수정
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nickname: nickname,
          gender: sex
        })
        .eq('profile_id', profileId)
        .select()

      if (error) throw error

      // 성공 시 프로필 페이지로 이동
      router.push(`/profile/${profileId}`)
      
    } catch (error) {
      console.error('Error:', error)
      alert('프로필 수정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      <Card className="mb-6">
        <CardContent className="grid gap-4">

          {/* 아이디 */}
          <div className="grid gap-2">
            <Label htmlFor="profileId">ID</Label>
            <Input 
              id="profileId" 
              type="text" 
              value={profileId}
              className="bg-muted" 
              disabled
            />
          </div>

          {/* 닉네임 */}
          <div className="grid gap-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input 
              id="nickname" 
              type="text" 
              placeholder="Enter your nickname" 
              value={nickname}
              // onChange={(e) => setNickname(e.target.value)}
              className="bg-muted" 
              disabled
            />
          </div>

          {/* 성별 */}
          <div className="grid gap-2">
            <Label>Gender</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="M"
                  checked={sex === "M"}
                  disabled
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                />
                <Label htmlFor="male" className="text-muted-foreground">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="F"
                  checked={sex === "F"}
                  disabled
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
                />
                <Label htmlFor="female" className="text-muted-foreground">Female</Label>
              </div>
            </div>
          </div>
          
        </CardContent>
      </Card>
      
      <Button 
        className="w-full" 
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Icons.spinner className="h-4 w-4 animate-spin" />
            Updating...
          </div>
        ) : (
          "Update profile"
        )}
      </Button>
    </>
  )
}