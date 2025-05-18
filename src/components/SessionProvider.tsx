'use client'

import {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from 'react'
import { supabaseClient } from '@/lib/supabase-client'
import type { Session } from '@supabase/supabase-js'

type ContextType = {
  session: Session | null
  error: string | null
}

const SessionContext = createContext<ContextType>({
  session: null,
  error: null,
})

export function useSession() {
  return useContext(SessionContext)
}

export default function SessionProvider({
  children
}: {
  children: ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [error] = useState<string | null>(null)

  // 1) auth 세션 복원 & 변경 구독
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [supabaseClient])

  // 2) Context에 세션, 프로필, 에러 제공
  return (
    <SessionContext.Provider value={{ session, error }}>
      {children}
    </SessionContext.Provider>
  )
}
