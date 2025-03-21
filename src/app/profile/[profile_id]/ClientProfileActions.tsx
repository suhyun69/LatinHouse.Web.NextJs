"use client"

import { useProfile } from "@/hooks/useProfile"
import RegisterInstructor from "./RegisterInstructor"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useRouter } from "next/navigation"

type Profile = {
  profile_id: string
  isInstructor: boolean
}

export function ClientProfileActions({ profile }: { profile: Profile }) {
  const { profile: currentProfile } = useProfile()
  const router = useRouter()

  if (currentProfile?.id === profile.profile_id) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <Button 
            variant="outline"
            onClick={() => router.push(`/profile/${profile.profile_id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            프로필 수정
          </Button>
        </div>

        {!profile.isInstructor && (
          <div className="flex justify-center">
            <RegisterInstructor profileId={profile.profile_id} />
          </div>
        )}
      </div>
    )
  }

  return null
} 