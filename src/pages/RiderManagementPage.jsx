import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { loadStoredRiders, unblockRider } from '../data/demoRiders'
import { getStatusBadge, getVerificationBadge, getVehicleIcon } from '../utils/riderBadges'

const RiderManagementPage = () => {
  const navigate = useNavigate()
  const [ridersList, setRidersList] = useState(() => loadStoredRiders())
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [verificationFilter, setVerificationFilter] = useState('ALL')
  const [vehicleFilter, setVehicleFilter] = useState('ALL')
  const [onlineFilter, setOnlineFilter] = useState('ALL')

  useEffect(() => {
    const handleUpdate = () => setRidersList(loadStoredRiders())
    window.addEventListener('riders-data-updated', handleUpdate)
    return () => window.removeEventListener('riders-data-updated', handleUpdate)
  }, [])

  const filteredRiders = useMemo(() => {
    return ridersList.filter((rider) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = rider.full_name?.toLowerCase().includes(q)
        const matchPhone = rider.phone_number?.toLowerCase().includes(q)
        const matchEmail = rider.email?.toLowerCase().includes(q)
        const matchId = rider.id?.toLowerCase().includes(q)
        const matchPlate = rider.vehicle?.plate_number?.toLowerCase().includes(q)
        if (!matchName && !matchPhone && !matchEmail && !matchId && !matchPlate) return false
      }
      if (statusFilter !== 'ALL' && rider.status !== statusFilter) return false
      if (verificationFilter !== 'ALL' && rider.verification_status !== verificationFilter) return false
      if (vehicleFilter !== 'ALL' && rider.vehicle?.vehicle_type !== vehicleFilter) return false
      if (onlineFilter === 'ONLINE' && !rider.is_online) return false
      if (onlineFilter === 'OFFLINE' && rider.is_online) return false
      return true
    })
  }, [ridersList, searchQuery, statusFilter, verificationFilter, vehicleFilter, onlineFilter])

  const totalRiders = filteredRiders.length
  const totalPages = Math.max(1, Math.ceil(totalRiders / rowsPerPage))
  const startItem = totalRiders === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, totalRiders)
  const paginatedRiders = filteredRiders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const handleToggleBlock = (rider, e) => {
    e?.stopPropagation()
    if (rider.status === 'BLOCKED') {
      unblockRider(rider.id)
      setRidersList(loadStoredRiders())
    } else {
      navigate(`/riders/${rider.id}/block`)
    }
  }

  const totalFleet = ridersList.length
  const onlineCount = ridersList.filter((r) => r.is_online).length
  const pendingCount = ridersList.filter((r) => r.verification_status === 'PENDING').length
  const totalFleetBalance = ridersList.reduce((acc, r) => acc + (r.wallet_balance || 0), 0)

  return (
    <MainLayout activeMenuKey="riderManagement" breadcrumbParent="Management" breadcrumbCurrent="Riders">
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
              onClick={() => navigate('/riders/verification')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-orange-600 active:scale-95"
            >
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span>Verification Queue</span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-black text-white">
                  {pendingCount}
                </span>
              )}
            </button>
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
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Total Fleet Riders</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">two_wheeler</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">{totalFleet}</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+14% this month</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Online & Dispatch Ready</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">wifi_tethering</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">{onlineCount}</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                {Math.round((onlineCount / (totalFleet || 1)) * 100)}% active now
              </span>
            </div>
          </div>

          <div
            onClick={() => navigate('/riders/verification?tab=PENDING')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-amber-200/90 bg-white p-5 shadow-xs transition-all hover:border-amber-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-500/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Verification Pending</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 transition group-hover:bg-amber-100 dark:bg-amber-950/40 dark:ring-amber-800/40">
                <span className="material-symbols-outlined text-lg">pending_actions</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">{pendingCount}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 group-hover:underline dark:text-amber-400">
                Review Queue →
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Fleet Wallet Balance</span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 truncate">
                {totalFleetBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Held in escrow</span>
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

          {/* Search Engine */}
          <div className="relative h-11 min-w-[280px] flex-1">
            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              placeholder="Search rider name, phone, email, plate number, or ID..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setCurrentPage(1) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Account Status Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Account Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="PENDING">Pending Review</option>
              <option value="BLOCKED">Blocked Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Verification</label>
            <select
              value={verificationFilter}
              onChange={(e) => { setVerificationFilter(e.target.value); setCurrentPage(1) }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Verifications</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending Review</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Vehicle Type</label>
            <select
              value={vehicleFilter}
              onChange={(e) => { setVehicleFilter(e.target.value); setCurrentPage(1) }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Vehicles</option>
              <option value="MOTORCYCLE">Motorcycle</option>
              <option value="BIKE">Bicycle / E-Bike</option>
              <option value="CAR">Car / Van</option>
            </select>
          </div>

          {/* Live Status Filter */}
          <div className="flex min-w-[130px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Live Status</label>
            <select
              value={onlineFilter}
              onChange={(e) => { setOnlineFilter(e.target.value); setCurrentPage(1) }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="ALL">All Couriers</option>
              <option value="ONLINE">Online Now</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'ALL' || verificationFilter !== 'ALL' || vehicleFilter !== 'ALL' || onlineFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery(''); setStatusFilter('ALL'); setVerificationFilter('ALL')
                setVehicleFilter('ALL'); setOnlineFilter('ALL'); setCurrentPage(1)
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <th className="px-5 py-3.5">Rider ID</th>
                  <th className="px-5 py-3.5">Courier</th>
                  <th className="px-5 py-3.5">Phone & Contact</th>
                  <th className="px-5 py-3.5">Assigned Vehicle</th>
                  <th className="px-5 py-3.5 text-right">Wallet Balance</th>
                  <th className="px-5 py-3.5 text-center"> Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {paginatedRiders.length > 0 ? (
                  paginatedRiders.map((rider) => (
                    <tr
                      key={rider.id}
                      onClick={() => navigate(`/riders/${rider.id}`)}
                      className="group cursor-pointer transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-slate-900 dark:text-zinc-100">{rider.id}</td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={rider.profile_picture}
                              alt={rider.full_name}
                              className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-zinc-800"
                            />
                            {rider.is_online ? (
                              <span title="Online Now" className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
                            ) : (
                              <span title="Offline" className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300 dark:border-zinc-900 dark:bg-zinc-600" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 transition-colors group-hover:text-[#FF6B35] dark:text-zinc-100 dark:group-hover:text-[#FF6B35]">
                              {rider.full_name}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">{rider.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700 dark:text-zinc-300">
                        <div className="flex flex-col">
                          <span>{rider.phone_number}</span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {rider.gender === 'MALE' ? 'Male' : 'Female'} • Joined {rider.joined_date}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                            <span className="material-symbols-outlined text-base">{getVehicleIcon(rider.vehicle?.vehicle_type)}</span>
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

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <span className="font-mono font-extrabold text-slate-900 dark:text-zinc-100">
                          {rider.wallet_balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                          <span className="text-[10px] font-semibold text-slate-500">ETB</span>
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1.5">
                            {getStatusBadge(rider.status)}
                            {rider.verification_status !== 'APPROVED' && getVerificationBadge(rider.verification_status)}
                          </div>
                          <span className={`text-[10px] font-semibold ${rider.can_accept_orders ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                            {rider.can_accept_orders ? 'Ready for Orders' : 'Dispatch Paused'}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {rider.verification_status !== 'APPROVED' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/riders/verification?tab=${rider.verification_status === 'REJECTED' ? 'REJECTED' : 'PENDING'}`)
                              }}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                              title={`Review ${rider.verification_status} verification queue`}
                            >
                              <span className="material-symbols-outlined text-sm">fact_check</span>
                              <span>Review</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/riders/${rider.id}`)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            title="View Rider Profile & Documents"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
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
                            <span className="material-symbols-outlined text-base">{rider.status === 'BLOCKED' ? 'lock_open' : 'block'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600">search_off</span>
                        <p className="font-semibold text-sm">No couriers match your filters</p>
                        <p className="text-xs text-slate-400">Try adjusting your search criteria or clear the filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalRiders}
              startItem={startItem}
              endItem={endItem}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(size) => { setRowsPerPage(size); setCurrentPage(1) }}
            />
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default RiderManagementPage