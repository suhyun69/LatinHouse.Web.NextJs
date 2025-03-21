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

export function CardsCreateProfile() {

  // 랜덤 ID 생성 함수
  const generateRandomId = () => {
    const characters = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 8 }, () => 
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  };
  
  // 라우터 설정
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const initialProfileId = React.useMemo(() => generateRandomId(), [])
  const [profileId] = React.useState(initialProfileId)
  const [nickname, setNickname] = React.useState("")
  const [sex, setSex] = React.useState("")

  

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      // 입력 값 검증
      if (!nickname || !sex) {
        alert("모든 필드를 입력해주세요.")
        return
      }

      // Supabase에 프로필 저장
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          profile_id: profileId,
          nickname: nickname,
          gender: sex,
          is_instructor: false,
          created_at: new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' })
        })
        .select()

      if (error) throw error

      // 성공 시 메인 페이지로 이동
      router.push('/')
      
    } catch (error) {
      console.error('Error:', error)
      alert('프로필 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Create a Profile</CardTitle>
        <CardDescription>
          Enter your nickname and gender below to create your profile
        </CardDescription>
      </CardHeader>
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
            onChange={(e) => setNickname(e.target.value)}
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
                onChange={(e) => setSex(e.target.value)}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="male">Male</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="female"
                name="gender"
                value="F"
                checked={sex === "F"}
                onChange={(e) => setSex(e.target.value)}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="female">Female</Label>
            </div>
          </div>
        </div>
        
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Icons.spinner className="h-4 w-4 animate-spin" />
              Creating...
            </div>
          ) : (
            "Create profile"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}