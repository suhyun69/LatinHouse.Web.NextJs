'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const fragment = new URLSearchParams(window.location.hash.slice(1)) // # 제거
    const accessToken = fragment.get('access_token')

    if (accessToken) {
      fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      })
        .then(res => {
          if (res.ok) {
            router.replace('/') // 성공하면 홈으로
          } else {
            router.replace('/error') // 실패하면 에러로
          }
        })
    } else {
      router.replace('/error')
    }
  }, [router])

  return (
    <div>로그인 처리 중...</div>
  )
}
