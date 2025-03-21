"use client"

import { useProfile } from "@/hooks/useProfile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Edit } from "lucide-react"
import Link from "next/link"
import { formatGender } from "@/lib/utils"

type Profile = {
  profile_id: string
  nickname: string
  gender: string
  isInstructor: boolean
}

export function ProfileCard({ profile }: { profile: Profile }) {
  
  const { profile: currentProfile } = useProfile()

  return (
    <>
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
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-3xl">{profile.nickname}</CardTitle>
                {currentProfile?.id === profile.profile_id && (
                  <Link 
                    href={`/profile/${profile.profile_id}/edit`}
                    className="hover:text-primary transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                )}
              </div>
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
                  {profile.isInstructor ? 'Instructor' : 'Student'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
} 