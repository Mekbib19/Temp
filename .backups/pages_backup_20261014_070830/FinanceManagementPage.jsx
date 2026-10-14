import { useState, useMemo } from 'react'
import MainLayout from '../layouts/MainLayout'

const chartData = [
  { day: 'MON', h1: 'h-[60%]', h2: 'h-[45%]', h3: 'h-[80%]', isPeak: false },
  { day: 'TUE', h1: 'h-[55%]', h2: 'h-[50%]', h3: 'h-[75%]', isPeak: false },
  { day: 'WED', h1: 'h-[70%]', h2: 'h-[40%]', h3: 'h-[85%]', isPeak: false },
  { day: 'THU', h1: 'h-[45%]', h2: 'h-[65%]', h3: 'h-[95%]', isPeak: false },
  { day: 'FRI', h1: 'h-[50%]', h2: 'h-[75%]', h3: 'h-[100%]', isPeak: true },
  { day: 'SAT', h1: 'h-[30%]', h2: 'h-[85%]', h3: 'h-[90%]', isPeak: false },
  { day: 'SUN', h1: 'h-[40%]', h2: 'h-[60%]', h3: 'h-[65%]', isPeak: false },
]

const recentVolumes = [
  {
    id: 1,
    initials: 'CP',
    name: 'Central Plaza - Kitchen A',
    subtitle: 'Main Logistics Hub',
    bgColor: 'bg-orange-50 dark:bg-orange-900/30',
    textColor: 'text-orange-600 dark:text-orange-400',
    units: '42,109 Units',
    efficiency: '94.2%',
    statusLabel: 'Optimized',
    statusBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    statusText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 2,
    initials: 'WF',
    name: 'Waterfront Fine Dining',
    subtitle: 'High-End Specialty Node',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    textColor: 'text-blue-600 dark:text-blue-400',
    units: '18,443 Units',
    efficiency: '88.7%',
    statusLabel: 'Optimized',
    statusBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    statusText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 3,
    initials: 'MN',
    name: 'Metro North Express',
    subtitle: 'Quick Service Node',
    bgColor: 'bg-slate-100 dark:bg-zinc-800',
    textColor: 'text-slate-500 dark:text-slate-400',
    units: '36,822 Units',
    efficiency: '72.1%',
    statusLabel: 'Scaling',
    statusBg: 'bg-orange-50 dark:bg-orange-900/30',
    statusText: 'text-orange-600 dark:text-orange-400',
  },
]

const FinanceManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeframeFilter, setTimeframeFilter] = useState('30d')

  const filteredVolumes = useMemo(() => {
    return recentVolumes.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' || item.statusLabel.toLowerCase() === statusFilter.toLowerCase()
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  return (
    <MainLayout
      activeMenuKey="finance"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Finance"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Volume &amp; Count Analytics
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Monitoring transaction volume and operational throughput across all nodes.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">calendar_today</span>
              Last 30 Days
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export Report
            </button>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Category Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Orders Processed
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">receipt_long</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                1,248,392
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +12.4%
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Avg. Orders / Branch
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">hub</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                12,854
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +8.1%
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Volume Velocity
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">query_stats</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                +18.2%
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                Quarterly Avg
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Node Uptime
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">verified</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                99.4%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Stable ops
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

          {/* Search Engine - Matching Size with Filters Card */}
          <div className="relative h-11 min-w-[280px] flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location node, hub name..."
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

          {/* Status Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Node Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Statuses</option>
              <option value="optimized">Optimized</option>
              <option value="scaling">Scaling</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Timeframe
            </label>
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Current Quarter</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'all' || timeframeFilter !== '30d') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setTimeframeFilter('30d')
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">Order Volume by Top Branches</h3>
              <p className="text-xs text-slate-500 mt-1">Daily throughput comparison over the last operational cycle</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff6b35]"></span> Central Plaza
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#6098ff]"></span> Waterfront
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-600"></span> Metro North
              </div>
            </div>
          </div>

          <div className="relative h-64 flex items-end gap-4 md:gap-8 overflow-x-auto pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 min-w-[60px] h-full flex flex-col justify-end gap-1 group">
                <div className={`w-full ${data.h1} bg-slate-100 dark:bg-zinc-800 rounded-t-xl group-hover:bg-slate-200 dark:group-hover:bg-zinc-700 transition-colors`}></div>
                <div className={`w-full ${data.h2} bg-[#6098ff] rounded-t-xl opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                <div className={`w-full ${data.h3} bg-[#ff6b35] rounded-t-xl group-hover:shadow-lg transition-all`}></div>
                <span className={`text-[10px] font-bold ${data.isPeak ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'} mt-4 text-center`}>
                  {data.day}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">Recent High-Volume Periods</h3>
            <button className="text-[#FF6B35] dark:text-orange-400 text-xs font-bold flex items-center gap-1 hover:underline">
              View all logs <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-5 px-5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <div className="col-span-2">Location Node</div>
              <div>Throughput Count</div>
              <div>Kitchen Efficiency</div>
              <div className="text-right">Status</div>
            </div>

            {filteredVolumes.length > 0 ? (
              filteredVolumes.map((item) => (
                <div key={item.id} className="grid grid-cols-5 items-center px-5 py-4 bg-slate-50/70 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800 hover:border-slate-200 transition-colors">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${item.bgColor} ${item.textColor}`}>
                      {item.initials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{item.name}</p>
                      <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{item.units}</div>
                  <div className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.efficiency}</div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.statusBg} ${item.statusText}`}>
                      {item.statusLabel}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No location nodes match the selected filter.
              </div>
            )}
          </div>
        </section>

      </div>
    </MainLayout>
  )
}

export default FinanceManagementPage