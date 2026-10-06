import { useState, useMemo, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { MERCHANT_TYPES, addMerchant, generateUUID, getMerchantById, updateMerchant } from '../data/demoMerchants'
import { loadStoredCuisines, slugify } from '../data/demoCuisines'

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
    name: 'Pharmacy & Care',
    category: 'Pharmacy & Health',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Artisan Cafe',
    category: 'Bakery & Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fine Wines',
    category: 'Beverage & Spirits',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Retail & Tech',
    category: 'Retail & Convenience',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Healthy Bowls',
    category: 'Specialty & Gourmet',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80',
  },
]

const COORDINATE_PRESETS = [
  { name: 'Bole Medhanialem', lat: 9.0016, lng: 38.7842, address: 'Bole Road, Near Medhanialem Mall' },
  { name: 'Kazanchis Business Hub', lat: 9.0182, lng: 38.7674, address: 'Kazanchis Intercontinental Quarter' },
  { name: 'Piazza Central', lat: 9.0345, lng: 38.7523, address: 'Piazza Heritage Quarter, De Gaulle Square' },
  { name: 'Sarbet & Old Airport', lat: 8.9951, lng: 38.7408, address: 'Roosevelt St, Sarbet Diplomatic Area' },
  { name: 'CMC Commercial Zone', lat: 9.0221, lng: 38.8354, address: 'CMC Michael Commercial Boulevard' },
]

