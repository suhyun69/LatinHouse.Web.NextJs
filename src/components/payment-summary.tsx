// components/PaymentSummary.tsx
"use client"

import { PaymentView } from "@/app/api/payments/route"
import { getDiscountedAmount, getDiscountText } from "@/lib/utils"

interface PaymentSummaryProps {
  payment: PaymentView
}

export function PaymentSummary({ payment }: PaymentSummaryProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* 수업 가격 */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-muted-foreground">수업 가격</div>
        <div className="font-bold text-base">
          ₩{payment.checkout.lesson.price.toLocaleString()}
        </div>
      </div>

      {/* 할인 목록 */}
      <ul className="space-y-2">
        {payment.checkout.discounts.map((discount, i) => (
          <li key={i} className="flex justify-between text-sm text-muted-foreground">
            <div>
              {discount.type === "coupon"
                ? discount.text
                : getDiscountText(discount, payment.checkout.lesson.genre)}
            </div>
            <div>-₩{discount.amount.toLocaleString()}</div>
          </li>
        ))}
      </ul>

      <hr />

      {/* 최종 결제 금액 */}
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold text-gray-800">최종 결제 금액</div>
        <div className="text-2xl font-bold text-primary">
          ₩{getDiscountedAmount(payment).toLocaleString()}
        </div>
      </div>
    </div>
  )
}
