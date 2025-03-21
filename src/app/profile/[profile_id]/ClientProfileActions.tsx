"use client"

import { useProfile } from "@/hooks/useProfile"
import RegisterInstructor from "./RegisterInstructor"

type Profile = {
  profile_id: string
  isInstructor: boolean
}

export function ClientProfileActions({ profile }: { profile: Profile }) {
  const { profile: currentProfile } = useProfile()

  if (!profile.isInstructor && currentProfile?.id === profile.profile_id) {
    return (
      <div className="flex justify-center">
        <RegisterInstructor profileId={profile.profile_id} />
      </div>
    )
  }

  return null
} 