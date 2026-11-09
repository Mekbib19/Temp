import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import {
  ORDER_TYPES,
  ORDER_STATUSES,
  loadStoredOrders,
} from '../data/demoOrders'

export default function OrderManagementPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [ordersList, setOrdersList] = useState(() => loadStoredOrders())

  // Filters
  const initialCategory = searchParams.get('category') || 'ALL'
  const initialStatus = searchParams.get('status') || 'ALL'

  const [categoryFilter, setCategoryFilter] = useState(initialCategory)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [searchQuery, setSearchQuery] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('ALL')
  const [timeframeFilter, setTimeframeFilter] = useState('ALL')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Reload orders on external custom event
  const syncOrders = useCallback(() => {
    const updated = loadStoredOrders()
    setOrdersList(updated)
  }, [])

  useEffect(() => {
    window.addEventListener('orders-data-updated', syncOrders)
    return () => window.removeEventListener('orders-data-updated', syncOrders)
  }, [syncOrders])

  // Count Statistics
  const activeOrders = useMemo(
    () => ordersList.filter((o) => o.status === 'PENDING' || o.status === 'PREPARING'),
    [ordersList]
  )
  const transitOrders = useMemo(
    () => ordersList.filter((o) => o.status === 'OUT_FOR_DELIVERY'),
    [ordersList]
  )
  const deliveredOrders = useMemo(
    () => ordersList.filter((o) => o.status === 'DELIVERED'),
    [ordersList]
  )
  const cancelledOrders = useMemo(
    () => ordersList.filter((o) => o.status === 'CANCELLED'),
    [ordersList]
  )
  const totalRevenue = useMemo(
    () => deliveredOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0),
    [deliveredOrders]
  )

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      // Category filter
      if (categoryFilter !== 'ALL' && order.order_type !== categoryFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false
      }

      // Payment filter
      if (paymentFilter === 'WALLET' && order.payment_method !== 'WALLET') return false
      if (paymentFilter === 'CASH' && order.payment_method !== 'CASH') return false
      if (paymentFilter === 'PAID' && order.payment_status !== 'PAID') return false
      if (paymentFilter === 'PENDING' && order.payment_status !== 'PENDING') return false

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const numMatch = order.order_number?.toLowerCase().includes(q)
        const custNameMatch = order.customer?.name?.toLowerCase().includes(q)
        const custPhoneMatch = order.customer?.phone?.toLowerCase().includes(q)
        const custEmailMatch = order.customer?.email?.toLowerCase().includes(q)
        const storeMatch = order.merchant?.name?.toLowerCase().includes(q)
        const branchMatch = order.branch?.name?.toLowerCase().includes(q)
        const courierMatch = order.rider?.name?.toLowerCase().includes(q)
        const pinMatch = String(order.delivery_confirmation_code || '').includes(q)
        const itemMatch = order.items?.some((i) => i.name?.toLowerCase().includes(q))

        if (
          !numMatch &&
          !custNameMatch &&
          !custPhoneMatch &&
          !custEmailMatch &&
          !storeMatch &&
          !branchMatch &&
          !courierMatch &&
          !pinMatch &&
          !itemMatch
        ) {
          return false
        }
      }

      return true
    })
  }, [ordersList, categoryFilter, statusFilter, paymentFilter, searchQuery])

  // Pagination Slice
  const totalItems = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, totalItems)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleCategoryChange = (code) => {
    setCategoryFilter(code)
    setCurrentPage(1)
    const nextParams = new URLSearchParams(searchParams)
    if (code === 'ALL') {
      nextParams.delete('category')
    } else {
      nextParams.set('category', code)
    }
    setSearchParams(nextParams)
  }

  const handleStatusFilterChange = (code) => {
    setStatusFilter(code)
    setCurrentPage(1)
    const nextParams = new URLSearchParams(searchParams)
    if (code === 'ALL') {
      nextParams.delete('status')
    } else {
      nextParams.set('status', code)
    }
    setSearchParams(nextParams)
  }

  const handleOpenDetail = (order) => {
    navigate(`/orders/${order.id}`)
  }

  const handleExportCSV = () => {
    const headers = [
      'Order Number',
      'Order Type',
      'Status',
      'Customer Name',
      'Customer Phone',
      'Store Name',
      'Branch',
      'Assigned Courier',
      'Payment Method',
      'Payment Status',
      'Total Amount (ETB)',
      'Delivery Address',
      'Confirmation Code',
      'Placed At',
    ]

    const rows = filteredOrders.map((o) => [
      `"${o.order_number}"`,
      `"${o.order_type}"`,
      `"${o.status}"`,
      `"${o.customer?.name || ''}"`,
      `"${o.customer?.phone || ''}"`,
      `"${o.merchant?.name || ''}"`,
      `"${o.branch?.name || ''}"`,
      `"${o.rider?.name || 'Unassigned'}"`,
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.total_amount}"`,
      `"${(o.delivery_address_line || '').replace(/"/g, '""')}"`,
      `"${o.delivery_confirmation_code || ''}"`,
      `"${o.created_at || ''}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Shima_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Exported ${filteredOrders.length} orders to CSV successfully.`, 'success')
  }

  return (
    <MainLayout
      activeMenuKey="orderManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Order Management"
    >
      <div className="space-y-6 pb-12">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs font-bold text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600'
                : toastMessage.type === 'error'
                ? 'bg-rose-600'
                : 'bg-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toastMessage.type === 'success' ? 'check_circle' : toastMessage.type === 'error' ? 'cancel' : 'info'}
            </span>
            <span>{toastMessage.message}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-2 text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Page Header */}
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Order Operations &amp; Dispatch
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Live tracking, fulfillment management, and order dispatch across all service categories.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/delivery"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/80 shadow-xs transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/40"
              title="Open Live Delivery & Logistics Fleet Console"
            >
              <span className="material-symbols-outlined text-base">local_shipping</span>
              <span>Delivery Live</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </Link>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Orders</span>
            </button>
          </div>
        </section>

        {/* 4 Metric KPI Cards (Click to filter) */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Active In Prep */}
          <div
            onClick={() => handleStatusFilterChange(statusFilter === 'PREPARING' ? 'ALL' : 'PREPARING')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
              statusFilter === 'PREPARING'
                ? 'border-[#FF6B35] bg-orange-50/40 ring-2 ring-[#FF6B35]/40 dark:border-[#FF6B35] dark:bg-orange-950/20'
                : 'border-slate-200/80 bg-white hover:border-orange-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                In Preparation
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">soup_kitchen</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {activeOrders.length}
              </span>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                Cooking &amp; Packing
              </span>
            </div>
          </div>

          {/* Out for Delivery */}
          <div
            onClick={() => handleStatusFilterChange(statusFilter === 'OUT_FOR_DELIVERY' ? 'ALL' : 'OUT_FOR_DELIVERY')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
              statusFilter === 'OUT_FOR_DELIVERY'
                ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-400/40 dark:border-blue-500 dark:bg-blue-950/20'
                : 'border-slate-200/80 bg-white hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Out for Delivery
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">moped</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {transitOrders.length}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Live on Road
              </span>
            </div>
          </div>

          {/* Delivered Today */}
          <div
            onClick={() => handleStatusFilterChange(statusFilter === 'DELIVERED' ? 'ALL' : 'DELIVERED')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
              statusFilter === 'DELIVERED'
                ? 'border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-400/40 dark:border-emerald-500 dark:bg-emerald-950/20'
                : 'border-slate-200/80 bg-white hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Completed Deliveries
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {deliveredOrders.length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ETB {totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Cancelled Orders */}
          <div
            onClick={() => handleStatusFilterChange(statusFilter === 'CANCELLED' ? 'ALL' : 'CANCELLED')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
              statusFilter === 'CANCELLED'
                ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/40 dark:border-rose-500 dark:bg-rose-950/20'
                : 'border-slate-200/80 bg-white hover:border-rose-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Cancelled / Refunds
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/60 dark:bg-rose-950/40 dark:ring-rose-800/40">
                <span className="material-symbols-outlined text-lg">cancel</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                {cancelledOrders.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Auto Refunded
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar with Search and Dropdowns */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>
          <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

          {/* Search Input */}
          <div className="relative h-11 min-w-[280px] flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by order ID, customer, store, courier, or 6-digit PIN..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Categories ({ordersList.length})</option>
              {ORDER_TYPES.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fulfillment Status Filter */}
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Fulfillment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Statuses ({ordersList.length})</option>
              <option value="PENDING">Pending Confirmation</option>
              <option value="PREPARING">In Preparation</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered &amp; Complete</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Payment
            </label>
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Payments</option>
              <option value="WALLET">Digital Wallet</option>
              <option value="CASH">Cash on Delivery</option>
              <option value="PAID">Paid Only</option>
              <option value="PENDING">Payment Pending</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Timeframe
            </label>
            <select
              value={timeframeFilter}
              onChange={(e) => {
                setTimeframeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today Only</option>
              <option value="LAST_24">Last 24 Hours</option>
              <option value="LAST_7">Last 7 Days</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL' || paymentFilter !== 'ALL' || timeframeFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                handleStatusFilterChange('ALL')
                handleCategoryChange('ALL')
                setPaymentFilter('ALL')
                setTimeframeFilter('ALL')
                setCurrentPage(1)
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Orders Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <th className="px-5 py-3.5">Order &amp; Type</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Store &amp; Branch</th>
                  <th className="px-5 py-3.5">Courier Dispatch</th>
                  <th className="px-5 py-3.5">Amount &amp; Pay</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Timeline</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-500 dark:text-zinc-400">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800">
                        <span className="material-symbols-outlined text-2xl">receipt_long</span>
                      </div>
                      <p className="mt-2 text-sm font-bold text-slate-800 dark:text-zinc-200">
                        No orders match your active filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          handleStatusFilterChange('ALL')
                          handleCategoryChange('ALL')
                        }}
                        className="mt-3 text-xs font-bold text-[#FF6B35] hover:underline"
                      >
                        Reset filters to view all orders
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const catMeta = ORDER_TYPES.find((t) => t.code === order.order_type) || ORDER_TYPES[0]
                    const statMeta = ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING

                    return (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40"
                      >
                        {/* Order ID & Category badge */}
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2.5">
                            <span
                              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-2xs"
                              style={{ backgroundColor: `${catMeta.color}15`, color: catMeta.color }}
                              title={catMeta.label}
                            >
                              <span className="material-symbols-outlined text-base">{catMeta.icon}</span>
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <Link
                                  to={`/orders/${order.id}`}
                                  className="font-['Plus_Jakarta_Sans'] font-extrabold text-slate-900 transition hover:text-[#FF6B35] dark:text-zinc-100 dark:hover:text-[#FF6B35]"
                                >
                                  {order.order_number}
                                </Link>
                                {order.is_prescription_uploaded && (
                                  <span
                                    className="material-symbols-outlined text-sm text-sky-600 dark:text-sky-400"
                                    title="Doctor Prescription Verified"
                                  >
                                    verified
                                  </span>
                                )}
                              </div>
                              <span className={`mt-0.5 inline-block rounded-md px-1.5 py-0.2 text-[10px] font-bold ${catMeta.badgeClass}`}>
                                {catMeta.shortLabel}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={order.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                              alt={order.customer?.name}
                              className="h-8 w-8 rounded-full border object-cover shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-zinc-100">
                                {order.customer?.name}
                              </p>
                              <p className="text-[11px] font-mono text-slate-400">
                                {order.customer?.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Store & Branch */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-800 dark:text-zinc-200">
                            {order.merchant?.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {order.branch?.name}
                          </p>
                        </td>

                        {/* Courier Dispatch */}
                        <td className="px-5 py-4">
                          {order.rider ? (
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                                <span className="material-symbols-outlined text-sm">moped</span>
                              </span>
                              <div>
                                <p className="font-bold text-slate-800 dark:text-zinc-200">
                                  {order.rider.name}
                                </p>
                                <p className="font-mono text-[10px] text-slate-400">
                                  {order.rider.plate_number}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(order)}
                              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 px-2.5 py-1 text-[11px] font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300"
                            >
                              <span className="material-symbols-outlined text-xs">add</span>
                              <span>Assign Courier</span>
                            </button>
                          )}
                        </td>

                        {/* Total Amount & Payment */}
                        <td className="px-5 py-4">
                          <p className="font-mono font-extrabold text-slate-900 dark:text-zinc-100">
                            ETB {Number(order.total_amount).toFixed(2)}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1 text-[10px]">
                            <span className={`font-semibold ${order.payment_status === 'PAID' ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {order.payment_status}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">{order.payment_method}</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${statMeta.badgeClass}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statMeta.dotClass}`} />
                            <span>{statMeta.shortLabel}</span>
                          </span>
                        </td>

                        {/* Timeline */}
                        <td className="px-5 py-4 font-mono text-slate-500 dark:text-zinc-400">
                          <p className="font-bold text-slate-700 dark:text-zinc-300">
                            {order.order_status_tracking?.order_placed_at || 'Today'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            PIN: {order.delivery_confirmation_code}
                          </p>
                        </td>

                        {/* Action Column - Only Detail Icon */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(order)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:border-[#FF6B35] hover:bg-orange-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-[#FF6B35] dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
                              title="View Order Details"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pagination Section */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(size) => {
              setRowsPerPage(size)
              setCurrentPage(1)
            }}
          />
        </section>
      </div>
    </MainLayout>
  )
}
