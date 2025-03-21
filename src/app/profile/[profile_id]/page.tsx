import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { formatGender } from "@/lib/utils"
import RegisterInstructor from "./RegisterInstructor"
import { Header } from '@/components/Header'

type Profile = {
  profile_id: string
  nickname: string
  gender: string
  is_instructor: boolean
  created_at: string
}

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
      <Header/>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src="" alt={profile.nickname} />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl mb-2">{profile.nickname}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {profile.profile_id}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium">Gender</div>
                <div className="text-muted-foreground">
                  {formatGender(profile.gender)}
                </div>
              </div>
              <div>
                <div className="font-medium">Role</div>
                <div className="text-muted-foreground">
                  {profile.is_instructor ? 'Instructor' : 'Student'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!profile.is_instructor && (
          <div className="flex justify-center">
            <RegisterInstructor profileId={profile.profile_id} />
          </div>
        )}
      </div>
    </>
  )
} 