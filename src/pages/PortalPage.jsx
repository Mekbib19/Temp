import { useNavigate } from 'react-router-dom'
import ShimaLogo from '../components/Logo'
import { useAppTheme } from '../providers/theme-context'

export default function PortalPage() {
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useAppTheme()

  const portals = [
    {
      id: 'super-admin',
      title: 'Super Admin',
      subtitle: 'Platform Command Console',
      badge: 'Master Control',
      badgeColor: 'bg-orange-50 text-[#FF6B35] dark:bg-orange-950/60 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50',
      icon: 'admin_panel_settings',
      iconBg: 'bg-gradient-to-br from-[#FF6B35] to-[#E85B24] text-white',
      description:
        'Complete platform control over delivery fleet telemetry, courier verification, financial settlements, orders stream, and system security.',
      actionText: 'Direct Super Admin',
      actionRoute: '/login',
      primary: true,
    },
    {
      id: 'merchant-page',
      title: 'Merchant Page',
      subtitle: 'Dedicated Partner Portal',
      badge: 'Merchant Owner',
      badgeColor: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50',
      icon: 'storefront',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
      description:
        'Private operations console for this merchant partner only. View brand performance, manage operating branches, review consolidated orders, and track compliance.',
      actionText: 'Direct Merchant Page',
      actionRoute: '/portal/merchants',
      primary: false,
    },
    {
      id: 'branch-page',
      title: 'Merchant Branch Page',
      subtitle: 'Branch Manager Workspace',
      badge: 'Branch Manager',
      badgeColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50',
      icon: 'store',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
      description:
        'Dedicated console for this branch manager only with a 6-option slide menu for live kitchen orders, menu items catalog, ratings, staff shifts, and settings.',
      actionText: 'Direct Merchant Branch Page',
      actionRoute: '/portal/branches',
      primary: false,
    },
  ]

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-['Plus_Jakarta_Sans'] flex flex-col justify-between transition-colors duration-200 selection:bg-[#FF6B35] selection:text-white">
      {/* Top Bar */}
      <header className="w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200/60 dark:border-orange-800/60 p-2 shadow-xs">
            <ShimaLogo className="h-6 w-6" />
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 dark:text-white block leading-none">
              SHIMA DELIVERY
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mt-1">
              Operations Gateway Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#FF6B35] dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer shadow-xs"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            <span className="material-symbols-outlined text-lg">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-10 max-w-6xl mx-auto w-full">
        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-950/40 px-3.5 py-1.5 text-xs font-bold text-[#FF6B35] border border-orange-200/60 dark:border-orange-900/40 mb-4 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-pulse" />
            <span>Select System Access</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Choose Your Destination
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-zinc-400 leading-relaxed">
            Direct access to Shima Delivery administrative consoles. Select your role to launch the appropriate operations workspace.
          </p>
        </div>

        {/* 3 Direct Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border bg-white dark:bg-zinc-900 shadow-md hover:shadow-2xl hover:-translate-y-1 group ${
                portal.primary
                  ? 'border-orange-200 dark:border-orange-900/60 ring-2 ring-[#FF6B35]/20'
                  : 'border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${portal.iconBg}`}>
                    <span className="material-symbols-outlined text-3xl font-bold">{portal.icon}</span>
                  </div>

                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
                  {portal.title}
                </h2>

                <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
                  {portal.subtitle}
                </p>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-5 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => navigate(portal.actionRoute)}
                  className={`w-full rounded-2xl py-3.5 px-4 text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-98 ${
                    portal.primary
                      ? 'bg-gradient-to-r from-[#FF6B35] to-[#E85B24] hover:from-[#F25A24] hover:to-[#D94814] text-white shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5'
                      : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700 hover:-translate-y-0.5'
                  }`}
                >
                  <span>{portal.actionText}</span>
                  <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-zinc-800/80 py-4 px-6 text-center text-xs text-slate-400 dark:text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Gateway Active &bull; Addis Ababa Hyperlocal Logistics</span>
        </div>

        <p className="text-[11px]">
          Shima Delivery Platform &bull; v2.4
        </p>
      </footer>
    </div>
  )
}
