import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check } from "lucide-react"
import { useState, useEffect } from "react"
import React from "react"
import { CouponView } from "@/app/api/coupons/route"
import { ProfileView } from "@/app/api/profiles/[profile_id]/route"
import { CouponTemplateView } from "@/app/api/coupons/templates/route"

interface CouponGrantDialogProps {
  dialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
  coupons: CouponView[]
  couponTargets: ProfileView[]
  onGrant: (selectedProfiles: ProfileView[], selectedCoupons: CouponView[]) => void
}

export function CouponGrantDialog(props : CouponGrantDialogProps) {

  const [couponTemplates, setCouponTemplates] = useState<CouponTemplateView[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")

  const [selectedCoupons, setSelectedCoupons] = useState<CouponView[]>([])
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileView[]>([])

  useEffect(() => {
    if (!props.dialogOpen) return
  
    // 중복 제거된 템플릿 설정
    const uniqueTemplatesMap = new Map<string, CouponTemplateView>()
    props.coupons?.forEach((coupon) => {
      if (!uniqueTemplatesMap.has(coupon.template)) {
        uniqueTemplatesMap.set(coupon.template, {
          template: coupon.template,
          name: coupon.name,
          lesson: coupon.lesson,
          amount: coupon.amount,
          created_at: coupon.created_at.toString(),
        })
      }
    })
    const templates = Array.from(uniqueTemplatesMap.values())
    setCouponTemplates(templates)
  
    // 초기 상태 설정
    if (props.coupons.length === 1) {
      const only = props.coupons[0]
      setSelectedTemplate(only.template)
      setSelectedCoupons([only])
    } else {
      setSelectedTemplate("")
      setSelectedCoupons([])
    }
  
    setSelectedProfiles([])
  }, [props.dialogOpen])
  
  useEffect(() => {
    if (selectedTemplate) {
      const filtered = props.coupons.filter((c) => c.template === selectedTemplate)
      setSelectedCoupons(filtered)
    }
  }, [selectedTemplate])

  return (
    <Dialog open={props.dialogOpen} onOpenChange={props.onDialogOpenChange}>
      <DialogContent className="gap-0 p-0 outline-none">
        <DialogHeader className="px-4 pb-4 pt-5">
          <DialogTitle>쿠폰 지급</DialogTitle>
          <DialogDescription>
            Please select a coupon and recipient.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4">
          <div className="flex gap-4">
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger aria-label="Coupon Templates">
                <SelectValue placeholder="Select Template" />
              </SelectTrigger>
              <SelectContent>
                {couponTemplates.map((template) => (
                  <SelectItem key={template.template} value={template.template}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* <Select value={selectedCouponId} onValueChange={setSelectedCouponId}>
              <SelectTrigger aria-label="Coupons">
                <SelectValue placeholder="Select Coupon" />
              </SelectTrigger>
              <SelectContent>
                {coupons.map((coupon) => (
                  <SelectItem key={coupon.id} value={coupon.id}>
                    {coupon.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
        </div>

        <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
          <CommandInput placeholder="Search user..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup className="p-2">
              {props.couponTargets.map((profile) => (
                <CommandItem
                  key={profile.id}
                  className="flex items-center px-2"
                  onSelect={() => {
                    if (selectedProfiles.includes(profile)) {
                      setSelectedProfiles(selectedProfiles.filter((p) => p.id !== profile.id))
                    } else {
                      setSelectedProfiles([...selectedProfiles, profile])
                    }
                  }}
                >
                  <Avatar>
                    <AvatarImage alt="Image" />
                    <AvatarFallback>{profile.nickname[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ml-2">
                    <p className="text-sm font-medium leading-none">
                      {profile.nickname}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.id}
                    </p>
                  </div>
                  {selectedProfiles.includes(profile) ? (
                    <Check className="ml-auto flex h-5 w-5 text-primary" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
          {selectedProfiles.length > 0 ? (
            <div className="flex -space-x-2 overflow-hidden">
              {selectedProfiles.map((profile) => (
                <Avatar
                  key={profile.id}
                  className="inline-block border-2 border-background"
                >
                  <AvatarImage />
                  <AvatarFallback>{profile.nickname[0]}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select users to add to this thread.
            </p>
          )}
          <Button
            disabled={
              selectedProfiles.length === 0 ||
              selectedCoupons.length === 0 ||
              selectedProfiles.length > selectedCoupons.length
            }
            onClick={() => props.onGrant(selectedProfiles, selectedCoupons)}
          >
            지급하기 ({selectedProfiles.length}/{selectedCoupons.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 