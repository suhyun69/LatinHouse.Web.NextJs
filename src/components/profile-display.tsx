"use client"

import { ProfileView } from "@/app/api/profiles/[profile_id]/route"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"

type ProfileDisplayProps = {
  profile: ProfileView
  size?: "sm" | "md" | "lg"
  withName?: boolean
}

export function ProfileDisplay({ profile, size = "sm", withName = true }: ProfileDisplayProps) {
  const avatarSize = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  }[size]

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  }[size]

  return (
    <Link
      href={`/profile/${profile.id}`}
      className="inline-flex items-center gap-1 hover:underline text-foreground"
    >
      <Avatar className={avatarSize}>
        <AvatarImage src={profile.avatar_url || ""} alt={profile.nickname} />
        <AvatarFallback>
          <User size={iconSize} className="text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      {withName && <span>{profile.nickname}</span>}
    </Link>
  )
}
