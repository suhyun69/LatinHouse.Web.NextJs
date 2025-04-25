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
import { useMemo } from "react"
import { CouponTemplateView } from "@/app/api/coupons/templates/route"
import { LessonView } from "@/app/api/lessons/[lesson_no]/route"

type CouponFormListProps = {
  templates: CouponTemplateView[];
  onRowClick: (template: CouponTemplateView) => void;
}

export const getCouponTemplateIssuedColumns = (
  onClickLesson: (lesson: LessonView) => void
): ColumnDef<CouponTemplateView>[] => [
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
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "lesson",
    header: "Target Lesson",
    cell: ({ row }) => {
      const lesson = row.getValue("lesson") as LessonView | undefined
      return (
        <div
          className="capitalize cursor-pointer text-blue-600 hover:underline"
          onClick={() => lesson && onClickLesson(lesson)} // ✅ 괄호 수정
        >
          {lesson?.title}
        </div>
      )
    },
  },
  {
    accessorKey: "amount",
    header: "Discount",
    cell: ({ row }) => (
      <div>₩{(row.getValue("amount") as number).toLocaleString()}</div>
    )
  },
  // {
  //   id: "actions",
  //   enableHiding: false,
  //   cell: ({ row }) => {
  //     const lesson = row.original
  //     const router = useRouter() // ✅ 여기서 정의
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //           <DropdownMenuItem
  //             onClick={(e) => {
  //               e.stopPropagation() // ✅ row 클릭 이벤트 방지
  //               // router.push(`/lesson/${lesson.no}`)
  //             }}
  //           >
  //             상세보기
  //           </DropdownMenuItem>
  //           {/* <DropdownMenuSeparator />
  //           <DropdownMenuItem>View details</DropdownMenuItem> */}
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     )
  //   },
  // }
]

export function CouponTemplateIssuedList({ templates, onRowClick }: CouponFormListProps) {
  const router = useRouter()

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const handleLessonClick = (lesson: LessonView) => {
    router.push(`/lesson/${lesson.no}`)
  }
  
  const columns = useMemo(() => getCouponTemplateIssuedColumns(handleLessonClick), [])

  const table = useReactTable({
    data: templates,
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

  const handleRowClick = async (template: CouponTemplateView) => {
    onRowClick(template);
  }

  return (
    <div>
      {templates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            발행한 쿠폰이 없습니다.
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
                {table.getRowModel().rows.map((row) => {
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
                })}
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

      {/* {selectedLessonNo && (
        <LessonStudents lessonNo={selectedLessonNo} />
      )} */}
    </div>
  )
}