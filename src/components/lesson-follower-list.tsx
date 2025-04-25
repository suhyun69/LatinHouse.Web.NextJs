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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getPaymentStatusText } from "@/lib/utils"
import { useMemo, useState } from "react"
import { PaymentView } from "@/app/api/payments/route"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { CouponGrantDialog } from "./coupon-grant-dialog"
import { CouponView } from "@/app/api/coupons/route"
import { ProfileView } from "@/app/api/profiles/[profile_id]/route"
import { toast } from "sonner"
import { ProfileDisplay } from "./profile-display"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentSummary } from "./payment-summary"

export type LessonFollowerListProps = {
  payments: PaymentView[]
  approveLessonRequest: (payment: PaymentView) => void
  denyLessonRequest: (payment: PaymentView) => void
  approveCancellingRequest: (payment: PaymentView) => void
  fetchCouponsGrantable: () => Promise<CouponView[]> 
  handleGrant: (profile: ProfileView, coupon: CouponView) => void
}

export function LessonFollowerList({
  payments,
  approveLessonRequest,
  denyLessonRequest,
  approveCancellingRequest,
  fetchCouponsGrantable,
  handleGrant
}: LessonFollowerListProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const [couponsGrantable, setCouponsGrantable] = useState<CouponView[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const [selectedPayment, setSelectedPayment] = useState<PaymentView | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const columns = useMemo<ColumnDef<PaymentView>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <div>{getPaymentStatusText(row.original.status)}</div>,
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "nickname",
      header: "Nickname",
      cell: ({ row }) => <ProfileDisplay profile={row.original.follower} />,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const checkout = row.original.checkout
        const amount = checkout.lesson.price - checkout.discounts.reduce((acc, d) => acc + d.amount, 0)
        return <div>{amount.toLocaleString()}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original
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
                hidden={payment.status !== "requested"}
                onClick={() => approveLessonRequest(payment)}
              >
                신청 승인
              </DropdownMenuItem>
              <DropdownMenuItem
                hidden={payment.status !== "requested"}
                onClick={() => denyLessonRequest(payment)}
              >
                신청 거절
              </DropdownMenuItem>
              <DropdownMenuItem
                hidden={payment.status !== "cancelling"}
                onClick={() => approveCancellingRequest(payment)}
              >
                취소 승인
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setSelectedPayment(payment)
                  setDetailDialogOpen(true)
                }}
              >
                결제 상세 정보
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ], [approveLessonRequest, denyLessonRequest, approveCancellingRequest])

  const table = useReactTable({
    data: payments,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    autoResetPageIndex: false,
  })

  if (payments.length === 0) return null

  const couponTargets: ProfileView[] = table
    .getFilteredSelectedRowModel()
    .rows
    .map((row) => row.original.follower)

  async function handleGrants(selectedProfiles: ProfileView[], selectedCoupons: CouponView[]) {
    const results = await Promise.all(
      selectedProfiles.map((profile, index) => {
        const coupon = selectedCoupons[index]
        if (!coupon) return Promise.resolve(false)
        return handleGrant(profile, coupon)
      })
    )

    const successCount = results.filter((result) => result).length

    if (successCount === selectedProfiles.length) {
      toast.success("쿠폰이 성공적으로 지급되었습니다.")
    } else if (successCount === 0) {
      toast.error("쿠폰 지급에 실패했습니다.")
    } else {
      toast.warning(`${successCount}개의 쿠폰이 성공적으로 지급되었습니다.`)
    }

    setDialogOpen(false)
  }

  return (
    <>
      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-center">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-center">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            size="sm"
            onClick={async () => {
              const coupons = await fetchCouponsGrantable()
              setCouponsGrantable(coupons)
              setDialogOpen(true)
            }}
            disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          >
            쿠폰 지급
          </Button>
        </div>
      </div>

      <CouponGrantDialog
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen}
        coupons={couponsGrantable}
        couponTargets={couponTargets}
        onGrant={handleGrants}
      />

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent
          className="w-full max-w-sm"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">결제 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedPayment ? (
            <PaymentSummary payment={selectedPayment} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">로딩 중...</p>
          )}
        </DialogContent>
      </Dialog>

    </>
  )
}
