import { useState } from 'react'
import { ORDER_TYPES, ORDER_STATUSES, updateOrderStatus, assignRiderToOrder } from '../data/demoOrders'
import { demoRiders } from '../data/demoRiders'

export default function OrderDetailModal({ order, isOpen, onClose, onOrderUpdated }) {
  const [activeTab, setActiveTab] = useState('lifecycle')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isAssigningRider, setIsAssigningRider] = useState(false)
  const [selectedRiderId, setSelectedRiderId] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  if (!isOpen || !order) return null

  const categoryMeta = ORDER_TYPES.find((t) => t.code === order.order_type) || ORDER_TYPES[0]
  const statusMeta = ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING
  const tracking = order.order_status_tracking || {}
  const isCancelled = order.status === 'CANCELLED'
  const isDelivered = order.status === 'DELIVERED'

  // Determine active phase index for stepper: 1 (Customer), 2 (Store), 3 (Rider), 4 (Delivery)
  let activePhaseNumber = 1
  if (order.status === 'PREPARING') activePhaseNumber = 2
  else if (tracking.order_picked_up_at || order.status === 'OUT_FOR_DELIVERY') activePhaseNumber = 3
  if (tracking.rider_en_route_to_customer_at || tracking.rider_arrived_at_delivery_at) activePhaseNumber = 4
  if (isDelivered) activePhaseNumber = 5

  // Route Coordinates & Google Maps routing URLs
  const originLat = Number(order.branch?.latitude) || 9.0016
  const originLng = Number(order.branch?.longitude) || 38.7842
  const originName = order.merchant?.name || 'Store Location'
  const originBranch = order.branch?.name || 'Main Branch'
  const originAddress = order.branch?.address || 'Cameroon St, Bole, Addis Ababa'

  const destLat = Number(order.delivery_latitude) || 9.0034
  const destLng = Number(order.delivery_longitude) || 38.7845
  const destLabel = order.delivery_address_label || 'Customer Dropoff'
  const destAddress = order.delivery_address_line || 'Bole Sub-City, Atlas Road'
  const destApt = order.delivery_address_apt || ''

  const minLat = Math.min(originLat, destLat) - 0.007
  const maxLat = Math.max(originLat, destLat) + 0.007
  const minLng = Math.min(originLng, destLng) - 0.01
  const maxLng = Math.max(originLng, destLng) + 0.01
  const routeBbox = `${minLng.toFixed(6)},${minLat.toFixed(6)},${maxLng.toFixed(6)},${maxLat.toFixed(6)}`

  const dLatRad = ((destLat - originLat) * Math.PI) / 180
  const dLonRad = ((destLng - originLng) * Math.PI) / 180
  const haversineA =
    Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
    Math.cos((originLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.sin(dLonRad / 2) *
      Math.sin(dLonRad / 2)
  const haversineC = 2 * Math.atan2(Math.sqrt(haversineA), Math.sqrt(1 - haversineA))
  const straightDistanceKm = 6371 * haversineC
  const drivingDistanceKm = Number((straightDistanceKm * 1.35).toFixed(1))
  const estimatedDrivingMinutes = Math.max(5, Math.round(drivingDistanceKm * 3.2 + 4))

  const handleAdvanceStatus = (nextStatus) => {
    const updated = updateOrderStatus(order.id, nextStatus)
    if (updated) {
      if (onOrderUpdated) onOrderUpdated(updated)
    }
  }

  const handleConfirmCancel = (e) => {
    e.preventDefault()
    if (!cancelReason.trim()) return
    const updated = updateOrderStatus(order.id, 'CANCELLED', { reason: cancelReason })
    if (updated) {
      setShowCancelModal(false)
      setCancelReason('')
      if (onOrderUpdated) onOrderUpdated(updated)
    }
  }

  const handleConfirmRiderAssignment = (e) => {
    e.preventDefault()
    if (!selectedRiderId) return
    const selectedRider = demoRiders.find((r) => r.id === selectedRiderId)
    if (!selectedRider) return

    const updated = assignRiderToOrder(order.id, selectedRider)
    if (updated) {
      setIsAssigningRider(false)
      setSelectedRiderId('')
      if (onOrderUpdated) onOrderUpdated(updated)
    }
  }

  const handleVerifyDeliveryPin = (e) => {
    e.preventDefault()
    if (pinInput.trim() !== String(order.delivery_confirmation_code)) {
      setPinError('Incorrect 6-digit PIN. Please verify with customer.')
      return
    }
    setPinError('')
    const updated = updateOrderStatus(order.id, 'DELIVERED', { notes: 'Verified with 6-digit customer confirmation PIN.' })
    if (updated) {
      setPinInput('')
      if (onOrderUpdated) onOrderUpdated(updated)
    }
  }

  const handlePrintReceipt = () => {
    window.print()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-3.5">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-xs"
              style={{ backgroundColor: `${categoryMeta.color}15`, color: categoryMeta.color }}
            >
              <span className="material-symbols-outlined text-2xl">{categoryMeta.icon}</span>
            </span>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900 dark:text-zinc-100">
                  {order.order_number}
                </h2>
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-bold ${categoryMeta.badgeClass}`}>
                  <span className="material-symbols-outlined text-sm">{categoryMeta.icon}</span>
                  <span>{categoryMeta.label}</span>
                </span>
                <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-xs font-bold ${statusMeta.badgeClass}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dotClass}`} />
                  <span>{statusMeta.label}</span>
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Created: {order.created_at ? new Date(order.created_at).toLocaleTimeString() : 'Recently'} • Store: <span className="font-bold text-slate-800 dark:text-zinc-200">{order.merchant?.name}</span> ({order.branch?.name})
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Print Order Receipt"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              title="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-6 text-xs font-bold text-slate-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
          <button
            type="button"
            onClick={() => setActiveTab('lifecycle')}
            className={`border-b-2 py-3 transition ${
              activeTab === 'lifecycle'
                ? 'border-[#FF6B35] text-[#FF6B35]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">timeline</span>
              <span>Order Lifecycle &amp; Stepper</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('items')}
            className={`border-b-2 py-3 transition ${
              activeTab === 'items'
                ? 'border-[#FF6B35] text-[#FF6B35]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">receipt</span>
              <span>Itemized Breakdown ({order.items?.length || 0})</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`border-b-2 py-3 transition ${
              activeTab === 'delivery'
                ? 'border-[#FF6B35] text-[#FF6B35]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">pin_drop</span>
              <span>Delivery Address &amp; Security PIN</span>
            </span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cancelled Banner */}
          {isCancelled && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-200">
                <span className="material-symbols-outlined text-lg text-rose-600">cancel</span>
                <span>Order Cancelled at {tracking.cancelled_at || 'Earlier'}</span>
              </div>
              <p className="mt-1 leading-relaxed">
                Reason: {tracking.cancellation_reason || 'Cancelled by dispatcher.'}
              </p>
            </div>
          )}

          {/* TAB 1: ORDER LIFECYCLE STEPPER */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              {/* Stepper Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                      Fulfillment Stages &amp; Real-Time Tracking
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Step-by-step audit of customer placement, store prep, courier pickup, and final delivery.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    PIN: <strong className="text-slate-800 dark:text-zinc-200 tracking-wider">{order.delivery_confirmation_code}</strong>
                  </span>
                </div>

                {/* Stepped Progress Bar */}
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                  {/* Phase 1: Customer Placement */}
                  <div className={`relative rounded-xl border p-4 transition ${
                    activePhaseNumber >= 1
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 bg-slate-50/50 dark:border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs">
                        1
                      </span>
                      <span className="text-slate-900 dark:text-zinc-100">Customer Phase</span>
                    </div>
                    <div className="mt-2.5 space-y-1 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Placed:</span>
                        <span>{tracking.order_placed_at || '14:10 PM'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payment:</span>
                        <span className="text-emerald-600 font-bold">{order.payment_status} ({order.payment_method})</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: Store / Preparation */}
                  <div className={`relative rounded-xl border p-4 transition ${
                    activePhaseNumber >= 2
                      ? 'border-orange-200 bg-orange-50/40 dark:border-orange-900/40 dark:bg-orange-950/20'
                      : 'border-slate-200 bg-slate-50/50 dark:border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        activePhaseNumber >= 2 ? 'bg-[#FF6B35] text-white' : 'bg-slate-200 text-slate-600 dark:bg-zinc-700'
                      }`}>
                        2
                      </span>
                      <span className="text-slate-900 dark:text-zinc-100">Store Prep</span>
                    </div>
                    <div className="mt-2.5 space-y-1 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Confirmed:</span>
                        <span>{tracking.order_confirmed_at || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Preparing:</span>
                        <span>{tracking.preparing_started_at || (order.status === 'PREPARING' ? 'In Progress' : '—')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ready:</span>
                        <span>{tracking.ready_for_pickup_at || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 3: Courier Pickup */}
                  <div className={`relative rounded-xl border p-4 transition ${
                    activePhaseNumber >= 3
                      ? 'border-blue-200 bg-blue-50/40 dark:border-blue-900/40 dark:bg-blue-950/20'
                      : 'border-slate-200 bg-slate-50/50 dark:border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        activePhaseNumber >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-zinc-700'
                      }`}>
                        3
                      </span>
                      <span className="text-slate-900 dark:text-zinc-100">Courier Pickup</span>
                    </div>
                    <div className="mt-2.5 space-y-1 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned:</span>
                        <span>{tracking.rider_assigned_at || (order.rider ? 'Assigned' : 'Unassigned')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">At Store:</span>
                        <span>{tracking.rider_arrived_at_restaurant_at || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Picked Up:</span>
                        <span>{tracking.order_picked_up_at || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phase 4: Final Delivery */}
                  <div className={`relative rounded-xl border p-4 transition ${
                    activePhaseNumber >= 4
                      ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'border-slate-200 bg-slate-50/50 dark:border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isDelivered ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-zinc-700'
                      }`}>
                        4
                      </span>
                      <span className="text-slate-900 dark:text-zinc-100">Delivery Dropoff</span>
                    </div>
                    <div className="mt-2.5 space-y-1 text-[11px] font-mono text-slate-600 dark:text-zinc-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">In Transit:</span>
                        <span>{tracking.rider_en_route_to_customer_at || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">At Door:</span>
                        <span>{tracking.rider_arrived_at_delivery_at || '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Delivered:</span>
                        <span className="text-emerald-600 font-bold">{tracking.order_delivered_at || (isDelivered ? 'Complete' : '—')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid: Stakeholders (Customer & Courier) */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Customer Details */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Customer Profile
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-3.5">
                    <img
                      src={order.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                      alt={order.customer?.name}
                      className="h-12 w-12 rounded-2xl border object-cover shadow-2xs"
                    />
                    <div>
                      <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {order.customer?.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                        {order.customer?.phone}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {order.customer?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Courier / Rider Details */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Assigned Courier
                    </span>
                    {order.rider ? (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        Active Dispatch
                      </span>
                    ) : (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                        Unassigned
                      </span>
                    )}
                  </div>

                  {order.rider ? (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={order.rider?.avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'}
                          alt={order.rider?.name}
                          className="h-12 w-12 rounded-2xl border object-cover shadow-2xs"
                        />
                        <div>
                          <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                            {order.rider?.name}
                          </h4>
                          <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                            {order.rider?.phone} • Plate: <strong className="text-slate-800 dark:text-zinc-200">{order.rider?.plate_number}</strong>
                          </p>
                          <p className="text-[11px] text-amber-500 font-bold">
                            ★ {order.rider?.rating || 4.9} Courier Rating
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAssigningRider(true)}
                        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300"
                      >
                        Reassign
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        No courier has picked up this delivery yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsAssigningRider(true)}
                        className="rounded-xl bg-[#FF6B35] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#e0531f]"
                      >
                        Assign Courier
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Pharmacy Prescription Card if applicable */}
              {order.order_type === 'PHARMACY' && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50/40 p-5 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-200/60 dark:border-sky-900/40">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-sky-600 dark:text-sky-400">
                        clinical_notes
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-200">
                        Doctor Prescription Verification
                      </h4>
                    </div>
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                      {order.is_prescription_uploaded ? 'Verified by Pharmacist' : 'Over-the-Counter'}
                    </span>
                  </div>

                  {order.prescription_image_url && (
                    <div className="mt-4 flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={order.prescription_image_url}
                        alt="Prescription Document"
                        className="h-28 w-36 rounded-xl border border-sky-200 object-cover shadow-sm bg-white"
                      />
                      <div className="text-xs space-y-1 text-slate-700 dark:text-zinc-300">
                        <p className="font-bold text-slate-900 dark:text-zinc-100">
                          Official Certified Medical Prescription Attached
                        </p>
                        <p className="text-slate-500 dark:text-zinc-400 text-[11px]">
                          Validated under Ethiopian Food &amp; Drug Authority (EFDA) commercial dispensing protocols. Cold-chain storage applied.
                        </p>
                        <div className="pt-2">
                          <a
                            href={order.prescription_image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold text-sky-600 hover:underline dark:text-sky-400"
                          >
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            <span>Expand High-Res Prescription</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ITEMIZED BREAKDOWN */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                      <th className="px-5 py-3.5">Item Description</th>
                      <th className="px-5 py-3.5 text-center">Qty</th>
                      <th className="px-5 py-3.5 text-right">Unit Price</th>
                      <th className="px-5 py-3.5 text-right">Total Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {(order.items || []).map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 dark:text-zinc-100">{item.name}</p>
                          {item.options_summary && (
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                              {item.options_summary}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center font-mono font-bold text-slate-700 dark:text-zinc-300">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-slate-600 dark:text-zinc-400">
                          {order.currency || 'ETB'} {Number(item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 dark:text-zinc-100">
                          {order.currency || 'ETB'} {Number(item.total_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary Calculation */}
                <div className="border-t border-slate-200/80 bg-slate-50/60 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="ml-auto max-w-xs space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                      <span>Subtotal Amount:</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {order.currency || 'ETB'} {Number(order.subtotal_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                      <span>Delivery Service Fee:</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {order.currency || 'ETB'} {Number(order.delivery_fee_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                      <span>Platform Tax:</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        {order.currency || 'ETB'} {Number(order.tax_amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold text-[#FF6B35] dark:border-zinc-700">
                      <span>Total Amount:</span>
                      <span>
                        {order.currency || 'ETB'} {Number(order.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERY & SECURITY PIN */}
          {activeTab === 'delivery' && (
            <div className="space-y-6">
              {/* Security PIN Card */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      6-Digit Delivery Confirmation PIN
                    </span>
                    <p className="mt-1 text-xs text-slate-600 dark:text-zinc-300">
                      Given to recipient upon dispatch. Courier verifies code at doorstep to complete order.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-xl border border-amber-300 bg-white px-4 py-2 font-mono text-xl font-black tracking-widest text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100">
                      {order.delivery_confirmation_code}
                    </span>
                    {order.delivery_approved_at ? (
                      <span className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">
                        ✓ PIN Verified
                      </span>
                    ) : (
                      <span className="rounded-xl bg-amber-200 px-3 py-2 text-xs font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-300">
                        Awaiting Verification
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline PIN verification form if out for delivery */}
                {!isDelivered && !isCancelled && (
                  <form onSubmit={handleVerifyDeliveryPin} className="mt-4 pt-3 border-t border-amber-200/60 flex flex-wrap items-center gap-3">
                    <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Verify Customer PIN manually:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="e.g. 481920"
                      className="h-9 w-32 rounded-xl border border-amber-300 bg-white px-3 font-mono text-xs font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                    >
                      Confirm Delivery
                    </button>
                    {pinError && <span className="text-xs font-bold text-rose-600">{pinError}</span>}
                  </form>
                )}
              </div>

              {/* Delivery Destination, Live Route Corridor & Google Maps */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#FF6B35]">route</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Delivery Route Corridor &amp; Google Map
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] ring-1 ring-orange-500/20 dark:bg-orange-950/40">
                    ~{drivingDistanceKm} km • ~{estimatedDrivingMinutes} min driving
                  </span>
                </div>

                {/* Route Map Iframe */}
                <div className="mt-4 relative overflow-hidden rounded-xl border border-slate-200/90 bg-slate-100 shadow-inner dark:border-zinc-800 dark:bg-zinc-800">
                  <iframe
                    title="Modal Route Map"
                    className="w-full h-48 border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${routeBbox}&layer=mapnik&marker=${destLat},${destLng}`}
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 shadow-sm backdrop-blur dark:bg-zinc-900/90 dark:text-zinc-100">
                    <span className="h-2 w-2 rounded-full bg-[#FF6B35]" />
                    <span className="max-w-[100px] truncate">{originName}</span>
                    <span className="text-slate-400">➔</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="max-w-[100px] truncate">{destLabel}</span>
                  </div>
                </div>

                {/* In-app Action Button */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${originLat},${originLng} to ${destLat},${destLng}`)
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <span className="material-symbols-outlined text-base">content_copy</span>
                    <span>Copy Route Coordinates</span>
                  </button>
                </div>

                {/* Waypoints Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Origin */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <span className="font-bold text-slate-700 dark:text-zinc-300 block text-[11px]">
                      Point A: Initial Store Pickup
                    </span>
                    <p className="mt-0.5 font-bold text-slate-900 dark:text-zinc-100">
                      {originName} ({originBranch})
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{originAddress}</p>
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">GPS: {originLat}, {originLng}</p>
                  </div>

                  {/* Destination */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-950/40 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300 block text-[11px]">
                        Point B: Final Destination
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${destLat}, ${destLng}`)
                        }}
                        className="text-[10px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                      >
                        Copy GPS
                      </button>
                    </div>
                    <p className="mt-0.5 font-bold text-slate-900 dark:text-zinc-100">
                      {destLabel}: <span className="font-semibold text-slate-700 dark:text-zinc-300">{destAddress}</span>
                    </p>
                    {destApt && <p className="text-slate-600 text-[11px] mt-0.5">{destApt}</p>}
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">GPS: {destLat}, {destLng}</p>
                  </div>
                </div>

                {order.delivery_instruction && (
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer Delivery Instructions
                    </span>
                    <p className="mt-1 font-medium text-slate-800 dark:text-zinc-200">
                      &quot;{order.delivery_instruction}&quot;
                    </p>
                  </div>
                )}

                {/* Voice instruction audio player */}
                {order.delivery_voice_url && (
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-200/80 bg-orange-50/40 p-3 text-xs dark:border-orange-950/40 dark:bg-orange-950/20">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-xl text-[#FF6B35]">mic</span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-zinc-100">
                          Customer Audio Voice Instruction
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          0:14 Audio Clip • Recorded by customer
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="inline-flex items-center gap-1 rounded-xl bg-[#FF6B35] px-3 py-1.5 font-bold text-white shadow-2xs hover:bg-[#e0531f]"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isPlayingAudio ? 'pause' : 'play_arrow'}
                      </span>
                      <span>{isPlayingAudio ? 'Pause' : 'Play Note'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Fulfillment Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2">
            {!isCancelled && !isDelivered && (
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
              >
                <span className="material-symbols-outlined text-base">cancel</span>
                <span>Cancel Order</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {order.status === 'PENDING' && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus('PREPARING')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#e0531f]"
              >
                <span className="material-symbols-outlined text-base">soup_kitchen</span>
                <span>Confirm &amp; Start Preparing</span>
              </button>
            )}

            {order.status === 'PREPARING' && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus('OUT_FOR_DELIVERY')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700"
              >
                <span className="material-symbols-outlined text-base">moped</span>
                <span>Dispatch Out for Delivery</span>
              </button>
            )}

            {order.status === 'OUT_FOR_DELIVERY' && (
              <button
                type="button"
                onClick={() => handleAdvanceStatus('DELIVERED')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Mark Delivered</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                Cancel Order {order.order_number}
              </h3>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">
              Please specify the cancellation reason. If prepaid, an automatic refund will be credited to the customer&apos;s digital wallet.
            </p>

            <form onSubmit={handleConfirmCancel} className="mt-4 space-y-3">
              <textarea
                required
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Customer requested cancellation / Store out of stock..."
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-400"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Courier Modal */}
      {isAssigningRider && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#FF6B35]">two_wheeler</span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                Dispatch Courier to {order.order_number}
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Select an available verified courier to fulfill this delivery dispatch.
            </p>

            <form onSubmit={handleConfirmRiderAssignment} className="mt-4 space-y-3">
              <select
                required
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Select an active courier...</option>
                {demoRiders.filter((r) => r.status === 'ACTIVE' || r.verification_status === 'APPROVED').map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.full_name} ({r.vehicle?.vehicle_type || 'Moto'} • {r.vehicle?.plate_number || 'AA-3'}) - Rating {r.rating}★
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssigningRider(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedRiderId}
                  className="rounded-xl bg-[#FF6B35] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#e0531f] disabled:opacity-50"
                >
                  Assign to Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
