'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search.slice(1))
    const code = params.get('code')

    console.log('Kakao code:', code)

    if (code) {
      fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
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
      console.error('Missing code param')
      router.replace('/error3')
    }
  }, [router])

  return <div>카카오 로그인 처리 중입니다...</div>
}
