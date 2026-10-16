import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import {
  getMerchantById,
  loadStoredMerchants,
  updateMerchant,
  generateUUID,
} from '../data/demoMerchants'

const DAYS_OF_WEEK = [
  { key: 'monday', short: 'Mon', label: 'Monday' },
  { key: 'tuesday', short: 'Tue', label: 'Tuesday' },
  { key: 'wednesday', short: 'Wed', label: 'Wednesday' },
  { key: 'thursday', short: 'Thu', label: 'Thursday' },
  { key: 'friday', short: 'Fri', label: 'Friday' },
  { key: 'saturday', short: 'Sat', label: 'Saturday' },
  { key: 'sunday', short: 'Sun', label: 'Sunday' },
]

const createDefaultSchedule = () => ({
  monday: { is_open: true, open_time: '08:00', close_time: '22:00' },
  tuesday: { is_open: true, open_time: '08:00', close_time: '22:00' },
  wednesday: { is_open: true, open_time: '08:00', close_time: '22:00' },
  thursday: { is_open: true, open_time: '08:00', close_time: '22:00' },
  friday: { is_open: true, open_time: '08:00', close_time: '23:00' },
  saturday: { is_open: true, open_time: '09:00', close_time: '23:00' },
  sunday: { is_open: true, open_time: '09:00', close_time: '21:00' },
})

const createDefaultBranch = (branchName = 'Branch', isMain = false) => ({
  id: generateUUID(),
  branch_name: branchName,
  is_main_branch: isMain,
  latitude: 9.0016,
  longitude: 38.7842,
  address: 'Bole Road, Near Medhanialem Mall, Addis Ababa',
  manager_name: '',
  email: '',
  phone_number: '',
  indoor_seats: 40,
  outdoor_seats: 15,
  schedule: createDefaultSchedule(),
})

