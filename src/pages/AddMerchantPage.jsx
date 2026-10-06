import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { MERCHANT_TYPES, addMerchant } from '../data/demoMerchants'

const DEFAULT_SAMPLE_LOGOS = [
  {
    name: 'Gourmet Burger',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fresh Grocery',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pharmacy & Care',
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Artisan Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fine Wines',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=150&auto=format&fit=crop&q=80',
  },
  {
    name: 'Retail & Tech',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
  },
]

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')

const AddMerchantPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    type: 'Restaurant & Dining',
    slug: '',
    locations: 1,
    status: 'Active',
    description: '',
    logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=150&auto=format&fit=crop&q=80',
    banner: '',
    phone: '',
    email: '',
    address: '',
    operatingHours: '08:00 AM - 10:00 PM',
    commission_rate: 15,
  })

  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNameChange = (e) => {
    const val = e.target.value
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === '' || prev.slug === slugify(prev.name) ? slugify(val) : prev.slug,
    }))
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: null }))
    }
  }

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

  const validate = () => {
    const errors = {}
    if (!formData.name.trim()) {
      errors.name = 'Merchant name is required.'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.'
    }

    if (formData.locations === '' || isNaN(formData.locations) || Number(formData.locations) < 1) {
      errors.locations = 'Locations count must be at least 1.'
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

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      locations: parseInt(formData.locations, 10) || 1,
      status: formData.status,
      description: formData.description.trim() || 'Premium merchant partner providing express local fulfillment.',
      logo:
        formData.logo ||
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      commission_rate: parseInt(formData.commission_rate, 10) || 15,
      operatingHours: formData.operatingHours.trim(),
    }

    addMerchant(payload)

    setTimeout(() => {
      navigate('/restaurants', {
        state: { toastMessage: `Merchant "${payload.name}" successfully onboarded!` },
      })
    }, 200)
  }

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Merchants"
      breadcrumbCurrent="Add New Merchant"
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
                Add New Merchant
              </h1>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-zinc-400">
              Onboard a new merchant partner across food dining, grocery markets, pharmacy care, or retail.
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
              {isSubmitting ? 'Saving Merchant...' : 'Create Merchant'}
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
                    Define the public merchant name, business type, and handle.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Whole Harvest Organic Market, MedExpress Pharmacy, The Burger Hub"
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Store Handle / Slug
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <span className="pointer-events-none absolute left-3 text-xs text-slate-400">@</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                      placeholder="merchant-handle"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Legal / Business Entity Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.legalName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, legalName: e.target.value }))}
                    placeholder="e.g. Harvest Group LLC, Apex Healthcare Corp"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Visual Branding & Logo */}
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
                    Upload an avatar logo or paste a direct image URL.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Live Badge Preview */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
                      {formData.logo ? (
                        <img
                          src={formData.logo}
                          alt="Merchant Logo Preview"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-2xl text-slate-400">
                          storefront
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                        Square Logo Badge
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Displayed in listings, filters, order receipts, and customer app.
                      </p>
                    </div>
                  </div>

                  {/* Upload file button */}
                  <div className="sm:ml-auto">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 px-4 py-2 text-xs font-semibold text-[#FF6B35] transition hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950/30">
                      <span className="material-symbols-outlined text-[18px]">upload</span>
                      Upload Logo Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
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
                    placeholder="https://images.unsplash.com/... or data:image/..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                {/* Sample Presets */}
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Quick Sample Logos by Category:
                  </span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DEFAULT_SAMPLE_LOGOS.map((sample) => (
                      <button
                        key={sample.name}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, logo: sample.url }))}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition hover:border-[#FF6B35] hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        <img src={sample.url} alt="" className="h-4 w-4 rounded-full object-cover" />
                        <span>{sample.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Operations & Commission */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                  <span className="material-symbols-outlined text-lg">tune</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Operations & Commission Parameters
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Configure operational statuses, branch count, and platform rates.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Operational Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <option value="Active">Active (Accepting Orders)</option>
                    <option value="Inactive">Inactive (Offline)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Branch / Outlet Count <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.locations}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, locations: parseInt(e.target.value, 10) || 1 }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                  {formErrors.locations && (
                    <p className="mt-1 text-[11px] text-rose-500">{formErrors.locations}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Platform Commission Rate (%)
                  </label>
                  <div className="relative mt-1.5 flex items-center">
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
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                    <span className="pointer-events-none absolute right-3 text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Daily Operating Fulfillment Hours
                  </label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData((prev) => ({ ...prev, operatingHours: e.target.value }))}
                    placeholder="e.g. 08:00 AM - 10:00 PM (Daily)"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Contact & Primary Location */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                  <span className="material-symbols-outlined text-lg">pin_drop</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Location & Store Support Contact
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Physical hub address, customer dispatch line, and inquiries email.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Primary Branch / Store Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. 428 Market Street, Downtown, Suite 102"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Business Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Merchant Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="orders@merchantdomain.com"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-[11px] text-rose-500">{formErrors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 5: Description */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                  <span className="material-symbols-outlined text-lg">description</span>
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Merchant Description & Catalog Summary
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Highlights shown to customers and on the management index.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a detailed overview of the merchant offerings, organic certifications, specialty products, or brand story..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 transition focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
                <p className="mt-1.5 text-right text-[11px] text-slate-400">
                  {formData.description.length} characters
                </p>
              </div>
            </div>

            {/* Submit Actions */}
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

          {/* Right Column: Live Table Row & Profile Card Preview (4 Columns) */}
          <div className="space-y-6 lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Profile Card Preview */}
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="bg-gradient-to-r from-orange-500 to-[#FF6B35] p-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-200">
                    Live Merchant Preview
                  </span>
                  <h3 className="mt-1 font-['Plus_Jakarta_Sans'] text-xl font-bold truncate">
                    {formData.name || 'Merchant Name'}
                  </h3>
                  <span className="inline-block mt-1 text-xs font-medium text-orange-100">
                    {formData.type}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        formData.logo ||
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80'
                      }
                      alt="Logo"
                      className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-zinc-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            formData.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              formData.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {formData.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {formData.locations} {formData.locations === 1 ? 'outlet' : 'outlets'}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400 truncate max-w-[200px]">
                        {formData.address || 'Address pending'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3 text-xs dark:border-zinc-800">
                    <p className="text-slate-600 line-clamp-3 dark:text-zinc-300">
                      {formData.description ||
                        'Merchant description and catalog highlights will display here for customer discovery.'}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-center dark:bg-zinc-800/60">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Commission
                      </span>
                      <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                        {formData.commission_rate}%
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Hours
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                        {formData.operatingHours.split(' ')[0] || 'Open'}
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
                  <div className="min-w-0">
                    <p className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-slate-900 truncate dark:text-zinc-100">
                      {formData.name || 'Merchant Name'}
                    </p>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      {formData.type}
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
