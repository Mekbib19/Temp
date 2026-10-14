import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useTranslation } from 'react-i18next'

const buildPageItems = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 'dots', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'dots', totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'dots', currentPage - 1, currentPage, currentPage + 1, 'dots', totalPages]
}

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  rowsPerPage = 25,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const { t } = useTranslation()
  const pageItems = buildPageItems(currentPage, totalPages)
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
            {t('Rows per page', 'Rows per page')}
          </span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(value) => onRowsPerPageChange?.(Number(value))}
          >
            <SelectTrigger className="min-w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => goToPage(1)}
          disabled={!canGoPrevious}
          className="hidden sm:flex rounded-lg p-1 text-slate-500 disabled:opacity-30 dark:text-zinc-400"
          aria-label="First page"
        >
          <span className="material-symbols-outlined text-[18px]">first_page</span>
        </button>
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={!canGoPrevious}
          className="rounded-lg p-1 text-slate-500 disabled:opacity-30 dark:text-zinc-400"
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {pageItems.map((item, idx) =>
          item === 'dots' ? (
            <span key={`dots-${idx}`} className="px-1 sm:px-2 text-slate-400 dark:text-zinc-500">
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              className={`h-7 w-7 sm:h-8 sm:min-w-8 rounded-lg sm:rounded-xl px-1 sm:px-2 text-xs sm:text-sm font-semibold transition ${item === currentPage
                  ? 'bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.35)]'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={!canGoNext}
          className="rounded-lg p-1 text-slate-500 disabled:opacity-30 dark:text-zinc-400"
          aria-label="Next page"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
        <button
          type="button"
          onClick={() => goToPage(totalPages)}
          disabled={!canGoNext}
          className="hidden sm:flex rounded-lg p-1 text-slate-500 disabled:opacity-30 dark:text-zinc-400"
          aria-label="Last page"
        >
          <span className="material-symbols-outlined text-[18px]">last_page</span>
        </button>
      </div>
    </div>
  </div>
)
}

export default Pagination
