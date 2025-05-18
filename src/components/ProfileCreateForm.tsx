"use client"

import * as React from "react"
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
import { useState } from "react"
import { toast } from "sonner"
import { isEmpty } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { ProfileRequest } from "@/app/types/profiles"
interface ProfileCreateFormProps {
  onSubmit: (data: ProfileRequest) => Promise<void>
}

export function ProfileCreateForm({ onSubmit }: ProfileCreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 랜덤 ID 생성 함수
  const generateRandomId = () => {
    const characters = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 8 }, () => 
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');
  };

  const initialProfileId = React.useMemo(() => generateRandomId(), [])
  const [profileId] = React.useState(initialProfileId)
  const [nickname, setNickname] = React.useState("")
  const [gender, setGender] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
      
    // start of validation
    // 필드 정의
    const requiredFields = [
      { name: "nickname", value: nickname, message: "닉네임을 선택해주세요." },
      { name: "gender", value: gender, message: "성별을 입력해주세요." },
    ]

    // 검증 함수
    function validateFields(
      fields: { name: string; value: unknown; message: string }[],
      validateFn: (v: unknown) => boolean
    ): boolean {
      for (const field of fields) {
        if (!validateFn(field.value)) {
          toast.error(field.message)
          setIsSubmitting(false)
          return false
        }
      }
      return true
    }

    // 전체 검증 실행
    const isValid = validateFields(requiredFields, (v) => !isEmpty(v)) 

    if (!isValid) return
    // end of validation

    try {
      const profileFormData = {
        id: profileId,
        nickname: nickname,
        gender: gender
      } as ProfileRequest

      await onSubmit(profileFormData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "프로필 생성 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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
                  checked={gender === "M"}
                  onChange={(e) => setGender(e.target.value)}
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
                  checked={gender === "F"}
                  onChange={(e) => setGender(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="female">Female</Label>
              </div>
            </div>
          </div>
          
        </CardContent>
        <CardFooter>
          <Button 
            type="submit"
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </div>
            ) : (
              "Create Profile"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}