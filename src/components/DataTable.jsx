import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import Pagination from './Pagination'

const DataTable = ({
  columns,
  data,
  containerClassName = 'overflow-x-auto',
  tableClassName = 'w-full border-collapse text-left',
  headerRowClassName = 'text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500',
  tbodyClassName = 'divide-y divide-slate-100 dark:divide-zinc-800',
  rowClassName = 'group transition-colors hover:bg-[#fcf9f8] dark:hover:bg-zinc-800/40',
  enablePagination = false,
  pageSize = 10,
  itemName = 'entries',
}) => {
  const [sorting, setSorting] = useState([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      ...(enablePagination ? { pagination } : {}),
    },
    onSortingChange: setSorting,
    ...(enablePagination ? { onPaginationChange: setPagination } : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const hasRows = table.getCoreRowModel().rows.length > 0

  return (
    <div className="flex flex-col gap-4 w-full">
      {hasRows ? (
        <>
          {/* Desktop Table View */}
          <div className={`${containerClassName} hidden md:block`}>
            <table className={tableClassName}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className={headerRowClassName}>
                    {headerGroup.headers.map((header) => {
                      const customClassName =
                        header.column.columnDef.meta?.headerClassName || 'px-4 py-4 sm:px-8 sm:py-6'
                      
                      return (
                        <th key={header.id} className={customClassName}>
                          {header.isPlaceholder ? null : (
                            <div
                              className={`flex items-center gap-2 ${
                                header.column.getCanSort()
                                  ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-zinc-300'
                                  : ''
                              } ${
                                header.column.columnDef.meta?.headerClassName?.includes('text-right')
                                  ? 'justify-end'
                                  : ''
                              }`}
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: <span className="material-symbols-outlined text-[14px]">arrow_upward</span>,
                                desc: <span className="material-symbols-outlined text-[14px]">arrow_downward</span>,
                              }[header.column.getIsSorted()] ?? (header.column.getCanSort() ? (
                                <span className="material-symbols-outlined text-[14px] text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600">
                                  swap_vert
                                </span>
                              ) : null)}
                            </div>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className={tbodyClassName}>
                {table.getRowModel().rows.map((row) => {
                  const rClassName =
                    typeof rowClassName === 'function'
                      ? rowClassName(row.original, row.index)
                      : rowClassName
                  return (
                    <tr key={row.id} className={rClassName}>
                      {row.getVisibleCells().map((cell) => {
                        const customClassName =
                          cell.column.columnDef.meta?.cellClassName || 'px-4 py-4 sm:px-8 sm:py-6'
                        return (
                          <td key={cell.id} className={customClassName}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="space-y-4">
                  {row.getVisibleCells().map((cell) => {
                    const header = cell.column.columnDef.header
                    return (
                      <div
                        key={cell.id}
                        className="flex items-center justify-between gap-4 border-b border-slate-50 pb-3 last:border-0 last:pb-0 dark:border-zinc-800/50"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {typeof header === 'string' ? header : cell.column.id}
                        </span>
                        <div className="text-right text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {enablePagination && (
            <Pagination
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              totalItems={table.getCoreRowModel().rows.length}
              startItem={
                table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
              }
              endItem={Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getCoreRowModel().rows.length
              )}
              rowsPerPage={table.getState().pagination.pageSize}
              onPageChange={(page) => table.setPageIndex(page - 1)}
              onRowsPerPageChange={(size) => table.setPageSize(size)}
              itemName={itemName}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
            <span className="material-symbols-outlined text-3xl">search_off</span>
          </div>
          <h3 className="mt-4 font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
            No {itemName || 'records'} found matching criteria
          </h3>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
            No records matched your search query or selected filters. Try adjusting your search keywords or resetting your filter criteria.
          </p>
        </div>
      )}
    </div>
  )
}

export default DataTable
