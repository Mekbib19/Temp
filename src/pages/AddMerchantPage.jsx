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
    name: 'Artisan Cafe',
    category: 'Bakery & Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
  },
]

const COORDINATE_PRESETS = [
  { name: 'Bole Medhanialem', lat: 9.0016, lng: 38.7842, address: 'Bole Road, Near Medhanialem Mall' },
  { name: 'Kazanchis Business Hub', lat: 9.0182, lng: 38.7674, address: 'Kazanchis Intercontinental Quarter' },
  { name: 'Piazza Central', lat: 9.0345, lng: 38.7523, address: 'Piazza Heritage Quarter, De Gaulle Square' },
  { name: 'Sarbet & Old Airport', lat: 8.9951, lng: 38.7408, address: 'Roosevelt St, Sarbet Diplomatic Area' },
  { name: 'CMC Commercial Zone', lat: 9.0221, lng: 38.8354, address: 'CMC Michael Commercial Boulevard' },
]

const createDefaultBranch = (branchName = 'Main Branch', isMain = false) => ({
  id: generateUUID(),
  branch_name: branchName,
  is_main_branch: isMain,
  latitude: 9.0016,
  longitude: 38.7842,
  address: 'Bole Road, Near Medhanialem Mall, Addis Ababa',
  phone: '',
  is_open: true,
  accepts_orders: true,
  opening_hours: '08:00 AM',
  closing_hours: '10:00 PM',
})

