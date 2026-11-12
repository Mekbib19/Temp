import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppTheme } from '../../providers/theme-context'
import ShimaLogo from '../../components/Logo'
import usFlag from '../../assets/flags/us.svg'
import etFlag from '../../assets/flags/et.svg'
import erFlag from '../../assets/flags/er.svg'
import oromiaFlag from '../../assets/flags/oromia.svg'

const languageOptions = [
  { code: 'en', label: 'English', flag: usFlag },
  { code: 'am', label: 'Amharic', flag: etFlag },
  { code: 'om', label: 'Afaan Oromo', flag: oromiaFlag },
  { code: 'ti', label: 'Tigrinya', flag: erFlag },
]

export default function MerchantPortalLayout({
  children,
  portalType = 'merchant', // 'merchant' | 'branch'
  activeTab = 'overview',
  setActiveTab = () => {},
  sidebarItems = [],
  merchant = null,
  branch = null,
  isBranchOpen = true,
  breadcrumbMiddle = 'Merchant Portal',
  breadcrumbCurrent = 'Overview',
  operatorName = null,
  operatorRole = null,
  operatorEmail = null,
  operatorAvatar = null,
}) {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useAppTheme()
  const langCode = i18n.language?.split('-')[0] || 'en'
  const currentLanguage = ['en', 'am', 'om', 'ti'].includes(langCode) ? langCode : 'en'
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const languageMenuRef = useRef(null)
  const userMenuRef = useRef(null)
  const activeLanguage = languageOptions.find((lang) => lang.code === currentLanguage) || languageOptions[0]

  const isCompact = isSidebarCollapsed && !isMobileSidebarOpen

  // Operator identity
  const defaultOperator =
    portalType === 'branch'
      ? {
          name: operatorName || 'Dawit Haile',
          role: operatorRole || 'Branch Operations Manager',
          email: operatorEmail || 'dawit.h@wholeharvest.com',
          avatar:
            operatorAvatar ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        }
      : {
          name: operatorName || 'Selamawit Haile',
          role: operatorRole || 'Merchant Partner (Owner)',
          email: operatorEmail || 'owner@wholeharvest.com',
          avatar:
            operatorAvatar ||
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        }

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target)) {
        setIsLanguageMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 font-['Plus_Jakarta_Sans'] transition-colors duration-200">
      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden cursor-pointer"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ROOT SIDE MENU (Exact same structure & styles as Super Admin Sidebar) */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-100 bg-slate-50 py-4 transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-900 ${
          isMobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'
        } lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Top Header inside Root Side Menu */}
        <div className={`${isCompact ? 'mb-4 px-2 text-center' : 'mb-6 px-5'}`}>
          {isCompact ? (
            <div className="flex flex-col items-center gap-1.5" title={portalType === 'branch' ? branch?.branch_name : merchant?.name}>
              <div className="flex h-11 w-11 items-center justify-center">
                <ShimaLogo className="h-10 w-10 drop-shadow-xs transition-transform hover:scale-105" />
              </div>
              <div className="flex justify-center" title="Store Online">
                <span className={`h-1.5 w-1.5 rounded-full ${isBranchOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center">
                <ShimaLogo className="h-10 w-10 drop-shadow-xs transition-transform hover:scale-105" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-['Plus_Jakarta_Sans'] text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Shima Delivery
                </h1>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 truncate">
                    {portalType === 'branch' ? 'Branch Console' : 'Merchant Console'}
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      portalType === 'branch'
                        ? 'border border-emerald-200/80 bg-emerald-50/80 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'border border-blue-200/80 bg-blue-50/80 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400'
                    }`}
                  >
                    <span
                      className={`h-1 w-1 rounded-full ${
                        portalType === 'branch' ? (isBranchOpen ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-blue-500'
                      }`}
                    />
                    {portalType === 'branch' ? 'Branch' : 'Merchant'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Items (Clean, No Redundant Category Header Texts) */}
        <nav className={`flex-1 space-y-1 overflow-y-auto ${isCompact ? 'px-2' : 'px-4'}`}>
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id)
                  setIsMobileSidebarOpen(false)
                }}
                className={`group flex w-full items-center ${
                  isCompact ? 'justify-center' : 'gap-3'
                } px-4 py-2.5 text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'rounded-xl border-r-4 border-[#FF6B35] bg-orange-50 font-bold text-[#FF6B35] dark:bg-orange-950/30 dark:text-orange-400'
                    : 'font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                }`}
                title={item.label}
              >
                <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-105">
                  {item.icon}
                </span>
                {!isCompact && (
                  <span className="flex flex-1 items-center justify-between gap-2 min-w-0">
                    <span className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide truncate">
                      {item.label}
                    </span>
                    {item.badge !== null && item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? 'bg-[#FF6B35] text-white'
                            : 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* HEADER BAR (Offset to align with root side menu, exactly like Super Admin Header) */}
      <header
        className={`fixed left-0 right-0 top-0 z-40 flex h-16 w-full items-center justify-between bg-white/90 px-4 shadow-[0_4px_20px_rgba(28,27,27,0.04)] backdrop-blur-xl transition-all duration-300 dark:bg-zinc-950/90 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] sm:px-6 lg:px-8 ${
          isSidebarCollapsed ? 'lg:left-20 lg:w-[calc(100%-5rem)]' : 'lg:left-64 lg:w-[calc(100%-16rem)]'
        }`}
      >
        {/* Left: Hamburger controls & Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-2 font-['Plus_Jakarta_Sans'] text-sm sm:gap-3">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <span className="material-symbols-outlined text-xl">menu</span>
          </button>

          {/* Desktop Sidebar Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="hidden shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:block cursor-pointer"
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="material-symbols-outlined text-xl">
              {isSidebarCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>

          {(() => {
            const activeItem = sidebarItems.find((item) => item.id === activeTab)
            const currentLabel = activeItem?.label || breadcrumbCurrent || 'Overview'
            const middleLabel = breadcrumbMiddle || (portalType === 'branch' ? branch?.branch_name : merchant?.name) || 'Console'

            return (
              <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 truncate text-xs sm:text-sm">
                <span className="font-semibold text-slate-600 dark:text-zinc-300 truncate max-w-[220px]">
                  {middleLabel}
                </span>
                <span className="material-symbols-outlined text-base text-slate-400 dark:text-zinc-500">
                  chevron_right
                </span>
                <span className="truncate font-bold text-slate-900 dark:text-zinc-100">
                  {currentLabel}
                </span>
              </nav>
            )
          })()}
        </div>

        {/* Right: Language, Theme, Notifications, User Profile */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-4">
          {/* Language Switcher */}
          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer shadow-2xs"
              aria-label={t('language')}
              title={t('language')}
            >
              <img src={activeLanguage.flag} alt={activeLanguage.label} className="h-4 w-6 rounded-xs object-cover" />
              <span className="hidden md:inline text-xs font-medium">{activeLanguage.label}</span>
              <span className="material-symbols-outlined text-base text-slate-400 dark:text-zinc-500">expand_more</span>
            </button>

            {isLanguageMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 animate-in fade-in duration-150">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(lang.code)
                      setIsLanguageMenuOpen(false)
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium cursor-pointer transition ${
                      currentLanguage === lang.code
                        ? 'bg-orange-50 text-[#FF6B35] font-bold dark:bg-orange-950/40 dark:text-orange-400'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <img src={lang.flag} alt={lang.label} className="h-4 w-6 rounded-xs object-cover" />
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-[#FF6B35] dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs border border-slate-200 dark:border-zinc-800"
            aria-label={t('darkMode')}
            title={t('darkMode')}
          >
            <span className="material-symbols-outlined text-lg leading-none">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-orange-50 hover:text-[#FF6B35] dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer shadow-2xs"
            aria-label="Notifications"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-lg leading-none">notifications</span>
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF6B35] ring-2 ring-white dark:ring-zinc-950" />
          </button>

          <div className="hidden h-7 w-px bg-slate-200 dark:bg-zinc-800 sm:block" />

          {/* User Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-xl p-1 text-left transition hover:bg-slate-100 dark:hover:bg-zinc-850 cursor-pointer"
              aria-label="User menu"
              aria-expanded={isUserMenuOpen}
            >
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold leading-none text-slate-900 dark:text-zinc-100">
                  {defaultOperator.name}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#FF6B35] dark:text-orange-400">
                  {defaultOperator.role}
                </p>
              </div>
              <div className="relative">
                <img
                  alt={defaultOperator.name}
                  className="h-9 w-9 rounded-xl border-2 border-white object-cover shadow-xs dark:border-zinc-800"
                  src={defaultOperator.avatar}
                />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950" />
              </div>
              <span className="material-symbols-outlined text-base text-slate-400 dark:text-zinc-500">
                expand_more
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-1">
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {defaultOperator.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                    {defaultOperator.email}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-[#FF6B35] dark:bg-orange-950/40 dark:text-orange-400">
                    {defaultOperator.role}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    navigate('/portal/select-merchant')
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-slate-400">storefront</span>
                  <span>Switch Merchant</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false)
                    navigate('/')
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:text-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-slate-400">apps</span>
                  <span>Switch Gateway Portal</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('shima_auth_user')
                    setIsUserMenuOpen(false)
                    navigate('/login')
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA (Offset to match Super Admin margin-left for root sidebar) */}
      <main
        className={`px-4 pb-16 pt-20 transition-all duration-300 sm:px-6 lg:px-8 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="w-full space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
