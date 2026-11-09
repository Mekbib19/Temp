import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { getRiderById, updateRider, blockRider, unblockRider } from '../data/demoRiders'
import { getVerificationBadge, getVehicleIcon } from '../utils/riderBadges'
import { getTransactionsByRiderId, isCreditTransaction } from '../data/demoRiderTransactions'
import { ComplianceDocumentVisual } from '../components/ComplianceDocumentVisual'
import { DocumentViewerModal } from '../components/DocumentViewerModal'
import { TransactionDetailModal } from '../components/TransactionDetailModal'
import CustomerRatingReviews from '../components/CustomerRatingReviews'
import { getRiderReviews, saveRiderReviews } from '../data/demoRatingsReviews'

const FALLBACK_AVATAR =
  'https://ui-avatars.com/api/?background=FF6B35&color=fff&bold=true&size=128&name='

// Demo Delivery Records aligned with Customer Profile Order schema
const demoDeliveries = [
  {
    id: '#DEL-9982',
    orderId: '#ORD-9982',
    date: 'May 24, 2024, 02:45 PM',
    restaurant: 'The Burger Joint',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    customer: 'Alex Curator',
    dropoff: 'Bole Sub-City, House #412',
    distance: '3.2 km (18 min)',
    items: '2x Double Whopper, 1x Fries, 1x Coke',
    deliveryFee: '185.00',
    tip: '35.00',
    status: 'Delivered',
  },
  {
    id: '#DEL-9975',
    orderId: '#ORD-9975',
    date: 'May 23, 2024, 07:15 PM',
    restaurant: 'Mamma Mia Pizza',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB28TV_EKNpHdSnlFYChRYhP9X8ejNBiyWPlmNg_Fpcqo_CXXvdctfHobu3FNughGJ4iipzV-7Qb0-KY-2NQ_4x6zMOZ2cMCvAkMeFM8si4tHWwRRA48dqPRwAyzaT6Bgd224BGY5otIsXdTdOCpJWZlWM4a9Gky9zJQMc0dY5yiQoZgs7HNlru_6qinDLCuGBYy3BBz5xRPvmal_SpOggzAUHZYdj6Au4MahC0VUvkyYOWyUBNOuHaZXuZ5QbQ-xg7XhEV_4a45H0',
    customer: 'Sara Alemayehu',
    dropoff: 'Kazanchis, Guinea Conakry St',
    distance: '4.8 km (24 min)',
    items: '1x Large Margherita, 2x Cola, 1x Garlic Bread',
    deliveryFee: '210.00',
    tip: '40.00',
    status: 'Delivered',
  },
  {
    id: '#DEL-9912',
    orderId: '#ORD-9912',
    date: 'May 19, 2024, 01:20 PM',
    restaurant: 'Sakura Sushi',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiwbJTH8PJz-0KfOrYaMXqs-vhXJog8J7LtWvfxEVEQBQ1uspvbxwSDetybesHliThOrsLYv0d1BZolvo72z6A9Zi-4CYtd2KBg69LKSTGI_Igvbm150beVX_ggWpRp8YzY1z3rgJJej0ZCZ5Qrmve2H5KqVmHsHyZkF-loBpZ3wqf3eTDWxf9TqX19hlJVPyhsdRtHNerSaW8PK3znv1_XAvjW0YI-BT_HTdG3K_u_bTO5bw4gppt3izOpCFQq-tZ7IP1LTnbRLo',
    customer: 'Michael Bekele',
    dropoff: 'Old Airport Area, Villa #14',
    distance: '5.5 km (28 min)',
    items: '1x Omakase Set (12pcs), 1x Miso Soup',
    deliveryFee: '240.00',
    tip: '50.00',
    status: 'Delivered',
  },
  {
    id: '#DEL-9884',
    orderId: '#ORD-9884',
    date: 'May 15, 2024, 12:30 PM',
    restaurant: 'Taco Haven',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB28TV_EKNpHdSnlFYChRYhP9X8ejNBiyWPlmNg_Fpcqo_CXXvdctfHobu3FNughGJ4iipzV-7Qb0-KY-2NQ_4x6zMOZ2cMCvAkMeFM8si4tHWwRRA48dqPRwAyzaT6Bgd224BGY5otIsXdTdOCpJWZlWM4a9Gky9zJQMc0dY5yiQoZgs7HNlru_6qinDLCuGBYy3BBz5xRPvmal_SpOggzAUHZYdj6Au4MahC0VUvkyYOWyUBNOuHaZXuZ5QbQ-xg7XhEV_4a45H0',
    customer: 'Hanna Tadesse',
    dropoff: 'Gerji Imperial, Woreda 07',
    distance: '2.1 km (12 min)',
    items: '3x Carne Asada Tacos, 1x Horchata',
    deliveryFee: '160.00',
    tip: '25.00',
    status: 'Delivered',
  },
  {
    id: '#DEL-9820',
    orderId: '#ORD-9820',
    date: 'May 10, 2024, 08:05 PM',
    restaurant: 'Pasta Prime',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    customer: 'Kidus Yohannes',
    dropoff: 'CMC Tsehay Real Estate Block 8',
    distance: '6.4 km (32 min)',
    items: '1x Truffle Tagliatelle, 1x Tiramisu',
    deliveryFee: '280.00',
    tip: '60.00',
    status: 'Delivered',
  },
  {
    id: '#DEL-9762',
    orderId: '#ORD-9762',
    date: 'May 04, 2024, 11:45 AM',
    restaurant: 'Greens & Grains',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiwbJTH8PJz-0KfOrYaMXqs-vhXJog8J7LtWvfxEVEQBQ1uspvbxwSDetybesHliThOrsLYv0d1BZolvo72z6A9Zi-4CYtd2KBg69LKSTGI_Igvbm150beVX_ggWpRp8YzY1z3rgJJej0ZCZ5Qrmve2H5KqVmHsHyZkF-loBpZ3wqf3eTDWxf9TqX19hlJVPyhsdRtHNerSaW8PK3znv1_XAvjW0YI-BT_HTdG3K_u_bTO5bw4gppt3izOpCFQq-tZ7IP1LTnbRLo',
    customer: 'Bethlehem Haile',
    dropoff: 'Sarbet, Near Canadian Embassy',
    distance: '3.9 km (20 min)',
    items: '2x Quinoa Harvest Bowl, 1x Green Smoothie',
    deliveryFee: '190.00',
    tip: '30.00',
    status: 'Delivered',
  },
  {
    id: '#DEL-9710',
    orderId: '#ORD-9710',
    date: 'Apr 28, 2024, 06:50 PM',
    restaurant: 'The Burger Joint',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    customer: 'Yared Gebre',
    dropoff: 'Bole Medhanialem, Aster Plaza',
    distance: '1.8 km (10 min)',
    items: '1x Bacon Cheeseburger, 1x Onion Rings',
    deliveryFee: '150.00',
    tip: '0.00',
    status: 'Cancelled',
  },
]

