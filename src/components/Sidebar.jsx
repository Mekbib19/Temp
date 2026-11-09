import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import ShimaLogo from './Logo'

const menuSections = [
  {
    categoryKey: 'overview',
    items: [
      { key: 'dashboard', icon: 'dashboard', path: '/dashboard' },
    ],
  },
  {
    categoryKey: 'management',
    items: [
      { key: 'orderManagement', icon: 'receipt_long', path: '/orders' },
      { key: 'customerManagement', icon: 'group', path: '/customers' },
      { key: 'riderManagement', icon: 'two_wheeler', path: '/riders' },
      { key: 'riderVerification', icon: 'verified_user', path: '/riders/verification' },
      { key: 'merchantManagement', icon: 'storefront', path: '/restaurants' },
      { key: 'categoryManagement', icon: 'category', path: '/categories' },
      { key: 'cuisineManagement', icon: 'dinner_dining', path: '/cuisines' },
      { key: 'menuCategory', icon: 'restaurant_menu', path: '/menu-categories' },
      { key: 'deliveryManagement', icon: 'local_shipping', path: '/delivery' },
      { key: 'staffManagement', icon: 'badge', path: '/staff' },
    ],
  },
]

const secondaryMenu = [
  { key: 'settings', icon: 'settings', path: '/settings' },
]

const Sidebar = ({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  activeMenuKey = 'dashboard',
}) => {
  const { t } = useTranslation()
  const location = useLocation()
  const isCompact = isCollapsed && !isMobileOpen
  const isOrderPath = location.pathname.startsWith('/order') || location.pathname.startsWith('/orders')

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-100 bg-slate-50 py-4 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}
    >
      <div className={`${isCompact ? 'mb-4 px-2 text-center' : 'mb-6 px-5'}`}>
        {isCompact ? (
          <div className="flex flex-col items-center gap-1.5" title="Shima Delivery - Super Admin">
            <div className="flex h-11 w-11 items-center justify-center">
              <ShimaLogo className="h-10 w-10 drop-shadow-xs transition-transform hover:scale-105" />
            </div>
            <div className="flex justify-center" title="Platform Super Admin Level">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CC0033]" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center">
              <ShimaLogo className="h-10 w-10 drop-shadow-xs transition-transform hover:scale-105" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-['Plus_Jakarta_Sans'] text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                {t('appName')}
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">{t('adminConsole')}</p>
                <div className="inline-flex items-center gap-1 rounded-md border border-red-200/80 bg-red-50/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#CC0033] dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                  <span className="h-1 w-1 rounded-full bg-[#CC0033]" />
                  Admin
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <nav className={`flex-1 space-y-3 overflow-y-auto ${isCompact ? 'px-2' : 'px-4'}`}>
        {menuSections.map((section, sIndex) => (
          <div key={section.categoryKey} className="space-y-1">
            {!isCompact && (
              <div className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                {t(`menu.${section.categoryKey}`)}
              </div>
            )}
            {isCompact && sIndex > 0 && (
              <div className="my-2 border-t border-slate-200/80 dark:border-zinc-800" />
            )}

            {section.items.map((item) => {
              const checkActive = (navActive) => {
                if (isOrderPath) {
                  if (item.key === 'orderManagement') return true
                  if (item.key === 'dashboard') return false
                }
                if (item.key === activeMenuKey) return true
                if (navActive && (item.path !== '/dashboard' || location.pathname === '/dashboard')) return true
                if (
                  (item.key === 'merchantManagement' && activeMenuKey === 'restaurantManagement') ||
                  (item.key === 'restaurantManagement' && activeMenuKey === 'merchantManagement')
                ) {
                  return true
                }
                return false
              }

              if (!item.path) {
                const isActive = item.key === activeMenuKey
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`group flex w-full items-center ${isCompact ? 'justify-center' : 'gap-3'} px-4 py-2.5 text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'rounded-xl border-r-4 border-[#FF6B35] bg-orange-50 font-bold text-[#FF6B35] dark:bg-orange-950/30'
                        : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                    }`}
                    title={t(`menu.${item.key}`)}
                  >
                    <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-105">{item.icon}</span>
                    {!isCompact && (
                      <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">{t(`menu.${item.key}`)}</span>
                    )}
                  </button>
                )
              }

              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  end={item.path === '/riders' || item.path === '/dashboard'}
                  onClick={onCloseMobile}
                  className={({ isActive: isNavActive }) => {
                    const active = checkActive(isNavActive)
                    return `group flex w-full items-center ${isCompact ? 'justify-center' : 'gap-3'} px-4 py-2.5 text-left transition-all duration-200 cursor-pointer ${
                      active
                        ? 'rounded-xl border-r-4 border-[#FF6B35] bg-orange-50 font-bold text-[#FF6B35] dark:bg-orange-950/30'
                        : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                    }`
                  }}
                  title={t(`menu.${item.key}`)}
                >
                  <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-105">{item.icon}</span>
                  {!isCompact && (
                    <div className="flex flex-1 items-center justify-between">
                      <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">
                        {item.key === 'deliveryManagement' ? 'Delivery Live' : t(`menu.${item.key}`)}
                      </span>
                      {item.key === 'deliveryManagement' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 shadow-2xs dark:bg-emerald-950/60 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}

        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-zinc-800">
          {secondaryMenu.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) => {
                const active = isActive || activeMenuKey === item.key
                return `group flex w-full items-center ${isCompact ? 'justify-center' : 'gap-3'} px-4 py-2.5 text-left transition-all duration-200 cursor-pointer ${
                  active
                    ? 'rounded-xl border-r-4 border-[#FF6B35] bg-orange-50 font-bold text-[#FF6B35] dark:bg-orange-950/30'
                    : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                }`
              }}
              title={t(`menu.${item.key}`)}
            >
              <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-105">{item.icon}</span>
              {!isCompact && (
                <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">{t(`menu.${item.key}`)}</span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <button
        type="button"
        onClick={onCloseMobile}
        className="absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden"
        aria-label="Close sidebar"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>
    </aside>
  )
}

export default Sidebar
