'use client'

import { LessonView } from "@/app/api/lessons/[lesson_no]/route"
import { useRouter } from "next/navigation"

export function LessonImageList({ images }: { images: LessonView[] }) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((image) => (
        image.image_url && (
          <div key={image.no} className="relative aspect-auto">
            <img
              src={image.image_url}
              alt={`Lesson ${image.no}`}
              className="rounded-lg object-cover w-full h-full hover:opacity-75 transition-opacity cursor-pointer"
              onClick={() => router.push(`/lesson/${image.no}`)}
            />
          </div>
        )
      ))}
    </div>
  )
} 