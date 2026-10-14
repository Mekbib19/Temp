import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import { getDemoCustomerBySlug } from '../data/demoCustomers'

const CustomerFormPage = () => {
  const navigate = useNavigate()
  const { customerId } = useParams()
  const isEdit = Boolean(customerId)

  const customer = isEdit ? getDemoCustomerBySlug(customerId) : null
  const notFound = Boolean(isEdit && !customer)

  const [accountActive, setAccountActive] = useState(() => (customer ? customer.status === 'Active' : true))
  const [fullName, setFullName] = useState(() => customer?.name || '')
  const [email, setEmail] = useState(() => customer?.email || '')
  const [phone, setPhone] = useState(() => customer?.phone || '')
  const [tier, setTier] = useState(() => customer?.tier || 'Regular')
  const [address, setAddress] = useState(() => customer?.address || '')

  const avatarUrl = customer?.avatar ?? null

  const handleSave = () => {
    if (isEdit && customerId && !notFound) {
      navigate(`/customers/${encodeURIComponent(customerId)}`)
      return
    }
    navigate('/customers')
  }

  return (
    <MainLayout
      activeMenuKey="customerManagement"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Customers"
      breadcrumbCurrent={
        isEdit && customer && !notFound ? `Edit: ${customer.name}` : isEdit ? 'Edit customer' : 'Add New Customer'
      }
    >
      <div className="space-y-6 pb-12">
        {isEdit && notFound && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            <p className="font-semibold">No demo profile for this ID.</p>
            <p className="mt-1 text-amber-800/90 dark:text-amber-300/90">
              Try{' '}
              <Link className="font-bold underline" to="/customers/CUST-9821/edit">
                CUST-9821
              </Link>{' '}
              or return to{' '}
              <Link className="font-bold underline" to="/customers">
                customer list
              </Link>
              .
            </p>
          </div>
        )}

        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              {isEdit ? 'Edit Customer Profile' : 'Create Customer Profile'}
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              {isEdit
                ? 'Update guest details in the Culinary Curator ecosystem.'
                : 'Onboard a new guest to the Culinary Curator ecosystem.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate(isEdit && customerId ? `/customers/${encodeURIComponent(customerId)}` : '/customers')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isEdit && notFound}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f] disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">save</span>
              {isEdit ? 'Save Changes' : 'Save Customer'}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:col-span-4">
            <div className="group relative">
              <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-slate-100 bg-zinc-100 shadow-md transition-transform group-hover:scale-[1.02] dark:border-zinc-800 dark:bg-zinc-800">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : customer?.initials ? (
                  <span className="text-3xl font-bold text-zinc-400 dark:text-zinc-500">{customer.initials}</span>
                ) : (
                  <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-600">person</span>
                )}
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="material-symbols-outlined text-white">photo_camera</span>
                </div>
              </div>
              <button
                type="button"
                className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-md transition-transform hover:scale-110"
                aria-label={isEdit ? 'Change photo' : 'Add photo'}
              >
                <span className="material-symbols-outlined text-sm">{isEdit ? 'edit' : 'add'}</span>
              </button>
            </div>
            <h3 className="mt-5 text-lg font-bold text-zinc-900 dark:text-zinc-100">Identity image</h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              High-quality JPG or PNG recommended.
              <br />
              Max 5MB.
            </p>
            <div className="mt-6 w-full border-t border-slate-100 pt-6 dark:border-zinc-800">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Account status</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={accountActive}
                  onClick={() => setAccountActive((v) => !v)}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                    accountActive ? 'bg-[#FF6B35]' : 'bg-zinc-200 dark:bg-zinc-600'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full border border-gray-300 bg-white shadow transition-transform dark:border-zinc-500 ${
                      accountActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center space-x-3 rounded-xl bg-orange-50/80 p-3.5 dark:bg-orange-950/30 border border-orange-100/60 dark:border-orange-900/30">
                <span className="material-symbols-outlined text-[#FF6B35]">verified</span>
                <span className="text-left text-xs font-medium text-zinc-600 dark:text-zinc-300">
                  {isEdit
                    ? 'Active customers can place orders and earn points; inactive profiles are read-only in the app.'
                    : 'Active customers can make reservations and earn points.'}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-12 space-y-6 md:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                <div className="col-span-2">
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Core information
                  </h4>
                </div>
                <div className="space-y-2">
                  <label htmlFor="customer-full-name" className="ml-1 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Full name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      badge
                    </span>
                    <input
                      id="customer-full-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Jonathan Doe"
                      className="w-full rounded-xl border-none bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-900 placeholder:text-zinc-300 transition-all focus:ring-2 focus:ring-orange-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="customer-email" className="ml-1 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      mail
                    </span>
                    <input
                      id="customer-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jonathan@example.com"
                      className="w-full rounded-xl border-none bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-900 placeholder:text-zinc-300 transition-all focus:ring-2 focus:ring-orange-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="customer-phone" className="ml-1 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Phone number
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      call
                    </span>
                    <input
                      id="customer-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full rounded-xl border-none bg-zinc-50 py-3 pl-12 pr-4 font-medium text-zinc-900 placeholder:text-zinc-300 transition-all focus:ring-2 focus:ring-orange-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="customer-tier" className="ml-1 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Membership tier
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      military_tech
                    </span>
                    <select
                      id="customer-tier"
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                      className="w-full appearance-none rounded-xl border-none bg-zinc-50 py-3 pl-12 pr-10 font-medium text-zinc-900 transition-all focus:ring-2 focus:ring-orange-200 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      expand_more
                    </span>
                  </div>
                </div>
                <div className="col-span-2 space-y-2 pt-4">
                  <label htmlFor="customer-address" className="ml-1 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    Default delivery address
                  </label>
                  <textarea
                    id="customer-address"
                    rows={4}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full street address, city, and zip code..."
                    className="w-full resize-none rounded-xl border-none bg-zinc-50 p-4 font-medium text-zinc-900 placeholder:text-zinc-300 transition-all focus:ring-2 focus:ring-orange-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                  <span className="material-symbols-outlined text-lg">loyalty</span>
                </div>
                <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Loyalty integration</h5>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {isEdit
                    ? 'Existing points and rewards stay linked to this profile when you save changes.'
                    : 'New customers automatically start with 500 Culinary Credits as a welcome gift.'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-lg">nest_cam_indoor</span>
                </div>
                <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Preferences</h5>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {isEdit
                    ? 'Update dining preferences and allergies anytime from this profile.'
                    : 'Dining preferences and allergies can be added after initial profile creation.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 pb-4 text-center text-xs font-medium text-zinc-400">
          © 2024 CulinaryCurator Management Suite. All rights reserved.
        </footer>
      </div>
    </MainLayout>
  )
}

export default CustomerFormPage
