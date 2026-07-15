"use client"

import * as React from "react"
import {
    ColumnDef,
    Row,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getPaginationRowModel,
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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    /** Renders an inline expanded panel below a row (e.g. a patient's medical files). */
    renderSubComponent?: (row: Row<TData>) => React.ReactNode
    /** Controls whether an individual row is allowed to expand. Defaults to "always" when renderSubComponent is set. */
    getRowCanExpand?: (row: Row<TData>) => boolean
    emptyMessage?: string
}

// Generic, reusable shadcn-style DataTable.
// Usage: <DataTable columns={columns} data={data} />
export function DataTable<TData, TValue>({
    columns,
    data,
    renderSubComponent,
    getRowCanExpand,
    emptyMessage = "لا توجد بيانات لعرضها",
}: DataTableProps<TData, TValue>) {
    const [expanded, setExpanded] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        state: { expanded },
        onExpandedChange: setExpanded,
        getRowCanExpand: getRowCanExpand ?? (() => !!renderSubComponent),
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="space-y-3" dir="rtl">
            <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-[#1A6B5A]/5 hover:bg-[#1A6B5A]/5">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-right font-bold text-[#1A6B5A] text-xs p-3">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow className="hover:bg-[#2DBFA0]/5 transition-colors text-xs">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="p-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && renderSubComponent && (
                                        <TableRow className="hover:bg-transparent">
                                            <TableCell colSpan={row.getVisibleCells().length} className="bg-gray-50/60 p-0 border-t-0">
                                                {renderSubComponent(row)}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground text-xs">
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-muted-foreground">
                    الصفحة {table.getState().pagination.pageIndex + 1} من {Math.max(table.getPageCount(), 1)}
                </span>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        السابق
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        التالي
                    </Button>
                </div>
            </div>
        </div>
    )
}