"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        toast.success("로그인되었습니다")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast.error("로그인에 실패했습니다")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/api/callback`,
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
    <div className="container mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold mb-6">로그인</h1>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          className="w-full bg-[#FEE500] text-black hover:bg-[#FDD800]"
          onClick={handleKakaoLogin}
        >
          카카오톡으로 로그인
        </Button>
      </div>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={() => router.push("/signup")}
        >
          계정이 없으신가요? 회원가입
        </Button>
      </div>
    </div>
  )
} 