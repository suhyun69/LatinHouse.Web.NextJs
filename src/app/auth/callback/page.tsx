// /auth/callback/page.tsx

import { Suspense } from 'react'
// import dynamic from 'next/dynamic'
import AuthCallback from '@/components/AuthCallback'

// const AuthCallback = dynamic(() => import('./AuthCallback'), { ssr: false })

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>로그인 처리 중입니다...</div>}>
      <AuthCallback />
    </Suspense>
  )
}
