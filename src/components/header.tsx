"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, User, LogOut, UserPlus, Footprints, Ticket, UserCog } from "lucide-react"
import { useLoginProfile } from "@/hooks/useLoginProfile"
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
import { useEffect } from 'react'

export function Header() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const { loginProfile, setLoginProfile } = useLoginProfile()


  useEffect(() => {
    // 페이지 로드 시 쿠키에서 프로필 정보 확인
    const profileData = document.cookie
      .split('; ')
      .find(row => row.startsWith('login_profile='))
      ?.split('=')[1]

    if (profileData) {
      try {
        const profile = JSON.parse(decodeURIComponent(profileData))
        setLoginProfile(profile)
      } catch (error) {
        console.error('Failed to parse profile data:', error)
      }
    }
  }, [setLoginProfile])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // clearLoginProfile 메서드 사용
      useLoginProfile.getState().clearLoginProfile()
      
      // 쿠키 삭제
      document.cookie = 'login_profile=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'

      toast.success("로그아웃되었습니다")
      
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error("로그아웃에 실패했습니다")
      console.error(error)
    }
  }

  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            scope: 'profile_nickname profile_image account_email' // 필요한 정보 스코프
          }
        }
      })

      if (error) throw error
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "카카오 로그인에 실패했습니다")
    }
  }

  return (
    <header>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {loginProfile ? (
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
        {loginProfile ? (
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
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/create-profile')}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>프로필 생성</span>
                </DropdownMenuItem>
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