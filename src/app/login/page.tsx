'use client'

import { supabase } from '@/lib/supabase-client'

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: { scope: 'account_email' },
      },
    })
  }

  return (
    <button onClick={handleLogin} className="p-2 bg-yellow-500 text-white">
      카카오 로그인
    </button>
  )
}
