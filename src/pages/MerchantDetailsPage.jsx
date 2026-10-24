import { useState, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DataTable from '../components/DataTable'
import {
  getMerchantById,
  loadStoredMerchants,
  updateMerchant,
  deleteMerchant,
  getCategoryMeta,
} from '../data/demoMerchants'
import { loadStoredCategories } from '../data/demoCategories'
import {
  loadStoredCuisines,
  saveStoredCuisines,
  generateUUID,
  slugify,
} from '../data/demoCuisines'
import { generateOrdersForMerchant } from '../data/demoOrders'

export default function MerchantDetailsPage() {
  const { merchantId } = useParams()
  const navigate = useNavigate()

  const [merchantsList, setMerchantsList] = useState(() => loadStoredMerchants())
  const [activeTab, setActiveTab] = useState('overview')
  const [branchMapViewMode, setBranchMapViewMode] = useState('network')
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

  const [categoriesList] = useState(() => loadStoredCategories())
  const [cuisinesList, setCuisinesList] = useState(() => loadStoredCuisines())

  // Resolve Category & Cuisine names and objects in proper order
  const categoryObj = useMemo(() => {
    if (!merchant) return null
    if (merchant.category_id) {
      const c = categoriesList.find((cat) => cat.id === merchant.category_id)
      if (c) return c
    }
    if (merchant.category_name) {
      const c = categoriesList.find(
        (cat) => cat.name.toLowerCase() === merchant.category_name.toLowerCase()
      )
      if (c) return c
    }
    return null
  }, [merchant, categoriesList])

  const merchantCatMeta = useMemo(() => {
    return getCategoryMeta(
      merchant?.category_name || categoryObj?.name || merchant?.type
    )
  }, [merchant, categoryObj])

  const assignedCuisines = useMemo(() => {
    if (!merchant) return []
    const ids = Array.isArray(merchant.cuisine_ids) ? merchant.cuisine_ids : []
    if (ids.length > 0) {
      return cuisinesList.filter((c) => ids.includes(c.id))
    }
    if (merchant.cuisine_id) {
      const single = cuisinesList.filter((c) => c.id === merchant.cuisine_id)
      if (single.length > 0) return single
    }
    if (merchant.cuisine_name) {
      const names = merchant.cuisine_name.split(',').map((s) => s.trim().toLowerCase())
      const matched = cuisinesList.filter((c) => names.includes(c.name.toLowerCase()))
      if (matched.length > 0) return matched
    }
    return []
  }, [merchant, cuisinesList])

  // Assign Cuisines Modal State
  const [isAssignCuisinesModalOpen, setIsAssignCuisinesModalOpen] = useState(false)
  const [tempSelectedCuisineIds, setTempSelectedCuisineIds] = useState([])

  // The merchant's effective category id used to scope cuisines
  const merchantCategoryId = useMemo(() => {
    return merchant?.category_id || categoryObj?.id || null
  }, [merchant, categoryObj])

  // Cuisines scoped to the merchant's category (no search anymore)
  const filteredForAssignment = useMemo(() => {
    return cuisinesList.filter((c) => {
      if (merchantCategoryId && c.category_id !== merchantCategoryId) return false
      return true
    })
  }, [cuisinesList, merchantCategoryId])

  // Cuisine Detail Editor Modal State
  const [isCuisineEditorModalOpen, setIsCuisineEditorModalOpen] = useState(false)
  const [editingCuisine, setEditingCuisine] = useState(null)
  const [cuisineFormData, setCuisineFormData] = useState({
    id: '',
    name: '',
    category_id: '',
    slug: '',
    description: '',
    icon: 'restaurant',
    image: '',
    is_active: true,
    sort_order: 1,
  })
  const [cuisineFormErrors, setCuisineFormErrors] = useState({})
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const fileInputRef = useRef(null)

  // Primary Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [tempCategoryId, setTempCategoryId] = useState('')

  // Handlers for Assign Cuisines Modal
  const openAssignCuisinesModal = () => {
    const currentIds = Array.isArray(merchant?.cuisine_ids)
      ? merchant.cuisine_ids
      : merchant?.cuisine_id
      ? [merchant.cuisine_id]
      : []
    setTempSelectedCuisineIds([...currentIds])
    setIsAssignCuisinesModalOpen(true)
  }

  const toggleAssignCuisine = (cuisineId) => {
    setTempSelectedCuisineIds((prev) =>
      prev.includes(cuisineId) ? prev.filter((id) => id !== cuisineId) : [...prev, cuisineId]
    )
  }

  const handleSelectAllFilteredCuisines = (filteredList) => {
    setTempSelectedCuisineIds((prev) => {
      const idSet = new Set(prev)
      filteredList.forEach((c) => idSet.add(c.id))
      return Array.from(idSet)
    })
  }

  const handleClearAllAssignedCuisines = () => {
    setTempSelectedCuisineIds([])
  }

  const handleSaveAssignedCuisines = () => {
    if (!merchant) return
    // Guard: only keep cuisines that belong to the merchant's category
    const selectedObjs = cuisinesList.filter(
      (c) =>
        tempSelectedCuisineIds.includes(c.id) &&
        (!merchantCategoryId || c.category_id === merchantCategoryId)
    )
    const combinedCuisineName = selectedObjs.map((c) => c.name).join(', ')

    updateMerchant(merchant.id, {
      cuisine_ids: selectedObjs.map((c) => c.id),
      cuisine_id: selectedObjs[0]?.id || '',
      cuisine_name: combinedCuisineName,
      cuisines: selectedObjs,
    })

    setMerchantsList(loadStoredMerchants())
    setIsAssignCuisinesModalOpen(false)
    showToast(
      `Assigned cuisines updated for ${merchant.name} (${selectedObjs.length} specializations)`
    )
  }

  const handleRemoveAssignedCuisine = useCallback(
    (cuisineId, e) => {
      if (e) e.stopPropagation()
      if (!merchant) return
      const currentIds = Array.isArray(merchant.cuisine_ids) ? merchant.cuisine_ids : []
      const updatedIds = currentIds.filter((id) => id !== cuisineId)
      const selectedObjs = cuisinesList.filter((c) => updatedIds.includes(c.id))
      const combinedCuisineName = selectedObjs.map((c) => c.name).join(', ')

      updateMerchant(merchant.id, {
        cuisine_ids: updatedIds,
        cuisine_id: updatedIds[0] || '',
        cuisine_name: combinedCuisineName,
        cuisines: selectedObjs,
      })

      setMerchantsList(loadStoredMerchants())
      showToast(`Removed cuisine from ${merchant.name}`)
    },
    [merchant, cuisinesList]
  )

  const openEditCuisineModal = useCallback(
    (cuisine, e) => {
      if (e) e.stopPropagation()
      setEditingCuisine(cuisine)
      setCuisineFormData({
        id: cuisine.id,
        name: cuisine.name || '',
        category_id:
          cuisine.category_id || categoryObj?.id || merchant?.category_id || categoriesList[0]?.id || '',
        slug: cuisine.slug || '',
        description: cuisine.description || '',
        icon: cuisine.icon || 'restaurant',
        image: cuisine.image || '',
        is_active: cuisine.is_active !== undefined ? cuisine.is_active : true,
        sort_order: cuisine.sort_order || 1,
      })
      setCuisineFormErrors({})
      setIsCuisineEditorModalOpen(true)
    },
    [categoryObj?.id, merchant?.category_id, categoriesList]
  )

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
        setCuisineFormData((prev) => ({ ...prev, image: dataUrl }))
        showToast(`Loaded "${file.name}" as cuisine icon.`)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveCuisineDetail = (e) => {
    e.preventDefault()
    if (!cuisineFormData.name || !cuisineFormData.name.trim()) {
      setCuisineFormErrors({ name: 'Cuisine name is required' })
      return
    }

    const now = new Date().toISOString()
    const computedSlug = slugify(cuisineFormData.name.trim())
    let updatedList
    let savedCuisine

    if (editingCuisine && editingCuisine.id) {
      savedCuisine = {
        ...editingCuisine,
        ...cuisineFormData,
        name: cuisineFormData.name.trim(),
        slug: computedSlug || editingCuisine.slug,
        description: (cuisineFormData.description || '').trim(),
        sort_order: parseInt(cuisineFormData.sort_order, 10) || 1,
        updated_at: now,
      }
      updatedList = cuisinesList.map((c) => (c.id === editingCuisine.id ? savedCuisine : c))
      showToast(`Cuisine "${savedCuisine.name}" updated successfully!`)

      const isAssigned =
        Array.isArray(merchant?.cuisine_ids) && merchant.cuisine_ids.includes(savedCuisine.id)
      if (isAssigned && merchant) {
        const selectedObjs = updatedList.filter((c) => merchant.cuisine_ids.includes(c.id))
        updateMerchant(merchant.id, {
          cuisine_name: selectedObjs.map((c) => c.name).join(', '),
          cuisines: selectedObjs,
        })
        setMerchantsList(loadStoredMerchants())
      }
    } else {
      savedCuisine = {
        id: generateUUID(),
        category_id:
          cuisineFormData.category_id || merchantCategoryId || categoriesList[0]?.id || '',
        name: cuisineFormData.name.trim(),
        slug: computedSlug || `cuisine-${Date.now()}`,
        description: (cuisineFormData.description || '').trim(),
        icon: cuisineFormData.icon || 'restaurant',
        image: cuisineFormData.image || '',
        is_active: cuisineFormData.is_active !== undefined ? cuisineFormData.is_active : true,
        sort_order: parseInt(cuisineFormData.sort_order, 10) || cuisinesList.length + 1,
        created_at: now,
        updated_at: now,
      }
      updatedList = [...cuisinesList, savedCuisine]
      showToast(`New cuisine "${savedCuisine.name}" created!`)

      if (merchant) {
        const currentIds = Array.isArray(merchant.cuisine_ids) ? [...merchant.cuisine_ids] : []
        if (!currentIds.includes(savedCuisine.id)) {
          currentIds.push(savedCuisine.id)
          const selectedObjs = updatedList.filter((c) => currentIds.includes(c.id))
          updateMerchant(merchant.id, {
            cuisine_ids: currentIds,
            cuisine_id: currentIds[0] || '',
            cuisine_name: selectedObjs.map((c) => c.name).join(', '),
            cuisines: selectedObjs,
          })
          setMerchantsList(loadStoredMerchants())
        }
      }
    }

    saveStoredCuisines(updatedList)
    setCuisinesList(updatedList)
    setIsCuisineEditorModalOpen(false)
    setEditingCuisine(null)
  }

  // Handlers for Category Selection Modal
  const openCategoryModal = () => {
    setTempCategoryId(categoryObj?.id || merchant?.category_id || categoriesList[0]?.id || '')
    setIsCategoryModalOpen(true)
  }

  const handleSavePrimaryCategory = () => {
    if (!merchant || !tempCategoryId) return
    const chosenCat = categoriesList.find((c) => c.id === tempCategoryId)
    if (!chosenCat) return
    updateMerchant(merchant.id, {
      category_id: chosenCat.id,
      category_name: chosenCat.name,
      type: chosenCat.name,
    })
    setMerchantsList(loadStoredMerchants())
    setIsCategoryModalOpen(false)
    showToast(`Primary category updated to "${chosenCat.name}"`)
  }

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
        is_open: merchant.is_open !== undefined ? Boolean(merchant.is_open) : true,
        accepts_orders:
          merchant.accepts_orders !== undefined ? Boolean(merchant.accepts_orders) : true,
        opening_hours: merchant.opening_hours || '08:00 AM',
        closing_hours: merchant.closing_hours || '10:00 PM',
      },
    ]
  }, [merchant])

  // Orders state for merchant
  const [prevMerchantKey, setPrevMerchantKey] = useState(merchant?.id)
  const [orders, setOrders] = useState(() => generateOrdersForMerchant(merchant, branches))

  const currentMerchantKey = merchant?.id
  if (currentMerchantKey !== prevMerchantKey) {
    setPrevMerchantKey(currentMerchantKey)
    setOrders(generateOrdersForMerchant(merchant, branches))
  }

  // Statistical metrics for merchant overview
  const merchantStats = useMemo(() => {
    const totalOrders = orders.length
    const newOrders = orders.filter(
      (o) => o.statusVariant === 'new' || o.status === 'New' || !o.statusVariant
    ).length
    const prepOrders = orders.filter(
      (o) =>
        o.statusVariant === 'kitchen' ||
        o.status === 'In Kitchen' ||
        o.status === 'Order Packing'
    ).length
    const readyOrders = orders.filter(
      (o) => o.statusVariant === 'ready' || o.status === 'Ready for Pickup'
    ).length
    const deliveryOrders = orders.filter(
      (o) => o.statusVariant === 'delivery' || o.status === 'Out for Delivery'
    ).length
    const deliveredOrders = orders.filter(
      (o) => o.statusVariant === 'delivered' || o.status === 'Delivered'
    ).length

    const computedRevenue = orders.reduce((acc, o) => {
      const num =
        typeof o.totalNum === 'number'
          ? o.totalNum
          : parseFloat((o.total || '').replace(/[^0-9.]/g, '')) || 0
      return acc + num
    }, 0)
    const baseRevenue = computedRevenue > 0 ? computedRevenue : 48250
    const todayRevenueFormatted = `ETB ${Math.round(baseRevenue).toLocaleString()}`
    const avgOrderValueFormatted = `ETB ${Math.round(baseRevenue / Math.max(1, totalOrders))}`

    return {
      totalOrders,
      newOrders,
      prepOrders,
      readyOrders,
      deliveryOrders,
      deliveredOrders,
      todayRevenueFormatted,
      avgOrderValueFormatted,
      fulfillmentRate: '98.5%',
      avgPrepTime: '16.5 min',
      customerRating: merchant?.rating || '4.9',
      reviewCount: 328,
    }
  }, [orders, merchant])

  const currentBranch = branches[0]

  const allBranchesMapData = useMemo(() => {
    if (!branches.length) {
      const lat = 9.0016
      const lng = 38.7842
      return {
        centerLat: lat,
        centerLng: lng,
        bbox: `${lng - 0.04},${lat - 0.03},${lng + 0.04},${lat + 0.03}`,
        src: `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.04},${
          lat - 0.03
        },${lng + 0.04},${lat + 0.03}&layer=mapnik`,
        directionsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
      }
    }
    const lats = branches.map((b) => Number(b.latitude) || 9.0016)
    const lngs = branches.map((b) => Number(b.longitude) || 38.7842)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const padLat = Math.max(0.015, (maxLat - minLat) * 0.45)
    const padLng = Math.max(0.018, (maxLng - minLng) * 0.45)
    const centerLat = Number(((minLat + maxLat) / 2).toFixed(6))
    const centerLng = Number(((minLng + maxLng) / 2).toFixed(6))
    const bbox = `${(minLng - padLng).toFixed(6)},${(minLat - padLat).toFixed(6)},${(
      maxLng + padLng
    ).toFixed(6)},${(maxLat + padLat).toFixed(6)}`
    return {
      centerLat,
      centerLng,
      minLat,
      maxLat,
      minLng,
      maxLng,
      bbox,
      src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${centerLat},${centerLng}`,
      directionsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        (merchant?.name || 'Restaurant') + ' Addis Ababa'
      )}`,
    }
  }, [branches, merchant?.name])

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
      state: {
        toastMessage: `Merchant "${merchant.name}" was successfully removed.`,
      },
    })
  }

  const cuisineColumns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Cuisine / Specialization',
        meta: { headerClassName: 'px-6 py-3.5 text-left font-bold' },
        cell: ({ row }) => {
          const cuisine = row.original
          return (
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xs dark:border-zinc-800 dark:bg-zinc-850">
                {cuisine.image ? (
                  <img src={cuisine.image} alt={cuisine.name} className="h-6 w-6 object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-xl text-amber-500">
                    {cuisine.icon || 'restaurant'}
                  </span>
                )}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {cuisine.name}
                </p>
                <span className="font-mono text-[10px] text-slate-400">/{cuisine.slug}</span>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'category_id',
        header: 'Merchant Category',
        meta: { headerClassName: 'px-4 py-3.5 text-left font-bold' },
        cell: ({ getValue }) => {
          const catId = getValue()
          const parentCat = categoriesList.find((cat) => cat.id === catId)
          return (
            <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
              {parentCat ? parentCat.name : 'General'}
            </span>
          )
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        meta: { headerClassName: 'px-4 py-3.5 text-left font-bold' },
        cell: ({ getValue }) => (
          <p className="max-w-xs truncate text-xs text-slate-500 dark:text-zinc-400">
            {getValue() || '—'}
          </p>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        meta: { headerClassName: 'px-4 py-3.5 text-left font-bold' },
        cell: ({ getValue }) => {
          const isActive = getValue() !== false
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { headerClassName: 'px-6 py-3.5 text-right font-bold' },
        cell: ({ row }) => {
          const cuisine = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={(e) => openEditCuisineModal(cuisine, e)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#FF6B35] dark:hover:bg-zinc-800"
                title="Edit cuisine details"
              >
                <span className="material-symbols-outlined text-base">edit</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleRemoveAssignedCuisine(cuisine.id, e)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-zinc-800"
                title="Remove specialization"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          )
        },
      },
    ],
    [categoriesList, handleRemoveAssignedCuisine, openEditCuisineModal]
  )

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
            The requested merchant profile could not be located in the local storage. It may have
            been deleted.
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
            <span className="material-symbols-outlined text-base text-emerald-400">
              check_circle
            </span>
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
                Are you sure you want to remove{' '}
                <span className="font-bold text-slate-700 dark:text-zinc-200">
                  {merchant.name}
                </span>
                ? This action cannot be undone.
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
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isActive ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {rawStatus}
                </button>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                Merchant Partner Profile & Detailed Operations Console
              </p>
            </div>
          </div>
        </section>

        {/* Hero Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
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
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-800 backdrop-blur-md dark:bg-zinc-900/90 dark:text-zinc-200">
                <span className="material-symbols-outlined text-sm text-[#FF6B35]">
                  storefront
                </span>
                {merchant.type || 'Restaurant & Dining'}
              </span>
              {merchant.is_featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-slate-900 backdrop-blur-md">
                  ★ Featured
                </span>
              )}
            </div>
          </div>

          <div className="relative px-6 pb-6 pt-0 sm:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
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

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-50">
                    {merchant.name}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-300">
                  <button
                    type="button"
                    onClick={openCategoryModal}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition hover:opacity-90 ${merchantCatMeta.badgeClass}`}
                    title="Change Primary Category"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {merchantCatMeta.icon}
                    </span>
                    <span>Category: {merchant.category_name || merchantCatMeta.label}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('branches')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400"
                    title="View operating branches"
                  >
                    <span className="material-symbols-outlined text-sm">store</span>
                    <span>
                      {branches.length} {branches.length === 1 ? 'branch' : 'branches'}
                    </span>
                  </button>

                  {merchant.is_rx_licensed && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300">
                      <span className="material-symbols-outlined text-sm">medication</span>
                      <span>Licensed Rx Pharmacy</span>
                    </span>
                  )}

                  {merchant.is_18_plus && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300">
                      <span className="material-symbols-outlined text-sm">no_adult_content</span>
                      <span>18+ Age Restricted</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 animate-fade-in">
            <div className="space-y-6 lg:col-span-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Today&apos;s Revenue
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                      <span className="material-symbols-outlined text-base">payments</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {merchantStats.todayRevenueFormatted}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-xs">trending_up</span>
                    +14.2% vs yesterday
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Orders Dispatched
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                      <span className="material-symbols-outlined text-base">
                        local_shipping
                      </span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {merchantStats.totalOrders > 0
                      ? `${merchantStats.totalOrders} Orders`
                      : '64 Orders'}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    {merchantStats.fulfillmentRate} fulfillment rate
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Avg Prep SLA
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                      <span className="material-symbols-outlined text-base">timer</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {merchantStats.avgPrepTime}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    On-time SLA compliant
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                      Satisfaction
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-950/40">
                      <span className="material-symbols-outlined text-base">star</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 dark:text-zinc-100">
                    {merchantStats.customerRating} / 5.0
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                    From {merchantStats.reviewCount} ratings
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-red-600 dark:text-red-400">
                      store
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      All Branches & Locations ({branches.length})
                    </h3>
                    <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                      • Direct access to branch roster & live status
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/merchants/${merchant.id}/branches/new`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    <span>Add New Branch</span>
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {branches.map((b, idx) => {
                    const branchKey = b.id || idx
                    const branchOrdersCount =
                      orders.filter(
                        (o) =>
                          (o.branch_name || '').toLowerCase() ===
                          (b.branch_name || '').toLowerCase()
                      ).length || Math.max(4, 18 - idx * 4)
                    const isOpen = b.is_open !== false

                    return (
                      <div
                        key={branchKey}
                        onClick={() =>
                          navigate(`/merchants/${merchant.id}/branches/${b.id || idx}`)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            navigate(`/merchants/${merchant.id}/branches/${b.id || idx}`)
                          }
                        }}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-slate-50/50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400 hover:bg-white hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-850/50 dark:hover:border-red-500 dark:hover:bg-zinc-850 cursor-pointer"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition group-hover:bg-red-500 group-hover:text-white dark:bg-red-950/40 dark:text-red-400 dark:group-hover:bg-red-600 dark:group-hover:text-white">
                            <span className="material-symbols-outlined text-xl">
                              storefront
                            </span>
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition dark:text-zinc-100 dark:group-hover:text-red-400">
                                {b.branch_name}
                              </h4>
                              {b.is_main_branch && (
                                <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                                  HQ / Main
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  isOpen
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    isOpen ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                                {isOpen ? 'Open' : 'Closed'}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-slate-400">
                                  location_on
                                </span>
                                <span>{b.address || 'Central District, Addis Ababa'}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-slate-400">
                                  schedule
                                </span>
                                <span className="font-mono text-[10px]">
                                  {b.opening_hours || '08:00 AM'} -{' '}
                                  {b.closing_hours || '10:00 PM'}
                                </span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-slate-400">
                                  person
                                </span>
                                <span>{b.manager_name || 'Designated Manager'}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs text-slate-400">
                                  receipt_long
                                </span>
                                <span className="font-bold text-slate-700 dark:text-zinc-300">
                                  {branchOrdersCount} orders today
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end sm:self-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/merchants/${merchant.id}/branches/${b.id || idx}`)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500 hover:text-white dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                            title={`Open ${b.branch_name} details`}
                          >
                            <span>Branch Details</span>
                            <span className="material-symbols-outlined text-sm font-bold text-red-600 group-hover:translate-x-0.5 transition-transform group-hover:text-white dark:text-red-400">
                              arrow_forward
                            </span>
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {branches.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                      <p>No branches registered yet for {merchant.name}.</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/merchants/${merchant.id}/branches/new`)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>Add First Branch</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400">
                      store
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Branch Network Performance Comparison ({branches.length} Locations)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('branches')}
                    className="text-xs font-bold text-[#FF6B35] hover:underline"
                  >
                    Manage Locations & GPS →
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                        <th className="pb-2.5">Branch Location</th>
                        <th className="pb-2.5">Manager</th>
                        <th className="pb-2.5 text-center">Live Status</th>
                        <th className="pb-2.5 text-right">Orders Today</th>
                        <th className="pb-2.5 text-right">Fulfillment</th>
                        <th className="pb-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium text-slate-700 dark:text-zinc-300">
                      {branches.map((b, idx) => {
                        const branchOrdersCount =
                          orders.filter(
                            (o) =>
                              (o.branch_name || '').toLowerCase() ===
                              b.branch_name.toLowerCase()
                          ).length || Math.max(8, 24 - idx * 5)
                        return (
                          <tr
                            key={b.id || idx}
                            className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40"
                          >
                            <td className="py-2.5 font-bold text-slate-900 dark:text-zinc-100">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-[#FF6B35]">
                                  pin_drop
                                </span>
                                <span>{b.branch_name}</span>
                                {b.is_main_branch && (
                                  <span className="rounded-md bg-orange-100 px-1.5 py-0.2 text-[9px] font-bold text-[#FF6B35] dark:bg-orange-950/60">
                                    HQ
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-normal pl-5 block">
                                {b.address || 'Addis Ababa'}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-600 dark:text-zinc-400">
                              {b.manager_name || 'Designated Staff'}
                            </td>
                            <td className="py-2.5 text-center">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  b.is_open !== false
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    b.is_open !== false ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                />
                                {b.is_open !== false ? 'Open' : 'Closed'}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-bold text-slate-900 dark:text-zinc-100">
                              {branchOrdersCount}
                            </td>
                            <td className="py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                              98.8%
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/merchants/${merchant.id}/branches/${idx}`)
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-[11px] font-bold text-[#FF6B35] hover:bg-orange-100 dark:bg-orange-950/40"
                              >
                                <span>Stats</span>
                                <span className="material-symbols-outlined text-[12px]">
                                  arrow_forward
                                </span>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-amber-500">
                    schedule
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Daily Peak Volume Heatmap & Order Rush Hours
                  </h3>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                    <span className="text-slate-400 block text-[11px]">Breakfast Rush</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                      08:00 AM - 10:30 AM
                    </span>
                    <span className="mt-1 inline-block text-[10px] text-slate-500">
                      18% of daily volume
                    </span>
                  </div>

                  <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 dark:border-orange-900/40 dark:bg-orange-950/20">
                    <span className="text-[#FF6B35] font-bold block text-[11px]">
                      Lunch Surge (Peak)
                    </span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 mt-1 block">
                      12:00 PM - 02:30 PM
                    </span>
                    <span className="mt-1 inline-block text-[10px] font-bold text-[#FF6B35]">
                      44% of daily volume
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                    <span className="text-slate-400 block text-[11px]">Afternoon Snack</span>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 mt-1 block">
                      03:30 PM - 05:30 PM
                    </span>
                    <span className="mt-1 inline-block text-[10px] text-slate-500">
                      12% of daily volume
                    </span>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                    <span className="text-blue-700 dark:text-blue-300 font-bold block text-[11px]">
                      Dinner Rush
                    </span>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 mt-1 block">
                      07:00 PM - 09:30 PM
                    </span>
                    <span className="mt-1 inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      26% of daily volume
                    </span>
                  </div>
                </div>
              </div>

              {merchant.description && (
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">
                      description
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Merchant Bio & Culinary Concept
                    </h3>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
                    {merchant.description}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <span className="material-symbols-outlined text-base text-indigo-500">
                    storefront
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Partner Overview
                  </h3>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Brand Email
                    </span>
                    <p className="mt-0.5 font-mono text-slate-800 dark:text-zinc-200">
                      {merchant.email || 'partner@delivery.et'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Customer Support Phone
                    </span>
                    <p className="mt-0.5 font-semibold text-slate-800 dark:text-zinc-200">
                      {merchant.phone || '+251 91 123 4567'}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Total Operating Branches
                    </span>
                    <p className="mt-0.5 font-bold text-slate-800 dark:text-zinc-200">
                      {branches.length} {branches.length === 1 ? 'location' : 'locations'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('branches')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <span>Explore All Branches</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#FF6B35]">
                      store
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Main Location
                    </h3>
                  </div>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {currentBranch.is_open !== false ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Address:</span>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">
                      {currentBranch.address ||
                        merchant.address ||
                        'Central Commercial District, Addis Ababa'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Hours:</span>
                    <p className="font-mono text-slate-800 dark:text-zinc-200">
                      {currentBranch.opening_hours || '08:00 AM'} -{' '}
                      {currentBranch.closing_hours || '10:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Branches Directory on Left, Map on Right */}
        {activeTab === 'branches' && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-900/40">
                  <span className="material-symbols-outlined text-xl">pin_drop</span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Location Indicator & Branches
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {branches.length} Branches Plotted
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Full branch directory on the left, and small unified map on the right
                    showing all branch coordinates.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(`/merchants/${merchant.id}/branches/new`)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-sm">add_business</span>
                  <span>Add Branch</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
              <div className="space-y-4 lg:col-span-7 xl:col-span-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      Branches Directory ({branches.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                      All physical store locations.
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {branches.filter((b) => b.is_open !== false).length} Open Now
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {branches.map((b, idx) => {
                    const branchKey = b.id || idx
                    return (
                      <div
                        key={branchKey}
                        id={`branch-card-${idx}`}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6B35] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-[#FF6B35]"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold transition ${
                              b.is_main_branch
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40'
                            }`}
                          >
                            <span className="material-symbols-outlined text-lg">
                              storefront
                            </span>
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1">
                              <h4 className="truncate text-xs font-bold text-slate-900 group-hover:text-[#FF6B35] transition dark:text-zinc-100">
                                {b.branch_name}
                              </h4>
                              {b.is_main_branch && (
                                <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                  HQ
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/merchants/${merchant.id}/branches/${b.id || idx}`)
                          }
                          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-[#FF6B35] ring-1 ring-orange-200/80 hover:bg-[#FF6B35] hover:text-white transition dark:bg-orange-950/40 dark:ring-orange-900/60 dark:text-orange-400"
                        >
                          <span>Manage</span>
                          <span className="material-symbols-outlined text-xs">
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#FF6B35]">
                        map
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Location Indicator
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setBranchMapViewMode('network')}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                          branchMapViewMode === 'network'
                            ? 'bg-emerald-500 text-slate-950 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white'
                        }`}
                        title="Network View with Direction Arrows"
                      >
                        Routes
                      </button>
                      <button
                        type="button"
                        onClick={() => setBranchMapViewMode('osm')}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                          branchMapViewMode === 'osm'
                            ? 'bg-[#FF6B35] text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white'
                        }`}
                        title="City OpenStreetMap View"
                      >
                        Map
                      </button>
                    </div>
                  </div>

                  {branchMapViewMode === 'network' ? (
                    <div className="relative h-64 w-full overflow-hidden bg-[#0A0E17] select-none">
                      <div className="absolute inset-0 pointer-events-none opacity-25">
                        <svg
                          className="h-full w-full"
                          preserveAspectRatio="none"
                          viewBox="0 0 360 250"
                        >
                          <defs>
                            <pattern
                              id="smallGrid"
                              width="20"
                              height="20"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke="#1E293B"
                                strokeWidth="0.5"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#smallGrid)" />
                          <path
                            d="M 0 170 Q 180 130 360 190"
                            fill="none"
                            stroke="#0369a1"
                            strokeWidth="10"
                            opacity="0.25"
                          />
                          <path
                            d="M 40 0 L 320 250"
                            fill="none"
                            stroke="#334155"
                            strokeWidth="5"
                            opacity="0.3"
                          />
                        </svg>
                      </div>

                      <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 360 250"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        {branches.map((b, idx) => {
                          if (idx === 0) return null
                          const angles = [28, 95, -35, 65, -80, 140]
                          const angle = (angles[(idx - 1) % angles.length] * Math.PI) / 180
                          const dist = 115 + ((idx * 20) % 50)
                          const targetX = Math.min(
                            320,
                            Math.max(180, Math.round(95 + Math.cos(angle) * dist))
                          )
                          const targetY = Math.min(
                            215,
                            Math.max(35, Math.round(125 + Math.sin(angle) * dist))
                          )
                          const midX = Math.round((95 + targetX) / 2)
                          const midY = Math.round((125 + targetY) / 2 - 15)
                          const deg =
                            (Math.atan2(targetY - 125, targetX - 95) * 180) / Math.PI + 90

                          return (
                            <g key={`small-branch-net-${b.id || idx}`}>
                              <path
                                d={`M 95 125 Q ${midX} ${midY} ${targetX} ${targetY}`}
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="2"
                                strokeDasharray="4 3"
                              />
                              <g
                                transform={`translate(${Math.round(
                                  95 * 0.5 + targetX * 0.5
                                )}, ${Math.round(125 * 0.5 + targetY * 0.5)}) rotate(${
                                  deg - 90
                                })`}
                              >
                                <polygon
                                  points="-4,-5 5,0 -4,5 -1,0"
                                  fill="#22C55E"
                                  stroke="#064E3B"
                                  strokeWidth="0.8"
                                />
                              </g>
                              <g
                                transform={`translate(${targetX}, ${targetY})`}
                                className="cursor-pointer"
                                onClick={() => {
                                  const el = document.getElementById(`branch-card-${idx}`)
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                }}
                              >
                                <circle r="9" fill="#0F172A" stroke="#10B981" strokeWidth="2" />
                                <circle
                                  r="3.5"
                                  fill={b.is_open !== false ? '#22C55E' : '#94A3B8'}
                                />
                                <text
                                  x="0"
                                  y="18"
                                  textAnchor="middle"
                                  fill="#F8FAFC"
                                  fontSize="8.5"
                                  fontWeight="bold"
                                  fontFamily="system-ui"
                                >
                                  {b.branch_name}
                                </text>
                              </g>
                            </g>
                          )
                        })}

                        <g
                          transform="translate(95, 125)"
                          className="cursor-pointer"
                          onClick={() => {
                            const el = document.getElementById('branch-card-0')
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }}
                        >
                          <circle r="18" fill="#3B82F6" fillOpacity="0.25" className="animate-ping" />
                          <circle r="13" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="2.5" />
                          <circle r="5" fill="#60A5FA" />
                          <text
                            x="0"
                            y="23"
                            textAnchor="middle"
                            fill="#93C5FD"
                            fontSize="9"
                            fontWeight="bold"
                            fontFamily="system-ui"
                          >
                            ★ HQ
                          </text>
                        </g>
                      </svg>

                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 rounded-md bg-slate-900/90 px-2 py-1 text-[10px] text-slate-300 backdrop-blur-md border border-slate-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>All {branches.length} branches mapped</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-64 w-full bg-slate-100 dark:bg-zinc-800">
                      <iframe
                        title={`${merchant.name} Small Map`}
                        src={allBranchesMapData.src}
                        className="h-full w-full border-0"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="border-t border-slate-100 p-3 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-800/30">
                    <div className="flex flex-wrap gap-1.5">
                      {branches.map((b, idx) => (
                        <button
                          key={`map-chip-${b.id || idx}`}
                          type="button"
                          onClick={() => {
                            const el = document.getElementById(`branch-card-${idx}`)
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:border-[#FF6B35] hover:text-[#FF6B35] transition dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              idx === 0 ? 'bg-blue-500' : 'bg-emerald-500'
                            }`}
                          />
                          <span className="truncate max-w-[100px]">{b.branch_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Category & Cuisines */}
        {activeTab === 'cuisines' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-xl">
                      restaurant
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Assigned Cuisine Types ({assignedCuisines.length})
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    Specializations mapped to this merchant. Used for search filters, dietary
                    tagging, and customer menus.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={openAssignCuisinesModal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                    title="Open in-modal cuisine assignment"
                  >
                    <span className="material-symbols-outlined text-base">checklist</span>
                    Edit / Assign Cuisines
                  </button>
                </div>
              </div>

              <div className="mt-5">
                <DataTable
                  columns={cuisineColumns}
                  data={assignedCuisines}
                  enablePagination={assignedCuisines.length > 8}
                  pageSize={8}
                  itemName="cuisines"
                  containerClassName="overflow-x-auto rounded-xl border border-slate-100 dark:border-zinc-800"
                  tableClassName="w-full border-collapse text-left text-xs"
                  headerRowClassName="bg-slate-50/70 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 dark:border-zinc-800"
                  rowClassName="group transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Assign Cuisines Modal (search removed, scoped to merchant category) */}
        {isAssignCuisinesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsAssignCuisinesModalOpen(false)}
            />
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                    <span className="material-symbols-outlined text-xl">restaurant</span>
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                      Assign Cuisines & Specializations
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Select specializations for{' '}
                      <span className="font-semibold text-slate-700 dark:text-zinc-200">
                        {merchant?.name}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAssignCuisinesModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Toolbar: category scope label + bulk actions (no search) */}
              <div className="space-y-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-800/30">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {categoriesList.find((c) => c.id === merchantCategoryId) ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6B35] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                        <span className="material-symbols-outlined text-sm">
                          {categoriesList.find((c) => c.id === merchantCategoryId)?.icon ||
                            'category'}
                        </span>
                        {categoriesList.find((c) => c.id === merchantCategoryId)?.name}
                        <span className="opacity-80">({filteredForAssignment.length})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:bg-zinc-700 dark:text-zinc-200">
                        All categories ({filteredForAssignment.length})
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Only cuisines from this category can be assigned.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectAllFilteredCuisines(filteredForAssignment)}
                      className="font-semibold text-slate-600 hover:text-[#FF6B35] dark:text-zinc-300"
                    >
                      Select all
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleClearAllAssignedCuisines}
                      disabled={tempSelectedCuisineIds.length === 0}
                      className="font-semibold text-slate-500 hover:text-rose-500 disabled:opacity-40"
                    >
                      Clear all ({tempSelectedCuisineIds.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Cuisines List */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredForAssignment.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 dark:text-zinc-400">
                    No cuisines available for this merchant's category yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredForAssignment.map((cuisine) => {
                      const isSelected = tempSelectedCuisineIds.includes(cuisine.id)
                      const parentCat = categoriesList.find(
                        (cat) => cat.id === cuisine.category_id
                      )
                      return (
                        <div
                          key={cuisine.id}
                          onClick={() => toggleAssignCuisine(cuisine.id)}
                          className={`group relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition ${
                            isSelected
                              ? 'border-[#FF6B35] bg-orange-50/40 ring-1 ring-[#FF6B35] dark:bg-orange-950/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/40'
                          }`}
                        >
                          <div className="pt-0.5">
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                                isSelected
                                  ? 'border-[#FF6B35] bg-[#FF6B35] text-white'
                                  : 'border-slate-300 bg-white group-hover:border-slate-400 dark:border-zinc-700 dark:bg-zinc-800'
                              }`}
                            >
                              {isSelected && (
                                <span className="material-symbols-outlined text-[15px] font-bold">
                                  check
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-amber-500 dark:bg-zinc-800">
                            {cuisine.image ? (
                              <img
                                src={cuisine.image}
                                alt={cuisine.name}
                                className="h-5 w-5 object-contain"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-lg">
                                {cuisine.icon || 'restaurant'}
                              </span>
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                {cuisine.name}
                              </h4>
                              {parentCat && (
                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                                  {parentCat.name}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-zinc-400">
                              {cuisine.description || `/${cuisine.slug}`}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditCuisineModal(cuisine, e)
                            }}
                            className="rounded p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:text-[#FF6B35]"
                            title="Edit this cuisine definition"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                  <span className="text-[#FF6B35] font-bold">
                    {tempSelectedCuisineIds.length}
                  </span>{' '}
                  specializations selected
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAssignCuisinesModalOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAssignedCuisines}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                  >
                    <span className="material-symbols-outlined text-base">check</span>
                    Save Assigned Cuisines
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Cuisine Detail Editor Modal */}
        {isCuisineEditorModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsCuisineEditorModalOpen(false)}
            />
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <form
                onSubmit={handleSaveCuisineDetail}
                className="flex flex-1 flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                      <span className="material-symbols-outlined text-xl">
                        {editingCuisine ? 'edit' : 'add'}
                      </span>
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                        {editingCuisine
                          ? `Edit Cuisine: ${editingCuisine.name}`
                          : 'Create New Cuisine Specialization'}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Cuisine properties, icon assets, and category classification
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCuisineEditorModalOpen(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Cuisine Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cuisineFormData.name}
                      onChange={(e) => {
                        const val = e.target.value
                        setCuisineFormData((prev) => ({
                          ...prev,
                          name: val,
                          slug:
                            prev.slug === '' || prev.slug === slugify(prev.name)
                              ? slugify(val)
                              : prev.slug,
                        }))
                        if (cuisineFormErrors.name) setCuisineFormErrors({})
                      }}
                      placeholder="e.g. Ethiopian & Habesha, Neapolitan Pizza, Sushi"
                      className={`mt-1.5 w-full rounded-xl border px-3.5 py-2 text-xs font-semibold text-slate-900 dark:bg-zinc-800 dark:text-zinc-100 ${
                        cuisineFormErrors.name
                          ? 'border-rose-400 ring-1 ring-rose-400'
                          : 'border-slate-200 focus:border-[#FF6B35] dark:border-zinc-700'
                      }`}
                    />
                    {cuisineFormErrors.name && (
                      <p className="mt-1 text-[11px] font-medium text-rose-500">
                        {cuisineFormErrors.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                        Merchant Category
                      </label>
                      <select
                        value={cuisineFormData.category_id}
                        onChange={(e) =>
                          setCuisineFormData((prev) => ({
                            ...prev,
                            category_id: e.target.value,
                          }))
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {categoriesList
                          .filter(
                            (cat) => !merchantCategoryId || cat.id === merchantCategoryId
                          )
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({cat.code || 'FOOD'})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={cuisineFormData.slug}
                        onChange={(e) =>
                          setCuisineFormData((prev) => ({
                            ...prev,
                            slug: slugify(e.target.value),
                          }))
                        }
                        placeholder="ethiopian-habesha"
                        className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-xs text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={cuisineFormData.description}
                      onChange={(e) =>
                        setCuisineFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe this cuisine style or specialty..."
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Preset Material Icon
                    </label>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {[
                        'restaurant',
                        'lunch_dining',
                        'local_pizza',
                        'ramen_dining',
                        'bakery_dining',
                        'local_cafe',
                        'set_meal',
                        'fastfood',
                        'celebration',
                        'egg_alt',
                        'local_bar',
                        'cake',
                      ].map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() =>
                            setCuisineFormData((prev) => ({
                              ...prev,
                              icon: iconName,
                              image: '',
                            }))
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                            cuisineFormData.icon === iconName && !cuisineFormData.image
                              ? 'border-[#FF6B35] bg-orange-50 text-[#FF6B35] ring-2 ring-[#FF6B35]/30'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {iconName}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDraggingFile(true)
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        setIsDraggingFile(false)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDraggingFile(false)
                        const file = e.dataTransfer.files?.[0]
                        processUploadedFile(file)
                      }}
                      className={`relative rounded-xl border-2 border-dashed p-4 text-center transition ${
                        isDraggingFile
                          ? 'border-[#FF6B35] bg-orange-50/50'
                          : 'border-slate-200 bg-slate-50/50 dark:border-zinc-700 dark:bg-zinc-800/40'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          processUploadedFile(file)
                          if (e.target) e.target.value = ''
                        }}
                        className="hidden"
                      />
                      {cuisineFormData.image ? (
                        <div className="flex items-center justify-center gap-3">
                          <img
                            src={cuisineFormData.image}
                            alt="Preview"
                            className="h-10 w-10 rounded-lg border border-slate-200 bg-white p-1 object-contain"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              Custom Icon Active
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setCuisineFormData((prev) => ({ ...prev, image: '' }))
                              }
                              className="text-[11px] font-semibold text-rose-500 hover:underline"
                            >
                              Remove custom icon
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="material-symbols-outlined text-2xl text-slate-400">
                            upload_file
                          </span>
                          <p className="mt-1 text-xs text-slate-600 dark:text-zinc-300">
                            Drag & drop an icon or{' '}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="font-bold text-[#FF6B35] hover:underline"
                            >
                              browse image
                            </button>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            SVG, PNG, JPG, or WebP (max 3MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCuisineFormData((prev) => ({
                            ...prev,
                            is_active: !prev.is_active,
                          }))
                        }
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                          cuisineFormData.is_active
                            ? 'bg-[#FF6B35]'
                            : 'bg-slate-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`mt-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                            cuisineFormData.is_active ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        {cuisineFormData.is_active ? 'Active Cuisine' : 'Inactive Cuisine'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                        Sort Order:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={cuisineFormData.sort_order}
                        onChange={(e) =>
                          setCuisineFormData((prev) => ({
                            ...prev,
                            sort_order: e.target.value,
                          }))
                        }
                        className="w-16 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <button
                    type="button"
                    onClick={() => setIsCuisineEditorModalOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                  >
                    <span className="material-symbols-outlined text-base">save</span>
                    {editingCuisine ? 'Save Changes' : 'Create & Assign Cuisine'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Primary Category Selector Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsCategoryModalOpen(false)}
            />
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                    <span className="material-symbols-outlined text-xl">category</span>
                  </span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                      Change Primary Category
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Select the business classification for {merchant?.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="max-h-[60vh] space-y-2 overflow-y-auto p-6">
                {categoriesList.map((cat) => {
                  const isSelected = tempCategoryId === cat.id
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setTempCategoryId(cat.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                        isSelected
                          ? 'border-[#FF6B35] bg-orange-50/40 ring-1 ring-[#FF6B35] dark:bg-orange-950/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                          <span className="material-symbols-outlined text-lg">
                            {cat.icon || 'category'}
                          </span>
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              {cat.name}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
                              {cat.code || 'FOOD'}
                            </span>
                          </div>
                          {cat.description && (
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-zinc-400">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-[#FF6B35] bg-[#FF6B35] text-white'
                            : 'border-slate-300 dark:border-zinc-700'
                        }`}
                      >
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePrimaryCategory}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                  Set as Primary Category
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}