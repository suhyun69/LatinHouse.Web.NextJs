"use client"

import { useState } from "react"
import * as React from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn, toKstDateTimeString, isEmpty, isValidNonNegativeNumber, isValidTimeFormat, getGenderTextByGenre, getDiscountText, validateInstructors } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { Calendar as CalendarIcon, Plus, CornerDownLeft } from "lucide-react"
import { X } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { ProfileView } from "@/app/types/profiles"
import { Discount, LessonRequest, LessonView } from "@/app/types/lessons"
import { ContactTypeIcon } from "./ContactTypeIcon"
import { useSession } from "./SessionProvider"

interface LessonFormProps {
  lesson: LessonView | null
  // loginProfile: LoginProfile | null
  friends: ProfileView[] | null
  onSubmit: (data: LessonRequest) => Promise<void>
  onUploadImage: (file: File, fileName: string) => Promise<string>
}

export function LessonForm({ lesson, friends, onSubmit, onUploadImage }: LessonFormProps) {
  const { loginProfile } = useSession()

  const [isSubmitting, setIsSubmitting] = useState(false)


  const [no, setNo] = React.useState(lesson?.no?.toString() || "")
  const [imageUrl, setImageUrl] = useState(lesson?.image_url || "")
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = React.useState(lesson?.title || "")
  const [genre, setGenre] = React.useState(lesson?.genre || "")
  const [instructor_lo, setInstructor_lo] = React.useState(lesson?.instructor_lo?.id || undefined)
  const [instructor_la, setInstructor_la] = React.useState(lesson?.instructor_la?.id || undefined)
  const [startDate, setStartDate] = React.useState<string>(toKstDateTimeString(lesson?.start_date_time))
  const [isStartDateOpen, setIsStartDateOpen] = React.useState(false)
  const [endDate, setEndDate] = React.useState<string>(toKstDateTimeString(lesson?.end_date_time))
  const [isEndDateOpen, setIsEndDateOpen] = React.useState(false)
  const [startTime, setStartTime] = React.useState<string>(toKstDateTimeString(lesson?.start_date_time, 'HH:mm'))
  const [endTime, setEndTime] = React.useState<string>(toKstDateTimeString(lesson?.end_date_time, 'HH:mm'))
  const [dateTimeSubTexts, setDateTimeSubTexts] = React.useState(lesson?.datetime_sub_texts || [])
  const [dateTimeSubTextInput, setDateTimeSubTextInput] = React.useState("")
  const dateTimeSubTextInputLength = dateTimeSubTextInput.trim().length
  const [region, setRegion] = React.useState(lesson?.region || "")
  const [place, setPlace] = React.useState(lesson?.place || "")
  const [placeUrl, setPlaceUrl] = React.useState(lesson?.place_url || "")
  const [price, setPrice] = React.useState(lesson?.price || "")
  const [discountType, setDiscountType] = useState("")
  const [discountCondition, setDiscountCondition] = useState("")
  const [discountDate, setDiscountDate] = useState<Date>()
  const [discountAmount, setDiscountAmount] = useState("")
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(lesson?.max_discount_amount || "")
  const [discounts, setDiscounts] = useState<Discount[]>(lesson?.discounts || [])
  const [discountSubTextInput, setDiscountSubTextInput] = useState("")
  const [discountSubTexts, setDiscountSubTexts] = useState(lesson?.discount_sub_texts || [])
  const discountSubTextInputLength = discountSubTextInput.trim().length
  const [bank, setBank] = useState(lesson?.bank || "")
  const [accountNumber, setAccountNumber] = useState(lesson?.account_number || "")
  const [accountOwner, setAccountOwner] = useState(lesson?.account_owner || "")
  const [contacts, setContacts] = useState(lesson?.contacts || [])
  const [contactType, setContactType] = useState("")
  const [contactAddress, setContactAddress] = useState("")
  const [contactName, setContactName] = useState("")
  const [notices, setNotices] = useState<string[]>(lesson?.notices || [])
  const [noticeInput, setNoticeInput] = useState("")
  const [isActive, setIsActive] = useState<boolean>(lesson?.is_active ?? true)
  const [isAutoAccept, setIsAutoAccept] = useState<boolean>(lesson?.is_auto_accept ?? true)
  const [isRefundableInPeriod, setIsRefundableInPeriod] = useState<boolean>(lesson?.is_refundable_in_period ?? false)

  // useEffect를 사용하여 lesson prop이 변경될 때마다 상태 업데이트
  React.useEffect(() => {
    if (lesson) {
      setNo(lesson.no?.toString() || "")
      setImageUrl(lesson.image_url || "")
      setTitle(lesson.title || "")
      setGenre(lesson.genre || "")
      setInstructor_lo(lesson.instructor_lo?.id || "")
      setInstructor_la(lesson.instructor_la?.id || "")
      setStartDate(toKstDateTimeString(lesson.start_date_time))
      setIsStartDateOpen(false)
      setEndDate(toKstDateTimeString(lesson.end_date_time))
      setIsEndDateOpen(false)
      setStartTime(toKstDateTimeString(lesson.start_date_time, 'HH:mm'))
      setEndTime(toKstDateTimeString(lesson.end_date_time, 'HH:mm'))
      setDateTimeSubTexts(lesson.datetime_sub_texts || [])
      setRegion(lesson.region || "")
      setPlace(lesson.place || "")
      setPlaceUrl(lesson.place_url || "")
      setPrice(lesson.price || "")
      setDiscounts(lesson.discounts || [])
      setMaxDiscountAmount(lesson.max_discount_amount || "")
      setDiscountSubTexts(lesson.discount_sub_texts || [])
      setBank(lesson.bank || "")
      setAccountNumber(lesson.account_number || "")
      setAccountOwner(lesson.account_owner || "")
      setContacts(lesson.contacts || [])
      setNotices(lesson.notices || [])
      setIsActive(lesson.is_active ?? true)
      setIsAutoAccept(lesson.is_auto_accept ?? true)
      setIsRefundableInPeriod(lesson.is_refundable_in_period ?? false)
    }
  }, [lesson])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // start of validation
    
    // 필드 정의
    const requiredFields = [
      { name: "title", value: title, message: "수업명을 입력해주세요." },
      { name: "genre", value: genre, message: "장르를 선택해주세요." },
      { name: "start_date", value: startDate, message: "시작일을 선택해주세요." },
      { name: "end_date", value: endDate, message: "종료일을 선택해주세요." },
      { name: "start_time", value: startTime, message: "시작시간을 입력해주세요." },
      { name: "end_time", value: endTime, message: "종료시간을 입력해주세요." },
      { name: "region", value: region, message: "지역을 선택해주세요." },
      { name: "place", value: place, message: "장소를 입력해주세요." },
      { name: "price", value: price, message: "가격을 입력해주세요." },
      { name: "bank", value: bank, message: "은행을 입력해주세요." },
      { name: "account_number", value: accountNumber, message: "계좌번호를 입력해주세요." },
      { name: "account_owner", value: accountOwner, message: "예금주를 입력해주세요." },
    ]

    const nonNegativeFields = [
      { name: "price", value: price, message: "가격은 0 이상 숫자여야 합니다." },
      { name: "discount_amount", value: discountAmount, message: "할인 금액은 0 이상 숫자여야 합니다." },
      { name: "max_discount_amount", value: maxDiscountAmount, message: "최대 할인 금액은 0 이상이어야 합니다." },
    ]

    const timeFields = [
      { name: "startTime", value: startTime, message: "시작 시간 형식이 올바르지 않습니다." },
      { name: "endTime", value: endTime, message: "종료 시간 형식이 올바르지 않습니다." },
    ]

    // 검증 함수
    function validateFields(
      fields: { name: string; value: unknown; message: string }[],
      validateFn: (v: unknown) => boolean
    ): boolean {
      for (const field of fields) {
        if (!validateFn(field.value)) {
          toast.error(field.message)
          setIsSubmitting(false)
          return false
        }
      }
      return true
    }

    // 전체 검증 실행
    const isValid = validateFields(requiredFields, (v) => !isEmpty(v)) &&
      validateFields(nonNegativeFields, isValidNonNegativeNumber) &&
      validateFields(timeFields, isValidTimeFormat)

    if (!isValid) return

    // 강사 검증
    if (!validateInstructors(instructor_lo, instructor_la)) {
      toast.error("최소 한 명의 강사를 선택해주세요.")
      setIsSubmitting(false)
      return
    }

    // end of validation

    const lessonRequest: LessonRequest = {
      image_url: imageUrl,
      title: title,
      genre: genre,
      instructor_lo: instructor_lo,
      instructor_la: instructor_la,
      start_date_time: `${startDate}T${startTime}:00+09:00`,
      end_date_time: `${endDate}T${endTime}:00+09:00`,
      datetime_sub_texts: dateTimeSubTexts,
      region: region,
      place: place,
      place_url: placeUrl,
      price: Number(price),
      discounts: discounts,
      max_discount_amount: Number(maxDiscountAmount),
      discount_sub_texts: discountSubTexts,
      bank: bank,
      account_number: accountNumber,
      account_owner: accountOwner,
      contacts: contacts,
      notices: notices,
      is_active: isActive,
      is_auto_accept: isAutoAccept,
      is_refundable_in_period: isRefundableInPeriod
    }

    try {
      await onSubmit(lessonRequest)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '수업 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('이미지를 선택해주세요.')
      }
  
      const file = event.target.files[0]
  
      // ✅ 확장자 체크
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('지원하지 않는 이미지 형식입니다. (jpg, png, webp만 가능)')
        return
      }
  
      // ✅ 사이즈 체크 (2MB 제한)
      const maxSize = 2 * 1024 * 1024 // 2MB
      if (file.size > maxSize) {
        toast.error('이미지 파일 크기는 최대 2MB까지 가능합니다.')
        return
      }
  
      setUploading(true)
      const uploadedUrl = await onUploadImage(file, file.name)
      if (uploadedUrl) setImageUrl(uploadedUrl)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }  

  const handleAddDateTimeSubText = () => {
    if (dateTimeSubTextInput.trim()) {
      setDateTimeSubTexts([...dateTimeSubTexts, dateTimeSubTextInput.trim()])
      setDateTimeSubTextInput("")  // 입력 필드 초기화
    }
  }

  const handleDeleteDateTimeSubText = (index: number) => {
    setDateTimeSubTexts(dateTimeSubTexts.filter((_, i) => i !== index))
  }

  const handleAddDiscount = () => {
    const amount = parseInt(discountAmount)
    if (!discountType || !amount) return

    const newDiscount = {
      type: discountType,
      condition: discountType === "gender" ? discountCondition : undefined,
      date: discountType === "earlybird" && discountDate ? format(discountDate, "yyyy-MM-dd") : undefined,
      amount
    }

    setDiscounts([...discounts, newDiscount])

    // 입력 필드 초기화
    setDiscountType("")
    setDiscountCondition("")
    setDiscountDate(undefined)
    setDiscountAmount("")
  }

  const handleDeleteDiscount = (index: number) => {
    setDiscounts(discounts.filter((_, i) => i !== index))
  }

  const renderDiscountConditions = () => {
    if (discountType === "earlybird") {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !discountDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {discountDate ? format(discountDate, "yyyy-MM-dd") : "마감일 선택"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={discountDate}
              onSelect={(date) => {
                setDiscountDate(date)
                // Popover 닫기
                const closeEvent = new KeyboardEvent('keydown', { key: 'Escape' })
                document.dispatchEvent(closeEvent)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )
    }
    
    if (discountType === "gender") {
      return (
        <Select value={discountCondition} onValueChange={setDiscountCondition}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="로/라 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">{getGenderTextByGenre("M", genre)}</SelectItem>
            <SelectItem value="Female">{getGenderTextByGenre("F", genre)}</SelectItem>
          </SelectContent>
        </Select>
      )
    }
  }

  const handleAddDiscountsSubText = () => {
    if (discountSubTextInput.trim()) {
      setDiscountSubTexts([...discountSubTexts, discountSubTextInput.trim()])
      setDiscountSubTextInput("")
    }
  }

  const handleAddContact = () => {
    if (!contactType || !contactAddress) return

    const newContact = {
      type: contactType,
      address: contactAddress,
      name: contactName || undefined
    }

    setContacts([...contacts, newContact])

    // 입력 필드 초기화
    setContactType("")
    setContactAddress("")
    setContactName("")
  }

  const handleDeleteContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const handleAddNotice = () => {
    if (!noticeInput.trim()) return

    setNotices([...notices, noticeInput.trim()])
    setNoticeInput("")
  }

  const handleDeleteNotice = (index: number) => {
    setNotices(notices.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor={`no`}>Lesson No</Label>
            <Input 
              className="bg-muted" 
              id={`no`} 
              value={no}
              placeholder="" 
              disabled
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">이미지</Label>
            <div className="flex flex-col gap-4">
              {imageUrl && (
                <div className="relative w-full aspect-video">
                  <img
                    src={imageUrl}
                    alt="Lesson image"
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              )}
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`genre`}>Genre</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger id={`genre`} aria-label="Genre" className="w-1/2">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Salsa</SelectItem>
                  <SelectItem value="B">Bachata</SelectItem>
                  {/* <SelectItem value="K">Kizomba</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`title`}>Title</Label>
            <Input 
              id={`title`} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="수업명을 입력하세요." 
            />
          </div>
          <div className="grid gap-4 grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`instructor_lo`}>Instructor Lo</Label>
              <Select value={instructor_lo} onValueChange={setInstructor_lo}>
                <SelectTrigger id={`instructor_lo`} aria-label="Instructor_lo" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {loginProfile?.is_instructor && loginProfile?.gender === "M" && (
                    <SelectItem key={loginProfile.id} value={loginProfile?.id ?? ""}>
                      {loginProfile.nickname}
                    </SelectItem>
                  )}
                  {friends?.
                    filter((friend) => friend.gender === "M" && friend.is_instructor).
                    map((friend) => (
                      <SelectItem key={friend.id} value={friend.id ?? ""}>
                        {friend.nickname}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`instructor_la`}>Instructor La</Label>
              <Select value={instructor_la} onValueChange={setInstructor_la}>
                <SelectTrigger id={`instructor_la`} aria-label="Instructor_la" className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {loginProfile?.is_instructor && loginProfile?.gender === "F" && (
                    <SelectItem key={loginProfile.id} value={loginProfile?.id ?? ""}>
                      {loginProfile.nickname}
                    </SelectItem>
                  )}
                  {friends?.
                    filter((friend) => friend.gender === "F" && friend.is_instructor).
                    map((friend) => (
                      <SelectItem key={friend.id} value={friend.id ?? ""}>
                        {friend.nickname}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Time Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="start_date" className="text-sm">시작일</Label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy-MM-dd") : "날짜를 선택하세요"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={(date) => {
                      setStartDate(date ? format(date, 'yyyy-MM-dd') : "");
                      setIsStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date" className="text-sm">종료일</Label>
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy-MM-dd") : "날짜를 선택하세요"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={(date) => {
                      setEndDate(date ? format(date, 'yyyy-MM-dd') : "");
                      setIsEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor={`start_time`}>시작 시간</Label>
              <Input 
                id={`start_time`} 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="HH:mm" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`end_time`}>종료 시간</Label>
              <Input 
                id={`end_time`} 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="HH:mm" 
              />
            </div>
          </div>

          {dateTimeSubTexts.length > 0 && (
            <div className="space-y-4 flex flex-col items-end">
              {dateTimeSubTexts.map((text, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex w-max max-w-[75%] items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    "bg-muted"
                  )}
                >
                  <>
                    {text}
                    <div className="ml-2 flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleDeleteDateTimeSubText(index)}
                      >
                        <X className="h-4 w-4 text-black" />
                      </Button>
                    </div>
                  </>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              id="dateTimeSubTextInput"
              placeholder="시간 관련 추가정보를 입력하세요."
              className="flex-1"
              autoComplete="off"
              value={dateTimeSubTextInput}
              onChange={(event) => setDateTimeSubTextInput(event.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={dateTimeSubTextInputLength === 0}
              onClick={handleAddDateTimeSubText}
            >
              <Plus />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`region`}>Region</Label>
              <Select value={region} onValueChange={setRegion} >
                <SelectTrigger id={`region`} aria-label="Region" className="w-1/2">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HD">홍대</SelectItem>
                  <SelectItem value="GN">강남</SelectItem>
                  <SelectItem value="AP">압구정</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`place`}>Place</Label>
            <Input 
              id={`place`} 
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="장소를 입력하세요." 
            />
            <Input 
              id={`place_url`} 
              value={placeUrl}
              onChange={(e) => setPlaceUrl(e.target.value)}
              placeholder="Url을 입력하세요." 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`price`}>Price</Label>
              <Input 
                id={`price`} 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="금액을 입력하세요." 
                type="text"
              />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Discount</Label>
              {discounts.length > 0 && (
                <div className="space-y-2">
                  {discounts.map((discount, index) => (
                    <div 
                      key={index} 
                      className="group relative flex items-center justify-between rounded-lg border p-3 bg-muted"
                    >
                      <div className="flex items-center space-x-2 text-sm">
                        <span>
                          {getDiscountText(discount, genre)}
                        </span>
                        <span>|</span>
                        {discount.type === "earlybird" && discount.condition && (
                          <>
                            <span>{format(new Date(discount.condition), "yyyy-MM-dd")}</span>
                            <span>|</span>
                          </>
                        )}
                        <span>
                          {new Intl.NumberFormat('ko-KR').format(-discount.amount)}원
                        </span>
                      </div>

                      <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDeleteDiscount(index)}
                          >
                            <X className="h-4 w-4 text-black" />
                          </Button>
                        </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* 입력 영역 */}
              <div className="space-y-2">
                <div className="flex gap-4">
                  <Select value={discountType} onValueChange={(value) => {
                    setDiscountType(value);
                    setDiscountCondition("");
                    setDiscountDate(undefined);
                  }}>
                    <SelectTrigger id="discount_type" className="w-1/2">
                      <SelectValue placeholder="할인 타입 선택" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="earlybird">얼리버드</SelectItem>
                      <SelectItem value="gender">성별 할인</SelectItem>
                      {/* <SelectItem value="couple">커플 할인</SelectItem> */}
                    </SelectContent>
                  </Select>

                  {/* 할인 조건 */}
                  {discountType && (
                    <div className="w-1/2">
                      {renderDiscountConditions()}
                    </div>
                  )}
                </div>

                {/* 할인 금액 입력 및 버튼 */}
                <div className="flex gap-2">
                  <Input 
                    id="discount_amount" 
                    placeholder="할인 금액을 입력하세요" 
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddDiscount();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddDiscount}
                    className="shrink-0"
                  >
                    <CornerDownLeft className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor={`maxDiscountAmount`}>최대 할인 금액</Label>
            <Input 
              id={`maxDiscountAmount`} 
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
              placeholder="최대 할인 금액을 입력하세요." 
              type="text"
            />
          </div>

          {/* discountSubTexts 표시 영역 */}
          {discountSubTexts.length > 0 && (
            <div className="space-y-4 flex flex-col items-end">
              {discountSubTexts.map((text, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex w-max max-w-[75%] items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    "bg-muted"
                  )}
                >
                  <>
                    {text}
                    <div className="ml-2 flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => {
                            const newTexts = [...discountSubTexts]
                            newTexts.splice(index, 1)
                            setDiscountSubTexts(newTexts)
                          }}
                        >
                          <X className="h-4 w-4 text-black" />
                        </Button>
                      </div>
                  </>
                </div>
              ))}
            </div>
          )}

          {/* 입력 영역 */}
          <div className="flex gap-2">
            <Input
              id="discountSubTextInput"
              placeholder="할인 관련 추가정보를 입력하세요."
              className="flex-1"
              autoComplete="off"
              value={discountSubTextInput}
              onChange={(event) => setDiscountSubTextInput(event.target.value)}
            />
            <Button 
              type="button"
              size="icon" 
              disabled={discountSubTextInputLength === 0}
              onClick={handleAddDiscountsSubText}
            >
              <Plus />
              <span className="sr-only">Add</span>
            </Button>
          </div>

          {/* Account 영역 추가 */}
          <div className="space-y-4">
            <div className="grid gap-2">
            
              <Label>Account</Label>
              <div className="flex flex-col space-y-1.5">
                <div className="flex gap-4">
                  <Select value={bank} onValueChange={setBank}>
                    <SelectTrigger id="bank" className="w-1/2">
                      <SelectValue placeholder="은행을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="sh">신한</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    id="account_owner" 
                    value={accountOwner}
                    onChange={(e) => setAccountOwner(e.target.value)}
                    placeholder="계좌주를 입력하세요"
                    className="w-1/2"
                  />
                </div>
                <Input 
                  id="account" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="계좌번호를 입력하세요" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Info</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-4">
            {/* Notice 영역 */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Notice</Label>
                {notices.length > 0 && (
                  <div className="space-y-2">
                    {notices.map((notice, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between rounded-lg border p-3 bg-muted"
                      >
                        <div className="text-sm break-words">
                          {notice}
                        </div>

                        <div className="flex gap-1 ml-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => handleDeleteNotice(index)}
                          >
                            <X className="h-4 w-4 text-black" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 입력 영역 */}
                <div className="flex gap-2">
                  <Input 
                    id="notice_content" 
                    placeholder="공지사항을 입력하세요" 
                    value={noticeInput}
                    onChange={(e) => setNoticeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddNotice()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddNotice}
                    className="shrink-0"
                  >
                    <CornerDownLeft className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Contact</Label>
              {contacts.length > 0 && (
                <div className="space-y-2">
                  {contacts.map((contact, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between rounded-lg border p-3 bg-muted"
                    >
                      <div className="text-sm">
                        <div className="flex items-center space-x-2 text-sm">
                          <ContactTypeIcon type={contact.type} />
                          <span>{contact.address}</span>
                          {contact.name && (
                            <>
                              <span>|</span>
                              <span>{contact.name}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => handleDeleteContact(index)}
                        >
                          <X className="h-4 w-4 text-black" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 입력 영역 */}
              <div className="space-y-2">
                <div className="flex gap-4">
                  <Select value={contactType} onValueChange={setContactType}>
                    <SelectTrigger id="contact_type" className="w-1/2">
                      <SelectValue placeholder="연락처 타입 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">전화</SelectItem>
                      <SelectItem value="kakaotalk">카카오톡</SelectItem>
                      <SelectItem value="instagram">인스타그램</SelectItem>
                      <SelectItem value="cafe">카페</SelectItem>
                      <SelectItem value="youtube">유튜브</SelectItem>
                      <SelectItem value="web">웹사이트</SelectItem>
                    </SelectContent>
                  </Select>

                  {(contactType === "phone" || contactType === "kakaotalk") && (
                    <Input 
                      id="contact_name" 
                      placeholder="이름을 입력하세요" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-1/2"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Input 
                    id="contact_address" 
                    placeholder="연락처를 입력하세요" 
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAddContact()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleAddContact}
                    className="shrink-0 bg-black hover:bg-black/90"
                    size="icon"
                  >
                    <CornerDownLeft className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          {/* <CardDescription>Manage your cookie settings here.</CardDescription> */}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between space-x-4">
            <Label htmlFor="{`iaActive`}" className="flex flex-col space-y-1">
              <span className="text-left">수업 활성화</span>
            </Label>
            <Switch id="is_active" defaultChecked={!lesson} checked={isActive} aria-label="isDisplay" onCheckedChange={setIsActive}/>
          </div>
          {/* <div className="flex items-center justify-between space-x-4">
            <Label htmlFor="{`isAutoAccept`}" className="flex flex-col space-y-1">
              <span className="text-left">수업 신청 자동 수락</span>
            </Label>
            <Switch id="is_auto_accept" defaultChecked={!lesson} checked={isAutoAccept} aria-label="isAutoAccept" onCheckedChange={setIsAutoAccept}/>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <Label htmlFor="{`isRefundableInPeriod`}" className="flex flex-col space-y-1">
              <span className="text-left">개강 후 환불 가능</span>
            </Label>
            <Switch id="is_refundable_in_period" defaultChecked={false} checked={isRefundableInPeriod} aria-label="isRefundableInPeriod" onCheckedChange={setIsRefundableInPeriod}/>
          </div> */}
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "저장 중..." : (lesson ? "수정" : "생성")}
      </Button>
    </form>
  )
}