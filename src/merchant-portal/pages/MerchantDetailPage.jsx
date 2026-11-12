import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import MerchantPortalLayout from '../layouts/MerchantPortalLayout'
import DataTable from '../../components/DataTable'
import { getMerchantById, loadStoredMerchants, updateMerchant } from '../../data/demoMerchants'
import { loadStoredCategories } from '../../data/demoCategories'
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

  const queryTab = useMemo(() => {
    const query = new URLSearchParams(location.search)
    const tabParam = query.get('tab')
    return tabParam && ['overview', 'branches', 'analysis', 'settings'].includes(tabParam) ? tabParam : null
  }, [location.search])

  const [activeTabState, setActiveTabState] = useState(() => {
    const query = new URLSearchParams(location.search)
    const tabParam = query.get('tab')
    if (tabParam && ['overview', 'branches', 'analysis', 'settings'].includes(tabParam)) {
      return tabParam
    }
    return location.state?.tab || 'overview'
  })

  const activeTab = queryTab || activeTabState
  const setActiveTab = (tab) => {
    setActiveTabState(tab)
    navigate(`/portal/merchants/${merchant?.id || ''}?tab=${tab}`, { replace: true })
  }
  const [toastMessage, setToastMessage] = useState(() => location.state?.toast || null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

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

  const branchMetrics = useMemo(() => {
    const total = branches.length
    const openCount = branches.filter((b) => b.is_open !== false).length
    const flagships = branches.filter((b) => b.is_main_branch).length || 1
    const satellites = Math.max(0, total - flagships)
    const indoor = branches.reduce((acc, b) => acc + (Number(b.indoor_seats) || 36), 0)
    const outdoor = branches.reduce((acc, b) => acc + (Number(b.outdoor_seats) || 12), 0)
    const totalSeats = indoor + outdoor
    return {
      total,
      openCount,
      flagships,
      satellites,
      indoor,
      outdoor,
      totalSeats,
    }
  }, [branches])

  // Root sidebar navigation items for the Merchant Page: Overview, Branches, Analysis, Settings
  const sidebarItems = useMemo(
    () => [
      { id: 'overview', label: 'Overview', icon: 'dashboard', badge: null },
      { id: 'branches', label: 'Branches', icon: 'store', badge: branches.length },
      { id: 'analysis', label: 'Analysis', icon: 'insights', badge: null },
      { id: 'settings', label: 'Settings', icon: 'settings', badge: null },
    ],
    [branches.length]
  )

  // Analysis Tab States & Filters
  const [analysisTimeframe, setAnalysisTimeframe] = useState('30d') // '7d' | '30d' | '90d' | 'ytd'
  const [selectedAnalysisBranch, setSelectedAnalysisBranch] = useState('all')
  const [hoveredAnalysisDayIndex, setHoveredAnalysisDayIndex] = useState(null)

  const [settingsForm, setSettingsForm] = useState(() => ({
    name: merchant?.name || '',
    category_name: merchant?.category_name || merchant?.type || 'Food',
    cuisine_name: merchant?.cuisine_name || 'Healthy & Organic, Salads',
    phone: merchant?.phone || '+251 91 123 4567',
    email: merchant?.email || 'partner@delivery.et',
    description: merchant?.description || '',
    address: merchant?.address || 'Central Commercial District, Addis Ababa',
    city: merchant?.city || 'Addis Ababa',
    logo: merchant?.logo || merchant?.logo_url || '',
    banner: merchant?.cover_image_url || merchant?.banner_url || merchant?.cover || '',
    opening_hours: merchant?.opening_hours || '07:30 AM',
    closing_hours: merchant?.closing_hours || '09:30 PM',
    prep_buffer: merchant?.prep_buffer || '15 - 20 mins',
    commission_rate: merchant?.commission_rate || 10,
    min_order_amount: merchant?.min_order_amount || 150,
    license_number: merchant?.license_number || 'EFDA-MED-2024-8841',
    tin_number: merchant?.tin_number || 'TIN-009842103',
    health_permit: merchant?.health_permit || 'AA-HEALTH-PERMIT-991',
    bank_name: merchant?.bank_name || 'Telebirr SuperApp Merchant',
    account_name: merchant?.account_name || merchant?.name || 'Merchant Enterprise',
    account_number: merchant?.account_number || '+251 91 123 4567',
    is_open: merchant?.is_open !== false,
  }))

  const [categoriesList] = useState(() => loadStoredCategories())
  const logoInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Logo file too large (max 5MB)')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setSettingsForm((prev) => ({ ...prev, logo: reader.result }))
        showToast('Brand logo uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Cover banner file too large (max 8MB)')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        setSettingsForm((prev) => ({ ...prev, banner: reader.result }))
        showToast('Cover banner uploaded successfully')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveSettings = (e) => {
    if (e) e.preventDefault()
    if (merchant?.id) {
      updateMerchant(merchant.id, settingsForm)
    }
    showToast('Merchant information updated successfully!')
  }

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

  const analysisDailyData = useMemo(
    () => [
      { day: 'Mon', fullDay: 'Monday, Nov 3', revenue: 42300, orders: 184, height: 65 },
      { day: 'Tue', fullDay: 'Tuesday, Nov 4', revenue: 48900, orders: 198, height: 75 },
      { day: 'Wed', fullDay: 'Wednesday, Nov 5', revenue: 53400, orders: 215, height: 82 },
      { day: 'Thu', fullDay: 'Thursday, Nov 6', revenue: 47200, orders: 192, height: 72 },
      { day: 'Fri', fullDay: 'Friday, Nov 7', revenue: 61800, orders: 248, height: 95 },
      { day: 'Sat', fullDay: 'Saturday, Nov 8 (Peak)', revenue: 64900, orders: 264, height: 100 },
      { day: 'Sun', fullDay: 'Sunday, Nov 9', revenue: 56500, orders: 227, height: 87 },
    ],
    []
  )

  const topMenuItems = useMemo(
    () => [
      { id: 1, name: 'Organic Quinoa Harvest Bowl', category: 'Bowls & Salads', units: 342, revenue: 82080, share: 23.5, trend: '+14.2%' },
      { id: 2, name: 'Avocado Citrus Summer Salad', category: 'Bowls & Salads', units: 295, revenue: 56050, share: 16.1, trend: '+9.8%' },
      { id: 3, name: 'Grilled Herb Chicken Wrap', category: 'Warm Entrees', units: 218, revenue: 47960, share: 13.7, trend: '+18.5%' },
      { id: 4, name: 'Acai Berry Energy Bowl', category: 'Superfood Bowls', units: 186, revenue: 42780, share: 12.3, trend: '+6.1%' },
      { id: 5, name: 'Cold-Pressed Green Glow Juice', category: 'Beverages', units: 264, revenue: 29040, share: 8.3, trend: '+22.4%' },
    ],
    []
  )

  const handleExportAnalysisCSV = () => {
    const rows = [
      ['Date / Day', 'Revenue (ETB)', 'Total Orders', 'Average Order Value (ETB)'],
      ...analysisDailyData.map((d) => [d.fullDay, d.revenue, d.orders, Math.round(d.revenue / d.orders)]),
      [],
      ['Top Selling Dishes', 'Category', 'Units Sold', 'Revenue (ETB)', 'Sales Share %'],
      ...topMenuItems.map((item) => [item.name, item.category, item.units, item.revenue, `${item.share}%`]),
    ]
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${merchant?.name || 'merchant'}-analysis-report.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    showToast('Exported Business Analysis report as CSV.')
  }

  const handleExportAnalysisPDF = () => {
    window.print()
    showToast('Printing / exporting Analysis summary report...')
  }

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
      breadcrumbMiddle={merchant.name}
      breadcrumbCurrent={sidebarItems.find((i) => i.id === activeTab)?.label || 'Overview'}
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
        {/* Top Header Action Bar - Dynamically updates to clicked side menu name */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white capitalize">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'branches' && 'Branches'}
                {activeTab === 'analysis' && 'Analysis & Insights'}
                {activeTab === 'settings' && 'Merchant Settings'}
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active Partner
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
              <span className="font-bold text-slate-700 dark:text-zinc-300">{merchant.name}</span> &bull;{' '}
              {activeTab === 'overview' && 'Operational summary, performance metrics, and quick branch roster.'}
              {activeTab === 'branches' && 'Manage, monitor, and configure all operating branch outlets.'}
              {activeTab === 'analysis' && 'In-depth sales velocity, peak ordering hours, and financial analysis.'}
              {activeTab === 'settings' && 'Adjust brand details, operating hours, compliance licenses, and payout accounts.'}
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400 sm:self-auto">
            <span className="material-symbols-outlined text-base">
              {activeTab === 'overview' && 'dashboard'}
              {activeTab === 'branches' && 'store'}
              {activeTab === 'analysis' && 'insights'}
              {activeTab === 'settings' && 'settings'}
            </span>
            <span>
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'branches' && `Branches (${branches.length})`}
              {activeTab === 'analysis' && 'Analysis'}
              {activeTab === 'settings' && 'Settings'}
            </span>
          </span>
        </section>

        {/* Content Tabs (driven by root side menu) */}
        {/* TAB 0: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
        </div>
      )}

        {/* TAB 1: OPERATING BRANCHES DIRECTORY */}
        {activeTab === 'branches' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header for Branches */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[#FF6B35] mr-2">
                  {branches.length} {branches.length === 1 ? 'Outlet' : 'Outlets'}
                </span>
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

            {/* 4 Overview Stat Cards for Branch Network */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Total Operating Branches
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-base">storefront</span>
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {branchMetrics.total} {branchMetrics.total === 1 ? 'Location' : 'Locations'}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  {branchMetrics.flagships} Flagship &bull; {branchMetrics.satellites} Satellite
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Live Status
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {branchMetrics.openCount} / {branchMetrics.total} Open
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Accepting customer orders</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Dining &amp; Seating Capacity
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40">
                    <span className="material-symbols-outlined text-base">chair</span>
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {branchMetrics.totalSeats} Seats
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  {branchMetrics.indoor} Indoor &bull; {branchMetrics.outdoor} Outdoor
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Network Dispatched
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                    <span className="material-symbols-outlined text-base">moped</span>
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {merchantStats.totalOrders > 0 ? `${merchantStats.totalOrders} Orders` : '64 Orders'}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  98.2% on-time fulfillment
                </p>
              </div>
            </section>

            {/* 2-Column Split: Branch List on Left (Decreased Width) + Separator + Partner & Location Info on Right */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
              {/* Left Column: Decreased Width Branch List */}
              <div className="space-y-4 lg:col-span-8">
                <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <DataTable columns={branchColumns} data={branches} enablePagination={false} />
                </div>
              </div>

              {/* Right Column: Partner Overview and Main Location with Separator */}
              <div className="space-y-6 lg:col-span-4 lg:border-l lg:border-slate-200 lg:dark:border-zinc-800 lg:pl-6">
                {/* Partner Overview Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-base text-indigo-500">
                      storefront
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Partner Overview
                    </h3>
                  </div>
                  <div className="mt-4 space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        Brand Email
                      </span>
                      <p className="mt-0.5 font-mono text-slate-800 dark:text-zinc-200">
                        {merchant.email || 'orders@addisgreenfarm.com'}
                      </p>
                    </div>
                    <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Customer Support Phone
                      </span>
                      <p className="mt-0.5 font-semibold text-slate-800 dark:text-zinc-200">
                        {merchant.phone || '+251 92 667 8899'}
                      </p>
                    </div>
                    <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                      <span className="text-[11px] font-semibold text-slate-400">
                        Total Operating Branches
                      </span>
                      <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                        {branches.length} {branches.length === 1 ? 'location' : 'locations'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Main Location Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-[#FF6B35]">
                        store
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        Main Location
                      </h3>
                    </div>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {currentBranch.is_open !== false ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Address:</span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">
                        {currentBranch.address || merchant.address || '42 Debre Zeit Road, Kality Depot'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Hours:</span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">
                        {currentBranch.opening_hours || merchant.opening_hours || '06:30 AM'} -{' '}
                        {currentBranch.closing_hours || merchant.closing_hours || '08:00 PM'}
                      </p>
                    </div>
                    {currentBranch.id && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/portal/branches/${currentBranch.id}`)}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                        >
                          <span>Manage Main Branch Ops</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYSIS & BUSINESS INTELLIGENCE */}
        {activeTab === 'analysis' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Analysis Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/60 font-bold">
                    <span className="material-symbols-outlined text-base">insights</span>
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Business Analysis &amp; Sales Velocity
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Real-time consolidated analytics across all active branches, ordering trends, and kitchen preparation SLAs.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Timeframe Selector */}
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-zinc-800 dark:bg-zinc-850">
                  {[
                    { id: '7d', label: '7 Days' },
                    { id: '30d', label: '30 Days' },
                    { id: '90d', label: '90 Days' },
                    { id: 'ytd', label: 'Year' },
                  ].map((tf) => (
                    <button
                      key={tf.id}
                      type="button"
                      onClick={() => setAnalysisTimeframe(tf.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                        analysisTimeframe === tf.id
                          ? 'bg-white text-[#FF6B35] shadow-xs dark:bg-zinc-800 dark:text-orange-400'
                          : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                {/* Outlet filter */}
                <select
                  value={selectedAnalysisBranch}
                  onChange={(e) => setSelectedAnalysisBranch(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs outline-none transition focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="all">All Outlets ({branches.length})</option>
                  {branches.map((b, i) => (
                    <option key={b.id || i} value={b.id || i}>
                      {b.branch_name}
                    </option>
                  ))}
                </select>

                {/* Export Actions */}
                <button
                  type="button"
                  onClick={handleExportAnalysisCSV}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-750 transition cursor-pointer"
                  title="Download raw data as CSV"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportAnalysisPDF}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#e0531f] transition cursor-pointer"
                  title="Print or save as PDF"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  <span>Print Report</span>
                </button>
              </div>
            </div>

            {/* 4 Primary KPI Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Gross Sales Revenue
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    +18.4%
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  ETB {analysisTimeframe === '7d' ? '324,800' : analysisTimeframe === '90d' ? '986,400' : '348,920'}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
                  <span>Net after commission:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">ETB 314,028</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Total Dispatched Orders
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    +11.2%
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {analysisTimeframe === '7d' ? '348' : analysisTimeframe === '90d' ? '3,840' : '1,428'}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
                  <span>Fulfillment rate:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">98.6% (0.4% cancel)</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Average Order Value (AOV)
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    +6.5%
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">ETB 244.34</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
                  <span>Basket size:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">2.8 Items / ticket</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Customer Retention
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                    <span className="material-symbols-outlined text-xs">star</span>
                    4.8 / 5.0
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">72.8%</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/80 pt-2">
                  <span>Returning buyers:</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200">1,039 of 1,428 orders</span>
                </div>
              </div>
            </div>

            {/* Interactive Daily Sales & Orders Velocity Chart */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Revenue Trend &amp; Daily Order Velocity</span>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Saturday Peak
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Hover over any daily bar to inspect gross sales in ETB and order fulfillment count.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-[#FF6B35]" />
                    <span>Gross Sales (ETB)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Daily Orders</span>
                  </div>
                </div>
              </div>

              {/* Chart Graphic Area */}
              <div className="relative pt-8 pb-2">
                {/* Active Hover Tooltip */}
                {hoveredAnalysisDayIndex !== null && analysisDailyData[hoveredAnalysisDayIndex] && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900 pointer-events-none transition-all">
                    <span className="font-bold">{analysisDailyData[hoveredAnalysisDayIndex].fullDay}:</span>
                    <span className="text-[#FF6B35] font-black">
                      ETB {analysisDailyData[hoveredAnalysisDayIndex].revenue.toLocaleString()}
                    </span>
                    <span className="text-slate-400 dark:text-zinc-500">&bull;</span>
                    <span className="text-emerald-400 dark:text-emerald-600 font-bold">
                      {analysisDailyData[hoveredAnalysisDayIndex].orders} Orders
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-56 border-b border-slate-200 dark:border-zinc-800 px-2 pb-2">
                  {analysisDailyData.map((d, idx) => {
                    const isHovered = hoveredAnalysisDayIndex === idx
                    return (
                      <div
                        key={d.day}
                        onMouseEnter={() => setHoveredAnalysisDayIndex(idx)}
                        onMouseLeave={() => setHoveredAnalysisDayIndex(null)}
                        className="flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        <div className="relative w-full flex justify-center items-end h-full">
                          {/* Order volume dot indicator */}
                          <div
                            className="absolute z-10 -top-2 flex items-center justify-center transition group-hover:scale-125"
                            style={{ bottom: `${d.height}%` }}
                          >
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                          </div>

                          {/* Bar */}
                          <div
                            style={{ height: `${d.height}%` }}
                            className={`w-full max-w-[36px] rounded-t-xl transition-all duration-200 ${
                              isHovered
                                ? 'bg-[#FF6B35] shadow-md shadow-orange-500/20'
                                : 'bg-orange-500/80 hover:bg-[#FF6B35] dark:bg-orange-600/70'
                            }`}
                          />
                        </div>
                        <div className="mt-3 text-center">
                          <p className={`text-xs font-bold transition ${isHovered ? 'text-[#FF6B35]' : 'text-slate-700 dark:text-zinc-300'}`}>
                            {d.day}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                            {(d.revenue / 1000).toFixed(1)}k
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Split Grid: Top Selling Dishes + Peak Hours Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Top Selling Items (8 cols) */}
              <div className="lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Top Performing Menu Items
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Ranked by units sold and gross revenue contribution across branches.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#FF6B35]">5 Best Sellers</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {topMenuItems.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-xs font-black text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                          #{item.id}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {item.category} &bull; {item.units} portions sold
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 text-right">
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            ETB {item.revenue.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {item.trend} volume
                          </p>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {item.share}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Peak Hours Velocity & Category Share (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Category Contribution */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                    Category Sales Distribution
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">
                    Share of total brand orders
                  </p>

                  <div className="space-y-3">
                    {[
                      { name: 'Fresh Bowls & Salads', pct: 44, color: 'bg-[#FF6B35]' },
                      { name: 'Warm Entrees & Wraps', pct: 28, color: 'bg-amber-500' },
                      { name: 'Cold-Pressed Juices', pct: 18, color: 'bg-emerald-500' },
                      { name: 'Desserts & Healthy Snacks', pct: 10, color: 'bg-blue-500' },
                    ].map((cat) => (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700 dark:text-zinc-300">{cat.name}</span>
                          <span className="text-slate-900 dark:text-white">{cat.pct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                          <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Peak Order Hours Heatmap */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                    Peak Order Hours
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
                    Kitchen staffing demand by time bracket
                  </p>

                  <div className="space-y-2">
                    {[
                      { time: '07:00 - 11:00 (Breakfast)', volume: '14%', tag: 'Moderate' },
                      { time: '11:00 - 14:30 (Lunch Rush)', volume: '42%', tag: 'Peak Demand', isPeak: true },
                      { time: '14:30 - 17:00 (Afternoon)', volume: '16%', tag: 'Steady' },
                      { time: '17:00 - 21:00 (Dinner Peak)', volume: '28%', tag: 'High Rush' },
                    ].map((slot) => (
                      <div
                        key={slot.time}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
                          slot.isPeak
                            ? 'bg-orange-50 font-bold text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200/70 dark:border-orange-900/50'
                            : 'bg-slate-50 text-slate-700 dark:bg-zinc-800/60 dark:text-zinc-300'
                        }`}
                      >
                        <span>{slot.time}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-black">{slot.volume}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${slot.isPeak ? 'bg-[#FF6B35] text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300'}`}>
                            {slot.tag}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Branch Performance Comparison Matrix */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3 dark:border-zinc-800">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Outlet Performance &amp; SLA Matrix
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Side-by-side comparison across all operating branches
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500">{branches.length} Active Outlets</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-850/50 dark:text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Branch Outlet</th>
                      <th className="px-4 py-3">Branch Lead</th>
                      <th className="px-4 py-3">Completed Orders</th>
                      <th className="px-4 py-3">Revenue Share</th>
                      <th className="px-4 py-3">Avg Prep Time</th>
                      <th className="px-4 py-3">SLA Compliance</th>
                      <th className="px-4 py-3">Customer Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {branches.map((b, idx) => (
                      <tr key={b.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-850/50 transition">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-[#FF6B35]">store</span>
                            <span>{b.branch_name}</span>
                            {b.is_main_branch && (
                              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                                HQ
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-zinc-300">
                          {b.manager_name || 'Dawit Haile'}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-zinc-200">
                          {Math.round(1428 / (branches.length || 1))} Orders
                        </td>
                        <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          ETB {Math.round(348920 / (branches.length || 1)).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-zinc-300">
                          {idx === 0 ? '14.2 min' : '16.8 min'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {idx === 0 ? '99.1%' : '97.8%'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-amber-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">star</span>
                          <span>{b.average_rating || 4.8}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS (ADJUSTING MERCHANT INFORMATION - SAME AS SUPER ADMIN) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6 animate-in fade-in duration-200">
            {/* Header Action Bar for Settings */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/60 font-bold">
                    <span className="material-symbols-outlined text-base">settings</span>
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Merchant Settings &amp; Brand Profile
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  Adjust brand identity, business coordinates, operating hours, compliance documents, and automated bank payouts.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSettingsForm({
                      name: merchant?.name || '',
                      category_name: merchant?.category_name || merchant?.type || 'Food',
                      cuisine_name: merchant?.cuisine_name || 'Healthy & Organic, Salads',
                      phone: merchant?.phone || '+251 91 123 4567',
                      email: merchant?.email || 'partner@delivery.et',
                      description: merchant?.description || '',
                      address: merchant?.address || 'Central Commercial District, Addis Ababa',
                      city: merchant?.city || 'Addis Ababa',
                      logo: merchant?.logo || merchant?.logo_url || '',
                      banner: merchant?.cover_image_url || merchant?.banner_url || merchant?.cover || '',
                      opening_hours: merchant?.opening_hours || '07:30 AM',
                      closing_hours: merchant?.closing_hours || '09:30 PM',
                      prep_buffer: merchant?.prep_buffer || '15 - 20 mins',
                      commission_rate: merchant?.commission_rate || 10,
                      min_order_amount: merchant?.min_order_amount || 150,
                      license_number: merchant?.license_number || 'EFDA-MED-2024-8841',
                      tin_number: merchant?.tin_number || 'TIN-009842103',
                      health_permit: merchant?.health_permit || 'AA-HEALTH-PERMIT-991',
                      bank_name: merchant?.bank_name || 'Telebirr SuperApp Merchant',
                      account_name: merchant?.account_name || merchant?.name || 'Merchant Enterprise',
                      account_number: merchant?.account_number || '+251 91 123 4567',
                      is_open: merchant?.is_open !== false,
                    })
                    showToast('Form reset to saved merchant details')
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* 2-Column Split: Form Sections on Left + Vertical Separator + Full-Height Live Storefront Preview on Right */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
              {/* Left Column: All Settings Form Cards */}
              <div className="space-y-6 lg:col-span-7 xl:col-span-7">
                {/* Section 1: General Merchant Information */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-lg text-[#FF6B35]">storefront</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        Business Profile &amp; Contact Details
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Core company details displayed to customers on the Shima Delivery mobile apps.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Merchant Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Business Category
                      </label>
                      <select
                        value={settingsForm.category_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, category_name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-850 dark:text-white cursor-pointer"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat.id || cat.name} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Cuisine Types / Specialties
                      </label>
                      <input
                        type="text"
                        value={settingsForm.cuisine_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cuisine_name: e.target.value })}
                        placeholder="e.g. Healthy & Organic, Fresh Salads, Vegan"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Customer Hotline Phone
                      </label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Official Billing &amp; Support Email
                      </label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Primary City / Region
                      </label>
                      <input
                        type="text"
                        value={settingsForm.city}
                        onChange={(e) => setSettingsForm({ ...settingsForm, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Headquarters Street Address
                      </label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Culinary Concept / Brand Bio
                      </label>
                      <textarea
                        rows={3}
                        value={settingsForm.description}
                        onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                        placeholder="Tell customers about your kitchen philosophy, fresh ingredients, and specialty dishes..."
                        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Visual Branding & Assets */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-lg text-purple-600 dark:text-purple-400">palette</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        Visual Brand Assets &amp; Imagery
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Custom brand logo icon and high-resolution cover banner image displayed to customers.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Brand Logo Upload Box */}
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-850/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                            Brand Logo Icon (1:1 Ratio)
                          </label>
                          <p className="text-[11px] text-slate-400">
                            Square format icon used on search cards, checkout &amp; rider apps (max 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          ref={logoInputRef}
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-xs dark:border-zinc-700 dark:bg-zinc-800 shrink-0">
                          {settingsForm.logo ? (
                            <img
                              src={settingsForm.logo}
                              alt="Brand Logo"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-zinc-600">
                              <span className="material-symbols-outlined text-2xl">storefront</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-orange-500 transition cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base text-[#FF6B35]">cloud_upload</span>
                            <span>{settingsForm.logo ? 'Change Logo Image' : 'Upload Brand Logo'}</span>
                          </button>

                          {settingsForm.logo && (
                            <button
                              type="button"
                              onClick={() => setSettingsForm((prev) => ({ ...prev, logo: '' }))}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/50 px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 transition cursor-pointer"
                              title="Remove logo image"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Store Header Banner Upload Box */}
                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-850/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                            Store Header Cover Banner (16:9 Ratio)
                          </label>
                          <p className="text-[11px] text-slate-400">
                            High-resolution landscape photo displayed at the top of your digital storefront (max 8MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          ref={bannerInputRef}
                          accept="image/*"
                          onChange={handleBannerUpload}
                          className="hidden"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <div className="h-16 w-32 overflow-hidden rounded-xl border-2 border-slate-200 bg-white shadow-xs dark:border-zinc-700 dark:bg-zinc-800 shrink-0">
                          {settingsForm.banner ? (
                            <img
                              src={settingsForm.banner}
                              alt="Cover Banner"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-zinc-600">
                              <span className="material-symbols-outlined text-2xl">panorama</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-orange-500 transition cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-base text-[#FF6B35]">cloud_upload</span>
                            <span>{settingsForm.banner ? 'Change Banner Image' : 'Upload Cover Banner'}</span>
                          </button>

                          {settingsForm.banner && (
                            <button
                              type="button"
                              onClick={() => setSettingsForm((prev) => ({ ...prev, banner: '' }))}
                              className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50/50 px-2.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 transition cursor-pointer"
                              title="Remove banner image"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Kitchen & Operating Hours */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-lg text-amber-500">schedule</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        Operating Schedule &amp; Fulfillment Controls
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Define kitchen dispatch buffers, operating window, and live order acceptance status.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Opening Time</label>
                      <input
                        type="text"
                        value={settingsForm.opening_hours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, opening_hours: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Closing Time</label>
                      <input
                        type="text"
                        value={settingsForm.closing_hours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, closing_hours: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Kitchen Prep Buffer</label>
                      <input
                        type="text"
                        value={settingsForm.prep_buffer}
                        onChange={(e) => setSettingsForm({ ...settingsForm, prep_buffer: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">Min Order (ETB)</label>
                      <input
                        type="number"
                        value={settingsForm.min_order_amount}
                        onChange={(e) => setSettingsForm({ ...settingsForm, min_order_amount: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Live Order Acceptance Toggle */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">Live Order Acceptance</span>
                      <p className="text-[11px] text-slate-500">Temporarily pause orders across all branches</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, is_open: !settingsForm.is_open })}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition ${
                        settingsForm.is_open
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${settingsForm.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      <span>{settingsForm.is_open ? 'Store Online' : 'Paused'}</span>
                    </button>
                  </div>
                </div>

                {/* Section 4: Regulatory Compliance & Documentation */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400">verified</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        Regulatory Compliance &amp; Verification
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Government business registration, tax compliance, and health permits.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Trade License / EFDA
                      </label>
                      <input
                        type="text"
                        value={settingsForm.license_number}
                        onChange={(e) => setSettingsForm({ ...settingsForm, license_number: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                      <span className="mt-1 block text-[10px] text-emerald-600 font-bold">Verified with EFDA</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Tax ID (TIN)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.tin_number}
                        onChange={(e) => setSettingsForm({ ...settingsForm, tin_number: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                      <span className="mt-1 block text-[10px] text-slate-400">Taxpayer ID</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Health &amp; Food Permit
                      </label>
                      <input
                        type="text"
                        value={settingsForm.health_permit}
                        onChange={(e) => setSettingsForm({ ...settingsForm, health_permit: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                      <span className="mt-1 block text-[10px] text-emerald-600 font-bold">Inspection Valid</span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Automated Settlement & Payout Bank Details */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-lg text-blue-600 dark:text-blue-400">account_balance</span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        Automated Payout &amp; Settlement Account
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Disbursement account for revenue transfers every Monday &amp; Thursday.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Settlement Provider
                      </label>
                      <select
                        value={settingsForm.bank_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bank_name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white cursor-pointer"
                      >
                        <option value="Telebirr SuperApp Merchant">Telebirr SuperApp Merchant</option>
                        <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
                        <option value="Awash Bank">Awash Bank</option>
                        <option value="Dashen Bank">Dashen Bank</option>
                        <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                        <option value="Nib International Bank">Nib International Bank</option>
                        <option value="Zemen Bank">Zemen Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={settingsForm.account_name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, account_name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                        Account / Phone Number
                      </label>
                      <input
                        type="text"
                        value={settingsForm.account_number}
                        onChange={(e) => setSettingsForm({ ...settingsForm, account_number: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:border-zinc-700 dark:bg-zinc-850 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Save Bar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Save All Changes</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Sticky Full-Page Live Storefront Preview with Vertical Separator */}
              <div className="lg:col-span-5 xl:col-span-5 lg:border-l lg:border-slate-200 lg:dark:border-zinc-800 lg:pl-8">
                <div className="sticky top-24 space-y-5">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60 font-bold">
                        <span className="material-symbols-outlined text-base">visibility</span>
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Storefront Live Preview</h4>
                        <p className="text-[11px] text-slate-400">Customer app perspective in real-time</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Sync
                    </span>
                  </div>

                  {/* Customer Storefront Mockup Card */}
                  <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                    {/* Cover Banner */}
                    <div className="relative h-44 w-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      {settingsForm.banner ? (
                        <img
                          src={settingsForm.banner}
                          alt="Cover Banner"
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100 text-slate-300 dark:bg-zinc-800 dark:text-zinc-600">
                          <span className="material-symbols-outlined text-4xl">panorama</span>
                          <span className="text-[11px] font-semibold mt-1">No Cover Banner Uploaded</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur-xs dark:bg-zinc-900/95 dark:text-zinc-200">
                          <span className="material-symbols-outlined text-xs text-[#FF6B35]">verified</span>
                          <span>Verified Merchant</span>
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-xs backdrop-blur-xs ${
                            settingsForm.is_open
                              ? 'bg-emerald-600/95 text-white'
                              : 'bg-rose-600/95 text-white'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${settingsForm.is_open ? 'bg-white animate-pulse' : 'bg-white'}`} />
                          <span>{settingsForm.is_open ? 'Open for Orders' : 'Store Paused'}</span>
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 right-3 text-white text-[11px] font-bold drop-shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">timer</span>
                        <span>{settingsForm.prep_buffer || '15 - 20 mins'}</span>
                      </div>
                    </div>

                    {/* Content below banner with overlapping brand logo */}
                    <div className="p-5 pt-0 space-y-4">
                      {/* Logo and Brand Identity */}
                      <div className="flex items-end justify-between -mt-9 mb-3">
                        <div className="relative h-18 w-18 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-lg dark:border-zinc-900 dark:bg-zinc-850">
                          {settingsForm.logo ? (
                            <img
                              src={settingsForm.logo}
                              alt="Brand Logo"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-orange-50 text-[#FF6B35]">
                              <span className="material-symbols-outlined text-2xl">storefront</span>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-black text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                            <span className="material-symbols-outlined text-xs text-amber-500">star</span>
                            <span>4.8</span>
                            <span className="text-[10px] text-amber-600/80 font-medium">(530+)</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                          {settingsForm.name || 'Merchant Brand Name'}
                        </h3>
                        <p className="mt-0.5 text-xs font-semibold text-[#FF6B35]">
                          {settingsForm.category_name || 'Food'} &bull;{' '}
                          <span className="text-slate-600 dark:text-zinc-400 font-normal">
                            {settingsForm.cuisine_name || 'Organic & Specialty'}
                          </span>
                        </p>
                      </div>

                      {settingsForm.description && (
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-zinc-300 line-clamp-2">
                          {settingsForm.description}
                        </p>
                      )}

                      {/* Store Meta Details */}
                      <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-zinc-800 text-xs">
                        <div className="flex items-start gap-2 text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-sm text-slate-400 shrink-0 mt-0.5">place</span>
                          <span className="line-clamp-2">{settingsForm.address || 'Central Commercial District, Addis Ababa'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-sm text-slate-400 shrink-0">schedule</span>
                          <span>Daily: {settingsForm.opening_hours} &ndash; {settingsForm.closing_hours}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-sm text-slate-400 shrink-0">call</span>
                          <span className="font-mono text-[11px]">{settingsForm.phone || '+251 91 123 4567'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-sm text-slate-400 shrink-0">mail</span>
                          <span className="font-mono text-[11px] truncate">{settingsForm.email || 'partner@delivery.et'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-sm text-slate-400 shrink-0">shopping_bag</span>
                          <span>Min Order: <strong className="text-slate-900 dark:text-white">ETB {settingsForm.min_order_amount || 150}</strong></span>
                        </div>
                      </div>

                      {/* Settlement & Regulatory Badges */}
                      <div className="rounded-2xl bg-slate-50 p-3 dark:bg-zinc-850 border border-slate-100 dark:border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">License / EFDA:</span>
                          <span className="font-mono font-bold text-emerald-600">{settingsForm.license_number}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Payout Account:</span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 truncate max-w-[170px] text-right">
                            {settingsForm.bank_name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Operating Branches:</span>
                          <span className="font-bold text-slate-800 dark:text-zinc-200">
                            {branches.length} {branches.length === 1 ? 'Location' : 'Locations'}
                          </span>
                        </div>
                      </div>

                      {/* Shima Courier Tag */}
                      <div className="rounded-xl bg-orange-50/80 p-3 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#FF6B35] text-base">moped</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">Shima Express Delivery</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-wider">Automated Dispatch</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </MerchantPortalLayout>
  )
}
