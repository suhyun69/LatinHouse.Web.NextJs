import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { formatGender } from "@/lib/utils"
import RegisterInstructor from "./RegisterInstructor"
import { Header } from '@/components/header'
import { useProfile } from "@/hooks/useProfile"
import { ClientProfileActions } from "./ClientProfileActions"

export default async function ProfilePage({ params }: { params: { profile_id: string } }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profileDetail } = await supabase
    .from('profiles')
    .select('*')
    .eq('profile_id', params.profile_id)
    .single()

  if (!profileDetail) {
    return <div className="flex justify-center items-center min-h-screen">Profile not found</div>
  }

  return (
    <>
      <Header/>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src="" alt={profileDetail.nickname} />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl mb-2">{profileDetail.nickname}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {profileDetail.profile_id}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium">Gender</div>
                <div className="text-muted-foreground">
                  {formatGender(profileDetail.gender)}
                </div>
              </div>
              <div>
                <div className="font-medium">Role</div>
                <div className="text-muted-foreground">
                  {profileDetail.is_instructor ? 'Instructor' : 'Student'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <ClientProfileActions profileDetail={profileDetail} profileId={params.profile_id} />
      </div>
    </>
  )
} 