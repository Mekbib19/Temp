import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { MERCHANT_TYPES, addMerchant, generateUUID, getMerchantById, updateMerchant } from '../data/demoMerchants'
import { loadStoredCuisines, slugify } from '../data/demoCuisines'
import { loadStoredCategories } from '../data/demoCategories'

const MERCHANT_TYPE_CATEGORY_MAP = {
  Food: ['food'],
  Grocery: ['grocery'],
  Pharmacy: ['pharmacy'],
  Retail: ['retail'],
  'Flowers & Gifts': ['flowers-gifts'],
  Services: ['services'],
  Package: ['package'],
  // Legacy mappings for backwards compatibility
  'Restaurant & Dining': ['food'],
  'Bakery & Cafe': ['food'],
  'Beverage & Spirits': ['food'],
  'Specialty & Gourmet': ['food', 'grocery'],
  'Grocery & Supermarket': ['grocery'],
  'Pharmacy & Health': ['pharmacy'],
  'Retail & Convenience': ['retail'],
  'Pet Care & Supplies': ['retail'],
}

const getCategoriesForMerchantType = (merchantType = '', allCategories = []) => {
  if (!merchantType || !merchantType.trim()) return allCategories
  const trimmed = merchantType.trim()

  if (MERCHANT_TYPE_CATEGORY_MAP[trimmed] && MERCHANT_TYPE_CATEGORY_MAP[trimmed].length > 0) {
    const slugs = MERCHANT_TYPE_CATEGORY_MAP[trimmed]
    const matched = allCategories.filter((c) => slugs.includes(c.slug) || slugs.includes(c.code?.toLowerCase()))
    if (matched.length > 0) return matched
  }

  const lower = trimmed.toLowerCase()
  const matched = allCategories.filter((c) => {
    const cSlug = (c.slug || '').toLowerCase()
    const cCode = (c.code || '').toLowerCase()
    const cName = (c.name || '').toLowerCase()

    if (lower.includes('food') || lower.includes('restaurant') || lower.includes('dining') || lower.includes('cafe') || lower.includes('burger') || lower.includes('habesha')) {
      return cSlug === 'food' || cCode === 'food'
    }
    if (lower.includes('grocery') || lower.includes('supermarket') || lower.includes('produce') || lower.includes('market')) {
      return cSlug === 'grocery' || cCode === 'grocery'
    }
    if (lower.includes('pharmacy') || lower.includes('health') || lower.includes('medicine') || lower.includes('drug')) {
      return cSlug === 'pharmacy' || cCode === 'pharmacy'
    }
    if (lower.includes('retail') || lower.includes('electronic') || lower.includes('fashion') || lower.includes('goods')) {
      return cSlug === 'retail' || cCode === 'retail'
    }
    if (lower.includes('flower') || lower.includes('gift') || lower.includes('plant') || lower.includes('florist')) {
      return cSlug === 'flowers-gifts' || cCode === 'flowers_gifts'
    }
    if (lower.includes('service') || lower.includes('clean') || lower.includes('maintenance') || lower.includes('consult')) {
      return cSlug === 'services' || cCode === 'services'
    }
    if (lower.includes('package') || lower.includes('courier') || lower.includes('parcel') || lower.includes('shipping') || lower.includes('deliver')) {
      return cSlug === 'package' || cCode === 'package'
    }
    return cName.includes(lower) || cSlug.includes(lower)
  })

  if (matched.length > 0) return matched
  return allCategories
}

const DEFAULT_SAMPLE_LOGOS = [
  {
    name: 'Gourmet Burger',
    category: 'Restaurant & Dining',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Habesha Bites',
    category: 'Restaurant & Dining',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Grocery',
    category: 'Grocery & Supermarket',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Artisan Cafe',
    category: 'Bakery & Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
  },
]



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

const createDefaultBranch = (branchName = 'Main Branch', isMain = false) => ({
  id: generateUUID(),
  branch_name: branchName,
  is_main_branch: isMain,
  latitude: 9.0016,
  longitude: 38.7842,
  address: 'Bole Road, Near Medhanialem Mall, Addis Ababa',
  manager_name: '',
  email: '',
  phone_number: '',
  schedule: createDefaultSchedule(),
})

