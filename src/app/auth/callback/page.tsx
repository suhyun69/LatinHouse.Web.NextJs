'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()
  const signupData = JSON.parse(sessionStorage.getItem('signup_data') || '{}')

  useEffect(() => {
    // Supabase OAuth 로그인 성공 시, URL에 해시 형태로 access_token 등이 붙음
    const hashParams = new URLSearchParams(window.location.hash.slice(1))

    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    console.log('accessToken:', accessToken)
    console.log('refreshToken:', refreshToken)

    if (accessToken && refreshToken) {
      fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          signup_data: signupData,
        }),
      })
        .then(async res => {
          // const data = await res.json()
          if (res.redirected) {
            window.location.href = res.url // 실제 리디렉션
          } else {
            const data = await res.json()
            console.error('Login error:', data.error)
            // router.replace('/error')
          }
        })
        .catch((err) => {
          console.error('Network error:', err)
          // router.replace('/error')
        })
    } else {
      console.error('Missing token in URL hash')
      // router.replace('/error')
    }
  }, [router])

  return (
    <div className="text-center p-4">
      로그인 처리 중입니다...
    </div>
  )
}
