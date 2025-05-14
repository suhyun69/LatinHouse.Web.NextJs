import SessionProvider from '@/components/sessionProvider'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <main>
      <SessionProvider>
        <h1>홈 페이지</h1>
        {session ? <p>로그인됨: {session.user.email}</p> : <p>로그인 안됨</p>}
      </SessionProvider>
    </main>
  )
}
