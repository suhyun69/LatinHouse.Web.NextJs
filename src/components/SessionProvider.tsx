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

type Profile = {
  id: string
  user_id: string
  nickname: string
  avatar_url?: string
  is_instructor: boolean
  is_admin: boolean
}

type ContextType = {
  session: Session | null
  loginProfile: Profile | null
  error: string | null
}

const SessionContext = createContext<ContextType>({
  session: null,
  loginProfile: null,
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
  const [loginProfile, setLoginProfile] = useState<Profile | null>(null)
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

  // 2) session이 바뀔 때만 프로필 조회
  useEffect(() => {
    if (session?.user.id) {
      fetch(`/api/profiles/email/${encodeURIComponent(session.user.email || '')}`)
        .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
        .then(({ data }) => setLoginProfile(data))
        .catch(() => setLoginProfile(null))
    } else {
      setLoginProfile(null)
    }
  }, [session])

  // 3) Context에 세션, 프로필, 에러 제공
  return (
    <SessionContext.Provider value={{ session, loginProfile, error }}>
      {children}
    </SessionContext.Provider>
  )
}
