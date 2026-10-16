import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DataTable from '../components/DataTable'
import {
  getMerchantById,
  loadStoredMerchants,
  updateMerchant,
  deleteMerchant,
  getCategoryMeta,
} from '../data/demoMerchants'
import { loadStoredCategories } from '../data/demoCategories'
import { loadStoredCuisines } from '../data/demoCuisines'
import { orderStatusConfig, generateOrdersForMerchant } from '../data/demoOrders'

function MerchantOrdersTabContent({
  merchant,
  branches,
  orders,
  setOrders,
  showToast,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [orderStatus, setOrderStatus] = useState('All Statuses')
  const [branchFilter, setBranchFilter] = useState('All Branches')
  const [orderChannel, setOrderChannel] = useState('All Channels')
  const [selectedOrder, setSelectedOrder] = useState(null)

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
      if (branchFilter !== 'All Branches') {
        if (o.branchName !== branchFilter && o.branchId !== branchFilter) return false
      }
      if (orderChannel !== 'All Channels') {
        if (o.type.toLowerCase() !== orderChannel.toLowerCase()) return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesId = o.id.toLowerCase().includes(q)
        const matchesCustomer = o.customer.name.toLowerCase().includes(q)
        const matchesBranch = (o.branchName || '').toLowerCase().includes(q)
        const matchesPhone = (o.customer.phone || '').toLowerCase().includes(q)
        const matchesItems = o.items.toLowerCase().includes(q)
        return matchesId || matchesCustomer || matchesBranch || matchesPhone || matchesItems
      }
      return true
    })
  }, [orders, orderStatus, branchFilter, orderChannel, searchQuery])

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
    const randomBranch = branches && branches.length > 0 ? branches[Math.floor(Math.random() * branches.length)] : null
    const bName = randomBranch?.branch_name || `${merchant?.name || 'Main'} Branch`
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
      branchName: bName,
      branchId: randomBranch?.id || 'branch-0',
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
      deliveryAddress: `Addis Ababa Central, Near ${bName}`,
      notes: 'New live order routed to merchant kitchen.',
      courier: 'Assigned to Next Available Courier',
    }
    setOrders((prev) => [newOrder, ...prev])
    showToast(`New live order ${newOrder.id} received for ${bName}!`)
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      header: 'Order ID',
      cell: (info) => (
        <span className="font-mono font-bold text-[#FF6B35] dark:text-orange-400">
          {info.getValue()}
        </span>
      ),
    },
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
      accessorKey: 'branchName',
      header: 'Branch',
      cell: (info) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
          <span className="material-symbols-outlined text-xs text-orange-500">storefront</span>
          {info.getValue()}
        </span>
      ),
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
    <div id="merchant-recent-orders" className="space-y-6 animate-fade-in">
      {/* Order Ticket Modal */}
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
                    Branch: <span className="font-semibold text-slate-700 dark:text-zinc-300">{selectedOrder.branchName}</span> • {selectedOrder.date}
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
              {merchant.name} — Recent Orders
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Orders Queue
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
            Consolidated culinary transactions and kitchen queue across all branches of {merchant.name}.
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
            placeholder="Search order ID, customer name, items, or branch..."
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
        <div className="flex min-w-[150px] flex-col gap-1">
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

        {/* Branch Filter */}
        {branches && branches.length > 1 && (
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Branch Location
            </label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option>All Branches</option>
              {branches.map((b, idx) => (
                <option key={b.id || idx} value={b.branch_name}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </div>
        )}

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
            setBranchFilter('All Branches')
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

export default function MerchantDetailsPage() {
  const { merchantId } = useParams()
  const navigate = useNavigate()

  const [merchantsList, setMerchantsList] = useState(() => loadStoredMerchants())
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBranchIndex, setSelectedBranchIndex] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Find merchant
  const merchant = useMemo(() => {
    if (!merchantId) return null
    return (
      merchantsList.find((m) => m.id === merchantId || m.merchant_id === merchantId) ||
      getMerchantById(merchantId) ||
      null
    )
  }, [merchantId, merchantsList])

  const categories = useMemo(() => loadStoredCategories(), [])
  const cuisines = useMemo(() => loadStoredCuisines(), [])

  // Resolve Category & Cuisine names and objects
  const categoryObj = useMemo(() => {
    if (!merchant) return null
    if (merchant.category_id) {
      const c = categories.find((cat) => cat.id === merchant.category_id)
      if (c) return c
    }
    if (merchant.category_name) {
      const c = categories.find((cat) => cat.name.toLowerCase() === merchant.category_name.toLowerCase())
      if (c) return c
    }
    return null
  }, [merchant, categories])

  const merchantCatMeta = useMemo(() => {
    return getCategoryMeta(merchant?.category_name || categoryObj?.name || merchant?.type)
  }, [merchant, categoryObj])

  const assignedCuisines = useMemo(() => {
    if (!merchant) return []
    const ids = Array.isArray(merchant.cuisine_ids) ? merchant.cuisine_ids : []
    if (ids.length > 0) {
      return cuisines.filter((c) => ids.includes(c.id))
    }
    if (merchant.cuisine_id) {
      const single = cuisines.filter((c) => c.id === merchant.cuisine_id)
      if (single.length > 0) return single
    }
    if (merchant.cuisine_name) {
      const names = merchant.cuisine_name.split(',').map((s) => s.trim().toLowerCase())
      const matched = cuisines.filter((c) => names.includes(c.name.toLowerCase()))
      if (matched.length > 0) return matched
    }
    return []
  }, [merchant, cuisines])

  // Branches list
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
        latitude: typeof merchant.latitude === 'number' ? merchant.latitude : 9.0016,
        longitude: typeof merchant.longitude === 'number' ? merchant.longitude : 38.7842,
        manager_name: merchant.manager_name || 'Abebe Bikila',
        manager_phone: merchant.manager_phone || '+251 91 876 5432',
        is_open: merchant.is_open !== undefined ? Boolean(merchant.is_open) : true,
        accepts_orders: merchant.accepts_orders !== undefined ? Boolean(merchant.accepts_orders) : true,
        opening_hours: merchant.opening_hours || '08:00 AM',
        closing_hours: merchant.closing_hours || '10:00 PM',
      },
    ]
  }, [merchant])

  // Orders state for merchant
  const [prevMerchantKey, setPrevMerchantKey] = useState(merchant?.id)
  const [orders, setOrders] = useState(() => generateOrdersForMerchant(merchant, branches))

  const currentMerchantKey = merchant?.id
  if (currentMerchantKey !== prevMerchantKey) {
    setPrevMerchantKey(currentMerchantKey)
    setOrders(generateOrdersForMerchant(merchant, branches))
  }

  const currentBranch = branches[selectedBranchIndex] || branches[0]

  // Map Embed URL
  const mapData = useMemo(() => {
    const lat = Number(currentBranch?.latitude ?? 9.0016)
    const lng = Number(currentBranch?.longitude ?? 38.7842)
    const validLat = Number.isFinite(lat) ? lat : 9.0016
    const validLng = Number.isFinite(lng) ? lng : 38.7842
    const bbox = `${validLng - 0.008},${validLat - 0.005},${validLng + 0.008},${validLat + 0.005}`
    return {
      lat: validLat,
      lng: validLng,
      src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${validLat},${validLng}`,
      directionsUrl: `https://www.google.com/maps?q=${validLat},${validLng}`,
    }
  }, [currentBranch?.latitude, currentBranch?.longitude])

  const handleToggleStatus = () => {
    if (!merchant) return
    const currentStatus = (merchant.status || 'ACTIVE').toUpperCase()
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    updateMerchant(merchant.id, { status: nextStatus })
    setMerchantsList(loadStoredMerchants())
    showToast(`Merchant status changed to ${nextStatus}`)
  }

  const handleDeleteMerchantConfirm = () => {
    if (!merchant) return
    deleteMerchant(merchant.id)
    navigate('/restaurants', {
      state: { toastMessage: `Merchant "${merchant.name}" was successfully removed.` },
    })
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text)
    showToast(`${label} copied to clipboard!`)
  }

  if (!merchant) {
    return (
      <MainLayout
        activeMenuKey="merchantManagement"
        breadcrumbParent="Dashboard"
        breadcrumbMiddle="Merchants"
        breadcrumbCurrent="Merchant Not Found"
      >
        <div className="mx-auto max-w-2xl py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
            <span className="material-symbols-outlined text-4xl">storefront</span>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
            Merchant Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            The requested merchant profile could not be located in the local storage. It may have been deleted.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Merchants List
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const rawStatus = (merchant.status || 'ACTIVE').toUpperCase()
  const isActive = rawStatus === 'ACTIVE'

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Merchants"
      breadcrumbCurrent={merchant.name}
    >
      <div className="space-y-6 pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900 animate-fade-in">
            <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-zinc-100">
                Delete Merchant?
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Are you sure you want to remove <span className="font-bold text-slate-700 dark:text-zinc-200">{merchant.name}</span>? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMerchantConfirm}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  Delete Merchant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Action Bar */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/restaurants')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Back to Merchants list"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                  {merchant.name}
                </h1>
                {/* Status Toggle Badge */}
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  title={`Status: ${rawStatus}. Click to toggle.`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {rawStatus}
                </button>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Merchant Partner Profile & Detailed Operations Console
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/restaurants/${merchant.id}/edit`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Merchant
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
              title="Delete Merchant"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </section>

        {/* Hero Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          {/* Banner Image or Gradient Cover */}
          <div className="relative h-44 w-full overflow-hidden bg-gradient-to-r from-orange-400 via-amber-500 to-rose-400 sm:h-52">
            {merchant.cover_image_url || merchant.banner_url || merchant.cover ? (
              <img
                src={merchant.cover_image_url || merchant.banner_url || merchant.cover}
                alt={`${merchant.name} cover`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center opacity-30">
                <span className="material-symbols-outlined text-9xl text-white">storefront</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Quick Badges in Header */}
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 backdrop-blur-md dark:bg-zinc-900/90 dark:text-zinc-200">
                <span className="material-symbols-outlined text-sm text-[#FF6B35]">storefront</span>
                {merchant.type || 'Restaurant & Dining'}
              </span>
              {merchant.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur-md">
                  ★ Featured
                </span>
              )}
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="relative px-6 pb-6 pt-0 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              {/* Brand Logo Avatar */}
              <div className="-mt-14 relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg dark:border-zinc-900 sm:h-32 sm:w-32">
                <img
                  src={merchant.logo_url || merchant.logo}
                  alt={merchant.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF6B35] text-white shadow-sm">
                  <span className="material-symbols-outlined text-xs">verified</span>
                </div>
              </div>

              {/* Title & Classification Tags */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50">
                    {merchant.name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300">
                  {/* Category Badge */}
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold ${merchantCatMeta.badgeClass}`}>
                    <span className="material-symbols-outlined text-sm">{merchantCatMeta.icon}</span>
                    Category: {merchant.category_name || merchantCatMeta.label}
                  </span>

                  {/* Regulatory License Badge */}
                  {merchant.license_number && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 ring-1 ring-slate-300/40 dark:bg-zinc-800 dark:text-zinc-300">
                      <span className="material-symbols-outlined text-sm text-emerald-500">verified</span>
                      Lic: {merchant.license_number}
                    </span>
                  )}

                  {/* Rx Dispenser Badge */}
                  {merchant.is_rx_licensed && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1 font-bold text-sky-700 ring-1 ring-sky-300/40 dark:bg-sky-950/40 dark:text-sky-300">
                      <span className="material-symbols-outlined text-sm">prescriptions</span>
                      Rx Prescriptions Licensed
                    </span>
                  )}

                  {/* Cold Chain Badge */}
                  {merchant.is_cold_chain && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700 ring-1 ring-blue-300/40 dark:bg-blue-950/40 dark:text-blue-300">
                      <span className="material-symbols-outlined text-sm">ac_unit</span>
                      Cold Chain (2°C-8°C)
                    </span>
                  )}

                  {/* 24/7 Emergency Badge */}
                  {merchant.is_emergency_247 && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 font-bold text-rose-700 ring-1 ring-rose-300/40 dark:bg-rose-950/40 dark:text-rose-300">
                      <span className="material-symbols-outlined text-sm">emergency</span>
                      24/7 Service
                    </span>
                  )}

                  {/* Locations / Branches Badge */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('branches')}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
                    title="View operating branches"
                  >
                    <span className="material-symbols-outlined text-sm">store</span>
                    {branches.length} {branches.length === 1 ? 'branch' : 'branches'}
                  </button>
                </div>

                {/* Specialization Tags Bar */}
                {Array.isArray(merchant.specialties) && merchant.specialties.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-1">
                      Domain Focus:
                    </span>
                    {merchant.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Stats Quick Cards */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Operating Branches
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                <span className="material-symbols-outlined text-base">store</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              {branches.length}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              {branches.filter((b) => b.is_open !== false).length} currently open
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Fulfillment ETA
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <span className="material-symbols-outlined text-base">moped</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              {merchant.eta_min || 20}-{merchant.eta_max || 40} <span className="text-sm font-semibold">min</span>
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Average dispatch time
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Commission Rate
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-base">percent</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              {merchant.commission_rate ?? 15}%
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Contracted partner fee
            </p>
          </div>
          <div
            onClick={() => setActiveTab('cuisines')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setActiveTab('cuisines')
            }}
            className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-[#FF6B35] hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Cuisine
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-base">restaurant</span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-1">
              {assignedCuisines.length > 0 ? (
                assignedCuisines.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="h-3.5 w-3.5 object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-[13px] text-amber-500">
                        {c.icon || 'star'}
                      </span>
                    )}
                    {c.name}
                  </span>
                ))
              ) : merchant.cuisine_name ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  <span className="material-symbols-outlined text-[13px] text-amber-500">star</span>
                  {merchant.cuisine_name}
                </span>
              ) : (
                <span className="text-xs italic text-slate-400">No specializations assigned</span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Click to view culinary tags
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-zinc-800">
          <nav className="flex space-x-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview & Story', icon: 'info' },
              { id: 'branches', label: `Branches & Locations (${branches.length})`, icon: 'store' },
              { id: 'cuisines', label: `Category & Cuisines (${assignedCuisines.length})`, icon: 'restaurant' },
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

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Bio & Concept */}
            <div className="space-y-6 lg:col-span-8">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                  <span className="material-symbols-outlined text-base text-[#FF6B35]">description</span>
                  Merchant Concept & Bio
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                  {merchant.description ||
                    'No culinary concept description has been specified yet. Edit merchant details to describe the culinary philosophy, signature recipes, and dining experience.'}
                </p>

                {merchant.dietary_flags && (
                  <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      Dietary & Specialty Flags
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {merchant.dietary_flags}
                    </p>
                  </div>
                )}
              </div>

              {/* Category Domain Information & Regulatory Compliance Card */}
              <div
                className={`rounded-2xl border p-6 shadow-xs transition-all ${
                  merchantCatMeta.code === 'PHARMACY'
                    ? 'border-sky-200/80 bg-gradient-to-br from-sky-50/50 to-white dark:border-sky-900/40 dark:from-zinc-900 dark:to-zinc-900'
                    : merchantCatMeta.code === 'GROCERY'
                    ? 'border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white dark:border-emerald-900/40 dark:from-zinc-900 dark:to-zinc-900'
                    : 'border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${merchantCatMeta.badgeClass}`}
                    >
                      <span className="material-symbols-outlined text-lg">{merchantCatMeta.icon}</span>
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        Category Domain & Regulatory Compliance
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Domain-specific standards for {merchant.category_name || merchantCatMeta.label} ({merchant.type})
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${merchantCatMeta.badgeClass}`}>
                    <span className="material-symbols-outlined text-[13px]">{merchantCatMeta.icon}</span>
                    {merchant.category_name || merchantCatMeta.label} Sector
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Regulatory Accreditation */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                      <span className="material-symbols-outlined text-sm text-emerald-500">verified</span>
                      Accreditation License
                    </p>
                    <p className="mt-1 font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                      {merchant.license_number || 'REG-STD-2024'}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                      {merchantCatMeta.code === 'PHARMACY'
                        ? 'EFDA Certified Medical Dispensary'
                        : merchantCatMeta.code === 'GROCERY'
                        ? 'Ministry of Agriculture / EFDA Food'
                        : 'Official Commerce Authority'}
                    </p>
                  </div>

                  {/* Temperature Control / Cold Chain */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                      <span className="material-symbols-outlined text-sm text-blue-500">ac_unit</span>
                      Temperature & Logistics
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                          merchant.is_cold_chain
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {merchant.is_cold_chain ? '❄️ Active Cold-Chain (2°C - 8°C)' : 'Ambient Storage'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                      {merchantCatMeta.code === 'PHARMACY'
                        ? 'Insulin, vaccines & temperature-sensitive biologics'
                        : merchantCatMeta.code === 'GROCERY'
                        ? 'Refrigerated farm dairy, eggs & fresh greens'
                        : 'Standard protective packaging'}
                    </p>
                  </div>

                  {/* SLA & Fulfillment Parameters */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
                      <span className="material-symbols-outlined text-sm text-orange-500">local_shipping</span>
                      Delivery SLA & Basket
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-900 dark:text-zinc-100">
                      {merchant.delivery_sla || '20-35 min'} SLA • Min: {merchant.min_order || 'ETB 150'}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {merchantCatMeta.code === 'PHARMACY' && merchant.is_rx_licensed && (
                        <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[9px] font-bold text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                          Rx Prescriptions Validated
                        </span>
                      )}
                      {merchant.is_emergency_247 && (
                        <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                          24/7 Emergency Dispatch
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Domain Focus & Key Curated Specialties */}
                {Array.isArray(merchant.specialties) && merchant.specialties.length > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Curated Category Specialties & Priority Lines:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {merchant.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Branch Contact & Operating Hours */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">store</span>
                    Primary Branch Information
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('branches')
                      setSelectedBranchIndex(0)
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline"
                  >
                    <span>View Map & All Branches</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Main Location Address</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.address || merchant.address || 'Address not specified'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Branch Phone</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.phone || merchant.phone || '+251 91 123 4567'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Branch Manager</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.manager_name || 'Designated Store Manager'}
                    </p>
                    {currentBranch.manager_phone && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{currentBranch.manager_phone}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operating Hours</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.opening_hours || '08:00 AM'} - {currentBranch.closing_hours || '10:00 PM'}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {currentBranch.is_open !== false ? '● Open Now' : '○ Closed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Quick Cards & Teasers */}
            <div className="space-y-6 lg:col-span-4">
              {/* Recent Orders Jump Teaser */}
              <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/70 to-amber-50/40 p-5 shadow-xs dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                      <span className="material-symbols-outlined text-base">receipt_long</span>
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Merchant Orders Queue
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {orders.length} orders queued across branches
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Live
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                  Real-time ticket dispatch, kitchen status tracking, and centralized fulfillment across all branches of {merchant.name}.
                </p>

                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF6B35] py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  <span>Open Recent Orders ({orders.length})</span>
                </button>
              </div>

              {/* Quick Merchant Profile Summary */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-indigo-500">storefront</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Partner Overview
                  </h3>
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
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <span>Explore All Branches</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Branches & GPS Geolocation */}
        {activeTab === 'branches' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left: Branch List */}
              <div className="space-y-4 lg:col-span-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Select Branch ({branches.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Click any branch to view on map or open dedicated branch page
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/merchants/${merchant.id}/branches/new`)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                  >
                    <span className="material-symbols-outlined text-sm">add_business</span>
                    <span>Add New Branch</span>
                  </button>
                </div>

                {branches.map((b, idx) => {
                  const branchKey = b.id || idx
                  return (
                    <div
                      key={branchKey}
                      onClick={() => navigate(`/merchants/${merchant.id}/branches/${b.id || idx}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          navigate(`/merchants/${merchant.id}/branches/${b.id || idx}`)
                        }
                      }}
                      className="group relative w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B35] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#FF6B35]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] transition group-hover:bg-[#FF6B35] group-hover:text-white dark:bg-orange-950/40 dark:group-hover:bg-[#FF6B35]">
                            <span className="material-symbols-outlined text-xl">storefront</span>
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#FF6B35] transition dark:text-zinc-100">
                                {b.branch_name}
                              </h4>
                              {b.is_main_branch && (
                                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                  Main Branch
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-zinc-400">
                              Click card to open branch details & map
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-[#FF6B35] transition dark:bg-zinc-800 dark:group-hover:bg-orange-950/50">
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </span>
                        </div>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-600 dark:text-zinc-400 line-clamp-1">
                        {b.address || 'Address not set'}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                        <span className="font-mono text-[10px]">
                          GPS: {Number(b.latitude ?? 9.0016).toFixed(4)}, {Number(b.longitude ?? 38.7842).toFixed(4)}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">
                            {b.manager_name ? `Mgr: ${b.manager_name}` : 'Staff Assigned'}
                          </span>
                          <span className={`font-bold ${b.is_open !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {b.is_open !== false ? '● Open' : '○ Closed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right: Selected Branch Full Map & Info (Displayed after admin selects a branch) */}
              <div className="space-y-6 lg:col-span-7">
                {selectedBranchIndex !== null && currentBranch ? (
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300">
                    <div className="border-b border-slate-100 p-4 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                          <span className="material-symbols-outlined text-lg">storefront</span>
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                              {currentBranch.branch_name}
                            </h3>
                            {currentBranch.is_main_branch && (
                              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                Main
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            GPS: {Number(currentBranch.latitude || 9.0016).toFixed(6)},{' '}
                            {Number(currentBranch.longitude || 38.7842).toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/merchants/${merchant.id}/branches/${currentBranch.id || selectedBranchIndex}`
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#FF6B35] ring-1 ring-orange-200/80 hover:bg-[#FF6B35] hover:text-white transition dark:bg-orange-950/40 dark:ring-orange-900/60 dark:text-orange-400"
                        >
                          <span>Open Full Page</span>
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `${currentBranch.latitude || 9.0016}, ${currentBranch.longitude || 38.7842}`,
                              'Coordinates'
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          Copy Coordinates
                        </button>
                        <a
                          href={mapData.directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#FF6B35] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#e0531f]"
                        >
                          <span>Google Maps</span>
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      </div>
                    </div>

                    <div className="h-72 w-full bg-slate-100 dark:bg-zinc-800">
                      <iframe
                        title={`${currentBranch.branch_name} Map Location`}
                        src={mapData.src}
                        className="h-full w-full border-0"
                        loading="lazy"
                      />
                    </div>

                  <div className="p-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Branch Phone</span>
                      <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                        {currentBranch.phone || '+251 91 123 4567'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Manager</span>
                      <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                        {currentBranch.manager_name || 'Store Supervisor'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Hours</span>
                      <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                        {currentBranch.opening_hours || '08:00 AM'} - {currentBranch.closing_hours || '10:00 PM'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Orders</span>
                      <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                        {currentBranch.accepts_orders !== false ? 'Accepting' : 'Paused'}
                      </p>
                    </div>
                  </div>

                  {/* Weekly Operating Days Schedule Cards */}
                  {currentBranch.schedule && (
                    <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
                      <div className="mb-2.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-amber-500">schedule</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          Weekly Operating Schedule
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                        {[
                          { key: 'monday', label: 'Mon' },
                          { key: 'tuesday', label: 'Tue' },
                          { key: 'wednesday', label: 'Wed' },
                          { key: 'thursday', label: 'Thu' },
                          { key: 'friday', label: 'Fri' },
                          { key: 'saturday', label: 'Sat' },
                          { key: 'sunday', label: 'Sun' },
                        ].map((d) => {
                          const dayData = currentBranch.schedule?.[d.key] || { is_open: true, open_time: '08:00', close_time: '22:00' }
                          const isOpen = Boolean(dayData.is_open)
                          return (
                            <div
                              key={d.key}
                              className={`rounded-xl border p-2 text-center transition ${
                                isOpen
                                  ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                                  : 'border-slate-200 bg-slate-100/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/20'
                              }`}
                            >
                              <span className="block text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                                {d.label}
                              </span>
                              <span
                                className={`mt-0.5 inline-block rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                  isOpen
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                                }`}
                              >
                                {isOpen ? 'Open' : 'Closed'}
                              </span>
                              {isOpen && (
                                <p className="mt-1 font-mono text-[10px] text-slate-600 dark:text-zinc-400">
                                  {dayData.open_time} - {dayData.close_time}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-3xl">map</span>
                  </div>
                  <h4 className="mt-4 text-sm font-bold text-slate-900 dark:text-zinc-100">
                    No Branch Selected
                  </h4>
                  <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-zinc-400">
                    Click any branch on the left to inspect its live geolocation map, operating coordinates, and weekly business hours.
                  </p>
                  {branches.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedBranchIndex(0)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                    >
                      <span className="material-symbols-outlined text-sm">storefront</span>
                      <span>View {branches[0].branch_name} Map</span>
                    </button>
                  )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Category & Cuisines */}
        {activeTab === 'cuisines' && (
          <div className="space-y-6">
            {/* Category Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                  <span className="material-symbols-outlined text-2xl">category</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Primary Category: {categoryObj?.name || merchant.category_name || 'General Category'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Merchant Type: {merchant.type || 'Restaurant & Dining'}
                  </p>
                </div>
              </div>
              {categoryObj?.description && (
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
                  {categoryObj.description}
                </p>
              )}
            </div>

            {/* Assigned Cuisines Grid */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">restaurant</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Assigned Cuisine Types ({assignedCuisines.length})
                  </h3>
                </div>
                <Link
                  to={`/restaurants/${merchant.id}/edit`}
                  className="text-xs font-bold text-[#FF6B35] hover:underline"
                >
                  Edit Cuisines
                </Link>
              </div>

              {assignedCuisines.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {assignedCuisines.map((cuisine) => (
                    <div
                      key={cuisine.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-[#FF6B35]/40 hover:bg-orange-50/30 dark:border-zinc-800 dark:bg-zinc-800/40"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-amber-500 shadow-2xs dark:bg-zinc-900 overflow-hidden">
                          {cuisine.image ? (
                            <img
                              src={cuisine.image}
                              alt={cuisine.name}
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-xl">
                              {cuisine.icon || 'restaurant'}
                            </span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {cuisine.name}
                          </h4>
                          <span className="font-mono text-[10px] text-slate-400">
                            /{cuisine.slug}
                          </span>
                          {cuisine.description && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-zinc-400">
                              {cuisine.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                  No specific cuisines mapped to this merchant. Click &ldquo;Edit Cuisines&rdquo; to configure checkboxes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Recent Orders */}
        {activeTab === 'orders' && (
          <MerchantOrdersTabContent
            merchant={merchant}
            branches={branches}
            orders={orders}
            setOrders={setOrders}
            showToast={showToast}
          />
        )}

      </div>
    </MainLayout>
  )
}
