"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getLessonStatus } from "@/lib/utils"
import { useMemo } from "react"
import { LessonView } from "@/app/api/lessons/[lesson_no]/route"
import { Button } from "./ui/button"
import { MoreHorizontal } from "lucide-react"
// import { LessonStudents } from "@/components/lesson-students"
// import { NicknameDisplay } from "@/components/nickname-display"

type LessonListProps = {
  lessons: LessonView[];
  onRowClick: (lesson: LessonView) => void;
}

export const getLessonPostedColumns = (
  onClickLesson: (lesson: LessonView) => void,
  router: ReturnType<typeof useRouter>
): ColumnDef<LessonView>[] => [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{getLessonStatus(row.original).text}</div>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const lesson = row.original;
      return (
        <div
          className="capitalize cursor-pointer text-blue-600 hover:underline"
          onClick={() => onClickLesson(row.original)} // ✅ 괄호 수정
        >
          {lesson?.title}
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div>₩{(row.getValue("price") as number).toLocaleString()}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const lesson = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation() // ✅ row 클릭 이벤트 방지
                router.push(`/lesson/${lesson.no}/edit`)
              }}
            >
              수정
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem>View details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
]

export function LessonPostedList({ lessons, onRowClick }: LessonListProps) {
  const router = useRouter()
  
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  // const [dialogOpen, setDialogOpen] = React.useState(false)
  // const [selectedNoti, setSelectedNoti] = React.useState<NotiView | null>(null)

  const handleLessonClick = (lesson: LessonView) => {
    router.push(`/lesson/${lesson.no}`)
  }
  
  const columns = useMemo(() => getLessonPostedColumns(handleLessonClick, router), [])

  const table = useReactTable({
    data: lessons,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleRowClick = (lesson: LessonView) => {
    onRowClick(lesson)
  }

  return (
    <div>
      {lessons.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          개설한 수업이 없습니다.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder ? null : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => {
                  const lesson = row.original

                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => handleRowClick(lesson)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-center">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 🔔 Alert Dialog */}
          {/* <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>알림 상세</AlertDialogTitle>
                <AlertDialogDescription>
                  {selectedNoti?.text || 'No message.'}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>닫기</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog> */}
        </div>
      )}
    </div>
  )
}