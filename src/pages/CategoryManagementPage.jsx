import { useMemo, useState, useRef } from 'react'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { formatLatestUpdate } from '../utils/format'
import {
  loadStoredCategories,
  saveStoredCategories,
  generateUUID,
  slugify,
  PRESET_ICON_ASSETS,
  downloadIconFile,
} from '../data/demoCategories'

const AVAILABLE_ICONS = [
  { name: 'lunch_dining', label: 'Burgers' },
  { name: 'restaurant', label: 'Dining' },
  { name: 'local_pizza', label: 'Pizza' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'ramen_dining', label: 'Noodles & Ramen' },
  { name: 'cake', label: 'Bakery & Cake' },
  { name: 'nutrition', label: 'Salads & Greens' },
  { name: 'local_bar', label: 'Beverages' },
  { name: 'set_meal', label: 'Seafood' },
  { name: 'celebration', label: 'Special Occasions' },
  { name: 'icecream', label: 'Desserts' },
  { name: 'bakery_dining', label: 'Breads & Pastry' },
  { name: 'fastfood', label: 'Fast Food' },
  { name: 'takeout_dining', label: 'Takeout' },
  { name: 'egg_alt', label: 'Breakfast' },
  { name: 'soup_kitchen', label: 'Soups & Stews' },
  { name: 'liquor', label: 'Cocktails' },
  { name: 'local_cafe', label: 'Cafe' },
  { name: 'emoji_food_beverage', label: 'Hot Drinks' },
  { name: 'tapas', label: 'Appetizers' },
]

