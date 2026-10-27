import { useState, useMemo } from 'react'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { demoRiders } from '../data/demoRiders'

const RiderManagementPage = () => {
  const [ridersList, setRidersList] = useState(demoRiders)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [verificationFilter, setVerificationFilter] = useState('ALL')
  const [vehicleFilter, setVehicleFilter] = useState('ALL')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [onlineFilter, setOnlineFilter] = useState('ALL')

  // Selected rider for detailed drawer/modal
  const [selectedRider, setSelectedRider] = useState(null)
  const [activeDetailTab, setActiveDetailTab] = useState('profile') // 'profile', 'vehicle', 'documents', 'wallet'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
  const [riderToBlock, setRiderToBlock] = useState(null)
  const [blockReason, setBlockReason] = useState('')

  // Add rider form state
  const [newRider, setNewRider] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    birth_date: '1996-01-01',
    gender: 'MALE',
    level: 'REGULAR',
    vehicle_type: 'MOTORCYCLE',
    vehicle_brand: '',
    vehicle_model: '',
    plate_number: '',
    vehicle_color: '',
    vehicle_year: 2023,
    wallet_balance: 0,
    can_accept_orders: true,
  })

  // Filtered riders
  const filteredRiders = useMemo(() => {
    return ridersList.filter((rider) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = rider.full_name.toLowerCase().includes(q)
        const matchPhone = rider.phone_number.toLowerCase().includes(q)
        const matchEmail = rider.email.toLowerCase().includes(q)
        const matchId = rider.id.toLowerCase().includes(q)
        const matchPlate = rider.vehicle?.plate_number?.toLowerCase().includes(q)
        if (!matchName && !matchPhone && !matchEmail && !matchId && !matchPlate) {
          return false
        }
      }

      if (statusFilter !== 'ALL' && rider.status !== statusFilter) {
        return false
      }

      if (verificationFilter !== 'ALL' && rider.verification_status !== verificationFilter) {
        return false
      }

      if (vehicleFilter !== 'ALL' && rider.vehicle?.vehicle_type !== vehicleFilter) {
        return false
      }

      if (levelFilter !== 'ALL' && rider.level !== levelFilter) {
        return false
      }

      if (onlineFilter === 'ONLINE' && !rider.is_online) {
        return false
      }
      if (onlineFilter === 'OFFLINE' && rider.is_online) {
        return false
      }

      return true
    })
  }, [ridersList, searchQuery, statusFilter, verificationFilter, vehicleFilter, levelFilter, onlineFilter])

  // Pagination calculation
  const totalRiders = filteredRiders.length
  const totalPages = Math.max(1, Math.ceil(totalRiders / rowsPerPage))
  const startItem = totalRiders === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, totalRiders)
  const paginatedRiders = filteredRiders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  // Quick action: toggle can_accept_orders
  const handleToggleDispatch = (riderId, e) => {
    e?.stopPropagation()
    setRidersList((prev) =>
      prev.map((r) => {
        if (r.id === riderId) {
          const updated = { ...r, can_accept_orders: !r.can_accept_orders }
          if (selectedRider?.id === riderId) {
            setSelectedRider(updated)
          }
          return updated
        }
        return r
      })
    )
  }

  // Quick action: prompt block or unblock
  const handleToggleBlock = (rider, e) => {
    e?.stopPropagation()
    if (rider.status === 'BLOCKED') {
      // Unblock directly
      setRidersList((prev) =>
        prev.map((r) => {
          if (r.id === rider.id) {
            const updated = { ...r, status: 'ACTIVE', ban_reason: null }
            if (selectedRider?.id === rider.id) {
              setSelectedRider(updated)
            }
            return updated
          }
          return r
        })
      )
    } else {
      setRiderToBlock(rider)
      setBlockReason('')
      setIsBlockModalOpen(true)
    }
  }

  const handleConfirmBlock = (e) => {
    e.preventDefault()
    if (!riderToBlock) return
    setRidersList((prev) =>
      prev.map((r) => {
        if (r.id === riderToBlock.id) {
          const updated = {
            ...r,
            status: 'BLOCKED',
            can_accept_orders: false,
            is_online: false,
            last_online_at: 'Blocked by Admin',
            ban_reason: blockReason.trim() || 'Administrative suspension',
          }
          if (selectedRider?.id === riderToBlock.id) {
            setSelectedRider(updated)
          }
          return updated
        }
        return r
      })
    )
    setIsBlockModalOpen(false)
    setRiderToBlock(null)
    setBlockReason('')
  }

  // Submit new rider
  const handleAddRiderSubmit = (e) => {
    e.preventDefault()
    const riderId = `RDR-${Math.floor(1000 + Math.random() * 9000)}`
    const vehicleId = `VEH-${Math.floor(100 + Math.random() * 900)}`

    const createdRider = {
      id: riderId,
      full_name: newRider.full_name.trim(),
      phone_number: newRider.phone_number.trim(),
      email: newRider.email.trim(),
      profile_picture: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
      birth_date: newRider.birth_date,
      gender: newRider.gender,
      two_factor_enabled: true,
      two_factor_email: newRider.email.trim(),
      two_factor_otp: 'Setup Verified',
      two_factor_otp_expires_at: '2026-12-31',
      level: newRider.level,
      wallet_balance: Number(newRider.wallet_balance) || 0,
      status: 'ACTIVE',
      onboarding_step: 'APPROVED',
      verification_status: 'APPROVED',
      can_accept_orders: newRider.can_accept_orders,
      is_online: true,
      last_online_at: 'Online Now',
      completed_orders: 0,
      rating: 5.0,
      joined_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      vehicle: {
        id: vehicleId,
        vehicle_type: newRider.vehicle_type,
        brand: newRider.vehicle_brand.trim() || 'Standard',
        model: newRider.vehicle_model.trim() || 'Courier Edition',
        plate_number: newRider.plate_number.trim() || 'AA 3-NEW',
        color: newRider.vehicle_color.trim() || 'Black',
        year: Number(newRider.vehicle_year) || 2023,
        status: 'APPROVED',
        rejection_reason: null,
        verified_at: 'Today',
      },
      documents: [
        {
          id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
          document_type: 'LICENSE',
          document_number: 'DL-INITIAL',
          expiry_date: '2027-12-31',
          status: 'APPROVED',
          verified_at: 'Today',
        },
      ],
    }

    setRidersList((prev) => [createdRider, ...prev])
    setIsAddModalOpen(false)
    setNewRider({
      full_name: '',
      phone_number: '',
      email: '',
      birth_date: '1996-01-01',
      gender: 'MALE',
      level: 'REGULAR',
      vehicle_type: 'MOTORCYCLE',
      vehicle_brand: '',
      vehicle_model: '',
      plate_number: '',
      vehicle_color: '',
      vehicle_year: 2023,
      wallet_balance: 0,
      can_accept_orders: true,
    })
  }

  // Summary counts
  const totalFleet = ridersList.length
  const onlineCount = ridersList.filter((r) => r.is_online).length
  const pendingCount = ridersList.filter((r) => r.verification_status === 'PENDING').length
  const totalFleetBalance = ridersList.reduce((acc, r) => acc + (r.wallet_balance || 0), 0)

  // Badge helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending Review
          </span>
        )
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Blocked
          </span>
        )
      case 'INACTIVE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Inactive
          </span>
        )
    }
  }

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            Approved
          </span>
        )
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400">
            <span className="material-symbols-outlined text-[13px]">pending</span>
            Pending
          </span>
        )
      case 'ONBOARDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-400">
            <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
            Onboarding
          </span>
        )
      case 'REJECTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400">
            <span className="material-symbols-outlined text-[13px]">cancel</span>
            Rejected
          </span>
        )
    }
  }

  const getLevelBadge = (level) => {
    switch (level) {
      case 'VIP':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300">
            <span className="material-symbols-outlined text-[12px]">stars</span>
            VIP
          </span>
        )
      case 'PREMIUM':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#FF6B35] ring-1 ring-orange-600/20 dark:bg-orange-950/40 dark:text-orange-400">
            <span className="material-symbols-outlined text-[12px]">workspace_premium</span>
            Premium
          </span>
        )
      case 'REGULAR':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
            Regular
          </span>
        )
    }
  }

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'MOTORCYCLE':
        return 'two_wheeler'
      case 'BIKE':
        return 'pedal_bike'
      case 'CAR':
        return 'directions_car'
      default:
        return 'local_shipping'
    }
  }

  return (
    <MainLayout
      activeMenuKey="riderManagement"
      breadcrumbParent="Management"
      breadcrumbCurrent="Riders"
    >
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Rider Management
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Overview and compliance control of all registered delivery couriers, vehicle inspections, and verification documents.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export Fleet
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">two_wheeler</span>
              Register Rider
            </button>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Platform Design */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Riders */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Fleet Riders
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">two_wheeler</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {totalFleet}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +14% this month
              </span>
            </div>
          </div>

          {/* Card 2: Active / Online */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Online & Dispatch Ready
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">wifi_tethering</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {onlineCount}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                {Math.round((onlineCount / (totalFleet || 1)) * 100)}% active now
              </span>
            </div>
          </div>

          {/* Card 3: Pending Verification */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Verification Pending
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:bg-amber-950/40 dark:ring-amber-800/40">
                <span className="material-symbols-outlined text-lg">pending_actions</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {pendingCount}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Requires review
              </span>
            </div>
          </div>

          {/* Card 4: Fleet Wallet Balance */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Fleet Wallet Balance
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                {totalFleetBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Held in escrow
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          {/* Filter Badge */}
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>
          <div className="mx-1 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

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
              placeholder="Search rider name, phone, email, plate number, or ID..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Account Status Filter */}
          <div className="flex min-w-[130px] flex-col gap-0.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Account Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending Review</option>
              <option value="BLOCKED">Blocked</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="flex min-w-[140px] flex-col gap-0.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Verification
            </label>
            <select
              value={verificationFilter}
              onChange={(e) => {
                setVerificationFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Verifications</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending Review</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div className="flex min-w-[130px] flex-col gap-0.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Vehicle Type
            </label>
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Vehicles</option>
              <option value="MOTORCYCLE">Motorcycle</option>
              <option value="BIKE">Bicycle</option>
              <option value="CAR">Car</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="flex min-w-[120px] flex-col gap-0.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Rider Tier
            </label>
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Tiers</option>
              <option value="VIP">VIP</option>
              <option value="PREMIUM">Premium</option>
              <option value="REGULAR">Regular</option>
            </select>
          </div>

          {/* Online Filter */}
          <div className="flex min-w-[120px] flex-col gap-0.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
            <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Live Status
            </label>
            <select
              value={onlineFilter}
              onChange={(e) => {
                setOnlineFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Couriers</option>
              <option value="ONLINE">Online Now</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {(searchQuery ||
            statusFilter !== 'ALL' ||
            verificationFilter !== 'ALL' ||
            vehicleFilter !== 'ALL' ||
            levelFilter !== 'ALL' ||
            onlineFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('ALL')
                setVerificationFilter('ALL')
                setVehicleFilter('ALL')
                setLevelFilter('ALL')
                setOnlineFilter('ALL')
                setCurrentPage(1)
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Riders Table View */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <th className="px-5 py-3.5">Rider ID</th>
                  <th className="px-5 py-3.5">Courier & Tier</th>
                  <th className="px-5 py-3.5">Phone & Contact</th>
                  <th className="px-5 py-3.5">Assigned Vehicle</th>
                  <th className="px-5 py-3.5 text-center">Verification</th>
                  <th className="px-5 py-3.5 text-right">Wallet Balance</th>
                  <th className="px-5 py-3.5 text-center">Dispatch & Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {paginatedRiders.length > 0 ? (
                  paginatedRiders.map((rider) => (
                    <tr
                      key={rider.id}
                      onClick={() => {
                        setSelectedRider(rider)
                        setActiveDetailTab('profile')
                      }}
                      className="group cursor-pointer transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                    >
                      {/* Rider ID */}
                      <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {rider.id}
                      </td>

                      {/* Courier & Tier */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={rider.profile_picture}
                              alt={rider.full_name}
                              className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-zinc-800"
                            />
                            {rider.is_online ? (
                              <span
                                title="Online Now"
                                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900"
                              />
                            ) : (
                              <span
                                title="Offline"
                                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300 dark:border-zinc-900 dark:bg-zinc-600"
                              />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 transition-colors group-hover:text-[#FF6B35] dark:text-zinc-100 dark:group-hover:text-[#FF6B35]">
                                {rider.full_name}
                              </span>
                              {getLevelBadge(rider.level)}
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                              {rider.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Contact */}
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700 dark:text-zinc-300">
                        <div className="flex flex-col">
                          <span>{rider.phone_number}</span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {rider.gender === 'MALE' ? 'Male' : 'Female'} • Joined {rider.joined_date}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Vehicle */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                            <span className="material-symbols-outlined text-base">
                              {getVehicleIcon(rider.vehicle?.vehicle_type)}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">
                              {rider.vehicle?.brand} {rider.vehicle?.model}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                              {rider.vehicle?.plate_number}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Verification */}
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        {getVerificationBadge(rider.verification_status)}
                      </td>

                      {/* Wallet Balance */}
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span className="font-mono font-extrabold text-slate-900 dark:text-zinc-100">
                          {rider.wallet_balance?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{' '}
                          <span className="text-[10px] font-semibold text-slate-500">ETB</span>
                        </span>
                      </td>

                      {/* Dispatch & Status */}
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {getStatusBadge(rider.status)}
                          <span
                            className={`text-[10px] font-semibold ${
                              rider.can_accept_orders ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                            }`}
                          >
                            {rider.can_accept_orders ? 'Ready for Orders' : 'Dispatch Paused'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRider(rider)
                              setActiveDetailTab('profile')
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            title="View Rider Profile & Documents"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleToggleDispatch(rider.id, e)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                              rider.can_accept_orders
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                            title={rider.can_accept_orders ? 'Pause Order Dispatch' : 'Resume Order Dispatch'}
                          >
                            <span className="material-symbols-outlined text-base">
                              {rider.can_accept_orders ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleToggleBlock(rider, e)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                              rider.status === 'BLOCKED'
                                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400'
                                : 'border-slate-200/80 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-rose-950/30'
                            }`}
                            title={rider.status === 'BLOCKED' ? 'Unblock Courier' : 'Block Courier'}
                          >
                            <span className="material-symbols-outlined text-base">
                              {rider.status === 'BLOCKED' ? 'lock_open' : 'block'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600">
                          search_off
                        </span>
                        <p className="font-semibold text-sm">No couriers match your filters</p>
                        <p className="text-xs text-slate-400">
                          Try adjusting your search criteria or clear the filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalRiders}
              startItem={startItem}
              endItem={endItem}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(size) => {
                setRowsPerPage(size)
                setCurrentPage(1)
              }}
            />
          </div>
        </section>
      </div>

      {/* RIDER DETAIL SLIDE-OVER DRAWER */}
      {selectedRider && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedRider(null)}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-xl bg-white shadow-2xl dark:bg-zinc-900 flex flex-col">
              {/* Drawer Header */}
              <div className="border-b border-slate-100 p-6 dark:border-zinc-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedRider.profile_picture}
                      alt={selectedRider.full_name}
                      className="h-16 w-16 rounded-2xl object-cover ring-4 ring-slate-100 dark:ring-zinc-800 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                          {selectedRider.full_name}
                        </h2>
                        {getLevelBadge(selectedRider.level)}
                      </div>
                      <p className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500 mt-0.5">
                        {selectedRider.id}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {getStatusBadge(selectedRider.status)}
                        {getVerificationBadge(selectedRider.verification_status)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRider(null)}
                    className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
                  >
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>

                {/* Blocked reason banner */}
                {selectedRider.status === 'BLOCKED' && (
                  <div className="mt-4 rounded-xl border border-rose-200/90 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
                    <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-100">
                      <span className="material-symbols-outlined text-base text-rose-600 dark:text-rose-400">
                        block
                      </span>
                      <span>Courier Account Blocked</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed">
                      {selectedRider.ban_reason || 'This courier is suspended from order dispatch and app access.'}
                    </p>
                  </div>
                )}

                {/* Drawer Tabs */}
                <div className="mt-6 flex border-b border-slate-100 dark:border-zinc-800 -mb-6">
                  {[
                    { id: 'profile', label: 'Profile & Security', icon: 'badge' },
                    { id: 'vehicle', label: 'Vehicle Details', icon: 'two_wheeler' },
                    { id: 'documents', label: 'Compliance Documents', icon: 'verified_user' },
                    { id: 'wallet', label: 'Wallet & Stats', icon: 'account_balance_wallet' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveDetailTab(tab.id)}
                      className={`flex items-center gap-1.5 border-b-2 px-3 pb-3 text-xs font-bold transition ${
                        activeDetailTab === tab.id
                          ? 'border-[#FF6B35] text-[#FF6B35]'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeDetailTab === 'profile' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-850/40">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Phone Number:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.phone_number}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Email Address:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.email}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Birth Date:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.birth_date}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Gender:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.gender === 'MALE' ? 'Male' : 'Female'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-850/40">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                        Security & Authentication (2FA)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Two-Factor Authentication:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5 flex items-center gap-1.5">
                            <span
                              className={`material-symbols-outlined text-base ${
                                selectedRider.two_factor_enabled ? 'text-emerald-500' : 'text-slate-400'
                              }`}
                            >
                              {selectedRider.two_factor_enabled ? 'check_circle' : 'cancel'}
                            </span>
                            {selectedRider.two_factor_enabled ? 'Enabled & Secured' : 'Disabled'}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Verification Method:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.two_factor_otp || 'Email / SMS'}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-slate-400">Secured Recovery Email:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.two_factor_email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-850/40">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                        Onboarding & Dispatch Controls
                      </h4>
                      <div className="flex items-center justify-between gap-4 text-xs">
                        <div>
                          <span className="text-slate-400">Onboarding Step:</span>
                          <p className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.onboarding_step}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleDispatch(selectedRider.id)}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-xs ${
                              selectedRider.can_accept_orders
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            <span className="material-symbols-outlined text-base">
                              {selectedRider.can_accept_orders ? 'check' : 'pause'}
                            </span>
                            {selectedRider.can_accept_orders ? 'Dispatch Ready' : 'Dispatch Paused'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'vehicle' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-850/40">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                            <span className="material-symbols-outlined text-xl">
                              {getVehicleIcon(selectedRider.vehicle?.vehicle_type)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-zinc-100">
                              {selectedRider.vehicle?.brand} {selectedRider.vehicle?.model}
                            </h4>
                            <span className="font-mono text-xs font-bold text-slate-500">
                              Plate: {selectedRider.vehicle?.plate_number}
                            </span>
                          </div>
                        </div>
                        {getVerificationBadge(selectedRider.vehicle?.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Vehicle Type:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.vehicle?.vehicle_type}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Manufacturing Year:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.vehicle?.year}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Color:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.vehicle?.color}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400">Verified Timestamp:</span>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200 mt-0.5">
                            {selectedRider.vehicle?.verified_at || 'Pending verification'}
                          </p>
                        </div>
                      </div>

                      {selectedRider.vehicle?.rejection_reason && (
                        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                          <strong>Rejection Note:</strong> {selectedRider.vehicle.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeDetailTab === 'documents' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Verified government-issued identification and compliance records for this rider.
                    </p>
                    {selectedRider.documents?.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-800/60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                            <span className="material-symbols-outlined text-lg">description</span>
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                              {doc.document_type.replace('_', ' ')}
                            </p>
                            <p className="font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                              {doc.document_number} • Exp: {doc.expiry_date}
                            </p>
                          </div>
                        </div>
                        {getVerificationBadge(doc.status)}
                      </div>
                    ))}
                  </div>
                )}

                {activeDetailTab === 'wallet' && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-850/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                        Current Wallet Balance
                      </span>
                      <p className="font-mono text-3xl font-extrabold text-[#FF6B35] mt-1">
                        {selectedRider.wallet_balance?.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{' '}
                        <span className="text-sm font-semibold">ETB</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-800/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Completed Orders
                        </span>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-zinc-100 mt-1">
                          {selectedRider.completed_orders || 0}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-800/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Customer Rating
                        </span>
                        <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-lg">star</span>
                          {selectedRider.rating || '5.0'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-slate-100 p-4 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleBlock(selectedRider)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                    selectedRider.status === 'BLOCKED'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {selectedRider.status === 'BLOCKED' ? 'lock_open' : 'block'}
                  </span>
                  {selectedRider.status === 'BLOCKED' ? 'Unblock Rider' : 'Block Rider Account'}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRider(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER / ADD RIDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                  <span className="material-symbols-outlined text-xl">two_wheeler</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                    Register New Delivery Courier
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    Onboard rider profile, assign vehicle, and set up dispatch status
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddRiderSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRider.full_name}
                    onChange={(e) => setNewRider((prev) => ({ ...prev, full_name: e.target.value }))}
                    placeholder="e.g. Samuel Bekele"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newRider.phone_number}
                    onChange={(e) => setNewRider((prev) => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="e.g. +251 911 000111"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newRider.email}
                    onChange={(e) => setNewRider((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="e.g. samuel.b@shimadelivery.com"
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={newRider.gender}
                    onChange={(e) => setNewRider((prev) => ({ ...prev, gender: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1">
                    Rider Tier / Level
                  </label>
                  <select
                    value={newRider.level}
                    onChange={(e) => setNewRider((prev) => ({ ...prev, level: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <option value="REGULAR">Regular</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
              </div>

              {/* Vehicle Assignment Section */}
              <div className="border-t border-slate-100 pt-3 dark:border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 mb-2">
                  Assigned Vehicle Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={newRider.vehicle_type}
                      onChange={(e) => setNewRider((prev) => ({ ...prev, vehicle_type: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <option value="MOTORCYCLE">Motorcycle</option>
                      <option value="BIKE">Bicycle</option>
                      <option value="CAR">Car</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      License Plate Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={newRider.plate_number}
                      onChange={(e) => setNewRider((prev) => ({ ...prev, plate_number: e.target.value }))}
                      placeholder="e.g. AA 3-99182"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={newRider.vehicle_brand}
                      onChange={(e) => setNewRider((prev) => ({ ...prev, vehicle_brand: e.target.value }))}
                      placeholder="e.g. TVS / Bajaj / Honda"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-zinc-400 mb-1">
                      Model & Year
                    </label>
                    <input
                      type="text"
                      value={newRider.vehicle_model}
                      onChange={(e) => setNewRider((prev) => ({ ...prev, vehicle_model: e.target.value }))}
                      placeholder="e.g. Apache RTR 160 (2023)"
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                  Complete Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BLOCK RIDER REASON MODAL */}
      {isBlockModalOpen && riderToBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsBlockModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <span className="material-symbols-outlined text-2xl">block</span>
              </div>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                  Suspend & Block Rider Account
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Courier: <strong>{riderToBlock.full_name}</strong> ({riderToBlock.id})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmBlock} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                  Reason for Suspension *
                </label>
                <textarea
                  required
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Expired vehicle insurance, repeated customer disputes, or failed document verification."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsBlockModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition"
                >
                  <span className="material-symbols-outlined text-base">block</span>
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default RiderManagementPage
