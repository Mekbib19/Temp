import { useState } from 'react'
import { isCreditTransaction } from '../data/demoRiderTransactions'

export const TransactionDetailModal = ({ transaction, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !transaction) return null

  const isCredit = isCreditTransaction(transaction.type)

  const handleCopyId = () => {
    navigator.clipboard?.writeText(transaction.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'EARNING':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
      case 'BONUS':
        return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-400'
      case 'WITHDRAW':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400'
      case 'DEPOSIT':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400'
      case 'REFUND':
        return 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20 dark:bg-teal-950/40 dark:text-teal-400'
      case 'CHARGE':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400'
      case 'ADJUSTMENT':
        return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-400'
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isCredit
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {isCredit ? 'arrow_downward' : 'arrow_upward'}
              </span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                Transaction Receipt
              </h3>
              <p className="font-mono text-xs text-slate-400">
                Wallet Ledger Entry
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Amount Hero */}
        <div className="border-b border-slate-100 bg-slate-50/60 p-6 text-center dark:border-zinc-800 dark:bg-zinc-800/30">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${getTypeBadgeClass(
              transaction.type
            )}`}
          >
            {transaction.type}
          </span>
          <div className="mt-2 font-mono text-3xl font-extrabold text-slate-900 dark:text-zinc-100">
            <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-zinc-100'}>
              {isCredit ? '+' : '-'}{Number(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
            {transaction.reason}
          </p>
        </div>

        {/* Key Fields Grid */}
        <div className="p-5 space-y-3.5 text-xs">
          {/* UUID Primary Key */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/50">
            <span className="text-slate-400 font-medium">Transaction ID (UUID):</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-zinc-200">
              <span className="break-all text-[11px]">{transaction.id}</span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-slate-400 hover:text-[#FF6B35]"
                title="Copy Transaction UUID"
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 p-3 dark:border-zinc-800">
              <span className="text-slate-400 block font-medium">Rider ID:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">
                {transaction.rider_id}
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 dark:border-zinc-800">
              <span className="text-slate-400 block font-medium">Order ID (FK):</span>
              <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">
                {transaction.order_id ? `#${transaction.order_id}` : '— (No Order Linked)'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 p-3 dark:border-zinc-800">
            <span className="text-slate-400 block font-medium">Description:</span>
            <p className="font-medium text-slate-700 dark:text-zinc-300 mt-0.5 leading-relaxed">
              {transaction.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 p-3 dark:border-zinc-800">
              <span className="text-slate-400 block font-medium">Created At:</span>
              <span className="font-mono text-slate-700 dark:text-zinc-300 mt-0.5 block">
                {transaction.created_at}
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 p-3 dark:border-zinc-800">
              <span className="text-slate-400 block font-medium">Updated At:</span>
              <span className="font-mono text-slate-700 dark:text-zinc-300 mt-0.5 block">
                {transaction.updated_at || transaction.created_at}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/50">
            <span className="text-slate-400 font-medium">Balance After Execution:</span>
            <span className="font-mono font-extrabold text-slate-900 dark:text-zinc-100 text-sm">
              {Number(transaction.balance_after).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 p-4 dark:border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
