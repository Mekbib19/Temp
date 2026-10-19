import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import {
  getMerchantById,
  loadStoredMerchants,
  updateMerchant,
  deleteMerchant,
} from '../data/demoMerchants'
import { loadStoredCategories } from '../data/demoCategories'
import { loadStoredCuisines } from '../data/demoCuisines'

const SAMPLE_ORDERS = [
  {
    id: '#ORD-8821',
    date: 'Today, 2:15 PM',
    customer: 'Sarah Jenkins',
    items: '2x Signature Combo, 1x Truffle Fries',
    total: '$38.50',
    status: 'Delivered',
    statusClass: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
  {
    id: '#ORD-8819',
    date: 'Today, 1:40 PM',
    customer: 'Michael Chang',
    items: '1x Family Feast Box, 3x Craft Drinks',
    total: '$64.20',
    status: 'In Kitchen',
    statusClass: 'bg-orange-50 text-[#FF6B35] ring-orange-500/20 dark:bg-orange-950/40 dark:text-orange-400',
  },
  {
    id: '#ORD-8814',
    date: 'Today, 12:55 PM',
    customer: 'Elena Rostova',
    items: '1x Chef Special Artisan Platter',
    total: '$29.00',
    status: 'Out for Delivery',
    statusClass: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
  },
  {
    id: '#ORD-8802',
    date: 'Yesterday, 8:20 PM',
    customer: 'David K.',
    items: '2x Double Delight, 2x Cold Brew',
    total: '$42.00',
    status: 'Completed',
    statusClass: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
  },
]

export default function MerchantDetailsPage() {
  const { merchantId } = useParams()
  const navigate = useNavigate()

  const [merchantsList, setMerchantsList] = useState(() => loadStoredMerchants())
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedBranchIndex, setSelectedBranchIndex] = useState(0)
  const [toastMessage, setToastMessage] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Find merchant
  const merchant = useMemo(() => {
    if (!merchantId) return null
    return (
      merchantsList.find((m) => m.id === merchantId || m.merchant_id === merchantId) ||
      getMerchantById(merchantId) ||
      null
    )
  }, [merchantId, merchantsList])

  const categories = useMemo(() => loadStoredCategories(), [])
  const cuisines = useMemo(() => loadStoredCuisines(), [])

  // Resolve Category & Cuisine names and objects
  const categoryObj = useMemo(() => {
    if (!merchant) return null
    if (merchant.category_id) {
      const c = categories.find((cat) => cat.id === merchant.category_id)
      if (c) return c
    }
    if (merchant.category_name) {
      const c = categories.find((cat) => cat.name.toLowerCase() === merchant.category_name.toLowerCase())
      if (c) return c
    }
    return null
  }, [merchant, categories])

  const assignedCuisines = useMemo(() => {
    if (!merchant) return []
    const ids = Array.isArray(merchant.cuisine_ids) ? merchant.cuisine_ids : []
    if (ids.length > 0) {
      return cuisines.filter((c) => ids.includes(c.id))
    }
    if (merchant.cuisine_id) {
      const single = cuisines.filter((c) => c.id === merchant.cuisine_id)
      if (single.length > 0) return single
    }
    if (merchant.cuisine_name) {
      const names = merchant.cuisine_name.split(',').map((s) => s.trim().toLowerCase())
      const matched = cuisines.filter((c) => names.includes(c.name.toLowerCase()))
      if (matched.length > 0) return matched
    }
    return []
  }, [merchant, cuisines])

  // Branches list
  const branches = useMemo(() => {
    if (!merchant) return []
    if (Array.isArray(merchant.branches) && merchant.branches.length > 0) {
      return merchant.branches
    }
    return [
      {
        id: 'branch-primary',
        branch_name: merchant.branch_name || `${merchant.name} Main Branch`,
        is_main_branch: true,
        address: merchant.address || 'Central Commercial Boulevard, Addis Ababa',
        phone: merchant.phone || '+251 91 123 4567',
        latitude: typeof merchant.latitude === 'number' ? merchant.latitude : 9.0016,
        longitude: typeof merchant.longitude === 'number' ? merchant.longitude : 38.7842,
        manager_name: merchant.manager_name || 'Abebe Bikila',
        manager_phone: merchant.manager_phone || '+251 91 876 5432',
        indoor_seats: merchant.indoor_seats || 40,
        outdoor_seats: merchant.outdoor_seats || 15,
        is_open: merchant.is_open !== undefined ? Boolean(merchant.is_open) : true,
        accepts_orders: merchant.accepts_orders !== undefined ? Boolean(merchant.accepts_orders) : true,
        opening_hours: merchant.opening_hours || '08:00 AM',
        closing_hours: merchant.closing_hours || '10:00 PM',
      },
    ]
  }, [merchant])

  const currentBranch = branches[selectedBranchIndex] || branches[0]

  // Map Embed URL
  const mapData = useMemo(() => {
    const lat = Number(currentBranch?.latitude ?? 9.0016)
    const lng = Number(currentBranch?.longitude ?? 38.7842)
    const validLat = Number.isFinite(lat) ? lat : 9.0016
    const validLng = Number.isFinite(lng) ? lng : 38.7842
    const bbox = `${validLng - 0.008},${validLat - 0.005},${validLng + 0.008},${validLat + 0.005}`
    return {
      lat: validLat,
      lng: validLng,
      src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${validLat},${validLng}`,
      directionsUrl: `https://www.google.com/maps?q=${validLat},${validLng}`,
    }
  }, [currentBranch?.latitude, currentBranch?.longitude])

  const handleToggleStatus = () => {
    if (!merchant) return
    const currentStatus = (merchant.status || 'ACTIVE').toUpperCase()
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    updateMerchant(merchant.id, { status: nextStatus })
    setMerchantsList(loadStoredMerchants())
    showToast(`Merchant status changed to ${nextStatus}`)
  }

  const handleDeleteMerchantConfirm = () => {
    if (!merchant) return
    deleteMerchant(merchant.id)
    navigate('/restaurants', {
      state: { toastMessage: `Merchant "${merchant.name}" was successfully removed.` },
    })
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text)
    showToast(`${label} copied to clipboard!`)
  }

  if (!merchant) {
    return (
      <MainLayout
        activeMenuKey="merchantManagement"
        breadcrumbParent="Dashboard"
        breadcrumbMiddle="Merchants"
        breadcrumbCurrent="Merchant Not Found"
      >
        <div className="mx-auto max-w-2xl py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
            <span className="material-symbols-outlined text-4xl">storefront</span>
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
            Merchant Not Found
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            The requested merchant profile could not be located in the local storage. It may have been deleted.
          </p>
          <div className="mt-6 flex justify-center gap-3">
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

  const rawStatus = (merchant.status || 'ACTIVE').toUpperCase()
  const isActive = rawStatus === 'ACTIVE'

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Merchants"
      breadcrumbCurrent={merchant.name}
    >
      <div className="space-y-6 pb-16">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl dark:bg-zinc-100 dark:text-zinc-900 animate-fade-in">
            <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
          >
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-zinc-100">
                Delete Merchant?
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Are you sure you want to remove <span className="font-bold text-slate-700 dark:text-zinc-200">{merchant.name}</span>? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteMerchantConfirm}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  Delete Merchant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Action Bar */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/restaurants')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Back to Merchants list"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                  {merchant.name}
                </h1>
                {/* Status Toggle Badge */}
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  title={`Status: ${rawStatus}. Click to toggle.`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {rawStatus}
                </button>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Merchant Partner Profile & Detailed Operations Console
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/restaurants/${merchant.id}/edit`)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Merchant
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
              title="Delete Merchant"
            >
              <span className="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
        </section>

        {/* Hero Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          {/* Banner Image or Gradient Cover */}
          <div className="relative h-44 w-full overflow-hidden bg-gradient-to-r from-orange-400 via-amber-500 to-rose-400 sm:h-52">
            {merchant.cover_image_url || merchant.banner_url || merchant.cover ? (
              <img
                src={merchant.cover_image_url || merchant.banner_url || merchant.cover}
                alt={`${merchant.name} cover`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center opacity-30">
                <span className="material-symbols-outlined text-9xl text-white">storefront</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Quick Badges in Header */}
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 backdrop-blur-md dark:bg-zinc-900/90 dark:text-zinc-200">
                <span className="material-symbols-outlined text-sm text-[#FF6B35]">storefront</span>
                {merchant.type || 'Restaurant & Dining'}
              </span>
              {merchant.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur-md">
                  ★ Featured
                </span>
              )}
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="relative px-6 pb-6 pt-0 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              {/* Brand Logo Avatar */}
              <div className="-mt-14 relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg dark:border-zinc-900 sm:h-32 sm:w-32">
                <img
                  src={merchant.logo_url || merchant.logo}
                  alt={merchant.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF6B35] text-white shadow-sm">
                  <span className="material-symbols-outlined text-xs">verified</span>
                </div>
              </div>

              {/* Title & Classification Tags */}
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50">
                    {merchant.name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300">
                  {/* Category Badge */}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 font-bold text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                    <span className="material-symbols-outlined text-sm">category</span>
                    Category: {merchant.category_name || categoryObj?.name || 'General Category'}
                  </span>


                  {/* Locations */}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                    <span className="material-symbols-outlined text-sm">pin_drop</span>
                    {branches.length} {branches.length === 1 ? 'branch' : 'branches'}
                  </span>
                </div>

                {/* Cuisine Tags Bar */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Cuisines:
                  </span>
                  {assignedCuisines.length > 0 ? (
                    assignedCuisines.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      >
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="h-3.5 w-3.5 object-contain" />
                        ) : (
                          <span className="material-symbols-outlined text-[13px] text-amber-500">
                            {c.icon || 'restaurant'}
                          </span>
                        )}
                        {c.name}
                      </span>
                    ))
                  ) : merchant.cuisine_name ? (
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      <span className="material-symbols-outlined text-[13px] text-amber-500">restaurant</span>
                      {merchant.cuisine_name}
                    </span>
                  ) : (
                    <span className="text-xs italic text-slate-400">No cuisines assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Stats Quick Cards */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Operating Branches
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                <span className="material-symbols-outlined text-base">store</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              {branches.length}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              {branches.filter((b) => b.is_open !== false).length} currently open
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Fulfillment ETA
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                <span className="material-symbols-outlined text-base">moped</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              {merchant.eta_min || 20}-{merchant.eta_max || 40} <span className="text-sm font-semibold">min</span>
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Average dispatch time
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Commission Rate
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-base">percent</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              {merchant.commission_rate ?? 15}%
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Contracted partner fee
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Accepts Orders
              </span>
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                <span className="material-symbols-outlined text-base">shopping_bag</span>
              </span>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
              {merchant.accepts_orders !== false ? 'Live' : 'Paused'}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Online checkout enabled
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 dark:border-zinc-800">
          <nav className="flex space-x-6">
            {[
              { id: 'overview', label: 'Overview & Story', icon: 'info' },
              { id: 'branches', label: `Branches & GPS (${branches.length})`, icon: 'pin_drop' },
              { id: 'cuisines', label: `Category & Cuisines (${assignedCuisines.length})`, icon: 'restaurant' },
              { id: 'orders', label: 'Recent Orders', icon: 'receipt_long' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-3.5 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Bio & Concept */}
            <div className="space-y-6 lg:col-span-8">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                  <span className="material-symbols-outlined text-base text-[#FF6B35]">description</span>
                  Merchant Concept & Bio
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                  {merchant.description ||
                    'No culinary concept description has been specified yet. Edit merchant details to describe the culinary philosophy, signature recipes, and dining experience.'}
                </p>

                {merchant.dietary_flags && (
                  <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                      Dietary & Specialty Flags
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {merchant.dietary_flags}
                    </p>
                  </div>
                )}
              </div>

              {/* Primary Branch Contact & Operating Hours */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-zinc-100">
                  <span className="material-symbols-outlined text-base text-blue-600">contact_phone</span>
                  Primary Branch Information
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Main Location Address</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.address || merchant.address || 'Address not specified'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Branch Phone</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.phone || merchant.phone || '+251 91 123 4567'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Branch Manager</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.manager_name || 'Designated Store Manager'}
                    </p>
                    {currentBranch.manager_phone && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">{currentBranch.manager_phone}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Operating Hours</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.opening_hours || '08:00 AM'} - {currentBranch.closing_hours || '10:00 PM'}
                    </p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {currentBranch.is_open !== false ? '● Open Now' : '○ Closed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Record Metadata */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  System Identifiers & Metadata
                </h3>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">System UUID</span>
                    <p className="mt-0.5 font-mono text-slate-700 dark:text-zinc-300 break-all select-all">
                      {merchant.id}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">Merchant URL Slug</span>
                    <p className="mt-0.5 font-mono font-semibold text-slate-800 dark:text-zinc-200">
                      /{merchant.slug || merchant.name.toLowerCase().replace(/\s+/g, '-')}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">Created Date</span>
                    <p className="mt-0.5 text-slate-700 dark:text-zinc-300">
                      {merchant.created_at ? new Date(merchant.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">Last Modified</span>
                    <p className="mt-0.5 text-slate-700 dark:text-zinc-300">
                      {merchant.updated_at ? new Date(merchant.updated_at).toLocaleString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Branches & GPS Geolocation */}
        {activeTab === 'branches' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Branch List */}
            <div className="space-y-4 lg:col-span-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Select Branch ({branches.length})
              </h3>
              {branches.map((b, idx) => {
                const isSelected = selectedBranchIndex === idx
                return (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={() => setSelectedBranchIndex(idx)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-[#FF6B35] bg-orange-50/40 ring-1 ring-[#FF6B35]/40 shadow-xs dark:bg-orange-950/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-[#FF6B35]">storefront</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {b.branch_name}
                        </h4>
                      </div>
                      {b.is_main_branch && (
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          Main Branch
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 line-clamp-1">
                      {b.address || 'Address not set'}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
                      <span>{Number(b.latitude ?? 9.0016).toFixed(4)}, {Number(b.longitude ?? 38.7842).toFixed(4)}</span>
                      <span className="font-sans font-semibold text-slate-700 dark:text-zinc-300">
                        {b.indoor_seats || 40} seats
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Right: Selected Branch Full Map & Info */}
            <div className="space-y-6 lg:col-span-7">
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="border-b border-slate-100 p-4 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {currentBranch.branch_name} Location Map
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Coordinates: {Number(currentBranch.latitude || 9.0016).toFixed(6)},{' '}
                      {Number(currentBranch.longitude || 38.7842).toFixed(6)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${currentBranch.latitude || 9.0016}, ${currentBranch.longitude || 38.7842}`,
                          'Coordinates'
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      Copy Coordinates
                    </button>
                    <a
                      href={mapData.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#FF6B35] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#e0531f]"
                    >
                      <span>Google Maps</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </div>
                </div>

                <div className="h-72 w-full bg-slate-100 dark:bg-zinc-800">
                  <iframe
                    title="Branch Map Location"
                    src={mapData.src}
                    className="h-full w-full border-0"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Indoor Seats</span>
                    <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                      {currentBranch.indoor_seats || 40} seats
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Outdoor Seats</span>
                    <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                      {currentBranch.outdoor_seats || 15} seats
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Hours</span>
                    <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                      {currentBranch.opening_hours || '08:00 AM'} - {currentBranch.closing_hours || '10:00 PM'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Orders</span>
                    <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {currentBranch.accepts_orders !== false ? 'Accepting' : 'Paused'}
                    </p>
                  </div>
                </div>

                {/* Weekly Operating Days Schedule Cards */}
                {currentBranch.schedule && (
                  <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
                    <div className="mb-2.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-amber-500">schedule</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Weekly Operating Schedule
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                      {[
                        { key: 'monday', label: 'Mon' },
                        { key: 'tuesday', label: 'Tue' },
                        { key: 'wednesday', label: 'Wed' },
                        { key: 'thursday', label: 'Thu' },
                        { key: 'friday', label: 'Fri' },
                        { key: 'saturday', label: 'Sat' },
                        { key: 'sunday', label: 'Sun' },
                      ].map((d) => {
                        const dayData = currentBranch.schedule?.[d.key] || { is_open: true, open_time: '08:00', close_time: '22:00' }
                        const isOpen = Boolean(dayData.is_open)
                        return (
                          <div
                            key={d.key}
                            className={`rounded-xl border p-2 text-center transition ${
                              isOpen
                                ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                                : 'border-slate-200 bg-slate-100/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-800/20'
                            }`}
                          >
                            <span className="block text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                              {d.label}
                            </span>
                            <span
                              className={`mt-0.5 inline-block rounded px-1.5 py-0.2 text-[9px] font-bold ${
                                isOpen
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                              }`}
                            >
                              {isOpen ? 'Open' : 'Closed'}
                            </span>
                            {isOpen && (
                              <p className="mt-1 font-mono text-[10px] text-slate-600 dark:text-zinc-400">
                                {dayData.open_time} - {dayData.close_time}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Category & Cuisines */}
        {activeTab === 'cuisines' && (
          <div className="space-y-6">
            {/* Category Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                  <span className="material-symbols-outlined text-2xl">category</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Primary Category: {categoryObj?.name || merchant.category_name || 'General Category'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Merchant Type: {merchant.type || 'Restaurant & Dining'}
                  </p>
                </div>
              </div>
              {categoryObj?.description && (
                <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-zinc-300">
                  {categoryObj.description}
                </p>
              )}
            </div>

            {/* Assigned Cuisines Grid */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">restaurant</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Assigned Cuisine Types ({assignedCuisines.length})
                  </h3>
                </div>
                <Link
                  to={`/restaurants/${merchant.id}/edit`}
                  className="text-xs font-bold text-[#FF6B35] hover:underline"
                >
                  Edit Cuisines
                </Link>
              </div>

              {assignedCuisines.length > 0 ? (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {assignedCuisines.map((cuisine) => (
                    <div
                      key={cuisine.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-[#FF6B35]/40 hover:bg-orange-50/30 dark:border-zinc-800 dark:bg-zinc-800/40"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-amber-500 shadow-2xs dark:bg-zinc-900 overflow-hidden">
                          {cuisine.image ? (
                            <img
                              src={cuisine.image}
                              alt={cuisine.name}
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-xl">
                              {cuisine.icon || 'restaurant'}
                            </span>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {cuisine.name}
                          </h4>
                          <span className="font-mono text-[10px] text-slate-400">
                            /{cuisine.slug}
                          </span>
                          {cuisine.description && (
                            <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 dark:text-zinc-400">
                              {cuisine.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                  No specific cuisines mapped to this merchant. Click &ldquo;Edit Cuisines&rdquo; to configure checkboxes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Recent Orders */}
        {activeTab === 'orders' && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="border-b border-slate-100 p-5 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                Recent Orders Received by {merchant.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Live order stream and fulfillment statuses for this partner.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                  <tr>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Items Summary</th>
                    <th className="px-5 py-3.5 text-right">Total</th>
                    <th className="px-5 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {SAMPLE_ORDERS.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                      <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-[#FF6B35]">
                        {order.id}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800 dark:text-zinc-200">
                        {order.customer}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-zinc-400">
                        {order.date}
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-zinc-300">
                        {order.items}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-900 dark:text-zinc-100">
                        {order.total}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ${order.statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
