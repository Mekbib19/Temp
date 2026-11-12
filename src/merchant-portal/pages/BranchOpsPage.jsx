import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MerchantPortalLayout from '../layouts/MerchantPortalLayout'
import DataTable from '../../components/DataTable'
import CustomerRatingReviews from '../../components/CustomerRatingReviews'
import BranchMenuItemsTabContent from '../../components/BranchMenuItemsTabContent'
import { getMerchantById, loadStoredMerchants, saveStoredMerchants } from '../../data/demoMerchants'
import { generateOrdersForBranch } from '../../data/demoOrders'
import { getMenuItemsForBranch, getCategoriesForBranch } from '../../data/demoMenuItems'
import { getBranchReviews, saveBranchReviews } from '../../data/demoRatingsReviews'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from '../../components/ui/dropdown-menu'

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon', full: 'Monday' },
  { key: 'tuesday', label: 'Tue', full: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { key: 'thursday', label: 'Thu', full: 'Thursday' },
  { key: 'friday', label: 'Fri', full: 'Friday' },
  { key: 'saturday', label: 'Sat', full: 'Saturday' },
  { key: 'sunday', label: 'Sun', full: 'Sunday' },
]

const createDefaultSchedule = () => ({
  monday: { is_open: true, open_time: '07:30', close_time: '21:30' },
  tuesday: { is_open: true, open_time: '07:30', close_time: '21:30' },
  wednesday: { is_open: true, open_time: '07:30', close_time: '21:30' },
  thursday: { is_open: true, open_time: '07:30', close_time: '21:30' },
  friday: { is_open: true, open_time: '07:30', close_time: '22:30' },
  saturday: { is_open: true, open_time: '08:00', close_time: '22:30' },
  sunday: { is_open: true, open_time: '08:00', close_time: '21:00' },
})

