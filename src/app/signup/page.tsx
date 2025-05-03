// ✅ src/app/signup/page.tsx
'use client'

import { toast } from 'sonner'
import { ProfileRequest } from '../api/profiles/route'
import { HeaderTitle } from '@/components/header-title'
import { supabase } from '@/lib/supabase'
import { SignUpForm } from '@/components/signup-form'

export default function SignUp() {
  const handleSubmit = async (data: ProfileRequest) => {
    
    try {
      sessionStorage.setItem('signup_data', JSON.stringify(data))

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