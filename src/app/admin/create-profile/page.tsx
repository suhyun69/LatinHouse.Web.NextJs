// src > app > signup > page.tsx
"use client"

import { toast } from "sonner"
import { ProfileRequest } from "@/app/api/profiles/route"
import { ProfileCreateForm } from "@/components/profile-create-form"
import { HeaderTitle } from "@/components/header-title"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function CreateProfile() {
  const router = useRouter()

  const handleSubmit = async (data: ProfileRequest) => {

    const response = await fetch(`/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        created_by: data.id
      }),
    })
    const result = await response.json()

    if (!response.ok) toast.error('프로필 생성에 실패했습니다.')
    else {
      toast.success('프로필을 생성했습니다.')
      router.push(`/profile/${result.profile_id}`)
    }
  }

  return (
    <>
      <HeaderTitle title="Create Profile" />
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <ProfileCreateForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}