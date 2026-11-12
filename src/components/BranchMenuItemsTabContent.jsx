import { useState, useMemo, useRef, useCallback } from 'react'
import Pagination from './Pagination'
import MenuCategoryDetailsPage from '../pages/MenuCategoryDetailsPage'
import {
  saveMenuItem,
  deleteMenuItem,
  getCategoriesForBranch,
  getItemImages,
  getMenuItemsForBranch,
} from '../data/demoMenuItems'

/**
 * Compact Independent Menu Item Card with Image Pagination (Black arrow on white circle)
 */
function MenuItemCard({
  item,
  onToggleAvailability,
  onEdit,
  onDelete,
  onImagePreview,
}) {
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0)
  const itemImages = useMemo(() => {
    const imgs = getItemImages(item)
    return imgs && imgs.length > 0
      ? imgs
      : [item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80']
  }, [item])

  const handlePrevImage = (e) => {
    e.stopPropagation()
    setPrimaryImageIdx((prev) => (prev === 0 ? itemImages.length - 1 : prev - 1))
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    setPrimaryImageIdx((prev) => (prev === itemImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {/* 1. Image Section with Black Arrow on White Circle Pagination */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
        <img
          src={itemImages[primaryImageIdx] || itemImages[0]}
          alt={item.name}
          onClick={() => onImagePreview?.(itemImages[primaryImageIdx] || itemImages[0])}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
        />

        {/* Badges on image */}
        <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-md">
          {primaryImageIdx === 0 ? 'Cover Photo' : `Photo ${primaryImageIdx + 1}/${itemImages.length}`}
        </span>

        <button
          type="button"
          onClick={() => onToggleAvailability?.(item)}
          className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs backdrop-blur-md transition cursor-pointer ${
            item.is_available
              ? 'bg-emerald-500/95 text-white hover:bg-emerald-600'
              : 'bg-black/70 text-zinc-300 hover:bg-black/90'
          }`}
        >
          {item.is_available ? 'Available' : 'Paused'}
        </button>

        {/* Image Pagination: Black arrow button with background of white circle */}
        {itemImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md hover:scale-110 active:scale-95 transition cursor-pointer z-10"
              title="Previous image"
            >
              <span className="material-symbols-outlined text-lg leading-none font-bold">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md hover:scale-110 active:scale-95 transition cursor-pointer z-10"
              title="Next image"
            >
              <span className="material-symbols-outlined text-lg leading-none font-bold">chevron_right</span>
            </button>

            {/* Bottom dots pagination indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-xs">
              {itemImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setPrimaryImageIdx(idx)
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    primaryImageIdx === idx ? 'w-3.5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Jump to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Compact Item Info Section (Extra info moved to detail page) */}
      <div className="mt-3 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              {item.category_type || item.category || 'Menu Item'}
            </span>
            {item.requires_prescription && (
              <span className="flex items-center gap-0.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                Rx
              </span>
            )}
            {item.is_age_restricted && (
              <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                18+
              </span>
            )}
          </div>

          <h3 className="mt-1.5 text-sm font-bold text-slate-900 dark:text-zinc-100 line-clamp-1" title={item.name}>
            {item.name}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">
            {item.description || 'View detail for portions, ingredients and modifiers.'}
          </p>
        </div>

        {/* Pricing and Stock Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
            ETB {item.price} <span className="text-[11px] font-normal text-slate-500">/ {item.unit || 'portion'}</span>
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            Stock: <strong className="text-slate-800 dark:text-zinc-200">{item.stock_quantity ?? 50}</strong>
          </span>
        </div>

        {/* Card Action Buttons: See Detail / Edit & Delete */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onEdit?.(item)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#FF6B35] shadow-2xs hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 transition cursor-pointer"
          >
            <span>See Detail</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(item)}
            className="rounded-xl border border-red-200 p-1.5 text-red-500 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 transition cursor-pointer"
            title="Delete Item"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BranchMenuItemsTabContent({
  menuItems: propMenuItems,
  setMenuItems: propSetMenuItems,
  branch,
  merchant,
  showToast,
  initialCategory = 'all',
}) {
  const [internalItems, setInternalItems] = useState(() => {
    if (Array.isArray(propMenuItems) && propMenuItems.length > 0) return propMenuItems
    return getMenuItemsForBranch(branch?.id, merchant?.id, merchant) || []
  })

  const menuItems = Array.isArray(propMenuItems) ? propMenuItems : internalItems
  const setMenuItems = useCallback(
    (updater) => {
      if (typeof propSetMenuItems === 'function') {
        propSetMenuItems(updater)
      }
      setInternalItems((prev) => (typeof updater === 'function' ? updater(prev) : updater))
    },
    [propSetMenuItems]
  )

  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all') // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [previewModalImage, setPreviewModalImage] = useState(null)

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

  // Modal states
  const [inspectItem, setInspectItem] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [embeddedEditor, setEmbeddedEditor] = useState(null)

  // Filter items
  const filteredItems = useMemo(() => {
    return (menuItems || []).filter((item) => {
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

  // Pagination states matching Super Admin catalog standards
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(8)

  const [prevFilterKey, setPrevFilterKey] = useState('')
  const filterKey = `${selectedCategory}__${searchQuery}__${stockFilter}`
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setCurrentPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedItems = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage
    return filteredItems.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredItems, safeCurrentPage, rowsPerPage])



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
    if (inspectItem?.id === deleteCandidate?.id) setInspectItem(null)
  }

  if (embeddedEditor) {
    return (
      <MenuCategoryDetailsPage
        embedded={true}
        embeddedItemId={embeddedEditor.itemId}
        embeddedBranchId={branch?.id}
        embeddedMerchantId={merchant?.id}
        onEmbeddedClose={() => setEmbeddedEditor(null)}
        onEmbeddedSave={(savedItem) => {
          setMenuItems((prev) => {
            const idx = prev.findIndex((i) => i.id === savedItem.id)
            if (idx >= 0) {
              return prev.map((i) => (i.id === savedItem.id ? savedItem : i))
            }
            return [savedItem, ...prev]
          })
          setEmbeddedEditor(null)
          showToast?.(`"${savedItem.name}" saved to branch catalog successfully.`, 'success')
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Standardized Filter Bar matching unified management pages UI system */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
        <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
          <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
        </div>
        <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

        {/* Search Engine */}
        <div className="relative h-11 min-w-[260px] flex-1">
          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search product name, SKU, ingredients..."
            className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Category Name Filter Dropdown */}
        <div className="flex min-w-[160px] flex-col gap-1">
          <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Category Name
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
          >
            <option value="all">All Categories ({merchantCategories.length})</option>
            {merchantCategories.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Inventory Status Filter */}
        <div className="flex min-w-[140px] flex-col gap-1">
          <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Stock Status
          </label>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock & Active</option>
            <option value="low_stock">Low Stock (≤ 15)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* View Switcher (Grid / Table) */}
        <div className="flex h-11 items-center rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-slate-100 text-[#FF6B35] dark:bg-zinc-800'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
            }`}
            title="Grid View"
          >
            <span className="material-symbols-outlined text-base">grid_view</span>
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-slate-100 text-[#FF6B35] dark:bg-zinc-800'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200'
            }`}
            title="Table View"
          >
            <span className="material-symbols-outlined text-base">view_list</span>
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedCategory !== 'all' || stockFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setStockFilter('all')
            }}
            className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
          >
            Clear All Filters
          </button>
        )}

        {/* Add Menu Item Button - Opens full merged page right on merchant branch page */}
        <button
          type="button"
          onClick={() => setEmbeddedEditor({ itemId: 'new' })}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f] active:scale-95 md:ml-auto"
        >
          <span className="material-symbols-outlined text-base">add</span>
          <span>Add Menu Item</span>
        </button>
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
              onClick={() => setEmbeddedEditor({ itemId: 'new' })}
              className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white hover:bg-[#e0531f]"
            >
              Add First Item
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW - COMPACT RESPONSIVE MENU ITEM CARDS */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {paginatedItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onToggleAvailability={handleToggleAvailability}
              onEdit={(it) => setEmbeddedEditor({ itemId: it.id, item: it })}
              onAddCustomization={(it) => setEmbeddedEditor({ itemId: it.id, item: it })}
              onDelete={(it) => setDeleteCandidate(it)}
              onImagePreview={(url) => setPreviewModalImage(url)}
            />
          ))}
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
                {paginatedItems.map((item) => (
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
                          onClick={() => setEmbeddedEditor({ itemId: item.id, item })}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-orange-50 hover:text-[#FF6B35] dark:hover:bg-zinc-800"
                          title="View & customize menu item extra options"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmbeddedEditor({ itemId: item.id, item })}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-zinc-800"
                          title="Edit Item & Extra Customizations"
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

      {/* Pagination controls matching Super Admin */}
      {filteredItems.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            onRowsPerPageChange={(size) => {
              setRowsPerPage(size)
              setCurrentPage(1)
            }}
          />
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
                  const it = inspectItem
                  setInspectItem(null)
                  setEmbeddedEditor({ itemId: it.id, item: it })
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 px-4 py-2 text-xs font-bold text-[#FF6B35] hover:bg-orange-100 dark:bg-orange-950/40"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Edit Product Details</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const it = inspectItem
                    setInspectItem(null)
                    setEmbeddedEditor({ itemId: it.id, item: it })
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-sm">tune</span>
                  <span>Open Customizations & Options</span>
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

      {/* Lightbox Photo Preview Modal */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
          >
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black transition"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
            <img
              src={previewModalImage}
              alt="Preview"
              className="max-h-[80vh] w-auto object-contain"
            />
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

  const initialImages = item?.images && Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : item?.image_url
    ? [item.image_url]
    : []

  const [formData, setFormData] = useState({
    id: item?.id || '',
    merchant_branch_id: item?.merchant_branch_id || branchId || 'branch-default',
    merchant_id: item?.merchant_id || merchantId || 'm-default',
    menu_category_id: item?.menu_category_id || defaultCatId,
    category_type: item?.category_type || defaultCat,
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price ?? 180,
    images: initialImages,
    image_url: initialImages[0] || item?.image_url || '',
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

  const [isModalDragOver, setIsModalDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleProcessModalFiles = (files) => {
    if (!files || files.length === 0) return
    const valid = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (valid.length === 0) return

    let done = 0
    const newImages = []
    valid.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result)
        }
        done++
        if (done === valid.length) {
          setFormData((prev) => {
            const combined = [...prev.images, ...newImages]
            return {
              ...prev,
              images: combined,
              image_url: combined[0] || '',
            }
          })
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImageIdx = (idxToRemove) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== idxToRemove)
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || '',
      }
    })
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 dark:text-zinc-300">
                  Product Photos ({formData.images?.length || 0})
                </label>
                <span className="text-[10px] text-slate-400">
                  Drag & Drop enabled
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) handleProcessModalFiles(e.target.files)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="hidden"
              />

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsModalDragOver(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsModalDragOver(false)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsModalDragOver(false)
                  if (e.dataTransfer?.files) handleProcessModalFiles(e.dataTransfer.files)
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition ${
                  isModalDragOver
                    ? 'border-[#FF6B35] bg-orange-50/70 dark:bg-orange-950/40'
                    : 'border-slate-200 bg-slate-50/70 hover:border-[#FF6B35] hover:bg-orange-50/20 dark:border-zinc-700 dark:bg-zinc-800'
                }`}
              >
                <span className="material-symbols-outlined text-xl text-[#FF6B35]">
                  {isModalDragOver ? 'file_download' : 'add_photo_alternate'}
                </span>
                <p className="mt-1 text-xs font-bold text-slate-700 dark:text-zinc-200">
                  {isModalDragOver ? 'Drop images to add!' : 'Drag & drop multiple photos or click to select'}
                </p>
                <span className="mt-0.5 text-[9px] text-slate-400">
                  PNG, JPG, WEBP • Select multiple files at once
                </span>
              </div>

              {/* Multi-image preview strip with Plus button */}
              {formData.images && formData.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 pt-1 scroll-smooth">
                  {formData.images.map((img, i) => (
                    <div
                      key={i}
                      className="group/th relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 shadow-2xs dark:border-zinc-700"
                    >
                      <img
                        src={img}
                        alt={`Photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {i === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-[#FF6B35] px-1 py-0.2 text-[8px] font-bold text-white">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImageIdx(i)
                        }}
                        className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded bg-black/60 text-white opacity-0 transition group-hover/th:opacity-100 hover:bg-rose-600"
                      >
                        <span className="material-symbols-outlined text-[10px]">close</span>
                      </button>
                    </div>
                  ))}

                  {/* Plus Tile */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-16 w-16 shrink-0 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white text-[#FF6B35] hover:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800"
                    title="Add more photos"
                  >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span className="text-[9px] font-bold">Add +</span>
                  </div>
                </div>
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
