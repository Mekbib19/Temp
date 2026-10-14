import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'

const orders = [
  {
    id: '#ORD-9982',
    date: 'May 24, 2024',
    restaurant: 'The Burger Joint',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    items: '2x Double Whopper, 1x Fries',
    total: '1,450.00',
    status: 'Delivered',
    statusClass: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: '#ORD-9975',
    date: 'May 23, 2024',
    restaurant: 'Mamma Mia Pizza',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB28TV_EKNpHdSnlFYChRYhP9X8ejNBiyWPlmNg_Fpcqo_CXXvdctfHobu3FNughGJ4iipzV-7Qb0-KY-2NQ_4x6zMOZ2cMCvAkMeFM8si4tHWwRRA48dqPRwAyzaT6Bgd224BGY5otIsXdTdOCpJWZlWM4a9Gky9zJQMc0dY5yiQoZgs7HNlru_6qinDLCuGBYy3BBz5xRPvmal_SpOggzAUHZYdj6Au4MahC0VUvkyYOWyUBNOuHaZXuZ5QbQ-xg7XhEV_4a45H0',
    items: '1x Large Margherita, 2x Cola',
    total: '980.00',
    status: 'Preparing',
    statusClass: 'bg-orange-100 text-orange-700',
  },
  {
    id: '#ORD-9912',
    date: 'May 19, 2024',
    restaurant: 'Sakura Sushi',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiwbJTH8PJz-0KfOrYaMXqs-vhXJog8J7LtWvfxEVEQBQ1uspvbxwSDetybesHliThOrsLYv0d1BZolvo72z6A9Zi-4CYtd2KBg69LKSTGI_Igvbm150beVX_ggWpRp8YzY1z3rgJJej0ZCZ5Qrmve2H5KqVmHsHyZkF-loBpZ3wqf3eTDWxf9TqX19hlJVPyhsdRtHNerSaW8PK3znv1_XAvjW0YI-BT_HTdG3K_u_bTO5bw4gppt3izOpCFQq-tZ7IP1LTnbRLo',
    items: '1x Omakase Set (12pcs)',
    total: '3,200.00',
    status: 'Out for Delivery',
    statusClass: 'bg-blue-100 text-blue-700',
  },
]

const tabs = [
  { id: 'orders', label: 'Order History', icon: 'shopping_bag' },
  { id: 'payments', label: 'Payment History', icon: 'payments' },
  { id: 'addresses', label: 'Addresses', icon: 'location_on' },
]

