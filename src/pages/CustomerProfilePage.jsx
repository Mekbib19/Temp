import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { getDemoCustomerBySlug } from '../data/demoCustomers'

const orders = [
  {
    id: '#ORD-9982',
    date: 'May 24, 2024, 02:45 PM',
    restaurant: 'The Burger Joint',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    items: '2x Double Whopper, 1x Fries, 1x Coke',
    total: '1,450.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-9975',
    date: 'May 23, 2024, 07:15 PM',
    restaurant: 'Mamma Mia Pizza',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB28TV_EKNpHdSnlFYChRYhP9X8ejNBiyWPlmNg_Fpcqo_CXXvdctfHobu3FNughGJ4iipzV-7Qb0-KY-2NQ_4x6zMOZ2cMCvAkMeFM8si4tHWwRRA48dqPRwAyzaT6Bgd224BGY5otIsXdTdOCpJWZlWM4a9Gky9zJQMc0dY5yiQoZgs7HNlru_6qinDLCuGBYy3BBz5xRPvmal_SpOggzAUHZYdj6Au4MahC0VUvkyYOWyUBNOuHaZXuZ5QbQ-xg7XhEV_4a45H0',
    items: '1x Large Margherita, 2x Cola, 1x Garlic Bread',
    total: '980.00',
    status: 'Preparing',
  },
  {
    id: '#ORD-9912',
    date: 'May 19, 2024, 01:20 PM',
    restaurant: 'Sakura Sushi',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiwbJTH8PJz-0KfOrYaMXqs-vhXJog8J7LtWvfxEVEQBQ1uspvbxwSDetybesHliThOrsLYv0d1BZolvo72z6A9Zi-4CYtd2KBg69LKSTGI_Igvbm150beVX_ggWpRp8YzY1z3rgJJej0ZCZ5Qrmve2H5KqVmHsHyZkF-loBpZ3wqf3eTDWxf9TqX19hlJVPyhsdRtHNerSaW8PK3znv1_XAvjW0YI-BT_HTdG3K_u_bTO5bw4gppt3izOpCFQq-tZ7IP1LTnbRLo',
    items: '1x Omakase Set (12pcs), 1x Miso Soup',
    total: '3,200.00',
    status: 'Out for Delivery',
  },
  {
    id: '#ORD-9884',
    date: 'May 15, 2024, 12:30 PM',
    restaurant: 'Taco Haven',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB28TV_EKNpHdSnlFYChRYhP9X8ejNBiyWPlmNg_Fpcqo_CXXvdctfHobu3FNughGJ4iipzV-7Qb0-KY-2NQ_4x6zMOZ2cMCvAkMeFM8si4tHWwRRA48dqPRwAyzaT6Bgd224BGY5otIsXdTdOCpJWZlWM4a9Gky9zJQMc0dY5yiQoZgs7HNlru_6qinDLCuGBYy3BBz5xRPvmal_SpOggzAUHZYdj6Au4MahC0VUvkyYOWyUBNOuHaZXuZ5QbQ-xg7XhEV_4a45H0',
    items: '3x Carne Asada Tacos, 1x Horchata',
    total: '760.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-9820',
    date: 'May 10, 2024, 08:05 PM',
    restaurant: 'Pasta Prime',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    items: '1x Truffle Tagliatelle, 1x Tiramisu',
    total: '1,890.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-9762',
    date: 'May 04, 2024, 11:45 AM',
    restaurant: 'Greens & Grains',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiwbJTH8PJz-0KfOrYaMXqs-vhXJog8J7LtWvfxEVEQBQ1uspvbxwSDetybesHliThOrsLYv0d1BZolvo72z6A9Zi-4CYtd2KBg69LKSTGI_Igvbm150beVX_ggWpRp8YzY1z3rgJJej0ZCZ5Qrmve2H5KqVmHsHyZkF-loBpZ3wqf3eTDWxf9TqX19hlJVPyhsdRtHNerSaW8PK3znv1_XAvjW0YI-BT_HTdG3K_u_bTO5bw4gppt3izOpCFQq-tZ7IP1LTnbRLo',
    items: '2x Quinoa Harvest Bowl, 1x Green Smoothie',
    total: '840.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-9710',
    date: 'Apr 28, 2024, 06:50 PM',
    restaurant: 'The Burger Joint',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    items: '1x Bacon Cheeseburger, 1x Onion Rings',
    total: '920.00',
    status: 'Cancelled',
  },
]

