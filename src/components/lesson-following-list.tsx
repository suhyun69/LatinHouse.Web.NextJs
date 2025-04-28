"use client"

import { PaymentView } from "@/app/api/payments/route"
import { getDiscountedAmount, getLessonStatus, getPaymentStatusText, getRegionText, toKstDateTimeString } from "@/lib/utils"
import {  MoreHorizontal } from "lucide-react"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentSummary } from "./payment-summary"


export type LessonFollowingListProps = {
  payments: PaymentView[]
  onCancel: (payment: PaymentView) => void
}

export function LessonFollowingList({ payments, onCancel }: LessonFollowingListProps) {

  const [selectedPayment, setSelectedPayment] = useState<PaymentView | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  
  if (payments.length === 0) {
    return <div className="text-center text-muted-foreground py-6">신청한 수업이 없습니다.</div>
  }

  return (
    <>
      <div className="container mx-auto flex justify-center">
        <div className="max-w-sm w-full">
          {payments.map((payment) => (
            <div key={payment.id} className="flex gap-2 mt-2">
              {/* 이미지 카드 */}
              <div className="w-1/3 min-w-[120px] rounded-lg overflow-hidden shadow border">
                <img
                  src={payment.checkout.lesson.image_url}
                  alt={`Lesson ${payment.checkout.lesson.no}`}
                  className="object-cover w-full h-full cursor-pointer hover:opacity-80 aspect-video"
                  onClick={() => window.location.href = `/lesson/${payment.checkout.lesson.no}`}
                />
              </div>
            
              {/* 텍스트 카드 */}
              <div className="relative flex-1 bg-white rounded-lg shadow border p-4 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="text-lg font-semibold">
                    {payment.checkout.lesson.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {payment.checkout.lesson.instructor_lo && payment.checkout.lesson.instructor_la
                      ? `${payment.checkout.lesson.instructor_lo.nickname}, ${payment.checkout.lesson.instructor_la.nickname}`
                      : payment.checkout.lesson.instructor_lo?.nickname || payment.checkout.lesson.instructor_la?.nickname}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {toKstDateTimeString(payment.checkout.lesson.start_date_time, "M.d")} - {toKstDateTimeString(payment.checkout.lesson.end_date_time, "M.d")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getRegionText(payment.checkout.lesson.region)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ₩{getDiscountedAmount(payment).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <Badge>{getLessonStatus(payment.checkout.lesson).text}</Badge>
                  </div>
                </div>
            
                {/* 오른쪽 중간 아이콘 */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-1 text-muted-foreground">
                  {getPaymentStatusText(payment.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="hover:text-foreground transition">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => {
                        setSelectedPayment(payment)
                        setDetailDialogOpen(true)
                      }}>
                        결제 상세 정보
                      </DropdownMenuItem>
                      {payment.status === "approved" && (
                        <DropdownMenuItem onClick={() => onCancel(payment)}>
                          수업 취소 요청
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          className="w-full max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">결제 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedPayment ? (
            <PaymentSummary payment={selectedPayment} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">로딩 중...</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
