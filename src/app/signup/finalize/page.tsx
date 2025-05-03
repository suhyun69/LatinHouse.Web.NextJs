// ✅ src/app/signup/finalize/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function FinalizeSignup() {
  const router = useRouter()

  useEffect(() => {
    const finalize = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        toast.error('사용자 인증 정보를 불러오지 못했습니다.')
        return router.replace('/')
      }

      const profile = user.user_metadata.signup_data
      // if (!profile) {
      //   toast.error('서버 세션에 회원가입 정보가 없습니다.')
      //   return router.replace('/')
      // }

      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          uid: user.id,
          created_by: profile.id,
        }),
      })

      if (!res.ok) {
        toast.error('프로필 저장에 실패했습니다.')
        return router.replace('/')
      }

      const { profile_id } = await res.json()

      // ✅ 세션 메타데이터에 프로필 요약 정보 저장
      await supabase.auth.updateUser({
        data: {
          profile_id,
          nickname: profile.nickname,
          gender: profile.gender,
          avatar_url: profile.avatar_url ?? null,
        },
      })

      // signup_data 정리
      await supabase.auth.updateUser({ data: { signup_data: null } })

      toast.success('회원가입이 완료되었습니다.')
      router.push(`/profile/${profile_id}`)
    }

    finalize()
  }, [router])

  return <p className="text-center py-10">회원 정보를 저장 중입니다...</p>
}