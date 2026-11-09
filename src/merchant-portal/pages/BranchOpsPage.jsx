import { useState, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import MerchantPortalLayout from '../layouts/MerchantPortalLayout'
import DataTable from '../../components/DataTable'
import CustomerRatingReviews from '../../components/CustomerRatingReviews'
import BranchMenuItemsTabContent from '../../components/BranchMenuItemsTabContent'
import { getMerchantById, loadStoredMerchants } from '../../data/demoMerchants'
import { generateOrdersForBranch } from '../../data/demoOrders'
import { getMenuItemsForBranch, getCategoriesForBranch } from '../../data/demoMenuItems'
import { getBranchReviews, saveBranchReviews } from '../../data/demoRatingsReviews'

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon', full: 'Monday' },
  { key: 'tuesday', label: 'Tue', full: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { key: 'thursday', label: 'Thu', full: 'Thursday' },
  { key: 'friday', label: 'Fri', full: 'Friday' },
  { key: 'saturday', label: 'Sat', full: 'Saturday' },
  { key: 'sunday', label: 'Sun', full: 'Sunday' },
]

export default function BranchOpsPage() {
  const params = useParams()

  const [activeTab, setActiveTab] = useState('overview')
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const merchantsList = useMemo(() => loadStoredMerchants(), [])

  // Resolve single merchant for this branch
  const merchant = useMemo(() => {
    if (params.merchantId) {
      const found = merchantsList.find((m) => m.id === params.merchantId || m.merchant_id === params.merchantId)
      if (found) return found
    }
    const withBranches = merchantsList.find((m) => Array.isArray(m.branches) && m.branches.length > 0)
    return withBranches || getMerchantById('m-002') || merchantsList[0]
  }, [params.merchantId, merchantsList])

  const branches = useMemo(() => {
    if (!merchant) return []
    if (Array.isArray(merchant.branches) && merchant.branches.length > 0) {
      return merchant.branches
    }
    return [
      {
        id: 'b-wh-01',
        branch_name: `${merchant.name} - Old Airport Flagship`,
        is_main_branch: true,
        address: merchant.address || '1100 Green Blvd, West End, Old Airport',
        phone: merchant.phone || '+251 91 876 5432',
        phone_number: merchant.phone || '+251 91 876 5432',
        email: merchant.email || 'branch@wholeharvest.com',
        latitude: 8.995,
        longitude: 38.741,
        manager_name: 'Dawit Haile',
        manager_phone: '+251 91 222 3344',
        is_open: true,
        accepts_orders: true,
        opening_hours: '07:30 AM',
        closing_hours: '09:30 PM',
      },
    ]
  }, [merchant])

  // Locate the specific branch strictly for that branch manager
  const branch = useMemo(() => {
    if (!branches.length) return null
    if (params.branchId) {
      const found = branches.find(
        (b, idx) => String(b.id) === String(params.branchId) || String(idx) === String(params.branchId)
      )
      if (found) return found
    }
    return branches[0]
  }, [branches, params.branchId])

  // Branch data hooks
  const [orders, setOrders] = useState(() => generateOrdersForBranch(merchant, branch))
  const [menuItems, setMenuItems] = useState(() => getMenuItemsForBranch(branch?.id, merchant?.id, merchant))
  const [branchReviews, setBranchReviews] = useState(() => getBranchReviews(branch?.id || 'b-wh-01'))
  const [initialMenuCategory, setInitialMenuCategory] = useState('all')

  const isBranchOpen = branch?.is_open !== false

  const branchStats = useMemo(() => {
    const revenue = orders.reduce((acc, order) => {
      const amount =
        typeof order.totalNum === 'number'
          ? order.totalNum
          : parseFloat(String(order.amount || order.total || '').replace(/[^0-9.]/g, '')) || 0
      return acc + amount
    }, 0)

    return {
      todayRevenue: `ETB ${Math.round(revenue > 0 ? revenue : 48250).toLocaleString()}`,
      dispatched: orders.length > 0 ? orders.length : 64,
      fulfillmentRate: '98.4%',
      avgPrepTime: '16.5 min',
      rating: branch?.average_rating || 4.9,
      reviewCount: branchReviews.length || 328,
    }
  }, [orders, branch, branchReviews.length])

  // Staff list for that branch manager
  const [staffList] = useState(() => [
    {
      id: 'st-1',
      name: branch?.manager_name || 'Dawit Haile',
      role: 'Branch Operations Lead',
      phone: branch?.manager_phone || branch?.phone || '+251 91 222 3344',
      email: 'dawit.h@wholeharvest.com',
      shift: '07:30 AM - 04:30 PM',
      status: 'On Duty',
      isManager: true,
    },
    {
      id: 'st-2',
      name: 'Bethlehem Tsegaye',
      role: 'Head Kitchen Chef',
      phone: '+251 92 334 1122',
      email: 'bethlehem.t@wholeharvest.com',
      shift: '07:00 AM - 03:30 PM',
      status: 'On Duty',
    },
    {
      id: 'st-3',
      name: 'Kassahun Bekele',
      role: 'Fulfillment & Dispatch Lead',
      phone: '+251 94 887 6655',
      email: 'kassahun.b@wholeharvest.com',
      shift: '02:00 PM - 10:00 PM',
      status: 'On Duty',
    },
    {
      id: 'st-4',
      name: 'Hanan Mohammed',
      role: 'Packaging & QA Specialist',
      phone: '+251 93 555 8899',
      email: 'hanan.m@wholeharvest.com',
      shift: '08:30 AM - 05:30 PM',
      status: 'Off Duty',
    },
  ])

  // Root side menu navigation items (The 6 operational sections)
  const sidebarItems = useMemo(
    () => [
      { id: 'overview', label: 'Overview & Statistics', icon: 'analytics', badge: null, section: 'Overview' },
      { id: 'orders', label: 'Recent Orders', icon: 'receipt_long', badge: orders.length, section: 'Order Management' },
      { id: 'menu_items', label: 'Menu Items', icon: 'restaurant_menu', badge: menuItems.length, section: 'Menu Catalog' },
      { id: 'ratings', label: 'Ratings & Reviews', icon: 'hotel_class', badge: branchReviews.length, section: 'Reviews' },
      { id: 'staff', label: 'Manager & Staff', icon: 'badge', badge: staffList.length, section: 'Team' },
      { id: 'settings', label: 'Settings', icon: 'settings', badge: null, section: 'Settings' },
    ],
    [orders.length, menuItems.length, branchReviews.length, staffList.length]
  )

  // Orders Filter & Search
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All Statuses')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'All Statuses') {
        const s = orderStatusFilter.toLowerCase()
        if (s.includes('kitchen') && o.statusVariant !== 'kitchen') return false
        if (s.includes('ready') && o.statusVariant !== 'ready') return false
        if (s.includes('delivery') && o.statusVariant !== 'delivery') return false
        if (s.includes('delivered') && o.statusVariant !== 'delivered') return false
      }
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase()
        return (
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.items.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [orders, orderStatusFilter, orderSearchQuery])

  const handleUpdateOrderStatus = useCallback((orderId, nextVariant) => {
    const statusMapping = {
      kitchen: { status: 'In Kitchen', statusVariant: 'kitchen' },
      ready: { status: 'Ready for Pickup', statusVariant: 'ready' },
      delivery: { status: 'Out for Delivery', statusVariant: 'delivery' },
      delivered: { status: 'Delivered', statusVariant: 'delivered' },
    }
    const update = statusMapping[nextVariant]
    if (!update) return

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...update } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, ...update } : prev))
    showToast(`Order ${orderId} updated to ${update.status}`)
  }, [])

  const handleSimulateNewOrder = () => {
    const newIdNum = 8900 + Math.floor(Math.random() * 99)
    const newOrder = {
      id: `#ORD-${newIdNum}`,
      customer: { name: 'Selamawit Bekele', phone: '+251 92 444 8877', initials: 'SB' },
      branchName: branch?.branch_name || 'Flagship Branch',
      merchantName: merchant?.name || 'Whole Harvest',
      status: 'In Kitchen',
      statusVariant: 'kitchen',
      type: 'Delivery',
      time: 'Just now',
      items: '2x Organic Highland Avocado Bowl, Fresh Cold-Pressed Juice',
      itemsCount: 3,
      amount: 'ETB 580',
      paymentMethod: 'Telebirr (Paid)',
    }
    setOrders((prev) => [newOrder, ...prev])
    showToast(`New live order ${newOrder.id} received in branch queue!`)
  }

  const merchantCategories = useMemo(() => {
    return getCategoriesForBranch(merchant, menuItems)
  }, [merchant, menuItems])

  // Order columns for DataTable
  const orderColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Order Ref',
        cell: (info) => (
          <div className="font-mono font-bold text-slate-900 dark:text-zinc-100 text-xs">
            {info.getValue()}
          </div>
        ),
      },
      {
        accessorKey: 'customer.name',
        header: 'Customer',
        cell: (info) => {
          const row = info.row.original
          return (
            <div>
              <p className="font-bold text-slate-800 dark:text-zinc-200 text-xs">{row.customer.name}</p>
              <p className="text-[10px] text-slate-400">{row.customer.phone}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'items',
        header: 'Items Ordered',
        cell: (info) => (
          <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium truncate max-w-[220px] block">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: (info) => (
          <span className="font-mono font-bold text-slate-900 dark:text-zinc-100 text-xs">
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const row = info.row.original
          const colors = {
            kitchen: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400',
            ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
            delivery: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
            delivered: 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-zinc-800 dark:text-zinc-300',
          }
          return (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${
                colors[row.statusVariant] || colors.delivered
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {row.status}
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
            <div className="flex items-center gap-1.5 justify-end">
              {row.statusVariant === 'kitchen' && (
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(row.id, 'ready')}
                  className="rounded-lg bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-emerald-700 cursor-pointer"
                >
                  Mark Ready
                </button>
              )}
              {row.statusVariant === 'ready' && (
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(row.id, 'delivery')}
                  className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-blue-700 cursor-pointer"
                >
                  Hand to Courier
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrder(row)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Inspect
              </button>
            </div>
          )
        },
      },
    ],
    [handleUpdateOrderStatus]
  )

  if (!merchant || !branch) {
    return (
      <MerchantPortalLayout portalType="branch">
        <div className="mx-auto max-w-md py-16 text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-white">Branch Not Found</p>
        </div>
      </MerchantPortalLayout>
    )
  }

  return (
    <MerchantPortalLayout
      portalType="branch"
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarItems={sidebarItems}
      merchant={merchant}
      branch={branch}
      isBranchOpen={isBranchOpen}
      breadcrumbMiddle={merchant.name}
      breadcrumbCurrent={branch.branch_name}
      operatorName={staffList[0]?.name || 'Dawit Haile'}
      operatorRole="Branch Operations Manager"
      operatorEmail={branch.email || 'dawit.h@wholeharvest.com'}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Compact Branch Header */}
      <section className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {branch.branch_name}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                isBranchOpen
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isBranchOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isBranchOpen ? 'Accepting Orders' : 'Store Paused'}</span>
            </span>
          </div>

          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            {branch.address} &bull; {branch.opening_hours || '07:30 AM'} - {branch.closing_hours || '09:30 PM'} &bull;{' '}
            <span className="font-bold text-amber-500">4.8 ★ ({branchReviews.length} Reviews)</span>
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 self-start rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400 sm:self-auto">
          <span className="material-symbols-outlined text-base">
            {activeTab === 'overview' && 'analytics'}
            {activeTab === 'orders' && 'receipt_long'}
            {activeTab === 'menu_items' && 'restaurant_menu'}
            {activeTab === 'ratings' && 'hotel_class'}
            {activeTab === 'staff' && 'badge'}
            {activeTab === 'settings' && 'settings'}
          </span>
          <span>
            {activeTab === 'overview' && 'Overview'}
            {activeTab === 'orders' && `Orders (${orders.length})`}
            {activeTab === 'menu_items' && `Menu Catalog (${menuItems.length})`}
            {activeTab === 'ratings' && `Reviews (${branchReviews.length})`}
            {activeTab === 'staff' && `Staff (${staffList.length})`}
            {activeTab === 'settings' && 'Settings'}
          </span>
        </span>
      </section>

      {/* 4 Metric Stats Cards - Matching Super Admin */}
      <section className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Operating Status
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
              <span className="material-symbols-outlined text-base">storefront</span>
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {isBranchOpen ? 'Open Now' : 'Closed'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            {branch.opening_hours || '07:30 AM'} - {branch.closing_hours || '09:30 PM'}
          </p>
        </div>

        <div
          onClick={() => setActiveTab('menu_items')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setActiveTab('menu_items')
          }}
          className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-[#FF6B35] dark:border-zinc-850 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Menu Catalog
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
              <span className="material-symbols-outlined text-base">restaurant_menu</span>
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-[#FF6B35] dark:text-orange-400 flex items-center gap-1.5">
            <span>{menuItems.length} Items</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            {menuItems.filter((i) => i.is_available).length} in stock &bull; Click to view
          </p>
        </div>

        <div
          onClick={() => setActiveTab('orders')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setActiveTab('orders')
          }}
          className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-[#FF6B35] dark:border-zinc-850 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Recent Orders
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
              <span className="material-symbols-outlined text-base">receipt_long</span>
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-[#FF6B35] dark:text-orange-400 flex items-center gap-1.5">
            <span>{orders.length} Orders</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Click to manage queue
          </p>
        </div>

        <div
          onClick={() => setActiveTab('settings')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setActiveTab('settings')
          }}
          className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-[#FF6B35] dark:border-zinc-850 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Branch Settings
            </span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              <span className="material-symbols-outlined text-base">settings</span>
            </span>
          </div>
          <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span>Operational</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Schedule & dispatch controls
          </p>
        </div>
      </section>

      {/* Main Content Area driven by Root Side Menu */}
      <div className="space-y-6">
        {/* TAB 1: OVERVIEW & REAL-TIME STATS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-in fade-in duration-200">
            {/* Left: Admin Dashboard & Statistics */}
            <div className="space-y-6 lg:col-span-8">
              {/* Top 4 Real-time Branch Metric Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Today&apos;s Revenue
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                      <span className="material-symbols-outlined text-base">payments</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {branchStats.todayRevenue}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    +14.2% vs yesterday
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Orders Dispatched
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                      <span className="material-symbols-outlined text-base">local_shipping</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {branchStats.dispatched} Orders
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    {branchStats.fulfillmentRate} fulfillment rate
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Avg Prep Time
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                      <span className="material-symbols-outlined text-base">timer</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {branchStats.avgPrepTime}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    On-time SLA compliant
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('ratings')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setActiveTab('ratings')
                  }}
                  className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-amber-400 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                  title="Click to view all customer reviews and ratings"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Satisfaction
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                      <span className="material-symbols-outlined text-base">star</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span>{branchStats.rating} / 5.0</span>
                    <span className="material-symbols-outlined text-xs text-amber-500">arrow_forward</span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    From {branchStats.reviewCount} ratings • View reviews →
                  </p>
                </div>
              </div>

              {/* Order Fulfillment Pipeline Status */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">alt_route</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Live Kitchen &amp; Ticket Dispatch Pipeline
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    View All Orders ({orders.length}) →
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-center dark:border-blue-900/40 dark:bg-blue-950/20">
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">New Incoming</span>
                    <p className="mt-1 text-lg font-black text-blue-800 dark:text-blue-200">
                      {orders.filter((o) => o.statusVariant === 'new' || !o.statusVariant).length || 4}
                    </p>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">Instant Alert</span>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">In Prep / Kitchen</span>
                    <p className="mt-1 text-lg font-black text-amber-800 dark:text-amber-200">
                      {orders.filter((o) => o.statusVariant === 'kitchen' || o.statusVariant === 'preparing').length || 3}
                    </p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">Cooking</span>
                  </div>

                  <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-center dark:border-purple-900/40 dark:bg-purple-950/20">
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Ready for Pickup</span>
                    <p className="mt-1 text-lg font-black text-purple-800 dark:text-purple-200">
                      {orders.filter((o) => o.statusVariant === 'ready' || o.statusVariant === 'ready_for_pickup').length || 2}
                    </p>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">Packaged</span>
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">Out for Delivery</span>
                    <p className="mt-1 text-lg font-black text-indigo-800 dark:text-indigo-200">
                      {orders.filter((o) => o.statusVariant === 'delivery' || o.statusVariant === 'out_for_delivery').length || 5}
                    </p>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400">On the Road</span>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Delivered Today</span>
                    <p className="mt-1 text-lg font-black text-emerald-800 dark:text-emerald-200">
                      {orders.filter((o) => o.statusVariant === 'delivered').length || 50}
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Completed</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1.5">
                    <span>Active Pipeline Completion</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">92% on target</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800 flex">
                    <div className="h-full bg-emerald-500" style={{ width: '70%' }} title="Delivered (70%)" />
                    <div className="h-full bg-indigo-500" style={{ width: '12%' }} title="Delivery (12%)" />
                    <div className="h-full bg-purple-500" style={{ width: '8%' }} title="Ready (8%)" />
                    <div className="h-full bg-amber-500" style={{ width: '6%' }} title="Kitchen (6%)" />
                    <div className="h-full bg-blue-500" style={{ width: '4%' }} title="New (4%)" />
                  </div>
                </div>
              </div>

              {/* Multi-Category Products Breakdown */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-purple-600 dark:text-purple-400">category</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Catalog Categories &amp; Stock Health ({menuItems.length} Products)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu_items')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    Manage Menu Items Catalog →
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                  {merchantCategories.map((cat) => {
                    const count = menuItems.filter(
                      (i) =>
                        (i.category_type || '').toLowerCase() === cat.name.toLowerCase() ||
                        i.menu_category_id === cat.id
                    ).length
                    const availableCount = menuItems.filter(
                      (i) =>
                        ((i.category_type || '').toLowerCase() === cat.name.toLowerCase() ||
                          i.menu_category_id === cat.id) &&
                        i.is_available
                    ).length
                    return (
                      <div
                        key={cat.id || cat.name}
                        onClick={() => {
                          setInitialMenuCategory(cat.name)
                          setActiveTab('menu_items')
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setInitialMenuCategory(cat.name)
                            setActiveTab('menu_items')
                          }
                        }}
                        className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-[#FF6B35]/50 hover:bg-orange-50/20 dark:border-zinc-800 dark:bg-zinc-850"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="material-symbols-outlined text-base text-[#FF6B35]">
                              {cat.icon || 'category'}
                            </span>
                            <span className="truncate font-bold text-slate-800 dark:text-zinc-200">{cat.name}</span>
                          </div>
                          <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs dark:bg-zinc-700 dark:text-zinc-200">
                            {count} {count === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                          <span>{availableCount} Active</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline">View →</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Peak Operating Hours Breakdown */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-amber-500">schedule</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Daily Peak Volume Heatmap &amp; Rush Hours
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
            </div>

            {/* Right Column: Quick Action Cards */}
            <div className="space-y-6 lg:col-span-4">
              {/* Branch Manager Quick Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-indigo-500">badge</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Branch Store Manager</h3>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Manager Name</span>
                    <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                      {branch.manager_name || 'Designated Store Manager'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">Contact Number</span>
                    <p className="mt-0.5 font-semibold text-slate-800 dark:text-zinc-200">
                      {branch.phone_number || branch.phone || branch.manager_phone || '+251 91 123 4567'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">Staff Email</span>
                    <p className="mt-0.5 font-mono text-slate-800 dark:text-zinc-200">
                      {branch.email || 'staff.branch@merchant.et'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('staff')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <span>View All Staff Details</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              {/* Menu Items Jump Teaser */}
              <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/70 to-indigo-50/40 p-5 shadow-xs dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                      <span className="material-symbols-outlined text-base">restaurant_menu</span>
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Menu Catalog</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {menuItems.length} Products configured
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    Active
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  {merchant?.name || 'Branch'} catalog across {merchantCategories.map((c) => c.name).join(', ')} with sizes and add-on customization.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab('menu_items')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                  <span>Open Menu Items ({menuItems.length})</span>
                </button>
              </div>

              {/* Recent Orders Jump Teaser */}
              <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/70 to-amber-50/40 p-5 shadow-xs dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                      <span className="material-symbols-outlined text-base">receipt_long</span>
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Branch Orders Queue</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {orders.length} orders queued today
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Live
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Real-time ticket dispatch, kitchen status tracking, and delivery fulfillment for {branch.branch_name}.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF6B35] py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  <span>Open Branch Recent Orders ({orders.length})</span>
                </button>
              </div>

              {/* Settings & Working Hours Summary */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-slate-600 dark:text-zinc-300">settings</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Branch Settings</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    Configure →
                  </button>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Working Hours:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                      {branch.opening_hours || '08:00 AM'} - {branch.closing_hours || '10:00 PM'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Accepting Orders:</span>
                    <span className={`font-bold ${isBranchOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isBranchOpen ? 'Live Online' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Fulfillment Mode:</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Delivery &amp; Pickup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECENT ORDERS QUEUE */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <span className="material-symbols-outlined text-slate-400">search</span>
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search order ID, customer name, items..."
                  className="w-full text-xs bg-transparent focus:outline-none dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-200"
                >
                  <option>All Statuses</option>
                  <option>In Kitchen</option>
                  <option>Ready for Pickup</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                </select>
                <button
                  type="button"
                  onClick={handleSimulateNewOrder}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_alert</span>
                  <span>Simulate Incoming Order</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
              <DataTable columns={orderColumns} data={filteredOrders} enablePagination={true} pageSize={8} />
            </div>
          </div>
        )}

        {/* TAB 3: MENU ITEMS & STOCK CATALOG */}
        {activeTab === 'menu_items' && (
          <div className="animate-in fade-in duration-200">
            <BranchMenuItemsTabContent
              key={`${branch?.id || 'branch-menu'}-${initialMenuCategory}`}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              branch={branch}
              merchant={merchant}
              categories={merchantCategories}
              initialCategory={initialMenuCategory}
              showToast={showToast}
            />
          </div>
        )}

        {/* TAB 4: RATINGS & REVIEWS */}
        {activeTab === 'ratings' && (
          <div className="animate-in fade-in duration-200">
            <CustomerRatingReviews
              entityType="branch"
              entityName={branch.branch_name}
              initialReviews={branchReviews}
              onSaveReviews={(updated) => {
                setBranchReviews(updated)
                saveBranchReviews(updated)
                showToast('Review responses saved')
              }}
              aspectCriteria={[
                { label: 'Food Quality', score: '4.9 ★', sub: '98% Positive' },
                { label: 'Packaging Integrity', score: '4.8 ★', sub: '96% Positive' },
                { label: 'Dispatch Speed', score: '4.7 ★', sub: '14.8m Avg SLA' },
              ]}
              baseRatingsCount={184}
            />
          </div>
        )}

        {/* TAB 5: STAFF & SHIFT ROSTER */}
        {activeTab === 'staff' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Branch Staff & Shift Roster</h2>
                <p className="text-xs text-slate-500">Active personnel handling food preparation and courier dispatch</p>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {staffList.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 font-bold text-[#FF6B35] dark:bg-orange-950/40">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-slate-900 dark:text-white">{s.name}</p>
                        {s.isManager && (
                          <span className="rounded bg-orange-100 dark:bg-orange-950/60 px-1.5 py-0.2 text-[9px] font-bold text-[#FF6B35]">
                            Lead Manager
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{s.role} &bull; {s.shift}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: OPERATIONAL SETTINGS */}
        {activeTab === 'settings' && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900 space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Operating Hours & SLA Controls</h2>
              <p className="text-xs text-slate-500">Kitchen operating schedule and fulfillment buffers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Opening Hours</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {branch.opening_hours || '07:30 AM'} - {branch.closing_hours || '09:30 PM'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 p-4 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kitchen Prep Buffer</span>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">15 - 20 mins</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">Weekly Schedule</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((d) => (
                  <div
                    key={d.key}
                    className="rounded-xl border border-slate-200/80 p-2.5 text-center dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{d.label}</span>
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1">07:30 - 21:30</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Order Inspection Ticket Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <span className="font-mono text-xs font-bold text-[#FF6B35]">{selectedOrder.id}</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Order Dispatch Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-850/60">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Customer</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedOrder.customer.name}</p>
                  <p className="text-[11px] text-slate-400">{selectedOrder.customer.phone}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Amount</span>
                  <p className="font-mono font-black text-slate-900 dark:text-white mt-0.5">{selectedOrder.amount}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{selectedOrder.paymentMethod || 'Telebirr (Paid)'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Items in Ticket</span>
                <p className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
                  {selectedOrder.items}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Dispatch Status</span>
                <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#FF6B35] dark:bg-orange-950/40">
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close Ticket
              </button>
              {selectedOrder.statusVariant === 'kitchen' && (
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'ready')}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                >
                  Mark Order Ready
                </button>
              )}
              {selectedOrder.statusVariant === 'ready' && (
                <button
                  type="button"
                  onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivery')}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                >
                  Hand to Courier
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </MerchantPortalLayout>
  )
}
