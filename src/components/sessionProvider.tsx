'use client'

import { Session, createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  return (
    <div>
      {session ? <div>환영합니다</div> : <div>로그인이 필요합니다</div>}
      {children}
    </div>
  )
}
