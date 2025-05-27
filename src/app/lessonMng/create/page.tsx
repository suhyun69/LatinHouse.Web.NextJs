"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { ProfileView } from "@/app/types/profiles"
import { useSession } from "@/components/SessionProvider"
import { HeaderTitle } from "@/components/HeaderTitle"
import { LessonRequest } from "@/app/types/lessons"
import { LessonForm } from "@/components/LessonForm"

export default function LessonCreatePage() {
  const router = useRouter()
  const { session, loginProfile } = useSession()

  const [friends, setFriends] = useState<ProfileView[]>([])

  useEffect(() => {
    if (loginProfile === undefined) return // 아직 로딩 중

    if (loginProfile === null) {
      setTimeout(() => {
        toast.success("로그인이 필요합니다.")
        router.replace("/") // replace() 사용 권장
      }, 0)
      return
    }
  
    if (!loginProfile?.is_instructor) {
      setTimeout(() => {
        toast.success("권한이 없습니다.")
        router.replace("/") // replace() 사용 권장
      }, 0)
      return
    }

    const fetchFriends = async () => {
      const response = await fetch(`/api/friends?from=${loginProfile.id}`)
      const result = await response.json()

      if (!response.ok) {
        toast.error(result?.message || '친구 목록을 조회하는데 실패했습니다.')
        return
      }

      setFriends(result.data)
    }
    fetchFriends()
  }, [session, loginProfile])

  const handleSubmit = async (data: LessonRequest) => {

    const response = await fetch('/api/lessons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        created_by: loginProfile?.id || ""
      }),
    })
    const result = await response.json()

    if (!response.ok) toast.error('수업 생성에 실패했습니다.')
    else {
      toast.success('수업을 생성했습니다.')
      router.push(`/lesson/${result.lesson_no}`)
    }
  }

  const handleUploadImage = async (file: File, fileName: string): Promise<string> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('fileName', `lessons/${Date.now()}-${fileName}`) // ✅ 파일명 추가
  
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

  return (
    <>
      <HeaderTitle title="Create Lesson" />
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <LessonForm 
            lesson={null} 
            // loginProfile={loginProfile}
            friends={friends}
            onSubmit={handleSubmit} 
            onUploadImage={handleUploadImage}
          />
        </div>
      </div>
    </>
  )
}