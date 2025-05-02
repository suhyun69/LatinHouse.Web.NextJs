'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1)) // '#' 제거
    const accessToken = fragment.get('access_token')
    const refreshToken = fragment.get('refresh_token') // 추가!

    console.log('accessToken', accessToken)
    console.log('refreshToken', refreshToken)

    if (accessToken && refreshToken) {
      fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          access_token: accessToken,
          refresh_token: refreshToken
        }),
      })
        .then(async res => {
          const data = await res.json()
          if (res.ok) {
            router.replace('/')
          } else {
            console.error('Auth failed:', data.error)
            router.replace('/error2')
          }
        })
    } else {
      console.error('Missing token:', { accessToken, refreshToken })
      router.replace('/error3')
    }
  }, [router])

  return (
    <div>로그인 처리 중입니다...</div>
  )
}
