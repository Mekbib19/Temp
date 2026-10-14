import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

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
      { key: 'orderManagement', icon: 'receipt_long', path: '/order' },
      { key: 'customerManagement', icon: 'group', path: '/customers' },
      { key: 'merchantManagement', icon: 'storefront', path: '/restaurants' },
      { key: 'categoryManagement', icon: 'category', path: '/categories' },
      { key: 'cuisineManagement', icon: 'dinner_dining', path: '/cuisines' },
      { key: 'deliveryManagement', icon: 'local_shipping', path: '/delivery' },
      { key: 'staffManagement', icon: 'badge', path: '/staff' },
    ],
  },
  {
    categoryKey: 'analytics',
    items: [
      { key: 'finance', icon: 'payments', path: '/finance' },
      { key: 'insights', icon: 'monitoring', path: '/insights' },
      { key: 'security', icon: 'security', path: '/security' },
    ],
  },
]

const secondaryMenu = [
  { key: 'settings', icon: 'settings', path: '/settings' },
  { key: 'support', icon: 'help_center', path: '/support' },
]

const Sidebar = ({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
  activeMenuKey = 'dashboard',
}) => {
  const { t } = useTranslation()
  const isCompact = isCollapsed && !isMobileOpen

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-100 bg-slate-50 py-4 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}
    >
      <div className={`${isCompact ? 'mb-4 px-3 text-center' : 'mb-6 px-6'}`}>
        <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-bold tracking-tighter text-[#FF6B35]">
          {isCompact ? 'CC' : t('appName')}
        </h1>
        {!isCompact ? (
          <div className="mt-1.5 flex flex-col gap-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">{t('adminConsole')}</p>
            <div className="inline-flex w-fit items-center gap-1.5 rounded-md border border-orange-200/80 bg-orange-50/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ab3500] dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
              Platform Super Admin
            </div>
          </div>
        ) : (
          <div className="mt-1 flex justify-center" title="Platform Super Admin Level">
            <span className="h-2 w-2 rounded-full bg-[#FF6B35]" />
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
              const isActive =
                item.key === activeMenuKey ||
                (item.key === 'merchantManagement' && activeMenuKey === 'restaurantManagement') ||
                (item.key === 'restaurantManagement' && activeMenuKey === 'merchantManagement')
              const itemClasses = `flex w-full items-center ${isCompact ? 'justify-center' : 'gap-3'} px-4 py-2.5 text-left transition-all duration-200 ${
                isActive
                  ? 'rounded-xl border-r-4 border-[#FF6B35] bg-orange-50/50 font-bold text-[#FF6B35] dark:bg-orange-900/10'
                  : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
              }`

              if (!item.path) {
                return (
                  <button key={item.key} type="button" className={itemClasses} title={t(`menu.${item.key}`)}>
                    <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
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
                  onClick={onCloseMobile}
                  className={itemClasses}
                  title={t(`menu.${item.key}`)}
                >
                  <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                  {!isCompact && (
                    <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">{t(`menu.${item.key}`)}</span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}

        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-zinc-800">
          {secondaryMenu.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`flex w-full items-center ${isCompact ? 'justify-center' : 'gap-3'} px-4 py-2.5 text-left font-medium text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100`}
              title={t(`menu.${item.key}`)}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {!isCompact && (
                <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide">{t(`menu.${item.key}`)}</span>
              )}
            </button>
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
