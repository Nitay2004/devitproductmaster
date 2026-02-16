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
  ChevronDown, 
  Plus, 
  Filter, 
  LayoutList, 
  RefreshCw, 
  Trash2 
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title: string
  onAdd?: () => void
  actions?: React.ReactNode
  onBulkDelete?: (selectedRows: TData[]) => void
  onExport?: () => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title,
  onAdd,
  actions,
  onBulkDelete,
  onExport,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
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

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
           <div className="bg-slate-50 text-slate-900 rounded-xl p-2.5 h-11 w-11 flex items-center justify-center border border-slate-200 shadow-sm">
                <LayoutList className="h-5 w-5" />
           </div>
           <div>
               <h2 className="font-bold text-xl tracking-tight text-slate-900">{title}</h2>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                   All {title} <ChevronDown className="h-2.5 w-2.5" />
               </div>
           </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {hasSelection && onBulkDelete && (
                <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-9 px-4 shadow-sm animate-in fade-in slide-in-from-right-2 text-xs font-bold uppercase tracking-wider"
                    onClick={() => onBulkDelete(selectedRows.map(row => row.original))}
                >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete Selected ({selectedRows.length})
                </Button>
            )}
            <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 border-slate-200 hover:bg-slate-50 shrink-0 shadow-xs">
                <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            {actions && actions}
            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs shrink-0">
                <Button variant="ghost" className="h-9 px-4 text-slate-600 hover:bg-slate-50 rounded-none border-r border-slate-200 font-bold text-[11px] uppercase tracking-wider">
                    <LayoutList className="h-3.5 w-3.5 mr-2 text-slate-400" />
                    List View
                </Button>
                <div className="px-2.5 cursor-pointer hover:bg-slate-50 h-9 flex items-center transition-colors">
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
            </div>
             <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 border-slate-200 bg-white hover:bg-slate-50 shrink-0 shadow-xs">
                <Filter className="h-3.5 w-3.5" />
            </Button>
            {onAdd && (
                <Button className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold text-[11px] uppercase tracking-wider shrink-0 px-4" onClick={onAdd}>
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add
                </Button>
            )}
            <Button 
                variant="outline" 
                className="h-9 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shrink-0 shadow-xs font-bold text-[11px] uppercase tracking-wider px-4"
                onClick={onExport}
            >
                Export All
            </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b border-slate-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-slate-500 font-black h-11 border-r border-slate-100 last:border-0 whitespace-nowrap px-5 uppercase tracking-[0.15em] text-[10px]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-slate-50/50 data-[state=selected]:bg-slate-50/80 border-b-slate-100 last:border-0 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 border-r border-slate-50 last:border-0 px-5 text-slate-700 text-sm font-medium">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center text-slate-400 font-medium"
                >
                  No data available in this view.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 bg-slate-50/30 px-5 rounded-xl border border-slate-100/50 shadow-xs">
        <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-wider">
           {hasSelection ? (
             <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-300"></span>
                </span>
                {selectedRows.length} selected
             </div>
           ) : (
             <span className="opacity-70">
               Page <span className="text-slate-900">{table.getState().pagination.pageIndex + 1}</span> of <span className="text-slate-900">{table.getPageCount()}</span>
             </span>
           )}
           <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-4 py-1">
              <span className="opacity-50 tracking-tighter">Rows per page:</span>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-900 font-black hover:bg-slate-200 text-[10px]">
                {table.getState().pagination.pageSize} <ChevronDown className="h-3 w-3 ml-1 text-slate-400" />
              </Button>
           </div>
        </div>

        <Pagination className="justify-end w-auto mx-0 gap-1">
          <PaginationContent className="gap-1.5">
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => table.previousPage()}
                className={cn(
                  "h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider transition-all",
                  !table.getCanPreviousPage() && "pointer-events-none opacity-30 bg-transparent border-transparent"
                )}
              />
            </PaginationItem>
            
            <PaginationItem>
              <div className="h-8 min-w-8 flex items-center justify-center rounded-lg bg-slate-900 text-white text-[11px] font-black shadow-lg shadow-slate-900/20">
                {table.getState().pagination.pageIndex + 1}
              </div>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext 
                onClick={() => table.nextPage()}
                className={cn(
                  "h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider transition-all",
                  !table.getCanNextPage() && "pointer-events-none opacity-30 bg-transparent border-transparent"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
