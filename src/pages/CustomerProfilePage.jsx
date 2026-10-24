import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Pagination from '../components/Pagination'

const orders = [
  {
    id: '#ORD-9982',
    date: 'May 24, 2024, 02:45 PM',
    restaurant: 'The Burger Joint',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    items: '2x Double Whopper, 1x Fries, 1x Coke',
    total: '1,450.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-9975',
    date: 'May 23, 2024, 07:15 PM',
    restaurant: 'Mamma Mia Pizza',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB28TV_EKNpHdSnlFYChRYhP9X8ejNBiyWPlmNg_Fpcqo_CXXvdctfHobu3FNughGJ4iipzV-7Qb0-KY-2NQ_4x6zMOZ2cMCvAkMeFM8si4tHWwRRA48dqPRwAyzaT6Bgd224BGY5otIsXdTdOCpJWZlWM4a9Gky9zJQMc0dY5yiQoZgs7HNlru_6qinDLCuGBYy3BBz5xRPvmal_SpOggzAUHZYdj6Au4MahC0VUvkyYOWyUBNOuHaZXuZ5QbQ-xg7XhEV_4a45H0',
    items: '1x Large Margherita, 2x Cola, 1x Garlic Bread',
    total: '980.00',
    status: 'Preparing',
  },
  {
    id: '#ORD-9912',
    date: 'May 19, 2024, 01:20 PM',
    restaurant: 'Sakura Sushi',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiwbJTH8PJz-0KfOrYaMXqs-vhXJog8J7LtWvfxEVEQBQ1uspvbxwSDetybesHliThOrsLYv0d1BZolvo72z6A9Zi-4CYtd2KBg69LKSTGI_Igvbm150beVX_ggWpRp8YzY1z3rgJJej0ZCZ5Qrmve2H5KqVmHsHyZkF-loBpZ3wqf3eTDWxf9TqX19hlJVPyhsdRtHNerSaW8PK3znv1_XAvjW0YI-BT_HTdG3K_u_bTO5bw4gppt3izOpCFQq-tZ7IP1LTnbRLo',
    items: '1x Omakase Set (12pcs), 1x Miso Soup',
    total: '3,200.00',
    status: 'Out for Delivery',
  },
  {
    id: '#ORD-9884',
    date: 'May 15, 2024, 12:30 PM',
    restaurant: 'Taco Haven',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB28TV_EKNpHdSnlFYChRYhP9X8ejNBiyWPlmNg_Fpcqo_CXXvdctfHobu3FNughGJ4iipzV-7Qb0-KY-2NQ_4x6zMOZ2cMCvAkMeFM8si4tHWwRRA48dqPRwAyzaT6Bgd224BGY5otIsXdTdOCpJWZlWM4a9Gky9zJQMc0dY5yiQoZgs7HNlru_6qinDLCuGBYy3BBz5xRPvmal_SpOggzAUHZYdj6Au4MahC0VUvkyYOWyUBNOuHaZXuZ5QbQ-xg7XhEV_4a45H0',
    items: '3x Carne Asada Tacos, 1x Horchata',
    total: '760.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-9820',
    date: 'May 10, 2024, 08:05 PM',
    restaurant: 'Pasta Prime',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    items: '1x Truffle Tagliatelle, 1x Tiramisu',
    total: '1,890.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-9762',
    date: 'May 04, 2024, 11:45 AM',
    restaurant: 'Greens & Grains',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDiwbJTH8PJz-0KfOrYaMXqs-vhXJog8J7LtWvfxEVEQBQ1uspvbxwSDetybesHliThOrsLYv0d1BZolvo72z6A9Zi-4CYtd2KBg69LKSTGI_Igvbm150beVX_ggWpRp8YzY1z3rgJJej0ZCZ5Qrmve2H5KqVmHsHyZkF-loBpZ3wqf3eTDWxf9TqX19hlJVPyhsdRtHNerSaW8PK3znv1_XAvjW0YI-BT_HTdG3K_u_bTO5bw4gppt3izOpCFQq-tZ7IP1LTnbRLo',
    items: '2x Quinoa Harvest Bowl, 1x Green Smoothie',
    total: '840.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-9710',
    date: 'Apr 28, 2024, 06:50 PM',
    restaurant: 'The Burger Joint',
    thumb:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCImhy9E1jkVilGSAXI9UCFm7QUy6CPp92ixBmQnoSkl4nwdgEF8m7AXyq_sRBPi42haGN4jnatUTEQkfTydHe6h02w5WYe_ZZ1kqHehEy0JNWIow-84eoet3-H9BXfzbyMhSWGif3pws3xZIktJQaw196i4UD3H9vwWKHO_Y41u32EPcOWgGO8KrjtgAtG0CArNOw1YTcyXPv7tKiSPyodkFoqf6f3pmCLl_-0VsfFMrbKss_v2-JQqZyLyVESCSO0zaYsiwpwdAc',
    items: '1x Bacon Cheeseburger, 1x Onion Rings',
    total: '920.00',
    status: 'Cancelled',
  },
]

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Delivered':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30'
    case 'Preparing':
      return 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30'
    case 'Out for Delivery':
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/30'
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400 dark:ring-rose-500/30'
    default:
      return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'
  }
}

