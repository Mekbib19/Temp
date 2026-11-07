import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAppTheme } from '../providers/theme-context'
import ShimaLogo from './Logo'
import usFlag from '../assets/flags/us.svg'
import etFlag from '../assets/flags/et.svg'
import erFlag from '../assets/flags/er.svg'
import oromiaFlag from '../assets/flags/oromia.svg'

const languageOptions = [
  {
    code: 'en',
    label: 'English',
    flag: usFlag,
  },
  {
    code: 'am',
    label: 'Amharic',
    flag: etFlag,
  },
  {
    code: 'om',
    label: 'Afaan Oromo',
    flag: oromiaFlag,
  },
  {
    code: 'ti',
    label: 'Tigrinya',
    flag: erFlag,
  },
]

const Header = ({
  isSidebarCollapsed = false,
  onToggleSidebar,
  onOpenMobileSidebar,
  breadcrumbParent,
  breadcrumbMiddle,
  breadcrumbCurrent,
}) => {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useAppTheme()
  const langCode = i18n.language?.split('-')[0] || 'en'
  const currentLanguage = ['en', 'am', 'om', 'ti'].includes(langCode) ? langCode : 'en'
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  const languageMenuRef = useRef(null)
  const userMenuRef = useRef(null)
  const activeLanguage = languageOptions.find((lang) => lang.code === currentLanguage) || languageOptions[0]

  const [authUser] = useState(() => {
    try {
      const raw = localStorage.getItem('shima_auth_user')
      if (raw) return JSON.parse(raw)
    } catch {
      // fallback
    }
    return { name: 'Julian Casablancas', role: 'Platform Super Admin', email: 'admin@shimadelivery.com' }
  })

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
    <header
      className={`fixed left-0 right-0 top-0 z-40 flex h-16 w-full items-center justify-between bg-white/90 px-4 shadow-[0_4px_20px_rgba(28,27,27,0.04)] backdrop-blur-xl transition-all duration-300 dark:bg-zinc-950/90 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] sm:px-6 lg:px-6 ${
        isSidebarCollapsed ? 'lg:left-20 lg:w-[calc(100%-5rem)]' : 'lg:left-64 lg:w-[calc(100%-16rem)]'
      }`}
    >
      {/* Left: Navigation toggles & Clear Breadcrumb trail */}
      <div className="ml-1 flex min-w-0 items-center gap-2 font-['Plus_Jakarta_Sans'] text-sm sm:gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:hidden"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
        <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
          <ShimaLogo className="h-8 w-8 drop-shadow-xs" />
        </div>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden shrink-0 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 lg:block"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="material-symbols-outlined text-xl">
            {isSidebarCollapsed ? 'menu_open' : 'menu'}
          </span>
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 truncate text-xs sm:text-sm">
          <span className="font-semibold text-slate-600 dark:text-zinc-300">
            {breadcrumbParent || t('menu.dashboard')}
          </span>
          <span className="material-symbols-outlined text-base text-slate-400 dark:text-zinc-500">
            chevron_right
          </span>
          {breadcrumbMiddle && (
            <>
              <span className="font-semibold text-slate-600 dark:text-zinc-300">
                {breadcrumbMiddle}
              </span>
              <span className="material-symbols-outlined text-base text-slate-400 dark:text-zinc-500">
                chevron_right
              </span>
            </>
          )}
          <span className="truncate font-bold text-slate-900 dark:text-zinc-100">
            {breadcrumbCurrent || t('systemOverview')}
          </span>
        </nav>
      </div>

      {/* Right: Language, Theme, Notifications & User profile */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 lg:gap-5">
        {/* Language Switcher */}
        <div className="relative" ref={languageMenuRef}>
          <button
            type="button"
            onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            aria-label={t('language')}
            title={t('language')}
          >
            <img src={activeLanguage.flag} alt={activeLanguage.label} className="h-4 w-6 rounded-sm object-cover" />
            <span className="hidden md:inline text-xs font-medium">{activeLanguage.label}</span>
            <span className="material-symbols-outlined text-base text-slate-400 dark:text-zinc-500">expand_more</span>
          </button>

          {isLanguageMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    i18n.changeLanguage(lang.code)
                    setIsLanguageMenuOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${
                    currentLanguage === lang.code
                      ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  <img src={lang.flag} alt={lang.label} className="h-4 w-6 rounded-sm object-cover" />
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
          className="rounded-md p-1.5 text-slate-600 transition-all hover:bg-slate-100 hover:text-[#FF6B35] dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label={t('darkMode')}
          title={t('darkMode')}
        >
          <span className="material-symbols-outlined text-xl">{isDark ? 'light_mode' : 'dark_mode'}</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-orange-50 hover:text-[#FF6B35] dark:text-zinc-400 dark:hover:bg-orange-900/10"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-[#FF6B35] dark:border-zinc-950" />
        </button>

        <div className="hidden h-7 w-px bg-slate-200 dark:bg-zinc-800 sm:block" />

        {/* User Identity & Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-xl p-1 text-left transition hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
          >
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold leading-none text-slate-900 dark:text-zinc-100">
                {authUser?.name || 'Julian Casablancas'}
              </p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {authUser?.role || 'Platform Super Admin'}
              </p>
            </div>
            <div className="relative">
              <img
                alt="Admin Profile"
                className="h-9 w-9 rounded-xl border-2 border-white object-cover shadow-sm dark:border-zinc-800"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAE2WSlXNx0I8-sDdt3xU_aVn4xCf7ibQ_4DTdbgkF2ggS_2pDws3PrLTPMcrCdGaqcAjPcvjNNeNGJvKgTzHaN_AobrPBkdjGLTcCBrK2U_DT559NyWM8pTRMdHIYxiqspXbI8fxHYgzCc1hlEG8IK7IpdrqNnXYxZKKP_coV60WEWbb1oEwf8_cbOsobIzm47uxG_jCmwaQOz3AJNNGeOgeWZ63T6YDCFy7qD7U9-WLQGo3_3AbcDre09GMI0bDBo_Hvef-KwkFo"
              />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950" />
            </div>
            <span className="material-symbols-outlined text-base text-slate-400 dark:text-zinc-500">
              expand_more
            </span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800 mb-1">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {authUser?.name || 'Julian Casablancas'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  {authUser?.email || 'admin@shimadelivery.com'}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-[#FF6B35] dark:bg-orange-950/40">
                  {authUser?.role || 'Platform Super Admin'}
                </span>
              </div>

              <div className="my-1 border-t border-slate-100 dark:border-zinc-800" />

              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('shima_auth_user')
                  setIsUserMenuOpen(false)
                  navigate('/login')
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
