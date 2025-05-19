'use client'

import { HeaderTitle } from "@/components/HeaderTitle"
import { ProfileRequest } from "../types/profiles"
import { ProfileCreateForm } from "@/components/ProfileCreateForm"
import { toast } from "sonner"
import { supabaseClient } from "@/lib/supabase-client"

export default function SignUp() {
  
  const handleSubmit = async (data: ProfileRequest) => {
    try {
      // 폼 데이터를 JSON으로 직렬화 + URL 인코딩
      const payload = encodeURIComponent(JSON.stringify(data))
      const redirectTo = `${window.location.origin}/auth/callback?profileData=${payload}`

      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: redirectTo,
          queryParams: { scope: 'account_email' },
        },
      })
      if (error) throw error
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '카카오 로그인에 실패했습니다.')
    }
  }

  return (
    <>
      <HeaderTitle title="회원가입" />
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <ProfileCreateForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}