'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseJs } from '@/lib/supabase-js-client'
import { supabaseClient } from '@/lib/supabase-client'
import { RenderMessage } from '@/components/RenderMessage'

export default function AuthCallback() {

  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 세션 체크 전에 약간의 지연 추가
        await new Promise(resolve => setTimeout(resolve, 500));

        // 1) Supabase 세션 복원
        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession()
        if (error) {
          console.error('세션 가져오기 실패:', error)
          throw error
        }

        if (!session?.user.email) {
          console.log('세션이 없거나 이메일이 없습니다.')
          return router.replace('/')
        }

        if (session) {
          await supabaseClient.auth.setSession(session)
          // console.log('세션 설정 완료:', session.user.email)
        }
        const email = encodeURIComponent(session?.user.email || '')

        // ─── 2) 프로필 조회 ───────────────────────────
        const res = await fetch(`/api/profiles/email/${email}`)
        if (res.ok) {
          // 이미 프로필이 있으면 바로 홈으로
          return router.replace('/')
        }

        // 3) URL에서 profileData 파싱 (세션의 이메일이 보장된 후)
        const raw = params.get('profileData')
        if (raw) {
          try {
            const profileRequest = JSON.parse(raw)
            await fetch('/api/profiles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({...profileRequest, email: session?.user.email, created_by: profileRequest.id}),
            })
          } catch (e) {
            console.error('프로필 파싱 실패:', e)
          }
        }
        else {
          // 로그인
          fetch(`/api/profiles/email/${email}`)
            .then(res => {
              if (res.status === 404) {
                // 프로필이 없으면 회원가입 페이지로
                router.replace('/signup')
              }
            })
        }
      } catch (err) {
        console.error('인증 처리 중 오류 발생:', err)
      } finally {
        // 4) 항상 홈으로 리다이렉트
        console.log('인증 처리 완료')
        router.replace('/')
      }
    }

    handleAuthCallback()
  }, [params, router])

  return <RenderMessage message="로그인 처리 중..." />
}