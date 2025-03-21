import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CardsEditProfile } from "@/components/edit-profile"

export default async function EditProfilePage({ params }: { params: { profile_id: string } }) {
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
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <CardsEditProfile profile={profile} />
      </div>
    </div>
  )
}