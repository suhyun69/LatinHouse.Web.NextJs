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
import { useRouter } from 'next/navigation'

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
  profile: Profile | null
  error: string | null
}

const SessionContext = createContext<ContextType>({
  session: null,
  profile: null,
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
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
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
        .then(({ data }) => setProfile(data))
        .catch(() => setProfile(null))
    } else {
      setProfile(null)
    }
  }, [session])

  // 3) Context에 세션, 프로필, 에러 제공
  return (
    <SessionContext.Provider value={{ session, profile, error }}>
      {children}
    </SessionContext.Provider>
  )
}
