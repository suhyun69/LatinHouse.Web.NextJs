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
import { toast } from "sonner"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { getCouponStatusInfo } from "@/lib/utils"
import { useState } from "react"
import { CouponView } from "@/app/api/coupons/route"
import { ProfileView } from "@/app/api/profiles/[profile_id]/route"
import { CouponGrantDialog } from "./coupon-grant-dialog"
import { MoreHorizontal } from "lucide-react"
import { ProfileDisplay } from "./profile-display"

type CouponIssuedListProps = {
  coupons: CouponView[];
  couponTargets: ProfileView[];
  handleGrant: (selectedCoupon: CouponView, selectedProfile: ProfileView) => Promise<boolean>;
}

export const getCouponIssuedColumns = (
  onGrantClick: (coupon: CouponView) => void
): ColumnDef<CouponView>[] => [
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
    cell: ({ row }) => (
      <div className="capitalize">{getCouponStatusInfo(row.getValue("status")).text}</div>
    ),
  },
  {
    accessorKey: "id",
    header: "Coupon ID",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("id")}</div>
    )
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => {
      const owner = row.getValue("owner") as ProfileView | undefined
      return owner ? (
        <ProfileDisplay profile={owner} />
      ) : (
        ""
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const coupon = row.original
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
              hidden={coupon.status !== 'grantable'}
              onClick={() => onGrantClick(coupon)}
            >
              쿠폰 지급
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function CouponIssuedList({ coupons, couponTargets, handleGrant }: CouponIssuedListProps) {

  const [dialogOpen, setDialogOpen] = useState(false)
  
  const [selectedCoupon, setSelectedCoupon] = useState<CouponView | null>(null)

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const handleGrantClick = (coupon: CouponView) => {
    setDialogOpen(true)
    setSelectedCoupon(coupon)
  }

  const columns = React.useMemo(() => getCouponIssuedColumns(handleGrantClick), [])  
  const table = useReactTable({
    data: coupons,
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

  async function handleGrants(selectedProfiles: ProfileView[], selectedCoupons: CouponView[]) {
    const results = await Promise.all(
      selectedProfiles.map((profile, index) => {
        const coupon = selectedCoupons[index]
        if (!coupon) return Promise.resolve(false) // 쿠폰이 부족한 경우 방어
  
        return handleGrant(coupon, profile)
      })
    )
  
    const successCount = results.filter((result) => result).length
  
    if (successCount === selectedProfiles.length) {
      toast.success('쿠폰이 성공적으로 지급되었습니다.')
    } else if (successCount === 0) {
      toast.error('쿠폰 지급에 실패했습니다.')
    } else {
      toast.warning(`${successCount}개의 쿠폰이 성공적으로 지급되었습니다.`)
    }
  
    setDialogOpen(false)
  }
  

  return (
    <div>
      {coupons.length === 0 ? (
          // <div className="text-center py-8 text-muted-foreground">
          //   발행한 쿠폰이 없습니다.
          // </div>
          null
        ) : (
          <div className="rounded-md border mt-4">
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
                  return (
                    <TableRow
                      key={row.id}
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
          </div>
      )}

      <CouponGrantDialog 
        dialogOpen={dialogOpen}
        onDialogOpenChange={setDialogOpen} 
        coupons={selectedCoupon ? [selectedCoupon] : []}
        couponTargets={couponTargets}
        onGrant={handleGrants}
      />
    </div>
  )
}
