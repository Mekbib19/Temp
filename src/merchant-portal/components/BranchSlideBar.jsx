export default function BranchSlideBar({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  branch,
  merchant,
  ordersCount = 0,
  menuItemsCount = 0,
  reviewsCount = 0,
  staffCount = 0,
  isBranchOpen = true,
  onToggleStatus,
  managerName = 'Dawit Haile',
}) {
  const navItems = [
    { id: 'overview', label: 'Overview & Statistics', icon: 'analytics', badge: null },
    { id: 'orders', label: 'Recent Orders', icon: 'receipt_long', badge: ordersCount },
    { id: 'menu_items', label: 'Menu Items', icon: 'restaurant_menu', badge: menuItemsCount },
    { id: 'ratings', label: 'Ratings & Reviews', icon: 'hotel_class', badge: reviewsCount },
    { id: 'staff', label: 'Manager & Staff', icon: 'badge', badge: staffCount },
    { id: 'settings', label: 'Settings', icon: 'settings', badge: null },
  ]

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide Bar Aside */}
      <aside
        className={`transition-all duration-300 ease-in-out shrink-0 ${
          isOpen
            ? 'fixed inset-y-0 left-0 z-50 w-72 lg:static lg:z-10 lg:w-64 lg:sticky lg:top-22'
            : 'fixed -translate-x-full lg:static lg:w-0 lg:overflow-hidden lg:opacity-0 lg:pointer-events-none'
        }`}
      >
        <div className="relative h-full lg:h-[calc(100vh-7.5rem)] rounded-3xl border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col overflow-hidden">
          {/* Desktop Collapse Arrow */}
          <button
            type="button"
            onClick={onClose}
            className="hidden lg:flex absolute -right-3 top-5 z-20 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-xs text-slate-500 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 cursor-pointer"
            title="Collapse Slide Menu"
          >
            <span className="material-symbols-outlined text-xs">chevron_left</span>
          </button>

          {/* Slide Bar Header */}
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/60 border border-orange-200/60 dark:border-orange-900/40 shadow-2xs">
                <span className="material-symbols-outlined text-xl">store</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-slate-900 dark:text-white leading-tight">
                  {branch?.branch_name || 'Branch Operations'}
                </p>
                <p className="truncate text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mt-0.5">
                  {merchant?.name || 'Branch Operations'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 lg:hidden cursor-pointer"
              title="Close Slide Menu"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* Operating Status Strip */}
          <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-zinc-850/50 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Store Status
            </span>
            <button
              type="button"
              onClick={onToggleStatus}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                isBranchOpen
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
              title="Click to toggle branch operational status"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isBranchOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isBranchOpen ? 'Accepting Orders' : 'Store Paused'}</span>
            </button>
          </div>

          {/* Slide Menu Navigation (The 6 Key Options) */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1.5" aria-label="Branch Operations Navigation">
            <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Operations Menu
            </div>
            {navItems.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id)
                    if (window.innerWidth < 1024) {
                      onClose()
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-orange-50 text-[#FF6B35] border-l-4 border-[#FF6B35] font-extrabold shadow-2xs dark:bg-orange-950/40 dark:text-orange-400'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-lg ${
                        isActive ? 'text-[#FF6B35] dark:text-orange-400 font-bold' : 'text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <span className="truncate">{tab.label}</span>
                  </div>
                  {tab.badge !== null && tab.badge > 0 && (
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? 'bg-[#FF6B35] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Slide Bar Footer: Manager & Shift */}
          <div className="p-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/40">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-2.5 text-[11px] dark:border-zinc-800 dark:bg-zinc-900 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Lead Manager
                </span>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="font-bold text-slate-900 dark:text-zinc-100 truncate">
                {managerName}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
                {branch?.opening_hours || '07:30 AM'} - {branch?.closing_hours || '09:30 PM'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
