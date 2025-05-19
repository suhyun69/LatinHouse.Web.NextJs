"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRef, useState } from "react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Loader2, User, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { ProfileEditRequest, ProfileView } from "@/app/types/profiles"

interface ProfileFormProps {
  profile: ProfileView
  onSubmit: (data: ProfileEditRequest) => Promise<void>
  onUploadImage: (file: File, fileName: string) => Promise<string>
  onInstructor: () => Promise<boolean>
}

export function ProfileEditForm({ profile, onSubmit, onUploadImage, onInstructor }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [profileId] = React.useState(profile.id)
  const [nickname] = React.useState(profile.nickname)
  const [sex] = React.useState(profile.gender)
  const [isInstructor, setIsInstructor] = React.useState(profile.is_instructor)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('이미지를 선택해주세요.')
      }
  
      const file = event.target.files[0]
  
      // ✅ 확장자 체크
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('지원하지 않는 이미지 형식입니다. (jpg, png, webp만 가능)')
        return
      }
  
      // ✅ 사이즈 체크 (2MB 제한)
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        toast.error('이미지 파일 크기는 최대 2MB까지 가능합니다.')
        return
      }
  
      setUploading(true)
      const uploadedUrl = await onUploadImage(file, file.name)
      if (uploadedUrl) setAvatarUrl(uploadedUrl)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }  

  const handleAvatarClick = () => {
    fileInputRef.current?.click() // ✅ Avatar 클릭 시 input 클릭 트리거
  }
  
  const handleInstructor = async () => {
    const confirmText = '강사로 등록하시겠습니까?'
    if (confirm(confirmText)) {
      await onInstructor();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const editProfileData: ProfileEditRequest = {
        // is_instructor: isInstructor,
        avatar_url: avatarUrl
      }
      
      await onSubmit(editProfileData)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '프로필 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div onClick={handleAvatarClick} className="flex flex-col items-center justify-center text-center">
        <Avatar className="h-32 w-32 mb-4 bg-white rounded-full flex items-center justify-center overflow-hidden relative">
          {uploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          ) : (
            <>
              <AvatarImage
                src={avatarUrl}
                alt={profile.nickname}
                className="h-full w-full object-cover rounded-full"
              />
              <AvatarFallback className="bg-white rounded-full flex items-center justify-center">
                <User className="h-16 w-16 text-gray-400" />
              </AvatarFallback>
            </>
          )}
        </Avatar>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} hidden />
      </div>

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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Instructor</CardTitle>
          <CardDescription>
            수업을 생성하고 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="is-instructor">
              Instructor
              {isInstructor && (
                <Check className="inline-block h-4 w-4 text-green-500" />
              )}
            </Label>
            <div className="flex items-center gap-2">
              {/* <Switch
                id="is-instructor"
                checked={isInstructor}
                onCheckedChange={setIsInstructor}
                // disabled={profile.is_instructor}
              /> */}
              {!isInstructor && (
                <Button type="button" id="is-instructor" onClick={handleInstructor}>
                  등록
                </Button>
              )}
              
              {/* <span className="text-sm text-muted-foreground">
                {isInstructor ? 'Yes' : 'No'}
              </span> */}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            수정 중
          </div>
        ) : (
          "수정"
        )}
      </Button>
    </form>
  )
}