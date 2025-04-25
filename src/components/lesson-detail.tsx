"use client"

import { Button } from "@/components/ui/button"
// import { v4 as uuidv4 } from 'uuid'
import { Card, CardContent } from "@/components/ui/card"
import { User, Calendar, Clock, Map, MapPin, Banknote, BanknoteArrowDown, Wallet, Info, Music } from "lucide-react"
import { getGenreText, getRegionText, toKstDateTimeString, getBankText, getGenderByGenreText } from "@/lib/utils"
import { Contact, Discount, LessonView } from "@/app/api/lessons/[lesson_no]/route"
import { ContactTypeIcon } from "@/components/contact-type-icon"
import { useState } from "react"
import { toast } from "sonner"
import { ProfileDisplay } from "./profile-display"
// import { NicknameDisplay } from "@/components/nickname-display"

interface LessonDetailProps {
  lesson: LessonView
  isJoinable: boolean
  onSubmit: () => Promise<void>
}

export default function LessonDetail({ lesson, isJoinable, onSubmit }: LessonDetailProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '수업 신청 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          {/* <p className="text-muted-foreground">#{lesson.lesson_no}</p> */}
        </div>
      </div>

      {lesson.image_url && (
        <div className="relative w-full mb-4">
          <img
            src={lesson.image_url}
            alt={lesson.title}
            className="rounded-lg object-cover w-full h-full"
          />
        </div>
      )}

      {/* 기본 정보 */}
      <Card className="py-3 mb-2">
        <CardContent>
          <section className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold w-1/2 text-left flex items-center gap-2">
                <Music className="h-5 w-5" />
              </h2>
              <p className="text-lg w-2/3 text-right">{getGenreText(lesson.genre)}</p>
            </div>
          </section>
        </CardContent>
      </Card>
      <Card className="py-3 mb-2">
        <CardContent>
          <section className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold w-1/2 text-left flex items-center gap-2">
                <User className="h-5 w-5" />
              </h2>
              <p className="text-lg w-2/3 text-right flex justify-end gap-1">
                {lesson.instructor_lo && (
                  <ProfileDisplay profile={lesson.instructor_lo} />
                )}
                {lesson.instructor_lo && lesson.instructor_la && <span>,</span>}
                {lesson.instructor_la && (
                  <ProfileDisplay profile={lesson.instructor_la} />
                )}
              </p>

            </div>
          </section>
        </CardContent>
      </Card>
      <Card className="py-3 mb-2">
        <CardContent>
          <section className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold w-1/2 text-left flex items-center gap-2">
                <Calendar className="h-5 w-5" />
              </h2>
              <p className="text-lg w-2/3 text-right">{toKstDateTimeString(lesson.start_date_time, "M.d")} - {toKstDateTimeString(lesson.end_date_time, "M.d")}</p>
            </div>
            <div className="flex items-center">
              <h2 className="text-xl font-semibold w-1/3 text-left flex items-center gap-2">
                <Clock className="h-5 w-5" />
              </h2>
              <p className="text-lg w-2/3 text-right">{`${toKstDateTimeString(lesson.start_date_time, "HH:mm")} - ${toKstDateTimeString(lesson.end_date_time, "HH:mm")}`}</p>
            </div>

            {lesson.datetime_sub_texts && lesson.datetime_sub_texts.length > 0 && (
              <div>
                <div className="flex items-start">
                  <h2 className="text-xl font-semibold w-1/3 text-left"></h2>
                  <div className="w-2/3 text-right">
                    {lesson.datetime_sub_texts.map((text: string, index: number) => (
                      <p key={index} className="text-lg">{text}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </section>
          </CardContent>
        </Card>
        <Card className="py-3 mb-2">
          <CardContent>
            <section className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold w-1/3 text-left flex items-center gap-2">
                <Map className="h-5 w-5" />
              </h2>
              <p className="text-lg w-2/3 text-right">{getRegionText(lesson.region)}</p>
            </div>
            <div className="flex items-center">
              <h2 className="text-xl font-semibold w-1/3 text-left flex items-center gap-2">
                <MapPin className="h-5 w-5" />
              </h2>
              <p className="text-lg w-2/3 text-right">
                {lesson.place_url ? (
                  <a 
                    href={lesson.place_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {lesson.place}
                  </a>
                ) : (
                  lesson.place
                )}
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
      <Card className="py-3 mb-2">
        <CardContent>
          <section className="space-y-4">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold w-1/3 text-left flex items-center gap-2">
                <Banknote className="h-5 w-5" />
              </h2>
              <p className="text-lg w-2/3 text-right">{lesson.price?.toLocaleString()}원</p>
            </div>
            {lesson.discounts && lesson.discounts.length > 0 && (
              <div>
                <div className="flex items-start">
                  <h2 className="text-xl font-semibold w-1/3 text-left flex items-center gap-2">
                    <BanknoteArrowDown className="h-5 w-5" />
                  </h2>
                  <div className="w-2/3 text-right">
                    {lesson.discounts
                      .filter((discount: Discount) => discount.type === "earlybird")
                      .sort((a: Discount, b: Discount) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())
                      .map((discount: Discount, index: number) => (
                        <p key={index} className="text-lg whitespace-pre-line">
                          -{discount.amount.toLocaleString()}원 (~{discount.date ? toKstDateTimeString(new Date(discount.date), 'M.d') : ''})
                        </p>
                    ))}
                    {lesson.discounts.map((discount: Discount, index: number) => (
                      <p key={index} className="text-lg whitespace-pre-line">
                        {(() => {
                          if (discount.type === "couple") {
                            return `-${discount.amount.toLocaleString()}원 (커플)`
                          } else if (discount.type === "gender") {
                            return `-${discount.amount.toLocaleString()}원 (${getGenderByGenreText(discount.condition || '', lesson.genre)})`
                          }
                        })()}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {lesson.discount_sub_texts && lesson.discount_sub_texts.length > 0 && (
              <div>
                <div className="flex items-start">
                  <h2 className="text-xl font-semibold w-1/3 text-left"></h2>
                  <div className="w-2/3 text-right">
                    {lesson.discount_sub_texts.map((text: string, index: number) => (
                      <p key={index} className="text-lg">{text}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            </section>
          </CardContent>
        </Card>
        <Card className="py-3 mb-2">
          <CardContent>
            <section className="space-y-4">
            <div>
              <div className="flex items-start">
                <h2 className="text-xl font-semibold w-1/3 text-left flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                </h2>
                <div className="w-2/3 text-right">
                  <p className="text-lg">{getBankText(lesson.bank)}</p>
                  <p className="text-lg">{lesson.account_number}</p>
                  <p className="text-lg">{lesson.account_owner}</p>
                </div>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
      <Card className="py-3 mb-2" >
        <CardContent>
          <section className="space-y-4">
            {lesson.notices && lesson.notices.length > 0 && (
              <div>
                <div className="flex items-start">
                  <h2 className="text-xl font-semibold w-1/3 text-left flex items-center gap-2">
                    <Info className="h-5 w-5" />
                  </h2>
                  <div className="w-2/3 text-right">
                    {lesson.notices.map((notice: string, index: number) => (
                      <p key={index} className="text-lg">{notice}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
      <Card className="py-3 mb-2">
        <CardContent className="px-6">
          <section className="space-y-4">
            {lesson.contacts && lesson.contacts.length > 0 && (
              <div>
                {lesson.contacts.map((contact: Contact, index: number) => (
                  <div key={index} className="flex items-start">
                    {/* 아이콘 (왼쪽) */}
                    <div className="w-1/3 space-y-1">
                      <div className="flex items-center h-full">
                        <ContactTypeIcon type={contact.type} />
                      </div>
                    </div>

                    {/* 텍스트 (오른쪽) */}
                    <div className="w-2/3 space-y-1">
                      <div className="flex items-center h-full justify-end text-lg">
                        {contact.address} {contact.name && `| ${contact.name}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </CardContent>
      </Card>

      {/* 최하단 버튼 */}
      <div className="mt-2 flex justify-end space-x-2">
        <Button 
          onClick={handleSubmit}
          className="w-full"
          disabled={isSubmitting || !isJoinable}
        >
          {isSubmitting ? "신청 중..." : "신청하기"}
        </Button>
      </div>
    </>
  )
}