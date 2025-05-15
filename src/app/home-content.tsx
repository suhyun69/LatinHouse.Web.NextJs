// ✅ src/app/home-content.tsx
'use client'
import { useSession } from '@/components/SessionProvider'

export default function HomeContent() {
  const session = useSession()

  return (
    <div>
      <h1>홈</h1>
      {session ? (
        <p>✅ 로그인됨: {session.user.email}</p>
      ) : (
        <p>❌ 로그인 안됨</p>
      )}
    </div>
  )
}