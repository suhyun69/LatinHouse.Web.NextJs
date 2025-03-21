"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function RegisterInstructor({ profileId }: { profileId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConfirm = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_instructor: true })
        .eq('profile_id', profileId)

      if (error) throw error

      // 성공 알림 표시
      toast.success("Instructor 등록이 완료되었습니다.")

      // 페이지 새로고침
      router.refresh()
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('강사 등록 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full max-w-md py-6 text-lg">Instructor 등록</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Instructor 등록</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>강사로 등록하시겠습니까?</span>
            <span className="block">강사로 등록하면 수업을 생성하고 관리할 수 있습니다.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "처리중..." : "확인"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 