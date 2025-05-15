import { cookies, headers } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import HomeContent from './home-content'
import SessionProvider from '@/components/SessionProvider'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const supabase = createServerComponentClient<undefined>({
    cookies: () => cookies(),
    headers: () => headers(),
  } as unknown as Parameters<typeof createServerComponentClient>[0])

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <SessionProvider initialSession={session}>
      <HomeContent />
    </SessionProvider>
  )
}
