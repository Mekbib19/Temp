import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'
import DataTable from '../components/DataTable'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuPortal,
} from '../components/ui/dropdown-menu'

const globalOrders = [
  {
    id: '#ORD-9281',
    customer: { initials: 'JD', name: 'Johnathan Doe', email: 'j.doe@example.com' },
    brand: 'The Burger Collective',
    branch: 'Downtown 4th St',
    statusVariant: 'preparing',
    timestamp: { relative: 'Just Now', time: '14:24 PM' },
  },
  {
    id: '#ORD-9275',
    customer: { initials: 'AM', name: 'Alice Martins', email: 'alice.m@domain.co' },
    brand: 'Taco Haven',
    branch: 'Eastside Plaza',
    statusVariant: 'ready',
    timestamp: { relative: '12 mins ago', time: '14:12 PM' },
  },
  {
    id: '#ORD-9250',
    customer: { initials: 'SK', name: 'Samuel Knight', email: 'sk@fastmail.com' },
    brand: 'Pasta Prime',
    branch: 'West End Hub',
    statusVariant: 'delivered',
    timestamp: { relative: '45 mins ago', time: '13:39 PM' },
  },
  {
    id: '#ORD-9211',
    customer: { initials: 'EW', name: 'Emily Watson', email: 'e.watson@gmail.com' },
    brand: 'Greens & Grains',
    branch: 'Northside Park',
    statusVariant: 'cancelled',
    timestamp: { relative: '2 hours ago', time: '12:15 PM' },
  },
]

const statusConfig = {
  preparing: {
    wrapperClass: 'text-blue-600 bg-blue-50/50',
    content: (
      <>
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-blue-600" />
        <span className="text-[11px] font-extrabold uppercase">Preparing</span>
      </>
    ),
  },
  ready: {
    wrapperClass: 'text-orange-600 bg-orange-50/50',
    content: (
      <>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-600" />
        <span className="text-[11px] font-extrabold uppercase">Ready</span>
      </>
    ),
  },
  delivered: {
    wrapperClass: 'text-green-600 bg-green-50/50',
    content: (
      <>
        <span className="material-symbols-outlined text-[12px]">check_circle</span>
        <span className="text-[11px] font-extrabold uppercase">Delivered</span>
      </>
    ),
  },
  cancelled: {
    wrapperClass: 'text-red-600 bg-red-50/50',
    content: (
      <>
        <span className="material-symbols-outlined text-[12px]">cancel</span>
        <span className="text-[11px] font-extrabold uppercase">Cancelled</span>
      </>
    ),
  },
}

const OrderManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [orderStatus, setOrderStatus] = useState('All Statuses')
  const [selectedBrand, setSelectedBrand] = useState('All Brands')
  const [timeframe, setTimeframe] = useState('Last 24 Hours')

  const filteredOrders = globalOrders.filter((order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchId = order.id.toLowerCase().includes(q)
      const matchName = order.customer.name.toLowerCase().includes(q)
      const matchEmail = order.customer.email.toLowerCase().includes(q)
      const matchBrand = order.brand.toLowerCase().includes(q)
      const matchBranch = order.branch.toLowerCase().includes(q)
      if (!matchId && !matchName && !matchEmail && !matchBrand && !matchBranch) return false
    }
    if (orderStatus !== 'All Statuses' && order.statusVariant.toLowerCase() !== orderStatus.toLowerCase()) {
      return false
    }
    if (selectedBrand !== 'All Brands' && order.brand !== selectedBrand) {
      return false
    }
    return true
  })

  const columns = [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: (info) => (
        <span className="font-bold text-slate-900 dark:text-zinc-100">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (info) => {
        const customer = info.getValue()
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-[#ab3500] dark:bg-zinc-700 dark:text-orange-400">
              {customer.initials}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 text-left">{customer.name}</p>
              <p className="text-xs text-slate-400 text-left">{customer.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      cell: (info) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: (info) => (
        <span className="text-sm text-slate-600 dark:text-zinc-400">{info.getValue()}</span>
      ),
    },
    {
      accessorKey: 'statusVariant',
      header: 'Status',
      cell: (info) => {
        const variant = info.getValue()
        return (
          <div
            className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 ${statusConfig[variant].wrapperClass}`}
          >
            {statusConfig[variant].content}
          </div>
        )
      },
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: (info) => {
        const timestamp = info.getValue()
        return (
          <div className="text-sm">
            <p className="font-medium text-slate-900 dark:text-zinc-100">{timestamp.relative}</p>
            <p className="text-xs text-slate-400">{timestamp.time}</p>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      meta: {
        headerClassName: 'px-6 py-5 text-right',
        cellClassName: 'px-6 py-5 text-right',
      },
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 outline-none dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              <DropdownMenuItem className="gap-2">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 dark:focus:bg-red-950/50 focus:text-red-600 dark:focus:text-red-400">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <MainLayout
      activeMenuKey="orderManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Orders"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Global Orders
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Real-time overview of all culinary transactions across your ecosystem.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export Data
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Manual Entry
            </button>
          </div>
        </section>

        {/* 4 Unified Metric Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Preparing
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">pending_actions</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                142
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +12.5% this hour
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Delivered Today
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                893
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +8.2% vs yesterday
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Brands
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">storefront</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                24
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                Across 18 branches
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Cancelled (24h)
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/60 dark:bg-rose-950/40 dark:ring-rose-800/40">
                <span className="material-symbols-outlined text-lg">cancel</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                12
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                -2.4% rate drop
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar with Matching Size Filters Icon and Search Engine */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>
          <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

          {/* Search Engine - Matching Size with Filters Card */}
          <div className="relative h-11 min-w-[280px] flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, customer name, email, or branch..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Order Status</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option>All Statuses</option>
              <option>Preparing</option>
              <option>Ready</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option>All Brands</option>
              <option>The Burger Collective</option>
              <option>Taco Haven</option>
              <option>Pasta Prime</option>
              <option>Greens & Grains</option>
            </select>
          </div>
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Current Month</option>
              <option>Custom Range</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setOrderStatus('All Statuses')
              setSelectedBrand('All Brands')
              setTimeframe('Last 24 Hours')
            }}
            className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
          >
            Clear All Filters
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <DataTable
            columns={columns}
            data={filteredOrders}
            keyExtractor={(order) => order.id}
            enablePagination={true}
            itemName="orders"
          />
        </section>
      </div>
    </MainLayout>
  )
}

export default OrderManagementPage
