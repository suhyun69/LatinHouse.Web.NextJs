"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useProfile } from "@/hooks/useProfile"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Lesson = {
  lesson_id: string
  title: string
  description: string
  created_at: string
  instructor_id: string
}

export default function LessonManagementPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const { profile } = useProfile()
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!profile?.is_instructor) {
      router.push('/')
      return
    }

    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('instructor_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching lessons:', error)
        return
      }

      setLessons(data || [])
    }

    fetchLessons()
  }, [profile, supabase, router])

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">수업 관리</h1>
          <Button onClick={() => router.push('/lessonMng/create')}>
            수업 생성
          </Button>
        </div>

        

        <div className="grid gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.lesson_id} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardHeader>
                <CardTitle>{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  생성일: {new Date(lesson.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {lessons.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  아직 생성된 수업이 없습니다.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  )
} 