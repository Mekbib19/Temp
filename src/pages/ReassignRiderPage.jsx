import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import RealTimeLogisticsMap from '../components/RealTimeLogisticsMap'
import {
  ORDER_TYPES,
  getOrderById,
  assignRiderToOrder,
} from '../data/demoOrders'
import { demoRiders } from '../data/demoRiders'

export default function ReassignRiderPage() {
  const params = useParams()
  const navigate = useNavigate()
  const orderId = params.id || params.orderId

  const [order, setOrder] = useState(() => getOrderById(orderId))
  const [courierFilter, setCourierFilter] = useState('ALL') // 'ALL' | 'FREE' | 'FAST' | 'NEAREST'
  const [selectedRiderId, setSelectedRiderId] = useState('')
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Reload order on storage update
  useEffect(() => {
    const syncOrder = () => {
      const updated = getOrderById(orderId)
      if (updated) setOrder(updated)
    }
    window.addEventListener('orders-data-updated', syncOrder)
    return () => window.removeEventListener('orders-data-updated', syncOrder)
  }, [orderId])

  const categoryMeta = useMemo(() => {
    return (
      ORDER_TYPES.find((t) => t.code === order?.order_type) || {
        code: 'FOOD',
        label: 'Food Delivery',
        icon: 'restaurant',
        badgeClass: 'bg-orange-50 text-[#FF6B35] ring-1 ring-orange-500/20 dark:bg-orange-950/40 dark:text-orange-400',
        color: '#FF6B35',
      }
    )
  }, [order?.order_type])

  const originName = order?.merchant?.name || 'Main Restaurant'
  const originBranch = order?.branch?.name || 'Central Branch'

  // Construct merchant pickup waypoint
  const merchantPoint = useMemo(() => ({
    name: `${originName} (${originBranch})`,
    x: 380,
    y: 220,
  }), [originName, originBranch])

  // Courier routes directed straight to the merchant store for pickup
  const courierToMerchantRoutes = useMemo(() => {
    return [
      {
        id: 'RDR-7201',
        orderNumber: '#DISPATCH-01',
        driver: {
          name: 'Abebe Bikila',
          rating: '4.9',
          phone: '+251 91 123 4567',
          vehicle: 'TVS Apache 160 (AA 3-84920)',
          vehicleIcon: 'two_wheeler',
          avatarBg: 'bg-blue-100 text-blue-700',
        },
        brand: { name: originName, category: categoryMeta.label, color: '#ff6b35' },
        pickup: { name: 'Abebe Bikila (Bole Medhanealem Hub)', x: 190, y: 260 },
        destination: { line1: merchantPoint.name, district: 'Merchant Pickup Gate', x: merchantPoint.x, y: merchantPoint.y },
        waypoints: [
          { x: 190, y: 260, heading: 45 },
          { x: 250, y: 245, heading: 50 },
          { x: 315, y: 235, heading: 40 },
          { x: 380, y: 220, heading: 45 },
        ],
        pathD: 'M 190 260 Q 285 240 380 220',
        status: 'En Route to Merchant',
        statusVariant: 'blue',
        initialProgress: 0.45,
        etaText: '4 mins to Store',
        speed: '38 km/h',
        distance: '1.2 km away',
        distanceKm: 1.2,
        speedKmH: 38,
        isFree: true,
        isFast: true,
      },
      {
        id: 'RDR-7202',
        orderNumber: '#DISPATCH-02',
        driver: {
          name: 'Sofia Chen',
          rating: '4.9',
          phone: '+251 92 888 1234',
          vehicle: 'Honda Ace 125 (AA 3-77192)',
          vehicleIcon: 'two_wheeler',
          avatarBg: 'bg-teal-100 text-teal-700',
        },
        brand: { name: originName, category: categoryMeta.label, color: '#0f172a' },
        pickup: { name: 'Sofia Chen (Kazanchis Tech Park)', x: 540, y: 150 },
        destination: { line1: merchantPoint.name, district: 'Merchant Pickup Gate', x: merchantPoint.x, y: merchantPoint.y },
        waypoints: [
          { x: 540, y: 150, heading: 240 },
          { x: 485, y: 175, heading: 235 },
          { x: 430, y: 200, heading: 240 },
          { x: 380, y: 220, heading: 235 },
        ],
        pathD: 'M 540 150 Q 460 180 380 220',
        status: 'En Route to Merchant',
        statusVariant: 'blue',
        initialProgress: 0.62,
        etaText: '6 mins to Store',
        speed: '34 km/h',
        distance: '1.8 km away',
        distanceKm: 1.8,
        speedKmH: 34,
        isFree: true,
        isFast: false,
      },
      {
        id: 'RDR-7203',
        orderNumber: '#DISPATCH-03',
        driver: {
          name: 'Dawit Mengistu',
          rating: '4.95',
          phone: '+251 94 112 3344',
          vehicle: 'Fast Fleet Motor (AA 3-99410)',
          vehicleIcon: 'two_wheeler',
          avatarBg: 'bg-emerald-100 text-emerald-700',
        },
        brand: { name: originName, category: categoryMeta.label, color: '#10b981' },
        pickup: { name: 'Dawit Mengistu (Meskel Square Station)', x: 340, y: 350 },
        destination: { line1: merchantPoint.name, district: 'Merchant Pickup Gate', x: merchantPoint.x, y: merchantPoint.y },
        waypoints: [
          { x: 340, y: 350, heading: 350 },
          { x: 355, y: 305, heading: 355 },
          { x: 370, y: 260, heading: 350 },
          { x: 380, y: 220, heading: 355 },
        ],
        pathD: 'M 340 350 Q 360 280 380 220',
        status: 'En Route to Merchant',
        statusVariant: 'blue',
        initialProgress: 0.35,
        etaText: '3 mins to Store',
        speed: '40 km/h',
        distance: '0.9 km away',
        distanceKm: 0.9,
        speedKmH: 40,
        isFree: true,
        isFast: true,
      },
      {
        id: 'RDR-7204',
        orderNumber: '#DISPATCH-04',
        driver: {
          name: 'James Wilson',
          rating: '4.8',
          phone: '+251 93 456 7890',
          vehicle: 'Eco Courier Bike (AA 3-45100)',
          vehicleIcon: 'pedal_bike',
          avatarBg: 'bg-orange-100 text-orange-700',
        },
        brand: { name: originName, category: categoryMeta.label, color: '#ea580c' },
        pickup: { name: 'James Wilson (Piassa Churchill Corridor)', x: 260, y: 120 },
        destination: { line1: merchantPoint.name, district: 'Merchant Pickup Gate', x: merchantPoint.x, y: merchantPoint.y },
        waypoints: [
          { x: 260, y: 120, heading: 135 },
          { x: 300, y: 155, heading: 130 },
          { x: 340, y: 190, heading: 140 },
          { x: 380, y: 220, heading: 135 },
        ],
        pathD: 'M 260 120 Q 310 165 380 220',
        status: 'En Route to Merchant',
        statusVariant: 'blue',
        initialProgress: 0.25,
        etaText: '8 mins to Store',
        speed: '28 km/h',
        distance: '2.4 km away',
        distanceKm: 2.4,
        speedKmH: 28,
        isFree: true,
        isFast: false,
      },
      {
        id: 'RDR-7205',
        orderNumber: '#DISPATCH-05',
        driver: {
          name: 'Henok Assefa',
          rating: '4.85',
          phone: '+251 91 777 5522',
          vehicle: 'Fleet Van 03 (AA 2-10492)',
          vehicleIcon: 'local_shipping',
          avatarBg: 'bg-blue-100 text-blue-700',
        },
        brand: { name: originName, category: categoryMeta.label, color: '#3b82f6' },
        pickup: { name: 'Henok Assefa (Sarbet Quarters Station)', x: 510, y: 340 },
        destination: { line1: merchantPoint.name, district: 'Merchant Pickup Gate', x: merchantPoint.x, y: merchantPoint.y },
        waypoints: [
          { x: 510, y: 340, heading: 315 },
          { x: 465, y: 300, heading: 310 },
          { x: 420, y: 260, heading: 315 },
          { x: 380, y: 220, heading: 310 },
        ],
        pathD: 'M 510 340 Q 445 280 380 220',
        status: 'En Route to Merchant',
        statusVariant: 'blue',
        initialProgress: 0.55,
        etaText: '9 mins to Store',
        speed: '31 km/h',
        distance: '2.7 km away',
        distanceKm: 2.7,
        speedKmH: 31,
        isFree: false,
        isFast: false,
      },
      {
        id: 'RDR-7206',
        orderNumber: '#DISPATCH-06',
        driver: {
          name: 'Meron Kebede',
          rating: '4.92',
          phone: '+251 92 333 4411',
          vehicle: 'Express Motorcycle (AA 3-33411)',
          vehicleIcon: 'two_wheeler',
          avatarBg: 'bg-rose-100 text-rose-700',
        },
        brand: { name: originName, category: categoryMeta.label, color: '#e11d48' },
        pickup: { name: 'Meron Kebede (Old Airport District)', x: 620, y: 280 },
        destination: { line1: merchantPoint.name, district: 'Merchant Pickup Gate', x: merchantPoint.x, y: merchantPoint.y },
        waypoints: [
          { x: 620, y: 280, heading: 255 },
          { x: 540, y: 260, heading: 250 },
          { x: 460, y: 240, heading: 255 },
          { x: 380, y: 220, heading: 250 },
        ],
        pathD: 'M 620 280 Q 500 250 380 220',
        status: 'En Route to Merchant',
        statusVariant: 'blue',
        initialProgress: 0.70,
        etaText: '11 mins to Store',
        speed: '39 km/h',
        distance: '3.1 km away',
        distanceKm: 3.1,
        speedKmH: 39,
        isFree: true,
        isFast: true,
      },
    ]
  }, [originName, categoryMeta.label, merchantPoint])

  const filteredCourierRoutes = useMemo(() => {
    let list = [...courierToMerchantRoutes]
    if (courierFilter === 'FREE') {
      list = list.filter((r) => r.isFree)
    } else if (courierFilter === 'FAST') {
      list = list.filter((r) => r.isFast)
    } else if (courierFilter === 'NEAREST') {
      list = [...list].sort((a, b) => a.distanceKm - b.distanceKm)
    }
    return list
  }, [courierToMerchantRoutes, courierFilter])

  const freeCount = useMemo(() => courierToMerchantRoutes.filter((r) => r.isFree).length, [courierToMerchantRoutes])
  const fastCount = useMemo(() => courierToMerchantRoutes.filter((r) => r.isFast).length, [courierToMerchantRoutes])

  // Derive active selection smoothly without cascading setState in effect
  const effectiveSelectedRiderId = useMemo(() => {
    if (selectedRiderId && filteredCourierRoutes.some((r) => r.id === selectedRiderId)) {
      return selectedRiderId
    }
    if (order?.rider?.id && filteredCourierRoutes.some((r) => r.id === order.rider.id)) {
      return order.rider.id
    }
    return filteredCourierRoutes[0]?.id || ''
  }, [selectedRiderId, filteredCourierRoutes, order])

  const handleConfirmReassignment = () => {
    const targetId = effectiveSelectedRiderId
    if (!targetId || !order) return
    const selectedRider = demoRiders.find((r) => r.id === targetId) || {
      id: targetId,
      full_name: courierToMerchantRoutes.find((r) => r.id === targetId)?.driver.name || 'Courier',
      phone_number: courierToMerchantRoutes.find((r) => r.id === targetId)?.driver.phone || '+251 91 123 4567',
      vehicle_type: 'MOTORCYCLE',
      plate_number: 'AA 3-84920',
      rating: 4.9,
    }

    const updated = assignRiderToOrder(order.id, selectedRider)
    if (updated) {
      showToast(`Assigned courier ${selectedRider.full_name || selectedRider.name} to ${order.order_number}!`)
      setTimeout(() => {
        navigate(`/orders/${order.id}`)
      }, 700)
    }
  }

  if (!order) {
    return (
      <MainLayout
        activeMenuKey="orderManagement"
        breadcrumbParent="Dashboard"
        breadcrumbCurrent="Order Not Found"
      >
        <div className="mx-auto max-w-4xl py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
            <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <h2 className="mt-4 font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-900 dark:text-zinc-100">
            Order Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            The order number &quot;{orderId}&quot; could not be located.
          </p>
          <div className="mt-6">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Return to Orders</span>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const activeRiderOnOrder = order.rider

  return (
    <MainLayout
      activeMenuKey="orderManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Order Operations"
      breadcrumbCurrent="Reassign Rider"
    >
      <div className="space-y-6 pb-16">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold text-white shadow-2xl transition-all ${
              toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-slate-900 dark:bg-emerald-600'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toastMessage.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span>{toastMessage.message}</span>
          </div>
        )}

        {/* Page Header with Back Arrow and Reassign Rider Title */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/orders/${order.id}`)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
              title="Back to Order Details"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                  Reassign Rider
                </h1>
                <span className="rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-bold text-[#FF6B35] dark:bg-orange-950/40">
                  {order.order_number}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Direct route dispatch to <strong className="text-slate-800 dark:text-zinc-200">{originName}</strong> ({originBranch})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/orders/${order.id}`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <span>Back to Details</span>
            </button>
          </div>
        </section>

        {/* Currently Assigned Courier Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Current Assigned Status
            </span>
            {activeRiderOnOrder ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                ✓ Currently Assigned
              </span>
            ) : (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                Unassigned
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {activeRiderOnOrder ? (
              <div className="flex items-center gap-3">
                <img
                  src={activeRiderOnOrder.avatar || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'}
                  alt={activeRiderOnOrder.name}
                  className="h-12 w-12 rounded-xl border object-cover shadow-2xs"
                />
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {activeRiderOnOrder.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Plate: <span className="font-mono text-slate-800 dark:text-zinc-200">{activeRiderOnOrder.plate_number}</span> • Tel: <span className="font-mono text-slate-800 dark:text-zinc-200">{activeRiderOnOrder.phone}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                No courier currently assigned to this order. Select a rider below to dispatch to store.
              </div>
            )}
            <div className="text-xs text-slate-500">
              Pickup Point: <strong className="text-slate-800 dark:text-zinc-200">{originName}</strong>
            </div>
          </div>
        </div>

        {/* Filter Pills Bar: All Couriers, Free Riders, Fast Riders, Nearest Riders */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                Filter Fleet:
              </span>

              {/* All Couriers */}
              <button
                type="button"
                onClick={() => setCourierFilter('ALL')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                  courierFilter === 'ALL'
                    ? 'bg-[#FF6B35] text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm">two_wheeler</span>
                <span>All Couriers</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    courierFilter === 'ALL'
                      ? 'bg-white/30 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {courierToMerchantRoutes.length}
                </span>
              </button>

              {/* Free Riders */}
              <button
                type="button"
                onClick={() => setCourierFilter('FREE')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                  courierFilter === 'FREE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                <span>Free Riders</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    courierFilter === 'FREE'
                      ? 'bg-white/30 text-white'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  }`}
                >
                  {freeCount} Available
                </span>
              </button>

              {/* Fast Riders */}
              <button
                type="button"
                onClick={() => setCourierFilter('FAST')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                  courierFilter === 'FAST'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm text-amber-500">bolt</span>
                <span>Fast Riders</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    courierFilter === 'FAST'
                      ? 'bg-white/30 text-white'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {fastCount} Express
                </span>
              </button>

              {/* Nearest Riders */}
              <button
                type="button"
                onClick={() => setCourierFilter('NEAREST')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-2xs cursor-pointer ${
                  courierFilter === 'NEAREST'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm text-sky-500">near_me</span>
                <span>Nearest Riders</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    courierFilter === 'NEAREST'
                      ? 'bg-white/30 text-white'
                      : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'
                  }`}
                >
                  Closest First
                </span>
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              {courierFilter === 'FREE' && 'Showing idle riders ready for instant pickup'}
              {courierFilter === 'FAST' && 'Showing fast motorcycle couriers (35+ km/h)'}
              {courierFilter === 'NEAREST' && 'Sorted by shortest distance to store'}
              {courierFilter === 'ALL' && `All ${courierToMerchantRoutes.length} couriers in pickup radius`}
            </span>
          </div>
        </div>

        {/* Real-time Fleet Logistics Map — Direction to Store */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                Real-time Fleet Logistics Map — Direction to Store
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Live GPS direction arrows pointing from courier location straight to <strong className="text-slate-800 dark:text-zinc-200">{originName}</strong>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Navigation</span>
            </span>
          </div>

          <div className="p-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
              <RealTimeLogisticsMap
                selectedOrderId={
                  effectiveSelectedRiderId || courierToMerchantRoutes[0]?.id
                }
                onSelectOrder={(rId) => setSelectedRiderId(rId)}
                customRoutes={filteredCourierRoutes}
                title="Real-time Fleet Logistics Map — Direction to Store"
                subtitle={`Live GPS direction arrows pointing from courier location straight to ${originName} for pickup`}
                pickupLabel="Courier Origin Location:"
                destinationLabel="Store Destination (Merchant):"
                className="h-[380px]"
              />
            </div>
          </div>
        </div>

        {/* Couriers Selection Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
              Available Couriers ({filteredCourierRoutes.length} matching)
            </h3>
            <span className="text-xs text-slate-500">
              Select a courier card below to preview route &amp; assign
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCourierRoutes.map((cr) => {
              const isSelected = effectiveSelectedRiderId === cr.id
              return (
                <div
                  key={cr.id}
                  onClick={() => setSelectedRiderId(cr.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-[#FF6B35] bg-orange-50/50 ring-2 ring-[#FF6B35]/30 shadow-xs dark:border-[#FF6B35] dark:bg-orange-950/20'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-850 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] text-xs font-bold dark:bg-orange-950/40">
                        <span className="material-symbols-outlined text-lg">{cr.driver.vehicleIcon}</span>
                      </span>
                      <div>
                        <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-slate-900 dark:text-zinc-100">
                          {cr.driver.name}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px]">
                          <span className="text-amber-500 font-bold">★ {cr.driver.rating}</span>
                          <span className="text-slate-300 dark:text-zinc-600">•</span>
                          <span className="text-slate-500 dark:text-zinc-400 font-mono">{cr.driver.phone}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-xs transition ${
                        isSelected
                          ? 'border-[#FF6B35] bg-[#FF6B35] text-white'
                          : 'border-slate-300 dark:border-zinc-700'
                      }`}
                    >
                      {isSelected && <span className="material-symbols-outlined text-xs">check</span>}
                    </span>
                  </div>

                  {/* Tags: Free, Fast, Distance */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {cr.isFree ? (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Free / Idle
                      </span>
                    ) : (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                        On Route
                      </span>
                    )}
                    {cr.isFast && (
                      <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                        ⚡ Fast Motor ({cr.speed})
                      </span>
                    )}
                    <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                      {cr.distance}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] pt-2 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                      <span>Vehicle Model:</span>
                      <strong className="text-slate-800 dark:text-zinc-200">{cr.driver.vehicle}</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                      <span>Estimated Arrival:</span>
                      <strong className="text-emerald-600 font-bold">{cr.etaText}</strong>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate pt-1">
                      Current Location: {cr.pickup.name}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Action Confirmation Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
            {effectiveSelectedRiderId ? (
              <span>
                Selected Courier: <strong className="text-slate-900 dark:text-zinc-100">{courierToMerchantRoutes.find((r) => r.id === effectiveSelectedRiderId)?.driver.name || 'Courier'}</strong> ({courierToMerchantRoutes.find((r) => r.id === effectiveSelectedRiderId)?.distance || ''} • {courierToMerchantRoutes.find((r) => r.id === effectiveSelectedRiderId)?.etaText || ''})
              </span>
            ) : (
              'Select a courier above to reassign'
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => navigate(`/orders/${order.id}`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReassignment}
              disabled={!selectedRiderId && !filteredCourierRoutes[0]?.id}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] disabled:opacity-50 transition cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>Confirm Reassignment &amp; Dispatch to Store</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
