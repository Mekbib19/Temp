import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import RealTimeLogisticsMap from '../components/RealTimeLogisticsMap'
import Pagination from '../components/Pagination'
import {
  ORDER_TYPES,
  loadStoredOrders,
  updateOrderStatus,
} from '../data/demoOrders'

// Default fleet delivery records (Orders out from merchant to delivery)
const INITIAL_FLEET_DELIVERIES = [
  {
    id: 'ORD-9021',
    date: 'Mar 24, 14:32',
    category: 'FOOD',
    driver: {
      name: 'Marcus Thorne',
      rating: '4.9',
      phone: '+251 91 234 5678',
      vehicle: 'Electric Motorbike (AA-3849)',
      avatarBg: 'bg-indigo-100',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHe2a24dFoMyuM8QLaEBRNmbXo9s1uYPvPJJU4fSDuJbvY5nFJrMjr5Py26pOR5RP80KAOMnC1qf-pQwO2Lz6Vl6HDIszJBLnrfglcHlUyiKBtE9--yT_uU65fIQ7fccrbLTLErP5feQcJyt8WuQbAO67X7FHkuH_Y7CEVmlWjWzUdRDv2FihKCi8383im7XxXJ0rjlLxxbKWxS8Yl526U-fAsOoAK0E0V1b-qbiAJx4ONL0wolt8kRJXFVbUNxo5fnMWJtvthnEk',
    },
    brand: { letter: 'V', name: 'Verde Kitchen', logoBg: 'bg-emerald-600', branch: 'Bole Cameroon St' },
    destination: { line1: '224 Baker Street, Apt 4B', distance: '2.4 miles away', district: 'Downtown Central' },
    eta: { type: 'time', text: '12 mins', color: 'text-emerald-600 dark:text-emerald-400' },
    speed: '38 km/h',
    status: { label: 'On the way', variant: 'blue' },
    customer: { name: 'Abebe Bikila', phone: '+251 91 123 4567', email: 'abebe.b@gmail.com', pin: '482910' },
  },
  {
    id: 'ORD-8944',
    date: 'Mar 24, 14:15',
    category: 'FOOD',
    driver: {
      name: 'Sofia Chen',
      rating: '5.0',
      phone: '+251 92 888 1234',
      vehicle: 'Express Scooter (ET-9920)',
      avatarBg: 'bg-teal-100',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsuLjTs6USKj0_LJcEDUw7fvBfEpS_ZgYk3l4aFtprNpZglfXmaqqaoTGTM6iyLDFk430EirJPaBvj7wIF7-XltnoFxKxGAdCLKUiQ94s3GpYWHl4pkjxW74SzgRAruxHT9tBSKSJpLAjDSwBplUVb6jVY6kA-uGd906XcoeakC5On9WBWJeJrqvJtIWDgcz8M4nLk22vMXNJnvjedjOjwKOCh1V4mlwuXKg9mYdzw6de7qnaJCIRXGlRf32G58BhEKoSL0sbL3Hk',
    },
    brand: { letter: 'O', name: 'Oishi Sushi', logoBg: 'bg-slate-900', branch: 'Bole Medhanialem' },
    destination: { line1: 'The Grand Hotel, Lobby', distance: '0.1 miles away', district: 'Bole Commercial' },
    eta: { type: 'arrived', text: 'Arrived', color: 'text-green-600' },
    speed: '0 km/h (At Venue)',
    status: { label: 'Arrived', variant: 'green' },
    customer: { name: 'Bethlehem Tefera', phone: '+251 91 345 6789', email: 'b.tefera@gmail.com', pin: '192044' },
  },
  {
    id: 'ORD-9055',
    date: 'Mar 24, 14:45',
    category: 'FOOD',
    driver: {
      name: 'James Wilson',
      rating: '4.8',
      phone: '+251 93 456 7890',
      vehicle: 'Eco Courier Bike (ET-4012)',
      avatarBg: 'bg-orange-100',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWC6eoV9btROl9929PCTcTb6uBRlr-Y_wH3fqimuQiCi_aUK2F-JVlvAt0iDo3mMWqzThW8vEkgAWYzNI_fXfE3LVIXa_07iNTUDqlKJg4R8q5ko-mwrxrSvH1HjR33R_BG-amAtc-riGdedhEEds9PBkSeBBdblJfMI6RNQIaTSkHbMPASqjMphXLIBDV5_vBjb6Y4HdvFo7K34R_fPqvD-Ag3_5omXBAE4s9YxYRoWfbFgTKCgNRCjXAxElShN6h4Cn0bUL-dyk',
    },
    brand: { letter: 'B', name: 'Burger Theory', logoBg: 'bg-[#ff6b35]', branch: 'Kazanchis Tech Park' },
    destination: { line1: '99 Silicon Valley Dr.', distance: '4.1 miles away', district: 'Kazanchis' },
    eta: { type: 'time', text: '28 mins', color: 'text-slate-400' },
    speed: '34 km/h',
    status: { label: 'Picked up', variant: 'muted' },
    customer: { name: 'Dawit Mengistu', phone: '+251 92 456 7891', email: 'dawit.m@gmail.com', pin: '394821' },
  },
  {
    id: 'ORD-9102',
    date: 'Mar 24, 14:48',
    category: 'FOOD',
    driver: {
      name: 'Dawit Mengistu',
      rating: '4.95',
      phone: '+251 94 112 3344',
      vehicle: 'Fast Fleet Motor (AA-1120)',
      avatarBg: 'bg-emerald-100',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBIvL7eX9jDEOipCFcw_dAQqTAR-U8ji5GDMLAVuoaA1ztVhIhUVzhSKUd8a81aHArT2Uz6OKhn4aJOlfw3lNScx9Ra9kojATj1gdb49fjSZ7PNDnfpiuRo_OivaOdnguYVqZAtcX5_27MRq7Jmvc5fp-B7CxNfQkptyt2AOc_QduqCP74MPzH4Y706g8_WHkZUcodbhVhRqRQCA6dQj7MRMZW4MLspoZS5dosZO3cDZCC0_gsmTikjE6-BHNMcson_UonclOsgBPg',
    },
    brand: { letter: 'B', name: 'Bella Pasta & Grill', logoBg: 'bg-red-600', branch: 'Piassa Hub' },
    destination: { line1: 'Churchill Ave Tower', distance: '1.8 miles away', district: 'Piassa' },
    eta: { type: 'time', text: '8 mins', color: 'text-emerald-600 dark:text-emerald-400' },
    speed: '42 km/h',
    status: { label: 'On the way', variant: 'blue' },
    customer: { name: 'Helen Girmay', phone: '+251 91 999 8888', email: 'helen.g@gmail.com', pin: '883921' },
  },
  {
    id: 'ORD-9140',
    date: 'Mar 24, 14:50',
    category: 'GROCERY',
    driver: {
      name: 'Bethlehem Tefera',
      rating: '4.9',
      phone: '+251 91 555 4321',
      vehicle: 'Electric Motorbike (AA-9401)',
      avatarBg: 'bg-purple-100',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDN1IEczdcvsariAG9A6Vs5ZNASqpGwItGRxE68F8417M7l3BWDzFsPoMCd-dMYKsyAViCmKCvv5t2vsum4pJVj7Bt4tzilNI_2nXQ4tvJEcXQCeH5N1VZKXBMn1zNnK_1nz2zNcSgc2lokp2sHfHKhrBRydscH61RaFANOPk--IjHOqyxWogn5QG6ak9785C8Q07tbV4e4oexTSccE0F6NZpsshuB0wPDzU-0CdkH5ISwo9Hz6fmBhbx1GdvHymCOg6c-YdAYb3Do',
    },
    brand: { letter: 'G', name: 'Golden Roast Cafe', logoBg: 'bg-amber-600', branch: 'Bole Medhanialem' },
    destination: { line1: 'Bole Medhanialem Rd', distance: '3.2 miles away', district: 'Bole' },
    eta: { type: 'time', text: '15 mins', color: 'text-emerald-600 dark:text-emerald-400' },
    speed: '35 km/h',
    status: { label: 'On the way', variant: 'blue' },
    customer: { name: 'Yonas Mulugeta', phone: '+251 92 111 2233', email: 'yonas.m@gmail.com', pin: '748291' },
  },
  {
    id: 'ORD-9188',
    date: 'Mar 24, 14:52',
    category: 'FOOD',
    driver: {
      name: 'Henok Assefa',
      rating: '4.85',
      phone: '+251 91 444 3322',
      vehicle: 'Express Scooter (ET-2940)',
      avatarBg: 'bg-blue-100',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6e2X3H-LBCZr7eod1uLCWjUxgD4BPDD8KWKcYnqH2rTr6cZzlNFVhJZhCOvfBk2H8PJX5ycJNMRlaE2nHgJe7HN_MG45wd842dOTYCCxEfygddpi6e1_iCpBW55xs9DFMxf8gWwmZT0hPkWFQCX_7UceFcjIvWQoD6x5PXE-9dyoM6LmRFA9JHKLMBBrDUQim3C8Pw_2ftLrNhbK4Qj-CnWp70TIy2zHhdhM6FQD_B794NSToY1X4WGnO034nkOp5W7Wc3X4u70o',
    },
    brand: { letter: 'H', name: 'Habesha Delight', logoBg: 'bg-amber-700', branch: 'Old Airport' },
    destination: { line1: 'Embassy Row Residence', distance: '3.7 miles away', district: 'Old Airport' },
    eta: { type: 'time', text: '19 mins', color: 'text-indigo-600 dark:text-indigo-400' },
    speed: '39 km/h',
    status: { label: 'On the way', variant: 'blue' },
    customer: { name: 'Sara Daniel', phone: '+251 93 777 6655', email: 'sara.d@gmail.com', pin: '992014' },
  },
  {
    id: 'ORD-9215',
    date: 'Mar 24, 14:55',
    category: 'FLOWERS',
    driver: {
      name: 'Meron Kebede',
      rating: '4.92',
      phone: '+251 94 666 5544',
      vehicle: 'Electric Motorbike (AA-8210)',
      avatarBg: 'bg-rose-100',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLVT6LJ5SNoe5pqpOfeTC2TX5uOgS67eVnlHBmHq7xfSVfFHfCS7XFQACr7DzdcYfcFBzcLHHTp9HTry1ZMX5DDgkMa0R2rnD6Xh1viCXYtk6ZgvMISUB6ilmHAVYv5ws_mcNGh1ynO4umgY7J3y3KOqrE017wd1ubfPmPiCEMRGoII7JTgl4WvrbcCQ11diaMjiYtWB56HbAQnQY_TBNR8F_wajd8IAzkRUnTRUd47qpMpRfjEQRVaO-eLzEPdrtTNxYxiNCocpM',
    },
    brand: { letter: 'A', name: 'Artisan Pastry & Bakery', logoBg: 'bg-pink-600', branch: 'CMC Central' },
    destination: { line1: 'Golf Club Residence Villa 4', distance: '1.2 miles away', district: 'CMC' },
    eta: { type: 'time', text: '5 mins', color: 'text-emerald-600 dark:text-emerald-400' },
    speed: '31 km/h',
    status: { label: 'On the way', variant: 'blue' },
    customer: { name: 'Elias Tilahun', phone: '+251 91 888 7766', email: 'elias.t@gmail.com', pin: '281940' },
  },
  {
    id: 'ORD-9240',
    date: 'Mar 24, 14:58',
    category: 'FOOD',
    driver: {
      name: 'Yared Tadesse',
      rating: '4.78',
      phone: '+251 92 333 4455',
      vehicle: 'Fleet Motorcycle (ET-8801)',
      avatarBg: 'bg-amber-100',
      img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiwbJTH8PJz-0KfOrYaMXqs-vhXJog8J7LtWvfxEVEQBQ1uspvbxwSDetybesHliThOrsLYv0d1BZolvo72z6A9Zi-4CYtd2KBg69LKSTGI_Igvbm150beVX_ggWpRp8YzY1z3rgJJej0ZCZ5Qrmve2H5KqVmHsHyZkF-loBpZ3wqf3eTDWxf9TqX19hlJVPyhsdRtHNerSaW8PK3znv1_XAvjW0YI-BT_HTdG3K_u_bTO5bw4gppt3izOpCFQq-tZ7IP1LTnbRLo',
    },
    brand: { letter: 'D', name: 'Downtown Grill Club', logoBg: 'bg-red-800', branch: 'Stadium Area' },
    destination: { line1: 'Ras Abebe Aregay Ave #80', distance: '2.9 miles away', district: 'Stadium' },
    eta: { type: 'time', text: '22 mins', color: 'text-slate-400' },
    speed: '36 km/h',
    status: { label: 'Picked up', variant: 'muted' },
    customer: { name: 'Kalkidan Assefa', phone: '+251 91 666 7788', email: 'kalkidan.a@gmail.com', pin: '559281' },
  },
]