const CustomerProfilePage = () => {
  const { customerId } = useParams()
  const [activeTab, setActiveTab] = useState('orders')

  return (
    <MainLayout
      activeMenuKey="customerManagement"
      breadcrumbParent="Customers"
      breadcrumbCurrent="Customer Profile"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Customer Profile
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Detailed view of guest activity, tier status, and transaction history.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/customers"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Customers
            </Link>
            <Link
              to={`/customers/${encodeURIComponent(customerId)}/edit`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex items-start space-x-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8 lg:col-span-8">
            <div className="relative shrink-0">
              <img
                alt="Alex Curator Profile"
                className="h-28 w-28 rounded-2xl object-cover shadow-sm sm:h-32 sm:w-32 border border-slate-200 dark:border-zinc-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLVT6LJ5SNoe5pqpOfeTC2TX5uOgS67eVnlHBmHq7xfSVfFHfCS7XFQACr7DzdcYfcFBzcLHHTp9HTry1ZMX5DDgkMa0R2rnD6Xh1viCXYtk6ZgvMISUB6ilmHAVYv5ws_mcNGh1ynO4umgY7J3y3KOqrE017wd1ubfPmPiCEMRGoII7JTgl4WvrbcCQ11diaMjiYtWB56HbAQnQY_TBNR8F_wajd8IAzkRUnTRUd47qpMpRfjEQRVaO-eLzEPdrtTNxYxiNCocpM"
              />
              <div className="absolute -bottom-2 -right-2 flex items-center justify-center rounded-xl bg-[#FF6B35] p-2 text-white shadow-lg">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-3xl">
                    Alex Curator
                  </h3>
                  <p className="font-medium text-zinc-500 dark:text-zinc-400">alex.curator@example.com</p>
                  {customerId && (
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">ID: {customerId}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    to={`/customers/${encodeURIComponent(customerId)}/edit`}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  >
                    Edit Profile
                  </Link>
                  <button
                    type="button"
                    className="rounded-xl bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:bg-red-950/40 dark:text-red-400"
                    aria-label="Ban or disable"
                  >
                    <span className="material-symbols-outlined text-lg">block</span>
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Tier Status</p>
                  <p className="text-lg font-bold text-[#FF6B35]">Platinum Elite</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Member Since</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Oct 12, 2022</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Spent</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">24,500 ETB</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-rows-2 gap-4 lg:col-span-4">
            <div className="flex items-center space-x-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="material-symbols-outlined text-lg">call</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Contact Number</p>
                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">+251 911 223344</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                <span className="material-symbols-outlined text-lg">history</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Active Status</p>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">Online Now</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 flex w-full flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1.5 dark:border-zinc-800 dark:bg-zinc-800/60 sm:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-[#FF6B35] shadow-sm dark:bg-zinc-900 dark:text-[#FF6B35]'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'orders' && (
            <div className="no-scrollbar overflow-x-auto px-2 pb-4 sm:px-4">
              <table className="w-full border-separate border-spacing-y-4 text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    <th className="px-6 py-2">Order ID</th>
                    <th className="px-6 py-2">Date</th>
                    <th className="px-6 py-2">Restaurant</th>
                    <th className="px-6 py-2">Items</th>
                    <th className="px-6 py-2 text-right">Total (ETB)</th>
                    <th className="px-6 py-2 text-center">Status</th>
                    <th className="px-6 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((row) => (
                    <tr
                      key={row.id}
                      className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    >
                      <td className="rounded-l-2xl px-6 py-5 font-bold text-zinc-900 dark:text-zinc-100">
                        {row.id}
                      </td>
                      <td className="px-6 py-5 font-medium text-zinc-500 dark:text-zinc-400">{row.date}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-700">
                            <img alt="" className="h-full w-full object-cover" src={row.thumb} />
                          </div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{row.restaurant}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-zinc-500 dark:text-zinc-400">{row.items}</td>
                      <td className="px-6 py-5 text-right font-bold text-zinc-900 dark:text-zinc-100">{row.total}</td>
                      <td className="px-6 py-5 text-center">
                        <span
                          className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider ${row.statusClass}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="rounded-r-2xl px-6 py-5 text-right">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          aria-label="More actions"
                        >
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'payments' && (
            <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Payment history coming soon.</p>
          )}
          {activeTab === 'addresses' && (
            <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">Saved addresses coming soon.</p>
          )}
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-zinc-900">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Average Order Value</p>
            <div className="flex items-end space-x-2">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-black text-zinc-900 dark:text-zinc-100">1,820</span>
              <span className="mb-1 text-xs font-bold text-zinc-400">ETB</span>
              <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-500 dark:bg-emerald-950/50">
                +12%
              </span>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-zinc-900">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Order Frequency</p>
            <div className="flex items-end space-x-2">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-black text-zinc-900 dark:text-zinc-100">4.2</span>
              <span className="mb-1 text-xs font-bold text-zinc-400">per week</span>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-zinc-900">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Favorite Category</p>
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[20px] text-[#ab3500]">local_pizza</span>
              <span className="font-['Plus_Jakarta_Sans'] text-lg font-black text-zinc-900 dark:text-zinc-100">
                Italian Cuisine
              </span>
            </div>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-sm dark:bg-zinc-900">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Reward Points</p>
            <div className="flex items-end space-x-2">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-black text-zinc-900 dark:text-zinc-100">12,450</span>
              <span className="mb-1 text-xs font-bold text-zinc-400">PTS</span>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default CustomerProfilePage
