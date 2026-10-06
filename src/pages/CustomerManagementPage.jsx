import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { demoCustomers } from '../data/demoCustomers'

const CustomerManagementPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name_asc')

  const filteredCustomers = useMemo(() => {
    return demoCustomers
      .filter((c) => {
        if (
          searchQuery &&
          !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !c.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !c.phone.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false
        }
        if (statusFilter !== 'all' && c.status.toLowerCase() !== statusFilter) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name)
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name)
        return 0
      })
  }, [searchQuery, statusFilter, sortBy])

  return (
    <MainLayout
      activeMenuKey="customerManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Customers"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Customer Management
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Overview and management of all registered customers across the platform. Control access levels, view histories, and update profiles.
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
            <Link
              to="/customers/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Add Customer
            </Link>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Category Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Customers
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">group</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                12,482
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +12% this month
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Accounts
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                11,840
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                94.8% active rate
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                New This Month
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:bg-amber-950/40 dark:ring-amber-800/40">
                <span className="material-symbols-outlined text-lg">person_add</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                642
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +18% acceleration
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Retention Rate
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">repeat</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                92.4%
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                Top tier
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
              placeholder="Search customer name, email, or phone..."
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
              Account Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Customers Table View */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <th className="px-5 py-3.5">Customer ID</th>
                  <th className="px-5 py-3.5">Name & Profile</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40">
                    <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-slate-400 dark:text-zinc-500">
                      {customer.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {customer.avatar ? (
                          <img src={customer.avatar} alt={customer.name} className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-zinc-800" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                            {customer.initials}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 transition-colors group-hover:text-[#FF6B35] dark:text-zinc-100">
                            {customer.name}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">{customer.profile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600 dark:text-zinc-300">{customer.email}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-600 dark:text-zinc-300">{customer.phone}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-zinc-400">{customer.joinedDate}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          customer.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            customer.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {customer.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/customers/${encodeURIComponent(customer.slug)}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          aria-label={`View ${customer.name}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
                        <Link
                          to={`/customers/${encodeURIComponent(customer.slug)}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          aria-label={`Edit ${customer.name}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
            <Pagination
              currentPage={currentPage}
              totalPages={124}
              totalItems={12482}
              startItem={1}
              endItem={3}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={setRowsPerPage}
            />
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default CustomerManagementPage
