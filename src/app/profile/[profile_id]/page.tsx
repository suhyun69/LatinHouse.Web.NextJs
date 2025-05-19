"use client"

import React, { useState, useEffect, use } from "react"
import { Header } from "@/components/Header"
import { toast } from "sonner"
import { ProfileDetail } from "@/components/ProfileDetail"
import { RenderMessage } from "@/components/RenderMessage"
import { ProfileView } from "@/app/types/profiles"
import { useSession } from "@/components/SessionProvider"

export default function ProfilePage({ params }: { params: Promise<{ profile_id: string }> }) {
  
  const { profile_id } = use(params)
  const { loginProfile } = useSession()

  const [profile, setProfile] = useState<ProfileView | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profiles/${profile_id}`)
        const result = await response.json()

        if (!response.ok || !result.data) {
          const message = result?.message || '프로필을 불러오는데 실패했습니다.'
          toast.error(message)
          setError(message)
          return
        }

        setProfile(result.data)
      } catch (err) {
        const message = err instanceof Error ? err.message : '오류가 발생했습니다.'
        toast.error(message)
        setError(message)
      }
    }

    fetchProfile()
  }, [profile_id])

  if (error) return <RenderMessage message={error} />
  if (!profile) return <RenderMessage message="Loading..." />

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-sm w-full">
          <ProfileDetail profile={profile} showEditLink={loginProfile?.id === profile.id}/>
        </div>
      </div>
    </>
  )
}
