import { useState, useMemo } from 'react'
import MainLayout from '../layouts/MainLayout'
import { useTranslation } from 'react-i18next'
import Pagination from '../components/Pagination'

const stats = [
  { key: 'totalOrders', value: '2,842', note: '+12.5%', icon: 'receipt_long', iconColor: 'text-[#FF6B35]' },
  { key: 'activeBranches', value: '12', note: 'Stable ops', icon: 'storefront', iconColor: 'text-blue-500' },
  { key: 'totalStaff', value: '156', note: '+4 New', icon: 'group', iconColor: 'text-emerald-500' },
  { key: 'satisfaction', value: '4.8/5.0', note: '98% Health', icon: 'star', iconColor: 'text-amber-500' },
]

const branches = [
  { name: 'Downtown Bistro', score: 85 },
  { name: 'Garden Plaza', score: 72 },
  { name: 'Harbor Heights', score: 45 },
]

const initialOrders = [
  { id: '#ORD-2841', customer: 'Alex Smith', branch: 'Downtown Bistro', status: 'Preparing', time: '2 mins ago' },
  { id: '#ORD-2840', customer: 'Maria Khan', branch: 'Garden Plaza', status: 'Ready', time: '12 mins ago' },
  { id: '#ORD-2839', customer: 'John Doe', branch: 'Harbor Heights', status: 'Completed', time: '45 mins ago' },
  { id: '#ORD-2838', customer: 'Lily Lane', branch: 'Downtown Bistro', status: 'Pending', time: '1 hr ago' },
]

const DashboardPage = () => {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      const matchesSearch =
        searchQuery === '' ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.branch.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesBranch = branchFilter === 'all' || order.branch === branchFilter
      const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesBranch && matchesStatus
    })
  }, [searchQuery, branchFilter, statusFilter])

  const totalPages = 124
  const totalItems = 12482
  const startItem = (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, totalItems)

  return (
    <MainLayout
      activeMenuKey="dashboard"
      breadcrumbCurrent="Dashboard"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              {t('systemOverview')}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              {t('systemSubtitle')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              {t('exportReport')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              {t('newRestaurant')}
            </button>
          </div>
        </section>

        {/* Standardized Metric Cards matching Category Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.key}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  {t(`dashboard.${item.key}`)}
                </span>
                <span className={`material-symbols-outlined text-lg ${item.iconColor}`}>
                  {item.icon}
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                  {item.value}
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {item.note}
                </span>
              </div>
            </div>
          ))}
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
              placeholder="Search orders, customers, or branches..."
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

          {/* Branch Filter */}
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Branch
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Branches</option>
              <option value="Downtown Bistro">Downtown Bistro</option>
              <option value="Garden Plaza">Garden Plaza</option>
              <option value="Harbor Heights">Harbor Heights</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Statuses</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {(searchQuery || branchFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setBranchFilter('all')
                setStatusFilter('all')
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Analytics Section */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">
                  {t('dashboard.ordersOverTime')}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  Daily transaction throughput across active kitchens
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {t('dashboard.weekly')}
                </button>
                <button
                  type="button"
                  className="rounded-xl px-3 py-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  {t('dashboard.monthly')}
                </button>
              </div>
            </div>
            <div className="flex h-64 items-end justify-between rounded-xl bg-slate-50/80 px-8 pb-6 dark:bg-zinc-800/50">
              {[40, 60, 45, 80, 55, 70, 50].map((height, idx) => (
                <div key={idx} className="group relative flex flex-col items-center">
                  <div
                    className="w-10 rounded-t-lg bg-[#FF6B35]/20 group-hover:bg-[#FF6B35] transition-colors"
                    style={{ height: `${height * 2}px` }}
                  />
                  <span className="mt-2 text-[10px] font-bold text-slate-400">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">
              {t('dashboard.topBranches')}
            </h3>
            <p className="mb-6 text-xs text-slate-500 dark:text-zinc-400">
              Highest performing operational nodes
            </p>
            <div className="space-y-5">
              {branches.map((branch, idx) => (
                <div key={branch.name} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{branch.name}</p>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-700">
                      <div className="h-full rounded-full bg-[#FF6B35]" style={{ width: `${branch.score}%` }} />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{branch.score}%</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Orders & Popular Items */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 xl:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">
                  {t('dashboard.recentOrders')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Live order queue</p>
              </div>
              <button type="button" className="text-xs font-bold text-[#FF6B35] hover:underline dark:text-orange-400">
                {t('dashboard.viewHistory')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <tr>
                    <th className="px-5 py-3.5">{t('dashboard.table.orderId')}</th>
                    <th className="px-5 py-3.5">{t('dashboard.table.customer')}</th>
                    <th className="px-5 py-3.5">{t('dashboard.table.branch')}</th>
                    <th className="px-5 py-3.5">{t('dashboard.table.status')}</th>
                    <th className="px-5 py-3.5 text-right">{t('dashboard.table.time')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                        <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-[#FF6B35] dark:text-orange-400">
                          {order.id}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900 dark:text-zinc-100">
                          {order.customer}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-zinc-400">
                          {order.branch}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800/40'
                                : order.status === 'Preparing'
                                ? 'bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:text-orange-400 dark:ring-orange-800/40'
                                : order.status === 'Ready'
                                ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-800/40'
                                : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right text-slate-400 dark:text-zinc-500">
                          {order.time}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No orders match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-1 text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">
              {t('dashboard.popularItems')}
            </h3>
            <p className="mb-6 text-xs text-slate-500 dark:text-zinc-400">
              Top requested kitchen recipes
            </p>
            <div className="space-y-4">
              {['Truffle Salmon Bowl', 'Artisan Margherita', 'Wagyu Gold Burger', 'Vanilla Glaze Artisan'].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                      <span className="material-symbols-outlined text-[20px]">restaurant</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{item}</p>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500">{t('dashboard.ordersThisWeek')}</p>
                    </div>
                  </div>
                ),
              )}
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {t('dashboard.manageGlobalMenu')}
            </button>
          </div>
        </section>

        <section className="mt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(value) => {
              setRowsPerPage(value)
              setCurrentPage(1)
            }}
          />
        </section>
      </div>
    </MainLayout>
  )
}

export default DashboardPage
