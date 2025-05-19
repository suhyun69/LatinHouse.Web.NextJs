"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, User, LogOut, UserPlus, Footprints, Ticket, UserCog } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { useEffect, useState } from 'react'
import { useSession } from "./SessionProvider"
import { supabaseClient } from "@/lib/supabase-client"

export function Header() {

  const router = useRouter()
  
  const { session, loginProfile } = useSession()
  const [loading, setLoading] = useState(false)

  const handleKakaoLogin = async () => {
    setLoading(true)
    await supabaseClient.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
    setLoading(false)
  }

  const handleLogout = async () => {
    setLoading(true)
    await supabaseClient.auth.signOut()
    // 로그아웃 후 세션이 삭제되면 onAuthStateChange 로 UI가 자동 갱신됩니다.
    setLoading(false)
  }

  return (
    <header>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {session && loginProfile ? (
          <div className="flex flex-col cursor-pointer" onClick={() => router.push('/')}>
            <span>Hello, {loginProfile.nickname}</span>
            <span>Welcome to LatinHouse</span>
          </div>
        ) : (
          <div className="flex flex-col cursor-pointer" onClick={() => router.push('/')}>
            <span>Hello, Stranger</span>
            <span>Welcome to LatinHouse</span>
          </div>
        )}
        {session && loginProfile ? (
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5" onClick={() => router.push('/notice')} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={loginProfile?.avatar_url || ""} alt={loginProfile?.nickname} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/profile/${loginProfile?.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/lessonMng')}>
                  <Footprints className="mr-2 h-4 w-4" />
                  <span>수업 관리</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/couponMng')}>
                  <Ticket className="mr-2 h-4 w-4" />
                  <span>쿠폰 관리</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/friends')}>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>친구 관리</span>
                </DropdownMenuItem>
                {loginProfile.is_admin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/admin/create-profile')}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>프로필 생성</span>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="" alt="Anonymous" />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/signup')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>회원가입</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleKakaoLogin}>
                  <User className="mr-2 h-4 w-4" />
                  <span>로그인</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  )
}