const walletTransactions = [
  {
    id: 'b7c4d5e2-9f1a-4a6c-8e3b-2d1e0f9a8b7c',
    customer_id: 'CUST-9821',
    type: 'DEPOSIT',
    amount: 5000.0,
    isCredit: true,
    description: 'Wallet top-up via Telebirr mobile wallet',
    created_at: 'Oct 25, 2024, 10:14 AM',
    balance_after: '12,450.00',
  },
  {
    id: 'f3a1e9d8-6b2c-4f7e-9a0d-1c3b5e7f9a2b',
    customer_id: 'CUST-9821',
    type: 'PAYMENT',
    amount: 1450.0,
    isCredit: false,
    description: 'Payment for Order #ORD-9982 (The Burger Joint)',
    created_at: 'May 24, 2024, 02:45 PM',
    balance_after: '7,450.00',
  },
  {
    id: 'a9e8d7c6-5b4a-4f3e-8d2c-1b0a9f8e7d6c',
    customer_id: 'CUST-9821',
    type: 'REFUND',
    amount: 920.0,
    isCredit: true,
    description: 'Refund credited for cancelled Order #ORD-9710',
    created_at: 'Apr 28, 2024, 07:10 PM',
    balance_after: '8,900.00',
  },
  {
    id: 'c2b1a0f9-8e7d-4c6b-9a5f-4e3d2c1b0a9f',
    customer_id: 'CUST-9821',
    type: 'PAYMENT',
    amount: 980.0,
    isCredit: false,
    description: 'Payment for Order #ORD-9975 (Mamma Mia Pizza)',
    created_at: 'May 23, 2024, 07:15 PM',
    balance_after: '7,980.00',
  },
  {
    id: 'd4c3b2a1-0f9e-4d8c-7b6a-5f4e3d2c1b0a',
    customer_id: 'CUST-9821',
    type: 'RECEIPT',
    amount: 300.0,
    isCredit: true,
    description: 'Culinary loyalty referral reward credited',
    created_at: 'May 20, 2024, 04:30 PM',
    balance_after: '8,960.00',
  },
  {
    id: 'e5d4c3b2-1a0f-4e9d-8c7b-6a5f4e3d2c1b',
    customer_id: 'CUST-9821',
    type: 'PAYMENT',
    amount: 3200.0,
    isCredit: false,
    description: 'Payment for Order #ORD-9912 (Sakura Sushi)',
    created_at: 'May 19, 2024, 01:20 PM',
    balance_after: '8,660.00',
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    customer_id: 'CUST-9821',
    type: 'ADJUSTMENT',
    amount: 150.0,
    isCredit: true,
    description: 'Delivery delay compensation credit adjustment',
    created_at: 'May 16, 2024, 09:12 AM',
    balance_after: '11,860.00',
  },
  {
    id: 'f6e5d4c3-b2a1-40f9-9e8d-7c6b5a4f3e2d',
    customer_id: 'CUST-9821',
    type: 'TRANSFER',
    amount: 1000.0,
    isCredit: true,
    description: 'P2P wallet balance transfer from +251 922 445566',
    created_at: 'May 12, 2024, 11:20 AM',
    balance_after: '11,710.00',
  },
  {
    id: '9a8b7c6d-5e4f-4321-ba09-8f7e6d5c4b3a',
    customer_id: 'CUST-9821',
    type: 'CHARGE',
    amount: 50.0,
    isCredit: false,
    description: 'Monthly wallet SMS alert maintenance charge',
    created_at: 'May 01, 2024, 12:00 AM',
    balance_after: '10,710.00',
  },
]