const AddMerchantPage = () => {
  const navigate = useNavigate()
  const { merchantId } = useParams()
  const isEdit = Boolean(merchantId)
  const fileInputRef = useRef(null)

  // Load available cuisines for the radio button selector
  const availableCuisines = useMemo(() => {
    const list = loadStoredCuisines()
    return Array.isArray(list) ? list : []
  }, [])

  const [cuisineSearch, setCuisineSearch] = useState('')

  const [formData, setFormData] = useState(() => {
    if (merchantId) {
      const existing = getMerchantById(merchantId)
      if (existing) {
        return {
          name: existing.name || '',
          type: existing.type || 'Restaurant & Dining',
          cuisine_id: existing.cuisine_id || availableCuisines[0]?.id || '',
          cuisine_name: existing.cuisine_name || availableCuisines[0]?.name || '',
          locations: existing.locations || 1,
          status: (existing.status || 'ACTIVE').toUpperCase(),
          description: existing.description || '',
          logo: existing.logo || DEFAULT_SAMPLE_LOGOS[0].url,
          phone: existing.phone || '',
          email: existing.email || '',
          branch_name: existing.branch_name || `${existing.name} Main Branch`,
          is_featured: Boolean(existing.is_featured),
          is_main_branch: existing.is_main_branch !== undefined ? Boolean(existing.is_main_branch) : true,
          latitude: typeof existing.latitude === 'number' ? existing.latitude : 9.0016,
          longitude: typeof existing.longitude === 'number' ? existing.longitude : 38.7842,
          address: existing.address || 'Bole Road, Near Medhanialem Mall, Addis Ababa',
          opening_hours: existing.opening_hours || '08:00 AM',
          closing_hours: existing.closing_hours || '10:00 PM',
          is_open: existing.is_open !== undefined ? Boolean(existing.is_open) : true,
          accepts_orders: existing.accepts_orders !== undefined ? Boolean(existing.accepts_orders) : true,
          eta_min: existing.eta_min || 20,
          eta_max: existing.eta_max || 40,
          commission_rate: existing.commission_rate || 15,
          average_rating: existing.average_rating || 4.8,
          total_rating: existing.total_rating || 5,
          total_reviews: existing.total_reviews || 14,
        }
      }
    }
    return {
      name: '',
      type: 'Restaurant & Dining',
      cuisine_id: availableCuisines[0]?.id || '',
      cuisine_name: availableCuisines[0]?.name || 'Gourmet Angus Smashburgers',
      locations: 1,
      status: 'ACTIVE',
      description: '',
      logo: DEFAULT_SAMPLE_LOGOS[0].url,
      phone: '',
      email: '',
      branch_name: 'Main Branch',
      is_featured: false,
      is_main_branch: true,
      latitude: 9.0016,
      longitude: 38.7842,
      address: 'Bole Road, Near Medhanialem Mall, Addis Ababa',
      opening_hours: '08:00 AM',
      closing_hours: '10:00 PM',
      is_open: true,
      accepts_orders: true,
      eta_min: 20,
      eta_max: 40,
      commission_rate: 15,
      average_rating: 4.8,
      total_rating: 5,
      total_reviews: 14,
    }
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

  // Filtered cuisines for radio button list
  const filteredCuisines = useMemo(() => {
    if (!cuisineSearch.trim()) return availableCuisines
    const q = cuisineSearch.toLowerCase()
    return availableCuisines.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    )
  }, [availableCuisines, cuisineSearch])

  const handleNameChange = (e) => {
    const val = e.target.value
    setFormData((prev) => ({
      ...prev,
      name: val,
      branch_name: prev.branch_name === 'Main Branch' || !prev.branch_name ? `${val} Main Branch` : prev.branch_name,
    }))
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: null }))
    }
  }

  // Handle direct file upload for logo
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, logo: dataUrl }))
      }
    }
    reader.readAsDataURL(file)
  }

  // Detect current GPS location
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }

    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingLocation(false)
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
        }))
      },
      (err) => {
        setDetectingLocation(false)
        alert('Could not retrieve current location: ' + err.message)
      },
      { timeout: 8000 }
    )
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) {
      errors.name = 'Merchant name is required.'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.'
    }

    if (formData.latitude === '' || isNaN(formData.latitude)) {
      errors.latitude = 'Valid latitude coordinate is required.'
    } else if (formData.latitude < -90 || formData.latitude > 90) {
      errors.latitude = 'Latitude must be between -90 and 90.'
    }

    if (formData.longitude === '' || isNaN(formData.longitude)) {
      errors.longitude = 'Valid longitude coordinate is required.'
    } else if (formData.longitude < -180 || formData.longitude > 180) {
      errors.longitude = 'Longitude must be between -180 and 180.'
    }

    if (!formData.cuisine_id) {
      errors.cuisine_id = 'Please select a cuisine type.'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)

    const autoSlug = slugify(formData.name.trim())

    if (isEdit) {
      const updatePayload = {
        name: formData.name.trim(),
        slug: autoSlug, // Auto computed behind scenes
        type: formData.type,
        cuisine_id: formData.cuisine_id,
        cuisine_name: formData.cuisine_name,
        locations: parseInt(formData.locations, 10) || 1,
        status: formData.status, // ACTIVE, INACTIVE, PENDING, BLOCKED
        description:
          formData.description.trim() ||
          `${formData.name.trim()} is an authorized merchant partner providing expedited delivery fulfillment.`,
        logo: formData.logo,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        commission_rate: parseInt(formData.commission_rate, 10) || 15,

        // Primary Branch details adhering to user schema
        branch_name: formData.branch_name.trim() || `${formData.name.trim()} Main Branch`,
        is_featured: Boolean(formData.is_featured),
        is_main_branch: Boolean(formData.is_main_branch),
        latitude: parseFloat(formData.latitude) || 9.0016,
        longitude: parseFloat(formData.longitude) || 38.7842,
        address: formData.address.trim() || 'Addis Ababa Central Zone',
        opening_hours: formData.opening_hours.trim(),
        closing_hours: formData.closing_hours.trim(),
        operatingHours: `${formData.opening_hours} - ${formData.closing_hours}`,
        is_open: Boolean(formData.is_open),
        accepts_orders: Boolean(formData.accepts_orders),
        eta_min: parseInt(formData.eta_min, 10) || 20,
        eta_max: parseInt(formData.eta_max, 10) || 40,
        average_rating: parseFloat(formData.average_rating) || 4.8,
        total_rating: parseInt(formData.total_rating, 10) || 5,
        total_reviews: parseInt(formData.total_reviews, 10) || 14,
      }

      updateMerchant(merchantId, updatePayload)

      setTimeout(() => {
        navigate('/restaurants', {
          state: { toastMessage: `Merchant "${updatePayload.name}" successfully updated!` },
        })
      }, 200)
    } else {
      const merchantUUID = generateUUID()

      const payload = {
        id: merchantUUID, // UUID primary key only
        merchant_id: merchantUUID, // FK to merchants
        name: formData.name.trim(),
        slug: autoSlug, // Generated behind the scenes
        type: formData.type,
        cuisine_id: formData.cuisine_id,
        cuisine_name: formData.cuisine_name,
        locations: parseInt(formData.locations, 10) || 1,
        status: formData.status, // ACTIVE, INACTIVE, PENDING, BLOCKED
        description:
          formData.description.trim() ||
          `${formData.name.trim()} is an authorized merchant partner providing expedited delivery fulfillment.`,
        logo: formData.logo,
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        commission_rate: parseInt(formData.commission_rate, 10) || 15,

        // Primary Branch details adhering to user schema
        branch_name: formData.branch_name.trim() || `${formData.name.trim()} Main Branch`,
        is_featured: Boolean(formData.is_featured),
        is_main_branch: Boolean(formData.is_main_branch),
        latitude: parseFloat(formData.latitude) || 9.0016,
        longitude: parseFloat(formData.longitude) || 38.7842,
        address: formData.address.trim() || 'Addis Ababa Central Zone',
        opening_hours: formData.opening_hours.trim(),
        closing_hours: formData.closing_hours.trim(),
        operatingHours: `${formData.opening_hours} - ${formData.closing_hours}`,
        is_open: Boolean(formData.is_open),
        accepts_orders: Boolean(formData.accepts_orders),
        eta_min: parseInt(formData.eta_min, 10) || 20,
        eta_max: parseInt(formData.eta_max, 10) || 40,
        average_rating: 4.8,
        total_rating: 5,
        total_reviews: 14,
      }

      addMerchant(payload)

      setTimeout(() => {
        navigate('/restaurants', {
          state: { toastMessage: `Merchant "${payload.name}" successfully onboarded!` },
        })
      }, 200)
    }
  }

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Merchants"
      breadcrumbCurrent={isEdit ? 'Edit Merchant' : 'Add New Merchant'}
    >
      <div className="space-y-6 pb-16">
        {/* Page Header */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/restaurants')}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                title="Return to Merchants"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>
              <h1 className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {isEdit ? 'Edit Merchant Partner' : 'Add New Merchant'}
              </h1>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
              {isEdit
                ? 'Update merchant profile, coordinates, cuisine classification, and branch operating parameters.'
                : 'Onboard a merchant partner with geo-coordinates, cuisine classification, and branch parameters.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/restaurants')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f] disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              {isSubmitting ? 'Saving Merchant...' : isEdit ? 'Update Merchant' : 'Create Merchant'}
            </button>
          </div>
        </section>

        {/* Form & Live Preview Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Form (8 Columns) */}
          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-8">
            {/* Section 1: Merchant Identity & Category */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                  <span className="material-symbols-outlined text-lg">store</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Merchant Identity & Classification
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Public commercial brand name and platform catalog type.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Habesha Gourmet Kitchen, Whole Harvest"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Branch Name <span className="text-slate-400 font-normal">(name)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.branch_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, branch_name: e.target.value }))}
                    placeholder="e.g. Bole Medhanialem Flagship Branch"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Type / Category <span className="text-rose-500">*</span>
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
              </div>
            </div>

            {/* Section 2: Cuisine Selector (Radio Button List) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-lg">dinner_dining</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Cuisine Selection <span className="text-rose-500">*</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Select primary cuisine style using radio options below.
                    </p>
                  </div>
                </div>

                {/* Search / Filter Cuisines */}
                <div className="relative w-full sm:w-56">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={cuisineSearch}
                    onChange={(e) => setCuisineSearch(e.target.value)}
                    placeholder="Filter cuisines..."
                    className="h-8 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              {formErrors.cuisine_id && (
                <p className="mt-2 text-[11px] text-rose-500">{formErrors.cuisine_id}</p>
              )}

              {/* Radio Button Options Grid */}
              <div className="mt-4 max-h-64 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {filteredCuisines.map((cuisine) => {
                    const isSelected = formData.cuisine_id === cuisine.id
                    return (
                      <label
                        key={cuisine.id}
                        className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                          isSelected
                            ? 'border-[#FF6B35] bg-orange-50/50 shadow-xs ring-1 ring-[#FF6B35]/40 dark:bg-orange-950/20'
                            : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800/80'
                        }`}
                      >
                        {/* Hidden Native Radio Input */}
                        <input
                          type="radio"
                          name="selected_cuisine"
                          value={cuisine.id}
                          checked={isSelected}
                          onChange={() => {
                            setFormData((prev) => ({
                              ...prev,
                              cuisine_id: cuisine.id,
                              cuisine_name: cuisine.name,
                            }))
                            if (formErrors.cuisine_id) {
                              setFormErrors((prev) => ({ ...prev, cuisine_id: null }))
                            }
                          }}
                          className="sr-only"
                        />

                        {/* Custom Radio Button Indicator */}
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isSelected
                              ? 'border-[#FF6B35] bg-[#FF6B35]'
                              : 'border-slate-300 bg-white group-hover:border-slate-400 dark:border-zinc-600 dark:bg-zinc-800'
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>

                        {/* Cuisine Icon */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/40 dark:bg-orange-950/30 dark:ring-orange-800/30 overflow-hidden">
                          {cuisine.icon && (cuisine.icon.startsWith('http') || cuisine.icon.startsWith('data:')) ? (
                            <img src={cuisine.icon} alt="" className="h-5 w-5 object-contain" />
                          ) : (
                            <span className="material-symbols-outlined text-[19px]">
                              {cuisine.icon || 'dinner_dining'}
                            </span>
                          )}
                        </div>

                        {/* Cuisine Details */}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-bold truncate transition-colors ${
                              isSelected ? 'text-[#FF6B35]' : 'text-slate-900 dark:text-zinc-100'
                            }`}
                          >
                            {cuisine.name}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 dark:text-zinc-400">
                            {cuisine.description || 'Specialty cuisine style'}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Section 3: Store Branding & Visual Logo (No Logo URL input, synced to preview) */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                  <span className="material-symbols-outlined text-lg">image</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Store Branding & Visual Logo
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Upload your custom logo or select from sample presets. Changing this immediately updates the Live Preview.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Current Active Logo Avatar */}
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-orange-200 bg-white shadow-sm ring-2 ring-orange-100 dark:border-orange-900/60 dark:bg-zinc-800 dark:ring-orange-950/40">
                      {formData.logo ? (
                        <img
                          src={formData.logo}
                          alt="Merchant Logo"
                          className="h-full w-full object-cover transition-transform duration-200"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-slate-400">
                          storefront
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          Active Store Logo
                        </span>
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                          Live Synced
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Rendered on merchant directory, order tickets, and customer interface.
                      </p>
                    </div>
                  </div>

                  {/* Direct file upload button */}
                  <div className="sm:ml-auto">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/svg+xml,image/png,image/jpeg,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-xs font-bold text-[#FF6B35] ring-1 ring-orange-200/70 transition hover:bg-orange-100/70 dark:bg-orange-950/40 dark:ring-orange-900/60"
                    >
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      Upload Logo File (PNG, JPG, SVG)
                    </button>
                  </div>
                </div>

                {/* Sample Presets with Active Selection Highlight */}
              
              </div>
            </div>

            {/* Section 4: Primary Branch Location & Geo-Coordinates */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                    <span className="material-symbols-outlined text-lg">explore</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Location & Geo-Coordinates
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Latitude and Longitude coordinates used for routing, dispatch, and radius discovery.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDetectCurrentLocation}
                  disabled={detectingLocation}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <span className="material-symbols-outlined text-sm text-[#FF6B35]">my_location</span>
                  {detectingLocation ? 'Locating...' : 'Use Current GPS'}
                </button>
              </div>

              {/* Quick Coordinates Presets */}
            

              {/* Coordinates & Branch Fields */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Latitude Coordinate <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <span className="pointer-events-none absolute left-3 text-xs font-mono text-slate-400">
                      LAT
                    </span>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || '' }))
                      }
                      placeholder="e.g. 9.0016"
                      className={`w-full rounded-xl border bg-white pl-11 pr-3 py-2.5 text-xs font-mono text-slate-800 transition focus:outline-none dark:bg-zinc-800 dark:text-zinc-200 ${
                        formErrors.latitude
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700'
                      }`}
                    />
                  </div>
                  {formErrors.latitude && (
                    <p className="mt-1 text-[11px] text-rose-500">{formErrors.latitude}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Longitude Coordinate <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <span className="pointer-events-none absolute left-3 text-xs font-mono text-slate-400">
                      LNG
                    </span>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || '' }))
                      }
                      placeholder="e.g. 38.7842"
                      className={`w-full rounded-xl border bg-white pl-11 pr-3 py-2.5 text-xs font-mono text-slate-800 transition focus:outline-none dark:bg-zinc-800 dark:text-zinc-200 ${
                        formErrors.longitude
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-slate-200 focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] dark:border-zinc-700'
                      }`}
                    />
                  </div>
                  {formErrors.longitude && (
                    <p className="mt-1 text-[11px] text-rose-500">{formErrors.longitude}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Physical Store Address / Landmark
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. Bole Road, Near Medhanialem Mall, Ground Floor Suite 104"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Branch Parameters & Operational Schema Flags */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                  <span className="material-symbols-outlined text-lg">tune</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Branch Parameters & Operating Hours
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Fulfillment windows, delivery ETA range, and live operational status.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData((prev) => ({ ...prev, opening_hours: e.target.value }))}
                    placeholder="08:00 AM"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Closing Hours
                  </label>
                  <input
                    type="text"
                    value={formData.closing_hours}
                    onChange={(e) => setFormData((prev) => ({ ...prev, closing_hours: e.target.value }))}
                    placeholder="10:00 PM"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Status (Enum)
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    ETA Min (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={formData.eta_min}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, eta_min: parseInt(e.target.value, 10) || 15 }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    ETA Max (Minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    value={formData.eta_max}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, eta_max: parseInt(e.target.value, 10) || 45 }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Platform Commission (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.commission_rate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        commission_rate: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Average Rating <span className="text-slate-400 font-normal">(analytics)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.average_rating}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        average_rating: parseFloat(e.target.value) || 4.8,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Total Reviews <span className="text-slate-400 font-normal">(analytics)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_reviews}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        total_reviews: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              {/* Operational Flags */}
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4 dark:border-zinc-800">
                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/80 p-2.5 text-xs font-semibold text-slate-700 dark:border-zinc-800 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.accepts_orders}
                    onChange={(e) => setFormData((prev) => ({ ...prev, accepts_orders: e.target.checked }))}
                    className="h-4 w-4 rounded accent-[#FF6B35]"
                  />
                  <span>Accepts Orders</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/80 p-2.5 text-xs font-semibold text-slate-700 dark:border-zinc-800 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.is_open}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_open: e.target.checked }))}
                    className="h-4 w-4 rounded accent-[#FF6B35]"
                  />
                  <span>Currently Open</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/80 p-2.5 text-xs font-semibold text-slate-700 dark:border-zinc-800 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                    className="h-4 w-4 rounded accent-[#FF6B35]"
                  />
                  <span>Featured Branch</span>
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/80 p-2.5 text-xs font-semibold text-slate-700 dark:border-zinc-800 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={formData.is_main_branch}
                    onChange={(e) => setFormData((prev) => ({ ...prev, is_main_branch: e.target.checked }))}
                    className="h-4 w-4 rounded accent-[#FF6B35]"
                  />
                  <span>Main Branch Flag</span>
                </label>
              </div>
            </div>

            {/* Section 6: Contact & Catalog Description */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 (9) 1122-3344"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@merchantdomain.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-[11px] text-rose-500">{formErrors.email}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Store Catalog Highlights & Description
                  </label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe merchant offerings, signatures, preparation standards, or sourcing..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/restaurants')}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#e0531f] disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">check</span>
                {isSubmitting ? 'Saving Merchant...' : 'Complete Onboarding & Save'}
              </button>
            </div>
          </form>

          {/* Right Column: Live Merchant Preview (4 Columns) - Reactive to Logo & Coordinates */}
          <div className="space-y-6 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Profile Card Preview */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="bg-gradient-to-r from-orange-500 to-[#FF6B35] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200">
                      Live Merchant Preview
                    </span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {formData.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-['Plus_Jakarta_Sans'] text-xl font-bold truncate">
                    {formData.name || 'Merchant Name'}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-orange-100">
                    <span>{formData.type}</span>
                    {formData.cuisine_name && (
                      <>
                        <span>•</span>
                        <span className="rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-bold">
                          {formData.cuisine_name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3.5">
                    {/* Live Logo Preview - Identical to Store Branding */}
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-100 bg-white shadow-sm ring-1 ring-slate-200/80 dark:border-zinc-700 dark:bg-zinc-800">
                      {formData.logo ? (
                        <img
                          src={formData.logo}
                          alt="Live Logo Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-slate-400">
                          storefront
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            formData.is_open
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              formData.is_open ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {formData.is_open ? 'Open Now' : 'Closed'}
                        </span>
                        {formData.accepts_orders && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            Accepting Orders
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-600 truncate dark:text-zinc-300">
                        {formData.address || 'Location pending'}
                      </p>
                    </div>
                  </div>

                  {/* Coordinates Badge */}
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-2.5 text-xs dark:border-blue-900/40 dark:bg-blue-950/20">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-blue-700 dark:text-blue-300">
                      <span className="material-symbols-outlined text-sm">pin_drop</span>
                      <span>
                        Lat: {formData.latitude || '0.0000'}, Lng: {formData.longitude || '0.0000'}
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-500">Indexed</span>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 text-xs dark:border-zinc-800">
                    <p className="text-slate-600 line-clamp-3 dark:text-zinc-300">
                      {formData.description ||
                        'Store highlights and catalog summary will be highlighted here for customer fulfillment discovery.'}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-1.5 rounded-xl bg-slate-50 p-2 text-center dark:bg-zinc-800/60">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        Rating
                      </span>
                      <p className="text-xs font-extrabold text-amber-500">
                        ★ {formData.average_rating || 4.8}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        Reviews
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {formData.total_reviews || 14}
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        ETA
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        {formData.eta_min}-{formData.eta_max}m
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-400">
                        Fee
                      </span>
                      <p className="text-xs font-bold text-slate-800 truncate dark:text-zinc-200">
                        {formData.commission_rate}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Row Representation */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Table Column Rendering:
                </span>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                  <img
                    src={
                      formData.logo ||
                      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80'
                    }
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-slate-200/80 dark:ring-zinc-700"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-slate-900 truncate dark:text-zinc-100">
                      {formData.name || 'Merchant Name'}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-zinc-400">
                      <span>{formData.type}</span>
                      {formData.cuisine_name && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-[#FF6B35] truncate">
                            {formData.cuisine_name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default AddMerchantPage
