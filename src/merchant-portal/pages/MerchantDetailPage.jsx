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

  const [activeTab, setActiveTab] = useState('branches')
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

  const catMeta = getCategoryMeta(merchant?.category_name || merchant?.type)

  // Root sidebar navigation items for the Merchant Page
  const sidebarItems = useMemo(
    () => [
      { id: 'branches', label: 'Operating Branches', icon: 'store', badge: branches.length },
      { id: 'add_branch', label: 'Add Branch', icon: 'add_business', badge: null },
      { id: 'details', label: 'Brand & Compliance', icon: 'verified', badge: null },
      { id: 'orders', label: 'Consolidated Orders', icon: 'receipt_long', badge: orders.length },
    ],
    [branches.length, orders.length]
  )

  const handleTabChange = (tabId) => {
    if (tabId === 'add_branch') {
      navigate(`/portal/merchants/${merchant?.id || ''}/branches/new`)
      return
    }
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

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/portal/merchants/${merchant.id}/branches/new`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add_business</span>
              <span>Add Branch</span>
            </button>
            {branches[0] && (
              <button
                type="button"
                onClick={() => navigate(`/portal/branches/${branches[0].id}`)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer transition"
              >
                <span className="material-symbols-outlined text-sm">storefront</span>
                <span>Open Primary Branch</span>
              </button>
            )}
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

        {/* 4 Metric Stats Cards - 100% Super Admin Styled */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Operating Outlets
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-base">store</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{branches.length}</p>
            <p className="mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              100% Active in Addis Ababa
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Today&apos;s Revenue
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <span className="material-symbols-outlined text-base">payments</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">ETB 68,400</p>
            <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              +12.4% vs yesterday
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Active Orders
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                <span className="material-symbols-outlined text-base">receipt_long</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-[#FF6B35] dark:text-orange-400">{orders.length}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Across all branches
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Partner SLA
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                <span className="material-symbols-outlined text-base">speed</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">98.2%</p>
            <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Prime Tier Fulfillment
            </p>
          </div>
        </section>

        {/* Content Tabs (driven by root side menu) */}
        {/* TAB 1: OPERATING BRANCHES DIRECTORY */}
        {activeTab === 'branches' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Operating Branches</h3>
                <p className="text-xs text-slate-500">Active restaurant and store outlets managed by your brand</p>
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
