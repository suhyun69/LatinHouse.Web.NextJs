"use client"

import { Header } from "@/components/header"
import { CreateLesson } from "@/components/create-lesson"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/useProfile"

export default function CreateLessonPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { profile } = useProfile()

  const handleSave = async (lessonData: any) => {
    if (!profile) throw new Error('Profile not found')

    const { error } = await supabase
      .from('lessons')
      .insert([{
        ...lessonData,
        created_by: profile.id,
        updated_by: profile.id
      }])

    if (error) throw error
    
    router.push('/lessonMng')
  }

  if (!profile) return null

  return (
    <>
      <Header/>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">수업 생성</h1>
        <CreateLesson 
          lesson={null}
          onSaved={handleSave}
          onCancel={() => router.back()}
          onUploadImage={async (file) => {
            const { data, error } = await supabase.storage
              .from('images')
              .upload(`lessons/${Date.now()}-${file.name}`, file)
            
            if (error) throw error
            
            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(data.path)
              
            return { url: publicUrl }
          }}
        />
      </div>
    </>
  )
} 