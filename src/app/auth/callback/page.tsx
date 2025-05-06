'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLoginProfile } from '@/hooks/useLoginProfile'
import { RenderMessage } from '@/components/render-message'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { setLoginProfile } = useLoginProfile()

  useEffect(() => {
    const finalize = async () => {
      const stored = sessionStorage.getItem('signup_data')
      const signup_data = stored ? JSON.parse(stored) : null

      const code = new URL(window.location.href).searchParams.get('code')
      if (!code) return

      const res = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, signup_data }),
      })

      const { redirectTo } = await res.json()

      const me = await fetch('/api/me', { credentials: 'include' })
      if (me.ok) {
        const { profile } = await me.json()
        setLoginProfile(profile)
      }

      window.location.href = redirectTo
    }
    finalize()
  }, [router])

  return <RenderMessage message="로그인 처리 중입니다..." />
}