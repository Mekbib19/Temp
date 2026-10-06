import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'

const deliveries = [
  {
    id: 'ORD-9021',
    date: 'Mar 24, 14:32',
    driver: { name: 'Marcus Thorne', rating: '4.9', avatarBg: 'bg-indigo-100', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHe2a24dFoMyuM8QLaEBRNmbXo9s1uYPvPJJU4fSDuJbvY5nFJrMjr5Py26pOR5RP80KAOMnC1qf-pQwO2Lz6Vl6HDIszJBLnrfglcHlUyiKBtE9--yT_uU65fIQ7fccrbLTLErP5feQcJyt8WuQbAO67X7FHkuH_Y7CEVmlWjWzUdRDv2FihKCi8383im7XxXJ0rjlLxxbKWxS8Yl526U-fAsOoAK0E0V1b-qbiAJx4ONL0wolt8kRJXFVbUNxo5fnMWJtvthnEk' },
    brand: { letter: 'V', name: 'Verde Kitchen', logoBg: 'bg-orange-600' },
    destination: { line1: '224 Baker Street, Apt 4B', distance: '2.4 miles away' },
    eta: { type: 'time', text: '12 mins', color: 'text-[#ab3500]' },
    status: { label: 'On the way', variant: 'blue' },
  },
  {
    id: 'ORD-8944',
    date: 'Mar 24, 14:15',
    driver: { name: 'Sofia Chen', rating: '5.0', avatarBg: 'bg-teal-100', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsuLjTs6USKj0_LJcEDUw7fvBfEpS_ZgYk3l4aFtprNpZglfXmaqqaoTGTM6iyLDFk430EirJPaBvj7wIF7-XltnoFxKxGAdCLKUiQ94s3GpYWHl4pkjxW74SzgRAruxHT9tBSKSJpLAjDSwBplUVb6jVY6kA-uGd906XcoeakC5On9WBWJeJrqvJtIWDgcz8M4nLk22vMXNJnvjedjOjwKOCh1V4mlwuXKg9mYdzw6de7qnaJCIRXGlRf32G58BhEKoSL0sbL3Hk' },
    brand: { letter: 'O', name: 'Oishi Sushi', logoBg: 'bg-slate-900' },
    destination: { line1: 'The Grand Hotel, Lobby', distance: '0.1 miles away' },
    eta: { type: 'arrived', text: 'Arrived', color: 'text-green-600' },
    status: { label: 'Arrived', variant: 'green' },
  },
  {
    id: 'ORD-9055',
    date: 'Mar 24, 14:45',
    driver: { name: 'James Wilson', rating: '4.8', avatarBg: 'bg-orange-100', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWC6eoV9btROl9929PCTcTb6uBRlr-Y_wH3fqimuQiCi_aUK2F-JVlvAt0iDo3mMWqzThW8vEkgAWYzNI_fXfE3LVIXa_07iNTUDqlKJg4R8q5ko-mwrxrSvH1HjR33R_BG-amAtc-riGdedhEEds9PBkSeBBdblJfMI6RNQIaTSkHbMPASqjMphXLIBDV5_vBjb6Y4HdvFo7K34R_fPqvD-Ag3_5omXBAE4s9YxYRoWfbFgTKCgNRCjXAxElShN6h4Cn0bUL-dyk' },
    brand: { letter: 'B', name: 'Burger Theory', logoBg: 'bg-[#ff6b35]' },
    destination: { line1: '99 Silicon Valley Dr.', distance: '4.1 miles away' },
    eta: { type: 'time', text: '28 mins', color: 'text-slate-400' },
    status: { label: 'Picked up', variant: 'muted' },
  },
]

const statusPill = {
  blue: 'bg-indigo-50 text-indigo-950 ring-1 ring-indigo-100',
  green: 'bg-green-50 text-green-700 ring-1 ring-green-100',
  muted: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
}

const DeliveryManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [branchFilter, setBranchFilter] = useState('All Central Branches')
  const [driverStatusFilter, setDriverStatusFilter] = useState('All Statuses')
  const [timeframeFilter, setTimeframeFilter] = useState('Live Rush')

  const filteredDeliveries = deliveries.filter((row) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchId = row.id.toLowerCase().includes(q)
      const matchDriver = row.driver.name.toLowerCase().includes(q)
      const matchBrand = row.brand.name.toLowerCase().includes(q)
      const matchDest = row.destination.line1.toLowerCase().includes(q)
      if (!matchId && !matchDriver && !matchBrand && !matchDest) return false
    }
    if (driverStatusFilter !== 'All Statuses') {
      if (driverStatusFilter === 'In Transit' && row.status.label !== 'On the way') return false
      if (driverStatusFilter === 'Online' && row.status.label !== 'Arrived' && row.status.label !== 'Picked up' && row.status.label !== 'On the way') return false
      if (driverStatusFilter === 'Offline') return false
    }
    return true
  })

  return (
    <MainLayout
      activeMenuKey="deliveryManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Delivery"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Active Deliveries
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Real-time oversight of all logistics across 12 operational branches.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export Log
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Dispatch Driver
            </button>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Category Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Deliveries
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                1,482
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +12% today
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Avg. Delivery Time
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">schedule</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                24m
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                -2m faster
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Drivers
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">person</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                86
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                92% on-road
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Live Alerts
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:bg-amber-950/40 dark:ring-amber-800/40">
                <span className="material-symbols-outlined text-lg">warning</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                04
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Needs review
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar - Order Management Style with Matching Size Filters Icon and Search Engine */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>
          <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

          {/* Search Engine - Equal Size with Filters Card */}
          <div className="relative h-11 min-w-[280px] flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order ID, driver name, restaurant, or destination..."
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
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Branch</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option>All Central Branches</option>
              <option>Downtown Kitchen</option>
              <option>Westside Bistro</option>
              <option>Uptown Express</option>
            </select>
          </div>

          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Driver Status</label>
            <select
              value={driverStatusFilter}
              onChange={(e) => setDriverStatusFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option>All Statuses</option>
              <option>Online</option>
              <option>Offline</option>
              <option>In Transit</option>
            </select>
          </div>

          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timeframe</label>
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option>Live Rush</option>
              <option>Past 24 Hours</option>
              <option>Past 7 Days</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setBranchFilter('All Central Branches')
              setDriverStatusFilter('All Statuses')
              setTimeframeFilter('Live Rush')
            }}
            className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
          >
            Clear All Filters
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Branch</label>
                <select className="cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-slate-900 focus:ring-0 dark:text-zinc-100">
                  <option>All Central Branches</option>
                  <option>Downtown Kitchen</option>
                  <option>Westside Bistro</option>
                  <option>Uptown Express</option>
                </select>
              </div>
              <div className="hidden h-8 w-px bg-slate-200 sm:block dark:bg-zinc-700" />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Driver Status</label>
                <select className="cursor-pointer border-none bg-transparent p-0 text-sm font-bold text-slate-900 focus:ring-0 dark:text-zinc-100">
                  <option>All Statuses</option>
                  <option>Online</option>
                  <option>Offline</option>
                  <option>In Transit</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="p-2 text-slate-400 transition-colors hover:text-[#ab3500] dark:hover:text-orange-400"
                aria-label="Download"
              >
                <span className="material-symbols-outlined">download</span>
              </button>
              <button
                type="button"
                className="p-2 text-slate-400 transition-colors hover:text-[#ab3500] dark:hover:text-orange-400"
                aria-label="More"
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-zinc-800/50">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-8">
                    Order ID
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">Driver</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">
                    Merchant
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">
                    Destination
                  </th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">ETA</th>
                  <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-8">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredDeliveries.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/40">
                    <td className="px-6 py-6 sm:px-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">#{row.id}</span>
                        <span className="text-[11px] text-slate-400">{row.date}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${row.driver.avatarBg}`}
                        >
                          <img alt="" className="h-full w-full object-cover" src={row.driver.img} />
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{row.driver.name}</span>
                          <div className="flex items-center gap-1">
                            <span
                              className="material-symbols-outlined text-[10px] text-orange-400"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">{row.driver.rating}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-6 sm:px-6">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white ${row.brand.logoBg}`}
                        >
                          {row.brand.letter}
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{row.brand.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 sm:px-6">
                      <div className="flex flex-col">
                        <span className="max-w-[160px] truncate text-sm text-slate-900 dark:text-zinc-100">
                          {row.destination.line1}
                        </span>
                        <span className="text-[11px] text-slate-400">{row.destination.distance}</span>
                      </div>
                    </td>
                    <td className="px-4 py-6 sm:px-6">
                      {row.eta.type === 'time' && (
                        <div className={`flex items-center gap-1 font-bold ${row.eta.color}`}>
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span className="text-sm">{row.eta.text}</span>
                        </div>
                      )}
                      {row.eta.type === 'arrived' && (
                        <div className={`flex items-center gap-1 font-bold ${row.eta.color}`}>
                          <span className="material-symbols-outlined text-sm">done_all</span>
                          <span className="text-sm">{row.eta.text}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-6 sm:px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusPill[row.status.variant]}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            row.status.variant === 'blue'
                              ? 'animate-pulse bg-indigo-600'
                              : row.status.variant === 'green'
                                ? 'bg-green-600'
                                : 'bg-slate-400'
                          }`}
                        />
                        {row.status.label}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right sm:px-8">
                      <button
                        type="button"
                        className="text-slate-400 transition-all hover:text-[#ab3500] dark:hover:text-orange-400"
                        aria-label="View on map"
                      >
                        <span className="material-symbols-outlined">map</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-end dark:border-zinc-800 dark:bg-zinc-800/30">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-white hover:text-[#ab3500] dark:hover:bg-zinc-700 dark:hover:text-orange-400"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button
                type="button"
                className="h-8 w-8 rounded-full bg-[#ab3500] text-xs font-bold text-white shadow-md shadow-orange-900/20"
              >
                1
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-slate-600 transition-all hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                2
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-slate-600 transition-all hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                3
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-white hover:text-[#ab3500] dark:hover:bg-zinc-700 dark:hover:text-orange-400"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="relative h-96 overflow-hidden rounded-[24px] border border-slate-100 lg:col-span-2 dark:border-zinc-800">
            <div className="absolute inset-0 z-0">
              <img
                alt=""
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGyRDJCR9Zox7aEcm6FPFQIQ6moUxu0_4z4oxWQ09PZ0RBP9dYoiT6yohC1yRMz4Vzpzd62LtyHikmVhQLEwxC4t4nFWLRuv_8EF2pmqKEbN50NvoB4QMXvHWBfh3wS-e2VYAW-NxBMBXPs5edb1yI3PE4Xwx3-LcNkhA84RtgBCTaUGt9WN6WsDy9b4T2gPV5Y-GhoS1D0MGCDANeT_0dJs3BnI8OhOF0jR9jTueVvgcGi3eQoEmnMA1KdDQWEa1nrd0Tz71bQIs"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 flex h-full flex-col p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-white">Real-time Logistics Map</h3>
                  <p className="text-sm text-white/70">Visualizing active routes across the city.</p>
                </div>
                <button
                  type="button"
                  className="rounded-xl bg-white/20 p-2 text-white backdrop-blur-md transition-all hover:bg-white/30"
                  aria-label="Fullscreen map"
                >
                  <span className="material-symbols-outlined">fullscreen</span>
                </button>
              </div>
              <div className="mt-auto flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-lg">
                  <p className="text-[10px] font-bold uppercase text-white/60">Congestion</p>
                  <p className="font-bold text-white">Low</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-lg">
                  <p className="text-[10px] font-bold uppercase text-white/60">Weather</p>
                  <p className="font-bold text-white">Clear Sky</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-[24px] border border-slate-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-6 font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-900 dark:text-zinc-100">
              Driver Leaderboard
            </h3>
            <div className="flex flex-1 flex-col space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-[#ab3500]">
                    MT
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-zinc-100">Marcus Thorne</p>
                    <p className="text-[11px] text-slate-400">22 Deliveries Today</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-bold text-green-600 dark:text-green-400">Top Performer</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                    SC
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">Sofia Chen</p>
                    <p className="text-[11px] text-slate-400">19 Deliveries Today</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                    JW
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">James Wilson</p>
                    <p className="text-[11px] text-slate-400">18 Deliveries Today</p>
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="mt-8 w-full rounded-xl bg-slate-100 py-3 text-xs font-bold uppercase tracking-widest text-slate-900 transition-all hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              View All Drivers
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default DeliveryManagementPage
