'use client'

import React, { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ProfileEditRequest, ProfileView } from "@/app/types/profiles"
import { useSession } from "@/components/SessionProvider"
import { RenderMessage } from "@/components/RenderMessage"
import { HeaderTitle } from "@/components/HeaderTitle"
import { ProfileEditForm } from "@/components/ProfileEditForm"

export default function ProfileEditPage({ params }: { params: Promise<{ profile_id: string }> }) {
  const router = useRouter()
  const { profile_id } = use(params)
  const { loginProfile } = useSession()
  
  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (loginProfile === undefined) return // 아직 로딩 중

    if (!loginProfile) {
      setTimeout(() => {
        toast.success("로그인이 필요합니다.")
        router.replace(`/`)
      }, 0)
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profiles/${profile_id}`)
        const result = await response.json()

        if (!response.ok) {
          toast.error(result?.message || '프로필을 불러오는데 실패했습니다.')
          return
        }

        setProfile(result.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다.'
        toast.error(message)
        setError(message)
      }
    }

    fetchProfile()
  }, [profile_id])

  useEffect(() => {
    // loginProfile === undefined :: "아직 로그인 정보가 로딩 중" (비동기 상태 대기 중)
    // !profile :: "프로필 데이터가 아직 없음" 또는 불러오기 실패
    if (loginProfile === undefined || !profile) return
    if (profile.id !== loginProfile?.id) {
      setTimeout(() => {
        toast.error("접근 권한이 없습니다.")
        router.replace("/")
      }, 0)
      return
    }
  }, [loginProfile, profile])

  if (error) return <RenderMessage message={error} isError />
  if (!profile) return <RenderMessage message="Loading..." />

  const handleUploadImage = async (file: File, fileName: string): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', `profiles/${Date.now()}-${fileName}`) // ✅ 파일명 추가
  
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
  
      if (!response.ok) {
        throw new Error(result.error || '이미지 업로드에 실패했습니다.')
      }
      return result.url
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      toast.error('이미지 업로드에 실패했습니다.')
      return ""
    }
  }  

  const handleInstructor = async () => {
    const response = await fetch(`/api/profiles/${profile_id}/instructor`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        updated_by: loginProfile?.id || ""
      }),
    })

    if (!response.ok) toast.error('강사 등록에 실패했습니다.')
    else {
      toast.success('강사 등록에 성공했습니다.')
      router.replace(`/profile/${profile_id}`)
      router.refresh()
    }

    return response.ok;
  }

  const handleSubmit = async (data: ProfileEditRequest) => {

    const response = await fetch(`/api/profiles/${profile_id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // is_instructor: data.is_instructor,
        avatar_url: data.avatar_url,
        updated_by: loginProfile?.id || ""
      }),
    })
    const result = await response.json()

    if (!response.ok) toast.error(result.message || '프로필 수정에 실패했습니다.')
    else {
      toast.success(result.message || '프로필을 수정했습니다.')
      router.replace(`/profile/${result.profile_id}`)
      router.refresh() // 🔁 추가: 최신 상태 강제 반영
    }
  }

  return (
    <>
      <HeaderTitle title="Edit Profile" />
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <ProfileEditForm profile={profile} onSubmit={handleSubmit} onUploadImage={handleUploadImage} onInstructor={handleInstructor}/>
        </div>
      </div>
    </>
  )
}