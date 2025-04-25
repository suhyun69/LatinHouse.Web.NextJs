"use client"

import { AppliedDiscount } from "@/app/api/checkouts/route"
import { LessonView } from "@/app/api/lessons/[lesson_no]/route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDiscountText } from "@/lib/utils"

interface CheckoutFormProp {
  lesson: LessonView,
  discounts: AppliedDiscount[],
  discountedAmount: number
  onPayment: () => void
}

export default function CheckoutForm(prop: CheckoutFormProp) {
  return (
    <Card className="shadow-lg w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center">{prop.lesson.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center"></div>
          <div className="font-bold">₩{prop.lesson.price.toLocaleString()}</div>
        </div>
        <ul className="mt-4 space-y-2">
          {prop.discounts.map((discount, i) => (
            <li key={i} className="flex items-center text-gray-700">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  {discount.type === 'coupon' ? discount.text : getDiscountText(discount, prop.lesson.genre)}
                </div>
                <div>-₩{discount.amount.toLocaleString()}</div>
              </div>
            </li>
          ))}
          <hr/>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center"></div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">₩{prop.discountedAmount.toLocaleString()}</h2>
          </div>
        </ul>
        <Button 
          className="mt-6 w-full"
          onClick={prop.onPayment}
        >
          신청하기
        </Button>
      </CardContent>
    </Card>
  )
}