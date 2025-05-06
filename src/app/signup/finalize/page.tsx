// ✅ app/signup/finalize/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useLoginProfile } from '@/hooks/useLoginProfile'
import { RenderMessage } from '@/components/render-message'

export default function FinalizeSignup() {
  const router = useRouter()
  const { setLoginProfile } = useLoginProfile()

  useEffect(() => {
    const finalize = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('사용자 인증 정보를 불러오지 못했습니다.')
        return router.replace('/')
      }

      const profile = user.user_metadata.signup_data
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, uid: user.id, created_by: profile.id }),
      })

      if (!res.ok) {
        toast.error('프로필 저장에 실패했습니다.')
        return router.replace('/')
      }

      const { profile_id } = await res.json()
      await supabase.auth.updateUser({
        data: {
          profile_id,
          ...profile,
          signup_data: null,
        },
      })

      const meRes = await fetch('/api/me')
      if (meRes.ok) {
        const { profile: loginProfile } = await meRes.json()
        setLoginProfile(loginProfile)
      }

      toast.success('회원가입이 완료되었습니다.')
      router.push(`/profile/${profile_id}`)
    }

    finalize()
  }, [router, setLoginProfile])
  
  return <RenderMessage message="회원 정보를 저장 중입니다..." />
}