const customerAddresses = [
  {
    id: 'addr-1',
    label: 'Home',
    isDefault: true,
    recipient: 'Alex Curator',
    phone: '+251 911 223344',
    street: 'Bole Sub-City, Woreda 03, House #412',
    landmark: 'Behind Edna Mall, near Friendship Business Center',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    instructions: 'Ring doorbell 3B; leave at front door if unanswered.',
    ordersDelivered: 18,
    lastUsed: 'May 24, 2024 (Order #ORD-9982)',
  },
  {
    id: 'addr-2',
    label: 'Office / Work',
    isDefault: false,
    recipient: 'Alex Curator (Bloom Tech)',
    phone: '+251 911 223344',
    street: 'Kazanchis, Guinea Conakry St, Bloom Tech Tower 5th Floor, Suite 502',
    landmark: 'Opposite UNECA Headquarters main entrance gate',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    instructions: 'Call reception upon arrival. Delivery rider must wear guest badge.',
    ordersDelivered: 7,
    lastUsed: 'May 19, 2024 (Order #ORD-9912)',
  },
  {
    id: 'addr-3',
    label: 'Weekend Residence',
    isDefault: false,
    recipient: 'Hanna Curator',
    phone: '+251 922 889900',
    street: 'Old Airport Area, Woreda 05, Villa #14',
    landmark: 'Near International Community School (ICS)',
    city: 'Addis Ababa',
    country: 'Ethiopia',
    instructions: 'Black gate with gold accents. Sound horn twice for guard.',
    ordersDelivered: 3,
    lastUsed: 'Apr 28, 2024 (Order #ORD-9710)',
  },
]

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30'
    case 'Preparing':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30'
    case 'Out for Delivery':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/30'
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30'
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'
  }
}

const getTransactionTypeBadge = (type) => {
  switch (type) {
    case 'DEPOSIT':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30'
    case 'PAYMENT':
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'
    case 'REFUND':
      return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-400 dark:ring-indigo-500/30'
    case 'TRANSFER':
      return 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-400 dark:ring-sky-500/30'
    case 'RECEIPT':
      return 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20 dark:bg-teal-950/40 dark:text-teal-400 dark:ring-teal-500/30'
    case 'ADJUSTMENT':
      return 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-400 dark:ring-purple-500/30'
    case 'CHARGE':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30'
    case 'WITHDRAW':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30'
    default:
      return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
  }
}

const tabs = [
  { id: 'orders', label: 'Order History', icon: 'shopping_bag' },
  { id: 'payments', label: 'Payment History', icon: 'payments' },
  { id: 'addresses', label: 'Delivery Addresses', icon: 'location_on' },
]

