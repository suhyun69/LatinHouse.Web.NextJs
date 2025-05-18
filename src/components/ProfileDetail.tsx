"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Edit } from "lucide-react"
import Link from "next/link"
import { getGenderText } from "@/lib/utils"
import { ProfileView } from "@/app/types/profiles"

export function ProfileDetail({ profile, showEditLink = false }: { profile: ProfileView, showEditLink?: boolean }) {

  return (
    <Card>
      <CardHeader className="flex flex-col items-center text-center">
        <Avatar className="h-32 w-32 mb-4">
          <AvatarImage src={profile.avatar_url} alt={profile.nickname} />
          <AvatarFallback>
            <User className="h-16 w-16" />
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-3xl">{profile.nickname}</CardTitle>
            {showEditLink && (
              <Link 
                href={`/profile/${profile.id}/edit`}
                className="hover:text-primary transition-colors"
              >
                <Edit className="h-5 w-5" />
              </Link>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {profile.id}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="font-medium">Gender</div>
            <div className="text-muted-foreground">
              {getGenderText(profile.gender)}
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
  )
} 