const getDeliveryStatusBadgeClass = (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30'
    case 'In Transit':
    case 'Out for Delivery':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/30'
    case 'Assigned':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30'
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30'
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'
  }
}

const getWalletTypeBadge = (type) => {
  switch (type) {
    case 'EARNING':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30'
    case 'BONUS':
      return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-400 dark:ring-purple-500/30'
    case 'WITHDRAW':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30'
    case 'DEPOSIT':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/30'
    case 'REFUND':
      return 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20 dark:bg-teal-950/40 dark:text-teal-400 dark:ring-teal-500/30'
    case 'CHARGE':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30'
    case 'ADJUSTMENT':
      return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-500/30'
    case 'OTHER':
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'
  }
}

const RiderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rider, setRider] = useState(() => getRiderById(id) || null)
  const [riderReviews, setRiderReviews] = useState(() => getRiderReviews(id))

  const [activeTab, setActiveTab] = useState('deliveries')

  // Pagination for Deliveries
  const [deliveriesPage, setDeliveriesPage] = useState(1)
  const [deliveriesRowsPerPage, setDeliveriesRowsPerPage] = useState(10)

  // Filters and Pagination for Wallet Ledger
  const [paymentsPage, setPaymentsPage] = useState(1)
  const [paymentsRowsPerPage, setPaymentsRowsPerPage] = useState(10)
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('')
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL')
  const [paymentFlowFilter, setPaymentFlowFilter] = useState('ALL')
  const [paymentSortBy, setPaymentSortBy] = useState('NEWEST')

  // Modals state matching CustomerProfilePage
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [banDurationOption, setBanDurationOption] = useState('7d')
  const [customDays, setCustomDays] = useState(14)
  const [customDate, setCustomDate] = useState('')
  const [banReason, setBanReason] = useState('')
  const [banError, setBanError] = useState('')
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false)

  // Document and Transaction inspection modals
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState(null)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)

  // Trigger for re-reading transactions when storage updates
  const [txSyncTrigger, setTxSyncTrigger] = useState(0)

  useEffect(() => {
    const handleTxUpdate = () => setTxSyncTrigger((v) => v + 1)
    window.addEventListener('rider-transactions-updated', handleTxUpdate)
    return () => window.removeEventListener('rider-transactions-updated', handleTxUpdate)
  }, [])

  // Dynamic rider transactions loaded by rider.id
  const allTransactions = useMemo(() => {
    if (!rider || txSyncTrigger < 0) return []
    return getTransactionsByRiderId(rider.id)
  }, [rider, txSyncTrigger])

  // Three-dot dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const sync = () => setRider(getRiderById(id) || null)
    sync()
    window.addEventListener('riders-data-updated', sync)
    return () => window.removeEventListener('riders-data-updated', sync)
  }, [id])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleToggleDispatch = useCallback(() => {
    if (!rider) return
    const updated = updateRider(rider.id, { can_accept_orders: !rider.can_accept_orders })
    if (updated) setRider(updated)
  }, [rider])

  const handleConfirmBan = (e) => {
    e.preventDefault()
    if (!banReason.trim()) {
      setBanError('Please provide a reason or description for blocking this rider.')
      return
    }

    const now = new Date()
    let dueString = ''
    let label = ''

    if (banDurationOption === '24h') {
      const due = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      dueString = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      label = '24 Hours'
    } else if (banDurationOption === '7d') {
      const due = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      dueString = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      label = '7 Days'
    } else if (banDurationOption === '30d') {
      const due = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      dueString = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      label = '30 Days'
    } else if (banDurationOption === 'permanent') {
      dueString = 'Indefinite'
      label = 'Permanent'
    } else if (banDurationOption === 'custom') {
      if (customDate) {
        const d = new Date(customDate)
        dueString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        label = `Custom (${dueString})`
      } else {
        const due = new Date(now.getTime() + Number(customDays || 1) * 24 * 60 * 60 * 1000)
        dueString = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        label = `${customDays} Days`
      }
    }

    const updated = blockRider(rider.id, banReason.trim(), {
      durationLabel: label,
      dueString,
    })
    if (updated) setRider(updated)
    setIsBanModalOpen(false)
    setBanReason('')
    setBanError('')
  }

  const handleConfirmUnblock = () => {
    const updated = unblockRider(rider.id)
    if (updated) setRider(updated)
    setIsUnblockModalOpen(false)
  }

  // Filtered wallet transactions
  const filteredTransactions = useMemo(() => {
    let list = [...allTransactions]

    if (paymentSearchQuery.trim()) {
      const q = paymentSearchQuery.toLowerCase().trim()
      list = list.filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          (tx.description && tx.description.toLowerCase().includes(q)) ||
          (tx.reason && tx.reason.toLowerCase().includes(q)) ||
          (tx.order_id && tx.order_id.toLowerCase().includes(q)) ||
          tx.type.toLowerCase().includes(q) ||
          String(tx.amount).includes(q) ||
          String(tx.balance_after).toLowerCase().includes(q)
      )
    }

    if (paymentTypeFilter !== 'ALL') {
      list = list.filter((tx) => tx.type === paymentTypeFilter)
    }

    if (paymentFlowFilter === 'CREDIT') {
      list = list.filter((tx) => isCreditTransaction(tx.type))
    } else if (paymentFlowFilter === 'DEBIT') {
      list = list.filter((tx) => !isCreditTransaction(tx.type))
    }

    if (paymentSortBy === 'OLDEST') {
      list = [...list].reverse()
    } else if (paymentSortBy === 'AMOUNT_DESC') {
      list = [...list].sort((a, b) => Number(b.amount) - Number(a.amount))
    } else if (paymentSortBy === 'AMOUNT_ASC') {
      list = [...list].sort((a, b) => Number(a.amount) - Number(b.amount))
    }

    return list
  }, [allTransactions, paymentSearchQuery, paymentTypeFilter, paymentFlowFilter, paymentSortBy])

  const deliveriesTotal = demoDeliveries.length
  const deliveriesTotalPages = Math.max(1, Math.ceil(deliveriesTotal / deliveriesRowsPerPage))
  const deliveriesStart = deliveriesTotal === 0 ? 0 : (deliveriesPage - 1) * deliveriesRowsPerPage + 1
  const deliveriesEnd = Math.min(deliveriesPage * deliveriesRowsPerPage, deliveriesTotal)
  const paginatedDeliveries = demoDeliveries.slice(
    (deliveriesPage - 1) * deliveriesRowsPerPage,
    deliveriesPage * deliveriesRowsPerPage
  )

  const paymentsTotal = filteredTransactions.length
  const paymentsTotalPages = Math.max(1, Math.ceil(paymentsTotal / paymentsRowsPerPage))
  const paymentsStart = paymentsTotal === 0 ? 0 : (paymentsPage - 1) * paymentsRowsPerPage + 1
  const paymentsEnd = Math.min(paymentsPage * paymentsRowsPerPage, paymentsTotal)
  const paginatedTransactions = filteredTransactions.slice(
    (paymentsPage - 1) * paymentsRowsPerPage,
    paymentsPage * paymentsRowsPerPage
  )

  if (!rider) {
    return (
      <MainLayout activeMenuKey="riderManagement" breadcrumbParent="Riders" breadcrumbCurrent="Not Found">
        <div className="p-12 text-center text-slate-500 dark:text-zinc-400">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-zinc-600">search_off</span>
          <p className="mt-2 font-semibold">Rider not found</p>
          <button
            onClick={() => navigate('/riders')}
            className="mt-4 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white hover:bg-[#e0531f] focus-visible:ring-2 focus-visible:ring-[#FF6B35]/40 focus-visible:outline-none"
          >
            Back to Riders
          </button>
        </div>
      </MainLayout>
    )
  }

  const isBanned = rider.status === 'BLOCKED'
  const documentsCount = rider.documents?.length || 0

  const tabs = [
    { id: 'deliveries', label: 'Delivery History', icon: 'local_shipping', count: deliveriesTotal },
    { id: 'wallet', label: 'Wallet & Payouts', icon: 'payments', count: allTransactions.length },
    { id: 'vehicle', label: 'Vehicle Details', icon: 'two_wheeler' },
    { id: 'documents', label: 'Compliance Documents', icon: 'verified_user', count: documentsCount },
    { id: 'ratings', label: 'Ratings & Reviews', icon: 'hotel_class', count: riderReviews.length },
    { id: 'profile', label: 'Profile ', icon: 'badge' },
  ]

  return (
    <MainLayout
      activeMenuKey="riderManagement"
      breadcrumbParent="Riders"
      breadcrumbCurrent={rider.full_name}
    >
      <div className="space-y-6 pb-12">
        {/* Header Action Bar with Back Arrow (Matching CustomerProfilePage) */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/riders')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Back to Riders list"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                  Rider Information
                </h1>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Courier Profile & Delivery Operations Console
              </p>
            </div>
          </div>
          {rider.verification_status !== 'APPROVED' && (
            <button
              type="button"
              onClick={() => navigate(`/riders/verification?tab=${rider.verification_status === 'REJECTED' ? 'REJECTED' : 'PENDING'}`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 shadow-2xs transition hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300"
            >
              <span className="material-symbols-outlined text-base text-amber-600">fact_check</span>
              <span>Review in Verification Queue ({rider.verification_status})</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          )}
        </section>

        {/* Profile Card Header (Matching CustomerProfilePage Clean Modern Admin Dashboard User Profile Card) */}
        <section className="relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
    {/* Square profile picture with rounded corners */}
    <div className="relative shrink-0">
      <img
        alt={rider.full_name}
        className="h-24 w-24 rounded-2xl border border-slate-200/90 object-cover shadow-md dark:border-zinc-700 sm:h-28 sm:w-28"
        src={rider.profile_picture}
        onError={(e) => {
          e.currentTarget.src = `${FALLBACK_AVATAR}${encodeURIComponent(rider.full_name)}`
        }}
      />
    </div>

    {/* To the right */}
    <div className="min-w-0 flex-1">
      {/* Top row: Name + status badge on left, three-dot menu icon on the top right */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-2xl">
            {rider.full_name}
          </h1>
          {isBanned ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              Blocked
            </span>
          ) : rider.status === 'ACTIVE' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Pending Review
            </span>
          )}

          {rider.is_online && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online Now
            </span>
          )}

          {getVerificationBadge(rider.verification_status)}
        </div>

        {/* Three-dot menu icon on the top right */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label="Rider profile options"
            aria-expanded={isMenuOpen}
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  if (isBanned) {
                    setIsUnblockModalOpen(true)
                  } else {
                    setIsBanModalOpen(true)
                  }
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50/70 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <span className="material-symbols-outlined text-[17px] text-rose-600 dark:text-rose-400">
                  {isBanned ? 'lock_open' : 'block'}
                </span>
                <span>{isBanned ? 'Unblock Rider' : 'Block Rider Account'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  handleToggleDispatch()
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-700/60"
              >
                <span className="material-symbols-outlined text-[17px] text-slate-500 dark:text-zinc-400">
                  {rider.can_accept_orders ? 'pause_circle' : 'play_circle'}
                </span>
                <span>{rider.can_accept_orders ? 'Pause Order Dispatch' : 'Enable Order Dispatch'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Below the name, contact details arranged horizontally */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-zinc-400">
        <div className="flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-400">mail</span>
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{rider.email}</span>
        </div>
        <span className="hidden text-base text-slate-300 sm:inline dark:text-zinc-700" aria-hidden="true">•</span>
        <div className="flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-400">call</span>
          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">{rider.phone_number}</span>
        </div>
        <span className="hidden text-base text-slate-300 sm:inline dark:text-zinc-700" aria-hidden="true">•</span>
        <div className="flex items-center gap-2 font-medium">
          <span className="material-symbols-outlined text-[18px] text-slate-400 dark:text-zinc-400">badge</span>
          <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">{rider.id}</span>
        </div>
      </div>

      {/* Suspended alert banner if rider is blocked */}
      {isBanned && (
        <div className="mt-3 rounded-xl border border-rose-200/90 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-100">
            <span className="material-symbols-outlined text-base text-rose-600 dark:text-rose-400">error</span>
            <span>Courier Account Suspended / Blocked</span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
            <strong className="font-semibold">Reason:</strong>{' '}
            {rider.ban_reason || 'This courier is suspended from order dispatch and app access.'}
          </p>
        </div>
      )}
    </div>
  </div>

  {/* Full-size metric cards restored with proper large icons and spacing */}
  <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
    {/* Balance Card (Orange) */}
    <div className="flex items-center gap-3.5 rounded-2xl border border-orange-100/90 bg-orange-50/70 p-3.5 transition dark:border-orange-950/40 dark:bg-orange-950/20">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-900/40 dark:text-orange-400">
        <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Wallet</p>
        <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-zinc-100 truncate">
          {(rider.wallet_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
        </p>
      </div>
    </div>

    {/* Completed Deliveries (Emerald) */}
    <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-100/90 bg-emerald-50/70 p-3.5 transition dark:border-emerald-950/40 dark:bg-emerald-950/20">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
        <span className="material-symbols-outlined text-xl">moped</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Completed</p>
        <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-zinc-100">
          {rider.completed_orders ?? 0}
        </p>
      </div>
    </div>

    {/* Rating & Tier (Sky) */}
    <div
      onClick={() => setActiveTab('ratings')}
      className="cursor-pointer transition hover:border-sky-400 hover:shadow-xs flex items-center gap-3.5 rounded-2xl border border-sky-100/90 bg-sky-50/70 p-3.5 dark:border-sky-950/40 dark:bg-sky-950/20"
      title="Click to view all Play Store style customer reviews and ratings"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
        <span className="material-symbols-outlined text-xl">star</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Rating</p>
        <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center gap-1">
          <span>{Number(rider.rating ?? 5).toFixed(1)}</span>
          <span className="text-xs font-bold text-slate-400 dark:text-zinc-500">
            ({rider.level || 'VIP'})
          </span>
        </p>
      </div>
    </div>

    {/* Vehicle (Purple) */}
    <div className="flex items-center gap-3.5 rounded-2xl border border-purple-100/90 bg-purple-50/70 p-3.5 transition dark:border-purple-950/40 dark:bg-purple-950/20">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
        <span className="material-symbols-outlined text-xl">{getVehicleIcon(rider.vehicle?.vehicle_type)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Vehicle</p>
        <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-zinc-100 truncate">
          {rider.vehicle?.plate_number || 'two_wheeler'}
        </p>
      </div>
    </div>
  </div>
</section>

        {/* Tabs + Content Section (Matching CustomerProfilePage) */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-zinc-800">
            <div className="flex w-full flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1.5 dark:border-zinc-800 dark:bg-zinc-800/60 sm:w-fit">
              {tabs.map((tab) => {
                const labelWithCount = tab.count !== undefined ? `${tab.label} (${tab.count})` : tab.label

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-[#FF6B35] shadow-sm dark:bg-zinc-900 dark:text-[#FF6B35]'
                        : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{tab.icon}</span>
                    <span>{labelWithCount}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* TAB 1: Delivery History (Matching Order History table in CustomerProfilePage) */}
          {activeTab === 'deliveries' && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                      <th className="px-5 py-3.5">Delivery ID</th>
                      <th className="px-5 py-3.5">Date &amp; Time</th>
                      <th className="px-5 py-3.5">Pickup Restaurant</th>
                      <th className="px-5 py-3.5">Drop-off / Customer</th>
                      <th className="px-5 py-3.5 text-right">Courier Fee</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {paginatedDeliveries.map((row) => (
                      <tr
                        key={row.id}
                        className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                          <div>{row.id}</div>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                            {row.orderId}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-500 dark:text-zinc-400">
                          {row.date}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/70 dark:bg-zinc-800 dark:ring-zinc-700">
                              <img alt="" className="h-full w-full object-cover" src={row.thumb} />
                            </div>
                            <div>
                              <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 transition-colors group-hover:text-[#FF6B35] dark:text-zinc-100">
                                {row.restaurant}
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                                {row.items}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-zinc-400">
                          <p className="font-bold text-slate-800 dark:text-zinc-200">{row.customer}</p>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[13px] text-slate-400">near_me</span>
                            <span>{row.dropoff}</span>
                            <span className="text-slate-400">• {row.distance}</span>
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-mono font-bold text-slate-900 dark:text-zinc-100">
                          <div>{row.deliveryFee} ETB</div>
                          {Number(row.tip) > 0 && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              +{row.tip} ETB Tip
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getDeliveryStatusBadgeClass(
                              row.status
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
                <Pagination
                  currentPage={deliveriesPage}
                  totalPages={deliveriesTotalPages}
                  totalItems={deliveriesTotal}
                  startItem={deliveriesStart}
                  endItem={deliveriesEnd}
                  rowsPerPage={deliveriesRowsPerPage}
                  onPageChange={setDeliveriesPage}
                  onRowsPerPageChange={(size) => {
                    setDeliveriesRowsPerPage(size)
                    setDeliveriesPage(1)
                  }}
                />
              </div>
            </>
          )}

          {/* TAB 2: Wallet & Payouts (Matching Customer Payment History) */}
          {activeTab === 'wallet' && (
            <>
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-850/50">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FF6B35] text-base">receipt_long</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">Courier Wallet Ledger</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">Current Balance:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                      {(rider.wallet_balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Filter Bar */}
              <div className="border-b border-slate-100 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-850/30">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="material-symbols-outlined text-base text-slate-400">filter_list</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Filters</span>
                  </div>

                  {/* Search Engine */}
                  <div className="relative h-10 min-w-[220px] flex-1">
                    <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400">
                      search
                    </span>
                    <input
                      type="text"
                      value={paymentSearchQuery}
                      onChange={(e) => {
                        setPaymentSearchQuery(e.target.value)
                        setPaymentsPage(1)
                      }}
                      placeholder="Search TX ID, description, or amount..."
                      className="h-10 w-full rounded-xl border border-slate-200/80 bg-white pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
                    />
                    {paymentSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentSearchQuery('')
                          setPaymentsPage(1)
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>

                  {/* Transaction Type Filter */}
                  <div className="flex min-w-[140px] flex-col rounded-xl border border-slate-200/80 bg-white px-3 py-1 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Type
                    </label>
                    <select
                      value={paymentTypeFilter}
                      onChange={(e) => {
                        setPaymentTypeFilter(e.target.value)
                        setPaymentsPage(1)
                      }}
                      className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
                    >
                      <option value="ALL">All Types</option>
                      <option value="EARNING">Earnings (EARNING)</option>
                      <option value="BONUS">Incentives (BONUS)</option>
                      <option value="WITHDRAW">Withdrawals (WITHDRAW)</option>
                      <option value="DEPOSIT">Remittance (DEPOSIT)</option>
                      <option value="REFUND">Refunds (REFUND)</option>
                      <option value="CHARGE">Platform Fee (CHARGE)</option>
                      <option value="ADJUSTMENT">Adjustment (ADJUSTMENT)</option>
                      <option value="OTHER">Other / Safety (OTHER)</option>
                    </select>
                  </div>

                  {/* Flow Filter */}
                  <div className="flex min-w-[130px] flex-col rounded-xl border border-slate-200/80 bg-white px-3 py-1 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Flow
                    </label>
                    <select
                      value={paymentFlowFilter}
                      onChange={(e) => {
                        setPaymentFlowFilter(e.target.value)
                        setPaymentsPage(1)
                      }}
                      className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
                    >
                      <option value="ALL">All Flows</option>
                      <option value="CREDIT">Credits (+ Inflow)</option>
                      <option value="DEBIT">Debits (- Outflow)</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div className="flex min-w-[140px] flex-col rounded-xl border border-slate-200/80 bg-white px-3 py-1 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Sort By
                    </label>
                    <select
                      value={paymentSortBy}
                      onChange={(e) => {
                        setPaymentSortBy(e.target.value)
                        setPaymentsPage(1)
                      }}
                      className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
                    >
                      <option value="NEWEST">Newest First</option>
                      <option value="OLDEST">Oldest First</option>
                      <option value="AMOUNT_DESC">Amount: High to Low</option>
                      <option value="AMOUNT_ASC">Amount: Low to High</option>
                    </select>
                  </div>

                  {/* Reset Button */}
                  {(paymentSearchQuery || paymentTypeFilter !== 'ALL' || paymentFlowFilter !== 'ALL' || paymentSortBy !== 'NEWEST') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentSearchQuery('')
                        setPaymentTypeFilter('ALL')
                        setPaymentFlowFilter('ALL')
                        setPaymentSortBy('NEWEST')
                        setPaymentsPage(1)
                      }}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3 text-xs font-bold text-rose-600 shadow-xs transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
                    >
                      <span className="material-symbols-outlined text-base">restart_alt</span>
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                      <th className="px-5 py-3.5">Transaction ID (UUID)</th>
                      <th className="px-5 py-3.5">Date &amp; Time</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">Reason &amp; Description</th>
                      <th className="px-5 py-3.5 text-right">Amount (ETB)</th>
                      <th className="px-5 py-3.5 text-right">Balance After</th>
                      <th className="px-5 py-3.5 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {paginatedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-12 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
                              <span className="material-symbols-outlined text-2xl">search_off</span>
                            </div>
                            <p className="mt-3 text-sm font-bold text-slate-800 dark:text-zinc-200">
                              No transactions match your filters
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                              Try adjusting search filters or selecting different transaction types.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTransactions.map((tx) => {
                        const isCredit = isCreditTransaction(tx.type)
                        return (
                          <tr
                            key={tx.id}
                            className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                          >
                            <td className="whitespace-nowrap px-5 py-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTx(tx)
                                  setIsTxModalOpen(true)
                                }}
                                className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-700 hover:text-[#FF6B35] dark:text-zinc-300 dark:hover:text-[#FF6B35] group/id text-left"
                                title="Click to view full transaction receipt"
                              >
                                <span className="font-semibold underline decoration-dotted underline-offset-2">
                                  {tx.id.slice(0, 8)}...{tx.id.slice(-4)}
                                </span>
                                <span className="material-symbols-outlined text-xs text-slate-400 opacity-0 group-hover/id:opacity-100 transition-opacity">
                                  open_in_new
                                </span>
                              </button>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-500 dark:text-zinc-400">
                              {tx.created_at}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getWalletTypeBadge(
                                  tx.type
                                )}`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {tx.type}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              {tx.order_id ? (
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  #{tx.order_id}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs font-mono">—</span>
                              )}
                            </td>
                            <td className="px-5 py-4 max-w-sm">
                              <p className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                                {tx.reason || tx.description}
                              </p>
                              {tx.description && tx.reason && (
                                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                  {tx.description}
                                </p>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-right font-mono font-bold">
                              <span className={isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                {isCredit ? '+' : '-'}{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-right font-mono font-semibold text-slate-700 dark:text-zinc-300">
                              {Number(tx.balance_after).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTx(tx)
                                  setIsTxModalOpen(true)
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                title="View transaction receipt"
                              >
                                <span className="material-symbols-outlined text-base">receipt_long</span>
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
                <Pagination
                  currentPage={paymentsPage}
                  totalPages={paymentsTotalPages}
                  totalItems={paymentsTotal}
                  startItem={paymentsStart}
                  endItem={paymentsEnd}
                  rowsPerPage={paymentsRowsPerPage}
                  onPageChange={setPaymentsPage}
                  onRowsPerPageChange={(size) => {
                    setPaymentsRowsPerPage(size)
                    setPaymentsPage(1)
                  }}
                />
              </div>
            </>
          )}

          {/* TAB 3: Vehicle Details */}
          {activeTab === 'vehicle' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Registered Vehicle &amp; Equipment
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Official vehicle details and safety equipment registered for delivery logistics.
                  </p>
                </div>
                {getVerificationBadge(rider.vehicle?.status)}
              </div>

              {rider.vehicle ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left Column: Vehicle Profile */}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-800/40 lg:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400 shadow-xs">
                        <span className="material-symbols-outlined text-3xl">
                          {getVehicleIcon(rider.vehicle?.vehicle_type)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900 dark:text-zinc-100 truncate">
                          {rider.vehicle?.brand} {rider.vehicle?.model}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-xs font-bold text-slate-600 dark:text-zinc-400">
                            Plate: {rider.vehicle?.plate_number}
                          </span>
                          <span className="text-slate-300 dark:text-zinc-600">•</span>
                          <span className="text-xs text-slate-500 dark:text-zinc-400">
                            {rider.vehicle?.vehicle_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-200/70 dark:border-zinc-800 sm:grid-cols-3">
                      <div>
                        <span className="text-slate-400 block font-medium">Vehicle Brand:</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.vehicle?.brand || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Model:</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.vehicle?.model || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Manufacturing Year:</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.vehicle?.year || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Color:</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.vehicle?.color || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Registration Plate:</span>
                        <p className="font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.vehicle?.plate_number || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Verified On:</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.vehicle?.verified_at || 'Pending Verification'}</p>
                      </div>
                    </div>

                    {rider.vehicle?.rejection_reason && (
                      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                        <span className="material-symbols-outlined text-base text-rose-600 shrink-0 mt-0.5">warning</span>
                        <div>
                          <strong>Rejection Notice:</strong> {rider.vehicle.rejection_reason}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Safety & Logistics Equipment */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                      Mandatory Equipment Checklist
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                        <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                          Certified Safety Helmet
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Inspected</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                        <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                          Insulated Delivery Box
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Passed</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                        <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                          High-Vis Reflective Vest
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Issued</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60">
                        <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                          Handlebar Phone Mount
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Equipped</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-zinc-700 dark:text-zinc-500">
                  <span className="material-symbols-outlined text-4xl mb-1 text-slate-300">two_wheeler</span>
                  <p>No vehicle assigned or registered for this courier.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Compliance Documents (Matching Address Card Grid layout) */}
          {activeTab === 'documents' && (
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Compliance Documents ({documentsCount})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Official licenses, identity certificates, and legal insurance policies on file.
                  </p>
                </div>
              </div>

              {rider.documents?.length ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                  {rider.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="group relative rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs transition-all hover:border-[#FF6B35]/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
                    >
                      <div>
                        {/* Visible Mockup Document Preview Card */}
                        <div
                          onClick={() => {
                            setSelectedDoc(doc)
                            setIsDocModalOpen(true)
                          }}
                          className="cursor-pointer group/preview relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-zinc-700/80 transition-transform group-hover/preview:scale-[1.01]"
                          title="Click to inspect full document"
                        >
                          <ComplianceDocumentVisual doc={doc} rider={rider} isThumbnail={true} />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs text-white">
                            <span className="material-symbols-outlined text-lg">zoom_in</span>
                            <span className="text-xs font-bold">Inspect Document</span>
                          </div>
                        </div>

                        {/* Title and Status Badge */}
                        <div className="mt-4 flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              {doc.document_name || doc.document_type.replace(/_/g, ' ')}
                            </h5>
                            <p className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                              {doc.id} • {doc.issuing_authority || 'Federal Authority'}
                            </p>
                          </div>
                          {getVerificationBadge(doc.status)}
                        </div>

                        {/* Metadata Rows */}
                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Document No:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-zinc-200">{doc.document_number}</span>
                          </div>
                          {doc.issue_date && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Issue Date:</span>
                              <span className="font-medium text-slate-700 dark:text-zinc-300">{doc.issue_date}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-slate-400">Expiration Date:</span>
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{doc.expiry_date}</span>
                          </div>
                          {doc.verified_at && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Verified Date:</span>
                              <span className="text-slate-600 dark:text-zinc-400">{doc.verified_at}</span>
                            </div>
                          )}
                          {doc.file_type && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Format / Size:</span>
                              <span className="text-slate-500 font-mono">{doc.file_type} ({doc.file_size || '2.1 MB'})</span>
                            </div>
                          )}
                        </div>

                        {doc.rejection_reason && (
                          <div className="mt-3 rounded-xl bg-rose-50 p-2.5 text-[11px] text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                            <strong>Rejection Note:</strong> {doc.rejection_reason}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-3 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-sm text-emerald-500">verified</span>
                          <span>{doc.verified_by || 'Audit verified'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoc(doc)
                            setIsDocModalOpen(true)
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B35] hover:underline"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          <span>View Doc</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 dark:border-zinc-700 dark:text-zinc-500">
                  <span className="material-symbols-outlined text-4xl mb-1 text-slate-300">folder_off</span>
                  <p>No compliance documents uploaded yet.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Profile & Security */}
          {activeTab === 'profile' && (
            <div className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Contact Information */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                      <span className="material-symbols-outlined text-base">person</span>
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Contact &amp; Personal Info
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Full Name:</span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.full_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Phone Number:</span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.phone_number}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Email Address:</span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 break-all">{rider.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Date of Birth:</span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.birth_date}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Gender:</span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.gender === 'MALE' ? 'Male' : 'Female'}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Member Since:</span>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">{rider.joined_date || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              
              </div>

              {/* Onboarding & Dispatch Operations */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                      <span className="material-symbols-outlined text-base">alt_route</span>
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Onboarding Step &amp; Live Dispatch Controls
                    </h4>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-300">
                    Step: {rider.onboarding_step || 'APPROVED'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200/80 dark:border-zinc-800 dark:bg-zinc-900">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                      Live Order Dispatch Assignment
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                      Toggle whether the routing dispatch engine assigns incoming delivery requests to this courier.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleDispatch}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs focus-visible:ring-2 focus-visible:ring-[#FF6B35]/40 focus-visible:outline-none whitespace-nowrap ${
                      rider.can_accept_orders
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {rider.can_accept_orders ? 'check' : 'pause'}
                    </span>
                    {rider.can_accept_orders ? 'Dispatch Ready' : 'Dispatch Paused'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Customer Ratings & Feedback Reviews */}
          {activeTab === 'ratings' && (
            <div className="p-4 sm:p-6 animate-fade-in">
              <CustomerRatingReviews
                entityType="rider"
                entityName={rider.full_name}
                initialReviews={riderReviews}
                onSaveReviews={(updated) => {
                  setRiderReviews(updated)
                  saveRiderReviews(updated)
                }}
                aspectCriteria={[
                  { label: 'Delivery Punctuality', score: '4.9 ★', sub: '98.5% On-Time SLA' },
                  { label: 'Customer Communication', score: '4.9 ★', sub: '99% Courteous' },
                  { label: 'Care of Packages & Food', score: '4.8 ★', sub: 'Zero Spill Incidents' },
                  { label: 'Dropoff Accuracy', score: '4.9 ★', sub: 'Exact Doorstep & Pin' },
                ]}
                baseRatingsCount={142}
              />
            </div>
          )}


        </section>
      </div>

      {/* BLOCK RIDER MODAL (Matching CustomerProfilePage) */}
      {isBanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsBanModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <span className="material-symbols-outlined text-2xl">block</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                    Block Courier Account
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Suspend {rider.full_name}'s account access and delivery order assignments
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBanModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmBan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
                  Ban Duration ("Clock / Due To")
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { id: '24h', label: '24 Hours', sub: '1 Day' },
                    { id: '7d', label: '7 Days', sub: '1 Week' },
                    { id: '30d', label: '30 Days', sub: '1 Month' },
                    { id: 'permanent', label: 'Permanent', sub: 'Indefinite' },
                    { id: 'custom', label: 'Custom Option', sub: 'Specify days/date' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBanDurationOption(opt.id)}
                      className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                        banDurationOption === opt.id
                          ? 'border-rose-500 bg-rose-50/60 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 ring-1 ring-rose-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{opt.sub}</span>
                    </button>
                  ))}
                </div>

                {banDurationOption === 'custom' && (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/30 p-3 dark:border-rose-900/40 dark:bg-rose-950/20 space-y-2">
                    <p className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                      Specify Custom Ban Duration:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Number of Days</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          placeholder="e.g. 14"
                          className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Or Specific End Date</label>
                        <input
                          type="date"
                          value={customDate}
                          onChange={(e) => setCustomDate(e.target.value)}
                          className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Ban Reason &amp; Description <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Required Audit Record</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    'Customer delivery dispute / conduct',
                    'Expired vehicle insurance or license',
                    'Order food tampering / theft report',
                    'Repeated delivery cancellations',
                    'Terms of Service Violation',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBanReason(preset)}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={banReason}
                  onChange={(e) => {
                    setBanReason(e.target.value)
                    if (banError) setBanError('')
                  }}
                  placeholder="Explain why this courier account is being suspended..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
                {banError && <p className="mt-1 text-[11px] font-medium text-rose-500">{banError}</p>}
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-amber-600 shrink-0 mt-0.5">info</span>
                <span>
                  While blocked, the courier will be paused from order dispatch and unable to log in or withdraw funds.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBanModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                >
                  <span className="material-symbols-outlined text-base">block</span>
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNBLOCK RIDER MODAL (Matching CustomerProfilePage) */}
      {isUnblockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsUnblockModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-4">
              <span className="material-symbols-outlined text-2xl">lock_open</span>
            </div>

            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
              Reinstate Courier Account?
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              This will unblock <strong>{rider.full_name}</strong>. They will immediately regain app access, dispatch availability, and wallet privileges.
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsUnblockModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Keep Blocked
              </button>
              <button
                type="button"
                onClick={handleConfirmUnblock}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                Confirm Unblock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLIANCE DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        doc={selectedDoc}
        rider={rider}
        isOpen={isDocModalOpen}
        onClose={() => {
          setIsDocModalOpen(false)
          setSelectedDoc(null)
        }}
      />

      {/* TRANSACTION RECEIPT & DETAIL MODAL */}
      <TransactionDetailModal
        transaction={selectedTx}
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false)
          setSelectedTx(null)
        }}
      />
    </MainLayout>
  )
}

export default RiderDetailPage