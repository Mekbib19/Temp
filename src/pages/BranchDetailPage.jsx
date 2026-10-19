import { useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DataTable from '../components/DataTable'
import { getMerchantById, loadStoredMerchants } from '../data/demoMerchants'
import { orderStatusConfig, generateOrdersForBranch } from '../data/demoOrders'
import { getMenuItemsForBranch, getCategoriesForBranch } from '../data/demoMenuItems'
import BranchMenuItemsTabContent from '../components/BranchMenuItemsTabContent'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from '../components/ui/dropdown-menu'

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Mon', full: 'Monday' },
  { key: 'tuesday', label: 'Tue', full: 'Tuesday' },
  { key: 'wednesday', label: 'Wed', full: 'Wednesday' },
  { key: 'thursday', label: 'Thu', full: 'Thursday' },
  { key: 'friday', label: 'Fri', full: 'Friday' },
  { key: 'saturday', label: 'Sat', full: 'Saturday' },
  { key: 'sunday', label: 'Sun', full: 'Sunday' },
]

function BranchOrdersTabContent({
  orders,
  setOrders,
  branch,
  merchant,
  showToast,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [orderStatus, setOrderStatus] = useState('All Statuses')
  const [orderChannel, setOrderChannel] = useState('All Channels')
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderStatus !== 'All Statuses') {
        const s = orderStatus.toLowerCase()
        if (s.includes('kitchen') && o.statusVariant !== 'kitchen') return false
        if (s.includes('ready') && o.statusVariant !== 'ready') return false
        if (s.includes('delivery') && o.statusVariant !== 'delivery') return false
        if (s.includes('delivered') && o.statusVariant !== 'delivered') return false
        if (s.includes('cancelled') && o.statusVariant !== 'cancelled') return false
      }
      if (orderChannel !== 'All Channels') {
        if (o.type.toLowerCase() !== orderChannel.toLowerCase()) return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesId = o.id.toLowerCase().includes(q)
        const matchesCustomer = o.customer.name.toLowerCase().includes(q)
        const matchesPhone = (o.customer.phone || '').toLowerCase().includes(q)
        const matchesItems = o.items.toLowerCase().includes(q)
        return matchesId || matchesCustomer || matchesPhone || matchesItems
      }
      return true
    })
  }, [orders, orderStatus, orderChannel, searchQuery])

  const handleUpdateOrderStatus = (orderId, nextVariant) => {
    const statusMapping = {
      kitchen: { status: 'In Kitchen', statusVariant: 'kitchen' },
      ready: { status: 'Ready for Pickup', statusVariant: 'ready' },
      delivery: { status: 'Out for Delivery', statusVariant: 'delivery' },
      delivered: { status: 'Delivered', statusVariant: 'delivered' },
      cancelled: { status: 'Cancelled', statusVariant: 'cancelled' },
    }
    const update = statusMapping[nextVariant]
    if (!update) return

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...update } : o))
    )
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, ...update }))
    }
    showToast(`Order ${orderId} updated to ${update.status}`)
  }

  const handleSimulateNewOrder = () => {
    const newIdNum = 8800 + Math.floor(Math.random() * 900)
    const randomCustomers = [
      { name: 'Yared Tadesse', phone: '+251 91 999 4433', initials: 'YT' },
      { name: 'Selamawit Bekele', phone: '+251 92 444 8877', initials: 'SB' },
      { name: 'Kidus Haile', phone: '+251 94 333 2211', initials: 'KH' },
      { name: 'Meron Wolde', phone: '+251 93 111 7766', initials: 'MW' },
    ]
    const chosenCust = randomCustomers[Math.floor(Math.random() * randomCustomers.length)]
    const newOrder = {
      id: `#ORD-${newIdNum}`,
      customer: chosenCust,
      branchName: branch.branch_name,
      merchantName: merchant?.name || 'Merchant',
      itemsList: [
        { name: '1x Chef Special Express Platter', price: '$24.50' },
        { name: '1x Artisan House Beverage', price: '$4.50' },
      ],
      items: '1x Chef Special Express Platter, 1x Artisan Beverage',
      total: '$29.00',
      totalNum: 29.0,
      type: 'Delivery',
      typeIcon: 'delivery_dining',
      payment: 'Telebirr (Paid)',
      date: 'Just Now',
      relativeTime: 'Just Now',
      status: 'In Kitchen',
      statusVariant: 'kitchen',
      deliveryAddress: `Addis Ababa Central, Near ${branch.branch_name}`,
      notes: 'New live order routed to this branch kitchen.',
      courier: 'Assigned to Next Available Courier',
    }
    setOrders((prev) => [newOrder, ...prev])
    showToast(`New live order ${newOrder.id} received at ${branch.branch_name}!`)
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: (info) => {
        const customer = info.getValue()
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-[#FF6B35] dark:bg-orange-950/60 dark:text-orange-300">
              {customer.initials || customer.name?.substring(0, 2).toUpperCase() || 'C'}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{customer.name}</p>
              <p className="text-[11px] text-slate-400">{customer.phone || customer.email}</p>
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
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span className="material-symbols-outlined text-xs text-[#FF6B35]">
              {row.typeIcon || 'delivery_dining'}
            </span>
            {info.getValue() || 'Delivery'}
          </span>
        )
      },
    },
    {
      accessorKey: 'items',
      header: 'Items Summary',
      cell: (info) => (
        <span className="max-w-xs text-xs text-slate-700 dark:text-zinc-300 line-clamp-1 block" title={info.getValue()}>
          {info.getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Timestamp',
      cell: (info) => {
        const row = info.row.original
        return (
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-zinc-200">{row.date}</p>
            <p className="text-[11px] text-slate-400">{row.relativeTime}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'total',
      header: 'Total & Payment',
      meta: {
        headerClassName: 'px-4 py-4 sm:px-6 sm:py-5 text-right',
        cellClassName: 'px-4 py-4 sm:px-6 sm:py-5 text-right',
      },
      cell: (info) => {
        const row = info.row.original
        return (
          <div className="text-right text-xs">
            <p className="font-bold text-slate-900 dark:text-zinc-100">{row.total}</p>
            <p className="text-[11px] text-slate-400">{row.payment}</p>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      meta: {
        headerClassName: 'px-4 py-4 sm:px-6 sm:py-5 text-center',
        cellClassName: 'px-4 py-4 sm:px-6 sm:py-5 text-center',
      },
      cell: (info) => {
        const row = info.row.original
        const status = orderStatusConfig[row.statusVariant] || orderStatusConfig.kitchen
        return (
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${status.badgeClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
              {row.status}
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
        headerClassName: 'px-4 py-4 sm:px-6 sm:py-5 text-right',
        cellClassName: 'px-4 py-4 sm:px-6 sm:py-5 text-right',
      },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSelectedOrder(row.original)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white"
          >
            <span>View Ticket</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <div id="branch-recent-orders" className="space-y-6">
      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-850">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      {selectedOrder.id}
                    </h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${orderStatusConfig[selectedOrder.statusVariant]?.badgeClass}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${orderStatusConfig[selectedOrder.statusVariant]?.dotClass}`} />
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Branch: <span className="font-semibold text-slate-700 dark:text-zinc-300">{branch.branch_name}</span> • {selectedOrder.date}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/60">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Customer Details</span>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-zinc-100">
                    {selectedOrder.customer.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {selectedOrder.customer.phone}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400">Order Channel</span>
                  <p className="mt-0.5 font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#FF6B35]">
                      {selectedOrder.typeIcon || 'delivery_dining'}
                    </span>
                    {selectedOrder.type}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {selectedOrder.payment}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Ordered Items Breakdown
                </h4>
                <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                  {selectedOrder.itemsList?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {item.name}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {item.price}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-slate-50/70 p-3 font-bold dark:bg-zinc-800/40">
                    <span className="text-slate-800 dark:text-zinc-200">Total Charged</span>
                    <span className="font-mono text-sm text-[#FF6B35] dark:text-orange-400">
                      {selectedOrder.total}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400">Fulfillment & Delivery Details</span>
                <p className="mt-1 text-slate-700 dark:text-zinc-300">
                  <span className="font-medium">Destination:</span> {selectedOrder.deliveryAddress}
                </p>
                {selectedOrder.notes && (
                  <p className="mt-1 text-slate-500 dark:text-zinc-400 italic">
                    Note: &ldquo;{selectedOrder.notes}&rdquo;
                  </p>
                )}
                {selectedOrder.courier && (
                  <p className="mt-1 text-slate-600 dark:text-zinc-300 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-xs text-blue-500">sports_motorsports</span>
                    {selectedOrder.courier}
                  </p>
                )}
              </div>

              {/* Status Update Quick Buttons */}
              <div className="border-t border-slate-100 pt-4 dark:border-zinc-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Quick Update Status
                </span>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'kitchen')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      selectedOrder.statusVariant === 'kitchen'
                        ? 'bg-orange-500 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    In Kitchen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'ready')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      selectedOrder.statusVariant === 'ready'
                        ? 'bg-amber-500 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    Ready for Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivery')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      selectedOrder.statusVariant === 'delivery'
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    Out for Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'delivered')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      selectedOrder.statusVariant === 'delivered'
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-850">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header bar matching Order Management Style */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              {branch.branch_name} — Recent Orders
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Orders Stream
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Real-time culinary transactions, ticket dispatch, and fulfillment queue for this location.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSimulateNewOrder}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3.5 py-2 text-xs font-bold text-[#FF6B35] ring-1 ring-orange-200 transition hover:bg-orange-100 dark:bg-orange-950/40 dark:ring-orange-900/60 dark:text-orange-400"
          >
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
            <span>Simulate Live Order</span>
          </button>
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            <span>Orders Console</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
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
            placeholder="Search order ID, customer name, items..."
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

        {/* Order Status Select */}
        <div className="flex min-w-[160px] flex-col gap-1">
          <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Order Status
          </label>
          <select
            value={orderStatus}
            onChange={(e) => setOrderStatus(e.target.value)}
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
        <div className="flex min-w-[140px] flex-col gap-1">
          <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Channel
          </label>
          <select
            value={orderChannel}
            onChange={(e) => setOrderChannel(e.target.value)}
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
            setSearchQuery('')
            setOrderStatus('All Statuses')
            setOrderChannel('All Channels')
          }}
          className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
        >
          Clear All Filters
        </button>
      </div>

      {/* Orders Table Container matching standard DataTable */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <DataTable
          columns={columns}
          data={filteredOrders}
          enablePagination={true}
          pageSize={10}
          itemName="orders"
        />
      </section>
    </div>
  )
}

export default function BranchDetailPage() {
  const { merchantId, branchId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Manage active tab: default is 'overview', but switch to 'orders', 'menu_items', or 'settings' if URL requests it
  const [activeTab, setActiveTab] = useState(() => {
    if (location.hash === '#orders' || location.search.includes('tab=orders')) {
      return 'orders'
    }
    if (location.hash === '#menu_items' || location.search.includes('tab=menu_items')) {
      return 'menu_items'
    }
    if (location.hash === '#settings' || location.search.includes('tab=settings')) {
      return 'settings'
    }
    return 'overview'
  })

  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const merchantsList = useMemo(() => loadStoredMerchants(), [])
  const merchant = useMemo(() => {
    if (!merchantId) return null
    return (
      merchantsList.find((m) => m.id === merchantId || m.merchant_id === merchantId) ||
      getMerchantById(merchantId) ||
      null
    )
  }, [merchantId, merchantsList])

  const branches = useMemo(() => {
    if (!merchant) return []
    if (Array.isArray(merchant.branches) && merchant.branches.length > 0) {
      return merchant.branches
    }
    return [
      {
        id: 'branch-primary',
        branch_name: merchant.branch_name || `${merchant.name} Main Branch`,
        is_main_branch: true,
        address: merchant.address || 'Central Commercial Boulevard, Addis Ababa',
        phone: merchant.phone || '+251 91 123 4567',
        phone_number: merchant.phone || '+251 91 123 4567',
        email: merchant.email || 'branch@merchant.et',
        latitude: typeof merchant.latitude === 'number' ? merchant.latitude : 9.0016,
        longitude: typeof merchant.longitude === 'number' ? merchant.longitude : 38.7842,
        manager_name: merchant.manager_name || 'Designated Store Manager',
        manager_phone: merchant.manager_phone || '+251 91 876 5432',
        is_open: merchant.is_open !== undefined ? Boolean(merchant.is_open) : true,
        accepts_orders: merchant.accepts_orders !== undefined ? Boolean(merchant.accepts_orders) : true,
        opening_hours: merchant.opening_hours || '08:00 AM',
        closing_hours: merchant.closing_hours || '10:00 PM',
      },
    ]
  }, [merchant])

  // Locate the specific branch either by id or index (e.g. "0", "1")
  const { branch, branchIndex } = useMemo(() => {
    if (!branches.length) return { branch: null, branchIndex: -1 }
    const foundIdx = branches.findIndex(
      (b, idx) => String(b.id) === String(branchId) || String(idx) === String(branchId)
    )
    if (foundIdx !== -1) {
      return { branch: branches[foundIdx], branchIndex: foundIdx }
    }
    return { branch: branches[0], branchIndex: 0 }
  }, [branches, branchId])

  // Branch orders & menu items state
  const [prevBranchKey, setPrevBranchKey] = useState(branch?.id ?? branchIndex)
  const [orders, setOrders] = useState(() => generateOrdersForBranch(merchant, branch))
  const [menuItems, setMenuItems] = useState(() => getMenuItemsForBranch(branch?.id, merchant?.id, merchant))
  const [initialMenuCategory, setInitialMenuCategory] = useState('all')

  const merchantCategories = useMemo(() => {
    return getCategoriesForBranch(merchant, menuItems)
  }, [merchant, menuItems])

  // Branch Manager & Staff Management Control State
  const [managerData, setManagerData] = useState(() => ({
    name: branch?.manager_name || 'Yonas Alemu',
    phone: branch?.phone_number || branch?.phone || branch?.manager_phone || '+251 91 123 4567',
    email: branch?.email || 'manager.branch@merchant.et',
    shift: 'Full Shift (08:00 AM - 05:00 PM)',
    status: 'On Duty',
  }))

  const [staffList, setStaffList] = useState(() => [
    {
      id: 'st-1',
      name: branch?.manager_name || 'Yonas Alemu',
      role: 'Branch Manager',
      roleVariant: 'orange',
      phone: branch?.phone_number || branch?.phone || branch?.manager_phone || '+251 91 123 4567',
      email: branch?.email || 'yonas.a@merchant.et',
      shift: '08:00 AM - 05:00 PM',
      status: 'On Duty',
      statusVariant: 'active',
      isManager: true,
    },
    {
      id: 'st-2',
      name: 'Bethlehem Tsegaye',
      role: 'Kitchen Head Chef',
      roleVariant: 'blue',
      phone: '+251 92 334 1122',
      email: 'bethlehem.t@merchant.et',
      shift: '07:00 AM - 03:30 PM',
      status: 'On Duty',
      statusVariant: 'active',
    },
    {
      id: 'st-3',
      name: 'Kassahun Bekele',
      role: 'Cashier & Dispatch Lead',
      roleVariant: 'emerald',
      phone: '+251 94 887 6655',
      email: 'kassahun.b@merchant.et',
      shift: '02:00 PM - 10:30 PM',
      status: 'On Duty',
      statusVariant: 'active',
    },
    {
      id: 'st-4',
      name: 'Hanan Mohammed',
      role: 'Fulfillment & Packing Associate',
      roleVariant: 'purple',
      phone: '+251 93 555 8899',
      email: 'hanan.m@merchant.et',
      shift: '09:00 AM - 06:00 PM',
      status: 'Off Duty',
      statusVariant: 'leave',
    },
    {
      id: 'st-5',
      name: 'Dawit Girma',
      role: 'Inventory & Expediter',
      roleVariant: 'orange',
      phone: '+251 91 444 3322',
      email: 'dawit.g@merchant.et',
      shift: '04:00 PM - 11:00 PM',
      status: 'On Duty',
      statusVariant: 'active',
    },
  ])

  // Modals & controls
  const [isEditingManager, setIsEditingManager] = useState(false)
  const [managerEditForm, setManagerEditForm] = useState(managerData)
  const [staffModalOpen, setStaffModalOpen] = useState(false)
  const [staffModalMode, setStaffModalMode] = useState('add')
  const [staffForm, setStaffForm] = useState({
    id: '',
    name: '',
    role: 'Kitchen Head Chef',
    roleVariant: 'blue',
    phone: '',
    email: '',
    shift: '08:00 AM - 05:00 PM',
    status: 'On Duty',
    statusVariant: 'active',
  })

  // Branch operational permission controls
  const [permissions, setPermissions] = useState({
    allowStaffOrderAdvance: true,
    allowStaffItemStockToggle: true,
    allowCashierRefunds: false,
    requireManagerPinForOverrides: true,
  })

  const [staffSearchQuery, setStaffSearchQuery] = useState('')
  const [staffRoleFilter, setStaffRoleFilter] = useState('all')
  const [staffStatusFilter, setStaffStatusFilter] = useState('all')

  const currentBranchKey = branch?.id ?? branchIndex
  if (currentBranchKey !== prevBranchKey) {
    setPrevBranchKey(currentBranchKey)
    setOrders(generateOrdersForBranch(merchant, branch))
    setMenuItems(getMenuItemsForBranch(branch?.id, merchant?.id, merchant))
  }

  if (!merchant || !branch) {
    return (
      <MainLayout
        activeMenuKey="merchantManagement"
        breadcrumbParent="Dashboard"
        breadcrumbMiddle="Merchants"
        breadcrumbCurrent="Branch Not Found"
      >
        <div className="mx-auto max-w-xl py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
            <span className="material-symbols-outlined text-4xl">storefront</span>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
            Branch Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            The requested branch could not be found for this merchant.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate(`/merchants/${merchantId || ''}`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Merchant Profile
            </button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const isBranchOpen = branch.is_open !== false

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle={merchant.name}
      breadcrumbCurrent={branch.branch_name}
    >
      <div className="space-y-6 pb-20">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900 animate-fade-in">
            <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Action Bar (Consistent with MerchantDetailsPage) */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/merchants/${merchant.id}`)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Back to Merchant Branches"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                  {branch.branch_name}
                </h1>

                {/* Operating Status Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                    isBranchOpen
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isBranchOpen ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {isBranchOpen ? 'Open Now' : 'Closed'}
                </span>

                {/* Main Branch Tag */}
                {branch.is_main_branch && (
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                    Primary Branch
                  </span>
                )}

                {/* Branch Switcher Dropdown (Smooth, doesn't take page weight) */}
                {branches.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-[#FF6B35] hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
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
                          const isCurrent = String(b.id) === String(branch.id) || idx === branchIndex
                          return (
                            <DropdownMenuItem
                              key={b.id || idx}
                              onClick={() => navigate(`/merchants/${merchant.id}/branches/${b.id || idx}`)}
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
                Part of <Link to={`/merchants/${merchant.id}`} className="font-bold text-slate-700 hover:text-[#FF6B35] dark:text-zinc-300">{merchant.name}</Link> • Operations, Geolocation & Order Dispatch Console
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Button to toggle to Menu Items */}
            <button
              type="button"
              onClick={() => setActiveTab('menu_items')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xs transition ${
                activeTab === 'menu_items'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-[#FF6B35]">restaurant_menu</span>
              <span>Menu Items ({menuItems.length})</span>
            </button>

            {/* Quick Button to toggle to Orders */}
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-2xs transition ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-[#FF6B35]">receipt_long</span>
              <span>Orders ({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/merchants/${merchant.id}/edit`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Edit Branch</span>
            </button>
          </div>
        </section>

        {/* Hero Card (Matching MerchantDetailsPage style) */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative h-40 w-full overflow-hidden bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 sm:h-48">
            {merchant.cover_image_url || merchant.banner_url || merchant.cover ? (
              <img
                src={merchant.cover_image_url || merchant.banner_url || merchant.cover}
                alt={`${branch.branch_name} cover`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center opacity-25">
                <span className="material-symbols-outlined text-9xl text-white">storefront</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute right-4 top-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 backdrop-blur-md dark:bg-zinc-900/90 dark:text-zinc-200">
                <span className="material-symbols-outlined text-sm text-[#FF6B35]">location_on</span>
                {branch.is_main_branch ? 'Main Headquarters Branch' : 'Satellite Location'}
              </span>
            </div>
          </div>

          <div className="relative px-6 pb-6 pt-0 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              {/* Branch Avatar */}
              <div className="-mt-14 relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg dark:border-zinc-900 sm:h-28 sm:w-28">
                {merchant.logo_url || merchant.logo ? (
                  <img
                    src={merchant.logo_url || merchant.logo}
                    alt={branch.branch_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-orange-100 text-[#FF6B35]">
                    <span className="material-symbols-outlined text-4xl">storefront</span>
                  </div>
                )}
                <div className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-[#FF6B35] text-white shadow-sm">
                  <span className="material-symbols-outlined text-[10px]">pin_drop</span>
                </div>
              </div>

              {/* Branch Details Summary */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-50 sm:text-2xl">
                    {branch.branch_name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300">
                  <button
                    type="button"
                    onClick={() => setActiveTab('staff')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 px-2.5 py-1 font-bold text-[#FF6B35] ring-1 ring-orange-200/60 transition hover:bg-orange-100 dark:bg-orange-950/40 dark:ring-orange-800/40 dark:text-orange-400"
                    title="View manager & staff"
                  >
                    <span className="material-symbols-outlined text-sm">badge</span>
                    <span>Manager: {branch.manager_name || 'Designated Staff'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
                    title="View branch settings & address"
                  >
                    <span className="material-symbols-outlined text-sm">near_me</span>
                    <span>{branch.address || 'Central Addis Ababa'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('menu_items')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 font-bold text-purple-700 transition hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400"
                    title="View branch menu items"
                  >
                    <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                    <span>{menuItems.length} Products & Menu Items</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                    title="View recent orders"
                  >
                    <span className="material-symbols-outlined text-sm">receipt_long</span>
                    <span>{orders.length} Orders</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Stats Quick Cards */}
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
              {branch.opening_hours || '08:00 AM'} - {branch.closing_hours || '10:00 PM'}
            </p>
          </div>

          {/* Clickable Quick Card to jump to Menu Items Catalog */}
          <div
            onClick={() => setActiveTab('menu_items')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveTab('menu_items')
            }}
            className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-[#FF6B35] hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
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
              {menuItems.filter(i => i.is_available).length} in stock • Click to view catalog
            </p>
          </div>

          {/* Clickable Quick Card to jump to Orders */}
          <div
            onClick={() => setActiveTab('orders')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveTab('orders')
            }}
            className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-[#FF6B35] hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
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
              Click to view branch queue
            </p>
          </div>

          {/* Clickable Quick Card to jump to Settings */}
          <div
            onClick={() => setActiveTab('settings')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveTab('settings')
            }}
            className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-[#FF6B35] hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Branch Settings
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                <span className="material-symbols-outlined text-base">settings</span>
              </span>
            </div>
            <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>Operational</span>
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Schedule & dispatch controls
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-zinc-800">
          <nav className="flex space-x-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview & Statistics', icon: 'analytics' },
              { id: 'orders', label: `Recent Orders (${orders.length})`, icon: 'receipt_long' },
              { id: 'menu_items', label: `Menu Items (${menuItems.length})`, icon: 'restaurant_menu' },
              { id: 'staff', label: 'Manager & Staff', icon: 'badge' },
              { id: 'settings', label: 'Settings', icon: 'settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 py-3.5 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* TAB 1: OVERVIEW & ADMIN STATISTICS DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-fade-in">
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
                    ETB 48,250
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
                    {orders.length > 0 ? orders.length : 64} Orders
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    98.4% fulfillment rate
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
                    16.5 min
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    On-time SLA compliant
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Satisfaction
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                      <span className="material-symbols-outlined text-base">star</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    4.9 / 5.0
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    From 328 ratings
                  </p>
                </div>
              </div>

              {/* Order Fulfillment Pipeline Status */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">alt_route</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Live Kitchen & Ticket Dispatch Pipeline
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline"
                  >
                    View All Orders ({orders.length}) →
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-center dark:border-blue-900/40 dark:bg-blue-950/20">
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">New Incoming</span>
                    <p className="mt-1 text-lg font-black text-blue-800 dark:text-blue-200">
                      {orders.filter(o => o.statusVariant === 'new' || !o.statusVariant).length || 4}
                    </p>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400">Instant Alert</span>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">In Prep / Kitchen</span>
                    <p className="mt-1 text-lg font-black text-amber-800 dark:text-amber-200">
                      {orders.filter(o => o.statusVariant === 'kitchen').length || 3}
                    </p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">Cooking</span>
                  </div>

                  <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-center dark:border-purple-900/40 dark:bg-purple-950/20">
                    <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Ready for Pickup</span>
                    <p className="mt-1 text-lg font-black text-purple-800 dark:text-purple-200">
                      {orders.filter(o => o.statusVariant === 'ready').length || 2}
                    </p>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400">Packaged</span>
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-center dark:border-indigo-900/40 dark:bg-indigo-950/20">
                    <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">Out for Delivery</span>
                    <p className="mt-1 text-lg font-black text-indigo-800 dark:text-indigo-200">
                      {orders.filter(o => o.statusVariant === 'delivery').length || 5}
                    </p>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400">On the Road</span>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Delivered Today</span>
                    <p className="mt-1 text-lg font-black text-emerald-800 dark:text-emerald-200">
                      {orders.filter(o => o.statusVariant === 'delivered').length || 50}
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
                      Catalog Categories & Stock Health ({menuItems.length} Products)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('menu_items')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline"
                  >
                    Manage Menu Items Catalog →
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                  {merchantCategories.map((cat) => {
                    const count = menuItems.filter(
                      (i) => (i.category_type || '').toLowerCase() === cat.name.toLowerCase() || i.menu_category_id === cat.id
                    ).length
                    const availableCount = menuItems.filter(
                      (i) => ((i.category_type || '').toLowerCase() === cat.name.toLowerCase() || i.menu_category_id === cat.id) && i.is_available
                    ).length
                    return (
                      <div
                        key={cat.id || cat.name}
                        onClick={() => {
                          setInitialMenuCategory(cat.name)
                          setActiveTab('menu_items')
                        }}
                        className="group cursor-pointer rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-[#FF6B35]/50 hover:bg-orange-50/20 dark:border-zinc-800 dark:bg-zinc-850"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="material-symbols-outlined text-base text-[#FF6B35]">
                              {cat.icon || 'category'}
                            </span>
                            <span className="truncate font-bold text-slate-800 dark:text-zinc-200">
                              {cat.name}
                            </span>
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
                    Daily Peak Volume Heatmap & Rush Hours
                  </h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                    <span className="text-slate-400 block text-[11px]">Breakfast Rush</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                      08:00 AM - 10:30 AM
                    </span>
                    <span className="mt-1 inline-block text-[10px] text-slate-500">18% of daily volume</span>
                  </div>

                  <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 dark:border-orange-900/40 dark:bg-orange-950/20">
                    <span className="text-[#FF6B35] font-bold block text-[11px]">Lunch Surge (Peak)</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 mt-1 block">
                      12:00 PM - 02:30 PM
                    </span>
                    <span className="mt-1 inline-block text-[10px] font-bold text-[#FF6B35]">44% of daily volume</span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                    <span className="text-slate-400 block text-[11px]">Afternoon Snack</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                      03:30 PM - 05:30 PM
                    </span>
                    <span className="mt-1 inline-block text-[10px] text-slate-500">12% of daily volume</span>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                    <span className="text-blue-700 dark:text-blue-300 font-bold block text-[11px]">Dinner Rush</span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 mt-1 block">
                      07:00 PM - 09:30 PM
                    </span>
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
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Branch Store Manager
                  </h3>
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
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
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
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Menu Catalog
                      </h4>
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
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-700"
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
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Branch Orders Queue
                      </h4>
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
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF6B35] py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
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
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Branch Settings
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline"
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
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {branch.accepts_orders !== false ? 'Live Online' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">Fulfillment Mode:</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">Delivery & Pickup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECENT ORDERS (Shown ONLY when Orders is clicked!) */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <BranchOrdersTabContent
              key={branch.id || branchIndex}
              orders={orders}
              setOrders={setOrders}
              branch={branch}
              merchant={merchant}
              showToast={showToast}
            />
          </div>
        )}

        {/* TAB 3: MENU ITEMS (Products Catalog relating to merchant's categories) */}
        {activeTab === 'menu_items' && (
          <div className="animate-fade-in">
            <BranchMenuItemsTabContent
              key={branch.id || branchIndex}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              branch={branch}
              merchant={merchant}
              showToast={showToast}
              initialCategory={initialMenuCategory}
            />
          </div>
        )}

        {/* TAB 4: MANAGER & STAFF CONTROLS */}
        {activeTab === 'staff' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Branch Manager Command Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-slate-100 bg-slate-50/70 p-5 dark:border-zinc-800 dark:bg-zinc-850/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-[#FF6B35] font-extrabold text-lg shadow-sm dark:bg-orange-950/60">
                        {managerData.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-900 ${
                          managerData.status === 'On Duty' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        title={managerData.status}
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                          {managerData.name}
                        </h3>
                        <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-950/60">
                          Store General Manager
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const nextStatus = managerData.status === 'On Duty' ? 'Off Duty' : 'On Duty'
                            setManagerData((prev) => ({ ...prev, status: nextStatus }))
                            showToast(`Manager status switched to ${nextStatus}`)
                          }}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                            managerData.status === 'On Duty'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                          title="Click to toggle manager duty status"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              managerData.status === 'On Duty' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{managerData.status}</span>
                          <span className="material-symbols-outlined text-[10px]">sync</span>
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                        Primary designated operational lead for {branch.branch_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setManagerEditForm(managerData)
                        setIsEditingManager(true)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Edit Manager Credentials</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Manager Detail Grid */}
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-4 text-xs">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/50">
                  <span className="text-[11px] font-semibold text-slate-400 block">Direct Hotline</span>
                  <p className="mt-1 font-mono font-bold text-slate-900 dark:text-zinc-100">
                    {managerData.phone}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/50">
                  <span className="text-[11px] font-semibold text-slate-400 block">Official Email</span>
                  <p className="mt-1 font-mono font-bold text-slate-900 dark:text-zinc-100 truncate">
                    {managerData.email}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/50">
                  <span className="text-[11px] font-semibold text-slate-400 block">Assigned Shift</span>
                  <p className="mt-1 font-bold text-slate-900 dark:text-zinc-100">
                    {managerData.shift}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/50">
                  <span className="text-[11px] font-semibold text-slate-400 block">Branch Assigned</span>
                  <p className="mt-1 font-bold text-slate-900 dark:text-zinc-100">
                    {branch.branch_name} {branch.is_main_branch && '★ Main'}
                  </p>
                </div>
              </div>
            </div>

            {/* Staff Team Roster Control Section */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Branch Staff Roster & Personnel ({staffList.length} Members)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Control team duty statuses, assign operational roles, and manage shift schedules
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStaffForm({
                      id: `st-${Date.now()}`,
                      name: '',
                      role: 'Kitchen Head Chef',
                      roleVariant: 'blue',
                      phone: '+251 91 ',
                      email: '',
                      shift: '08:00 AM - 05:00 PM',
                      status: 'On Duty',
                      statusVariant: 'active',
                    })
                    setStaffModalMode('add')
                    setStaffModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Add Staff Member</span>
                </button>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-3 dark:border-zinc-800 dark:bg-zinc-800/60">
                <div className="relative min-w-[220px] flex-1">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    placeholder="Search staff name, email, or phone..."
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={staffRoleFilter}
                    onChange={(e) => setStaffRoleFilter(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    <option value="all">All Roles</option>
                    <option value="Branch Manager">Branch Manager</option>
                    <option value="Kitchen Head Chef">Kitchen Head Chef</option>
                    <option value="Cashier & Dispatch Lead">Cashier & Dispatch</option>
                    <option value="Fulfillment & Packing Associate">Packing Associate</option>
                    <option value="Inventory & Expediter">Inventory & Expediter</option>
                  </select>

                  <select
                    value={staffStatusFilter}
                    onChange={(e) => setStaffStatusFilter(e.target.value)}
                    className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    <option value="all">All Statuses</option>
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>
              </div>

              {/* Staff Table / Cards */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                      <tr>
                        <th className="px-5 py-3.5">Staff Member</th>
                        <th className="px-5 py-3.5">Role / Position</th>
                        <th className="px-5 py-3.5">Assigned Shift</th>
                        <th className="px-5 py-3.5">Contact Hotline</th>
                        <th className="px-5 py-3.5 text-center">Duty Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {staffList
                        .filter((s) => {
                          if (staffSearchQuery.trim()) {
                            const q = staffSearchQuery.toLowerCase()
                            const matchesName = s.name.toLowerCase().includes(q)
                            const matchesEmail = s.email.toLowerCase().includes(q)
                            const matchesPhone = s.phone.toLowerCase().includes(q)
                            if (!matchesName && !matchesEmail && !matchesPhone) return false
                          }
                          if (staffRoleFilter !== 'all' && s.role !== staffRoleFilter) return false
                          if (staffStatusFilter !== 'all' && s.status !== staffStatusFilter) return false
                          return true
                        })
                        .map((member) => (
                          <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                            <td className="whitespace-nowrap px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-zinc-100">
                                    {member.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5">
                              <span
                                className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                                  member.roleVariant === 'orange'
                                    ? 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
                                    : member.roleVariant === 'blue'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                    : member.roleVariant === 'emerald'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                                }`}
                              >
                                {member.role}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-700 dark:text-zinc-300">
                              {member.shift}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 font-mono text-slate-600 dark:text-zinc-400">
                              {member.phone}
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextStatus = member.status === 'On Duty' ? 'Off Duty' : 'On Duty'
                                  setStaffList((prev) =>
                                    prev.map((s) => (s.id === member.id ? { ...s, status: nextStatus } : s))
                                  )
                                  showToast(`${member.name} switched to ${nextStatus}`)
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                  member.status === 'On Duty'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}
                                title="Click to toggle staff on/off duty status"
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    member.status === 'On Duty' ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                                <span>{member.status}</span>
                                <span className="material-symbols-outlined text-[10px]">sync</span>
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setStaffForm(member)
                                    setStaffModalMode('edit')
                                    setStaffModalOpen(true)
                                  }}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:text-zinc-400"
                                  title="Edit staff details"
                                >
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                {!member.isManager && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (window.confirm(`Are you sure you want to remove ${member.name} from branch staff?`)) {
                                        setStaffList((prev) => prev.filter((s) => s.id !== member.id))
                                        showToast(`${member.name} removed from branch staff`)
                                      }
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-rose-500 transition hover:bg-rose-50 dark:border-zinc-700 dark:hover:bg-rose-950/30"
                                    title="Remove staff member"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Operational Delegation & Permissions Control */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                    <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                      Branch Operational Authority & Access Controls
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Configure what on-duty personnel are authorized to perform in this branch console
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                {[
                  {
                    key: 'allowStaffOrderAdvance',
                    title: 'Live Order Ticket Dispatch',
                    desc: 'Allow kitchen and cashier staff to advance tickets (Kitchen -> Ready -> Picked Up).',
                  },
                  {
                    key: 'allowStaffItemStockToggle',
                    title: 'Menu Item Stock Override',
                    desc: 'Authorize floor staff to instantly toggle items In Stock or Out of Stock during peak rush.',
                  },
                  {
                    key: 'allowCashierRefunds',
                    title: 'Cashier Direct Order Cancellations',
                    desc: 'Enable designated cashiers to void tickets without requiring manager approval override.',
                  },
                  {
                    key: 'requireManagerPinForOverrides',
                    title: 'Manager Approval Code for SLA Exceptions',
                    desc: 'Require Store General Manager PIN verification for delayed tickets exceeding 45 minutes.',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-850/60"
                  >
                    <div className="pr-4">
                      <p className="font-bold text-slate-900 dark:text-zinc-100">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                        {item.desc}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPermissions((prev) => {
                          const updated = { ...prev, [item.key]: !prev[item.key] }
                          showToast(`Permission '${item.title}' ${updated[item.key] ? 'enabled' : 'disabled'}`)
                          return updated
                        })
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        permissions[item.key] ? 'bg-[#FF6B35]' : 'bg-slate-300 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          permissions[item.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal: Edit Branch Manager Info */}
            {isEditingManager && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
              >
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Edit Store Manager Credentials
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingManager(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>

                  <div className="mt-4 space-y-3.5 text-xs">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Manager Full Name
                      </label>
                      <input
                        type="text"
                        value={managerEditForm.name}
                        onChange={(e) => setManagerEditForm({ ...managerEditForm, name: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Official Contact Phone
                      </label>
                      <input
                        type="text"
                        value={managerEditForm.phone}
                        onChange={(e) => setManagerEditForm({ ...managerEditForm, phone: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Staff Email Address
                      </label>
                      <input
                        type="email"
                        value={managerEditForm.email}
                        onChange={(e) => setManagerEditForm({ ...managerEditForm, email: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Shift & Hours Assignment
                      </label>
                      <input
                        type="text"
                        value={managerEditForm.shift}
                        onChange={(e) => setManagerEditForm({ ...managerEditForm, shift: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsEditingManager(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManagerData(managerEditForm)
                        setStaffList((prev) =>
                          prev.map((s) => (s.isManager ? { ...s, name: managerEditForm.name, phone: managerEditForm.phone, email: managerEditForm.email, shift: managerEditForm.shift } : s))
                        )
                        setIsEditingManager(false)
                        showToast('Manager credentials updated successfully')
                      }}
                      className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add or Edit Staff Member */}
            {staffModalOpen && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
              >
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {staffModalMode === 'add' ? 'Add Branch Staff Member' : 'Edit Staff Details'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setStaffModalOpen(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>

                  <div className="mt-4 space-y-3.5 text-xs">
                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        placeholder="e.g. Almaz Bekele"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Position / Role
                      </label>
                      <select
                        value={staffForm.role}
                        onChange={(e) => {
                          const r = e.target.value
                          let variant = 'blue'
                          if (r.includes('Chef')) variant = 'blue'
                          else if (r.includes('Cashier') || r.includes('Dispatch')) variant = 'emerald'
                          else if (r.includes('Packing') || r.includes('Fulfillment')) variant = 'purple'
                          else if (r.includes('Inventory') || r.includes('Manager')) variant = 'orange'
                          setStaffForm({ ...staffForm, role: r, roleVariant: variant })
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="Kitchen Head Chef">Kitchen Head Chef</option>
                        <option value="Cashier & Dispatch Lead">Cashier & Dispatch Lead</option>
                        <option value="Fulfillment & Packing Associate">Fulfillment & Packing Associate</option>
                        <option value="Inventory & Expediter">Inventory & Expediter</option>
                        <option value="Line Cook / Prep Staff">Line Cook / Prep Staff</option>
                        <option value="Assistant Store Manager">Assistant Store Manager</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                        placeholder="+251 91 234 5678"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Staff Email
                      </label>
                      <input
                        type="email"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        placeholder="staff.name@merchant.et"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                        Assigned Shift Hours
                      </label>
                      <select
                        value={staffForm.shift}
                        onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value })}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        <option value="Morning Shift (07:00 AM - 03:30 PM)">Morning Shift (07:00 AM - 03:30 PM)</option>
                        <option value="Full Day Shift (08:00 AM - 05:00 PM)">Full Day Shift (08:00 AM - 05:00 PM)</option>
                        <option value="Afternoon & Evening (02:00 PM - 10:30 PM)">Afternoon & Evening (02:00 PM - 10:30 PM)</option>
                        <option value="Closing Shift (04:00 PM - 11:30 PM)">Closing Shift (04:00 PM - 11:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStaffModalOpen(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!staffForm.name.trim()) {
                          showToast('Please enter staff member name')
                          return
                        }
                        if (staffModalMode === 'add') {
                          const newMember = { ...staffForm, id: `st-${Date.now()}` }
                          setStaffList((prev) => [...prev, newMember])
                          showToast(`${newMember.name} added to branch staff`)
                        } else {
                          setStaffList((prev) =>
                            prev.map((s) => (s.id === staffForm.id ? { ...staffForm } : s))
                          )
                          showToast(`Updated details for ${staffForm.name}`)
                        }
                        setStaffModalOpen(false)
                      }}
                      className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                    >
                      {staffModalMode === 'add' ? 'Add Member' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SETTINGS (Includes Working Hours Schedule, Order Acceptance, and Operating Controls) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Weekly Operating Schedule */}
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
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {isBranchOpen ? 'Branch Open Today' : 'Closed Today'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                {DAYS_OF_WEEK.map((d) => {
                  const dayData = branch.schedule?.[d.key] || {
                    is_open: true,
                    open_time: branch.opening_hours || '08:00',
                    close_time: branch.closing_hours || '22:00',
                  }
                  const isOpen = Boolean(dayData.is_open)
                  return (
                    <div
                      key={d.key}
                      className={`rounded-xl border p-3.5 text-center transition ${
                        isOpen
                          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : 'border-slate-200 bg-slate-100/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/20'
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {d.full}
                      </span>
                      <span
                        className={`mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                          isOpen
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                        }`}
                      >
                        {isOpen ? 'Open' : 'Closed'}
                      </span>
                      {isOpen && (
                        <p className="mt-2 font-mono text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          {dayData.open_time} - {dayData.close_time}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Operational & Dispatch Controls */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-[#FF6B35]">tune</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Order Dispatch & Delivery Settings
                  </h3>
                </div>
                <div className="mt-4 space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                        Accept Online Orders
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Allow customers to checkout from this branch
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {branch.accepts_orders !== false ? 'Enabled' : 'Paused'}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                        Direct Customer Pickup
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Takeout at branch counter
                      </span>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      Active
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                        Kitchen Prep Buffer
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Default kitchen preparation time
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">
                      15 - 20 mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Geolocation & Service Radius Settings */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-indigo-500">pin_drop</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Location & Service Coordinates
                  </h3>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Branch Address</span>
                    <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                      {branch.address || 'Central Commercial Boulevard, Addis Ababa'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Latitude</span>
                      <p className="mt-0.5 font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {Number(branch.latitude || 9.0016).toFixed(6)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Longitude</span>
                      <p className="mt-0.5 font-mono font-bold text-slate-800 dark:text-zinc-200">
                        {Number(branch.longitude || 38.7842).toFixed(6)}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Delivery Coverage Zone</span>
                      <p className="mt-0.5 font-semibold text-slate-800 dark:text-zinc-200">
                        12 km Radial Radius
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      GPS Geofenced
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
