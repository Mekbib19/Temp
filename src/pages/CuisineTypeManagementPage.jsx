import { useMemo, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'
import { formatLatestUpdate } from '../utils/format'
import {
  loadStoredCuisines,
  saveStoredCuisines,
  generateUUID,
  slugify,
} from '../data/demoCuisines'
import { loadStoredCategories } from '../data/demoCategories'

const emptyCuisineForm = {
  id: '',
  category_id: '',
  name: '',
  description: '',
  icon: '',
  image: '', // uploaded icon image as base64 or URL
  is_active: true,
  sort_order: 1,
}

const CuisineTypeManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategoryFilter = searchParams.get('category') || 'all'

  // Data states
  const [cuisines, setCuisines] = useState(() => loadStoredCuisines())
  const [categories] = useState(() => loadStoredCategories())

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'inactive'
  const [sortBy, setSortBy] = useState('sort_order_asc') // 'sort_order_asc' | 'sort_order_desc' | 'name_asc' | 'name_desc' | 'category_asc' | 'created_desc' | 'updated_desc'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCuisine, setEditingCuisine] = useState(null)
  const [formData, setFormData] = useState(emptyCuisineForm)
  const [formErrors, setFormErrors] = useState({})
  const fileInputRef = useRef(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const processUploadedFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (SVG, PNG, JPG, or WebP).')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Icon file size should be under 3MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, image: dataUrl }))
        showToast(`Loaded "${file.name}" as cuisine icon.`)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleIconFileUpload = (e) => {
    const file = e.target.files?.[0]
    processUploadedFile(file)
    if (e.target) e.target.value = ''
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setIsDraggingFile(false)
    const file = e.dataTransfer.files?.[0]
    processUploadedFile(file)
  }

  const handleFileDragOver = (e) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }

  const handleFileDragLeave = (e) => {
    e.preventDefault()
    setIsDraggingFile(false)
  }


  // Delete modal
  const [cuisineToDelete, setCuisineToDelete] = useState(null)

  // Toast notice
  const [toastMessage, setToastMessage] = useState(null)

  // Expandable description IDs
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

  // Drag-and-drop state
  const [draggedCuisineId, setDraggedCuisineId] = useState(null)
  const [dragOverCuisineId, setDragOverCuisineId] = useState(null)

  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Handle reordering up/down
  const handleMoveOrder = (cuisineId, direction) => {
    updateCuisinesState((prev) => {
      const sorted = [...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const currentIndex = sorted.findIndex((c) => c.id === cuisineId)
      if (currentIndex === -1) return prev
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (targetIndex < 0 || targetIndex >= sorted.length) return prev

      const item = sorted[currentIndex]
      sorted.splice(currentIndex, 1)
      sorted.splice(targetIndex, 0, item)

      return sorted.map((c, idx) => ({
        ...c,
        sort_order: idx + 1,
        updated_at: c.id === cuisineId ? new Date().toISOString() : c.updated_at,
      }))
    })
    showToast('Cuisine sort order updated.')
  }

  // Drag and drop event handlers
  const handleDragStart = (e, cuisineId) => {
    e.dataTransfer.setData('text/plain', cuisineId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedCuisineId(cuisineId)
  }

  const handleDragOver = (e, cuisineId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCuisineId !== cuisineId) {
      setDragOverCuisineId(cuisineId)
    }
  }

  const handleDrop = (e, targetCuisineId) => {
    e.preventDefault()
    const sourceCuisineId = e.dataTransfer.getData('text/plain') || draggedCuisineId
    setDraggedCuisineId(null)
    setDragOverCuisineId(null)
    if (!sourceCuisineId || sourceCuisineId === targetCuisineId) return

    updateCuisinesState((prev) => {
      const sorted = [...prev].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      const sourceIndex = sorted.findIndex((c) => c.id === sourceCuisineId)
      const targetIndex = sorted.findIndex((c) => c.id === targetCuisineId)
      if (sourceIndex === -1 || targetIndex === -1) return prev

      const [removed] = sorted.splice(sourceIndex, 1)
      sorted.splice(targetIndex, 0, removed)

      return sorted.map((c, idx) => ({
        ...c,
        sort_order: idx + 1,
        updated_at: c.id === sourceCuisineId ? new Date().toISOString() : c.updated_at,
      }))
    })
    showToast('Cuisine reordered successfully.')
  }

  // Update cuisines and persist
  const updateCuisinesState = (updater) => {
    setCuisines((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveStoredCuisines(next)
      return next
    })
  }

  // Category map for fast lookup
  const categoryMap = useMemo(() => {
    const map = new Map()
    categories.forEach((cat) => {
      map.set(cat.id, cat)
    })
    return map
  }, [categories])

  // Filter & sort logic
  const filteredCuisines = useMemo(() => {
    return cuisines
      .filter((cuisine) => {
        // Status filter
        if (statusFilter === 'active' && !cuisine.is_active) return false
        if (statusFilter === 'inactive' && cuisine.is_active) return false

        // Category filter
        if (selectedCategoryFilter !== 'all' && cuisine.category_id !== selectedCategoryFilter) {
          return false
        }

        // Search filter
        if (!searchQuery.trim()) return true
        const query = searchQuery.toLowerCase().trim()
        const parentCategory = categoryMap.get(cuisine.category_id)
        const parentName = parentCategory ? parentCategory.name.toLowerCase() : ''

        return (
          cuisine.name.toLowerCase().includes(query) ||
          (cuisine.description && cuisine.description.toLowerCase().includes(query)) ||
          parentName.includes(query)
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
          case 'category_asc': {
            const catA = categoryMap.get(a.category_id)?.name || ''
            const catB = categoryMap.get(b.category_id)?.name || ''
            return catA.localeCompare(catB)
          }
          case 'created_desc':
            return new Date(b.created_at || 0) - new Date(a.created_at || 0)
          case 'updated_desc':
            return new Date(b.updated_at || 0) - new Date(a.updated_at || 0)
          default:
            return a.sort_order - b.sort_order
        }
      })
  }, [cuisines, statusFilter, selectedCategoryFilter, searchQuery, sortBy, categoryMap])

  // Paginated records
  const totalPages = Math.ceil(filteredCuisines.length / rowsPerPage) || 1
  const paginatedCuisines = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredCuisines.slice(start, start + rowsPerPage)
  }, [filteredCuisines, currentPage, rowsPerPage])

  // Metrics summary
  const metrics = useMemo(() => {
    const total = cuisines.length
    const active = cuisines.filter((c) => c.is_active).length
    const inactive = total - active
    const uniqueCategoriesLinked = new Set(cuisines.map((c) => c.category_id)).size
    return { total, active, inactive, uniqueCategoriesLinked }
  }, [cuisines])

  // Open modal for Create
  const handleOpenCreateModal = (prefillCategoryId = null) => {
    setEditingCuisine(null)
    const nextOrder = cuisines.length > 0 ? Math.max(...cuisines.map((c) => c.sort_order || 0)) + 1 : 1
    const defaultCatId =
      prefillCategoryId ||
      (selectedCategoryFilter !== 'all' ? selectedCategoryFilter : categories[0]?.id || '')

    setFormData({
      ...emptyCuisineForm,
      category_id: defaultCatId,
      sort_order: nextOrder,
      icon: '',
      image: '',
      is_active: true,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  // Open modal for Edit
  const handleOpenEditModal = (cuisine) => {
    setEditingCuisine(cuisine)
    setFormData({
      id: cuisine.id,
      category_id: cuisine.category_id,
      name: cuisine.name,
      description: cuisine.description || '',
      icon: cuisine.icon || '',
      image: cuisine.image || '',
      is_active: cuisine.is_active,
      sort_order: cuisine.sort_order || 1,
    })
    setFormErrors({})
    setIsModalOpen(true)
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
    if (!formData.category_id) {
      errors.category_id = 'Category is required.'
    }

    if (!formData.name.trim()) {
      errors.name = 'Cuisine type name is required.'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.'
    }

    if (formData.sort_order === '' || isNaN(formData.sort_order)) {
      errors.sort_order = 'Sort order must be an integer.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save Cuisine Type (Create or Update)
  const handleSaveCuisine = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const now = new Date().toISOString()
    const computedSlug = slugify(formData.name.trim())

    const parentCat = categoryMap.get(formData.category_id)
    const catCode = parentCat?.code || 'FOOD'

    if (editingCuisine) {
      // Update
      updateCuisinesState((prev) =>
        prev.map((c) =>
          c.id === editingCuisine.id
            ? {
                ...c,
                category_id: formData.category_id,
                category_code: catCode,
                name: formData.name.trim(),
                slug: computedSlug || c.slug,
                description: formData.description.trim(),
                icon: formData.icon || '',
                image: formData.image || '',
                is_active: formData.is_active,
                sort_order: parseInt(formData.sort_order, 10) || 1,
                updated_at: now,
              }
            : c
        )
      )
      showToast(`Specialization "${formData.name.trim()}" updated successfully!`)
    } else {
      // Create new
      const newCuisine = {
        id: generateUUID(),
        category_id: formData.category_id,
        category_code: catCode,
        name: formData.name.trim(),
        slug: computedSlug,
        description: formData.description.trim(),
        icon: formData.icon || '',
        image: formData.image || '',
        is_active: formData.is_active,
        sort_order: parseInt(formData.sort_order, 10) || 1,
        created_at: now,
        updated_at: now,
      }
      updateCuisinesState((prev) => [...prev, newCuisine])
      showToast(`Specialization "${newCuisine.name}" created successfully!`)
    }

    setIsModalOpen(false)
  }

  // Quick toggle is_active directly from table
  const handleToggleStatus = (cuisine) => {
    const updatedStatus = !cuisine.is_active
    const now = new Date().toISOString()
    updateCuisinesState((prev) =>
      prev.map((c) =>
        c.id === cuisine.id ? { ...c, is_active: updatedStatus, updated_at: now } : c
      )
    )
    showToast(
      `"${cuisine.name}" is now ${updatedStatus ? 'Active' : 'Inactive'}`
    )
  }

  // Delete Cuisine Type
  const handleConfirmDelete = () => {
    if (!cuisineToDelete) return
    updateCuisinesState((prev) => prev.filter((c) => c.id !== cuisineToDelete.id))
    showToast(`Cuisine type "${cuisineToDelete.name}" deleted.`)
    setCuisineToDelete(null)
  }

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cuisines, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `cuisine_types_export_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast(`Exported ${cuisines.length} cuisine types to JSON.`)
  }

  // Handle setting category filter from table badge
  const handleFilterByCategory = (categoryId) => {
    setCurrentPage(1)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (categoryId === 'all') {
        next.delete('category')
      } else {
        next.set('category', categoryId)
      }
      return next
    })
  }

  return (
    <MainLayout
      activeMenuKey="cuisineManagement"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Specializations (cuisine_types)"
    >
      <div className="space-y-6 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl ring-1 ring-white/10 dark:bg-zinc-100 dark:text-zinc-900">
            <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600">
              check_circle
            </span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header matching unified management style */}
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                Cuisine Types
              </h1>
              <span className="inline-flex items-center rounded-lg bg-orange-100 px-2.5 py-1 font-mono text-xs font-bold text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                cuisine_types
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
              Specialization and cuisine types for merchants within each category (Food, Grocery, Pharmacy, Retail, Flowers & Gifts, Services, Package)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Download all cuisines as JSON"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Cuisine Type
            </button>
          </div>
        </section>

        {/* Standardized Metric Cards matching Merchant Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Cuisines
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">dinner_dining</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.total}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                Specialty types
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
                Categories Linked
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">account_tree</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {metrics.uniqueCategoriesLinked} / {categories.length}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Category links
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
                Pending activation
              </span>
            </div>
          </div>
        </section>

        {/* Category-Specific Specialization Tabs */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Filter by Merchant Category
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              {filteredCuisines.length} {filteredCuisines.length === 1 ? 'specialization' : 'specializations'} displayed
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => handleFilterByCategory('all')}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                selectedCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <span className="material-symbols-outlined text-base">apps</span>
              <span>All Categories</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                selectedCategoryFilter === 'all'
                  ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                  : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}>
                {cuisines.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategoryFilter === cat.id
              const count = cuisines.filter((c) => c.category_id === cat.id).length
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleFilterByCategory(cat.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#FF6B35] text-white shadow-sm ring-2 ring-[#FF6B35]/40'
                      : 'border border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {cat.icon || 'category'}
                  </span>
                  <span>{cat.name}</span>
                  {cat.code && (
                    <span className={`rounded font-mono text-[9px] px-1 py-0.2 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {cat.code}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

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
              placeholder="Search by cuisine name, description, or category..."
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

          {/* Category Filter Column */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Category
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => handleFilterByCategory(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Column */}
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

          {/* Sort Dropdown Column */}
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

        {/* Selected Category Banner (if filtered) */}
        {selectedCategoryFilter !== 'all' && (
          <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50/70 px-4 py-2.5 dark:border-orange-900/50 dark:bg-orange-950/20">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#FF6B35]">filter_list</span>
              <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                Filtering by Category:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-xs font-bold text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100">
                {categoryMap.get(selectedCategoryFilter)?.image ? (
                  <img
                    src={categoryMap.get(selectedCategoryFilter)?.image}
                    alt=""
                    className="h-3.5 w-3.5 object-contain"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-[#FF6B35]">
                    {(categoryMap.get(selectedCategoryFilter)?.name || 'C').slice(0, 2).toUpperCase()}
                  </span>
                )}
                {categoryMap.get(selectedCategoryFilter)?.name || 'Unknown Category'}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">
                ({filteredCuisines.length} {filteredCuisines.length === 1 ? 'cuisine' : 'cuisines'})
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

        {/* Cuisines Data Table */}
        {filteredCuisines.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/90 font-bold uppercase tracking-wider text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-200">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Order
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    Cuisine Type
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
                {paginatedCuisines.map((cuisine, rowIdx) => {
                    const parentCategory = categoryMap.get(cuisine.category_id)
                    const isExpanded = expandedDescIds.has(cuisine.id)
                    const isDragging = draggedCuisineId === cuisine.id
                    const isOver = dragOverCuisineId === cuisine.id

                    return (
                      <tr
                        key={cuisine.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, cuisine.id)}
                        onDragOver={(e) => handleDragOver(e, cuisine.id)}
                        onDrop={(e) => handleDrop(e, cuisine.id)}
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
                              title="Click and drag to reorder cuisine sequence"
                            >
                              <span className="material-symbols-outlined text-[18px]">drag_indicator</span>
                            </span>
                            <span className="inline-flex h-6 min-w-7 items-center justify-center rounded-md bg-slate-100 px-1.5 text-[11px] font-bold text-slate-800 dark:bg-zinc-800 dark:text-zinc-200">
                              #{cuisine.sort_order ?? rowIdx + 1}
                            </span>
                            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(cuisine.id, 'up')}
                                className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-[#FF6B35] dark:text-zinc-500 dark:hover:text-orange-400"
                                title="Move up"
                              >
                                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_up</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(cuisine.id, 'down')}
                                className="h-3 w-4 flex items-center justify-center text-slate-400 hover:text-[#FF6B35] dark:text-zinc-500 dark:hover:text-orange-400"
                                title="Move down"
                              >
                                <span className="material-symbols-outlined text-[12px]">keyboard_arrow_down</span>
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Icon + Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/50 dark:bg-orange-950/30 dark:ring-orange-800/30 overflow-hidden">
                              {cuisine.image ? (
                                <img
                                  src={cuisine.image}
                                  alt={cuisine.name}
                                  className="h-6 w-6 object-contain"
                                />
                              ) : (
                                <span className="text-xs font-black tracking-wider uppercase text-[#FF6B35]">
                                  {cuisine.name.slice(0, 2)}
                                </span>
                              )}
                            </span>
                            <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 dark:text-zinc-100">
                              {cuisine.name}
                            </span>
                          </div>
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
                              {parentCategory.image ? (
                                <img
                                  src={parentCategory.image}
                                  alt={parentCategory.name}
                                  className="h-3.5 w-3.5 object-contain"
                                />
                              ) : (
                                <span className="material-symbols-outlined text-sm text-[#FF6B35]">
                                  {parentCategory.icon || 'category'}
                                </span>
                              )}
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

                        {/* Description Cell: Logical show more / show less (only when text is large) */}
                        {(() => {
                          const hasText = Boolean(cuisine.description && cuisine.description.trim().length > 0)
                          const isExpandable = Boolean(
                            cuisine.description && (cuisine.description.trim().length > 60 || cuisine.description.includes('\n'))
                          )

                          return (
                            <td
                              className={`max-w-xs px-5 py-4 text-slate-700 dark:text-zinc-300 ${
                                isExpandable ? 'cursor-pointer' : ''
                              }`}
                              onClick={() => {
                                if (isExpandable) {
                                  toggleDescription(cuisine.id)
                                }
                              }}
                              title={
                                hasText
                                  ? isExpandable
                                    ? isExpanded
                                      ? 'Click to show less'
                                      : 'Click to show more'
                                    : cuisine.description
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
                                    cuisine.description
                                  ) : (
                                    <span className="italic text-slate-400">No description provided</span>
                                  )}
                                </p>
                                {isExpandable && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleDescription(cuisine.id)
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

                        {/* Status Toggle */}
                        <td className="whitespace-nowrap px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cuisine)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                              cuisine.is_active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                            title="Click to toggle status"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                cuisine.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {cuisine.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* Ticket 4: Latest Update Column with WCAG AA Darkened Text (#374151 / slate-700) */}
                        <td className="whitespace-nowrap px-5 py-4 text-xs">
                          {(() => {
                            const updateInfo = formatLatestUpdate(cuisine)
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
                              onClick={() => handleOpenEditModal(cuisine)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                              title="Edit Cuisine details"
                            >
                              <span className="material-symbols-outlined text-[19px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCuisineToDelete(cuisine)}
                              className="flex h-9 w-9 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg text-rose-600 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
                              title="Delete Cuisine Type (Requires confirmation)"
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
              No cuisine types found matching criteria
            </h3>
            <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
              Try adjusting your search criteria, clearing category filters, or create a new cuisine type.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
              {(searchQuery || selectedCategoryFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    handleFilterByCategory('all')
                    setStatusFilter('all')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenCreateModal()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#e05624]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Cuisine Type
              </button>
            </div>
          </div>
        )}

        {/* Pagination identical to Brand Directory */}
        {filteredCuisines.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCuisines.length}
            startItem={(currentPage - 1) * rowsPerPage + 1}
            endItem={Math.min(currentPage * rowsPerPage, filteredCuisines.length)}
            rowsPerPage={rowsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onRowsPerPageChange={(size) => {
              setRowsPerPage(size)
              setCurrentPage(1)
            }}
            itemName="cuisines"
          />
        )}

        {/* Create / Edit Cuisine Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-xl">
                      {editingCuisine ? 'edit' : 'add'}
                    </span>
                  </span>
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-slate-900 dark:text-zinc-50">
                      {editingCuisine ? 'Edit Specialization Type' : 'Add New Specialization Type'}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Define a category-specific specialization type (<code className="font-mono text-[11px] text-[#FF6B35]">cuisine_types</code>) for merchants.
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

              <form onSubmit={handleSaveCuisine} className="mt-5 space-y-4">
                {/* Category Selector */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Merchant Category <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Category-Specific Table</span>
                  </div>
                  <select
                    value={formData.category_id}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, category_id: e.target.value }))
                      if (formErrors.category_id) {
                        setFormErrors((prev) => ({ ...prev, category_id: null }))
                      }
                    }}
                    className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:outline-none dark:bg-zinc-800 dark:text-zinc-200 ${
                      formErrors.category_id
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700'
                    }`}
                  >
                    <option value="" disabled>
                      Select merchant category...
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.code ? `[${cat.code}] ` : ''}{cat.name} ({cat.description})
                      </option>
                    ))}
                  </select>
                  {formErrors.category_id && (
                    <p className="mt-1 text-[11px] text-rose-500">{formErrors.category_id}</p>
                  )}
                </div>

                {/* Cuisine Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Cuisine Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Neapolitan Wood-Fired Pizzas, Habesha Wats & Stews"
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

                {/* Upload Cuisine Icon as Image */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Cuisine Icon Image
                    </label>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                      Upload custom image (SVG, PNG, JPG, WebP)
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*,.svg"
                    onChange={handleIconFileUpload}
                    className="hidden"
                  />

                  {formData.image ? (
                    /* Image preview & action controls */
                    <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-orange-200/80 bg-orange-50/40 p-4 dark:border-zinc-700 dark:bg-zinc-800/40 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-orange-200 bg-white p-2 shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
                          <img
                            src={formData.image}
                            alt="Cuisine Icon"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Custom Icon Loaded
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                            {formData.name ? `${formData.name} Icon` : 'Uploaded Icon Image'}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                            Square icon will display across merchant cards, menus, and table records.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <span className="material-symbols-outlined text-[15px]">upload</span>
                          Change Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
                          title="Remove custom icon image"
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Dropzone to upload image */
                    <div
                      onDragOver={handleFileDragOver}
                      onDragLeave={handleFileDragLeave}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition ${
                        isDraggingFile
                          ? 'border-[#FF6B35] bg-orange-50/60 dark:bg-orange-950/20'
                          : 'border-slate-200 bg-slate-50/60 hover:border-[#FF6B35]/70 hover:bg-orange-50/20 dark:border-zinc-700 dark:bg-zinc-800/40 dark:hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/80 text-[#FF6B35] dark:bg-orange-950/60">
                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                      </div>
                      <p className="mt-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Click to upload icon image, or drag & drop here
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                        SVG, PNG, JPG, or WebP up to 3MB (Square 1:1 format recommended)
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#e0531f]"
                      >
                        <span className="material-symbols-outlined text-[15px]">file_upload</span>
                        Browse Image File
                      </button>
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
                    placeholder="Provide details about culinary style, key signature ingredients, and regional flavor profiles..."
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
                    {editingCuisine ? 'Save Changes' : 'Create Cuisine Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal: matching Category Management */}
        {cuisineToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/40">
                  <span className="material-symbols-outlined text-2xl">warning</span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-50">
                    Delete Cuisine Type
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Are you sure you want to permanently delete this cuisine type?
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/50">
                <p className="font-semibold text-slate-800 dark:text-zinc-200">
                  {cuisineToDelete.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Category: {categoryMap.get(cuisineToDelete.category_id)?.name || 'N/A'}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCuisineToDelete(null)}
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

export default CuisineTypeManagementPage