const AddMerchantPage = () => {
  const navigate = useNavigate()
  const { merchantId } = useParams()
  const isEdit = Boolean(merchantId)
  const fileInputRef = useRef(null)

  const availableCuisines = useMemo(() => {
    const list = loadStoredCuisines()
    return Array.isArray(list) ? list : []
  }, [])

  const [cuisineSearch, setCuisineSearch] = useState('')

  // Merchant base form data
  const [formData, setFormData] = useState(() => {
    if (merchantId) {
      const existing = getMerchantById(merchantId)
      if (existing) {
        return {
          name: existing.name || '',
          type: existing.type || 'Restaurant & Dining',
          cuisine_id: existing.cuisine_id || availableCuisines[0]?.id || '',
          cuisine_name: existing.cuisine_name || availableCuisines[0]?.name || '',
          status: (existing.status || 'ACTIVE').toUpperCase(),
          description: existing.description || '',
          logo: existing.logo || DEFAULT_SAMPLE_LOGOS[0].url,
          phone: existing.phone || '',
          email: existing.email || '',
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
    return {
      name: '',
      type: 'Restaurant & Dining',
      cuisine_id: availableCuisines[0]?.id || '',
      cuisine_name: availableCuisines[0]?.name || 'Gourmet Dining',
      status: 'ACTIVE',
      description: '',
      logo: DEFAULT_SAMPLE_LOGOS[0].url,
      phone: '',
      email: '',
      is_featured: false,
      eta_min: 20,
      eta_max: 40,
      commission_rate: 15,
      average_rating: 4.8,
      total_rating: 5,
      total_reviews: 14,
    }
  })

  // Multi-branch state
  const [branches, setBranches] = useState(() => {
    if (merchantId) {
      const existing = getMerchantById(merchantId)
      if (existing?.branches?.length) {
        return existing.branches
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
            phone: existing.phone || '',
            is_open: existing.is_open !== undefined ? Boolean(existing.is_open) : true,
            accepts_orders: existing.accepts_orders !== undefined ? Boolean(existing.accepts_orders) : true,
            opening_hours: existing.opening_hours || '08:00 AM',
            closing_hours: existing.closing_hours || '10:00 PM',
          },
        ]
      }
    }
    return [createDefaultBranch('Main Branch', true)]
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectingLocationIdx, setDetectingLocationIdx] = useState(null)

  const filteredCuisines = useMemo(() => {
    if (!cuisineSearch.trim()) return availableCuisines
    const q = cuisineSearch.toLowerCase()
    return availableCuisines.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))
    )
  }, [availableCuisines, cuisineSearch])

  // Branch CRUD operations
  const handleAddBranch = () => {
    const newBranch = createDefaultBranch(
      `${formData.name || 'Merchant'} Branch ${branches.length + 1}`,
      branches.length === 0
    )
    setBranches((prev) => [...prev, newBranch])
  }

  const handleRemoveBranch = (index) => {
    if (branches.length === 1) {
      alert('A merchant must have at least one branch.')
      return
    }
    const updated = branches.filter((_, idx) => idx !== index)
    // Guarantee at least one branch remains designated as the main branch
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

  const handleDetectGPS = (branchIndex) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setDetectingLocationIdx(branchIndex)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDetectingLocationIdx(null)
        handleBranchChange(branchIndex, 'latitude', parseFloat(pos.coords.latitude.toFixed(6)))
        handleBranchChange(branchIndex, 'longitude', parseFloat(pos.coords.longitude.toFixed(6)))
      },
      (err) => {
        setDetectingLocationIdx(null)
        alert('Could not retrieve current location: ' + err.message)
      },
      { timeout: 8000 }
    )
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) {
      alert('Please upload a valid image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({ ...prev, logo: event.target.result }))
      }
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Merchant name is required.'
    if (!formData.cuisine_id) errors.cuisine_id = 'Please select a cuisine type.'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please provide a valid email address.'
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
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    const autoSlug = slugify(formData.name.trim())
    const mainBranch = branches.find((b) => b.is_main_branch) || branches[0]

    const basePayload = {
      name: formData.name.trim(),
      slug: autoSlug,
      type: formData.type,
      cuisine_id: formData.cuisine_id,
      cuisine_name: formData.cuisine_name,
      locations: branches.length,
      status: formData.status,
      description:
        formData.description.trim() ||
        `${formData.name.trim()} provides expedited local delivery fulfillment across ${branches.length} branch location(s).`,
      logo: formData.logo,
      phone: formData.phone.trim() || mainBranch.phone,
      email: formData.email.trim(),
      commission_rate: parseInt(formData.commission_rate, 10) || 15,
      eta_min: parseInt(formData.eta_min, 10) || 20,
      eta_max: parseInt(formData.eta_max, 10) || 40,
      average_rating: parseFloat(formData.average_rating) || 4.8,
      total_rating: parseInt(formData.total_rating, 10) || 5,
      total_reviews: parseInt(formData.total_reviews, 10) || 14,
      is_featured: Boolean(formData.is_featured),

      // Primary branch fields for backward-compatibility
      branch_name: mainBranch.branch_name,
      is_main_branch: true,
      latitude: parseFloat(mainBranch.latitude) || 9.0016,
      longitude: parseFloat(mainBranch.longitude) || 38.7842,
      address: mainBranch.address.trim(),
      opening_hours: mainBranch.opening_hours.trim(),
      closing_hours: mainBranch.closing_hours.trim(),
      operatingHours: `${mainBranch.opening_hours} - ${mainBranch.closing_hours}`,
      is_open: Boolean(mainBranch.is_open),
      accepts_orders: Boolean(mainBranch.accepts_orders),

      // Full branch directory array
      branches: branches.map((b) => ({
        ...b,
        latitude: parseFloat(b.latitude) || 9.0016,
        longitude: parseFloat(b.longitude) || 38.7842,
        operatingHours: `${b.opening_hours} - ${b.closing_hours}`,
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

  const primaryBranch = branches.find((b) => b.is_main_branch) || branches[0]

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Merchants"
      breadcrumbCurrent={isEdit ? 'Edit Merchant' : 'Add New Merchant'}
    >
      <div className="space-y-6 pb-16">
        {/* Header */}
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
              Configure brand profile, multi-branch network, coordinates, and operational parameters.
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-8">
            {/* Identity & Classification */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                  <span className="material-symbols-outlined text-lg">store</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Merchant Identity & Classification
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">Primary legal entity and catalog details.</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Name <span className="text-rose-500">*</span>
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
                    Merchant Type / Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {MERCHANT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">Contact Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@merchant.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                  {formErrors.email && <p className="mt-1 text-[11px] text-rose-500">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+251 91 123 4567"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            </div>

            {/* Cuisine Selector */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                    <span className="material-symbols-outlined text-lg">dinner_dining</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Cuisine Style</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Classify menu and search grouping.</p>
                  </div>
                </div>

                <input
                  type="text"
                  value={cuisineSearch}
                  onChange={(e) => setCuisineSearch(e.target.value)}
                  placeholder="Filter cuisines..."
                  className="h-8 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:w-48 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              {formErrors.cuisine_id && (
                <p className="mt-2 text-[11px] text-rose-500">{formErrors.cuisine_id}</p>
              )}

              <div className="mt-4 max-h-48 overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {filteredCuisines.map((cuisine) => {
                    const isSelected = formData.cuisine_id === cuisine.id
                    return (
                      <label
                        key={cuisine.id}
                        className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-2.5 transition ${
                          isSelected
                            ? 'border-[#FF6B35] bg-orange-50/40 ring-1 ring-[#FF6B35]/30 dark:bg-orange-950/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-850'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selected_cuisine"
                          checked={isSelected}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              cuisine_id: cuisine.id,
                              cuisine_name: cuisine.name,
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            isSelected ? 'border-[#FF6B35] bg-[#FF6B35]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200">
                          {cuisine.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Logo Branding */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                    <span className="material-symbols-outlined text-lg">image</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Store Branding</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Custom logo or visual avatar.</p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl bg-orange-50 px-3.5 py-2 text-xs font-bold text-[#FF6B35] ring-1 ring-orange-200/70 hover:bg-orange-100/70 dark:bg-orange-950/40 dark:ring-orange-900/60"
                >
                  Upload File
                </button>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="h-16 w-16 rounded-xl border border-slate-200 object-cover shadow-xs dark:border-zinc-700"
                />
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_SAMPLE_LOGOS.map((sample) => (
                    <button
                      key={sample.name}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, logo: sample.url }))}
                      className={`h-10 w-10 overflow-hidden rounded-lg border-2 transition ${
                        formData.logo === sample.url
                          ? 'border-[#FF6B35] ring-2 ring-orange-200 dark:ring-orange-950'
                          : 'border-slate-200 opacity-60 hover:opacity-100 dark:border-zinc-700'
                      }`}
                    >
                      <img src={sample.url} alt={sample.name} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DYNAMIC BRANCHES SECTION */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                    <span className="material-symbols-outlined text-lg">apartment</span>
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Merchant Branches ({branches.length})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Add physical branch locations, GPS coordinates, and specific operation details.
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
                    className="relative rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all dark:border-zinc-800 dark:bg-zinc-850/60"
                  >
                    {/* Branch Header Controls */}
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
                        <button
                          type="button"
                          onClick={() => handleDetectGPS(index)}
                          disabled={detectingLocationIdx === index}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <span className="material-symbols-outlined text-xs text-[#FF6B35]">my_location</span>
                          {detectingLocationIdx === index ? 'Locating...' : 'GPS'}
                        </button>
                        {branches.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBranch(index)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
                            title="Remove branch"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Branch Fields */}
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
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

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Branch Phone
                        </label>
                        <input
                          type="text"
                          value={branch.phone}
                          onChange={(e) => handleBranchChange(index, 'phone', e.target.value)}
                          placeholder="+251 91 000 0000"
                          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                          Physical Address
                        </label>
                        <input
                          type="text"
                          value={branch.address}
                          onChange={(e) => handleBranchChange(index, 'address', e.target.value)}
                          placeholder="e.g. Bole Road, Near Medhanialem Mall"
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

                      <div className="flex items-center gap-4 pt-4 sm:col-span-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={branch.is_open}
                            onChange={(e) => handleBranchChange(index, 'is_open', e.target.checked)}
                            className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                          />
                          <span className="text-xs text-slate-700 dark:text-zinc-300">Open</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={branch.accepts_orders}
                            onChange={(e) => handleBranchChange(index, 'accepts_orders', e.target.checked)}
                            className="rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                          />
                          <span className="text-xs text-slate-700 dark:text-zinc-300">Take Orders</span>
                        </label>
                      </div>
                    </div>

                    {/* Presets shortcut per branch */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {COORDINATE_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            handleBranchChange(index, 'latitude', preset.lat)
                            handleBranchChange(index, 'longitude', preset.lng)
                            handleBranchChange(index, 'address', preset.address)
                          }}
                          className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600 hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
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
                      src={formData.logo}
                      alt={formData.name || 'Preview'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-2 top-2 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-xs">
                      {formData.eta_min}-{formData.eta_max} min
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                          {formData.name || 'Merchant Brand'}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                          {formData.cuisine_name} • {formData.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        {formData.average_rating}
                      </div>
                    </div>

                    {/* Primary Branch Info */}
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
                    </div>

                    {/* Multi-branch list breakdown */}
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
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    b.is_open ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary coordinates */}
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-[11px] dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="flex justify-between text-slate-500 dark:text-zinc-400">
                    <span>Main Branch GPS:</span>
                    <span className="font-mono text-slate-800 dark:text-zinc-200">
                      {primaryBranch?.latitude}, {primaryBranch?.longitude}
                    </span>
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