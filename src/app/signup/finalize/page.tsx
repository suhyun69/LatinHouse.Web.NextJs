"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function FinalizeSignup() {
  const router = useRouter()

  useEffect(() => {
    const finalize = async () => {
      const signupData = sessionStorage.getItem("signup_data")
      if (!signupData) {
        toast.error("회원가입 정보가 없습니다.")
        router.replace("/")
        return
      }

      const profile = JSON.parse(signupData)

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("사용자 인증 정보를 불러오지 못했습니다.")
        router.replace("/")
        return
      }

      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          uid: user.id,                 // ✅ Supabase 인증 UID
          created_by: profile.id,
        }),
      })

      if (!res.ok) {
        toast.error("프로필 저장에 실패했습니다.")
        router.replace("/")
        return
      }

      toast.success("회원가입이 완료되었습니다.")
      sessionStorage.removeItem("signup_data")
      const { profile_id } = await res.json()
      router.push(`/profile/${profile_id}`)
    }

    finalize()
  }, [router])

  return <p className="text-center py-10">회원 정보를 저장 중입니다...</p>
}
