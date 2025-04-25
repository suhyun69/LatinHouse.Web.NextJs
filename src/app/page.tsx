"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { LessonView } from "./api/lessons/[lesson_no]/route"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Castle, CircleHelp, Footprints, Martini } from "lucide-react"
import { LessonImageList } from "@/components/lesson-image-list"
import { LessonBadgeList } from "@/components/lesson-badge-list"

export default function Home() {
  const router = useRouter()
  const [images, setImages] = useState<LessonView[]>([])
  const [selectedBadge, setSelectedBadge] = useState<string>("")

  useEffect(() => {
    const fetchLessonImages = async () => {
      try {
        const response = await fetch(`/api/lessons`)
        const result = await response.json()
        if (!response.ok) {
          toast.error(result?.message || "수업을 조회하는데 실패했습니다.")
          return
        }
        
        const activeLessons = result.data.filter((lesson: LessonView) => lesson.is_active)
        setImages(activeLessons)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "오류가 발생했습니다.")
      }
    }

    fetchLessonImages()
  }, [])

  const filteredImages = selectedBadge
    ? images.filter(
        (img) => img.genre === selectedBadge || img.region === selectedBadge
      )
    : images

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="max-w-2xl w-full">
          <LessonBadgeList
            images={images}
            selected={selectedBadge}
            onSelect={setSelectedBadge}
          />
          <LessonImageList images={filteredImages} />
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-white px-6 py-3 rounded-full shadow-lg">
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full" onClick={() => router.push('/')}>
          <Footprints className="size-6" />
        </Button>
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
          <Castle className="size-6 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
          <Martini className="size-6 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full">
          <CircleHelp className="size-6 text-muted-foreground" />
        </Button>
      </div>
    </>
  )
}
