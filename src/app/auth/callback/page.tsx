'use client'
import { useEffect } from 'react'

export default function AuthCallback() {
  useEffect(() => {
    window.location.href = '/'
  }, [])

  return <div>로그인 처리 중...</div>
}
