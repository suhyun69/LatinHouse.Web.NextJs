"use client"

import { useProfile } from "@/hooks/useProfile"
import RegisterInstructor from "./RegisterInstructor"

type ProfileDetail = {
  profile_id: string
  is_instructor: boolean
}

export function ClientProfileActions({ 
  profileDetail,
  profileId 
}: { 
  profileDetail: ProfileDetail
  profileId: string 
}) {
  const { profile: currentProfile } = useProfile()

  if (!profileDetail.is_instructor && currentProfile?.id === profileId) {
    return (
      <div className="flex justify-center">
        <RegisterInstructor profileId={profileDetail.profile_id} />
      </div>
    )
  }

  return null
} 