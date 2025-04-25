"use client"

import { useRouter } from "next/navigation"
import { useLoginProfile } from "@/hooks/useLoginProfile"
import { toast } from "sonner"
import { use, useEffect, useState } from "react"
import { HeaderTitle } from "@/components/header-title"
import { LessonForm } from "@/components/lesson-form"
import { LessonRequest } from "@/app/api/lessons/route"
import { ProfileView } from "@/app/api/profiles/[profile_id]/route"
import { LessonView } from "@/app/api/lessons/[lesson_no]/route"

export default function LessonEditPage({ params }: { params: Promise<{ lesson_no: string }> }) {
  const router = useRouter()
  const { lesson_no } = use(params)

  const [lesson, setLesson] = useState<LessonView | null>(null)
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
  
    if (!loginProfile?.is_instructor) {
      setTimeout(() => {
        toast.success("권한이 없습니다.")
        router.replace("/") // replace() 사용 권장
      }, 0)
      return
    }

    const fetchLesson = async () => {
      try {
        const response = await fetch(`/api/lessons/${lesson_no}`)
        const result = await response.json()
      
        if (!response.ok) {
          toast.error(result?.message || '수업을 조회하는데 실패했습니다.')
        }
      
        setLesson(result.data)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : '오류가 발생했습니다.')
        router.push(`/`)
      }
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

    fetchLesson()
    fetchFriends()
  }, [loginProfile])

  useEffect(() => {
    if (loginProfile === undefined || !lesson) return
    if ((lesson.instructor_lo?.id !== loginProfile?.id) 
      && (lesson.instructor_la?.id !== loginProfile?.id) 
      && (lesson.created_by !== loginProfile?.id)
    ) {
      setTimeout(() => {
        toast.error("접근 권한이 없습니다.")
        router.replace("/")
      }, 0)
      return
    }
  }, [loginProfile, lesson])

  const handleSubmit = async (data: LessonRequest) => {

    const response = await fetch(`/api/lessons/${lesson_no}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        updated_by: loginProfile?.id || ""
      }),
    })
    const result = await response.json()

    if (!response.ok) toast.error('수업 수정에 실패했습니다.')
    else {
      toast.success('수업을 수정했습니다.')
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
            lesson={lesson} 
            loginProfile={loginProfile}
            friends={friends}
            onSubmit={handleSubmit} 
            onUploadImage={handleUploadImage}
          />
        </div>
      </div>
    </>
  )
}