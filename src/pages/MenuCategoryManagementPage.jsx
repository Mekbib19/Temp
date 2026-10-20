import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { formatLatestUpdate } from '../utils/format'
import {
  loadStoredMenuCategories,
  saveStoredMenuCategories,
  generateUUID,
} from '../data/demoMenuCategories'
import { loadStoredCategories } from '../data/demoCategories'

const emptyForm = {
  id: '',
  category_id: '',
  name: '',
  description: '',
  is_active: true,
  sort_order: 1,
}

const MenuCategoryManagementPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategoryFilter = searchParams.get('category') || 'all'

  const handleOpenDetails = (item) => {
    navigate(`/menu-categories/${item.id}`)
  }

  // Data states
  const [categories] = useState(() => loadStoredCategories())
  const [menuCategories, setMenuCategories] = useState(() => loadStoredMenuCategories())

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
  const [sortBy, setSortBy] = useState('sort_order_asc')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})

  // Delete modal
  const [itemToDelete, setItemToDelete] = useState(null)

  // Toast notice
  const [toastMessage, setToastMessage] = useState(null)

  // Expandable description IDs
  const [expandedDescIds, setExpandedDescIds] = useState(() => new Set())

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current))
    }, 3000)
  }

  const toggleDescription = (id) => {
    setExpandedDescIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Drag and drop state
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  // Category lookup map
  const categoryMap = useMemo(() => {
    const map = new Map()
    categories.forEach((cat) => {
      map.set(cat.id, cat)
    })
    return map
  }, [categories])

  // Category filter handler
  const handleFilterByCategory = (categoryId) => {
    if (categoryId === 'all') {
      searchParams.delete('category')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ category: categoryId })
    }
    setCurrentPage(1)
  }

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let result = [...menuCategories]

    // Category filter
    if (selectedCategoryFilter !== 'all') {
      result = result.filter((item) => item.category_id === selectedCategoryFilter)
    }

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((item) => item.is_active)
    } else if (statusFilter === 'inactive') {
      result = result.filter((item) => !item.is_active)
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(query)
        const descMatch = item.description?.toLowerCase().includes(query)
        const cat = categoryMap.get(item.category_id)
        const catMatch = cat?.name?.toLowerCase().includes(query)
        return nameMatch || descMatch || catMatch
      })
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'sort_order_asc') {
        return (a.sort_order ?? 9999) - (b.sort_order ?? 9999)
      }
      if (sortBy === 'sort_order_desc') {
        return (b.sort_order ?? 9999) - (a.sort_order ?? 9999)
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === 'name_desc') {
        return b.name.localeCompare(a.name)
      }
      if (sortBy === 'category_asc') {
        const catA = categoryMap.get(a.category_id)?.name || ''
        const catB = categoryMap.get(b.category_id)?.name || ''
        return catA.localeCompare(catB)
      }
      if (sortBy === 'created_desc') {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      }
      if (sortBy === 'updated_desc') {
        return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0)
      }
      return 0
    })

    return result
  }, [menuCategories, selectedCategoryFilter, statusFilter, searchQuery, sortBy, categoryMap])

  // Pagination slice
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredItems.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredItems, currentPage, rowsPerPage])

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = menuCategories.length
    const active = menuCategories.filter((i) => i.is_active).length
    const inactive = total - active
    const categoriesCovered = new Set(
      menuCategories.map((i) => i.category_id).filter(Boolean)
    ).size

    return { total, active, inactive, categoriesCovered }
  }, [menuCategories])

  // Toggle active status
  const handleToggleStatus = (item) => {
    const nextStatus = !item.is_active
    const updated = menuCategories.map((i) =>
      i.id === item.id
        ? { ...i, is_active: nextStatus, updated_at: new Date().toISOString() }
        : i
    )
    setMenuCategories(updated)
    saveStoredMenuCategories(updated)
    showToast(`"${item.name}" set to ${nextStatus ? 'Active' : 'Inactive'}.`)
  }

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingItem(null)
    const defaultCatId =
      selectedCategoryFilter !== 'all' ? selectedCategoryFilter : categories[0]?.id || ''
    const currentMaxSort = menuCategories
      .filter((i) => !defaultCatId || i.category_id === defaultCatId)
      .reduce((max, i) => Math.max(max, i.sort_order || 0), 0)

    setFormData({
      ...emptyForm,
      category_id: defaultCatId,
      sort_order: currentMaxSort + 1,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setFormData({
      id: item.id,
      category_id: item.category_id || '',
      name: item.name || '',
      description: item.description || '',
      is_active: item.is_active ?? true,
      sort_order: item.sort_order || 1,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData(emptyForm)
    setFormErrors({})
  }

  // Handle Name input change
  const handleNameChange = (val) => {
    setFormData((prev) => ({ ...prev, name: val }))
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: null }))
    }
  }

  // Handle Form Submit
  const handleSaveItem = (e) => {
    e.preventDefault()
    const errors = {}

    if (!formData.name.trim()) {
      errors.name = 'Menu category name is required.'
    }

    if (!formData.category_id) {
      errors.category_id = 'Please select a Merchant category.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const selectedCategory = categoryMap.get(formData.category_id)
    const categoryCode = selectedCategory?.code || 'FOOD'

    if (editingItem) {
      // Update
      const updated = menuCategories.map((i) => {
        if (i.id === editingItem.id) {
          return {
            ...i,
            category_id: formData.category_id,
            category_code: categoryCode,
            name: formData.name.trim(),
            description: formData.description.trim(),
            is_active: Boolean(formData.is_active),
            sort_order: Number(formData.sort_order) || 1,
            updated_at: new Date().toISOString(),
          }
        }
        return i
      })
      setMenuCategories(updated)
      saveStoredMenuCategories(updated)
      showToast(`Updated menu category "${formData.name.trim()}".`)
    } else {
      // Create new
      const newItem = {
        id: generateUUID(),
        category_id: formData.category_id,
        category_code: categoryCode,
        name: formData.name.trim(),
        description: formData.description.trim(),
        is_active: Boolean(formData.is_active),
        sort_order: Number(formData.sort_order) || 1,
        merchant_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      const updated = [newItem, ...menuCategories]
      setMenuCategories(updated)
      saveStoredMenuCategories(updated)
      showToast(`Created new menu category "${formData.name.trim()}".`)
    }

    handleCloseModal()
  }

  // Delete handlers
  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    const updated = menuCategories.filter((i) => i.id !== itemToDelete.id)
    setMenuCategories(updated)
    saveStoredMenuCategories(updated)
    showToast(`Deleted "${itemToDelete.name}".`)
    setItemToDelete(null)
  }

  // Drag and drop reordering
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id)
    setDraggedId(id)
  }

  const handleDragOver = (e, id) => {
    e.preventDefault()
    if (id !== dragOverId) {
      setDragOverId(id)
    }
  }

  const handleDrop = (e, targetId) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain')
    setDraggedId(null)
    setDragOverId(null)

    if (!sourceId || sourceId === targetId) return

    const sourceIdx = menuCategories.findIndex((i) => i.id === sourceId)
    const targetIdx = menuCategories.findIndex((i) => i.id === targetId)
    if (sourceIdx === -1 || targetIdx === -1) return

    const clone = [...menuCategories]
    const [moved] = clone.splice(sourceIdx, 1)
    clone.splice(targetIdx, 0, moved)

    // Re-index sort_order
    const reordered = clone.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
      updated_at: new Date().toISOString(),
    }))

    setMenuCategories(reordered)
    saveStoredMenuCategories(reordered)
    showToast('Reordered menu categories sequence.')
  }

  // Move order up / down single step
  const handleMoveOrder = (id, direction) => {
    const currentIndex = menuCategories.findIndex((i) => i.id === id)
    if (currentIndex === -1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= menuCategories.length) return

    const clone = [...menuCategories]
    const temp = clone[currentIndex]
    clone[currentIndex] = clone[targetIndex]
    clone[targetIndex] = temp

    const reordered = clone.map((item, idx) => ({
      ...item,
      sort_order: idx + 1,
      updated_at: new Date().toISOString(),
    }))

    setMenuCategories(reordered)
    saveStoredMenuCategories(reordered)
  }

  return (
    <MainLayout
      activeMenuKey="menuCategory"
      breadcrumbParent="Management"
      breadcrumbCurrent="Menu Categories"
    >
      <div className="space-y-6">
        {/* Toast Notice */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-slate-900">
            <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600 text-lg">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                Menu Categories
              </h1>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
              Product and menu item categories organized by category.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FF6B35] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e0531f] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/30 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Add Menu Category</span>
            </button>
          </div>
        </section>

        {/* Metric Cards Row */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Types
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">restaurant_menu</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.total}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                Product catalog
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
                Categories Covered
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">category</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.categoriesCovered}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Main categories
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Inactive / Draft
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
                Hidden items
              </span>
            </div>
          </div>
        </section>

        {/* Filter & Controls Bar */}
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
              placeholder="Search menu category, description..."
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

          {/* Category Filter Dropdown */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Category
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => handleFilterByCategory(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex min-w-[130px] flex-col gap-1">
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

          {/* Sort Dropdown */}
          <div className="flex min-w-[160px] flex-col gap-1">
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
              <option value="category_asc">Category Name</option>
              <option value="created_desc">Newest Added</option>
              <option value="updated_desc">Recently Updated</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || selectedCategoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                handleFilterByCategory('all')
                setStatusFilter('all')
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Filtered Category Notification */}
        {selectedCategoryFilter !== 'all' && (
          <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-2.5 dark:border-orange-900/50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#FF6B35]">filter_list</span>
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Filtering by Category:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100">
                {categoryMap.get(selectedCategoryFilter)?.name || 'Selected Category'}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleFilterByCategory('all')}
              className="text-xs font-semibold text-[#FF6B35] hover:underline"
            >
              Show all categories
            </button>
          </div>
        )}

        {/* Data Table */}
        {filteredItems.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Order
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Menu Category Name
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Category
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
                  {paginatedItems.map((item, rowIdx) => {
                    const parentCategory = categoryMap.get(item.category_id)
                    const isExpanded = expandedDescIds.has(item.id)
                    const isDragging = draggedId === item.id
                    const isOver = dragOverId === item.id

                    return (
                      <tr
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragOver={(e) => handleDragOver(e, item.id)}
                        onDrop={(e) => handleDrop(e, item.id)}
                        className={`group transition-all ${
                          isDragging ? 'opacity-40 bg-orange-50/50 dark:bg-orange-950/20' : ''
                        } ${
                          isOver
                            ? 'ring-2 ring-[#FF6B35] ring-inset bg-orange-50/30'
                            : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {/* Order & Reorder Controls */}
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono font-medium text-slate-700 dark:text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="cursor-grab active:cursor-grabbing text-slate-400 transition hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                              title="Click and drag to reorder menu category sequence"
                            >
                              <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                            </span>
                            <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[11px] font-bold text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                              #{item.sort_order ?? rowIdx + 1}
                            </span>
                            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(item.id, 'up')}
                                className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-[#FF6B35] dark:text-zinc-500 dark:hover:text-orange-400"
                                title="Move up"
                              >
                                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_up</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(item.id, 'down')}
                                className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-[#FF6B35] dark:text-zinc-500 dark:hover:text-orange-400"
                                title="Move down"
                              >
                                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_down</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Menu Category Name */}
                        <td className="px-5 py-4">
                          <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-zinc-100">
                            {item.name}
                          </span>
                        </td>

                        {/* Category Tag */}
                        <td className="whitespace-nowrap px-5 py-4">
                          {parentCategory ? (
                            <button
                              type="button"
                              onClick={() => handleFilterByCategory(parentCategory.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:text-orange-400"
                              title="Click to filter by this category"
                            >
                              <span className="material-symbols-outlined text-sm text-[#FF6B35]">
                                {parentCategory.icon || 'category'}
                              </span>
                              <span>{parentCategory.name}</span>
                              {parentCategory.code && (
                                <span className="rounded bg-orange-100 px-1 py-0.2 font-mono text-[9px] font-bold text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                                  {parentCategory.code}
                                </span>
                              )}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                              <span className="material-symbols-outlined text-xs">link_off</span>
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Description Cell */}
                        {(() => {
                          const hasText = Boolean(item.description && item.description.trim().length > 0)
                          const isExpandable = Boolean(
                            item.description &&
                              (item.description.trim().length > 60 || item.description.includes('\n'))
                          )

                          return (
                            <td
                              className={`max-w-xs px-5 py-4 text-slate-700 dark:text-zinc-300 ${
                                isExpandable ? 'cursor-pointer' : ''
                              }`}
                              onClick={() => {
                                if (isExpandable) {
                                  toggleDescription(item.id)
                                }
                              }}
                            >
                              <div>
                                <p
                                  className={`${
                                    isExpandable && !isExpanded ? 'line-clamp-2' : ''
                                  } text-xs leading-relaxed`}
                                >
                                  {hasText ? (
                                    item.description
                                  ) : (
                                    <span className="italic text-slate-400">No description provided</span>
                                  )}
                                </p>
                                {isExpandable && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleDescription(item.id)
                                    }}
                                    className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#FF6B35] transition hover:text-[#e0531f] hover:underline focus:outline-none"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <span>Show less</span>
                                        <span className="material-symbols-outlined text-[14px]">
                                          expand_less
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span>Show more</span>
                                        <span className="material-symbols-outlined text-[14px]">
                                          expand_more
                                        </span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          )
                        })()}

                        {/* Status Toggle */}
                        <td className="whitespace-nowrap px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                              item.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                            title="Click to toggle status"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {item.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Latest Update Column */}
                        <td className="whitespace-nowrap px-5 py-4 text-xs">
                          {(() => {
                            const updateInfo = formatLatestUpdate(item)
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

                        {/* Action Buttons */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                          <button
                           type="button"
                           onClick={() => handleOpenDetails(item)}
                          className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-500 transition hover:bg-orange-50 hover:text-[#FF6B35] dark:text-zinc-400 dark:hover:bg-orange-950/30 dark:hover:text-orange-400"
                              title="View menu category details"
                                >
                             <span className="material-symbols-outlined text-lg">visibility</span>
                                  </button>

                          {/* existing edit button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              title="Edit menu category"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setItemToDelete(item)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                              title="Delete menu category"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <div className="border-t border-slate-200 px-5 py-3.5 dark:border-zinc-800">
              <Pagination
                totalItems={filteredItems.length}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                onRowsPerPageChange={(rows) => {
                  setRowsPerPage(rows)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-4xl text-slate-400">restaurant_menu</span>
            <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-zinc-100">
              No menu categories found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-zinc-400">
              {searchQuery || selectedCategoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search criteria or resetting the active filters.'
                : 'Get started by creating your first product/menu category.'}
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Add Menu Category</span>
            </button>
          </div>
        )}

        {/* Add / Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-lg">
                      {editingItem ? 'edit' : 'add'}
                    </span>
                  </span>
                  <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-slate-900 dark:text-zinc-100">
                    {editingItem ? 'Edit Menu Category' : 'Add New Menu Category'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="mt-5 space-y-4">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Merchant Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, category_id: e.target.value }))
                      if (formErrors.category_id) {
                        setFormErrors((prev) => ({ ...prev, category_id: null }))
                      }
                    }}
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm font-medium text-slate-800 shadow-2xs transition focus:border-[#FF6B35] focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                      formErrors.category_id
                        ? 'border-red-500'
                        : 'border-slate-200 dark:border-zinc-700'
                    }`}
                  >
                    <option value="">Select a Merchant Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  {formErrors.category_id && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.category_id}</p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Burgers, Drinks, Fruits, Medicines"
                    className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-3 text-sm font-medium text-slate-800 shadow-2xs transition focus:border-[#FF6B35] focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                      formErrors.name ? 'border-red-500' : 'border-slate-200 dark:border-zinc-700'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>


                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of items included in this menu category..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 shadow-2xs transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Sort Order & Active Switch */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sort_order: Number(e.target.value) || 1 }))
                      }
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 shadow-2xs transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-2">
                      Active Status
                    </label>
                    <label className="inline-flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="relative h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-[#FF6B35] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full dark:bg-zinc-700" />
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {formData.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f] focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    <span>{editingItem ? 'Save Changes' : 'Create Menu Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40">
                  <span className="material-symbols-outlined text-xl">delete</span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                    Delete Menu Category
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-zinc-200">&ldquo;{itemToDelete.name}&rdquo;</span>? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default MenuCategoryManagementPage
