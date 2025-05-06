'use client'

import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { HeaderTitle } from '@/components/header-title'
import { SignUpForm } from '@/components/signup-form'
import type { ProfileRequest } from '@/app/api/profiles/route'

export default function SignUp() {
  const handleSubmit = async (data: ProfileRequest) => {
    try {
      sessionStorage.setItem('signup_data', JSON.stringify(data))
      await new Promise(res => setTimeout(res, 100)) // 작은 대기

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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
          <SignUpForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  )
}