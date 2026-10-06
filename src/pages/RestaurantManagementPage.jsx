import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { formatLatestUpdate } from '../utils/format'
import { loadStoredMerchants, saveStoredMerchants, MERCHANT_TYPES } from '../data/demoMerchants'

const emptyBrandForm = {
  id: '',
  name: '',
  type: 'Restaurant & Dining',
  locations: 1,
  status: 'Active',
  description: '',
  logo: '',
  sort_order: 1,
}

const RestaurantManagementPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [brands, setBrands] = useState(() => loadStoredMerchants())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('sort_order_asc')

  // Pagination states matching Category & Cuisine pages
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Drag-and-drop & inline reordering
  const [draggedBrandId, setDraggedBrandId] = useState(null)
  const [dragOverBrandId, setDragOverBrandId] = useState(null)

  // Expandable description IDs
  const [expandedDescIds, setExpandedDescIds] = useState(() => new Set())

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [formData, setFormData] = useState(emptyBrandForm)
  const [formErrors, setFormErrors] = useState({})
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

  // Handle reordering up/down
  const handleMoveOrder = (brandId, direction) => {
    updateBrandsState((prev) => {
      const sorted = [...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const currentIndex = sorted.findIndex((b) => b.id === brandId)
      if (currentIndex === -1) return prev
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev

      const item = sorted[currentIndex]
      sorted.splice(currentIndex, 1)
      sorted.splice(targetIndex, 0, item)

      return sorted.map((b, idx) => ({
        ...b,
        sort_order: idx + 1,
        updated_at: b.id === brandId ? new Date().toISOString() : b.updated_at,
      }))
    })
    showToast('Merchant sequence order updated.')
  }

  // Drag-and-drop
  const handleDragStart = (e, brandId) => {
    e.dataTransfer.setData('text/plain', brandId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedBrandId(brandId)
  }

  const handleDragOver = (e, brandId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverBrandId !== brandId) {
      setDragOverBrandId(brandId)
    }
  }

  const handleDrop = (e, targetBrandId) => {
    e.preventDefault()
    const sourceBrandId = e.dataTransfer.getData('text/plain') || draggedBrandId
    setDraggedBrandId(null)
    setDragOverBrandId(null)
    if (!sourceBrandId || sourceBrandId === targetBrandId) return

    updateBrandsState((prev) => {
      const sorted = [...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const sourceIndex = sorted.findIndex((b) => b.id === sourceBrandId)
      const targetIndex = sorted.findIndex((b) => b.id === targetBrandId)
      if (sourceIndex === -1 || targetIndex === -1) return prev

      const [removed] = sorted.splice(sourceIndex, 1)
      sorted.splice(targetIndex, 0, removed)

      return sorted.map((b, idx) => ({
        ...b,
        sort_order: idx + 1,
        updated_at: b.id === sourceBrandId ? new Date().toISOString() : b.updated_at,
      }))
    })
    showToast('Merchant reordered successfully.')
  }

  // Toggle active status
  const handleToggleActive = (id) => {
    const brand = brands.find((b) => b.id === id)
    if (!brand) return
    const nextStatus = brand.status === 'Active' ? 'Inactive' : 'Active'
    const now = new Date().toISOString()
    updateBrandsState((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: nextStatus, updated_at: now } : b))
    )
    showToast(`"${brand.name}" set to ${nextStatus}.`)
  }

  // Edit Modal
  const handleOpenEditModal = (brand) => {
    setEditingBrand(brand)
    setFormData({
      id: brand.id,
      name: brand.name,
      type: brand.type || 'Premium Casual',
      locations: brand.locations || 1,
      status: brand.status || 'Active',
      description: brand.description || '',
      logo: brand.logo || '',
      sort_order: brand.sort_order || 1,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleSaveBrand = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Brand name is required.' })
      return
    }

    const now = new Date().toISOString()
    if (editingBrand) {
      updateBrandsState((prev) =>
        prev.map((b) =>
          b.id === editingBrand.id
            ? {
                ...b,
                name: formData.name.trim(),
                type: formData.type,
                locations: parseInt(formData.locations, 10) || 1,
                status: formData.status,
                description: formData.description.trim(),
                logo: formData.logo || b.logo,
                sort_order: parseInt(formData.sort_order, 10) || 1,
                updated_at: now,
              }
            : b
        )
      )
      showToast(`Merchant "${formData.name.trim()}" updated successfully!`)
    } else {
      const newBrand = {
        id: `b-${Date.now()}`,
        name: formData.name.trim(),
        type: formData.type,
        locations: parseInt(formData.locations, 10) || 1,
        status: formData.status,
        description: formData.description.trim(),
        logo:
          formData.logo ||
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
        sort_order: parseInt(formData.sort_order, 10) || 1,
        created_at: now,
        updated_at: now,
      }
      updateBrandsState((prev) => [...prev, newBrand])
      showToast(`Merchant "${newBrand.name}" created successfully!`)
    }
    setIsModalOpen(false)
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
        if (searchQuery && !b.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
        if (statusFilter !== 'all' && b.status.toLowerCase() !== statusFilter) {
          return false
        }
        if (typeFilter !== 'all' && b.type !== typeFilter) {
          return false
        }
        return true
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'sort_order_asc':
            return (a.sort_order || 0) - (b.sort_order || 0)
          case 'sort_order_desc':
            return (b.sort_order || 0) - (a.sort_order || 0)
          case 'name_asc':
            return a.name.localeCompare(b.name)
          case 'name_desc':
            return b.name.localeCompare(a.name)
          case 'locations_desc':
            return b.locations - a.locations
          case 'updated_desc':
            return new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
          default:
            return (a.sort_order || 0) - (b.sort_order || 0)
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
    const active = brands.filter((b) => b.status === 'Active').length
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
              placeholder="Search merchant name, description..."
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
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Merchant Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Merchant Types</option>
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
              <option value="sort_order_asc">Order: Low → High</option>
              <option value="sort_order_desc">Order: High → Low</option>
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
              <option value="locations_desc">Locations: Most</option>
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
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Order
                  </th>
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
                {paginatedBrands.length > 0 ? (
                  paginatedBrands.map((brand, rowIdx) => {
                    const isExpanded = expandedDescIds.has(brand.id)
                    const isDragging = draggedBrandId === brand.id
                    const isOver = dragOverBrandId === brand.id

                    return (
                      <tr
                        key={brand.id || brand.name}
                        draggable
                        onDragStart={(e) => handleDragStart(e, brand.id)}
                        onDragOver={(e) => handleDragOver(e, brand.id)}
                        onDrop={(e) => handleDrop(e, brand.id)}
                        className={`group transition-all ${
                          isDragging ? 'opacity-40 bg-orange-50/50 dark:bg-orange-950/20' : ''
                        } ${
                          isOver ? 'ring-2 ring-[#FF6B35] ring-inset bg-orange-50/30' : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {/* Dynamic Sort Order & Grab Handle */}
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono font-medium text-slate-700 dark:text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="cursor-grab active:cursor-grabbing text-slate-400 transition hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                              title="Click and drag to reorder merchant sequence"
                            >
                              <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                            </span>
                            <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[11px] font-bold text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                              #{brand.sort_order ?? rowIdx + 1}
                            </span>
                            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(brand.id, 'up')}
                                className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-[#FF6B35] dark:text-zinc-500 dark:hover:text-orange-400"
                                title="Move up"
                              >
                                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_up</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(brand.id, 'down')}
                                className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-[#FF6B35] dark:text-zinc-500 dark:hover:text-orange-400"
                                title="Move down"
                              >
                                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_down</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Logo + Name: Exactly same 40x40 badge size */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200/60 bg-slate-100 shadow-xs dark:border-zinc-800">
                              <img
                                alt={`${brand.name} logo`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                src={brand.logo}
                              />
                            </div>
                            <div>
                              <p className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-zinc-100">
                                {brand.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                {brand.type || 'Merchant Partner'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Concept */}
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

                        {/* Description Cell: Logical show more / show less (only when text is large) */}
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
                          <button
                            type="button"
                            onClick={() => handleToggleActive(brand.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                              brand.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                            title="Click to toggle status"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                brand.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {brand.status}
                          </button>
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
                              onClick={() => handleOpenEditModal(brand)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              title="Edit Merchant details"
                            >
                              <span className="material-symbols-outlined text-[19px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBrandToDelete(brand)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                              title="Delete Merchant"
                            >
                              <span className="material-symbols-outlined text-[19px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-zinc-400">
                      No merchants found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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

        {/* Add / Edit Brand Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-xl">
                      {editingBrand ? 'edit' : 'add'}
                    </span>
                  </span>
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-slate-900 dark:text-zinc-50">
                      {editingBrand ? 'Edit Merchant Details' : 'Add New Merchant'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Configure merchant profile, classification, and branch allocation.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveBrand} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                      if (formErrors.name) setFormErrors({})
                    }}
                    placeholder="e.g. Whole Harvest Organic Market"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-[11px] text-rose-500">{formErrors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Merchant Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {MERCHANT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Branch Locations
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.locations}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, locations: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sort_order: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Description <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Provide details about merchant offerings, locations, and business summary..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#e05624]"
                  >
                    {editingBrand ? 'Save Changes' : 'Create Merchant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
      </div>
    </MainLayout>
  )
}

export default RestaurantManagementPage
