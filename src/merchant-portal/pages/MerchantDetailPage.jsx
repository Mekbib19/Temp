import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import MerchantPortalLayout from '../layouts/MerchantPortalLayout'
import DataTable from '../../components/DataTable'
import { getMerchantById, loadStoredMerchants, getCategoryMeta } from '../../data/demoMerchants'
import { generateOrdersForMerchant } from '../../data/demoOrders'

export default function MerchantDetailPage() {
  const { merchantId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const merchantsList = useMemo(() => loadStoredMerchants(), [])

  // Resolve single merchant - strictly for this merchant only
  const merchant = useMemo(() => {
    if (merchantId) {
      const found = merchantsList.find((m) => m.id === merchantId || m.merchant_id === merchantId)
      if (found) return found
    }
    const withBranches = merchantsList.find((m) => Array.isArray(m.branches) && m.branches.length > 0)
    return withBranches || getMerchantById('m-002') || merchantsList[0]
  }, [merchantId, merchantsList])

  const [activeTab, setActiveTab] = useState('overview')
  const [toastMessage, setToastMessage] = useState(() => location.state?.toast || null)

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
        window.history.replaceState({}, document.title)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const branches = useMemo(() => {
    if (!merchant) return []
    if (Array.isArray(merchant.branches) && merchant.branches.length > 0) {
      return merchant.branches
    }
    return [
      {
        id: 'b-main',
        branch_name: `${merchant.name} - Old Airport Flagship`,
        address: merchant.address || 'Central Commercial Boulevard, Addis Ababa',
        phone: merchant.phone || '+251 91 123 4567',
        is_main_branch: true,
        is_open: true,
        opening_hours: '07:30 AM',
        closing_hours: '09:30 PM',
        manager_name: 'Dawit Haile',
        manager_phone: '+251 91 876 5432',
      },
    ]
  }, [merchant])

  // Merchant orders across branches
  const [orders] = useState(() => generateOrdersForMerchant(merchant))

  const currentBranch = useMemo(
    () => branches.find((b) => b.is_main_branch) || branches[0] || {},
    [branches]
  )

  const catMeta = getCategoryMeta(merchant?.category_name || merchant?.type)

  const merchantStats = useMemo(() => {
    const computedRevenue = orders.reduce((acc, order) => {
      const amount =
        typeof order.totalNum === 'number'
          ? order.totalNum
          : parseFloat(String(order.total || order.amount || '').replace(/[^0-9.]/g, '')) || 0
      return acc + amount
    }, 0)
    const baseRevenue = computedRevenue > 0 ? computedRevenue : 68400

    return {
      todayRevenueFormatted: `ETB ${Math.round(baseRevenue).toLocaleString()}`,
      totalOrders: orders.length,
      fulfillmentRate: '98.2%',
      avgPrepTime: '16.5 min',
      customerRating: merchant?.average_rating || merchant?.rating || 4.8,
      reviewCount: merchant?.total_reviews || 532,
    }
  }, [orders, merchant])

  // Root sidebar navigation items for the Merchant Page
  const sidebarItems = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: 'dashboard', badge: null, section: 'Overview' },
      { id: 'branches', label: 'Branches', icon: 'store', badge: branches.length, section: 'Branches' },
      { id: 'details', label: 'Brand & Compliance', icon: 'verified', badge: null, section: 'Branding' },
      { id: 'orders', label: 'Consolidated Orders', icon: 'receipt_long', badge: orders.length, section: 'Order Management' },
    ],
    [branches.length, orders.length]
  )

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  // Columns for branches table
  const branchColumns = useMemo(
    () => [
      {
        accessorKey: 'branch_name',
        header: 'Branch Outlet',
        cell: (info) => {
          const row = info.row.original
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/60 font-bold">
                <span className="material-symbols-outlined text-lg">store</span>
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-zinc-100">{row.branch_name}</p>
                <p className="text-[10px] text-slate-400">
                  {row.is_main_branch ? 'Flagship Headquarters' : 'Satellite Outlet'}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'address',
        header: 'Location & Contact',
        cell: (info) => {
          const row = info.row.original
          return (
            <div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">{row.address}</p>
              <p className="text-[10px] text-slate-400">{row.phone}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'manager_name',
        header: 'Branch Lead',
        cell: (info) => {
          const row = info.row.original
          return (
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{row.manager_name || 'Designated Lead'}</p>
              <p className="text-[10px] text-slate-400">{row.manager_phone || row.phone}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'is_open',
        header: 'Status',
        cell: (info) => {
          const isOpen = info.getValue() !== false
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                isOpen
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isOpen ? 'Open Now' : 'Closed'}</span>
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Action',
        cell: (info) => {
          const row = info.row.original
          return (
            <button
              type="button"
              onClick={() => navigate(`/portal/branches/${row.id}`)}
              className="inline-flex items-center gap-1 rounded-xl bg-[#FF6B35] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#e0531f] transition cursor-pointer"
            >
              <span>Launch Branch Ops</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          )
        },
      },
    ],
    [navigate]
  )

  if (!merchant) {
    return (
      <MerchantPortalLayout portalType="merchant">
        <div className="py-16 text-center max-w-md mx-auto">
          <p className="text-base font-bold text-slate-800 dark:text-white">Merchant not found</p>
        </div>
      </MerchantPortalLayout>
    )
  }

  return (
    <MerchantPortalLayout
      portalType="merchant"
      activeTab={activeTab}
      setActiveTab={handleTabChange}
      sidebarItems={sidebarItems}
      merchant={merchant}
      breadcrumbMiddle="Merchant Management"
      breadcrumbCurrent={merchant.name}
      operatorName="Selamawit Haile"
      operatorRole="Merchant Partner (Owner)"
      operatorEmail={merchant.email || 'owner@wholeharvest.com'}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Top Header Action Bar */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {merchant.name}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Partner
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              Merchant Partner Command Console &bull; Manage your brand profile, operating branches, and regulatory compliance.
            </p>
          </div>
        </section>

        {/* Merchant Profile Card - Clean Super Admin Styled (No Giant Banner) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-md dark:border-zinc-700 sm:h-24 sm:w-24">
              <img src={merchant.logo} alt={merchant.name} className="h-full w-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {merchant.name}
                </h2>
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${catMeta.badgeClass}`}>
                  {catMeta.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-200">
                  <span className="material-symbols-outlined text-sm text-[#FF6B35]">verified</span>
                  {merchant.license_number || 'EFDA-LICENSED-2024'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-2">
                <span>{merchant.address || 'Addis Ababa, Ethiopia'}</span>
                <span aria-hidden="true">&bull;</span>
                <span className="font-semibold text-slate-700 dark:text-zinc-300">{branches.length} Operating Branches</span>
                <span aria-hidden="true">&bull;</span>
                <span className="font-bold text-amber-500 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-sm">star</span>
                  {merchant.average_rating || 4.8} ({merchant.total_reviews || 532} Reviews)
                </span>
                <span aria-hidden="true">&bull;</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  SLA: {merchant.delivery_sla || '25-40 min'}
                </span>
              </div>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-4xl">
                {merchant.description}
              </p>
            </div>
          </div>

          {/* Specialties Badges */}
          {Array.isArray(merchant.specialties) && merchant.specialties.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Specialties:</span>
              {merchant.specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-zinc-300"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4 Metric Stats Cards - Super Admin Overview Style */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Today&apos;s Revenue
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <span className="material-symbols-outlined text-base">payments</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{merchantStats.todayRevenueFormatted}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              +14.2% vs yesterday
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Orders Dispatched
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                <span className="material-symbols-outlined text-base">local_shipping</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {merchantStats.totalOrders > 0 ? `${merchantStats.totalOrders} Orders` : '64 Orders'}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              {merchantStats.fulfillmentRate} fulfillment rate
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Avg Prep SLA
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-base">timer</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{merchantStats.avgPrepTime}</p>
            <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              On-time SLA compliant
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Satisfaction
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                <span className="material-symbols-outlined text-base">star</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {merchantStats.customerRating} / 5.0
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              From {merchantStats.reviewCount} ratings
            </p>
          </div>
        </section>

        {/* Content Tabs (driven by root side menu) */}
        {/* TAB 0: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-in fade-in duration-200">
            <div className="space-y-6 lg:col-span-8">
              {/* All Branches & Locations */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">store</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      All Branches &amp; Locations ({branches.length})
                    </h3>
                    <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                      • Direct access to branch roster &amp; live status
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {branches.map((b, idx) => {
                    const branchKey = b.id || idx
                    const branchOrdersCount =
                      orders.filter(
                        (o) =>
                          (o.branchName || '').toLowerCase() ===
                          (b.branch_name || '').toLowerCase()
                      ).length || Math.max(4, 18 - idx * 4)
                    const isOpen = b.is_open !== false

                    return (
                      <div
                        key={branchKey}
                        onClick={() => navigate(`/portal/branches/${b.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            navigate(`/portal/branches/${b.id}`)
                          }
                        }}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B35] hover:bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-850/50 dark:hover:border-orange-500 dark:hover:bg-zinc-850 cursor-pointer"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] transition group-hover:bg-[#FF6B35] group-hover:text-white dark:bg-orange-950/40 dark:text-orange-400">
                            <span className="material-symbols-outlined text-xl">storefront</span>
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 transition group-hover:text-[#FF6B35] dark:text-zinc-100">
                                {b.branch_name}
                              </h4>
                              {b.is_main_branch && (
                                <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-[#FF6B35] dark:bg-orange-950/60 dark:text-orange-300">
                                  HQ / Main
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isOpen
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {isOpen ? 'Open' : 'Closed'}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
                                <span>{b.address || 'Central District, Addis Ababa'}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-slate-400">schedule</span>
                                <span className="font-mono text-[10px]">
                                  {b.opening_hours || '08:00 AM'} - {b.closing_hours || '10:00 PM'}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-slate-400">person</span>
                                <span>{b.manager_name || 'Designated Manager'}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-slate-400">receipt_long</span>
                                <span className="font-bold text-slate-700 dark:text-zinc-300">
                                  {branchOrdersCount} orders today
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/portal/branches/${b.id}`)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-[#FF6B35] transition hover:bg-[#FF6B35] hover:text-white dark:bg-orange-950/50 dark:text-orange-400"
                            title={`Open ${b.branch_name} details`}
                          >
                            <span>Branch Details</span>
                            <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {branches.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                      <p>No branches registered yet for {merchant.name}.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Branch Network Performance Comparison */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">store</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Branch Network Performance Comparison ({branches.length} Locations)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('branches')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    Manage Locations &amp; GPS →
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                        <th className="pb-2.5">Branch Location</th>
                        <th className="pb-2.5">Manager</th>
                        <th className="pb-2.5 text-center">Live Status</th>
                        <th className="pb-2.5 text-right">Orders Today</th>
                        <th className="pb-2.5 text-right">Fulfillment</th>
                        <th className="pb-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                      {branches.map((b, idx) => {
                        const branchOrdersCount =
                          orders.filter(
                            (o) =>
                              (o.branchName || '').toLowerCase() ===
                              (b.branch_name || '').toLowerCase()
                          ).length || Math.max(8, 24 - idx * 5)
                        return (
                          <tr key={b.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                            <td className="py-2.5 font-bold text-slate-900 dark:text-zinc-100">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-[#FF6B35]">pin_drop</span>
                                <span>{b.branch_name}</span>
                                {b.is_main_branch && (
                                  <span className="rounded-md bg-orange-100 px-1.5 py-0.2 text-[9px] font-bold text-[#FF6B35] dark:bg-orange-950/60">
                                    HQ
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-normal pl-5 block">
                                {b.address || 'Addis Ababa'}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-600 dark:text-zinc-400">
                              {b.manager_name || 'Designated Staff'}
                            </td>
                            <td className="py-2.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  b.is_open !== false
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${b.is_open !== false ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {b.is_open !== false ? 'Open' : 'Closed'}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-bold text-slate-900 dark:text-zinc-100">
                              {branchOrdersCount}
                            </td>
                            <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">98.8%</td>
                            <td className="py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => navigate(`/portal/branches/${b.id}`)}
                                className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-[11px] font-bold text-[#FF6B35] hover:bg-orange-100 dark:bg-orange-950/40 cursor-pointer"
                              >
                                <span>Stats</span>
                                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily Peak Volume Heatmap */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-amber-500">schedule</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Daily Peak Volume Heatmap &amp; Order Rush Hours
                  </h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                    <span className="text-slate-400 block text-[11px]">Breakfast Rush</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 mt-1 block">08:00 AM - 10:30 AM</span>
                    <span className="mt-1 inline-block text-[10px] text-slate-500">18% of daily volume</span>
                  </div>
                  <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 dark:border-orange-900/40 dark:bg-orange-950/20">
                    <span className="text-[#FF6B35] font-bold block text-[11px]">Lunch Surge (Peak)</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 mt-1 block">12:00 PM - 02:30 PM</span>
                    <span className="mt-1 inline-block text-[10px] font-bold text-[#FF6B35]">44% of daily volume</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                    <span className="text-slate-400 block text-[11px]">Afternoon Snack</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 mt-1 block">03:30 PM - 05:30 PM</span>
                    <span className="mt-1 inline-block text-[10px] text-slate-500">12% of daily volume</span>
                  </div>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                    <span className="text-blue-700 dark:text-blue-300 font-bold block text-[11px]">Dinner Rush</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 mt-1 block">07:00 PM - 09:30 PM</span>
                    <span className="mt-1 inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400">26% of daily volume</span>
                  </div>
                </div>
              </div>

              {/* Merchant Bio */}
              {merchant.description && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">description</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Merchant Bio &amp; Culinary Concept
                    </h3>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                    {merchant.description}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:col-span-4">
              {/* Partner Overview */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-indigo-500">storefront</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Partner Overview</h3>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Brand Email</span>
                    <p className="mt-0.5 font-mono text-slate-800 dark:text-zinc-200">
                      {merchant.email || 'partner@delivery.et'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">Customer Support Phone</span>
                    <p className="mt-0.5 font-semibold text-slate-800 dark:text-zinc-200">
                      {merchant.phone || '+251 91 123 4567'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">Total Operating Branches</span>
                    <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                      {branches.length} {branches.length === 1 ? 'location' : 'locations'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('branches')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <span>Explore All Branches</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              {/* Main Location */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">store</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Main Location</h3>
                  </div>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {currentBranch.is_open !== false ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Address:</span>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.address || merchant.address || 'Central Commercial District, Addis Ababa'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Hours:</span>
                    <p className="font-mono text-slate-800 dark:text-zinc-200">
                      {currentBranch.opening_hours || '08:00 AM'} - {currentBranch.closing_hours || '10:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: OPERATING BRANCHES DIRECTORY */}
        {activeTab === 'branches' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Branches</h3>
                <p className="text-xs text-slate-500">View your branch outlets and add a new branch to your brand</p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[#FF6B35] mr-2">{branches.length} Outlets</span>
                <button
                  type="button"
                  onClick={() => navigate(`/portal/merchants/${merchant.id}/branches/new`)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_business</span>
                  <span>Add Branch</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
              <DataTable columns={branchColumns} data={branches} enablePagination={false} />
            </div>
          </div>
        )}

        {/* TAB 2: BRAND DETAILS & COMPLIANCE */}
        {activeTab === 'details' && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Regulatory Compliance & Merchant Coordinates
              </h3>
              <p className="text-xs text-slate-500">Official business registration and health safety standards</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">EFDA License</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {merchant.license_number || 'EFDA-MED-2024-8841'}
                </p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Verified & Active</p>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Support Phone</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{merchant.phone}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Direct merchant hotline</p>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing Email</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{merchant.email}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Verified accounting contact</p>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Headquarters</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{merchant.address}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Addis Ababa, Ethiopia</p>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Commission</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {merchant.commission_rate || 10}%
                </p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Tier 1 Partner Rate</p>
              </div>

              <div className="rounded-2xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cold Chain Storage</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {merchant.is_cold_chain ? 'Certified Cold-Chain' : 'Standard Fulfillment'}
                </p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Temperature Monitored</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS ACROSS OUTLETS */}
        {activeTab === 'orders' && (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Consolidated Orders Stream
                </h3>
                <p className="text-xs text-slate-500">Live order flow across all your operating branch outlets</p>
              </div>
              <span className="text-xs font-bold text-[#FF6B35]">{orders.length} Live Orders</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {orders.slice(0, 8).map((ord) => (
                <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">{ord.id}</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{ord.customer?.name}</span>
                      <span className="text-[11px] text-slate-400">&bull; {ord.branchName || 'Main Branch'}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{ord.items}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs">{ord.amount}</span>
                    <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-950/40">
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MerchantPortalLayout>
  )
}
