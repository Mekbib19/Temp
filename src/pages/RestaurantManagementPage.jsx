import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { formatLatestUpdate } from '../utils/format'
import {
  loadStoredMerchants,
  saveStoredMerchants,
  MERCHANT_TYPES,
  getCategoryMeta,
} from '../data/demoMerchants'

const RestaurantManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [brands, setBrands] = useState(() => loadStoredMerchants())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name_asc')

  // Pagination states matching Category & Cuisine pages
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Expandable description IDs
  const [expandedDescIds, setExpandedDescIds] = useState(() => new Set())

  // View Details modal state
  const [selectedBrandForView, setSelectedBrandForView] = useState(null)

  // Delete modal state
  const [brandToDelete, setBrandToDelete] = useState(null)

  // Toast
  const [toastMessage, setToastMessage] = useState(() => location.state?.toastMessage || null)

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Clear navigation state after showing initial toast
  useEffect(() => {
    if (location.state?.toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null)
      }, 3500)
      window.history.replaceState({}, document.title)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  const toggleDescription = (id) => {
    setExpandedDescIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const updateBrandsState = (updater) => {
    setBrands((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveStoredMerchants(next)
      return next
    })
  }

  // Toggle active status
  const handleToggleActive = (id) => {
    const brand = brands.find((b) => b.id === id)
    if (!brand) return
    const currentStatus = (brand.status || 'ACTIVE').toUpperCase()
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const now = new Date().toISOString()
    updateBrandsState((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: nextStatus, updated_at: now } : b))
    )
    showToast(`"${brand.name}" set to ${nextStatus}.`)
  }

  const handleConfirmDelete = () => {
    if (!brandToDelete) return
    updateBrandsState((prev) => prev.filter((b) => b.id !== brandToDelete.id))
    showToast(`Merchant "${brandToDelete.name}" deleted.`)
    setBrandToDelete(null)
  }

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(brands, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', 'merchants-export.json')
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast('Exported merchant records as JSON.')
  }

  // Filter & Sort
  const filteredBrands = useMemo(() => {
    return brands
      .filter((b) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          const matchesName = b.name.toLowerCase().includes(q)
          const matchesDesc = (b.description || '').toLowerCase().includes(q)
          const matchesCat = (b.category_name || '').toLowerCase().includes(q)
          const matchesType = (b.type || '').toLowerCase().includes(q)
          const matchesLic = (b.license_number || '').toLowerCase().includes(q)
          const matchesSpec = Array.isArray(b.specialties) && b.specialties.some((s) => s.toLowerCase().includes(q))
          if (!matchesName && !matchesDesc && !matchesCat && !matchesType && !matchesLic && !matchesSpec) {
            return false
          }
        }
        if (statusFilter !== 'all' && (b.status || '').toUpperCase() !== statusFilter.toUpperCase()) {
          return false
        }
        if (typeFilter !== 'all') {
          const sel = typeFilter.toLowerCase()
          const bCat = (b.category_name || '').toLowerCase()
          const bCode = (b.category_code || '').toLowerCase()
          const bType = (b.type || '').toLowerCase()
          const matches =
            bCat === sel ||
            bCode === sel ||
            bType.includes(sel) ||
            (sel === 'food' && (bType.includes('restaurant') || bType.includes('bakery') || bType.includes('cafe'))) ||
            (sel === 'grocery' && (bType.includes('supermarket') || bType.includes('market'))) ||
            (sel === 'pharmacy' && (bType.includes('health') || bType.includes('care') || bType.includes('drug') || bType.includes('med'))) ||
            (sel === 'retail' && (bType.includes('convenience') || bType.includes('spirit') || bType.includes('pet')))
          if (!matches) return false
        }
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return a.name.localeCompare(b.name)
          case 'name_desc':
            return b.name.localeCompare(a.name)
          case 'locations_desc':
            return b.locations - a.locations
          case 'locations_asc':
            return a.locations - b.locations
          case 'rating_desc':
            return (b.average_rating || 0) - (a.average_rating || 0)
          case 'updated_desc':
            return new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
          default:
            return a.name.localeCompare(b.name)
        }
      })
  }, [brands, searchQuery, statusFilter, typeFilter, sortBy])

  const totalPages = Math.ceil(filteredBrands.length / rowsPerPage) || 1
  const paginatedBrands = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredBrands.slice(start, start + rowsPerPage)
  }, [filteredBrands, currentPage, rowsPerPage])

  // Dynamic KPI Metrics
  const metrics = useMemo(() => {
    const total = brands.length
    const active = brands.filter((b) => (b.status || '').toUpperCase() === 'ACTIVE').length
    const totalBranches = brands.reduce((acc, b) => acc + (b.locations || 0), 0)
    const inactive = total - active
    return { total, active, totalBranches, inactive }
  }, [brands])

  return (
    <MainLayout
      activeMenuKey="restaurantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Merchants"
    >
      <div className="space-y-6 pb-12">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl ring-1 ring-white/10 dark:bg-zinc-800">
            <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
            <span>{toastMessage}</span>
          </div>
        )}

        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Merchant Management
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Curate multi-vendor merchant partners across food dining, grocery markets, pharmacy care, and retail.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => navigate('/restaurants/new')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Merchant
            </button>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Category & Cuisine */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Merchants
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">storefront</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.total}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Catalog partners
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Status
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.active}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 100}% live rate
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Branches
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">pin_drop</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.totalBranches}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Active locations
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Inactive Merchants
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-200/60 dark:bg-amber-950/40 dark:ring-amber-800/40">
                <span className="material-symbols-outlined text-lg">pause_circle</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.inactive}
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Offline partners
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar with Matching Size Filters Icon and Search Engine */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>
          <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

          {/* Search Engine */}
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
              placeholder="Search merchant name, category, license, specialties..."
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

          {/* Status Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </div>

          {/* Category / Type Filter */}
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Category Name
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Categories</option>
              {MERCHANT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="locations_desc">Locations: Most</option>
              <option value="locations_asc">Locations: Fewest</option>
              <option value="updated_desc">Recently Updated</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setTypeFilter('all')
                setCurrentPage(1)
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Merchant Brands Table View - Fully unified with Category & Cuisine */}
        {filteredBrands.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Merchant
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Merchant Type
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Locations
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Description
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-center">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Latest Update
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {paginatedBrands.map((brand) => {
                    const isExpanded = expandedDescIds.has(brand.id)

                    return (
                      <tr
                        key={brand.id || brand.name}
                        className="group transition-all hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                      >
                        {/* Logo + Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => navigate(`/restaurants/${brand.id}`)}
                              className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100 shadow-xs transition-transform duration-200 hover:scale-105 hover:ring-2 hover:ring-[#FF6B35]/40 dark:border-zinc-800"
                              title="Click to view full merchant information"
                            >
                              <img
                                alt={`${brand.name} logo`}
                                className="h-full w-full object-cover"
                                src={brand.logo}
                              />
                            </button>
                            <div>
                              <button
                                type="button"
                                onClick={() => navigate(`/restaurants/${brand.id}`)}
                                className="text-left font-['Plus_Jakarta_Sans'] font-bold text-slate-900 transition hover:text-[#FF6B35] dark:text-zinc-100 dark:hover:text-orange-400"
                                title="Click to view full merchant information"
                              >
                                {brand.name}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Merchant Type */}
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700 dark:text-zinc-300">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100/90 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-zinc-800/80 dark:text-zinc-200">
                            <span className="material-symbols-outlined text-[15px] text-[#FF6B35]">
                              storefront
                            </span>
                            {brand.type}
                          </span>
                        </td>

                        {/* Locations */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {brand.locations} branches
                          </span>
                        </td>

                        {/* Description Cell */}
                        {(() => {
                          const hasText = Boolean(brand.description && brand.description.trim().length > 0)
                          const isExpandable = Boolean(
                            brand.description && (brand.description.trim().length > 60 || brand.description.includes('\n'))
                          )

                          return (
                            <td
                              className={`max-w-xs px-5 py-4 text-slate-700 dark:text-zinc-300 ${
                                isExpandable ? 'cursor-pointer' : ''
                              }`}
                              onClick={() => {
                                if (isExpandable) {
                                  toggleDescription(brand.id)
                                }
                              }}
                              title={
                                hasText
                                  ? isExpandable
                                    ? isExpanded
                                      ? 'Click to show less'
                                      : 'Click to show more'
                                    : brand.description
                                  : 'No description'
                              }
                            >
                              <div>
                                <p
                                  className={`${
                                    isExpandable && !isExpanded ? 'line-clamp-2' : ''
                                  } text-xs leading-relaxed`}
                                >
                                  {hasText ? (
                                    brand.description
                                  ) : (
                                    <span className="italic text-slate-400">No description provided</span>
                                  )}
                                </p>
                                {isExpandable && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleDescription(brand.id)
                                    }}
                                    className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#FF6B35] transition hover:text-[#e0531f] hover:underline focus:outline-none"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <span>Show less</span>
                                        <span className="material-symbols-outlined text-[14px]">expand_less</span>
                                      </>
                                    ) : (
                                      <>
                                        <span>Show more</span>
                                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          )
                        })()}

                        {/* Status Toggle Switch */}
                        <td className="whitespace-nowrap px-5 py-4 text-center">
                          {(() => {
                            const rawStatus = (brand.status || 'ACTIVE').toUpperCase()
                            let badgeClass = 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                            let dotClass = 'bg-emerald-500'
                            if (rawStatus === 'INACTIVE') {
                              badgeClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                              dotClass = 'bg-slate-400'
                            } else if (rawStatus === 'PENDING') {
                              badgeClass = 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400'
                              dotClass = 'bg-amber-500'
                            } else if (rawStatus === 'BLOCKED') {
                              badgeClass = 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
                              dotClass = 'bg-rose-500'
                            }
                            return (
                              <button
                                type="button"
                                onClick={() => handleToggleActive(brand.id)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${badgeClass}`}
                                title={`Status: ${rawStatus}. Click to toggle.`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                                {rawStatus}
                              </button>
                            )
                          })()}
                        </td>

                        {/* Latest Update Column */}
                        <td className="whitespace-nowrap px-5 py-4 text-xs">
                          {(() => {
                            const updateInfo = formatLatestUpdate(brand)
                            if (updateInfo.type === 'none') {
                              return <span className="text-slate-500 dark:text-zinc-500">—</span>
                            }
                            return (
                              <div
                                className="inline-flex items-center gap-1.5 text-slate-700 dark:text-zinc-200 font-medium"
                                title={updateInfo.fullDate}
                              >
                                <span className="material-symbols-outlined text-[15px] text-slate-600 dark:text-zinc-400">
                                  {updateInfo.type === 'updated' ? 'update' : 'schedule'}
                                </span>
                                <span>{updateInfo.relativeText}</span>
                              </div>
                            )
                          })()}
                        </td>

                        {/* Actions */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/restaurants/${brand.id}`)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              title="View Full Merchant Information"
                              aria-label={`View full information for ${brand.name}`}
                            >
                              <span className="material-symbols-outlined text-[19px]">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/restaurants/${brand.id}/edit`)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              title="Edit Merchant details"
                              aria-label={`Edit ${brand.name}`}
                            >
                              <span className="material-symbols-outlined text-[19px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBrandToDelete(brand)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                              title="Delete Merchant"
                              aria-label={`Delete ${brand.name}`}
                            >
                              <span className="material-symbols-outlined text-[19px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <h3 className="mt-4 font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
              No merchants found matching criteria
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              No merchant records match your query or filters. Try adjusting your search keywords or resetting your filter options.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setTypeFilter('all')
                    setCurrentPage(1)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Clear Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/restaurants/new')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#e0531f]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Merchant
              </button>
            </div>
          </div>
        )}

        {filteredBrands.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredBrands.length}
            startItem={(currentPage - 1) * rowsPerPage + 1}
            endItem={Math.min(currentPage * rowsPerPage, filteredBrands.length)}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(size) => {
              setRowsPerPage(size)
              setCurrentPage(1)
            }}
            itemName="merchants"
          />
        )}

        {/* Delete Confirmation Modal */}
        {brandToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/40">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-50">
                    Delete Merchant
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Are you sure you want to delete this merchant partner?
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/50">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100">
                  <img
                    src={brandToDelete.logo}
                    alt={brandToDelete.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">{brandToDelete.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {brandToDelete.type} • {brandToDelete.locations} branches
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBrandToDelete(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Merchant Details Modal */}
        {selectedBrandForView && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="view-merchant-title"
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedBrandForView(null)
            }}
          >
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm dark:border-zinc-700">
                    <img
                      src={selectedBrandForView.logo}
                      alt={selectedBrandForView.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        id="view-merchant-title"
                        className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-slate-900 dark:text-zinc-50"
                      >
                        {selectedBrandForView.name}
                      </h2>
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          (selectedBrandForView.status || 'ACTIVE').toUpperCase() === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
                            : (selectedBrandForView.status || '').toUpperCase() === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400'
                            : (selectedBrandForView.status || '').toUpperCase() === 'BLOCKED'
                            ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {(selectedBrandForView.status || 'ACTIVE').toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-[#FF6B35]">storefront</span>
                        {selectedBrandForView.type || 'Merchant Partner'}
                      </span>
                      {selectedBrandForView.category_name && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                            <span className="material-symbols-outlined text-[14px] text-[#FF6B35]">category</span>
                            {selectedBrandForView.category_name}
                          </span>
                        </>
                      )}
                      {selectedBrandForView.cuisine_name && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300">
                            <span className="material-symbols-outlined text-[14px] text-amber-500">restaurant</span>
                            {selectedBrandForView.cuisine_name}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBrandForView(null)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Content Details */}
              <div className="mt-6 space-y-6">
                {/* Branch & Coordinates Card */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex items-center justify-between pb-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      <span className="material-symbols-outlined text-[18px] text-[#FF6B35]">pin_drop</span>
                      Branch & Coordinates
                    </h4>
                    <div className="flex items-center gap-1.5">
                      {selectedBrandForView.is_main_branch && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400">
                          Main Branch
                        </span>
                      )}
                      {selectedBrandForView.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400">
                          ★ Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Branch Name</p>
                      <p className="mt-0.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {selectedBrandForView.branch_name || `${selectedBrandForView.name} Main Branch`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500">Physical Address</p>
                      <p className="mt-0.5 text-xs font-medium text-slate-700 dark:text-zinc-300">
                        {selectedBrandForView.address || 'Central Commercial Boulevard'}
                      </p>
                    </div>
                    <div className="sm:col-span-2 rounded-xl border border-slate-200/80 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900/80">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-[#FF6B35]">explore</span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                            GPS Coordinates:
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {Number(selectedBrandForView.latitude || 9.0016).toFixed(6)},{' '}
                            {Number(selectedBrandForView.longitude || 38.7842).toFixed(6)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Domain Information & Regulatory Compliance Specifications */}
                {(() => {
                  const catMeta = getCategoryMeta(selectedBrandForView.category_name || selectedBrandForView.type)
                  const isPharm = catMeta.code === 'PHARMACY'
                  const isGroc = catMeta.code === 'GROCERY'

                  return (
                    <div
                      className={`rounded-2xl border p-4.5 transition-all ${
                        isPharm
                          ? 'border-sky-200 bg-sky-50/50 dark:border-sky-900/40 dark:bg-sky-950/20'
                          : isGroc
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : 'border-slate-200/80 bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                          <span
                            className="material-symbols-outlined text-[18px]"
                            style={catMeta.accentColor ? { color: catMeta.accentColor } : { color: '#FF6B35' }}
                          >
                            {catMeta.icon}
                          </span>
                          Category Domain & Regulatory Specifications
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${catMeta.badgeClass}`}>
                            <span className="material-symbols-outlined text-[13px]">{catMeta.icon}</span>
                            {selectedBrandForView.category_name || catMeta.label}
                          </span>
                          <span className="rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700 shadow-2xs dark:bg-zinc-800 dark:text-zinc-200">
                            {catMeta.code}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-1">
                        {/* Regulatory License */}
                        <div className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-800/80">
                          <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
                            <span className="material-symbols-outlined text-xs text-emerald-500">verified</span>
                            Regulatory License
                          </p>
                          <p className="mt-1 font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {selectedBrandForView.license_number || 'REG-STANDARD-2024'}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                            {isPharm ? 'EFDA Certified Medical Dispensary' : isGroc ? 'Ministry of Agriculture / EFDA Food' : 'Standard Commercial License'}
                          </p>
                        </div>

                        {/* Cold-Chain / Storage */}
                        <div className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-800/80">
                          <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
                            <span className="material-symbols-outlined text-xs text-blue-500">ac_unit</span>
                            Temperature & Logistics
                          </p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold ${
                                selectedBrandForView.is_cold_chain
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-300'
                              }`}
                            >
                              {selectedBrandForView.is_cold_chain ? '❄️ Active Cold-Chain (2°C - 8°C)' : 'Ambient Storage'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">
                            {isPharm
                              ? 'Insulin, vaccines & biologics compliant'
                              : isGroc
                              ? 'Chilled farm produce & dairy transit'
                              : 'Standard courier transit'}
                          </p>
                        </div>

                        {/* Fulfillment SLA & Min Order */}
                        <div className="rounded-xl border border-white/60 bg-white/80 p-3 shadow-2xs dark:border-zinc-700/60 dark:bg-zinc-800/80">
                          <p className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
                            <span className="material-symbols-outlined text-xs text-orange-500">local_shipping</span>
                            Fulfillment SLA & Min Order
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {selectedBrandForView.delivery_sla || '20-35 min'} SLA • Min: {selectedBrandForView.min_order || 'ETB 150'}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {isPharm && selectedBrandForView.is_rx_licensed && (
                              <span className="rounded bg-sky-100 px-1 py-0.2 text-[9px] font-bold text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                                Rx Prescriptions Authorized
                              </span>
                            )}
                            {selectedBrandForView.is_emergency_247 && (
                              <span className="rounded bg-rose-100 px-1 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                                24/7 Emergency Dispatch
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Specialties list */}
                      {Array.isArray(selectedBrandForView.specialties) && selectedBrandForView.specialties.length > 0 && (
                        <div className="mt-3 rounded-xl border border-white/60 bg-white/80 p-3 dark:border-zinc-700/60 dark:bg-zinc-800/80">
                          <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                            Category Domain Focus & Specialties ({selectedBrandForView.specialties.length}):
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {selectedBrandForView.specialties.map((spec, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Operating Hours & Fulfillment Card */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      <span className="material-symbols-outlined text-sm text-slate-500">schedule</span>
                      Operating Hours
                    </p>
                    <p className="mt-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                      {selectedBrandForView.opening_hours || '08:00 AM'} - {selectedBrandForView.closing_hours || '10:00 PM'}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          selectedBrandForView.is_open !== false
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {selectedBrandForView.is_open !== false ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      <span className="material-symbols-outlined text-sm text-slate-500">moped</span>
                      Fulfillment
                    </p>
                    <p className="mt-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                      ETA: {selectedBrandForView.eta_min || 20} - {selectedBrandForView.eta_max || 40} mins
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          selectedBrandForView.accepts_orders !== false
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }`}
                      >
                        {selectedBrandForView.accepts_orders !== false ? 'Accepting Orders' : 'Orders Paused'}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      <span className="material-symbols-outlined text-sm text-amber-500">star</span>
                      Ratings & Analytics
                    </p>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-slate-900 dark:text-zinc-100">
                        {Number(selectedBrandForView.average_rating || 4.8).toFixed(1)}
                      </span>
                      <span className="text-xs text-amber-500">★★★★★</span>
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      {selectedBrandForView.total_reviews || 12} customer reviews
                    </p>
                  </div>
                </div>

                {/* Description */}
                {selectedBrandForView.description && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      About Merchant
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                      {selectedBrandForView.description}
                    </p>
                  </div>
                )}

                {/* Contact & Identifiers */}
                <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 p-3.5 dark:border-zinc-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</p>
                    <p className="mt-1 text-slate-700 dark:text-zinc-300">
                      <span className="font-semibold">Phone:</span> {selectedBrandForView.phone || 'N/A'}
                    </p>
                    <p className="text-slate-700 dark:text-zinc-300">
                      <span className="font-semibold">Email:</span> {selectedBrandForView.email || 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 p-3.5 dark:border-zinc-800 font-mono text-[11px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">System ID</p>
                    <p className="mt-1 truncate text-slate-600 dark:text-zinc-400" title={selectedBrandForView.id}>
                      ID: {selectedBrandForView.id}
                    </p>
                    <p className="truncate text-slate-500 dark:text-zinc-500 font-sans">
                      Locations: {selectedBrandForView.locations || 1} branches
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedBrandForView(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const id = selectedBrandForView.id
                    setSelectedBrandForView(null)
                    navigate(`/restaurants/${id}/edit`)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Edit Merchant Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default RestaurantManagementPage