const statusPill = {
  blue: 'bg-indigo-50 text-indigo-950 ring-1 ring-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-900/40',
  green: 'bg-green-50 text-green-700 ring-1 ring-green-100 dark:bg-green-950/40 dark:text-green-300 dark:ring-green-900/40',
  muted: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700',
}

const DeliveryManagementPage = () => {
  // View Switcher Tab State: 'map' (Interactive Map Track) vs 'table' (Directory Table)
  const [viewTab, setViewTab] = useState('map') // 'map' | 'table'

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [branchFilter, setBranchFilter] = useState('All Central Branches')
  const [driverStatusFilter, setDriverStatusFilter] = useState('All Statuses')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [timeframeFilter, setTimeframeFilter] = useState('Live Rush')

  // Selected map order for real-time tracking
  const [selectedMapOrderId, setSelectedMapOrderId] = useState('ORD-9021')

  // Pagination state (DRY pagination using shared Pagination component)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Toast notifications
  const [toastMessage, setToastMessage] = useState(null)
  const mapSectionRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Synchronize stored orders with external changes
  const [storedOrders, setStoredOrders] = useState(() => loadStoredOrders())

  const syncStoredOrders = useCallback(() => {
    setStoredOrders(loadStoredOrders())
  }, [])

  useEffect(() => {
    window.addEventListener('orders-data-updated', syncStoredOrders)
    return () => window.removeEventListener('orders-data-updated', syncStoredOrders)
  }, [syncStoredOrders])

  // Merge fleet deliveries with stored orders to ensure complete DRY data
  const combinedDeliveries = useMemo(() => {
    const list = []

    storedOrders.forEach((so) => {
      const cleanNum = (so.order_number || so.id).replace('#', '')
      const initialFleet = INITIAL_FLEET_DELIVERIES.find((d) => d.id === cleanNum)

      list.push({
        id: cleanNum,
        date: so.order_status_tracking?.order_placed_at || initialFleet?.date || 'Today',
        category: so.order_type || initialFleet?.category || 'FOOD',
        driver: initialFleet?.driver || {
          name: so.rider?.name || 'Unassigned Courier',
          rating: String(so.rider?.rating || '4.9'),
          phone: so.rider?.phone || '+251 91 123 4567',
          vehicle: so.rider?.vehicle_type || so.rider?.vehicle || 'Electric Motorbike',
          avatarBg: 'bg-emerald-100',
          img: so.rider?.avatar || so.rider?.img || so.rider?.profile_picture || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHe2a24dFoMyuM8QLaEBRNmbXo9s1uYPvPJJU4fSDuJbvY5nFJrMjr5Py26pOR5RP80KAOMnC1qf-pQwO2Lz6Vl6HDIszJBLnrfglcHlUyiKBtE9--yT_uU65fIQ7fccrbLTLErP5feQcJyt8WuQbAO67X7FHkuH_Y7CEVmlWjWzUdRDv2FihKCi8383im7XxXJ0rjlLxxbKWxS8Yl526U-fAsOoAK0E0V1b-qbiAJx4ONL0wolt8kRJXFVbUNxo5fnMWJtvthnEk',
        },
        brand: initialFleet?.brand || {
          letter: (so.merchant?.name || 'M')[0],
          name: so.merchant?.name || 'Partner Merchant',
          branch: so.branch?.name || 'Main Branch',
          logoBg: 'bg-[#FF6B35]',
        },
        destination: initialFleet?.destination || {
          line1: so.delivery_address_line || 'Bole Sub-City, Addis Ababa',
          distance: '2.5 miles away',
          district: 'Bole',
        },
        eta: initialFleet?.eta || {
          type: so.status === 'DELIVERED' ? 'arrived' : 'time',
          text: so.status === 'DELIVERED' ? 'Arrived' : '15 mins',
          color: so.status === 'DELIVERED' ? 'text-green-600' : 'text-emerald-600 dark:text-emerald-400',
        },
        speed: initialFleet?.speed || (so.status === 'DELIVERED' ? '0 km/h' : '38 km/h'),
        status: {
          label: so.status === 'DELIVERED' ? 'Arrived' : so.status === 'OUT_FOR_DELIVERY' ? 'On the way' : so.status === 'PREPARING' ? 'Picked up' : 'Pending',
          variant: so.status === 'DELIVERED' ? 'green' : so.status === 'OUT_FOR_DELIVERY' ? 'blue' : 'muted',
        },
        customer: so.customer || initialFleet?.customer || { name: 'Customer Recipient', phone: '+251 91 123 4567', email: 'customer@gmail.com', pin: so.delivery_confirmation_code || '482910' },
        rawOrder: so,
      })
    })

    return list
  }, [storedOrders])

  // Filter deliveries
  const filteredDeliveries = useMemo(() => {
    return combinedDeliveries.filter((row) => {
      // Category filter
      if (categoryFilter !== 'ALL' && row.category !== categoryFilter) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchId = row.id.toLowerCase().includes(q)
        const matchDriver = row.driver.name.toLowerCase().includes(q)
        const matchBrand = row.brand.name.toLowerCase().includes(q)
        const matchDest = row.destination.line1.toLowerCase().includes(q)
        if (!matchId && !matchDriver && !matchBrand && !matchDest) return false
      }

      // Driver status filter
      if (driverStatusFilter !== 'All Statuses') {
        if (driverStatusFilter === 'In Transit' && row.status.label !== 'On the way') return false
        if (driverStatusFilter === 'Online' && row.status.label !== 'Arrived' && row.status.label !== 'Picked up' && row.status.label !== 'On the way') return false
        if (driverStatusFilter === 'Offline') return false
      }

      return true
    })
  }, [combinedDeliveries, searchQuery, driverStatusFilter, categoryFilter])

  // Active out-for-delivery orders (out from merchant to delivery)
  const activeOutForDeliveryList = useMemo(() => {
    return filteredDeliveries.filter(
      (d) => d.status.label === 'On the way' || d.status.label === 'Picked up' || d.status.label === 'Arrived'
    )
  }, [filteredDeliveries])

  // Find selected active delivery record
  const selectedDeliveryRecord = useMemo(() => {
    return combinedDeliveries.find((d) => d.id === selectedMapOrderId) || combinedDeliveries[0]
  }, [combinedDeliveries, selectedMapOrderId])

  // Pagination calculation
  const totalItems = filteredDeliveries.length
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredDeliveries.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredDeliveries, currentPage, rowsPerPage])

  const handleQuickAdvanceDelivery = (row) => {
    let nextStatus = 'OUT_FOR_DELIVERY'
    if (row.status.label === 'Picked up') nextStatus = 'OUT_FOR_DELIVERY'
    else if (row.status.label === 'On the way') nextStatus = 'DELIVERED'

    updateOrderStatus(row.id, nextStatus)
    syncStoredOrders()
    showToast(`Order #${row.id} marked as ${nextStatus === 'DELIVERED' ? 'Arrived / Delivered' : 'Out for Delivery'}!`, 'success')
  }

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Category', 'Date', 'Driver', 'Rating', 'Merchant', 'Destination', 'Status', 'ETA']
    const rows = filteredDeliveries.map((r) => [
      `"${r.id}"`,
      `"${r.category || 'FOOD'}"`,
      `"${r.date}"`,
      `"${r.driver.name}"`,
      `"${r.driver.rating}"`,
      `"${r.brand.name}"`,
      `"${r.destination.line1}"`,
      `"${r.status.label}"`,
      `"${r.eta.text}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Shima_Active_Deliveries_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Exported ${filteredDeliveries.length} active delivery records to CSV.`, 'success')
  }

  return (
    <MainLayout
      activeMenuKey="deliveryManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Delivery Live"
    >
      <div className="space-y-6 pb-12">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs font-bold text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
              toastMessage.type === 'error' ? 'bg-rose-600' : 'bg-slate-900 dark:bg-emerald-600'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toastMessage.type === 'error' ? 'cancel' : 'check_circle'}
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
            <div className="flex items-center gap-2.5">
              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                Delivery Live
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800 shadow-2xs dark:bg-emerald-950/70 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Fleet Tracking
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
              Real-time oversight of all active deliveries out from merchants to customer destinations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Log</span>
            </button>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Category Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Orders In Transit
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {activeOutForDeliveryList.length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Active on road
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Avg. Delivery Time
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">schedule</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                18m
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                -3m faster
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Couriers Online
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">two_wheeler</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                86
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                100% GPS tracked
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Deliveries
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:bg-amber-950/40 dark:ring-amber-800/40">
                <span className="material-symbols-outlined text-lg">receipt_long</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {combinedDeliveries.length}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Live Console
              </span>
            </div>
          </div>
        </section>

        {/* View Switcher Tabs Bar: Map View vs Table View (User can toggle with click tab) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          {/* Left: View Tabs Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-zinc-800">
            <button
              type="button"
              onClick={() => setViewTab('map')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'map'
                  ? 'bg-white text-[#FF6B35] shadow-xs dark:bg-zinc-900 dark:text-orange-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">map</span>
              <span>Map View (Live Track)</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeOutForDeliveryList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewTab('table')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                viewTab === 'table'
                  ? 'bg-white text-[#FF6B35] shadow-xs dark:bg-zinc-900 dark:text-orange-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <span className="material-symbols-outlined text-base">table_rows</span>
              <span>Table View (Directory)</span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-zinc-700 dark:text-zinc-300">
                {filteredDeliveries.length}
              </span>
            </button>
          </div>

          {/* Right: Quick Instructions / Focus Hint */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
            <span className="material-symbols-outlined text-base text-[#FF6B35]">touch_app</span>
            <span>
              {viewTab === 'map'
                ? 'Click any courier or vehicle on map to inspect order card'
                : 'Click any row or "Slide Menu" to view complete details'}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
              <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
            </div>
            <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

            {/* Search Engine */}
            <div className="relative h-11 min-w-[260px] flex-1">
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
                placeholder="Search order ID, driver name, merchant, or destination..."
                className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setCurrentPage(1)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex min-w-[140px] flex-col gap-1">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
              >
                <option value="ALL">All Categories</option>
                {ORDER_TYPES.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div className="flex min-w-[150px] flex-col gap-1">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Branch</label>
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
              >
                <option>All Central Branches</option>
                <option>Downtown Kitchen</option>
                <option>Westside Bistro</option>
                <option>Uptown Express</option>
              </select>
            </div>

            {/* Driver Status Filter */}
            <div className="flex min-w-[130px] flex-col gap-1">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</label>
              <select
                value={driverStatusFilter}
                onChange={(e) => {
                  setDriverStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
              >
                <option>All Statuses</option>
                <option>In Transit</option>
                <option>Online</option>
                <option>Offline</option>
              </select>
            </div>

            {/* Timeframe Filter */}
            <div className="flex min-w-[120px] flex-col gap-1">
              <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timeframe</label>
              <select
                value={timeframeFilter}
                onChange={(e) => {
                  setTimeframeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
              >
                <option>Live Rush</option>
                <option>Past 24 Hours</option>
                <option>Past 7 Days</option>
              </select>
            </div>

            {/* Clear All Filters */}
            {(searchQuery || categoryFilter !== 'ALL' || branchFilter !== 'All Central Branches' || driverStatusFilter !== 'All Statuses' || timeframeFilter !== 'Live Rush') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCategoryFilter('ALL')
                  setBranchFilter('All Central Branches')
                  setDriverStatusFilter('All Statuses')
                  setTimeframeFilter('Live Rush')
                  setCurrentPage(1)
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400 cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: MAP VIEW (HERO REALTIME MAP + SELECTED ORDER CARD)       */}
        {/* ============================================================== */}
        {viewTab === 'map' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 8 Cols: Full RealTimeLogisticsMap Component */}
            <div ref={mapSectionRef} className="lg:col-span-8 flex flex-col">
              <RealTimeLogisticsMap
                selectedOrderId={selectedMapOrderId}
                onSelectOrder={(id) => {
                  setSelectedMapOrderId(id)
                }}
                className="h-[620px] w-full"
              />
            </div>

            {/* Right 4 Cols: Selected Order Detail Card & Active Queue */}
            <div className="lg:col-span-4 flex flex-col space-y-4">
              
              {/* PRIMARY SELECTED ORDER DETAIL CARD */}
              {selectedDeliveryRecord ? (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-all">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] font-black text-xs dark:bg-orange-950/40">
                        #
                      </span>
                      <div>
                        <h4 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                          #{selectedDeliveryRecord.id}
                        </h4>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                        statusPill[selectedDeliveryRecord.status.variant] || statusPill.blue
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          selectedDeliveryRecord.status.variant === 'blue'
                            ? 'animate-pulse bg-indigo-600'
                            : selectedDeliveryRecord.status.variant === 'green'
                            ? 'bg-green-600'
                            : 'bg-slate-400'
                        }`}
                      />
                      {selectedDeliveryRecord.status.label}
                    </span>
                  </div>

                  {/* Courier Profile & Live Telemetry */}
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={selectedDeliveryRecord.driver.img}
                          alt={selectedDeliveryRecord.driver.name}
                          className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                        />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                          {selectedDeliveryRecord.driver.name}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="text-amber-500 font-bold">★ {selectedDeliveryRecord.driver.rating}</span>
                          <span>·</span>
                          <span className="truncate max-w-[120px]">{selectedDeliveryRecord.driver.vehicle || 'Motorcycle'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {selectedDeliveryRecord.eta.text}
                      </div>
                      <div className="text-[10px] text-slate-400">{selectedDeliveryRecord.speed || '38 km/h'}</div>
                    </div>
                  </div>

                  {/* Route Info: Merchant Pickup -> Customer Dropoff */}
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-850 space-y-2.5 text-xs">
                    {/* Merchant */}
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-base text-emerald-600 mt-0.5">storefront</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {selectedDeliveryRecord.brand.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{selectedDeliveryRecord.brand.branch || 'Bole Central'}</p>
                      </div>
                    </div>

                    {/* Divider line */}
                    <div className="ml-2 pl-3 border-l border-dashed border-slate-300 dark:border-zinc-700 py-0.5 text-[10px] text-slate-400 font-mono">
                      Route in transit · {selectedDeliveryRecord.destination.distance}
                    </div>

                    {/* Customer Destination */}
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-base text-[#FF6B35] mt-0.5">location_on</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 dark:text-zinc-200">
                          {selectedDeliveryRecord.customer?.name || 'Customer Recipient'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{selectedDeliveryRecord.destination.line1}</p>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Code & Recipient Contact */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-zinc-800/60 font-mono">
                    <span className="text-[11px] text-slate-400 font-sans">Confirmation PIN:</span>
                    <strong className="text-slate-800 dark:text-zinc-200 font-bold">
                      {selectedDeliveryRecord.customer?.pin || '482910'}
                    </strong>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
                    <Link
                      to={`/order/${selectedDeliveryRecord.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FF6B35] px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>See Full Detail</span>
                    </Link>

                    <Link
                      to={`/orders/${selectedDeliveryRecord.id}/reassign-rider`}
                      className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-[#FF6B35] hover:bg-orange-100 transition cursor-pointer"
                      title="Reassign rider to another fleet courier"
                    >
                      <span className="material-symbols-outlined text-sm">swap_horiz</span>
                      <span>Reassign</span>
                    </Link>

                    {selectedDeliveryRecord.status.label !== 'Arrived' && (
                      <button
                        type="button"
                        onClick={() => handleQuickAdvanceDelivery(selectedDeliveryRecord)}
                        className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                        title="Mark Delivered / Complete"
                      >
                        <span className="material-symbols-outlined text-base">check</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* LIST OF ACTIVE DELIVERIES CURRENTLY OUT FOR DELIVERY */}
              <div className="flex-1 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-emerald-500">local_shipping</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                      Orders Out to Delivery ({activeOutForDeliveryList.length})
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Click to focus map</span>
                </div>

                <div className="mt-3 flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1">
                  {activeOutForDeliveryList.map((del) => {
                    const isSelected = del.id === selectedMapOrderId
                    return (
                      <div
                        key={del.id}
                        onClick={() => setSelectedMapOrderId(del.id)}
                        className={`group flex items-center justify-between gap-3 rounded-xl border p-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'border-[#FF6B35] bg-orange-50/70 ring-1 ring-[#FF6B35]/30 dark:bg-orange-950/30'
                            : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={del.driver.img}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                              #{del.id} · {del.driver.name.split(' ')[0]}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {del.brand.name} → {del.destination.line1}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-emerald-600 block">{del.eta.text}</span>
                          <span className="text-[10px] text-slate-400">{del.destination.distance}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: TABLE VIEW (EXISTING COMPREHENSIVE DIRECTORY)          */}
        {/* ============================================================== */}
        {viewTab === 'table' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-xl text-[#FF6B35]">two_wheeler</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                  Deliveries Directory Table
                </h3>
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-[#FF6B35] dark:bg-orange-950/40">
                  {filteredDeliveries.length} Records
                </span>
              </div>
            </div>

            {filteredDeliveries.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-zinc-800/50">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-8">
                          Order ID
                        </th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">Driver</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">
                          Merchant
                        </th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">
                          Destination
                        </th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">ETA</th>
                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-6">Status</th>
                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:px-8">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {paginatedDeliveries.map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedMapOrderId(row.id)}
                          className="transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/50"
                        >
                          <td className="px-6 py-5 sm:px-8">
                            <div className="flex flex-col">
                              <Link
                                to={`/orders/${row.id}`}
                                className="text-sm font-bold text-slate-900 transition-colors hover:text-[#FF6B35] dark:text-zinc-100"
                                title={`Open Order #${row.id} details page`}
                              >
                                #{row.id}
                              </Link>
                              <span className="text-[11px] text-slate-400">{row.date}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${row.driver.avatarBg}`}
                              >
                                <img alt="" className="h-full w-full object-cover" src={row.driver.img} />
                              </div>
                              <div className="flex min-w-0 flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{row.driver.name}</span>
                                <div className="flex items-center gap-1">
                                  <span
                                    className="material-symbols-outlined text-[10px] text-orange-400"
                                    style={{ fontVariationSettings: "'FILL' 1" }}
                                  >
                                    star
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-500">{row.driver.rating}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 sm:px-6">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white ${row.brand.logoBg}`}
                              >
                                {row.brand.letter}
                              </div>
                              <span className="text-sm font-medium text-slate-900 dark:text-zinc-100">{row.brand.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5 sm:px-6">
                            <div className="flex flex-col">
                              <span className="max-w-[160px] truncate text-sm text-slate-900 dark:text-zinc-100">
                                {row.destination.line1}
                              </span>
                              <span className="text-[11px] text-slate-400">{row.destination.distance}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5 sm:px-6">
                            {row.eta.type === 'time' && (
                              <div className={`flex items-center gap-1 font-bold ${row.eta.color}`}>
                                <span className="material-symbols-outlined text-sm">schedule</span>
                                <span className="text-sm">{row.eta.text}</span>
                              </div>
                            )}
                            {row.eta.type === 'arrived' && (
                              <div className={`flex items-center gap-1 font-bold ${row.eta.color}`}>
                                <span className="material-symbols-outlined text-sm">done_all</span>
                                <span className="text-sm">{row.eta.text}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-5 sm:px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusPill[row.status.variant] || statusPill.blue}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                  row.status.variant === 'blue'
                                    ? 'animate-pulse bg-indigo-600'
                                    : row.status.variant === 'green'
                                    ? 'bg-green-600'
                                    : 'bg-slate-400'
                                }`}
                              />
                              {row.status.label}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right sm:px-8">
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMapOrderId(row.id)
                                  setViewTab('map')
                                  window.scrollTo({ top: 380, behavior: 'smooth' })
                                }}
                                className="group inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 shadow-2xs transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 cursor-pointer"
                                aria-label="View on map"
                                title="Switch to map view and track route"
                              >
                                <span className="material-symbols-outlined text-sm text-emerald-500 group-hover:scale-110 transition-transform">
                                  navigation
                                </span>
                                <span className="text-[11px]">Track on Map</span>
                              </button>

                              <Link
                                to={`/orders/${row.id}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-[#FF6B35] shadow-2xs transition hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 cursor-pointer"
                                title="Open dedicated order details page"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                                <span className="text-[11px]">View Order</span>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* DRY Pagination Component */}
                <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={(size) => {
                      setRowsPerPage(size)
                      setCurrentPage(1)
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h3 className="mt-4 font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                  No deliveries found matching criteria
                </h3>
                <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                  No active deliveries match your current search terms or selected filters.
                </p>
                {(searchQuery || categoryFilter !== 'ALL' || branchFilter !== 'All Central Branches' || driverStatusFilter !== 'All Statuses') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setCategoryFilter('ALL')
                      setBranchFilter('All Central Branches')
                      setDriverStatusFilter('All Statuses')
                      setCurrentPage(1)
                    }}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default DeliveryManagementPage
