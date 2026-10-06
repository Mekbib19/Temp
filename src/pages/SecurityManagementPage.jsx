import { useState, useMemo } from 'react'
import MainLayout from '../layouts/MainLayout'

const loginAttempts = [
  {
    id: 1,
    initials: 'JD',
    name: 'Julianne Devis',
    email: 'julianne@culina.com',
    avatarBg: 'bg-orange-100 dark:bg-orange-900/30',
    avatarText: 'text-[#ab3500] dark:text-orange-400',
    location: 'London, UK',
    ip: '192.168.1.42',
    icon: 'laptop_mac',
    device: 'MacBook Pro',
    browser: 'Chrome 119.0',
    status: 'Successful',
    statusVariant: 'success',
    time: '2 mins ago',
  },
  {
    id: 2,
    initials: 'MA',
    name: 'Mark Anderson',
    email: 'mark.a@culina.com',
    avatarBg: 'bg-blue-100 dark:bg-blue-900/30',
    avatarText: 'text-blue-600 dark:text-blue-400',
    location: 'San Francisco, US',
    ip: '45.22.110.12',
    icon: 'phone_iphone',
    device: 'iPhone 15 Pro',
    browser: 'Safari Mobile',
    status: 'Successful',
    statusVariant: 'success',
    time: '45 mins ago',
  },
  {
    id: 3,
    initials: '??',
    name: 'Unknown User',
    email: 'admin@culina.com',
    avatarBg: 'bg-red-100 dark:bg-red-900/30',
    avatarText: 'text-red-600 dark:text-red-400',
    location: 'Kiev, Ukraine',
    ip: '212.58.244.20',
    icon: 'public',
    device: 'Unknown Device',
    browser: 'Tor Browser',
    status: 'Failed Attempt',
    statusVariant: 'failed',
    time: '2 hrs ago',
  },
]

const activeSessions = [
  {
    id: 1,
    icon: 'desktop_windows',
    title: 'Main Dashboard Admin',
    subtitle: 'Current Session (You)',
    statusIconBg: 'bg-green-500',
    statusText: 'Active Now',
    borderClass: 'border-l-[3px] border-[#ab3500] dark:border-orange-500',
  },
  {
    id: 2,
    icon: 'tablet_android',
    title: 'Restaurant Tablet App',
    subtitle: 'Kitchen Display - Branch #04',
    statusIconBg: 'bg-slate-300 dark:bg-slate-600',
    statusText: 'Idle 12m',
    borderClass: 'border border-transparent dark:border-zinc-700',
  },
]

const permissions = [
  {
    id: 1,
    icon: 'admin_panel_settings',
    iconColor: 'text-[#ab3500] dark:text-orange-400',
    title: 'Super Admin',
    subtitle: 'Full System Control',
    count: '4 Users',
  },
  {
    id: 2,
    icon: 'store',
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: 'Branch Manager',
    subtitle: 'Location Specific Access',
    count: '28 Users',
  },
  {
    id: 3,
    icon: 'payments',
    iconColor: 'text-green-600 dark:text-green-400',
    title: 'Financial Officer',
    subtitle: 'Revenue & Payout Logs',
    count: '12 Users',
  },
]

const SecurityManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timeframeFilter, setTimeframeFilter] = useState('24h')

  const filteredLoginAttempts = useMemo(() => {
    return loginAttempts.filter((attempt) => {
      const matchesSearch =
        searchQuery === '' ||
        attempt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        attempt.ip.includes(searchQuery)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'success' && attempt.statusVariant === 'success') ||
        (statusFilter === 'failed' && attempt.statusVariant === 'failed')

      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  return (
    <MainLayout
      activeMenuKey="security"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Security"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Security Control Center
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Monitor system access, manage authentication protocols, and audit permissions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              <span className="material-symbols-outlined text-base">download</span>
              Audit Log
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">verified_user</span>
              Security Scan
            </button>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Category Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Sessions
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                124
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Healthy status
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Flagged Attempts
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">security_update_warning</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                2
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                24h log
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                2FA Adoption
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-200/60 dark:bg-purple-950/40 dark:ring-purple-800/40">
                <span className="material-symbols-outlined text-lg">fingerprint</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                98%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Required
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Protection Level
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">shield</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                High
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Active guard
              </span>
            </div>
          </div>
        </section>

        {/* Filter Bar - Order Management Style with Matching Size Filters Icon and Search Engine */}
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, email, IP, or location..."
              className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-10 pr-9 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-[#FF6B35] focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Attempt Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Logs</option>
              <option value="success">Authorized Only</option>
              <option value="failed">Flagged Only</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="flex min-w-[150px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Timeframe
            </label>
            <select
              value={timeframeFilter}
              onChange={(e) => setTimeframeFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== 'all' || timeframeFilter !== '24h') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setTimeframeFilter('24h')
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Main Security Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Login Attempts & Sessions */}
          <div className="lg:col-span-2 space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">Recent Login Attempts</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Authentication events recorded across operational devices</p>
                </div>
                <button className="text-[#FF6B35] dark:text-orange-400 text-xs font-bold hover:underline">View All Logs</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400">
                      <th className="px-5 py-3.5">User / Identity</th>
                      <th className="px-5 py-3.5">Location &amp; IP</th>
                      <th className="px-5 py-3.5">Device &amp; Browser</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredLoginAttempts.length > 0 ? (
                      filteredLoginAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${attempt.avatarBg} ${attempt.avatarText}`}>
                                {attempt.initials}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-zinc-100">{attempt.name}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{attempt.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="font-medium text-slate-700 dark:text-zinc-300">{attempt.location}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{attempt.ip}</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-slate-400 text-lg">{attempt.icon}</span>
                              <div>
                                <p className="text-xs font-medium text-slate-900 dark:text-zinc-100">{attempt.device}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{attempt.browser}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${attempt.statusVariant === 'success' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-800/40' : 'bg-red-50 text-red-600 ring-1 ring-red-200/60 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-800/40'}`}>
                              {attempt.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className={`text-xs ${attempt.statusVariant === 'failed' ? 'text-red-600 dark:text-red-400 font-bold' : 'text-slate-400'}`}>
                              {attempt.time}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                          No login attempts match the selected filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">Active Sessions</h2>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex justify-between items-start">
                    <div className="flex gap-3.5">
                      <span className="material-symbols-outlined text-slate-400 p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl h-fit border border-slate-100 dark:border-zinc-700">{session.icon}</span>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-zinc-100">{session.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{session.subtitle}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${session.statusIconBg}`}></span>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">{session.statusText}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-[10px] font-extrabold text-[#FF6B35] dark:text-orange-400 uppercase hover:bg-orange-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors">Terminate</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar: Roles & Permissions */}
          <div className="space-y-6">
            <section>
              <h2 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight mb-4 text-slate-900 dark:text-zinc-100">Permissions Overview</h2>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
                
                {permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center justify-between p-3 bg-slate-50/70 dark:bg-zinc-800/40 rounded-xl group hover:bg-orange-50/60 dark:hover:bg-orange-950/20 transition-colors cursor-pointer border border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                        <span className={`material-symbols-outlined text-lg ${perm.iconColor}`}>{perm.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-zinc-100 group-hover:text-[#FF6B35] dark:group-hover:text-orange-400 transition-colors">{perm.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{perm.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{perm.count}</span>
                  </div>
                ))}

                <button className="w-full py-3 rounded-xl bg-[#FF6B35] text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-90 transition-opacity active:scale-95">
                  Manage Roles &amp; Policy
                </button>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight mb-4 text-slate-900 dark:text-zinc-100">Security Map</h2>
              <div className="rounded-2xl border border-slate-200/80 bg-zinc-900 h-60 overflow-hidden relative shadow-sm dark:border-zinc-800">
                <img alt="Security Map" className="w-full h-full object-cover dark:opacity-80 mix-blend-multiply dark:mix-blend-luminosity opacity-70" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkQrx8mHBse0ZIuPXG-2Yn6xwGnyg2spqNWpxb_I8s9AkdrEUfYeHwnytMQN3o8FKGjR7PX-Hb7afrSEgXPAQUHcxfKxBKyvpIceyhgiq9dmG75K61cm2jMBLe3i27tn9X6kokCmdqTw449YcyALjXpwhbikX16AkEFi32mlqiJYU1HONowUXZN9nSr2sJJijnN9K3M83tvXjfZFRXdpYBx5XS4m7rFU8xH5ZuLQXu3O_kUoJk4PZawRgM-RCZs7evqLoEZtAg9jQ"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="text-white">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Latest Geo-Tag</p>
                    <p className="font-bold text-sm">Paris, France</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold border border-white/30">
                    LIVE AUDIT
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}

export default SecurityManagementPage