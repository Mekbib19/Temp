import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import {
  loadStoredRiders,
  approveRiderVerification,
  rejectRiderVerification,
  resetRiderVerificationToPending,
} from '../data/demoRiders'
import { getVerificationBadge, getVehicleIcon } from '../utils/riderBadges'
import { ComplianceDocumentVisual } from '../components/ComplianceDocumentVisual'
import { DocumentViewerModal } from '../components/DocumentViewerModal'

const REJECTION_PRESETS = [
  "Driver's License is expired or invalid for commercial use",
  'National ID scan is blurry, cropped, or unreadable',
  'Commercial fleet insurance endorsement is missing or expired',
  'Vehicle plate number does not match submitted registration title',
  'Photograph does not match official government biometric identity records',
  'Criminal background clearance certificate expired or unverified',
]

const RiderVerificationPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialStatus = searchParams.get('tab') || searchParams.get('status') || 'ALL'
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [ridersList, setRidersList] = useState(() => loadStoredRiders())

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('NEWEST')
  const [viewMode, setViewMode] = useState('TABLE') // 'TABLE' (default) or 'CARDS'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(12)

  // Inspection & Review Modal States
  const [inspectingRider, setInspectingRider] = useState(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')

  // Reject Modal States
  const [rejectingRider, setRejectingRider] = useState(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [selectedRejectReason, setSelectedRejectReason] = useState(REJECTION_PRESETS[0])
  const [customRejectNote, setCustomRejectNote] = useState('')
  const [rejectError, setRejectError] = useState('')

  // Document Fullscreen Preview Modal
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false)

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null)

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 4000)
  }

  const syncRiders = useCallback(() => {
    const updated = loadStoredRiders()
    setRidersList(updated)
    // If modal is open, refresh the inspecting rider
    if (inspectingRider) {
      const refreshed = updated.find((r) => r.id === inspectingRider.id)
      if (refreshed) setInspectingRider(refreshed)
    }
  }, [inspectingRider])

  useEffect(() => {
    window.addEventListener('riders-data-updated', syncRiders)
    return () => window.removeEventListener('riders-data-updated', syncRiders)
  }, [syncRiders])

  // Count stats
  const pendingRiders = useMemo(() => ridersList.filter((r) => r.verification_status === 'PENDING'), [ridersList])
  const rejectedRiders = useMemo(() => ridersList.filter((r) => r.verification_status === 'REJECTED'), [ridersList])
  const approvedRiders = useMemo(() => ridersList.filter((r) => r.verification_status === 'APPROVED'), [ridersList])

  // Filtered riders for verification list ("the first option ALL brings all")
  const filteredRiders = useMemo(() => {
    return ridersList.filter((rider) => {
      // Status filter
      if (statusFilter !== 'ALL' && rider.verification_status !== statusFilter) return false

      // Vehicle Filter
      if (vehicleFilter !== 'ALL' && rider.vehicle?.vehicle_type !== vehicleFilter) return false

      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const nameMatch = rider.full_name?.toLowerCase().includes(q)
        const idMatch = rider.id?.toLowerCase().includes(q)
        const phoneMatch = rider.phone_number?.toLowerCase().includes(q)
        const emailMatch = rider.email?.toLowerCase().includes(q)
        const plateMatch = rider.vehicle?.plate_number?.toLowerCase().includes(q)
        const docMatch = rider.documents?.some((d) => d.document_number?.toLowerCase().includes(q))
        if (!nameMatch && !idMatch && !phoneMatch && !emailMatch && !plateMatch && !docMatch) return false
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.joined_date || 0) - new Date(a.joined_date || 0)
      if (sortBy === 'OLDEST') return new Date(a.joined_date || 0) - new Date(b.joined_date || 0)
      if (sortBy === 'NAME_ASC') return (a.full_name || '').localeCompare(b.full_name || '')
      return 0
    })
  }, [ridersList, statusFilter, vehicleFilter, searchQuery, sortBy])

  // Pagination calculations
  const totalItems = filteredRiders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, totalItems)
  const paginatedRiders = filteredRiders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    if (status === 'ALL') {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('tab')
      nextParams.delete('status')
      setSearchParams(nextParams)
    } else {
      setSearchParams({ status })
    }
    setCurrentPage(1)
  }

  // Action handlers
  const handleApprove = (rider, notes = '') => {
    const updated = approveRiderVerification(rider.id, notes)
    if (updated) {
      syncRiders()
      setIsReviewModalOpen(false)
      showToast(`Courier ${rider.full_name} has been verified and approved for live dispatch!`, 'success')
    }
  }

  const openRejectModal = (rider) => {
    setRejectingRider(rider)
    setSelectedRejectReason(REJECTION_PRESETS[0])
    setCustomRejectNote('')
    setRejectError('')
    setIsRejectModalOpen(true)
  }

  const handleConfirmReject = (e) => {
    e.preventDefault()
    if (!rejectingRider) return

    const reason = selectedRejectReason === 'Other / Custom Reason'
      ? customRejectNote.trim()
      : customRejectNote.trim()
      ? `${selectedRejectReason} (${customRejectNote.trim()})`
      : selectedRejectReason

    if (!reason) {
      setRejectError('Please specify the reason for document rejection.')
      return
    }

    const updated = rejectRiderVerification(rejectingRider.id, reason, customRejectNote)
    if (updated) {
      syncRiders()
      setIsRejectModalOpen(false)
      setIsReviewModalOpen(false)
      showToast(`Verification for ${rejectingRider.full_name} was rejected. Feedback recorded.`, 'error')
    }
  }

  const handleResetToPending = (rider) => {
    const updated = resetRiderVerificationToPending(rider.id)
    if (updated) {
      syncRiders()
      setIsReviewModalOpen(false)
      showToast(`Courier ${rider.full_name} returned to Pending Review queue.`, 'info')
    }
  }

  return (
    <MainLayout
      activeMenuKey="riderVerification"
      breadcrumbParent="Riders"
      breadcrumbCurrent="Verification Queue"
    >
      <div className="space-y-6 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 text-xs font-bold text-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-600'
                : toastMessage.type === 'error'
                ? 'bg-rose-600'
                : 'bg-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-lg">
              {toastMessage.type === 'success' ? 'check_circle' : toastMessage.type === 'error' ? 'cancel' : 'info'}
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
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Rider Verification &amp; KYC
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Audit and certify driver licenses, national IDs, and vehicle insurance for onboarding couriers.
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
          </div>
        </section>

        {/* Metric Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pending Review */}
          <div
            onClick={() => handleStatusFilterChange(statusFilter === 'PENDING' ? 'ALL' : 'PENDING')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
              statusFilter === 'PENDING'
                ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-400/40 dark:border-amber-500 dark:bg-amber-950/20'
                : 'border-slate-200/80 bg-white hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Pending Review
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:bg-amber-950/40 dark:ring-amber-800/40">
                <span className="material-symbols-outlined text-lg">pending_actions</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {pendingRiders.length}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Requires Audit
              </span>
            </div>
          </div>

          {/* Rejected / Revisions */}
          <div
            onClick={() => handleStatusFilterChange(statusFilter === 'REJECTED' ? 'ALL' : 'REJECTED')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
              statusFilter === 'REJECTED'
                ? 'border-rose-400 bg-rose-50/40 ring-2 ring-rose-400/40 dark:border-rose-500 dark:bg-rose-950/20'
                : 'border-slate-200/80 bg-white hover:border-rose-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Rejected / Appeals
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/60 dark:bg-rose-950/40 dark:ring-rose-800/40">
                <span className="material-symbols-outlined text-lg">cancel</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {rejectedRiders.length}
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Action Needed
              </span>
            </div>
          </div>

          {/* Recently Approved */}
          <div
            onClick={() => handleStatusFilterChange(statusFilter === 'APPROVED' ? 'ALL' : 'APPROVED')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
              statusFilter === 'APPROVED'
                ? 'border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-400/40 dark:border-emerald-500 dark:bg-emerald-950/20'
                : 'border-slate-200/80 bg-white hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Verified &amp; Active
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">verified</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {approvedRiders.length}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Live in Fleet
              </span>
            </div>
          </div>

          {/* Average Verification Compliance */}
          <div
            onClick={() => handleStatusFilterChange('ALL')}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
              statusFilter === 'ALL'
                ? 'border-[#FF6B35] bg-orange-50/40 ring-2 ring-[#FF6B35]/40 dark:border-[#FF6B35] dark:bg-orange-950/20'
                : 'border-slate-200/80 bg-white hover:border-orange-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Verification Rate
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">shield_with_heart</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {Math.round((approvedRiders.length / (ridersList.length || 1)) * 100)}%
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
                Of total applicants
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>
          <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

          {/* Search Input */}
          <div className="relative h-11 min-w-[280px] flex-1">
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
              placeholder="Search by rider name, ID, phone, plate, or doc number..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
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

          {/* Verification Status Filter - "the first will bring all" */}
          <div className="flex min-w-[180px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Verification Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Applications ({ridersList.length})</option>
              <option value="PENDING">Pending Review ({pendingRiders.length})</option>
              <option value="REJECTED">Rejected / Action Needed ({rejectedRiders.length})</option>
              <option value="APPROVED">Approved ({approvedRiders.length})</option>
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Vehicle Type
            </label>
            <select
              value={vehicleFilter}
              onChange={(e) => {
                setVehicleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Vehicles</option>
              <option value="MOTORCYCLE">Motorcycle</option>
              <option value="BIKE">Bicycle / E-Bike</option>
              <option value="CAR">Car / Van</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Sort
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="NEWEST">Newest Submissions</option>
              <option value="OLDEST">Oldest First</option>
              <option value="NAME_ASC">Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Toggle: Table / Cards */}
          <div className="flex h-11 items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                viewMode === 'TABLE'
                  ? 'bg-[#FF6B35] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
              title="Table View"
            >
              <span className="material-symbols-outlined text-lg">view_list</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('CARDS')}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
                viewMode === 'CARDS'
                  ? 'bg-[#FF6B35] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
              title="Card View with Live Document Previews"
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
          </div>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== 'ALL' || vehicleFilter !== 'ALL' || sortBy !== 'NEWEST') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                handleStatusFilterChange('ALL')
                setVehicleFilter('ALL')
                setSortBy('NEWEST')
                setCurrentPage(1)
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* List Content: CARDS VIEW */}
        {viewMode === 'CARDS' && (
          <section className="space-y-4">
            {paginatedRiders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500">
                  <span className="material-symbols-outlined text-3xl">verified_user</span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-zinc-200">
                  No verification items found
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                  No courier records match your selected verification status or search filters.
                </p>
                <button
                  type="button"
                  onClick={() => handleStatusFilterChange('ALL')}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  View All Applications
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {paginatedRiders.map((rider) => {
                  const isRejected = rider.verification_status === 'REJECTED'

                  return (
                    <div
                      key={rider.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-[#FF6B35]/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div>
                        {/* Top Row: Avatar + Name + Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <img
                              src={rider.profile_picture}
                              alt={rider.full_name}
                              className="h-14 w-14 rounded-2xl border border-slate-200/80 object-cover shadow-xs dark:border-zinc-700"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
                                  {rider.full_name}
                                </h3>
                                <span className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500">
                                  {rider.id}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1 font-medium">
                                  <span className="material-symbols-outlined text-[15px] text-slate-400">call</span>
                                  {rider.phone_number}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium">
                                  <span className="material-symbols-outlined text-[15px] text-slate-400">mail</span>
                                  {rider.email}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            {getVerificationBadge(rider.verification_status)}
                            <span className="text-[10px] text-slate-400 font-medium">
                              Applied: {rider.joined_date}
                            </span>
                          </div>
                        </div>

                        {/* Rejection notice banner if rejected */}
                        {isRejected && rider.rejection_reason && (
                          <div className="mt-3.5 rounded-xl border border-rose-200/80 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                            <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-100">
                              <span className="material-symbols-outlined text-base text-rose-600 dark:text-rose-400">error</span>
                              <span>Rejection Reason:</span>
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-rose-700 dark:text-rose-300">
                              {rider.rejection_reason}
                            </p>
                          </div>
                        )}

                        {/* Vehicle & Equipment Strip */}
                        {rider.vehicle && (
                          <div className="mt-3.5 flex flex-wrap items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-zinc-800/50">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                                <span className="material-symbols-outlined text-base">
                                  {getVehicleIcon(rider.vehicle.vehicle_type)}
                                </span>
                              </span>
                              <div>
                                <span className="font-bold text-slate-800 dark:text-zinc-200">
                                  {rider.vehicle.brand} {rider.vehicle.model}
                                </span>
                                <span className="text-[11px] text-slate-400 ml-1.5">
                                  ({rider.vehicle.color}, {rider.vehicle.year})
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 font-mono">
                              <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                                {rider.vehicle.plate_number}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Submitted Compliance Documents Thumbnails */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <span>Compliance Documents ({rider.documents?.length || 0})</span>
                            <span className="text-[10px] text-[#FF6B35] lowercase">click to inspect full document</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
                            {(rider.documents || []).map((doc) => (
                              <div
                                key={doc.id}
                                onClick={() => {
                                  setSelectedDoc(doc)
                                  setInspectingRider(rider)
                                  setIsDocModalOpen(true)
                                }}
                                className="group/doc relative cursor-pointer overflow-hidden rounded-xl border border-slate-200/90 transition hover:border-[#FF6B35] hover:shadow-xs dark:border-zinc-700"
                                title={`Inspect ${doc.document_name || doc.document_type}`}
                              >
                                <ComplianceDocumentVisual doc={doc} rider={rider} isThumbnail={true} />
                                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/doc:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white">
                                  <span className="material-symbols-outlined text-base">zoom_in</span>
                                  <span className="text-[11px] font-bold">Inspect</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-3.5 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => navigate(`/riders/verification/${rider.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-[#FF6B35] hover:bg-orange-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-[#FF6B35]"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                          <span>Review &amp; Verify Documents</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/riders/verification/${rider.id}`)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:border-[#FF6B35] hover:bg-orange-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-[#FF6B35]"
                            title="View Verification Details"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/riders/${rider.id}`)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            title="Go to full rider profile"
                          >
                            <span className="material-symbols-outlined text-base">chevron_right</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* List Content: TABLE VIEW */}
        {viewMode === 'TABLE' && (
          <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                    <th className="px-5 py-3.5">Courier Details</th>
                    <th className="px-5 py-3.5">Vehicle</th>
                    <th className="px-5 py-3.5">Documents Submitted</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Applied Date</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {paginatedRiders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                        No verification records match your filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRiders.map((rider) => (
                      <tr key={rider.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={rider.profile_picture}
                              alt={rider.full_name}
                              className="h-10 w-10 rounded-xl border object-cover"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-zinc-100">{rider.full_name}</p>
                              <p className="text-[11px] font-mono text-slate-400">{rider.id} • {rider.phone_number}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {rider.vehicle ? (
                            <div>
                              <p className="font-bold text-slate-800 dark:text-zinc-200">
                                {rider.vehicle.brand} {rider.vehicle.model}
                              </p>
                              <p className="font-mono text-[10px] text-slate-400">
                                {rider.vehicle.plate_number}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {(rider.documents || []).map((doc) => (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => navigate(`/riders/verification/${rider.id}`)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                title={`Inspect ${doc.document_type} on detail page`}
                              >
                                <span className="material-symbols-outlined text-xs">description</span>
                                <span>{doc.document_type}</span>
                              </button>
                            ))}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {getVerificationBadge(rider.verification_status)}
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-500 dark:text-zinc-400">
                          {rider.joined_date}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => navigate(`/riders/verification/${rider.id}`)}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:border-[#FF6B35] hover:bg-orange-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-[#FF6B35] dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
                              title="View Verification Details"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pagination Controls */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startItem={startItem}
            endItem={endItem}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(size) => {
              setRowsPerPage(size)
              setCurrentPage(1)
            }}
          />
        </section>
      </div>

      {/* COMPREHENSIVE APPLICANT AUDIT & REVIEW MODAL */}
      {isReviewModalOpen && inspectingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
          <div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsReviewModalOpen(false)}
          />

          <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-zinc-800">
              <div className="flex items-center gap-3.5">
                <img
                  src={inspectingRider.profile_picture}
                  alt={inspectingRider.full_name}
                  className="h-12 w-12 rounded-2xl border object-cover shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900 dark:text-zinc-100">
                      {inspectingRider.full_name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {inspectingRider.id}
                    </span>
                    {getVerificationBadge(inspectingRider.verification_status)}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {inspectingRider.phone_number} • {inspectingRider.email} • Joined: {inspectingRider.joined_date}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Vehicle & Equipment Verification Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-base text-[#FF6B35]">two_wheeler</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Registered Vehicle &amp; Equipment Checklist
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Vehicle Model:</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">
                      {inspectingRider.vehicle?.brand} {inspectingRider.vehicle?.model}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">License Plate:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">
                      {inspectingRider.vehicle?.plate_number || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Type &amp; Year:</span>
                    <span className="font-medium text-slate-800 dark:text-zinc-200 mt-0.5 block">
                      {inspectingRider.vehicle?.vehicle_type} ({inspectingRider.vehicle?.year || 2023})
                    </span>
                  </div>
                </div>
              </div>

              {/* Submitted Compliance Documents */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Uploaded Legal Documents ({inspectingRider.documents?.length || 0})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Click any document for high-res magnification and audit controls
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(inspectingRider.documents || []).map((doc) => (
                    <div
                      key={doc.id}
                      className="group/item relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div
                        onClick={() => {
                          setSelectedDoc(doc)
                          setIsDocModalOpen(true)
                        }}
                        className="cursor-pointer group/prev relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-700 transition"
                      >
                        <ComplianceDocumentVisual doc={doc} rider={inspectingRider} isThumbnail={true} />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/prev:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                          <span className="material-symbols-outlined text-lg">zoom_in</span>
                          <span className="text-xs font-bold">Inspect Document</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-start justify-between gap-2 text-xs">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-zinc-100">
                            {doc.document_name || doc.document_type}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400 mt-0.5">
                            {doc.document_number} • Exp: {doc.expiry_date}
                          </p>
                        </div>
                        {getVerificationBadge(doc.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviewer Notes & Instructions */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 block mb-1.5">
                  Internal Operations Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any internal verification remarks or dispatch instructions..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 sm:p-5 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50">
              <button
                type="button"
                onClick={() => handleResetToPending(inspectingRider)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400"
              >
                <span className="material-symbols-outlined text-base">restart_alt</span>
                <span>Request Re-upload</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openRejectModal(inspectingRider)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
                >
                  <span className="material-symbols-outlined text-base">cancel</span>
                  <span>Reject Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(inspectingRider, reviewNotes)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>Accept &amp; Approve Courier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT VERIFICATION REASON MODAL */}
      {isRejectModalOpen && rejectingRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsRejectModalOpen(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 mb-4">
              <span className="material-symbols-outlined text-2xl">cancel</span>
            </div>

            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-slate-900 dark:text-zinc-100">
              Reject Verification for {rejectingRider.full_name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Select the primary non-compliance reason. The courier will receive feedback explaining why their documents were rejected and how to appeal.
            </p>

            <form onSubmit={handleConfirmReject} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Rejection Reason Category
                </label>
                <select
                  value={selectedRejectReason}
                  onChange={(e) => setSelectedRejectReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {REJECTION_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                  <option value="Other / Custom Reason">Other / Custom Reason</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Specific Remarks / Instructions for Courier
                </label>
                <textarea
                  rows={3}
                  value={customRejectNote}
                  onChange={(e) => {
                    setCustomRejectNote(e.target.value)
                    if (rejectError) setRejectError('')
                  }}
                  placeholder="Detail exact document deficiency (e.g. Expired on Oct 14; please upload renewal slip)..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
                {rejectError && (
                  <p className="mt-1 text-[11px] font-semibold text-rose-600">{rejectError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-rose-700 transition"
                >
                  <span className="material-symbols-outlined text-base">block</span>
                  <span>Confirm Rejection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN DOCUMENT VIEWER MODAL */}
      <DocumentViewerModal
        doc={selectedDoc}
        rider={inspectingRider}
        isOpen={isDocModalOpen}
        onClose={() => {
          setIsDocModalOpen(false)
          setSelectedDoc(null)
        }}
      />
    </MainLayout>
  )
}

export default RiderVerificationPage