const tabs = [
  { id: 'orders', label: 'Order History', icon: 'shopping_bag' },
  { id: 'payments', label: 'Payment History', icon: 'payments' },
  { id: 'addresses', label: 'Addresses', icon: 'location_on' },
]

const CustomerProfilePage = () => {
  const { customerId } = useParams()
  const [activeTab, setActiveTab] = useState('orders')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const totalItems = orders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const endItem = Math.min(currentPage * rowsPerPage, totalItems)
  const paginatedOrders = orders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  return (
    <MainLayout
      activeMenuKey="customerManagement"
      breadcrumbParent="Customers"
      breadcrumbCurrent="Customer Profile"
    >
      <div className="space-y-6 pb-12">

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
               <div className="flex shrink-0 items-center gap-2">
  <Link
    to={`/customers/${encodeURIComponent(customerId)}/edit`}
    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:focus-visible:ring-offset-zinc-900"
  >
    Profile
  </Link>
  <button
    type="button"
    aria-label="Ban or disable"
    className="group relative flex items-center justify-center rounded-xl bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 dark:focus-visible:ring-offset-zinc-900"
  >
    <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-12">
      block
    </span>
  </button>
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
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">Active user</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Orders Data Grid & Tabs Section with Pagination */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-slate-100 p-4 sm:p-5 dark:border-zinc-800">
            <div className="flex w-full flex-wrap gap-2 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1.5 dark:border-zinc-800 dark:bg-zinc-800/60 sm:w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    setCurrentPage(1)
                  }}
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
          </div>

          {activeTab === 'orders' && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                      <th className="px-5 py-3.5">Order ID</th>
                      <th className="px-5 py-3.5">Date & Time</th>
                      <th className="px-5 py-3.5">Restaurant</th>
                      <th className="px-5 py-3.5">Items</th>
                      <th className="px-5 py-3.5 text-right">Total (ETB)</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {paginatedOrders.map((row) => (
                      <tr
                        key={row.id}
                        className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                          {row.id}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-500 dark:text-zinc-400">
                          {row.date}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/70 dark:bg-zinc-800 dark:ring-zinc-700">
                              <img alt="" className="h-full w-full object-cover" src={row.thumb} />
                            </div>
                            <span className="font-['Plus_Jakarta_Sans'] font-bold text-slate-900 transition-colors group-hover:text-[#FF6B35] dark:text-zinc-100">
                              {row.restaurant}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600 dark:text-zinc-400">
                          {row.items}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-mono font-bold text-slate-900 dark:text-zinc-100">
                          {row.total} ETB
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusBadgeClass(row.status)}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {row.status}
                          </span>
                        </td>
        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-slate-100 p-4 dark:border-zinc-800">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  startItem={startItem}
                  endItem={endItem}
                  rowsPerPage={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onRowsPerPageChange={(size) => {
                    setRowsPerPage(size)
                    setCurrentPage(1)
                  }}
                />
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-2xl">payments</span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-zinc-100">Payment History</h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-zinc-400">
                No recent payment transactions or invoices recorded for this customer account.
              </p>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-2xl">location_on</span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-zinc-100">Saved Addresses</h4>
              <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-zinc-400">
                Bole Sub-City, Kebele 03, House #412, Addis Ababa, Ethiopia (Primary)
              </p>
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  )
}

export default CustomerProfilePage
