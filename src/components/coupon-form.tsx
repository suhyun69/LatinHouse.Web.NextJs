"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { LessonView } from "@/app/api/lessons/[lesson_no]/route"
import { CouponTemplateRequest } from "@/app/api/coupons/templates/route"

interface CouponFormProps {
  lessons: LessonView[]
  onSubmit: (data: CouponTemplateRequest) => Promise<void>
}

export function CouponForm({ lessons, onSubmit }: CouponFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [name, setName] = React.useState("")
  const [lessonNo, setLessonNo] = React.useState<number>()
  const [amount, setAmount] = React.useState<number>()
  const [quantity, setQuantity] = React.useState<number>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      const couponTemplateRequest: CouponTemplateRequest = {
        name,
        lesson_no: lessonNo!,
        amount: amount!,
        quantity: quantity!
      }

      await onSubmit(couponTemplateRequest)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>쿠폰 생성</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">쿠폰 이름</Label>
              <Input
                id="name"
                placeholder="쿠폰 이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson_no">할인 대상 수업</Label>
              <Select
                value={lessonNo?.toString()}
                onValueChange={(value) => setLessonNo(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="수업을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem 
                      key={lesson.no} 
                      value={lesson.no.toString()}
                    >
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">할인 금액</Label>
              <Input
                id="amount"
                type="text"
                placeholder="할인 금액을 입력하세요"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">수량</Label>
              <Input
                id="quantity"
                type="text"
                placeholder="쿠폰 수량을 입력하세요"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
} 