export default function AddMerchantBranchPage() {
  const { merchantId } = useParams()
  const navigate = useNavigate()

  const merchantsList = useMemo(() => loadStoredMerchants(), [])
  const merchant = useMemo(() => {
    if (!merchantId) return null
    return (
      merchantsList.find((m) => m.id === merchantId || m.merchant_id === merchantId) ||
      getMerchantById(merchantId) ||
      null
    )
  }, [merchantId, merchantsList])

  // Get existing branches
  const existingBranches = useMemo(() => {
    if (!merchant) return []
    if (Array.isArray(merchant.branches) && merchant.branches.length > 0) {
      return merchant.branches
    }
    return [
      {
        id: generateUUID(),
        branch_name: merchant.branch_name || `${merchant.name} Main Branch`,
        is_main_branch: true,
        address: merchant.address || 'Central Commercial Boulevard, Addis Ababa',
        phone: merchant.phone || '+251 91 123 4567',
        phone_number: merchant.phone || '+251 91 123 4567',
        email: merchant.email || 'staff@merchant.et',
        latitude: typeof merchant.latitude === 'number' ? merchant.latitude : 9.0016,
        longitude: typeof merchant.longitude === 'number' ? merchant.longitude : 38.7842,
        manager_name: merchant.manager_name || 'Store Manager',
        manager_phone: merchant.manager_phone || '+251 91 876 5432',
        indoor_seats: merchant.indoor_seats || 40,
        outdoor_seats: merchant.outdoor_seats || 15,
        schedule: createDefaultSchedule(),
      },
    ]
  }, [merchant])

  // Branches list being edited on this page: starts with 1 new branch to configure
  const [branches, setBranches] = useState(() => [
    createDefaultBranch(
      `${merchant?.name || 'Merchant'} Branch ${(merchant?.branches?.length || 1) + 1}`,
      false
    ),
  ])

  const [activeGpsBranchIdx, setActiveGpsBranchIdx] = useState(null)
  const [fullscreenGpsBranchIdx, setFullscreenGpsBranchIdx] = useState(null)
  const [activeEditDay, setActiveEditDay] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [toastNotice, setToastNotice] = useState(null)

  const showNotification = (message, type = 'info') => {
    setToastNotice({ message, type })
    setTimeout(() => {
      setToastNotice((curr) => (curr?.message === message ? null : curr))
    }, 3500)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (fullscreenGpsBranchIdx !== null) setFullscreenGpsBranchIdx(null)
        if (activeEditDay !== null) setActiveEditDay(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenGpsBranchIdx, activeEditDay])

  const handleAddAnotherBranch = () => {
    const nextIdx = existingBranches.length + branches.length + 1
    const newBranch = createDefaultBranch(
      `${merchant?.name || 'Merchant'} Branch ${nextIdx}`,
      false
    )
    setBranches((prev) => [...prev, newBranch])
  }

  const handleRemoveBranch = (index) => {
    if (branches.length === 1) {
      showNotification('At least one branch must be added on this page.', 'warning')
      return
    }
    if (fullscreenGpsBranchIdx === index) setFullscreenGpsBranchIdx(null)
    if (activeGpsBranchIdx === index) setActiveGpsBranchIdx(null)
    setBranches((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleBranchChange = (index, field, value) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== index) return branch
        return { ...branch, [field]: value }
      })
    )
  }

  const handleSetMainBranch = (index) => {
    setBranches((prev) =>
      prev.map((branch, idx) => ({
        ...branch,
        is_main_branch: idx === index,
      }))
    )
  }

  const handleToggleGps = (branchIndex) => {
    setActiveGpsBranchIdx((prev) => (prev === branchIndex ? null : branchIndex))
  }

  const handleBranchDayToggle = (branchIndex, dayKey) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== branchIndex) return branch
        const currentSched = branch.schedule || createDefaultSchedule()
        const dayInfo = currentSched[dayKey] || { is_open: true, open_time: '08:00', close_time: '22:00' }
        return {
          ...branch,
          schedule: {
            ...currentSched,
            [dayKey]: {
              ...dayInfo,
              is_open: !dayInfo.is_open,
            },
          },
        }
      })
    )
  }

  const handleBranchDayTimeChange = (branchIndex, dayKey, field, value) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== branchIndex) return branch
        const currentSched = branch.schedule || createDefaultSchedule()
        const dayInfo = currentSched[dayKey] || { is_open: true, open_time: '08:00', close_time: '22:00' }
        return {
          ...branch,
          schedule: {
            ...currentSched,
            [dayKey]: {
              ...dayInfo,
              [field]: value,
            },
          },
        }
      })
    )
  }

  const handleApplyTimeToAllOpenDays = (branchIndex, sourceDayKey) => {
    const branch = branches[branchIndex]
    if (!branch?.schedule?.[sourceDayKey]) return
    const { open_time, close_time } = branch.schedule[sourceDayKey]
    setBranches((prev) =>
      prev.map((b, idx) => {
        if (idx !== branchIndex) return b
        const updated = { ...b.schedule }
        DAYS_OF_WEEK.forEach((d) => {
          if (updated[d.key]?.is_open) {
            updated[d.key] = { ...updated[d.key], open_time, close_time }
          }
        })
        return { ...b, schedule: updated }
      })
    )
    showNotification(`Synced ${open_time} - ${close_time} across all open days!`, 'info')
  }

  const handleSetQuickPreset = (branchIndex, preset) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== branchIndex) return branch
        const updated = { ...(branch.schedule || createDefaultSchedule()) }
        if (preset === 'everyday') {
          DAYS_OF_WEEK.forEach((d) => {
            updated[d.key] = {
              is_open: true,
              open_time: updated[d.key]?.open_time || '08:00',
              close_time: updated[d.key]?.close_time || '22:00',
            }
          })
        } else if (preset === 'weekdays_only') {
          DAYS_OF_WEEK.forEach((d) => {
            const isWeekend = d.key === 'saturday' || d.key === 'sunday'
            updated[d.key] = {
              is_open: !isWeekend,
              open_time: updated[d.key]?.open_time || '08:00',
              close_time: updated[d.key]?.close_time || '22:00',
            }
          })
        } else if (preset === 'weekends_only') {
          DAYS_OF_WEEK.forEach((d) => {
            const isWeekend = d.key === 'saturday' || d.key === 'sunday'
            updated[d.key] = {
              is_open: isWeekend,
              open_time: updated[d.key]?.open_time || '09:00',
              close_time: updated[d.key]?.close_time || '23:00',
            }
          })
        }
        return { ...branch, schedule: updated }
      })
    )
    showNotification(`Applied preset schedule!`, 'info')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errors = {}

    branches.forEach((branch, idx) => {
      if (!branch.branch_name || !branch.branch_name.trim()) {
        errors[`branch_${idx}_name`] = 'Branch name is required'
      }
      if (branch.latitude === '' || isNaN(Number(branch.latitude))) {
        errors[`branch_${idx}_lat`] = 'Valid latitude is required'
      }
      if (branch.longitude === '' || isNaN(Number(branch.longitude))) {
        errors[`branch_${idx}_lng`] = 'Valid longitude is required'
      }
    })

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      showNotification('Please fill in all required branch fields.', 'error')
      return
    }

    // Merge branches
    let combined = [...existingBranches]
    const hasAnyNewMain = branches.some((b) => b.is_main_branch)
    if (hasAnyNewMain) {
      combined = combined.map((b) => ({ ...b, is_main_branch: false }))
    }

    const formattedNewBranches = branches.map((b) => ({
      ...b,
      latitude: Number(b.latitude) || 9.0016,
      longitude: Number(b.longitude) || 38.7842,
      indoor_seats: Number(b.indoor_seats) || 40,
      outdoor_seats: Number(b.outdoor_seats) || 15,
      is_open: true,
      accepts_orders: true,
    }))

    const finalBranches = [...combined, ...formattedNewBranches]

    updateMerchant(merchant.id, {
      branches: finalBranches,
      locations: finalBranches.length,
    })

    navigate(`/merchants/${merchant.id}`, {
      state: { toastMessage: `${formattedNewBranches.length} new branch(es) added successfully!` },
    })
  }

  if (!merchant) {
    return (
      <MainLayout
        activeMenuKey="merchantManagement"
        breadcrumbParent="Dashboard"
        breadcrumbMiddle="Merchants"
        breadcrumbCurrent="Merchant Not Found"
      >
        <div className="mx-auto max-w-xl py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
            <span className="material-symbols-outlined text-4xl">storefront</span>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
            Merchant Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            The merchant you are trying to add a branch to does not exist.
          </p>
          <div className="mt-6">
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

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle={merchant.name}
      breadcrumbCurrent="Add New Branch"
    >
      <div className="space-y-6 pb-20">
        {/* Toast Notice */}
        {toastNotice && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in ${
              toastNotice.type === 'error'
                ? 'bg-rose-600'
                : toastNotice.type === 'warning'
                ? 'bg-amber-600'
                : 'bg-slate-900 dark:bg-zinc-100 dark:text-zinc-900'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toastNotice.type === 'error' ? 'error' : toastNotice.type === 'warning' ? 'warning' : 'check_circle'}
            </span>
            <span>{toastNotice.message}</span>
          </div>
        )}

        {/* Fullscreen Map Modal */}
        {fullscreenGpsBranchIdx !== null && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-4 sm:p-6 text-white backdrop-blur-md animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[#FF6B35]">map</span>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">
                    Full Screen GPS Pinpoint Map
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Branch:{' '}
                    {branches[fullscreenGpsBranchIdx]?.branch_name ||
                      `Branch #${fullscreenGpsBranchIdx + 1}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFullscreenGpsBranchIdx(null)}
                className="flex items-center gap-1 rounded-xl bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                <span>Close Map</span>
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <iframe
                title="Full Screen GPS Location"
                width="100%"
                height="100%"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(Number(branches[fullscreenGpsBranchIdx]?.longitude) || 38.7842) - 0.015},${(Number(branches[fullscreenGpsBranchIdx]?.latitude) || 9.0016) - 0.01},${(Number(branches[fullscreenGpsBranchIdx]?.longitude) || 38.7842) + 0.015},${(Number(branches[fullscreenGpsBranchIdx]?.latitude) || 9.0016) + 0.01}&layer=mapnik&marker=${Number(branches[fullscreenGpsBranchIdx]?.latitude) || 9.0016},${Number(branches[fullscreenGpsBranchIdx]?.longitude) || 38.7842}`}
                className="h-full w-full border-none"
              />
            </div>
          </div>
        )}

        {/* Top Header */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/merchants/${merchant.id}`)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              title="Back to Merchant Details"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-[#FF6B35] dark:bg-orange-950/60 dark:text-orange-400">
                  {merchant.name}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  Current Locations: {existingBranches.length}
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-zinc-100">
                Add New Merchant Branch
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Configure new branch location, manager staff credentials, working hours, and GPS coordinates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/merchants/${merchant.id}`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Save & Register Branch</span>
            </button>
          </div>
        </section>

        {/* The Exact Merchant Branches & Managers Card (inherited from AddMerchantPage) */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                  <span className="material-symbols-outlined text-lg">apartment</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Merchant Branches & Managers ({branches.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Configure branch locations, manager staff contacts (email, contact number), and GPS navigation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAnotherBranch}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 ring-1 ring-blue-200 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:ring-blue-900/60 dark:text-blue-400"
              >
                <span className="material-symbols-outlined text-sm">add_business</span>
                Add Branch
              </button>
            </div>

            <div className="mt-5 space-y-6">
              {branches.map((branch, index) => (
                <div
                  key={branch.id || index}
                  className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4.5 transition-all dark:border-zinc-800 dark:bg-zinc-850/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-zinc-700/70">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-zinc-700 dark:text-zinc-300">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {branch.branch_name || `Branch #${index + 1}`}
                      </span>
                      {branch.is_main_branch ? (
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Primary Branch
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetMainBranch(index)}
                          className="text-[10px] font-semibold text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {branches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBranch(index)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 transition"
                          title="Remove branch"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* SUB-CARD 1: Branch Location & GPS (Map below GPS button)  */}
                  {/* ======================================================== */}
                  <div className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-[#FF6B35]">location_on</span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          Branch Location & Coordinates
                        </h4>
                      </div>

                      {/* GPS Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleGps(index)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition ${
                          activeGpsBranchIdx === index
                            ? 'bg-[#FF6B35] text-white ring-2 ring-orange-300 dark:ring-orange-800'
                            : 'border border-orange-200 bg-orange-50 text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400'
                        }`}
                        title="Toggle live GPS Map directly below"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {activeGpsBranchIdx === index ? 'location_off' : 'pin_drop'}
                        </span>
                        <span>{activeGpsBranchIdx === index ? 'Hide GPS Map' : 'GPS'}</span>
                      </button>
                    </div>

                    {/* Map directly below the GPS button */}
                    {activeGpsBranchIdx === index && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-orange-200 bg-orange-50/20 p-3 shadow-2xs dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-[#FF6B35]">map</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              Live GPS Pinpoint: {branch.branch_name || `Branch #${index + 1}`}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                              ({branch.latitude || 9.0016}, {branch.longitude || 38.7842})
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setFullscreenGpsBranchIdx(index)}
                              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition"
                              title="Open full screen GPS map taking whole page"
                            >
                              <span className="material-symbols-outlined text-sm">open_in_full</span>
                              <span>Full Screen</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveGpsBranchIdx(null)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                              title="Close map"
                            >
                              <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                          </div>
                        </div>

                        <div className="h-60 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-800">
                          <iframe
                            title={`GPS map for branch ${index + 1}`}
                            width="100%"
                            height="100%"
                            loading="lazy"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${(Number(branch.longitude) || 38.7842) - 0.008},${(Number(branch.latitude) || 9.0016) - 0.005},${(Number(branch.longitude) || 38.7842) + 0.008},${(Number(branch.latitude) || 9.0016) + 0.005}&layer=mapnik&marker=${Number(branch.latitude) || 9.0016},${Number(branch.longitude) || 38.7842}`}
                            className="h-full w-full border-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Location & Coordinate Inputs */}
                    <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Branch Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={branch.branch_name}
                          onChange={(e) => handleBranchChange(index, 'branch_name', e.target.value)}
                          placeholder="e.g. Bole Medhanialem Flagship"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                        {formErrors[`branch_${index}_name`] && (
                          <p className="mt-1 text-[10px] text-rose-500">{formErrors[`branch_${index}_name`]}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Physical Address
                        </label>
                        <input
                          type="text"
                          value={branch.address}
                          onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                          placeholder="e.g. Bole Road, Near Medhanialem Mall, Addis Ababa"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Latitude <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={branch.latitude}
                          onChange={(e) => handleBranchChange(index, 'latitude', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                        {formErrors[`branch_${index}_lat`] && (
                          <p className="mt-1 text-[10px] text-rose-500">{formErrors[`branch_${index}_lat`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Longitude <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={branch.longitude}
                          onChange={(e) => handleBranchChange(index, 'longitude', e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                        {formErrors[`branch_${index}_lng`] && (
                          <p className="mt-1 text-[10px] text-rose-500">{formErrors[`branch_${index}_lng`]}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* SUB-CARD 2: Manager & Staff Personal Data                 */}
                  {/* ======================================================== */}
                  <div className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-zinc-800">
                      <span className="material-symbols-outlined text-sm text-indigo-500">badge</span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          Manager & Staff Personal Data
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                          Staff contact credentials and personal details for this branch
                        </p>
                      </div>
                    </div>

                    <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Branch Manager Name
                        </label>
                        <input
                          type="text"
                          value={branch.manager_name || ''}
                          onChange={(e) => handleBranchChange(index, 'manager_name', e.target.value)}
                          placeholder="e.g. Dawit Haile"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          email - Staff email <span className="font-semibold text-emerald-600 dark:text-emerald-400">(indexed)</span>
                        </label>
                        <input
                          type="email"
                          value={branch.email || ''}
                          onChange={(e) => handleBranchChange(index, 'email', e.target.value)}
                          placeholder="staff.manager@merchant.et"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          phone_number - Contact number
                        </label>
                        <input
                          type="tel"
                          value={branch.phone_number || ''}
                          onChange={(e) => handleBranchChange(index, 'phone_number', e.target.value)}
                          placeholder="+251 91 123 4567"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ======================================================== */}
                  {/* SUB-CARD 3: Operating Days & Hours                        */}
                  {/* ======================================================== */}
                  <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 dark:opacity-10" />

                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
                          <span className="material-symbols-outlined text-base">calendar_month</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold tracking-tight text-slate-800 dark:text-zinc-200">
                            Operating Days & Working Hours
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Click any card to expand and adjust hours
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {[
                          { label: 'All 7 Days', preset: 'everyday' },
                          { label: 'Mon – Fri', preset: 'weekdays_only' },
                          { label: 'Weekends', preset: 'weekends_only' },
                        ].map((btn) => (
                          <button
                            key={btn.preset}
                            type="button"
                            onClick={() => {
                              setActiveEditDay(null)
                              handleSetQuickPreset(index, btn.preset)
                            }}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 transition hover:border-[#FF6B35] hover:text-[#FF6B35] active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-[#FF6B35] dark:hover:text-[#FF6B35]"
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative z-10 mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
                      {DAYS_OF_WEEK.map((day) => {
                        const sched = (branch.schedule && branch.schedule[day.key]) || {
                          is_open: true,
                          open_time: '08:00',
                          close_time: '22:00',
                        }
                        const isOpen = Boolean(sched.is_open)
                        const dayId = `${index}_${day.key}`
                        const isEditing = activeEditDay === dayId

                        return (
                          <div
                            key={day.key}
                            onClick={() => {
                              if (isOpen && !isEditing) setActiveEditDay(dayId)
                            }}
                            className={`group/day relative flex flex-col justify-between rounded-xl border transition-all duration-300 ease-out ${
                              isEditing
                                ? 'z-20 border-emerald-500 bg-emerald-50/70 p-3 shadow-lg ring-2 ring-emerald-500/20 sm:col-span-2 lg:col-span-2 dark:border-emerald-500 dark:bg-emerald-950/30'
                                : isOpen
                                ? 'cursor-pointer border-emerald-200/90 bg-emerald-50/30 p-2 shadow-2xs hover:-translate-y-0.5 hover:border-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                                : 'border-slate-200 bg-slate-50/70 p-2 opacity-50 dark:border-zinc-800 dark:bg-zinc-900/40'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 dark:border-zinc-800">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`font-mono text-xs font-black tracking-wide uppercase ${
                                    isOpen
                                      ? 'text-emerald-700 dark:text-emerald-400'
                                      : 'text-slate-400 dark:text-zinc-500'
                                  }`}
                                >
                                  {day.short}
                                </span>

                                {isEditing && (
                                  <span className="animate-pulse rounded bg-emerald-600 px-1.5 py-0.2 font-mono text-[8px] font-bold text-white uppercase">
                                    EDITING
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {isEditing && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setActiveEditDay(null)
                                    }}
                                    className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-600 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                                    title="Done editing"
                                  >
                                    Done
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (isOpen && isEditing) setActiveEditDay(null)
                                    handleBranchDayToggle(index, day.key)
                                  }}
                                  className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 focus:outline-hidden ${
                                    isOpen ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                                  }`}
                                  title={isOpen ? 'Click to close day' : 'Click to open day'}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                                      isOpen ? 'translate-x-3.5' : 'translate-x-0.5'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 flex flex-1 flex-col justify-between">
                              {isOpen ? (
                                isEditing ? (
                                  <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800">
                                        <span className="block font-mono text-[9px] font-bold text-slate-400 uppercase">
                                          Opens At
                                        </span>
                                        <input
                                          type="time"
                                          value={sched.open_time || '08:00'}
                                          onChange={(e) =>
                                            handleBranchDayTimeChange(index, day.key, 'open_time', e.target.value)
                                          }
                                          className="mt-0.5 w-full bg-transparent font-mono text-xs font-bold text-slate-800 outline-hidden dark:text-zinc-100"
                                        />
                                      </div>

                                      <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800">
                                        <span className="block font-mono text-[9px] font-bold text-slate-400 uppercase">
                                          Closes At
                                        </span>
                                        <input
                                          type="time"
                                          value={sched.close_time || '22:00'}
                                          onChange={(e) =>
                                            handleBranchDayTimeChange(index, day.key, 'close_time', e.target.value)
                                          }
                                          className="mt-0.5 w-full bg-transparent font-mono text-xs font-bold text-slate-800 outline-hidden dark:text-zinc-100"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleApplyTimeToAllOpenDays(index, day.key)}
                                        className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[9px] font-bold text-slate-600 transition hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400"
                                      >
                                        <span className="material-symbols-outlined text-xs">sync</span>
                                        Sync to all days
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setActiveEditDay(null)}
                                        className="rounded-md bg-emerald-600 px-2.5 py-1 font-mono text-[9px] font-bold text-white shadow-xs transition hover:bg-emerald-700"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex min-h-[58px] flex-col justify-between py-0.5">
                                    <div className="flex flex-col items-center justify-center rounded-lg bg-white/70 py-1.5 shadow-2xs dark:bg-zinc-800/60">
                                      <span className="font-mono text-[11px] font-bold tracking-tight text-slate-700 dark:text-zinc-200">
                                        {sched.open_time || '08:00'} - {sched.close_time || '22:00'}
                                      </span>
                                    </div>
                                    <span className="pt-1 text-center font-mono text-[8px] font-semibold text-emerald-600 opacity-80 group-hover/day:opacity-100 dark:text-emerald-400">
                                      Click to adjust
                                    </span>
                                  </div>
                                )
                              ) : (
                                <div className="flex min-h-[58px] items-center justify-center">
                                  <span className="rounded-md border border-slate-200/60 bg-slate-100/60 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-400 uppercase dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-500">
                                    Closed
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => navigate(`/merchants/${merchant.id}`)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>Save Branch</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