const AddMerchantPage = () => {
  const navigate = useNavigate()
  const { merchantId } = useParams()
  const isEdit = Boolean(merchantId)
  
  const logoInputRef = useRef(null)
  const coverInputRef = useRef(null)

  const availableCuisines = useMemo(() => {
    const list = loadStoredCuisines()
    return Array.isArray(list) ? list : []
  }, [])

  const availableCategories = useMemo(() => {
    const list = loadStoredCategories()
    return Array.isArray(list) ? list : []
  }, [])

  const categoryMap = useMemo(() => {
    const map = new Map()
    availableCategories.forEach((c) => map.set(c.id, c))
    return map
  }, [availableCategories])

  const [cuisineSearch, setCuisineSearch] = useState('')

  const [formData, setFormData] = useState(() => {
    if (merchantId) {
      const existing = getMerchantById(merchantId)
      if (existing) {
        let initialCuisineIds = []
        if (Array.isArray(existing.cuisine_ids) && existing.cuisine_ids.length > 0) {
          initialCuisineIds = existing.cuisine_ids
        } else if (existing.cuisine_id) {
          initialCuisineIds = [existing.cuisine_id]
        } else if (existing.cuisine_name) {
          const names = existing.cuisine_name.split(',').map((s) => s.trim().toLowerCase())
          initialCuisineIds = availableCuisines
            .filter((c) => names.includes(c.name.toLowerCase()))
            .map((c) => c.id)
        }
        if (initialCuisineIds.length === 0 && availableCuisines.length > 0) {
          initialCuisineIds = [availableCuisines[0].id]
        }
        const selectedObjs = availableCuisines.filter((c) => initialCuisineIds.includes(c.id))
        const combinedCuisineName = selectedObjs.map((c) => c.name).join(', ') || existing.cuisine_name || ''

        const initialCategoryId = existing.category_id || (selectedObjs[0]?.category_id || '')
        const initialCategoryName = existing.category_name || (categoryMap.get(initialCategoryId)?.name || '')

        return {
          name: existing.name || '',
          type: existing.type || 'Restaurant & Dining',
          owner_name: existing.owner_name || '',
          owner_email: existing.owner_email || existing.email || '',
          owner_phone: existing.owner_phone || existing.phone || '',
          category_id: initialCategoryId,
          category_name: initialCategoryName,
          cuisine_ids: initialCuisineIds,
          cuisine_id: initialCuisineIds[0] || '',
          cuisine_name: combinedCuisineName,
          status: (existing.status || 'ACTIVE').toUpperCase(),
          description: existing.description || '',
          logo_url: existing.logo_url || existing.logo || DEFAULT_SAMPLE_LOGOS[0].url,
          cover_image_url: existing.cover_image_url || existing.banner_url || existing.cover || '',
          price_range: existing.price_range || '$$ (Moderate)',
          is_featured: Boolean(existing.is_featured),
          eta_min: existing.eta_min || 20,
          eta_max: existing.eta_max || 40,
          commission_rate: existing.commission_rate || 15,
          average_rating: existing.average_rating || 4.8,
          total_rating: existing.total_rating || 5,
          total_reviews: existing.total_reviews || 14,
        }
      }
    }

    const defaultType = 'Restaurant & Dining'
    const defaultCats = getCategoriesForMerchantType(defaultType, availableCategories)
    const firstCat = defaultCats[0] || availableCategories[0]

    return {
      name: '',
      type: defaultType,
      owner_name: '',
      owner_email: '',
      owner_phone: '',
      category_id: firstCat?.id || '',
      category_name: firstCat?.name || '',
      cuisine_ids: [],
      cuisine_id: '',
      cuisine_name: '',
      status: 'ACTIVE',
      description: '',
      logo_url: DEFAULT_SAMPLE_LOGOS[0].url,
      cover_image_url: '',
      price_range: '$$ (Moderate)',
      is_featured: false,
      eta_min: 20,
      eta_max: 40,
      commission_rate: 15,
      average_rating: 4.8,
      total_rating: 5,
      total_reviews: 14,
    }
  })

  const [selectedCategoryId, setSelectedCategoryId] = useState(() => {
    if (merchantId) {
      const existing = getMerchantById(merchantId)
      if (existing?.category_id) return existing.category_id
      if (existing?.cuisine_id) {
        const c = availableCuisines.find((x) => x.id === existing.cuisine_id)
        if (c?.category_id) return c.category_id
      }
    }
    const defaultCats = getCategoriesForMerchantType('Restaurant & Dining', availableCategories)
    return defaultCats[0]?.id || 'all'
  })

  const [branches, setBranches] = useState(() => {
    if (merchantId) {
      const existing = getMerchantById(merchantId)
      if (existing?.branches?.length) {
        return existing.branches.map((b) => ({
          ...b,
          manager_name: b.manager_name || existing.manager_name || '',
          email: b.email || existing.email || '',
          phone_number: b.phone_number || b.manager_phone || b.phone || existing.phone || '',
          schedule: b.schedule && typeof b.schedule === 'object' ? { ...createDefaultSchedule(), ...b.schedule } : createDefaultSchedule(),
        }))
      }
      if (existing) {
        return [
          {
            id: generateUUID(),
            branch_name: existing.branch_name || `${existing.name} Main Branch`,
            is_main_branch: true,
            latitude: typeof existing.latitude === 'number' ? existing.latitude : 9.0016,
            longitude: typeof existing.longitude === 'number' ? existing.longitude : 38.7842,
            address: existing.address || 'Bole Road, Near Medhanialem Mall, Addis Ababa',
            manager_name: existing.manager_name || '',
            email: existing.email || '',
            phone_number: existing.phone_number || existing.phone || existing.manager_phone || '',
            schedule: existing.schedule && typeof existing.schedule === 'object' ? { ...createDefaultSchedule(), ...existing.schedule } : createDefaultSchedule(),
          },
        ]
      }
    }
    return [createDefaultBranch('Main Branch', true)]
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeGpsBranchIdx, setActiveGpsBranchIdx] = useState(null)
  const [fullscreenGpsBranchIdx, setFullscreenGpsBranchIdx] = useState(null)
  const [activeEditDay, setActiveEditDay] = useState(null)
  const [toastNotice, setToastNotice] = useState(null)

  const showNotification = (message, type = 'info') => {
    setToastNotice({ message, type })
    setTimeout(() => {
      setToastNotice((curr) => (curr?.message === message ? null : curr))
    }, 3500)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (fullscreenGpsBranchIdx !== null) setFullscreenGpsBranchIdx(null)
        if (activeEditDay !== null) setActiveEditDay(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreenGpsBranchIdx, activeEditDay])

  const categoriesForMerchantType = useMemo(() => {
    return getCategoriesForMerchantType(formData.type, availableCategories)
  }, [availableCategories, formData.type])

  const handleMerchantTypeChange = (newType) => {
    setFormData((prev) => ({ ...prev, type: newType }))
    const matchingCats = getCategoriesForMerchantType(newType, availableCategories)
    if (matchingCats.length > 0) {
      if (!matchingCats.some((c) => c.id === selectedCategoryId)) {
        const nextCatId = matchingCats[0].id
        setSelectedCategoryId(nextCatId)
        const catObj = categoryMap.get(nextCatId)
        setFormData((prev) => ({
          ...prev,
          category_id: nextCatId,
          category_name: catObj ? catObj.name : '',
        }))
      }
    } else {
      setSelectedCategoryId('all')
      setFormData((prev) => ({
        ...prev,
        category_id: '',
        category_name: 'All Categories',
      }))
    }
  }

  const handleCategoryChange = (newCatId) => {
    setSelectedCategoryId(newCatId)
    const catObj = categoryMap.get(newCatId)
    setFormData((prev) => ({
      ...prev,
      category_id: newCatId === 'all' ? '' : newCatId,
      category_name: catObj ? catObj.name : 'All Categories',
    }))
  }

  const filteredCuisines = useMemo(() => {
    let list = availableCuisines
    if (selectedCategoryId && selectedCategoryId !== 'all') {
      list = list.filter((c) => c.category_id === selectedCategoryId)
    } else {
      const allowedCategoryIds = new Set(categoriesForMerchantType.map((c) => c.id))
      if (allowedCategoryIds.size > 0) {
        list = list.filter((c) => allowedCategoryIds.has(c.category_id))
      }
    }

    if (cuisineSearch.trim()) {
      const q = cuisineSearch.toLowerCase().trim()
      list = list.filter((c) => {
        const cat = categoryMap.get(c.category_id)
        const catName = cat ? cat.name.toLowerCase() : ''
        return (
          c.name.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q)) ||
          catName.includes(q)
        )
      })
    }

    return list
  }, [availableCuisines, categoriesForMerchantType, selectedCategoryId, cuisineSearch, categoryMap])

  const handleToggleCuisine = (cuisineId) => {
    setFormData((prev) => {
      const currentIds = Array.isArray(prev.cuisine_ids) ? prev.cuisine_ids : []
      const isSelected = currentIds.includes(cuisineId)
      const nextIds = isSelected
        ? currentIds.filter((id) => id !== cuisineId)
        : [...currentIds, cuisineId]

      const selectedObjs = availableCuisines.filter((c) => nextIds.includes(c.id))
      const combinedNames = selectedObjs.map((c) => c.name).join(', ')

      return {
        ...prev,
        cuisine_ids: nextIds,
        cuisine_id: nextIds[0] || '',
        cuisine_name: combinedNames,
      }
    })
    if (formErrors.cuisine_id) {
      setFormErrors((prev) => ({ ...prev, cuisine_id: null }))
    }
  }

  const handleClearAllCuisines = () => {
    setFormData((prev) => ({
      ...prev,
      cuisine_ids: [],
      cuisine_id: '',
      cuisine_name: '',
    }))
  }

  const primaryBranch = branches.find((b) => b.is_main_branch) || branches[0]

  const handleAddBranch = () => {
    const newBranch = createDefaultBranch(
      `${formData.name || 'Merchant'} Branch ${branches.length + 1}`,
      branches.length === 0
    )
    setBranches((prev) => [...prev, newBranch])
  }

  const handleRemoveBranch = (index) => {
    if (branches.length === 1) {
      showNotification('A merchant must have at least one branch.', 'warning')
      return
    }
    if (fullscreenGpsBranchIdx === index) setFullscreenGpsBranchIdx(null)
    if (activeGpsBranchIdx === index) setActiveGpsBranchIdx(null)
    const updated = branches.filter((_, idx) => idx !== index)
    if (!updated.some((b) => b.is_main_branch) && updated.length > 0) {
      updated[0].is_main_branch = true
    }
    setBranches(updated)
  }

  const handleBranchChange = (index, field, value) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== index) return branch
        return { ...branch, [field]: value }
      })
    )
  }

  const handleSetMainBranch = (index) => {
    setBranches((prev) =>
      prev.map((branch, idx) => ({
        ...branch,
        is_main_branch: idx === index,
      }))
    )
  }

  const handleToggleGps = (branchIndex) => {
    setActiveGpsBranchIdx((prev) => (prev === branchIndex ? null : branchIndex))
  }

  const handleBranchDayToggle = (branchIndex, dayKey) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== branchIndex) return branch
        const currentSched = branch.schedule || createDefaultSchedule()
        const dayInfo = currentSched[dayKey] || { is_open: true, open_time: '08:00', close_time: '22:00' }
        return {
          ...branch,
          schedule: {
            ...currentSched,
            [dayKey]: {
              ...dayInfo,
              is_open: !dayInfo.is_open,
            },
          },
        }
      })
    )
  }

  const handleBranchDayTimeChange = (branchIndex, dayKey, field, value) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== branchIndex) return branch
        const currentSched = branch.schedule || createDefaultSchedule()
        const dayInfo = currentSched[dayKey] || { is_open: true, open_time: '08:00', close_time: '22:00' }
        return {
          ...branch,
          schedule: {
            ...currentSched,
            [dayKey]: {
              ...dayInfo,
              [field]: value,
            },
          },
        }
      })
    )
  }

  const handleApplyTimeToAllOpenDays = (branchIndex, sourceDayKey) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== branchIndex) return branch
        const currentSched = branch.schedule || createDefaultSchedule()
        const sourceDay = currentSched[sourceDayKey] || { open_time: '08:00', close_time: '22:00' }
        const nextSched = { ...currentSched }
        DAYS_OF_WEEK.forEach((d) => {
          if (nextSched[d.key]?.is_open) {
            nextSched[d.key] = {
              ...nextSched[d.key],
              open_time: sourceDay.open_time,
              close_time: sourceDay.close_time,
            }
          }
        })
        return { ...branch, schedule: nextSched }
      })
    )
    showNotification(`Hours from ${sourceDayKey.charAt(0).toUpperCase() + sourceDayKey.slice(1)} copied to all open days!`, 'success')
  }

  const handleSetQuickPreset = (branchIndex, preset) => {
    setBranches((prev) =>
      prev.map((branch, idx) => {
        if (idx !== branchIndex) return branch
        const currentSched = branch.schedule || createDefaultSchedule()
        const nextSched = {}
        DAYS_OF_WEEK.forEach((d) => {
          const prevDay = currentSched[d.key] || { open_time: '08:00', close_time: '22:00' }
          let isOpen = true
          if (preset === 'weekdays_only') {
            isOpen = d.key !== 'saturday' && d.key !== 'sunday'
          } else if (preset === 'weekends_only') {
            isOpen = d.key === 'saturday' || d.key === 'sunday'
          } else if (preset === 'everyday') {
            isOpen = true
          }
          nextSched[d.key] = {
            ...prevDay,
            is_open: isOpen,
          }
        })
        return { ...branch, schedule: nextSched }
      })
    )
  }

  // Upload Handlers
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      showNotification('Please upload a valid image file (PNG, JPG, WebP).', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, logo_url: event.target.result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      showNotification('Please upload a valid image file (PNG, JPG, WebP).', 'warning')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, cover_image_url: event.target.result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Merchant name is required.'
    if (!formData.cuisine_ids || formData.cuisine_ids.length === 0) {
      errors.cuisine_id = 'Please select at least one cuisine style.'
    }

    branches.forEach((b, idx) => {
      if (!b.branch_name.trim()) {
        errors[`branch_${idx}_name`] = 'Branch name is required.'
      }
      if (b.latitude === '' || isNaN(b.latitude) || b.latitude < -90 || b.latitude > 90) {
        errors[`branch_${idx}_lat`] = 'Valid latitude (-90 to 90) is required.'
      }
      if (b.longitude === '' || isNaN(b.longitude) || b.longitude < -180 || b.longitude > 180) {
        errors[`branch_${idx}_lng`] = 'Valid longitude (-180 to 180) is required.'
      }
    })

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    const autoSlug = slugify(formData.name.trim())
    const main = branches.find((b) => b.is_main_branch) || branches[0]

    const effectiveCategoryId = selectedCategoryId !== 'all' ? selectedCategoryId : (categoriesForMerchantType[0]?.id || '')
    const effectiveCategoryName = categoryMap.get(effectiveCategoryId)?.name || (categoryMap.get(selectedCategoryId)?.name || 'General')

    const basePayload = {
      name: formData.name.trim(),
      slug: autoSlug,
      type: formData.type.trim() || 'Restaurant & Dining',
      category_id: effectiveCategoryId,
      category_name: effectiveCategoryName,
      cuisine_ids: formData.cuisine_ids || [],
      cuisine_id: (formData.cuisine_ids && formData.cuisine_ids[0]) || '',
      cuisine_name: formData.cuisine_name,
      cuisines: availableCuisines.filter((c) => formData.cuisine_ids?.includes(c.id)),
      locations: branches.length,
      status: formData.status,
      description:
        formData.description.trim() ||
        `${formData.name.trim()} provides expedited local delivery fulfillment across ${branches.length} branch location(s).`,
      
      logo_url: formData.logo_url,
      cover_image_url: formData.cover_image_url,
      logo: formData.logo_url,
      banner_url: formData.cover_image_url,
      cover: formData.cover_image_url,

      price_range: formData.price_range,
      commission_rate: parseInt(formData.commission_rate, 10) || 15,
      eta_min: parseInt(formData.eta_min, 10) || 20,
      eta_max: parseInt(formData.eta_max, 10) || 40,
      average_rating: parseFloat(formData.average_rating) || 4.8,
      total_rating: parseInt(formData.total_rating, 10) || 5,
      total_reviews: parseInt(formData.total_reviews, 10) || 14,
      is_featured: Boolean(formData.is_featured),

      owner_name: (formData.owner_name || '').trim(),
      owner_email: (formData.owner_email || '').trim(),
      owner_phone: (formData.owner_phone || '').trim(),

      branch_name: main.branch_name,
      is_main_branch: true,
      latitude: parseFloat(main.latitude) || 9.0016,
      longitude: parseFloat(main.longitude) || 38.7842,
      address: main.address.trim(),
      manager_name: (main.manager_name || '').trim(),
      email: (formData.owner_email || main.email || '').trim(),
      phone_number: (formData.owner_phone || main.phone_number || '').trim(),
      phone: (formData.owner_phone || main.phone_number || '').trim(),

      opening_hours: main.schedule?.monday?.open_time || '08:00 AM',
      closing_hours: main.schedule?.monday?.close_time || '10:00 PM',

      branches: branches.map((b) => ({
        ...b,
        latitude: parseFloat(b.latitude) || 9.0016,
        longitude: parseFloat(b.longitude) || 38.7842,
        manager_name: (b.manager_name || '').trim(),
        email: (b.email || '').trim(),
        phone_number: (b.phone_number || '').trim(),
        phone: (b.phone_number || '').trim(),
        schedule: b.schedule || createDefaultSchedule(),
      })),
    }

    if (isEdit) {
      updateMerchant(merchantId, basePayload)
      setTimeout(() => {
        navigate('/restaurants', {
          state: { toastMessage: `Merchant "${basePayload.name}" successfully updated!` },
        })
      }, 200)
    } else {
      const merchantUUID = generateUUID()
      const newMerchant = {
        ...basePayload,
        id: merchantUUID,
        merchant_id: merchantUUID,
      }
      addMerchant(newMerchant)
      setTimeout(() => {
        navigate('/restaurants', {
          state: { toastMessage: `Merchant "${newMerchant.name}" successfully onboarded!` },
        })
      }, 200)
    }
  }

  const targetMapBranch = (activeGpsBranchIdx !== null && branches[activeGpsBranchIdx])
    ? branches[activeGpsBranchIdx]
    : primaryBranch

  const mapData = useMemo(() => {
    const lat = Number(targetMapBranch?.latitude ?? 9.0016)
    const lng = Number(targetMapBranch?.longitude ?? 38.7842)
    const validLat = Number.isFinite(lat) ? lat : 9.0016
    const validLng = Number.isFinite(lng) ? lng : 38.7842
    const bbox = `${validLng - 0.008},${validLat - 0.005},${validLng + 0.008},${validLat + 0.005}`
    return {
      lat: validLat,
      lng: validLng,
      branchName: targetMapBranch?.branch_name || 'Main Branch',
      address: targetMapBranch?.address || 'No address set',
      src: `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${validLat},${validLng}`,
      directionsUrl: `https://www.google.com/maps?q=${validLat},${validLng}`
    }
  }, [targetMapBranch?.latitude, targetMapBranch?.longitude, targetMapBranch?.branch_name, targetMapBranch?.address])

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Merchants"
      breadcrumbCurrent={isEdit ? 'Edit Merchant' : 'Add New Merchant'}
    >
      <div className="space-y-6 pb-16">
        {/* Header Bar */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/restaurants')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {isEdit ? 'Edit Merchant Partner' : 'Add New Merchant'}
              </h1>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
              Configure unified merchant identity, GPS geolocation, branch operations, and branding preview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/restaurants')}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#e0531f] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Merchant' : 'Create Merchant'}
            </button>
          </div>
        </section>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Main Form Inputs (lg:col-span-8)             */}
          {/* ========================================================= */}
          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-8">
            
            {/* 1. Merchant Identity, Classification & Cuisine */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                  <span className="material-symbols-outlined text-lg">badge</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Merchant Identity, Classification & Cuisine
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Brand name, category type, and cuisine classification (contact managed per branch).
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData((prev) => ({ ...prev, name: val }))
                      if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: null }))
                    }}
                    placeholder="e.g. Habesha Gourmet Kitchen"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                  {formErrors.name && <p className="mt-1 text-[11px] text-rose-500">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      list="merchant-type-presets"
                      value={formData.type}
                      onChange={(e) => handleMerchantTypeChange(e.target.value)}
                      placeholder="e.g. Restaurant & Dining, Bakery & Cafe..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                    <datalist id="merchant-type-presets">
                      {MERCHANT_TYPES.map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Merchant Category <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-[#FF6B35]">
                      {categoriesForMerchantType.length} {categoriesForMerchantType.length === 1 ? 'category' : 'categories'}
                    </span>
                  </div>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <option value="all">
                      All Categories ({availableCategories.length})
                    </option>
                    {availableCategories.map((cat) => {
                      const count = availableCuisines.filter((c) => c.category_id === cat.id).length
                      return (
                        <option key={cat.id} value={cat.id}>
                          {cat.code ? `[${cat.code}] ` : ''}{cat.name} — {cat.description} ({count} {count === 1 ? 'specialization' : 'specializations'})
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Bio / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your merchant concept, product line, specialties, and service standards..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              {/* Specialization Types (cuisine_types) Selector */}
              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-zinc-800">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-amber-500">dinner_dining</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200">
                          Cuisine Types  <span className="text-rose-500">*</span>
                        </span>
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                          {formData.cuisine_ids?.length || 0} selected
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {formData.cuisine_ids?.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllCuisines}
                          className="rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          Clear ({formData.cuisine_ids.length})
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Category-specific specializations allowing merchants to define their exact domain specializations (e.g., Food: Ethiopian, Italian; Grocery: Organic, Bulk; Pharmacy: Prescription, OTC; Retail: Electronics; Package: Standard, Express).
                  </p>

                  <div className="relative">
                    <input
                      type="text"
                      value={cuisineSearch}
                      onChange={(e) => setCuisineSearch(e.target.value)}
                      placeholder="Search specializations (e.g. Ethiopian, Italian, Organic, Prescription, Electronics, Cleaning...)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  {formData.cuisine_ids?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-orange-100 bg-orange-50/50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        Selected Specializations ({formData.cuisine_ids.length}):
                      </span>
                      {formData.cuisine_ids.map((id) => {
                        const cObj = availableCuisines.find((c) => c.id === id)
                        if (!cObj) return null
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-800 shadow-2xs dark:bg-zinc-900 dark:text-zinc-200"
                          >
                            <span>{cObj.name}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleCuisine(id)}
                              className="text-slate-400 transition hover:text-rose-500"
                              title="Remove specialization"
                            >
                              ×
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {formErrors.cuisine_id && (
                    <p className="text-[11px] text-rose-500">{formErrors.cuisine_id}</p>
                  )}

                  <div className="max-h-64 overflow-y-auto pr-1">
                    {filteredCuisines.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {filteredCuisines.map((cuisine) => {
                          const isSelected = Array.isArray(formData.cuisine_ids) && formData.cuisine_ids.includes(cuisine.id)
                          const parentCat = categoryMap.get(cuisine.category_id)
                          return (
                            <label
                              key={cuisine.id}
                              htmlFor={`cuisine-checkbox-${cuisine.id}`}
                              className={`group flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition ${
                                isSelected
                                  ? 'border-[#FF6B35] bg-orange-50/50 ring-1 ring-[#FF6B35]/40 shadow-2xs dark:bg-orange-950/20'
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-850'
                              }`}
                            >
                              <div
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                                  isSelected
                                    ? 'border-[#FF6B35] bg-[#FF6B35] text-white shadow-2xs'
                                    : 'border-slate-300 bg-white group-hover:border-slate-400 dark:border-zinc-600 dark:bg-zinc-800'
                                }`}
                              >
                                {isSelected && (
                                  <span className="material-symbols-outlined text-[13px] font-bold leading-none">check</span>
                                )}
                              </div>
                              <input
                                type="checkbox"
                                id={`cuisine-checkbox-${cuisine.id}`}
                                name="merchant_cuisines"
                                checked={isSelected}
                                onChange={() => handleToggleCuisine(cuisine.id)}
                                className="sr-only"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {cuisine.image ? (
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                      <img
                                        src={cuisine.image}
                                        alt={cuisine.name}
                                        className="h-3.5 w-3.5 object-contain"
                                      />
                                    </span>
                                  ) : (
                                    <span className="material-symbols-outlined text-sm text-[#FF6B35]">
                                      {cuisine.icon || 'star'}
                                    </span>
                                  )}
                                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                    {cuisine.name}
                                  </span>
                                  {parentCat && (
                                    <span className="inline-flex rounded bg-orange-100/70 px-1.5 py-0.2 text-[9px] font-semibold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                                      {parentCat.code || parentCat.name}
                                    </span>
                                  )}
                                </div>
                                {cuisine.description && (
                                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-zinc-400">
                                    {cuisine.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-zinc-700 dark:text-zinc-400">
                        No specializations found for category &ldquo;{selectedCategoryId === 'all' ? (formData.type || 'Merchant Category') : categoryMap.get(selectedCategoryId)?.name}&rdquo;.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Store Branding - Clickable Card Uploads */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                    <span className="material-symbols-outlined text-lg">image</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Store Branding</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Click any card below to upload or change images.</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Hidden native file inputs */}
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />

                {/* Full Card Button: Business Logo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Business Logo <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="group relative mt-1.5 flex h-40 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-[#FF6B35] hover:bg-orange-50/20 dark:border-zinc-700 dark:bg-zinc-850/60 dark:hover:border-[#FF6B35]"
                  >
                    {formData.logo_url ? (
                      <>
                        <img
                          src={formData.logo_url}
                          alt="Logo Preview"
                          className="h-20 w-20 rounded-xl object-cover shadow-xs ring-1 ring-slate-200 dark:ring-zinc-700"
                        />
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-slate-600 group-hover:text-[#FF6B35] dark:text-zinc-300">
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          <span>Click to change logo</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-400 transition group-hover:scale-110 group-hover:text-[#FF6B35]">
                          add_photo_alternate
                        </span>
                        <span className="mt-2 text-xs font-bold text-slate-700 dark:text-zinc-200">
                          Upload Business Logo
                        </span>
                        <span className="text-[10px] text-slate-400">PNG, JPG, SVG up to 5MB</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Full Card Button: Cover Image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Cover Banner Image
                  </label>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="group relative mt-1.5 flex h-40 w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-2 transition-all hover:border-[#FF6B35] hover:bg-orange-50/20 dark:border-zinc-700 dark:bg-zinc-850/60 dark:hover:border-[#FF6B35]"
                  >
                    {formData.cover_image_url ? (
                      <>
                        <img
                          src={formData.cover_image_url}
                          alt="Cover Preview"
                          className="h-full w-full rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                          <div className="flex items-center gap-1 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
                            <span className="material-symbols-outlined text-sm">cached</span>
                            <span>Change Banner</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-400 transition group-hover:scale-110 group-hover:text-[#FF6B35]">
                          panorama
                        </span>
                        <span className="mt-2 text-xs font-bold text-slate-700 dark:text-zinc-200">
                          Upload Store Cover Banner
                        </span>
                        <span className="text-[10px] text-slate-400">Recommended 1200 × 400</span>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Owner Information */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                    <span className="material-symbols-outlined text-lg">person_pin</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Owner Information</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Primary business owner and executive contact profile.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Owner Full Name
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <span className="material-symbols-outlined text-base">person</span>
                    </span>
                    <input
                      type="text"
                      value={formData.owner_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, owner_name: e.target.value }))}
                      placeholder="e.g. Solomon Tadesse"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                {/* Owner Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Owner Email
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <span className="material-symbols-outlined text-base">mail</span>
                    </span>
                    <input
                      type="email"
                      value={formData.owner_email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, owner_email: e.target.value }))}
                      placeholder="e.g. owner@business.et"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                {/* Owner Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Owner Contact Phone
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <span className="material-symbols-outlined text-base">call</span>
                    </span>
                    <input
                      type="tel"
                      value={formData.owner_phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, owner_phone: e.target.value }))}
                      placeholder="e.g. +251 91 123 4567"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Merchant Branches & Managers */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                    <span className="material-symbols-outlined text-lg">apartment</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Merchant Branches & Managers ({branches.length})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Configure branch locations, manager staff contacts (email, contact number), and GPS navigation.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 ring-1 ring-blue-200 transition hover:bg-blue-100 dark:bg-blue-950/40 dark:ring-blue-900/60 dark:text-blue-400"
                >
                  <span className="material-symbols-outlined text-sm">add_business</span>
                  Add Branch
                </button>
              </div>

              <div className="mt-5 space-y-6">
                {branches.map((branch, index) => (
                  <div
                    key={branch.id || index}
                    className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4.5 transition-all dark:border-zinc-800 dark:bg-zinc-850/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3 dark:border-zinc-700/70">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-zinc-700 dark:text-zinc-300">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {branch.branch_name || `Branch #${index + 1}`}
                        </span>
                        {branch.is_main_branch ? (
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Primary Branch
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetMainBranch(index)}
                            className="text-[10px] font-semibold text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {branches.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBranch(index)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 transition"
                            title="Remove branch"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ======================================================== */}
                    {/* SUB-CARD 1: Branch Location & GPS (Map below GPS button)  */}
                    {/* ======================================================== */}
                    <div className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm text-[#FF6B35]">location_on</span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                            Branch Location & Coordinates
                          </h4>
                        </div>

                        {/* GPS Button: Positioned here with the map appearing directly below it */}
                        <button
                          type="button"
                          onClick={() => handleToggleGps(index)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition ${
                            activeGpsBranchIdx === index
                              ? 'bg-[#FF6B35] text-white ring-2 ring-orange-300 dark:ring-orange-800'
                              : 'border border-orange-200 bg-orange-50 text-[#FF6B35] hover:bg-[#FF6B35] hover:text-white dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400'
                          }`}
                          title="Toggle live GPS Map directly below"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {activeGpsBranchIdx === index ? 'location_off' : 'pin_drop'}
                          </span>
                          <span>{activeGpsBranchIdx === index ? 'Hide GPS Map' : 'GPS'}</span>
                        </button>
                      </div>

                      {/* Map directly below the GPS button */}
                      {activeGpsBranchIdx === index && (
                        <div className="mt-3 overflow-hidden rounded-xl border border-orange-200 bg-orange-50/20 p-3 shadow-2xs dark:border-zinc-700 dark:bg-zinc-900">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm text-[#FF6B35]">map</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                Live GPS Pinpoint: {branch.branch_name || `Branch #${index + 1}`}
                              </span>
                              <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                                ({branch.latitude || 9.0016}, {branch.longitude || 38.7842})
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Full Screen GPS Map Button (Takes whole page of Add New Merchant) */}
                              <button
                                type="button"
                                onClick={() => setFullscreenGpsBranchIdx(index)}
                                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 transition"
                                title="Open full screen GPS map taking whole page"
                              >
                                <span className="material-symbols-outlined text-sm">open_in_full</span>
                                <span>Full Screen</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setActiveGpsBranchIdx(null)}
                                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                                title="Close map"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                              </button>
                            </div>
                          </div>

                          <div className="h-60 w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-zinc-800">
                            <iframe
                              title={`GPS map for branch ${index + 1}`}
                              width="100%"
                              height="100%"
                              loading="lazy"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${(Number(branch.longitude) || 38.7842) - 0.008},${(Number(branch.latitude) || 9.0016) - 0.005},${(Number(branch.longitude) || 38.7842) + 0.008},${(Number(branch.latitude) || 9.0016) + 0.005}&layer=mapnik&marker=${Number(branch.latitude) || 9.0016},${Number(branch.longitude) || 38.7842}`}
                              className="h-full w-full border-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Location & Coordinate Inputs */}
                      <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                            Branch Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={branch.branch_name}
                            onChange={(e) => handleBranchChange(index, 'branch_name', e.target.value)}
                            placeholder="e.g. Bole Medhanialem Flagship"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          />
                          {formErrors[`branch_${index}_name`] && (
                            <p className="mt-1 text-[10px] text-rose-500">{formErrors[`branch_${index}_name`]}</p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                            Physical Address
                          </label>
                          <input
                            type="text"
                            value={branch.address}
                            onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                            placeholder="e.g. Bole Road, Near Medhanialem Mall, Addis Ababa"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                            Latitude <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={branch.latitude}
                            onChange={(e) => handleBranchChange(index, 'latitude', e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          />
                          {formErrors[`branch_${index}_lat`] && (
                            <p className="mt-1 text-[10px] text-rose-500">{formErrors[`branch_${index}_lat`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                            Longitude <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={branch.longitude}
                            onChange={(e) => handleBranchChange(index, 'longitude', e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          />
                          {formErrors[`branch_${index}_lng`] && (
                            <p className="mt-1 text-[10px] text-rose-500">{formErrors[`branch_${index}_lng`]}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ======================================================== */}
                    {/* SUB-CARD 2: Manager & Staff Personal Data                 */}
                    {/* ======================================================== */}
                    <div className="mt-4 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 dark:border-zinc-800">
                        <span className="material-symbols-outlined text-sm text-indigo-500">badge</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                            Manager & Staff Personal Data
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Staff contact credentials and personal details for this branch
                          </p>
                        </div>
                      </div>

                      <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                        {/* Branch Manager Name */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                            Branch Manager Name
                          </label>
                          <input
                            type="text"
                            value={branch.manager_name || ''}
                            onChange={(e) => handleBranchChange(index, 'manager_name', e.target.value)}
                            placeholder="e.g. Dawit Haile"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          />
                        </div>

                        {/* email - Staff email (indexed) */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                            email - Staff email <span className="font-semibold text-emerald-600 dark:text-emerald-400">(indexed)</span>
                          </label>
                          <input
                            type="email"
                            value={branch.email || ''}
                            onChange={(e) => handleBranchChange(index, 'email', e.target.value)}
                            placeholder="staff.manager@merchant.et"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          />
                        </div>

                        {/* phone_number - Contact number */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                            phone_number - Contact number
                          </label>
                          <input
                            type="tel"
                            value={branch.phone_number || ''}
                            onChange={(e) => handleBranchChange(index, 'phone_number', e.target.value)}
                            placeholder="+251 91 123 4567"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* ======================================================== */}
                    {/* SUB-CARD 3: Operating Days & Hours (Small & Easy UX)      */}
                    {/* ======================================================== */}
                    <div className="relative mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                      {/* Tactical subtle grid pattern */}
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 dark:opacity-10" />

                      {/* Top Control Bar */}
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-500 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
                            <span className="material-symbols-outlined text-base">calendar_month</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold tracking-tight text-slate-800 dark:text-zinc-200">
                              Operating Days & Working Hours
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                              Click any card to expand and adjust hours
                            </p>
                          </div>
                        </div>

                        {/* Quick Presets Bar */}
                        <div className="flex items-center gap-1.5">
                          {[
                            { label: 'All 7 Days', preset: 'everyday' },
                            { label: 'Mon – Fri', preset: 'weekdays_only' },
                            { label: 'Weekends', preset: 'weekends_only' },
                          ].map((btn) => (
                            <button
                              key={btn.preset}
                              type="button"
                              onClick={() => {
                                setActiveEditDay(null)
                                handleSetQuickPreset(index, btn.preset)
                              }}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600 transition hover:border-[#FF6B35] hover:text-[#FF6B35] active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-[#FF6B35] dark:hover:text-[#FF6B35]"
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Focus Grid */}
                      <div className="relative z-10 mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
                        {DAYS_OF_WEEK.map((day) => {
                          const sched = (branch.schedule && branch.schedule[day.key]) || {
                            is_open: true,
                            open_time: '08:00',
                            close_time: '22:00',
                          }
                          const isOpen = Boolean(sched.is_open)
                          const dayId = `${index}_${day.key}`
                          const isEditing = activeEditDay === dayId

                          return (
                            <div
                              key={day.key}
                              onClick={() => {
                                if (isOpen && !isEditing) setActiveEditDay(dayId)
                              }}
          className={`group/day relative flex flex-col justify-between rounded-xl border transition-all duration-300 ease-out ${
            isEditing
              ? 'z-20 border-emerald-500 bg-emerald-50/70 p-3 shadow-lg ring-2 ring-emerald-500/20 sm:col-span-2 lg:col-span-2 dark:border-emerald-500 dark:bg-emerald-950/30'
              : isOpen
              ? 'cursor-pointer border-emerald-200/90 bg-emerald-50/30 p-2 shadow-2xs hover:-translate-y-0.5 hover:border-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20'
              : 'border-slate-200 bg-slate-50/70 p-2 opacity-50 dark:border-zinc-800 dark:bg-zinc-900/40'
          }`}
        >
          {/* Header Row: Label + Status/Close + Toggle */}
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span
                className={`font-mono text-xs font-black tracking-wide uppercase ${
                  isOpen
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-zinc-500'
                }`}
              >
                {day.short}
              </span>

              {isEditing && (
                <span className="animate-pulse rounded bg-emerald-600 px-1.5 py-0.2 font-mono text-[8px] font-bold text-white uppercase">
                  EDITING
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Done/Collapse button visible when expanded */}
              {isEditing && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveEditDay(null)
                  }}
                  className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-bold text-slate-600 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  title="Done editing"
                >
                  Done
                </button>
              )}

              {/* Game Toggle Switch */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (isOpen && isEditing) setActiveEditDay(null)
                  handleBranchDayToggle(index, day.key)
                }}
                className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 focus:outline-hidden ${
                  isOpen ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-zinc-700'
                }`}
                title={isOpen ? 'Click to close day' : 'Click to open day'}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                    isOpen ? 'translate-x-3.5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="mt-2 flex flex-1 flex-col justify-between">
            {isOpen ? (
              isEditing ? (
                /* EXPANDED EDIT MODE (Spacious, dual-column layout) */
                <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-2">
                    {/* IN input */}
                    <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800">
                      <span className="block font-mono text-[9px] font-bold text-slate-400 uppercase">
                        Opens At
                      </span>
                      <input
                        type="time"
                        value={sched.open_time || '08:00'}
                        onChange={(e) =>
                          handleBranchDayTimeChange(index, day.key, 'open_time', e.target.value)
                        }
                        className="mt-0.5 w-full bg-transparent font-mono text-xs font-bold text-slate-800 outline-hidden dark:text-zinc-100"
                      />
                    </div>

                    {/* OUT input */}
                    <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-2xs dark:border-zinc-700 dark:bg-zinc-800">
                      <span className="block font-mono text-[9px] font-bold text-slate-400 uppercase">
                        Closes At
                      </span>
                      <input
                        type="time"
                        value={sched.close_time || '22:00'}
                        onChange={(e) =>
                          handleBranchDayTimeChange(index, day.key, 'close_time', e.target.value)
                        }
                        className="mt-0.5 w-full bg-transparent font-mono text-xs font-bold text-slate-800 outline-hidden dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleApplyTimeToAllOpenDays(index, day.key)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[9px] font-bold text-slate-600 transition hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400"
                    >
                      <span className="material-symbols-outlined text-xs">sync</span>
                      Sync to all days
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveEditDay(null)}
                      className="rounded-md bg-emerald-600 px-2.5 py-1 font-mono text-[9px] font-bold text-white shadow-xs transition hover:bg-emerald-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                /* COMPACT SUMMARY MODE (Click card to activate) */
                <div className="flex min-h-[58px] flex-col justify-between py-0.5">
                  <div className="flex flex-col items-center justify-center rounded-lg bg-white/70 py-1.5 shadow-2xs dark:bg-zinc-800/60">
                    <span className="font-mono text-[11px] font-bold tracking-tight text-slate-700 dark:text-zinc-200">
                      {sched.open_time || '08:00'} - {sched.close_time || '22:00'}
                    </span>
                  </div>
                  <span className="pt-1 text-center font-mono text-[8px] font-semibold text-emerald-600 opacity-80 group-hover/day:opacity-100 dark:text-emerald-400">
                    Click to adjust
                  </span>
                </div>
              )
            ) : (
              /* CLOSED STATE */
              <div className="flex min-h-[58px] items-center justify-center">
                <span className="rounded-md border border-slate-200/60 bg-slate-100/60 px-2 py-0.5 font-mono text-[9px] font-bold text-slate-400 uppercase dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-500">
                  Closed
                </span>
              </div>
            )}
          </div>
        </div>
      )
    })}
  </div>
</div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Sidebar (Live Preview + Map) (lg:col-span-4)  */}
          {/* ========================================================= */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              
              {/* TOP RIGHT: Live Customer Preview */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                      Live Customer Preview
                    </h3>
                  </div>
                  <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-950/40">
                    {branches.length} {branches.length === 1 ? 'Branch' : 'Branches'}
                  </span>
                </div>

                <div className="mt-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-xs dark:border-zinc-800 dark:bg-zinc-800/50">
                  <div className="relative h-32 w-full bg-slate-200 dark:bg-zinc-700">
                    <img
                      src={formData.cover_image_url || formData.logo_url}
                      alt={formData.name || 'Preview'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                      {formData.eta_min}-{formData.eta_max} min
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="truncate font-bold text-sm text-slate-900 dark:text-zinc-100">
                          {formData.name || 'Merchant Brand'}
                        </h4>
                        <p className="truncate text-xs text-slate-500 dark:text-zinc-400">
                          {formData.cuisine_name ? `${formData.cuisine_name} • ` : ''}{formData.type}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        {formData.average_rating}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 border-t border-slate-200/60 pt-3 text-[11px] text-slate-600 dark:border-zinc-700/60 dark:text-zinc-400">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-xs text-[#FF6B35]">store</span>
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                          {primaryBranch?.branch_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
                        <span className="truncate">{primaryBranch?.address || 'No address set'}</span>
                      </div>
                      {primaryBranch?.manager_name && (
                        <div className="flex items-center gap-1.5 truncate text-[10px] text-slate-500">
                          <span className="material-symbols-outlined text-xs text-slate-400">person</span>
                          <span>Mgr: {primaryBranch.manager_name}</span>
                        </div>
                      )}
                    </div>

                    {branches.length > 1 && (
                      <div className="mt-3 border-t border-slate-200/60 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Other Branches ({branches.length - 1})
                        </p>
                        <div className="mt-1 space-y-1">
                          {branches
                            .filter((b) => !b.is_main_branch)
                            .map((b) => (
                              <div
                                key={b.id}
                                className="flex items-center justify-between text-[11px] text-slate-600 dark:text-zinc-400"
                              >
                                <span className="truncate">{b.branch_name}</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM RIGHT: Primary / Active Branch Location Map Card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-[#FF6B35]">map</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-200">
                      {activeGpsBranchIdx !== null
                        ? `GPS: ${branches[activeGpsBranchIdx]?.branch_name || `Branch #${activeGpsBranchIdx + 1}`}`
                        : 'Primary Location'}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                    {mapData.lat.toFixed(4)}, {mapData.lng.toFixed(4)}
                  </span>
                </div>

                <div className="h-64 w-full bg-slate-100 dark:bg-zinc-800">
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="100%"
                    loading="lazy"
                    src={mapData.src}
                    className="h-full w-full border-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {mapData.branchName}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-zinc-400">
                      {mapData.address}
                    </p>
                  </div>

                  <a
                    href={mapData.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-lg bg-[#FF6B35] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#e0531f]"
                  >
                    Open Map
                  </a>
                </div>
              </div>

            </div>
          </aside>

        </div>

        {/* Full Screen GPS Map: Takes the whole page of Add New Merchant */}
        {fullscreenGpsBranchIdx !== null && branches[fullscreenGpsBranchIdx] && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white animate-fade-in"
          >
            {/* Full Screen GPS Top Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-900/95 px-6 py-3.5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B35]/20 text-[#FF6B35]">
                  <span className="material-symbols-outlined text-xl">explore</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Full Screen GPS Map — {branches[fullscreenGpsBranchIdx].branch_name || `Branch #${fullscreenGpsBranchIdx + 1}`}
                    </h3>
                    {branches[fullscreenGpsBranchIdx].is_main_branch && (
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                        Primary Branch
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400">
                    {branches[fullscreenGpsBranchIdx].address || 'Addis Ababa, Ethiopia'}
                  </p>
                </div>
              </div>

              {/* Coordinates inspection and edit inside fullscreen bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/80 px-3 py-1.5 text-xs font-mono text-zinc-300">
                  <span className="text-zinc-400">Lat:</span>
                  <input
                    type="number"
                    step="any"
                    value={branches[fullscreenGpsBranchIdx].latitude}
                    onChange={(e) =>
                      handleBranchChange(fullscreenGpsBranchIdx, 'latitude', e.target.value)
                    }
                    className="w-24 rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  />
                  <span className="ml-2 text-zinc-400">Lng:</span>
                  <input
                    type="number"
                    step="any"
                    value={branches[fullscreenGpsBranchIdx].longitude}
                    onChange={(e) =>
                      handleBranchChange(fullscreenGpsBranchIdx, 'longitude', e.target.value)
                    }
                    className="w-24 rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-white focus:border-[#FF6B35] focus:outline-none"
                  />
                </div>

                {/* Exit Full Screen Button */}
                <button
                  type="button"
                  onClick={() => setFullscreenGpsBranchIdx(null)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#e85a27] transition"
                  title="Close full screen map"
                >
                  <span className="material-symbols-outlined text-sm">fullscreen_exit</span>
                  <span>Exit Full Screen</span>
                </button>
              </div>
            </div>

            {/* Map Canvas: Fills entire page */}
            <div className="relative flex-1 w-full bg-zinc-900">
              <iframe
                title={`Full Screen GPS Map for ${branches[fullscreenGpsBranchIdx].branch_name}`}
                width="100%"
                height="100%"
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${(Number(branches[fullscreenGpsBranchIdx].longitude) || 38.7842) - 0.02},${(Number(branches[fullscreenGpsBranchIdx].latitude) || 9.0016) - 0.015},${(Number(branches[fullscreenGpsBranchIdx].longitude) || 38.7842) + 0.02},${(Number(branches[fullscreenGpsBranchIdx].latitude) || 9.0016) + 0.015}&layer=mapnik&marker=${Number(branches[fullscreenGpsBranchIdx].latitude) || 9.0016},${Number(branches[fullscreenGpsBranchIdx].longitude) || 38.7842}`}
                className="h-full w-full border-none"
              />

              {/* Floating Helper Pill */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-zinc-700/80 bg-zinc-900/90 px-4 py-1.5 text-xs text-zinc-300 shadow-xl backdrop-blur-md flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#FF6B35]">info</span>
                <span>Coordinates: {branches[fullscreenGpsBranchIdx].latitude}, {branches[fullscreenGpsBranchIdx].longitude} · Press Esc or click Exit to return</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating In-Page Toast Notification */}
        {toastNotice && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-slide-up">
            <span
              className={`material-symbols-outlined text-lg ${
                toastNotice.type === 'warning'
                  ? 'text-amber-500'
                  : toastNotice.type === 'success'
                  ? 'text-emerald-500'
                  : 'text-[#FF6B35]'
              }`}
            >
              {toastNotice.type === 'warning' ? 'warning' : toastNotice.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
              {toastNotice.message}
            </span>
            <button
              type="button"
              onClick={() => setToastNotice(null)}
              className="ml-2 rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default AddMerchantPage