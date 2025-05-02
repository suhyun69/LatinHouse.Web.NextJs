// src/app/auth/callback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [signupData, setSignupData] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('signup_data')
    if (stored) {
      try {
        setSignupData(JSON.parse(stored))
      } catch (e) {
        console.error(e instanceof Error ? e.message : 'Invalid signup_data format')
      }
    }
  }, [])

  useEffect(() => {
    if (!signupData) return

    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      fetch('/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ 쿠키 설정에 필수!
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          signup_data: signupData,
        }),
      })
        .then(async res => {
          if (res.redirected) {
            window.location.href = res.url
          } else {
            const data = await res.json()
            console.error('Login error:', data.error)
          }
        })
        .catch(err => {
          console.error('Network error:', err)
        })
    } else {
      console.error('Missing token in URL hash')
    }
  }, [signupData, router])

  return <div className="text-center p-4">로그인 처리 중입니다...</div>
}
