import { useState, useMemo, useRef } from 'react'
import {
  saveMenuItem,
  deleteMenuItem,
  getCategoriesForBranch,
  getCategoryIcon,
} from '../data/demoMenuItems'

export default function BranchMenuItemsTabContent({
  menuItems,
  setMenuItems,
  branch,
  merchant,
  showToast,
  initialCategory = 'all',
}) {
  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'

  if (initialCategory !== prevInitialCategory) {
    setPrevInitialCategory(initialCategory)
    setSelectedCategory(initialCategory || 'all')
  }

  // Merchant categories strictly relating to this merchant's assigned categories earlier
  const merchantCategories = useMemo(() => {
    return getCategoriesForBranch(merchant, menuItems)
  }, [merchant, menuItems])

  const isPharmacyMerchant = useMemo(() => {
    const mType = (merchant?.type || merchant?.business_type || '').toLowerCase()
    const mName = (merchant?.name || '').toLowerCase()
    const mCat = (merchant?.primary_category || merchant?.category || '').toLowerCase()
    return (
      mType.includes('pharmacy') ||
      mType.includes('health') ||
      mType.includes('medical') ||
      mName.includes('pharmacy') ||
      mCat.includes('pharmacy')
    )
  }, [merchant])

  const categoryTabs = useMemo(() => {
    return [
      { id: 'all', label: 'All Categories', icon: 'apps' },
      ...merchantCategories.map((c) => ({
        id: c.name,
        categoryId: c.id,
        label: c.name,
        icon: c.icon || getCategoryIcon(c.name, c.code),
        code: c.code,
      })),
    ]
  }, [merchantCategories])

  // Modal states
  const [inspectItem, setInspectItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const itemCat = (item.category_type || item.category_name || '').toLowerCase()
        const selCat = selectedCategory.toLowerCase()
        const matchesName = itemCat === selCat
        const matchesId = item.menu_category_id === selectedCategory
        if (!matchesName && !matchesId) {
          return false
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = item.name?.toLowerCase().includes(q)
        const matchesDesc = item.description?.toLowerCase().includes(q)
        const matchesSku = item.sku?.toLowerCase().includes(q)
        const matchesCat = (item.category_type || '').toLowerCase().includes(q)
        if (!matchesName && !matchesDesc && !matchesSku && !matchesCat) return false
      }
      // Stock filter
      if (stockFilter === 'in_stock') {
        if (!item.is_available || (item.stock_quantity !== undefined && item.stock_quantity <= 0)) return false
      } else if (stockFilter === 'low_stock') {
        if (item.stock_quantity === undefined || item.stock_quantity > 15 || item.stock_quantity <= 0) return false
      } else if (stockFilter === 'out_of_stock') {
        if (item.is_available && (item.stock_quantity === undefined || item.stock_quantity > 0)) return false
      }
      return true
    })
  }, [menuItems, selectedCategory, searchQuery, stockFilter])

  // Quick stats
  const stats = useMemo(() => {
    const total = menuItems.length
    const available = menuItems.filter((i) => i.is_available).length
    const lowStock = menuItems.filter((i) => i.stock_quantity !== undefined && i.stock_quantity <= 15 && i.stock_quantity > 0).length
    const rxCount = menuItems.filter((i) => i.requires_prescription).length
    return { total, available, lowStock, rxCount }
  }, [menuItems])

  // Handle Availability Toggle
  const handleToggleAvailability = (item) => {
    const updated = { ...item, is_available: !item.is_available }
    saveMenuItem(updated)
    setMenuItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
    showToast?.(
      `${item.name} is now ${updated.is_available ? 'available' : 'unavailable'}.`,
      'success'
    )
  }

  // Handle Save (Add/Edit)
  const handleSaveItem = (itemData) => {
    saveMenuItem(itemData)
    // Refresh branch items
    setMenuItems((prev) => {
      const idx = prev.findIndex((i) => i.id === itemData.id)
      if (idx >= 0) {
        return prev.map((i) => (i.id === itemData.id ? itemData : i))
      }
      return [itemData, ...prev]
    })
    setIsAddModalOpen(false)
    setEditingItem(null)
    showToast?.(`Item "${itemData.name}" saved successfully.`, 'success')
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deleteCandidate) return
    deleteMenuItem(deleteCandidate.id)
    setMenuItems((prev) => prev.filter((i) => i.id !== deleteCandidate.id))
    showToast?.(`Item "${deleteCandidate.name}" removed from branch catalog.`, 'info')
    setDeleteCandidate(null)
    if (inspectItem?.id === deleteCandidate.id) setInspectItem(null)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick KPI Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Total Catalog
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
              <span className="material-symbols-outlined text-base">inventory_2</span>
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-zinc-100">
            {stats.total} <span className="text-xs font-normal text-slate-400">Products</span>
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
            Across {merchantCategories.length} {merchant?.type ? `${merchant.type} ` : ''}categories
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Live & Available
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
              <span className="material-symbols-outlined text-base">check_circle</span>
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.available} <span className="text-xs font-normal text-slate-400">active</span>
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
            Ready for customer dispatch
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Low Stock Alerts
            </span>
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
              <span className="material-symbols-outlined text-base">warning</span>
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {stats.lowStock} <span className="text-xs font-normal text-slate-400">critical</span>
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
            Under 15 units remaining
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              {isPharmacyMerchant ? 'Controlled Items' : 'Out of Stock'}
            </span>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${
                isPharmacyMerchant
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40'
                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isPharmacyMerchant ? 'verified' : 'inventory'}
              </span>
            </span>
          </div>
          <p
            className={`mt-2 text-2xl font-extrabold ${
              isPharmacyMerchant
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-900 dark:text-zinc-100'
            }`}
          >
            {isPharmacyMerchant ? stats.rxCount : stats.total - stats.available}{' '}
            <span className="text-xs font-normal text-slate-400">
              {isPharmacyMerchant ? 'Rx/Restricted' : 'paused'}
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
            {isPharmacyMerchant ? 'Verification mandated' : 'Temporarily unavailable'}
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4">
          {/* Category Tabs relating to Merchant Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoryTabs.map((tab) => {
              const count =
                tab.id === 'all'
                  ? menuItems.length
                  : menuItems.filter(
                      (i) =>
                        (i.category_type || '').toLowerCase() === tab.label.toLowerCase() ||
                        i.menu_category_id === tab.categoryId
                    ).length
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    selectedCategory.toLowerCase() === tab.id.toLowerCase()
                      ? 'bg-[#FF6B35] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                      selectedCategory.toLowerCase() === tab.id.toLowerCase()
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-zinc-700 dark:text-zinc-200'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Merchant Category Context Notice */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-orange-50/60 px-3.5 py-2 text-xs border border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/40">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-sm text-[#FF6B35]">storefront</span>
              <span className="text-slate-700 dark:text-zinc-300">
                <strong className="text-slate-900 dark:text-zinc-100">{merchant?.name || 'Branch'}</strong> Categories ({merchant?.type || 'Merchant'}):
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {merchantCategories.map((c) => (
                <button
                  key={c.id || c.name}
                  type="button"
                  onClick={() => setSelectedCategory(c.name)}
                  className={`rounded-lg px-2 py-0.5 text-[11px] font-bold transition ${
                    selectedCategory.toLowerCase() === c.name.toLowerCase()
                      ? 'bg-[#FF6B35] text-white shadow-2xs'
                      : 'bg-white text-slate-700 shadow-2xs hover:bg-orange-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search, Stock Filter, View Toggle & Add Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex flex-1 flex-wrap items-center gap-3 min-w-[280px]">
              {/* Search Input */}
              <div className="relative flex-1 min-w-[200px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by product name, SKU, ingredients..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs font-medium text-slate-800 outline-none transition focus:border-[#FF6B35] focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-[#FF6B35]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>

              {/* Stock Filter Dropdown */}
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="all">All Inventory States</option>
                <option value="in_stock">In Stock & Active</option>
                <option value="low_stock">Low Stock (≤ 15)</option>
                <option value="out_of_stock">Out of Stock / Inactive</option>
              </select>

              {/* View Switcher */}
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === 'grid'
                      ? 'bg-white text-[#FF6B35] shadow-xs dark:bg-zinc-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Grid View"
                >
                  <span className="material-symbols-outlined text-base">grid_view</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`rounded-lg p-1.5 transition ${
                    viewMode === 'table'
                      ? 'bg-white text-[#FF6B35] shadow-xs dark:bg-zinc-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title="Table View"
                >
                  <span className="material-symbols-outlined text-base">view_list</span>
                </button>
              </div>
            </div>

            {/* Add Menu Item Button */}
            <button
              type="button"
              onClick={() => {
                setEditingItem(null)
                setIsAddModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Items Rendering */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
            <span className="material-symbols-outlined text-3xl">restaurant_menu</span>
          </div>
          <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-zinc-100">
            No Products Found
          </h4>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
            {searchQuery
              ? `No menu items matched your query "${searchQuery}".`
              : 'There are no menu items in this category yet for this branch.'}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Clear Search
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingItem(null)
                setIsAddModalOpen(true)
              }}
              className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white hover:bg-[#e0531f]"
            >
              Add First Item
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const hasLowStock =
              item.stock_quantity !== undefined &&
              item.stock_quantity <= 15 &&
              item.stock_quantity > 0
            const isOutOfStock =
              !item.is_available ||
              (item.stock_quantity !== undefined && item.stock_quantity <= 0)

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:border-[#FF6B35]/60 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Image and Badges */}
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-zinc-600">
                        <span className="material-symbols-outlined text-5xl">
                          restaurant_menu
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Category & Status Badges */}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      <span className="rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        {item.category_type || 'General'}
                      </span>
                      {item.requires_prescription && (
                        <span className="flex items-center gap-0.5 rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                          <span className="material-symbols-outlined text-[11px]">medication</span>
                          Rx Required
                        </span>
                      )}
                      {item.is_age_restricted && (
                        <span className="rounded-lg bg-amber-500 px-2 py-1 text-[10px] font-bold text-white shadow-sm">
                          18+ Restricted
                        </span>
                      )}
                    </div>

                    {/* Availability Switch */}
                    <div className="absolute right-3 top-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleAvailability(item)
                        }}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md transition ${
                          item.is_available
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-800/80 text-zinc-300 backdrop-blur-md'
                        }`}
                        title="Toggle availability"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            item.is_available ? 'bg-white animate-pulse' : 'bg-rose-400'
                          }`}
                        />
                        <span>{item.is_available ? 'Available' : 'Paused'}</span>
                      </button>
                    </div>

                    {/* Price Tag in Bottom Left */}
                    <div className="absolute bottom-3 left-3 flex items-baseline gap-1">
                      <span className="text-lg font-black text-white drop-shadow-md">
                        ETB {Number(item.price).toLocaleString()}
                      </span>
                      {item.unit && (
                        <span className="text-xs font-semibold text-white/80">
                          / {item.unit}
                        </span>
                      )}
                    </div>

                    {/* Stock pill in bottom right */}
                    <div className="absolute bottom-3 right-3">
                      {isOutOfStock ? (
                        <span className="rounded-md bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                          Out of Stock
                        </span>
                      ) : hasLowStock ? (
                        <span className="rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                          Only {item.stock_quantity} left
                        </span>
                      ) : (
                        <span className="rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white/90 backdrop-blur-sm">
                          Stock: {item.stock_quantity ?? 'In Stock'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#FF6B35] transition dark:text-zinc-100">
                        {item.name}
                      </h3>
                      {item.sku && (
                        <span className="shrink-0 font-mono text-[10px] font-bold text-slate-400">
                          {item.sku}
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 dark:text-zinc-400 leading-relaxed">
                      {item.description || 'No item description provided.'}
                    </p>

                    {/* Sizes & Add-on tags preview */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                      {item.sizes && item.sizes.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                          <span className="material-symbols-outlined text-[11px]">straighten</span>
                          {item.sizes.length} Sizes
                        </span>
                      )}
                      {item.extra_groups && item.extra_groups.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                          <span className="material-symbols-outlined text-[11px]">layers</span>
                          {item.extra_groups.length} Add-on Groups
                        </span>
                      )}
                      {item.expiry_date && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          <span className="material-symbols-outlined text-[11px]">event</span>
                          Exp: {item.expiry_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850/50">
                  <button
                    type="button"
                    onClick={() => setInspectItem(item)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline"
                  >
                    <span>View Configuration</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(item)
                        setIsAddModalOpen(true)
                      }}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      title="Edit Item"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCandidate(item)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                      title="Delete Item"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-400">
                <tr>
                  <th className="py-3.5 pl-4 pr-3">Product / Item</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5">Base Price</th>
                  <th className="px-3 py-3.5">SKU & Unit</th>
                  <th className="px-3 py-3.5">Stock Quantity</th>
                  <th className="px-3 py-3.5">Variations</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-slate-50/70 dark:hover:bg-zinc-850/40"
                  >
                    <td className="py-3.5 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-lg">restaurant_menu</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-zinc-100">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 dark:text-zinc-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {item.category_type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-bold text-slate-900 dark:text-zinc-100">
                      ETB {Number(item.price).toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                      {item.sku || '—'} ({item.unit || 'pcs'})
                    </td>
                    <td className="px-3 py-3.5 font-semibold">
                      {item.stock_quantity !== undefined ? (
                        <span
                          className={
                            item.stock_quantity <= 15
                              ? 'font-bold text-amber-600 dark:text-amber-400'
                              : 'text-slate-700 dark:text-zinc-300'
                          }
                        >
                          {item.stock_quantity} {item.unit || 'units'}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unlimited</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-[11px] text-slate-500 dark:text-zinc-400">
                      {(item.sizes?.length || 0)} sizes • {(item.extra_groups?.length || 0)} add-ons
                    </td>
                    <td className="px-3 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                          item.is_available
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.is_available ? 'bg-emerald-600' : 'bg-zinc-400'}`} />
                        {item.is_available ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="py-3.5 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setInspectItem(item)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-zinc-800"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item)
                            setIsAddModalOpen(true)
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-zinc-800"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteCandidate(item)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECT MODAL (Displays Schema Relationships: Sizes, Extra Groups, Options) */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100 dark:bg-zinc-800">
                  {inspectItem.image_url ? (
                    <img
                      src={inspectItem.image_url}
                      alt={inspectItem.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-950/60">
                      {inspectItem.category_type}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      SKU: {inspectItem.sku || 'N/A'}
                    </span>
                  </div>
                  <h3 className="mt-0.5 text-lg font-bold text-slate-900 dark:text-zinc-100">
                    {inspectItem.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-5 text-xs">
              {/* Product Info */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-850/60">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Base Price</span>
                    <p className="mt-0.5 text-base font-extrabold text-[#FF6B35] dark:text-orange-400">
                      ETB {Number(inspectItem.price).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Stock Quantity</span>
                    <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-zinc-100">
                      {inspectItem.stock_quantity ?? 'Unlimited'} {inspectItem.unit || 'units'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">Availability</span>
                    <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {inspectItem.is_available ? '● Available for Dispatch' : '○ Temporarily Paused'}
                    </p>
                  </div>
                  {isPharmacyMerchant || inspectItem.requires_prescription || inspectItem.is_age_restricted ? (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Compliance</span>
                      <p className="mt-0.5 font-bold text-slate-700 dark:text-zinc-300">
                        {inspectItem.requires_prescription
                          ? 'Requires Rx'
                          : inspectItem.is_age_restricted
                          ? 'Age 18+ Only'
                          : 'General OTC'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400">Unit / Serving</span>
                      <p className="mt-0.5 font-bold text-slate-700 dark:text-zinc-300">
                        {inspectItem.unit || 'pcs'}
                      </p>
                    </div>
                  )}
                </div>
                {inspectItem.expiry_date && (
                  <div className="mt-2 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    Expiry Date: {inspectItem.expiry_date}
                  </div>
                )}
                {inspectItem.description && (
                  <p className="mt-3 border-t border-slate-200/60 pt-2.5 text-slate-600 leading-relaxed dark:border-zinc-800 dark:text-zinc-300">
                    {inspectItem.description}
                  </p>
                )}
              </div>

              {/* Sizes Relationship: menu_item_sizes */}
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  <span className="material-symbols-outlined text-sm text-[#FF6B35]">straighten</span>
                  <span>Sizes & Variants (menu_item_sizes)</span>
                </h4>
                {inspectItem.sizes && inspectItem.sizes.length > 0 ? (
                  <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {inspectItem.sizes.map((sz) => (
                      <div
                        key={sz.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-850"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-zinc-100">{sz.name}</span>
                          {sz.is_default && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-bold text-slate-600 dark:bg-zinc-700 dark:text-zinc-300">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-mono text-xs font-bold text-[#FF6B35]">
                          {sz.price_delta > 0
                            ? `+ ETB ${sz.price_delta}`
                            : sz.price_delta < 0
                            ? `- ETB ${Math.abs(sz.price_delta)}`
                            : 'Included in Base Price'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs italic text-slate-400">
                    No size variants configured. Standard single size applies.
                  </p>
                )}
              </div>

              {/* Extra Groups Relationship: menu_item_extra_groups & options */}
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  <span className="material-symbols-outlined text-sm text-[#FF6B35]">layers</span>
                  <span>Extra Groups & Add-on Options (menu_item_extra_groups)</span>
                </h4>
                {inspectItem.extra_groups && inspectItem.extra_groups.length > 0 ? (
                  <div className="mt-2.5 space-y-3">
                    {inspectItem.extra_groups.map((group) => (
                      <div
                        key={group.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-850"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-zinc-800">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100">
                              {group.name}
                            </span>
                            <span className="ml-2 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                              Selection: {group.selection_type === 'single' ? 'Pick 1 (Single)' : `Multiple (Min ${group.min_select || 0}, Max ${group.max_select || 'Unlimited'})`}
                            </span>
                          </div>
                          {group.is_required ? (
                            <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                              Required Selection
                            </span>
                          ) : (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-zinc-800">
                              Optional
                            </span>
                          )}
                        </div>

                        {/* Options */}
                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {group.options && group.options.length > 0 ? (
                            group.options.map((opt) => (
                              <div
                                key={opt.id}
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40"
                              >
                                <span className="font-medium text-slate-800 dark:text-zinc-200">
                                  {opt.name}
                                </span>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {opt.price_delta > 0 ? `+ ETB ${opt.price_delta}` : 'Free'}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400">No options in this group.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs italic text-slate-400">
                    No extra groups or add-ons configured for this item.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setEditingItem(inspectItem)
                  setInspectItem(null)
                  setIsAddModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-4 py-2 text-xs font-bold text-[#FF6B35] hover:bg-orange-100 dark:bg-orange-950/40"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit Product</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT ITEM MODAL */}
      {isAddModalOpen && (
        <ItemFormModal
          item={editingItem}
          branchId={branch.id}
          merchantId={merchant.id}
          merchant={merchant}
          availableCategories={merchantCategories}
          onSave={handleSaveItem}
          onClose={() => {
            setIsAddModalOpen(false)
            setEditingItem(null)
          }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50">
              <span className="material-symbols-outlined text-2xl">delete</span>
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-zinc-100">
              Delete Menu Item?
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Are you sure you want to permanently delete &quot;{deleteCandidate.name}&quot; from this branch? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Add / Edit Modal Component
 */
function ItemFormModal({
  item,
  branchId,
  merchantId,
  merchant,
  availableCategories = [],
  onSave,
  onClose,
}) {
  const isEdit = Boolean(item?.id)

  const defaultCat = availableCategories[0]?.name || 'Drinks'
  const defaultCatId = availableCategories[0]?.id || ''

  const [formData, setFormData] = useState({
    id: item?.id || '',
    merchant_branch_id: item?.merchant_branch_id || branchId || 'branch-default',
    merchant_id: item?.merchant_id || merchantId || 'm-default',
    menu_category_id: item?.menu_category_id || defaultCatId,
    category_type: item?.category_type || defaultCat,
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price ?? 180,
    image_url: item?.image_url || '',
    is_available: item?.is_available !== undefined ? item.is_available : true,
    stock_quantity: item?.stock_quantity ?? 50,
    unit: item?.unit || 'pcs',
    sku: item?.sku || '',
    requires_prescription: Boolean(item?.requires_prescription),
    is_age_restricted: Boolean(item?.is_age_restricted),
    expiry_date: item?.expiry_date || '',
    sizes: item?.sizes ? JSON.parse(JSON.stringify(item.sizes)) : [
      { id: 'sz-default-1', name: 'Standard Regular', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
    ],
    extra_groups: item?.extra_groups ? JSON.parse(JSON.stringify(item.extra_groups)) : [],
  })

  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, image_url: event.target.result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Size helper
  const handleAddSize = () => {
    setFormData((prev) => {
      const nextIdx = prev.sizes.length + 1
      return {
        ...prev,
        sizes: [
          ...prev.sizes,
          {
            id: `sz-item-${nextIdx}`,
            name: 'New Size',
            price_delta: 50,
            is_default: false,
            is_active: true,
            sort_order: nextIdx,
          },
        ],
      }
    })
  }

  const handleRemoveSize = (id) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s.id !== id),
    }))
  }

  const handleUpdateSize = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }))
  }

  const isPharmacyDomain = useMemo(() => {
    const mType = (merchant?.type || merchant?.business_type || '').toLowerCase()
    const mName = (merchant?.name || '').toLowerCase()
    const mCat = (merchant?.primary_category || merchant?.category || '').toLowerCase()
    const itemCat = (formData.category_type || '').toLowerCase()
    return (
      mType.includes('pharmacy') ||
      mType.includes('health') ||
      mType.includes('medical') ||
      mName.includes('pharmacy') ||
      mCat.includes('pharmacy') ||
      itemCat.includes('pharmacy') ||
      itemCat.includes('medicine') ||
      itemCat.includes('drug') ||
      Boolean(item?.requires_prescription)
    )
  }, [merchant, formData.category_type, item])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    const stamp = Date.now()
    onSave({
      ...formData,
      id: formData.id || `item-${stamp}`,
      sku: formData.sku?.trim() ? formData.sku : `SKU-${stamp.toString().slice(-4)}`,
      price: Number(formData.price) || 0,
      stock_quantity: Number(formData.stock_quantity) || 0,
      requires_prescription: isPharmacyDomain ? Boolean(formData.requires_prescription) : false,
      is_age_restricted: isPharmacyDomain ? Boolean(formData.is_age_restricted) : false,
      expiry_date: isPharmacyDomain ? (formData.expiry_date || '') : '',
      is_available: isPharmacyDomain ? Boolean(formData.is_available) : (formData.is_available ?? true),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35]">
              <span className="material-symbols-outlined text-lg">
                {isEdit ? 'edit_square' : 'add_circle'}
              </span>
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
              {isEdit ? 'Edit Menu Product' : 'Add New Menu Item'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Category & Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300">
                Menu Category *
              </label>
              <select
                name="category_type"
                value={formData.category_type}
                onChange={(e) => {
                  const selectedName = e.target.value
                  const matched = availableCategories.find((c) => c.name === selectedName)
                  setFormData((prev) => ({
                    ...prev,
                    category_type: selectedName,
                    menu_category_id: matched?.id || prev.menu_category_id,
                  }))
                }}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name} ({cat.code || 'Assigned'})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-slate-400">
                Relates to {merchant?.name || 'merchant'}&apos;s categories
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-zinc-300">
                Item / Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Double Beef Smash Burger"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-zinc-300">
              Item Description
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Fresh artisanal ingredients, preparation specifics, allergen notes..."
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-medium text-slate-800 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          {/* Price, Unit, Stock, SKU */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300">
                Base Price (ETB) *
              </label>
              <input
                type="number"
                name="price"
                min="0"
                required
                value={formData.price}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-slate-800 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300">
                Measurement Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                placeholder="pcs, kg, liters, box"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock_quantity"
                min="0"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-semibold text-slate-800 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300">
                SKU / Barcode
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono font-semibold text-slate-800 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Product Image Upload & Expiry Date (Expiry Date conditional on Pharmacy) */}
          <div className={`grid grid-cols-1 gap-4 ${isPharmacyDomain ? 'sm:grid-cols-2' : ''}`}>
            <div>
              <label className="block font-bold text-slate-700 dark:text-zinc-300">
                Product Image
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {formData.image_url ? (
                <div className="mt-1.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-zinc-700 dark:bg-zinc-800">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                    <img
                      src={formData.image_url}
                      alt="Uploaded preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                      Image attached
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Product image ready
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-[#FF6B35] hover:underline"
                      >
                        Change Image
                      </button>
                      <span className="text-slate-300 dark:text-zinc-600">•</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-[11px] font-bold text-rose-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group mt-1.5 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-3.5 transition hover:border-[#FF6B35] hover:bg-orange-50/30 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-[#FF6B35]"
                >
                  <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-[#FF6B35]">
                    cloud_upload
                  </span>
                  <span className="text-xs font-bold text-slate-700 group-hover:text-[#FF6B35] dark:text-zinc-300">
                    Upload Product Image
                  </span>
                </button>
              )}
            </div>

            {isPharmacyDomain && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Required for pharmaceutical medications & regulated products
                </p>
              </div>
            )}
          </div>

          {/* Specialized Compliance & Ordering Toggles - strictly for Pharmacy / Healthcare data as requested */}
          {isPharmacyDomain && (
            <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-zinc-800 dark:bg-zinc-850">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-[#FF6B35]"
                />
                <span className="font-bold text-slate-800 dark:text-zinc-200">
                  Available for Ordering
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="requires_prescription"
                  checked={formData.requires_prescription}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-rose-600"
                />
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  Prescription Required (Rx)
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="is_age_restricted"
                  checked={formData.is_age_restricted}
                  onChange={handleChange}
                  className="h-4 w-4 rounded accent-amber-600"
                />
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  Age Restricted (18+)
                </span>
              </label>
            </div>
          )}

          {/* Sizes Section */}
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-zinc-800">
              <span className="font-bold text-slate-800 dark:text-zinc-200">
                Sizes & Variants (menu_item_sizes)
              </span>
              <button
                type="button"
                onClick={handleAddSize}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF6B35] hover:underline"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                <span>Add Variant</span>
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {formData.sizes.map((sz) => (
                <div key={sz.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={sz.name}
                    onChange={(e) => handleUpdateSize(sz.id, 'name', e.target.value)}
                    placeholder="Size Name (e.g. Large, 1kg)"
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-semibold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400">Delta ETB:</span>
                    <input
                      type="number"
                      value={sz.price_delta}
                      onChange={(e) => handleUpdateSize(sz.id, 'price_delta', Number(e.target.value))}
                      className="w-20 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-bold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(sz.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f]"
            >
              {isEdit ? 'Save Changes' : 'Create Menu Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
