"use client"

import { Badge } from "@/components/ui/badge"
import { LessonView } from "@/app/api/lessons/[lesson_no]/route"

const genreLabels: Record<string, string> = {
  S: "#살사",
  B: "#바차타",
}
const regionLabels: Record<string, string> = {
  GN: "#강남",
  HD: "#홍대",
}

interface Props {
  images: LessonView[]
  selected: string
  onSelect: (value: string) => void
}

export function LessonBadgeList({ images, selected, onSelect }: Props) {
  const genreSet = new Set(images.map((l) => l.genre).filter((g) => genreLabels[g]))
  const regionSet = new Set(images.map((l) => l.region).filter((r) => regionLabels[r]))

  return (
    <div className="mb-4 flex gap-2 flex-wrap">
      <Badge
        variant={selected === "" ? "default" : "outline"}
        onClick={() => onSelect("")}
        className="cursor-pointer text-sm px-2 py-1"
      >
        #전체
      </Badge>

      {[...genreSet].map((g) => (
        <Badge
          key={g}
          variant={selected === g ? "default" : "outline"}
          onClick={() => onSelect(selected === g ? "" : g)}
          className="cursor-pointer text-sm px-2 py-1"
        >
          {genreLabels[g]}
        </Badge>
      ))}

      {[...regionSet].map((r) => (
        <Badge
          key={r}
          variant={selected === r ? "default" : "outline"}
          onClick={() => onSelect(selected === r ? "" : r)}
          className="cursor-pointer text-sm px-2 py-1"
        >
          {regionLabels[r]}
        </Badge>
      ))}
    </div>
  )
}
