// /auth/callback/AuthCallback.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'
import { RenderMessage } from '@/components/RenderMessage'

export default function AuthCallback() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        const {
          data: { session },
          error,
        } = await supabaseClient.auth.getSession()
        if (error) throw error

        if (!session?.user.email) return router.replace('/')
        await supabaseClient.auth.setSession(session)

        const email = encodeURIComponent(session?.user.email || '')
        const res = await fetch(`/api/profiles/email/${email}`)

        if (res.ok) return router.replace('/')

        const raw = params.get('profileData')
        if (raw) {
          try {
            const profileRequest = JSON.parse(raw)
            await fetch('/api/profiles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...profileRequest,
                email: session?.user.email,
                created_by: profileRequest.id,
              }),
            })
          } catch (e) {
            console.error('프로필 파싱 실패:', e)
          }
        } else {
          const res = await fetch(`/api/profiles/email/${email}`)
          if (res.status === 404) {
            return router.replace('/signup')
          }
        }
      } catch (err) {
        console.error('인증 처리 중 오류 발생:', err)
      } finally {
        router.replace('/')
      }
    }

    handleAuthCallback()
  }, [params, router])

  return <RenderMessage message="로그인 처리 중..." />
}
