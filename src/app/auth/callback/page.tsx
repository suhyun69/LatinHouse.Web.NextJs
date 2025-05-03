'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type SignupData = {
  id: string
  nickname: string
  gender: string
  // [key: string]: any // 추가 속성 허용
}

export default function AuthCallbackPage() {
  const router = useRouter()
  const [signupData, setSignupData] = useState<SignupData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('signup_data')
    if (stored) {
      try {
        setSignupData(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  useEffect(() => {
    if (!signupData) return

    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    if (!code) {
      console.error('No code in URL')
      return
    }

    fetch('/api/auth/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code, signup_data: signupData }),
    })
      .then(async (res) => {
        if (res.redirected) {
          window.location.href = res.url
        } else {
          const err = await res.json()
          console.error('Callback error:', err)
        }
      })
      .catch((err) => {
        console.error('Network error:', err)
      })
  }, [signupData, router])

  return <div className="text-center p-4">로그인 처리 중입니다...</div>
}
