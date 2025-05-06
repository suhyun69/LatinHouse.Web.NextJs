// ✅ app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLoginProfile } from '@/hooks/useLoginProfile'

type SignupData = {
  id: string
  nickname: string
  gender: string
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const { setLoginProfile } = useLoginProfile()

  useEffect(() => {
    const finalize = async () => {
      const stored = sessionStorage.getItem('signup_data')
      const signup_data: SignupData | null = stored ? JSON.parse(stored) : null

      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      if (!code) return

      await fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, signup_data }),
        credentials: 'include',
      })

      const res = await fetch('/api/me')
      if (res.ok) {
        const { profile } = await res.json()
        setLoginProfile(profile)
      }

      window.location.href = '/'
    }

    finalize()
  }, [router, setLoginProfile])

  return <div className="text-center p-4">로그인 처리 중입니다...</div>
}