const orderStatusConfig = {
  kitchen: {
    label: 'In Kitchen',
    badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400',
    dotClass: 'bg-amber-500 animate-pulse',
  },
  ready: {
    label: 'Ready for Pickup',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  delivery: {
    label: 'Out for Delivery',
    badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
    dotClass: 'bg-blue-500',
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-slate-100 text-slate-700 ring-1 ring-slate-600/20 dark:bg-zinc-800 dark:text-zinc-300',
    dotClass: 'bg-slate-400',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400',
    dotClass: 'bg-rose-500',
  },
}

export default function BranchOpsPage() {
  const params = useParams()
  const navigate = useNavigate()

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
  const [branchOpenState, setBranchOpenState] = useState(() => branch?.is_open !== false)
  const isBranchOpen = branchOpenState

  const handleToggleBranchStatus = () => {
    setBranchOpenState((prev) => {
      const next = !prev
      showToast(`Branch ${branch?.branch_name || 'Branch'} status updated to ${next ? 'Open Now' : 'Closed'}`)
      return next
    })
  }

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
      { id: 'overview', label: 'Overview & Statistics', icon: 'analytics', badge: null },
      { id: 'orders', label: 'Recent Orders', icon: 'receipt_long', badge: orders.length },
      { id: 'menu_items', label: 'Menu Items', icon: 'restaurant_menu', badge: menuItems.length },
      { id: 'ratings', label: 'Ratings & Reviews', icon: 'hotel_class', badge: branchReviews.length },
      { id: 'staff', label: 'Manager & Staff', icon: 'badge', badge: staffList.length },
      { id: 'settings', label: 'Settings', icon: 'settings', badge: null },
    ],
    [orders.length, menuItems.length, branchReviews.length, staffList.length]
  )

  // Orders Filter & Search (Matching Super Admin Order Management Engine)
  const [orderSearchQuery, setOrderSearchQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All Statuses')
  const [orderChannelFilter, setOrderChannelFilter] = useState('All Channels')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Operating Hours & Dispatch Settings State (Matching Super Admin Day & Time Cards)
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [settingsForm, setSettingsForm] = useState(() => ({
    schedule: branch?.schedule && typeof branch.schedule === 'object' ? branch.schedule : createDefaultSchedule(),
    accepts_orders: branch?.accepts_orders !== false,
    direct_pickup: branch?.direct_pickup !== false,
    kitchen_prep_buffer: branch?.kitchen_prep_buffer || '15 - 20 mins',
    min_order_amount: branch?.min_order_amount || 150,
  }))

  const handleSaveSettings = () => {
    Object.assign(branch, {
      schedule: settingsForm.schedule,
      accepts_orders: settingsForm.accepts_orders,
      direct_pickup: settingsForm.direct_pickup,
      kitchen_prep_buffer: settingsForm.kitchen_prep_buffer,
      min_order_amount: settingsForm.min_order_amount,
      opening_hours: settingsForm.schedule?.monday?.open_time || branch.opening_hours || '07:30 AM',
      closing_hours: settingsForm.schedule?.monday?.close_time || branch.closing_hours || '09:30 PM',
    })
    if (merchant) {
      try {
        const stored = loadStoredMerchants()
        const updated = stored.map((m) => {
          if (m.id === merchant.id) {
            const updatedBranches = (m.branches || []).map((b) => {
              if (String(b.id) === String(branch?.id)) {
                return { ...b, ...branch }
              }
              return b
            })
            return { ...m, branches: updatedBranches }
          }
          return m
        })
        saveStoredMerchants(updated)
      } catch (err) {
        console.error(err)
      }
    }
    setIsEditingSettings(false)
    showToast('Branch operational settings & weekly schedule updated successfully!')
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatusFilter !== 'All Statuses') {
        const s = orderStatusFilter.toLowerCase()
        if (s.includes('kitchen') && o.statusVariant !== 'kitchen') return false
        if (s.includes('ready') && o.statusVariant !== 'ready') return false
        if (s.includes('delivery') && o.statusVariant !== 'delivery') return false
        if (s.includes('delivered') && o.statusVariant !== 'delivered') return false
        if (s.includes('cancelled') && o.statusVariant !== 'cancelled') return false
      }
      if (orderChannelFilter !== 'All Channels') {
        const rowType = (o.type || 'Delivery').toLowerCase()
        if (rowType !== orderChannelFilter.toLowerCase()) return false
      }
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase()
        return (
          o.id.toLowerCase().includes(q) ||
          (o.customer?.name || '').toLowerCase().includes(q) ||
          (o.customer?.phone || '').toLowerCase().includes(q) ||
          (o.items || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [orders, orderStatusFilter, orderChannelFilter, orderSearchQuery])

  const handleUpdateOrderStatus = useCallback((orderId, nextVariant) => {
    const statusMapping = {
      kitchen: { status: 'In Kitchen', statusVariant: 'kitchen' },
      ready: { status: 'Ready for Pickup', statusVariant: 'ready' },
      delivery: { status: 'Out for Delivery', statusVariant: 'delivery' },
      delivered: { status: 'Delivered', statusVariant: 'delivered' },
      cancelled: { status: 'Cancelled', statusVariant: 'cancelled' },
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
      typeIcon: 'delivery_dining',
      date: 'Today, Just Now',
      relativeTime: 'Just Now',
      time: 'Just now',
      items: '2x Organic Highland Avocado Bowl, Fresh Cold-Pressed Juice',
      itemsCount: 3,
      amount: 'ETB 580',
      total: 'ETB 580',
      paymentMethod: 'Telebirr (Paid)',
      payment: 'Telebirr (Paid)',
      deliveryAddress: `Addis Ababa Central, Near ${branch?.branch_name || 'Flagship Outlet'}`,
      notes: 'Please expedite delivery, customer is waiting.',
      courier: 'Assigned to Next Available Courier',
    }
    setOrders((prev) => [newOrder, ...prev])
    showToast(`New live order ${newOrder.id} received in branch queue!`)
  }

  const merchantCategories = useMemo(() => {
    return getCategoriesForBranch(merchant, menuItems)
  }, [merchant, menuItems])

  // Order columns for DataTable - Exact matching Super Admin Orders Data Grid
  const orderColumns = useMemo(
    () => [
      {
        accessorKey: 'customer',
        header: 'Customer',
        cell: (info) => {
          const row = info.row.original
          const customer = row.customer || {}
          const name = customer.name || 'Customer'
          const initials = customer.initials || name.substring(0, 2).toUpperCase()
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-[#FF6B35] dark:bg-orange-950/60 dark:text-orange-300">
                {initials}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{name}</p>
                <p className="text-[11px] text-slate-400">{customer.phone || '+251 91 123 4567'}</p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'type',
        header: 'Channel',
        cell: (info) => {
          const row = info.row.original
          const type = info.getValue() || row.type || 'Delivery'
          const icon = row.typeIcon || (type === 'Pickup' ? 'storefront' : type === 'Dine-In' ? 'restaurant' : 'delivery_dining')
          return (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              <span className="material-symbols-outlined text-xs text-[#FF6B35]">
                {icon}
              </span>
              {type}
            </span>
          )
        },
      },
      {
        accessorKey: 'items',
        header: 'Items Summary',
        cell: (info) => (
          <span className="max-w-xs text-xs text-slate-700 dark:text-zinc-300 line-clamp-1 block font-medium" title={info.getValue()}>
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'time',
        header: 'Timestamp',
        cell: (info) => {
          const row = info.row.original
          return (
            <div className="text-xs">
              <p className="font-semibold text-slate-800 dark:text-zinc-200">{row.date || 'Today, 12:45 PM'}</p>
              <p className="text-[11px] text-slate-400">{info.getValue() || row.relativeTime || 'Just Now'}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: 'Total & Payment',
        meta: {
          headerClassName: 'text-right',
          cellClassName: 'text-right',
        },
        cell: (info) => {
          const row = info.row.original
          return (
            <div className="text-right text-xs">
              <p className="font-bold text-slate-900 dark:text-zinc-100">{info.getValue() || row.total || 'ETB 380'}</p>
              <p className="text-[11px] text-slate-400">{row.paymentMethod || row.payment || 'Telebirr (Paid)'}</p>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: {
          headerClassName: 'text-center',
          cellClassName: 'text-center',
        },
        cell: (info) => {
          const row = info.row.original
          const status = orderStatusConfig[row.statusVariant] || orderStatusConfig.kitchen
          return (
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.badgeClass}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
                {row.status || status.label}
              </span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Action',
        enableSorting: false,
        meta: {
          headerClassName: 'text-right',
          cellClassName: 'text-right',
        },
        cell: ({ row }) => (
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedOrder(row.original)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white cursor-pointer"
            >
              <span>View Ticket</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>
        ),
      },
    ],
    []
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
      breadcrumbCurrent={sidebarItems.find((i) => i.id === activeTab)?.label || 'Overview'}
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

      {/* Top Header Action Bar */}
      <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                {branch.branch_name}
              </h1>

              {/* Operating Status Badge */}
              <button
                type="button"
                onClick={handleToggleBranchStatus}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  isBranchOpen
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
                title="Click to toggle store live status"
              >
                <span className={`h-2 w-2 rounded-full ${isBranchOpen ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {isBranchOpen ? 'Open Now' : 'Closed'}
              </button>

              {/* Main Branch Tag */}
              {branch.is_main_branch && (
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Primary Branch
                </span>
              )}

              {/* Branch Switcher Dropdown */}
              {branches.length > 1 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-[#FF6B35] hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-[#FF6B35]">store</span>
                      <span>Switch ({branches.length})</span>
                      <span className="material-symbols-outlined text-xs text-slate-400">expand_more</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuContent align="start" className="min-w-[240px] p-1.5 shadow-xl">
                      <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Select Operating Branch
                      </div>
                      {branches.map((b, idx) => {
                        const isCurrent = String(b.id) === String(branch.id)
                        return (
                          <DropdownMenuItem
                            key={b.id || idx}
                            onClick={() => navigate(`/portal/branches/${b.id || idx}`)}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer ${
                              isCurrent
                                ? 'bg-orange-50 font-bold text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400'
                                : 'text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-750'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">storefront</span>
                              <span>{b.branch_name}</span>
                            </div>
                            {isCurrent && (
                              <span className="material-symbols-outlined text-xs text-[#FF6B35]">check</span>
                            )}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
              )}
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
              Part of <Link to={`/portal/merchants/${merchant.id}`} className="font-bold text-slate-700 hover:text-[#FF6B35] dark:text-zinc-300">{merchant.name}</Link> &bull; Operations, Geolocation &amp; Order Dispatch Console
            </p>
          </div>
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

      {/* Main Content Area driven by Root Side Menu */}
      <div className="space-y-6">
        {/* TAB 1: OVERVIEW & REAL-TIME STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 4 Metric Stats Quick Cards - Matching Super Admin */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
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
                className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-[#FF6B35] dark:border-zinc-800 dark:bg-zinc-900"
                title="Click to view menu catalog"
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
                  <span>{menuItems.length} Products</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  {merchantCategories.length} Categories configured
                </p>
              </div>

              <div
                onClick={() => setActiveTab('ratings')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveTab('ratings')
                }}
                className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-amber-400 dark:border-zinc-800 dark:bg-zinc-900"
                title="Click to view customer ratings & reviews"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Satisfaction
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                    <span className="material-symbols-outlined text-base">star</span>
                  </span>
                </div>
                <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <span>4.9 / 5.0</span>
                  <span className="material-symbols-outlined text-xs text-amber-500">arrow_forward</span>
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  From {branchReviews.length} ratings &bull; View reviews &rarr;
                </p>
              </div>

              <div
                onClick={() => setActiveTab('orders')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActiveTab('orders')
                }}
                className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"
                title="Click to view live branch orders"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Active Orders
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                    <span className="material-symbols-outlined text-base">receipt_long</span>
                  </span>
                </div>
                <p className="mt-2 text-xl font-extrabold text-[#FF6B35] dark:text-orange-400 flex items-center gap-1.5">
                  <span>{orders.length} Orders</span>
                  <span className="material-symbols-outlined text-xs text-blue-500">arrow_forward</span>
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  Live kitchen &amp; delivery queue
                </p>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
        </div>
      )}

        {/* TAB 2: RECENT ORDERS QUEUE - Matching Super Admin Orders Style */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Section */}
            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      Recent Branch Orders Queue
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Live order stream and fulfillment queue for {branch.branch_name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {orders.length} Live Orders
                </span>
                <button
                  type="button"
                  onClick={handleSimulateNewOrder}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3.5 py-2 text-xs font-bold text-[#FF6B35] ring-1 ring-orange-200 transition hover:bg-orange-100 dark:bg-orange-950/40 dark:ring-orange-900/60 dark:text-orange-400 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  <span>Simulate Live Order</span>
                </button>
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
              <div className="relative h-11 min-w-[260px] flex-1">
                <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search order ID, customer name, items..."
                  className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
                />
                {orderSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOrderSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}
              </div>

              {/* Order Status Select */}
              <div className="flex min-w-[150px] flex-col gap-1">
                <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Order Status
                </label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
                >
                  <option>All Statuses</option>
                  <option>In Kitchen</option>
                  <option>Ready for Pickup</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
              </div>

              {/* Channel / Type Select */}
              <div className="flex min-w-[130px] flex-col gap-1">
                <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Channel
                </label>
                <select
                  value={orderChannelFilter}
                  onChange={(e) => setOrderChannelFilter(e.target.value)}
                  className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
                >
                  <option>All Channels</option>
                  <option>Delivery</option>
                  <option>Pickup</option>
                  <option>Dine-In</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOrderSearchQuery('')
                  setOrderStatusFilter('All Statuses')
                  setOrderChannelFilter('All Channels')
                }}
                className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400 cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>

            {/* Orders Table Container matching standard DataTable */}
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <DataTable
                columns={orderColumns}
                data={filteredOrders}
                enablePagination={true}
                pageSize={10}
                itemName="orders"
              />
            </section>
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

        {/* TAB 6: OPERATIONAL SETTINGS - Exact replica of Super Admin Day & Time Edit Cards */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Weekly Operating Hours Schedule */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      Weekly Operating Hours Schedule
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Configured daily opening and closing hours for {branch.branch_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {isBranchOpen ? 'Branch Open Today' : 'Closed Today'}
                  </span>

                  {/* Edit Mode Toggle Button */}
                  {!isEditingSettings ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsForm({
                          schedule: branch?.schedule && typeof branch.schedule === 'object' ? { ...branch.schedule } : createDefaultSchedule(),
                          accepts_orders: branch?.accepts_orders !== false,
                          direct_pickup: branch?.direct_pickup !== false,
                          kitchen_prep_buffer: branch?.kitchen_prep_buffer || '15 - 20 mins',
                          min_order_amount: branch?.min_order_amount || 150,
                        })
                        setIsEditingSettings(true)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Edit Settings</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingSettings(false)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 7 Daily Cards matching Super Admin day cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                {DAYS_OF_WEEK.map((d) => {
                  const activeScheduleSource = isEditingSettings
                    ? settingsForm.schedule
                    : branch.schedule || {}

                  const dayData = activeScheduleSource?.[d.key] || {
                    is_open: true,
                    open_time: branch.opening_hours || '07:30',
                    close_time: branch.closing_hours || '21:30',
                  }
                  const isOpen = Boolean(dayData.is_open)

                  return (
                    <div
                      key={d.key}
                      className={`flex flex-col justify-between rounded-xl border p-3.5 text-center transition ${
                        isOpen
                          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 bg-slate-100/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/20'
                      }`}
                    >
                      <div>
                        <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {d.full}
                        </span>

                        {isEditingSettings ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsForm((prev) => ({
                                ...prev,
                                schedule: {
                                  ...prev.schedule,
                                  [d.key]: {
                                    ...dayData,
                                    is_open: !isOpen,
                                  },
                                },
                              }))
                            }}
                            className={`mt-1.5 inline-block cursor-pointer rounded px-2.5 py-0.5 text-[10px] font-bold transition hover:opacity-80 ${
                              isOpen
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                            }`}
                          >
                            {isOpen ? 'Open' : 'Closed'}
                          </button>
                        ) : (
                          <span
                            className={`mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                              isOpen
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                            }`}
                          >
                            {isOpen ? 'Open' : 'Closed'}
                          </span>
                        )}
                      </div>

                      <div className="mt-3">
                        {isOpen ? (
                          isEditingSettings ? (
                            <div className="space-y-1.5 text-left">
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  From
                                </span>
                                <input
                                  type="time"
                                  value={dayData.open_time}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setSettingsForm((prev) => ({
                                      ...prev,
                                      schedule: {
                                        ...prev.schedule,
                                        [d.key]: {
                                          ...dayData,
                                          open_time: val,
                                        },
                                      },
                                    }))
                                  }}
                                  className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 font-mono text-[11px] font-semibold text-slate-700 shadow-2xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                />
                              </div>
                              <div>
                                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                  To
                                </span>
                                <input
                                  type="time"
                                  value={dayData.close_time}
                                  onChange={(e) => {
                                    const val = e.target.value
                                    setSettingsForm((prev) => ({
                                      ...prev,
                                      schedule: {
                                        ...prev.schedule,
                                        [d.key]: {
                                          ...dayData,
                                          close_time: val,
                                        },
                                      },
                                    }))
                                  }}
                                  className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 font-mono text-[11px] font-semibold text-slate-700 shadow-2xs focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 font-mono text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                              {dayData.open_time} - {dayData.close_time}
                            </p>
                          )
                        ) : (
                          <p className="py-2 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                            Closed
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Operational & Dispatch Controls */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Card 1: Order Dispatch & Delivery Settings */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-[#FF6B35]">
                    tune
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Order Dispatch & Delivery Settings
                  </h3>
                </div>

                <div className="mt-4 space-y-4 text-xs">
                  {/* Accept Online Orders */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">
                        Accept Online Orders
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Allow customers to checkout from this branch
                      </span>
                    </div>
                    {isEditingSettings ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settingsForm.accepts_orders}
                        onClick={() =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            accepts_orders: !prev.accepts_orders,
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settingsForm.accepts_orders
                            ? 'bg-emerald-500'
                            : 'bg-slate-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            settingsForm.accepts_orders ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        {branch.accepts_orders !== false ? 'Enabled' : 'Paused'}
                      </span>
                    )}
                  </div>

                  {/* Direct Customer Pickup */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-zinc-800">
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">
                        Direct Customer Pickup
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Takeout at branch counter
                      </span>
                    </div>
                    {isEditingSettings ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={settingsForm.direct_pickup}
                        onClick={() =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            direct_pickup: !prev.direct_pickup,
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settingsForm.direct_pickup
                            ? 'bg-blue-600'
                            : 'bg-slate-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            settingsForm.direct_pickup ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {branch.direct_pickup !== false ? 'Active' : 'Disabled'}
                      </span>
                    )}
                  </div>

                  {/* Kitchen Prep Buffer */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-zinc-800">
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">
                        Kitchen Prep Buffer
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Default kitchen preparation time
                      </span>
                    </div>
                    {isEditingSettings ? (
                      <select
                        value={settingsForm.kitchen_prep_buffer}
                        onChange={(e) =>
                          setSettingsForm((prev) => ({
                            ...prev,
                            kitchen_prep_buffer: e.target.value,
                          }))
                        }
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        <option value="5 - 10 mins">5 - 10 mins</option>
                        <option value="10 - 15 mins">10 - 15 mins</option>
                        <option value="15 - 20 mins">15 - 20 mins</option>
                        <option value="20 - 30 mins">20 - 30 mins</option>
                        <option value="30+ mins">30+ mins</option>
                      </select>
                    ) : (
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {branch.kitchen_prep_buffer || '15 - 20 mins'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Order Capacity & Value Limits */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-emerald-600">
                    shopping_bag
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Order Capacity &amp; Thresholds
                  </h3>
                </div>

                <div className="mt-4 space-y-4 text-xs">
                  {/* Min Order Value */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">
                        Minimum Order Value
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Floor price for branch checkout
                      </span>
                    </div>
                    {isEditingSettings ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-400">ETB</span>
                        <input
                          type="number"
                          value={settingsForm.min_order_amount}
                          onChange={(e) =>
                            setSettingsForm((prev) => ({
                              ...prev,
                              min_order_amount: Number(e.target.value) || 0,
                            }))
                          }
                          className="w-20 rounded border border-slate-200 bg-white px-2 py-1 font-mono text-xs font-bold text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    ) : (
                      <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                        ETB {branch.min_order_amount || 150}
                      </span>
                    )}
                  </div>

                  {/* Active Order Capacity */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-zinc-800">
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">
                        Concurrent Ticket Cap
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Max active orders before auto-throttle
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      25 simultaneous orders
                    </span>
                  </div>

                  {/* Operational Status */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-zinc-800">
                    <div>
                      <span className="block font-bold text-slate-800 dark:text-zinc-200">
                        Branch Service Status
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Real-time status visible on Shima App
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Active &bull; Accepting Orders
                    </span>
                  </div>
                </div>
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
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                </span>
                <div>
                  <span className="font-mono text-xs font-bold text-[#FF6B35]">{selectedOrder.id}</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Order Dispatch Details</h3>
                </div>
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
                  <p className="font-mono font-black text-slate-900 dark:text-white mt-0.5">{selectedOrder.amount || selectedOrder.total}</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">{selectedOrder.paymentMethod || selectedOrder.payment || 'Telebirr (Paid)'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Items in Ticket</span>
                <p className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
                  {selectedOrder.items}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Fulfillment Type</span>
                  <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{selectedOrder.type || 'Delivery'}</p>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Dispatch Status</span>
                  <p className="font-bold text-[#FF6B35] mt-0.5">{selectedOrder.status}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close Ticket
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {selectedOrder.statusVariant !== 'cancelled' && selectedOrder.statusVariant !== 'delivered' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}
                    className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}

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

                {selectedOrder.statusVariant === 'delivery' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </MerchantPortalLayout>
  )
}
