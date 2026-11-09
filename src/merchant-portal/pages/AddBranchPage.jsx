import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MerchantPortalLayout from '../layouts/MerchantPortalLayout'
import {
  getMerchantById,
  loadStoredMerchants,
  updateMerchant,
  generateUUID,
} from '../../data/demoMerchants'

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

export default function AddBranchPage() {
  const { merchantId } = useParams()
  const navigate = useNavigate()

  const merchantsList = useMemo(() => loadStoredMerchants(), [])
  const merchant = useMemo(() => {
    if (merchantId) {
      const found = merchantsList.find((m) => m.id === merchantId || m.merchant_id === merchantId)
      if (found) return found
    }
    const withBranches = merchantsList.find((m) => Array.isArray(m.branches) && m.branches.length > 0)
    return withBranches || getMerchantById('m-002') || merchantsList[0]
  }, [merchantId, merchantsList])

  const existingBranches = useMemo(() => {
    if (!merchant) return []
    return Array.isArray(merchant.branches) ? merchant.branches : []
  }, [merchant])

  // New branch form state
  const [formData, setFormData] = useState({
    branch_name: `${merchant?.name || 'Merchant'} - Branch #${existingBranches.length + 1}`,
    is_main_branch: existingBranches.length === 0,
    address: 'Bole Sub-City, Near Atlas Junction, Addis Ababa',
    phone: '+251 91 123 4567',
    email: `branch${existingBranches.length + 1}@${(merchant?.name || 'merchant').toLowerCase().replace(/\s+/g, '')}.et`,
    manager_name: '',
    manager_phone: '',
    latitude: 9.0016,
    longitude: 38.7842,
    indoor_seats: 36,
    outdoor_seats: 12,
    schedule: createDefaultSchedule(),
  })

  const [formErrors, setFormErrors] = useState({})
  const [showGpsMap, setShowGpsMap] = useState(false)
  const [isFullscreenMap, setIsFullscreenMap] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }))
    }
  }

  const handleDayToggle = (dayKey) => {
    setFormData((prev) => {
      const sched = { ...prev.schedule }
      sched[dayKey] = {
        ...sched[dayKey],
        is_open: !sched[dayKey]?.is_open,
      }
      return { ...prev, schedule: sched }
    })
  }

  const handleDayTimeChange = (dayKey, field, val) => {
    setFormData((prev) => {
      const sched = { ...prev.schedule }
      sched[dayKey] = {
        ...sched[dayKey],
        [field]: val,
      }
      return { ...prev, schedule: sched }
    })
  }

  const validate = () => {
    const errors = {}
    if (!formData.branch_name.trim()) {
      errors.branch_name = 'Branch name is required'
    }
    if (!formData.address.trim()) {
      errors.address = 'Physical address is required'
    }
    if (!formData.latitude || isNaN(Number(formData.latitude))) {
      errors.latitude = 'Valid GPS latitude is required'
    }
    if (!formData.longitude || isNaN(Number(formData.longitude))) {
      errors.longitude = 'Valid GPS longitude is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    const newBranchId = generateUUID()
    const newBranch = {
      id: newBranchId,
      branch_name: formData.branch_name.trim(),
      is_main_branch: formData.is_main_branch,
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      manager_name: formData.manager_name.trim() || 'Store Manager',
      manager_phone: formData.manager_phone.trim() || formData.phone.trim(),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      indoor_seats: Number(formData.indoor_seats) || 0,
      outdoor_seats: Number(formData.outdoor_seats) || 0,
      is_open: true,
      opening_hours: formData.schedule?.monday?.open_time || '08:00 AM',
      closing_hours: formData.schedule?.monday?.close_time || '10:00 PM',
      schedule: formData.schedule,
    }

    // If marked as main branch, demote any previous main branch
    const updatedBranches = existingBranches.map((b) =>
      formData.is_main_branch ? { ...b, is_main_branch: false } : b
    )
    updatedBranches.push(newBranch)

    if (merchant) {
      updateMerchant(merchant.id, {
        branches: updatedBranches,
        locations: updatedBranches.length,
      })
    }

    setTimeout(() => {
      setIsSubmitting(false)
      navigate(`/portal/merchants/${merchant?.id || merchantId || ''}`, {
        state: { toast: `Branch "${formData.branch_name}" registered successfully!` },
      })
    }, 400)
  }

  const sidebarItems = useMemo(
    () => [
      { id: 'branches', label: 'Operating Branches', icon: 'store', badge: existingBranches.length },
      { id: 'add_branch', label: 'Add Branch', icon: 'add_business', badge: null },
      { id: 'details', label: 'Brand & Compliance', icon: 'verified', badge: null },
      { id: 'orders', label: 'Consolidated Orders', icon: 'receipt_long', badge: null },
    ],
    [existingBranches.length]
  )

  const handleSidebarTabChange = (tabId) => {
    if (tabId === 'branches' || tabId === 'details' || tabId === 'orders') {
      navigate(`/portal/merchants/${merchant?.id || ''}`)
    }
  }

  return (
    <MerchantPortalLayout
      portalType="merchant"
      activeTab="add_branch"
      setActiveTab={handleSidebarTabChange}
      sidebarItems={sidebarItems}
      merchant={merchant}
      breadcrumbMiddle="Operating Branches"
      breadcrumbCurrent="Add New Branch"
      operatorName="Selamawit Haile"
      operatorRole="Merchant Partner (Owner)"
      operatorEmail={merchant?.email || 'owner@merchant.et'}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-16 font-['Plus_Jakarta_Sans']">
        {/* Top Header Action Bar */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-200/80 pb-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/portal/merchants/${merchant?.id || ''}`)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
              title="Return to Branches list"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  Add New Branch
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                  {merchant?.name}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                Register a new physical outlet, designate managers, set coordinates, and define operating hours.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/portal/merchants/${merchant?.id || ''}`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition cursor-pointer disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>{isSubmitting ? 'Saving...' : 'Save & Register Branch'}</span>
            </button>
          </div>
        </section>

        {/* Fullscreen Map Modal */}
        {isFullscreenMap && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-md p-4 sm:p-8">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-t-2xl border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF6B35]">map</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Full Screen GPS Pinpoint: {formData.branch_name}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  ({formData.latitude}, {formData.longitude})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenMap(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-100 rounded-b-2xl overflow-hidden">
              <iframe
                title="Full screen GPS map"
                width="100%"
                height="100%"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(formData.longitude) - 0.02},${Number(formData.latitude) - 0.015},${Number(formData.longitude) + 0.02},${Number(formData.latitude) + 0.015}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                className="h-full w-full border-none"
              />
            </div>
          </div>
        )}

        {/* Form Card 1: Branch Details & Identification */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40 font-bold">
                <span className="material-symbols-outlined text-lg">storefront</span>
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Branch Identity</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Basic brand and operational identifiers</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_main_branch}
                onChange={(e) => handleFieldChange('is_main_branch', e.target.checked)}
                className="h-4 w-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">Set as Flagship / Main Branch</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Branch Outlet Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.branch_name}
                onChange={(e) => handleFieldChange('branch_name', e.target.value)}
                placeholder="e.g. Bole Medhanialem Flagship"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              {formErrors.branch_name && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{formErrors.branch_name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Branch Contact Hotline
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+251 91 123 4567"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Physical Street Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="e.g. Bole Sub-City, Namibia Street, Addis Ababa"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              {formErrors.address && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{formErrors.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Card 2: GPS Pinpoint Coordinates & Interactive Map */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40 font-bold">
                <span className="material-symbols-outlined text-lg">pin_drop</span>
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">GPS Coordinates & Navigation</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Ensures accurate courier dispatch and customer routing</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowGpsMap((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-xs transition cursor-pointer ${
                  showGpsMap
                    ? 'bg-[#FF6B35] text-white'
                    : 'border border-orange-200 bg-orange-50 text-[#FF6B35] hover:bg-orange-100 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {showGpsMap ? 'location_off' : 'pin_drop'}
                </span>
                <span>{showGpsMap ? 'Hide GPS Map' : 'Show GPS Map'}</span>
              </button>

              {showGpsMap && (
                <button
                  type="button"
                  onClick={() => setIsFullscreenMap(true)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
                  title="Expand to Full Screen"
                >
                  <span className="material-symbols-outlined text-sm">open_in_full</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Map Embed */}
          {showGpsMap && (
            <div className="overflow-hidden rounded-2xl border border-orange-200 bg-slate-50 p-2 dark:border-zinc-800 dark:bg-zinc-950/60 animate-in fade-in duration-200">
              <div className="h-64 sm:h-80 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-850">
                <iframe
                  title="GPS Pinpoint Map"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(formData.longitude) - 0.008},${Number(formData.latitude) - 0.005},${Number(formData.longitude) + 0.008},${Number(formData.latitude) + 0.005}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                  className="h-full w-full border-none"
                />
              </div>
              <div className="p-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                <span>Coordinates: {formData.latitude}, {formData.longitude}</span>
                <span className="text-[#FF6B35] font-semibold">Addis Ababa Hyperlocal Grid</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Latitude <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => handleFieldChange('latitude', e.target.value)}
                placeholder="9.0016"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              {formErrors.latitude && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{formErrors.latitude}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Longitude <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => handleFieldChange('longitude', e.target.value)}
                placeholder="38.7842"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              {formErrors.longitude && (
                <p className="mt-1 text-[11px] font-semibold text-rose-500">{formErrors.longitude}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form Card 3: Branch Management & Capacities */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40 font-bold">
              <span className="material-symbols-outlined text-lg">badge</span>
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Branch Leadership & Capacity</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Designated manager and seating specifications</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Branch Manager Name
              </label>
              <input
                type="text"
                value={formData.manager_name}
                onChange={(e) => handleFieldChange('manager_name', e.target.value)}
                placeholder="e.g. Dawit Haile"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Manager Direct Phone
              </label>
              <input
                type="text"
                value={formData.manager_phone}
                onChange={(e) => handleFieldChange('manager_phone', e.target.value)}
                placeholder="+251 91 876 5432"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Indoor Seating Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.indoor_seats}
                onChange={(e) => handleFieldChange('indoor_seats', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Outdoor Seating Capacity
              </label>
              <input
                type="number"
                min="0"
                value={formData.outdoor_seats}
                onChange={(e) => handleFieldChange('outdoor_seats', e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#FF6B35] focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
            </div>
          </div>
        </div>

        {/* Form Card 4: Weekly Operating Schedule */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40 font-bold">
              <span className="material-symbols-outlined text-lg">schedule</span>
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Operating Schedule</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Weekly opening and closing service hours</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DAYS_OF_WEEK.map((day) => {
              const dayInfo = formData.schedule?.[day.key] || {
                is_open: true,
                open_time: '08:00',
                close_time: '22:00',
              }
              return (
                <div
                  key={day.key}
                  className={`rounded-2xl border p-3.5 transition-all ${
                    dayInfo.is_open
                      ? 'border-slate-200 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-850/50'
                      : 'border-slate-200/50 bg-slate-100/40 opacity-60 dark:border-zinc-800/50 dark:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{day.label}</span>
                    <button
                      type="button"
                      onClick={() => handleDayToggle(day.key)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer transition ${
                        dayInfo.is_open
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                      }`}
                    >
                      {dayInfo.is_open ? 'Open' : 'Closed'}
                    </button>
                  </div>

                  {dayInfo.is_open && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Opens</span>
                        <input
                          type="time"
                          value={dayInfo.open_time}
                          onChange={(e) => handleDayTimeChange(day.key, 'open_time', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <span className="text-slate-400 text-xs mt-3">&ndash;</span>
                      <div className="flex-1">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Closes</span>
                        <input
                          type="time"
                          value={dayInfo.close_time}
                          onChange={(e) => handleDayTimeChange(day.key, 'close_time', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Submission Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => navigate(`/portal/merchants/${merchant?.id || ''}`)}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#e0531f] transition cursor-pointer disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-base">check</span>
            <span>{isSubmitting ? 'Registering Branch...' : 'Register Branch Outlet'}</span>
          </button>
        </div>
      </div>
    </MerchantPortalLayout>
  )
}
