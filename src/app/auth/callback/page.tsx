'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseJs } from '@/lib/supabase-js-client'
import { supabaseClient } from '@/lib/supabase-client'

export default function AuthCallback() {

  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 세션 체크 전에 약간의 지연 추가
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 1) Supabase 세션 복원
        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession()
        if (error) {
          console.error('세션 가져오기 실패:', error)
          throw error
        }

        if (session) {
          await supabaseClient.auth.setSession(session)
          console.log('세션 설정 완료:', session.user.email)
        }
        else {
          console.log('세션이 없습니다. OAuth 콜백이 아직 완료되지 않았을 수 있습니다.')
        }

        // 2) URL에서 profileData 파싱 (세션의 이메일이 보장된 후)
        const raw = params.get('profileData')
        if (raw) {
          console.log('profileData 파싱 시작')
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
      } catch (err) {
        console.error('인증 처리 중 오류 발생:', err)
      } finally {
        // 3) 항상 홈으로 리다이렉트
        router.replace('/')
      }
    }

    // const handleAuthCallback = async () => {
    //   try {
    //     const { data: { session }, error } = await supabaseJs.auth.getSession()
    //     if (error) throw error
    //     if (session) {
    //       await supabaseJs.auth.setSession(session)
    //     }
    //   } catch (error) {
    //     console.error('인증 처리 중 오류 발생:', error)
    //   } finally {
    //     router.replace('/')
    //   }
    // }

    handleAuthCallback()
  }, [params, router])

  return <div>로그인 처리 중…</div>
}