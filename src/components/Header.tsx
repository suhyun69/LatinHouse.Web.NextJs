"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, User, LogOut, Plus } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { profile, setProfile } = useProfile()
  const router = useRouter()

  const handleLogin = () => {
    setProfile({
      id: 'test-id',
      nickname: 'John Doe',
      avatar_url: ''
    })
  }

  return (
    <header>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {profile ? (
          <div className="text-lg font-medium">
            Hello, {profile.nickname}
          </div>
        ) : (
          <div className="text-lg font-medium">
            Hello, Stranger
          </div>
        )}
        {profile ? (
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.nickname} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/lesson/form')}>
                  <Plus className="mr-2 h-4 w-4" />
                  <span>수업 생성</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfile(null)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // <div onClick={() => router.push('/signup')}>
          <div onClick={handleLogin}>
            <Avatar>
              <AvatarImage src="" alt="Anonymous" />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </header>
  )
} 