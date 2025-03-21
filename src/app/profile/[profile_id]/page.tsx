import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ProfileCard } from "@/components/profile-card"
import { Header } from "@/components/header"

export default async function ProfilePage({ params }: { params: { profile_id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('profile_id', params.profile_id)
    .single()

  if (!profile) {
    return <div className="flex justify-center items-center min-h-screen">Profile not found</div>
  }

  return (
    <>
      <Header />
      <ProfileCard profile={profile} />
    </>
  )
} 