const CustomerProfilePage = () => {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const demoCustomer = useMemo(() => getDemoCustomerBySlug(customerId), [customerId])

  const [activeTab, setActiveTab] = useState('orders')

  const [ordersPage, setOrdersPage] = useState(1)
  const [ordersRowsPerPage, setOrdersRowsPerPage] = useState(10)

  const [paymentsPage, setPaymentsPage] = useState(1)
  const [paymentsRowsPerPage, setPaymentsRowsPerPage] = useState(10)

  // Dynamic Active / Blocked state with local per-customer override
  const customerSlugKey = demoCustomer?.slug || customerId || 'CUST-9821'
  const [bannedOverrides, setBannedOverrides] = useState({})
  const [banInfoOverrides, setBanInfoOverrides] = useState({})

  const isBanned =
    bannedOverrides[customerSlugKey] !== undefined
      ? bannedOverrides[customerSlugKey]
      : demoCustomer?.status === 'Blocked'

  const banInfo =
    banInfoOverrides[customerSlugKey] !== undefined
      ? banInfoOverrides[customerSlugKey]
      : demoCustomer?.banInfo || {
          duration: '7 Days',
          reason: '',
          formattedDue: '',
          createdAt: '',
        }

  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [banDurationOption, setBanDurationOption] = useState('7d')
  const [customDays, setCustomDays] = useState(14)
  const [customDate, setCustomDate] = useState('')
  const [banReason, setBanReason] = useState('')
  const [banError, setBanError] = useState('')

  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false)

  // Three-dot dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Edit User state with per-customer override
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userProfileOverrides, setUserProfileOverrides] = useState({})

  const currentProfile = userProfileOverrides[customerSlugKey] || {
    name: demoCustomer?.name || 'Alex Curator',
    email: demoCustomer?.email || 'alex.curator@example.com',
    phone: demoCustomer?.phone || '0911223344',
  }

  const [editFormData, setEditFormData] = useState({
    name: currentProfile.name,
    email: currentProfile.email,
    phone: currentProfile.phone,
  })

  const handleOpenEditModal = () => {
    setEditFormData({
      name: currentProfile.name,
      email: currentProfile.email,
      phone: currentProfile.phone,
    })
    setIsEditModalOpen(true)
  }

  const handleSaveEditUser = (e) => {
    e.preventDefault()
    setUserProfileOverrides((prev) => ({
      ...prev,
      [customerSlugKey]: {
        name: editFormData.name.trim() || currentProfile.name,
        email: editFormData.email.trim() || currentProfile.email,
        phone: editFormData.phone.trim() || currentProfile.phone,
      },
    }))
    setIsEditModalOpen(false)
  }

  const customerName = currentProfile.name
  const customerEmail = currentProfile.email
  const customerPhone = currentProfile.phone
  const customerIdFormatted = customerId || demoCustomer?.slug || 'CUST-9821'
  const customerAvatar = demoCustomer?.avatar || '/assets/alex_curator.png'

  const ordersTotal = orders.length
  const ordersTotalPages = Math.max(1, Math.ceil(ordersTotal / ordersRowsPerPage))
  const ordersStart = ordersTotal === 0 ? 0 : (ordersPage - 1) * ordersRowsPerPage + 1
  const ordersEnd = Math.min(ordersPage * ordersRowsPerPage, ordersTotal)
  const paginatedOrders = orders.slice((ordersPage - 1) * ordersRowsPerPage, ordersPage * ordersRowsPerPage)

  // Payment History Filters state
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('')
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL')
  const [paymentFlowFilter, setPaymentFlowFilter] = useState('ALL')
  const [paymentSortBy, setPaymentSortBy] = useState('NEWEST')

  // Filtered wallet transactions
  const filteredTransactions = useMemo(() => {
    let list = [...walletTransactions]

    if (paymentSearchQuery.trim()) {
      const q = paymentSearchQuery.toLowerCase().trim()
      list = list.filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          tx.type.toLowerCase().includes(q) ||
          String(tx.amount).includes(q) ||
          tx.balance_after.toLowerCase().includes(q)
      )
    }

    if (paymentTypeFilter !== 'ALL') {
      list = list.filter((tx) => tx.type === paymentTypeFilter)
    }

    if (paymentFlowFilter === 'CREDIT') {
      list = list.filter((tx) => tx.isCredit)
    } else if (paymentFlowFilter === 'DEBIT') {
      list = list.filter((tx) => !tx.isCredit)
    }

    if (paymentSortBy === 'OLDEST') {
      list = [...list].reverse()
    } else if (paymentSortBy === 'AMOUNT_DESC') {
      list = [...list].sort((a, b) => Number(b.amount) - Number(a.amount))
    } else if (paymentSortBy === 'AMOUNT_ASC') {
      list = [...list].sort((a, b) => Number(a.amount) - Number(b.amount))
    }

    return list
  }, [paymentSearchQuery, paymentTypeFilter, paymentFlowFilter, paymentSortBy])

  const paymentsTotal = filteredTransactions.length
  const paymentsTotalPages = Math.max(1, Math.ceil(paymentsTotal / paymentsRowsPerPage))
  const paymentsStart = paymentsTotal === 0 ? 0 : (paymentsPage - 1) * paymentsRowsPerPage + 1
  const paymentsEnd = Math.min(paymentsPage * paymentsRowsPerPage, paymentsTotal)
  const paginatedTransactions = filteredTransactions.slice(
    (paymentsPage - 1) * paymentsRowsPerPage,
    paymentsPage * paymentsRowsPerPage
  )

  const handleConfirmBan = (e) => {
    e.preventDefault()
    if (!banReason.trim()) {
      setBanError('Please provide a reason or description for banning this customer.')
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

    setBannedOverrides((prev) => ({ ...prev, [customerSlugKey]: true }))
    setBanInfoOverrides((prev) => ({
      ...prev,
      [customerSlugKey]: {
        duration: label,
        reason: banReason.trim(),
        formattedDue: dueString,
        createdAt: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      },
    }))
    setIsBanModalOpen(false)
    setBanReason('')
    setBanError('')
  }

  const handleConfirmUnblock = () => {
    setBannedOverrides((prev) => ({ ...prev, [customerSlugKey]: false }))
    setBanInfoOverrides((prev) => ({
      ...prev,
      [customerSlugKey]: { duration: '', reason: '', formattedDue: '', createdAt: '' },
    }))
    setIsUnblockModalOpen(false)
  }

  return (
    <MainLayout
      activeMenuKey="customerManagement"
      breadcrumbParent="Customers"
      breadcrumbCurrent="Customer Profile"
    >
      <div className="space-y-6 pb-12">
        {/* Header Action Bar with Back Arrow (Matching MerchantDetailsPage) */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/customers')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Back to Customers list"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                  {customerName}
                </h1>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500">
                  {customerIdFormatted}
                </span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Customer Profile & Order History Console
              </p>
            </div>
          </div>
        </section>

        {/* Profile Card Header (Clean Modern Admin Dashboard User Profile Card) */}
        <section className="relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            {/* On the top left, a square profile picture of a businessman with rounded corners */}
            <div className="relative shrink-0">
              <img
                alt={customerName}
                className="h-24 w-24 rounded-2xl border border-slate-200/90 object-cover shadow-sm dark:border-zinc-700 sm:h-28 sm:w-28"
                src={customerAvatar}
              />
            </div>

            {/* To the right */}
            <div className="min-w-0 flex-1">
              {/* Top row: Name + status badge on left, three-dot menu icon on the top right */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                    {customerName}
                  </h1>
                  {isBanned ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Blocked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  )}
                </div>

                {/* Three-dot menu icon on the top right */}
                <div className="relative shrink-0" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    aria-label="User profile options"
                    aria-expanded={isMenuOpen}
                  >
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>

                  {/* Dropdown Menu (Edit User & Block Customer in Red) */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          setIsMenuOpen(false)
                          handleOpenEditModal()
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-800 transition hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-700/60"
                      >
                        <span className="material-symbols-outlined text-[17px] text-slate-600 dark:text-zinc-400">
                          edit
                        </span>
                        <span>Edit User</span>
                      </button>
                      <div className="border-t border-slate-100 dark:border-zinc-700/70" />
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
                        <span>{isBanned ? 'Unblock Customer' : 'Block Customer'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Below the name, contact details are arranged horizontally in a single row */}
              <div className="mt-2.5 flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[17px] text-slate-500 dark:text-zinc-400">
                    mail
                  </span>
                  <span>{customerEmail}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[17px] text-slate-500 dark:text-zinc-400">
                    call
                  </span>
                  <span>{customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[17px] text-slate-500 dark:text-zinc-400">
                    badge
                  </span>
                  <span>{customerIdFormatted}</span>
                </div>
              </div>

              {/* Suspended alert banner if customer is blocked */}
              {isBanned && (
                <div className="mt-3.5 rounded-xl border border-rose-200/90 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                  <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-100">
                    <span className="material-symbols-outlined text-base text-rose-600 dark:text-rose-400">error</span>
                    <span>Account Access Suspended</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                    <strong className="font-semibold">Duration:</strong>{' '}
                    {banInfo.duration === 'Permanent' ? 'Permanent Ban' : `Until ${banInfo.formattedDue}`}
                    {banInfo.reason && <> • <strong className="font-semibold">Reason:</strong> {banInfo.reason}</>}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Below this row, four compact horizontal metric cards are displayed side by side with soft tinted backgrounds and icons */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {/* Balance (12,450.00 ETB) */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-orange-100/90 bg-orange-50/70 p-3.5 transition dark:border-orange-950/40 dark:bg-orange-950/20">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-900/40 dark:text-orange-400">
                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Balance
                </p>
                <p className="text-sm font-extrabold font-mono text-slate-900 dark:text-zinc-100 truncate">
                  12,450.00 ETB
                </p>
              </div>
            </div>

            {/* Orders (7) */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-100/90 bg-emerald-50/70 p-3.5 transition dark:border-emerald-950/40 dark:bg-emerald-950/20">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
                <span className="material-symbols-outlined text-xl">shopping_bag</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Orders
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  {orders.length}
                </p>
              </div>
            </div>

            {/* Transactions (9) */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-sky-100/90 bg-sky-50/70 p-3.5 transition dark:border-sky-950/40 dark:bg-sky-950/20">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
                <span className="material-symbols-outlined text-xl">payments</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Transactions
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  {walletTransactions.length}
                </p>
              </div>
            </div>

            {/* Addresses (3) */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-purple-100/90 bg-purple-50/70 p-3.5 transition dark:border-purple-950/40 dark:bg-purple-950/20">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Addresses
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  {customerAddresses.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs + Content */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-zinc-800">
            <div className="flex w-full flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1.5 dark:border-zinc-800 dark:bg-zinc-800/60 sm:w-fit">
              {tabs.map((tab) => {
                const count =
                  tab.id === 'orders'
                    ? orders.length
                    : tab.id === 'payments'
                      ? walletTransactions.length
                      : customerAddresses.length
                const labelWithCount = `${tab.label} (${count})`

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

          {activeTab === 'orders' && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">Date & Time</th>
                      <th className="px-5 py-3.5">Restaurant</th>
                      <th className="px-5 py-3.5">Items</th>
                      <th className="px-5 py-3.5 text-right">Total (ETB)</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {paginatedOrders.map((row) => (
                      <tr
                        key={row.id}
                        className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                          {row.id}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-500 dark:text-zinc-400">
                          {row.date}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/70 dark:bg-zinc-800 dark:ring-zinc-700">
                              <img alt="" className="h-full w-full object-cover" src={row.thumb} />
                            </div>
                            <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 transition-colors group-hover:text-[#FF6B35] dark:text-zinc-100">
                              {row.restaurant}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-zinc-400">
                          {row.items}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-mono font-bold text-slate-900 dark:text-zinc-100">
                          {row.total} ETB
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeClass(
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
                  currentPage={ordersPage}
                  totalPages={ordersTotalPages}
                  totalItems={ordersTotal}
                  startItem={ordersStart}
                  endItem={ordersEnd}
                  rowsPerPage={ordersRowsPerPage}
                  onPageChange={setOrdersPage}
                  onRowsPerPageChange={(size) => {
                    setOrdersRowsPerPage(size)
                    setOrdersPage(1)
                  }}
                />
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-850/50">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#FF6B35] text-base">receipt_long</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200">Customer Wallet Ledger</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-slate-500 dark:text-zinc-400">Current Balance:</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">12,450.00 ETB</span>
                  </div>
                </div>
              </div>

              {/* Payment History Filter Bar above Data Grid */}
              <div className="border-b border-slate-100 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-850/30">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filters Header Badge */}
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
                      placeholder="Search ID, description, or amount..."
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
                      <option value="PAYMENT">Payment</option>
                      <option value="DEPOSIT">Deposit</option>
                      <option value="REFUND">Refund</option>
                      <option value="TRANSFER">Transfer</option>
                      <option value="RECEIPT">Receipt</option>
                      <option value="ADJUSTMENT">Adjustment</option>
                      <option value="CHARGE">Charge</option>
                    </select>
                  </div>

                  {/* Flow (Credit / Debit) Filter */}
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

                {/* Filter tags pill summary when active */}
                {(paymentSearchQuery || paymentTypeFilter !== 'ALL' || paymentFlowFilter !== 'ALL') && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="font-medium">Active filters:</span>
                    {paymentSearchQuery && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-semibold text-slate-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-200">
                        Keyword: "{paymentSearchQuery}"
                      </span>
                    )}
                    {paymentTypeFilter !== 'ALL' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-semibold text-slate-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-200">
                        Type: {paymentTypeFilter}
                      </span>
                    )}
                    {paymentFlowFilter !== 'ALL' && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-semibold text-slate-700 shadow-xs dark:bg-zinc-800 dark:text-zinc-200">
                        Flow: {paymentFlowFilter === 'CREDIT' ? 'Credits (+)' : 'Debits (-)'}
                      </span>
                    )}
                    <span className="text-slate-400">({filteredTransactions.length} found)</span>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                      <th className="px-5 py-3.5">Transaction ID</th>
                      <th className="px-5 py-3.5">Date & Time</th>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Description</th>
                      <th className="px-5 py-3.5 text-right">Amount (ETB)</th>
                      <th className="px-5 py-3.5 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {paginatedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center">
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
                              <span className="material-symbols-outlined text-2xl">search_off</span>
                            </div>
                            <p className="mt-3 text-sm font-bold text-slate-800 dark:text-zinc-200">
                              No transactions match your filters
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                              Try clearing search keywords or choosing different transaction types.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentSearchQuery('')
                                setPaymentTypeFilter('ALL')
                                setPaymentFlowFilter('ALL')
                                setPaymentSortBy('NEWEST')
                                setPaymentsPage(1)
                              }}
                              className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-[#FF6B35] transition hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-950/60"
                            >
                              <span className="material-symbols-outlined text-sm">restart_alt</span>
                              Reset all filters
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                                {tx.id.slice(0, 8)}...{tx.id.slice(-4)}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-500 dark:text-zinc-400">
                            {tx.created_at}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getTransactionTypeBadge(
                                tx.type
                              )}`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-800 dark:text-zinc-200">{tx.description}</p>
                            <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                              Customer: {tx.customer_id}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right font-mono font-bold">
                            <span className={tx.isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-zinc-200'}>
                              {tx.isCredit ? '+' : '-'}{Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right font-mono font-semibold text-slate-500 dark:text-zinc-400">
                            {tx.balance_after} ETB
                          </td>
                        </tr>
                      ))
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

          {activeTab === 'addresses' && (
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Saved Delivery Addresses ({customerAddresses.length})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Addresses recorded and utilized for delivery orders by this customer.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {customerAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`relative rounded-2xl border p-5 shadow-xs transition-all ${
                      addr.isDefault
                        ? 'border-[#FF6B35]/40 bg-orange-50/20 dark:border-orange-500/30 dark:bg-orange-950/10 ring-1 ring-[#FF6B35]/20'
                        : 'border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                          <span className="material-symbols-outlined text-[17px]">
                            {addr.label.includes('Home')
                              ? 'home'
                              : addr.label.includes('Office')
                              ? 'apartment'
                              : 'location_on'}
                          </span>
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {addr.label}
                        </span>
                      </div>

                      {addr.isDefault && (
                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-950/60 dark:text-orange-300">
                          Primary Default
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-300">
                      <p className="font-semibold text-slate-900 dark:text-zinc-100">{addr.street}</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-start gap-1">
                        <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0 mt-0.5">near_me</span>
                        <span>{addr.landmark}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        {addr.city}, {addr.country}
                      </p>
                    </div>

                    {addr.instructions && (
                      <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 dark:bg-zinc-800/60 dark:text-zinc-300 border border-slate-100 dark:border-zinc-800">
                        <strong className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Rider Instructions:
                        </strong>
                        {addr.instructions}
                      </div>
                    )}

                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-zinc-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-[#FF6B35]">local_shipping</span>
                        <span>{addr.ordersDelivered} orders delivered</span>
                      </span>
                      <span className="text-[10px] truncate max-w-[130px]">{addr.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

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
                    Block Customer Account
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Suspend {customerName}'s account access and ordering privileges
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
                    'Fraudulent payment / Chargeback',
                    'Abusive conduct to courier',
                    'Prank orders / No-shows',
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
                  placeholder="Explain why this customer account is being blocked..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
                {banError && <p className="mt-1 text-[11px] font-medium text-rose-500">{banError}</p>}
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-amber-600 shrink-0 mt-0.5">info</span>
                <span>
                  While blocked, the customer will be unable to log in, place new orders, or transfer wallet balance.
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
              Reinstate Customer Account?
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              This will unblock <strong>{customerName}</strong>. They will immediately regain ordering, wallet, and login privileges.
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

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <span className="material-symbols-outlined text-xl">edit</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Edit User Profile
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Update customer profile contact information
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default CustomerProfilePage