const emptyCategoryForm = {
  id: '',
  name: '',
  description: '',
  icon: 'restaurant',
  image: '', // optional custom image / downloaded icon
  is_active: true,
  sort_order: 1,
}

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState(() => loadStoredCategories())
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
  const [sortBy, setSortBy] = useState('sort_order_asc') // 'sort_order_asc' | 'sort_order_desc' | 'name_asc' | 'name_desc' | 'created_desc' | 'updated_desc'

  // Pagination states matching Merchant Management
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState(emptyCategoryForm)
  const [formErrors, setFormErrors] = useState({})
  const [iconMode, setIconMode] = useState('symbol') // 'symbol' | 'image'
  const fileInputRef = useRef(null)

  // Delete modal
  const [categoryToDelete, setCategoryToDelete] = useState(null)

  // Toast notice
  const [toastMessage, setToastMessage] = useState(null)

  // Drag-and-drop state & inline reordering
  const [draggedCatId, setDraggedCatId] = useState(null)
  const [dragOverCatId, setDragOverCatId] = useState(null)

  // Expanded descriptions set
  const [expandedDescIds, setExpandedDescIds] = useState(() => new Set())

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

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Handle reordering up/down
  const handleMoveOrder = (catId, direction) => {
    updateCategoriesState((prev) => {
      const sorted = [...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const currentIndex = sorted.findIndex((c) => c.id === catId)
      if (currentIndex === -1) return prev
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev

      const item = sorted[currentIndex]
      sorted.splice(currentIndex, 1)
      sorted.splice(targetIndex, 0, item)

      return sorted.map((c, idx) => ({
        ...c,
        sort_order: idx + 1,
        updated_at: c.id === catId ? new Date().toISOString() : c.updated_at,
      }))
    })
    showToast('Category sort order updated.')
  }

  // Drag and drop event handlers
  const handleDragStart = (e, catId) => {
    e.dataTransfer.setData('text/plain', catId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedCatId(catId)
  }

  const handleDragOver = (e, catId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCatId !== catId) {
      setDragOverCatId(catId)
    }
  }

  const handleDrop = (e, targetCatId) => {
    e.preventDefault()
    const sourceCatId = e.dataTransfer.getData('text/plain') || draggedCatId
    setDraggedCatId(null)
    setDragOverCatId(null)
    if (!sourceCatId || sourceCatId === targetCatId) return

    updateCategoriesState((prev) => {
      const sorted = [...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const sourceIndex = sorted.findIndex((c) => c.id === sourceCatId)
      const targetIndex = sorted.findIndex((c) => c.id === targetCatId)
      if (sourceIndex === -1 || targetIndex === -1) return prev

      const [removed] = sorted.splice(sourceIndex, 1)
      sorted.splice(targetIndex, 0, removed)

      return sorted.map((c, idx) => ({
        ...c,
        sort_order: idx + 1,
        updated_at: c.id === sourceCatId ? new Date().toISOString() : c.updated_at,
      }))
    })
    showToast('Category reordered successfully.')
  }

  // Update categories and persist
  const updateCategoriesState = (updater) => {
    setCategories((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveStoredCategories(next)
      return next
    })
  }

  // Filter & sort logic
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (statusFilter === 'active' && !cat.is_active) return false
        if (statusFilter === 'inactive' && cat.is_active) return false

        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase().trim()
        return (
          cat.name.toLowerCase().includes(query) ||
          (cat.description && cat.description.toLowerCase().includes(query))
        )
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'sort_order_asc':
            return a.sort_order - b.sort_order
          case 'sort_order_desc':
            return b.sort_order - a.sort_order
          case 'name_asc':
            return a.name.localeCompare(b.name)
          case 'name_desc':
            return b.name.localeCompare(a.name)
          case 'created_desc':
            return new Date(b.created_at || 0) - new Date(a.created_at || 0)
          case 'updated_desc':
            return new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
          default:
            return a.sort_order - b.sort_order
        }
      })
  }, [categories, statusFilter, searchQuery, sortBy])

  // Paginated records
  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage) || 1
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredCategories.slice(start, start + rowsPerPage)
  }, [filteredCategories, currentPage, rowsPerPage])

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = categories.length
    const active = categories.filter((c) => c.is_active).length
    const inactive = total - active
    const withIcons = categories.filter((c) => Boolean(c.icon)).length
    return { total, active, inactive, withIcons }
  }, [categories])

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingCategory(null)
    const nextOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order || 0)) + 1 : 1
    setFormData({
      ...emptyCategoryForm,
      sort_order: nextOrder,
      icon: 'restaurant',
      image: '',
      is_active: true,
    })
    setIconMode('symbol')
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Open Modal for Edit
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat)
    setFormData({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      icon: cat.icon || 'restaurant',
      image: cat.image || '',
      is_active: cat.is_active,
      sort_order: cat.sort_order || 1,
    })
    setIconMode(cat.image ? 'image' : 'symbol')
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Handle image upload from file (SVG, PNG, JPG, WebP)
  const handleIconFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image or SVG file.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Icon file should be under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, image: dataUrl }))
        setIconMode('image')
        showToast(`Loaded "${file.name}" as category icon.`)
      }
    }
    reader.readAsDataURL(file)
  }

  // Form field change handlers
  const handleNameChange = (e) => {
    const val = e.target.value
    setFormData((prev) => ({ ...prev, name: val }))
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: null }))
    }
  }

  // Form validation
  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) {
      errors.name = 'Category name is required.'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.'
    }

    if (formData.sort_order === '' || isNaN(formData.sort_order)) {
      errors.sort_order = 'Sort order must be an integer.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save Category
  const handleSaveCategory = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const now = new Date().toISOString()
    const computedSlug = slugify(formData.name.trim())

    if (editingCategory) {
      updateCategoriesState((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formData.name.trim(),
                slug: computedSlug || c.slug,
                description: formData.description.trim(),
                icon: formData.icon,
                image: formData.image || '',
                is_active: formData.is_active,
                sort_order: parseInt(formData.sort_order, 10) || 1,
                updated_at: now,
              }
            : c
        )
      )
      showToast(`Category "${formData.name.trim()}" updated successfully!`)
    } else {
      const newCategory = {
        id: generateUUID(),
        name: formData.name.trim(),
        slug: computedSlug,
        description: formData.description.trim(),
        icon: formData.icon || 'restaurant',
        image: formData.image || '',
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order, 10) || 1,
        created_at: now,
        updated_at: now,
      }
      updateCategoriesState((prev) => [...prev, newCategory])
      showToast(`Category "${newCategory.name}" created successfully!`)
    }

    setIsModalOpen(false)
  }

  // Toggle active state
  const handleToggleActive = (id) => {
    const target = categories.find((c) => c.id === id)
    if (!target) return
    const nextStatus = !target.is_active
    const now = new Date().toISOString()
    updateCategoriesState((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: nextStatus, updated_at: now } : c))
    )
    showToast(`"${target.name}" set to ${nextStatus ? 'Active' : 'Inactive'}`)
  }

  // Delete Category
  const handleConfirmDelete = () => {
    if (!categoryToDelete) return
    updateCategoriesState((prev) => prev.filter((c) => c.id !== categoryToDelete.id))
    showToast(`Category "${categoryToDelete.name}" deleted.`)
    setCategoryToDelete(null)
  }

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(categories, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `categories_export_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast(`Exported ${categories.length} categories to JSON.`)
  }

  return (
    <MainLayout
      activeMenuKey="categoryManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Categories"
    >
      <div className="space-y-6 pb-12">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl ring-1 ring-white/10 dark:bg-zinc-100 dark:text-zinc-900">
            <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header matching Merchant Management style */}
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Category Management
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Configure global food categories, visual iconography, ordering priorities, and storefront availability
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Download categories database as JSON"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export JSON
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Category
            </button>
          </div>
        </section>

        {/* Standardized Metric Cards matching Merchant Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Categories
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
                Active catalog
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
                Assigned Icons
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">category</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.withIcons}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Visual tags
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

        {/* Filter & Controls Bar - Order Management Filter Style with Matching Size Filters Icon and Search Engine */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <span className="material-symbols-outlined text-lg text-slate-400">filter_list</span>
            <span className="text-sm font-semibold text-slate-600 dark:text-zinc-300">Filters</span>
          </div>
          <div className="mx-2 hidden h-6 w-px bg-slate-300/80 md:block dark:bg-zinc-600" />

          {/* Search Engine - Matching Size with Filters Card */}
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
              placeholder="Search category name, description..."
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

          {/* Status Filter Column */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Category Status
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

          {/* Sort Dropdown Column */}
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
              <option value="created_desc">Newest Added</option>
              <option value="updated_desc">Recently Updated</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setCurrentPage(1)
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Categories Table View */}
        {filteredCategories.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Order
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Category Name
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
                {paginatedCategories.map((cat, rowIdx) => {
                    const isExpanded = expandedDescIds.has(cat.id)
                    const isDragging = draggedCatId === cat.id
                    const isOver = dragOverCatId === cat.id

                    return (
                      <tr
                        key={cat.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, cat.id)}
                        onDragOver={(e) => handleDragOver(e, cat.id)}
                        onDrop={(e) => handleDrop(e, cat.id)}
                        className={`group transition-all ${
                          isDragging ? 'opacity-40 bg-orange-50/50 dark:bg-orange-950/20' : ''
                        } ${
                          isOver ? 'ring-2 ring-[#FF6B35] ring-inset bg-orange-50/30' : 'hover:bg-slate-50/80 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {/* Ticket 1: Dynamic Sort Order & Interactive Drag Handle with Reorder Controls */}
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono font-medium text-slate-700 dark:text-zinc-300">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="cursor-grab active:cursor-grabbing text-slate-400 transition hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                              title="Click and drag to reorder category sequence"
                            >
                              <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                            </span>
                            <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[11px] font-bold text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                              #{cat.sort_order ?? rowIdx + 1}
                            </span>
                            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(cat.id, 'up')}
                                className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-[#FF6B35] dark:text-zinc-500 dark:hover:text-orange-400"
                                title="Move up"
                              >
                                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_up</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(cat.id, 'down')}
                                className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-[#FF6B35] dark:text-zinc-500 dark:hover:text-orange-400"
                                title="Move down"
                              >
                                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_down</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Icon / Image + Name: Guaranteed same size for image or icon */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/50 dark:bg-orange-950/30 dark:ring-orange-800/30 overflow-hidden"
                              title={cat.image ? 'Custom Icon Image' : `Symbol: ${cat.icon || 'restaurant'}`}
                            >
                              {cat.image ? (
                                <img
                                  src={cat.image}
                                  alt={cat.name}
                                  className="h-6 w-6 object-contain"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-2xl">{cat.icon || 'restaurant'}</span>
                              )}
                            </span>
                            <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-zinc-100">
                              {cat.name}
                            </span>
                          </div>
                        </td>

                        {/* Description Cell: Logical show more / show less (only when text is large) */}
                        {(() => {
                          const hasText = Boolean(cat.description && cat.description.trim().length > 0)
                          const isExpandable = Boolean(
                            cat.description && (cat.description.trim().length > 60 || cat.description.includes('\n'))
                          )

                          return (
                            <td
                              className={`max-w-xs px-5 py-4 text-slate-700 dark:text-zinc-300 ${
                                isExpandable ? 'cursor-pointer' : ''
                              }`}
                              onClick={() => {
                                if (isExpandable) {
                                  toggleDescription(cat.id)
                                }
                              }}
                              title={
                                hasText
                                  ? isExpandable
                                    ? isExpanded
                                      ? 'Click to show less'
                                      : 'Click to show more'
                                    : cat.description
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
                                    cat.description
                                  ) : (
                                    <span className="italic text-slate-400">No description provided</span>
                                  )}
                                </p>
                                {isExpandable && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleDescription(cat.id)
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
                            onClick={() => handleToggleActive(cat.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                              cat.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                            title="Click to toggle status"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                cat.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {cat.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Ticket 4: Latest Update Column with WCAG AA Darkened Text (#374151 / slate-700) */}
                        <td className="whitespace-nowrap px-5 py-4 text-xs">
                          {(() => {
                            const updateInfo = formatLatestUpdate(cat)
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
                                <span>
                                  {updateInfo.relativeText}
                                </span>
                              </div>
                            )
                          })()}
                        </td>

                        {/* Ticket 3: Action Buttons with >= 32x32px hitboxes and destructive confirmation */}
                        <td className="whitespace-nowrap px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(cat)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              title="Edit Category details"
                            >
                              <span className="material-symbols-outlined text-[19px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryToDelete(cat)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                              title="Delete Category (Requires confirmation)"
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
              No categories found matching criteria
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              Try adjusting your search terms or filters.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setCurrentPage(1)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#e05624]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Category
              </button>
            </div>
          </div>
        )}

        {/* Pagination identical to Brand Directory */}
        {filteredCategories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCategories.length}
            startItem={(currentPage - 1) * rowsPerPage + 1}
            endItem={Math.min(currentPage * rowsPerPage, filteredCategories.length)}
            rowsPerPage={rowsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={(size) => {
              setRowsPerPage(size)
              setCurrentPage(1)
            }}
            itemName="categories"
          />
        )}

        {/* Add / Edit Category Modal: matching Cuisine Type design */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-xl">
                      {editingCategory ? 'edit' : 'add'}
                    </span>
                  </span>
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-slate-900 dark:text-zinc-50">
                      {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Specify category name, visual icon, ordering priority, and storefront status.
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

              <form onSubmit={handleSaveCategory} className="mt-5 space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Traditional Ethiopian & Habesha Bites, Artisan Burgers"
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:outline-none dark:bg-zinc-800 dark:text-zinc-200 ${
                      formErrors.name
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-[11px] text-rose-500">{formErrors.name}</p>
                  )}
                </div>

                {/* Visual Icon / Image: Same size guaranteed (40x40 container with 24x24 icon/image) */}
                <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-850">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        Category Visual Icon
                      </label>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Choose a system symbol or custom image. Both are rendered in the exact same size.
                      </p>
                    </div>

                    {/* Live Preview Badge - Exact same 40x40 / 24x24 dimensions */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Preview
                      </span>
                      <span
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 shadow-xs dark:bg-orange-950/40 dark:ring-orange-800/40 overflow-hidden"
                        title="Live icon/image preview (same size guaranteed)"
                      >
                        {formData.image ? (
                          <img
                            src={formData.image}
                            alt="Category icon preview"
                            className="h-6 w-6 object-contain"
                          />
                        ) : (
                          <span className="material-symbols-outlined text-2xl">
                            {formData.icon || 'restaurant'}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="mt-3 flex rounded-lg bg-slate-200/60 p-0.5 dark:bg-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIconMode('symbol')
                        setFormData((prev) => ({ ...prev, image: '' }))
                      }}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                        iconMode === 'symbol' && !formData.image
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-zinc-900 dark:text-zinc-100'
                          : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      System Material Icon
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIconMode('image')
                      }}
                      className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                        iconMode === 'image' || Boolean(formData.image)
                          ? 'bg-white text-[#FF6B35] shadow-xs dark:bg-zinc-900 dark:text-orange-400'
                          : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                      }`}
                    >
                      Custom Image Icon (Optional)
                    </button>
                  </div>

                  {iconMode === 'symbol' && !formData.image ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <select
                          value={formData.icon}
                          onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                        >
                          {AVAILABLE_ICONS.map((ico) => (
                            <option key={ico.name} value={ico.name}>
                              {ico.name} — {ico.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const selectedPreset = PRESET_ICON_ASSETS.find(
                              (p) => p.id === formData.icon || p.name.toLowerCase().includes(formData.icon)
                            ) || PRESET_ICON_ASSETS[0]
                            downloadIconFile(
                              `${slugify(formData.name || formData.icon)}-icon`,
                              selectedPreset.svg
                            )
                            showToast(`Downloaded "${formData.icon || 'category'}" icon as SVG file.`)
                          }}
                          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                          title="Download this icon as .SVG to your computer"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          Download .SVG
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {/* Upload from file */}
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleIconFileUpload}
                          accept="image/svg+xml,image/png,image/jpeg,image/webp,image/x-icon"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 px-4 py-2.5 text-xs font-semibold text-[#FF6B35] transition hover:bg-orange-100/60 dark:border-orange-900/60 dark:bg-orange-950/20"
                        >
                          <span className="material-symbols-outlined text-[18px]">upload_file</span>
                          Upload Custom Icon / Image (SVG, PNG, JPG)
                        </button>
                      </div>

                      {/* Image URL Input */}
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                          Or image web URL / data URI:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.image}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, image: e.target.value }))
                            }
                            placeholder="https://... or data:image/..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                          />
                          {formData.image && (
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                              title="Clear custom image"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sort Order & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, sort_order: e.target.value }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                    {formErrors.sort_order && (
                      <p className="mt-1 text-[11px] text-rose-500">{formErrors.sort_order}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Active Status
                    </label>
                    <div className="mt-1.5 flex h-[42px] items-center">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-[#FF6B35] focus:ring-[#FF6B35] dark:border-zinc-600"
                        />
                        <span>{formData.is_active ? 'Active' : 'Inactive'}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Description */}
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
                    placeholder="Provide details about food types, flavor profiles, and menu highlights..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                {/* Form Actions */}
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
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal: identical to Cuisine Type */}
        {categoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/40">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-50">
                    Delete Category
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Are you sure you want to permanently delete this category?
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/50 dark:bg-orange-950/30 dark:ring-orange-800/30 overflow-hidden">
                  {categoryToDelete.image ? (
                    <img
                      src={categoryToDelete.image}
                      alt={categoryToDelete.name}
                      className="h-6 w-6 object-contain"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-2xl">
                      {categoryToDelete.icon || 'restaurant'}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">{categoryToDelete.name}</p>
                  {categoryToDelete.description && (
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                      {categoryToDelete.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(null)}
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

export default CategoryManagementPage
