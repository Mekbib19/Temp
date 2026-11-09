import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from '../../providers/theme-context'
import ShimaLogo from '../../components/Logo'
import usFlag from '../../assets/flags/us.svg'
import etFlag from '../../assets/flags/et.svg'
import erFlag from '../../assets/flags/er.svg'
import oromiaFlag from '../../assets/flags/oromia.svg'
import { loadStoredMerchants, getCategoryMeta } from '../../data/demoMerchants'

const languageOptions = [
  { code: 'en', label: 'English', flag: usFlag },
  { code: 'am', label: 'Amharic', flag: etFlag },
  { code: 'om', label: 'Afaan Oromo', flag: oromiaFlag },
  { code: 'ti', label: 'Tigrinya', flag: erFlag },
]

export default function MerchantSelectorPage() {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useAppTheme()
  const navigate = useNavigate()

  const langCode = i18n.language?.split('-')[0] || 'en'
  const currentLanguage = ['en', 'am', 'om', 'ti'].includes(langCode) ? langCode : 'en'
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const activeLanguage = languageOptions.find((lang) => lang.code === currentLanguage) || languageOptions[0]

  const merchants = useMemo(() => loadStoredMerchants(), [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Filter merchants
  const filteredMerchants = useMemo(() => {
    return merchants.filter((m) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const cat = (m.category_name || m.type || '').toLowerCase()
        const sel = selectedCategory.toLowerCase()
        if (!cat.includes(sel)) return false
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const nameMatch = (m.name || '').toLowerCase().includes(q)
        const catMatch = (m.category_name || m.type || '').toLowerCase().includes(q)
        const descMatch = (m.description || '').toLowerCase().includes(q)
        const addrMatch = (m.address || '').toLowerCase().includes(q)
        const licMatch = (m.license_number || '').toLowerCase().includes(q)
        if (!nameMatch && !catMatch && !descMatch && !addrMatch && !licMatch) return false
      }
      return true
    })
  }, [merchants, searchQuery, selectedCategory])

  // Category counts
  const categoryPills = [
    { id: 'all', label: 'All Merchants' },
    { id: 'grocery', label: 'Grocery & Market' },
    { id: 'pharmacy', label: 'Pharmacy & Health' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'cafe', label: 'Cafe & Roastery' },
    { id: 'retail', label: 'Retail & Goods' },
  ]

  const totalBranches = useMemo(() => {
    return merchants.reduce((acc, m) => acc + (Array.isArray(m.branches) ? m.branches.length : m.locations || 1), 0)
  }, [merchants])

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 font-['Plus_Jakarta_Sans'] transition-colors duration-200">
      {/* Super Admin-Style Top Header Bar */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 w-full items-center justify-between bg-white/90 px-4 shadow-[0_4px_20px_rgba(28,27,27,0.04)] backdrop-blur-xl transition-all duration-300 dark:bg-zinc-950/90 dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-[#FF6B35] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
            title="Return to Portal Gateway"
          >
            <span className="material-symbols-outlined text-base">apps</span>
            <span className="hidden sm:inline">Gateway Hub</span>
          </button>

          <div className="flex shrink-0 items-center gap-1.5">
            <ShimaLogo className="h-8 w-8 drop-shadow-xs" />
          </div>

          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 truncate text-xs sm:text-sm">
            <span className="font-semibold text-slate-500 dark:text-zinc-400">Portal</span>
            <span className="material-symbols-outlined text-base text-slate-400 dark:text-zinc-500">
              chevron_right
            </span>
            <span className="truncate font-bold text-slate-900 dark:text-zinc-100">
              Merchant Selector
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLanguageMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 outline-none transition hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 cursor-pointer shadow-2xs"
            >
              <img src={activeLanguage.flag} alt={activeLanguage.label} className="h-4 w-6 rounded-xs object-cover" />
              <span className="hidden md:inline text-xs font-medium">{activeLanguage.label}</span>
              <span className="material-symbols-outlined text-base text-slate-400">expand_more</span>
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-950/40 px-3 py-1 text-xs font-bold text-[#FF6B35] border border-orange-200/60 dark:border-orange-900/40 mb-3 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-[#FF6B35] animate-pulse" />
            <span>Merchant Partner Selection</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Select Your Merchant Workspace
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Choose a registered restaurant, supermarket, or healthcare merchant partner to open their dedicated management console. Each merchant runs in an isolated workspace with no access to other vendors.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 dark:border-zinc-850 dark:bg-zinc-900 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Partners</span>
                <p className="text-lg font-black text-slate-900 dark:text-white">{merchants.length} Brands</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 dark:border-zinc-850 dark:bg-zinc-900 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outlets</span>
                <p className="text-lg font-black text-[#FF6B35]">{totalBranches} Locations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-zinc-850 dark:bg-zinc-900">
            {/* Search Input */}
            <div className="flex items-center gap-2.5 flex-1 min-w-[260px] rounded-xl bg-slate-50 px-3 py-2 dark:bg-zinc-850/60">
              <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search merchant by brand name, location, license number, or cuisine..."
                className="w-full bg-transparent text-xs font-medium focus:outline-none dark:text-white placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {categoryPills.map((pill) => {
                const isSelected = selectedCategory === pill.id
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setSelectedCategory(pill.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {pill.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Merchants Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMerchants.map((brand) => {
            const catMeta = getCategoryMeta(brand.category_name || brand.type)
            const branchesList = Array.isArray(brand.branches) ? brand.branches : []
            const branchCount = branchesList.length || brand.locations || 1
            const firstBranch = branchesList[0]

            return (
              <div
                key={brand.id}
                className="group relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-lg transition-all duration-300 dark:border-zinc-850 dark:bg-zinc-900 flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Top Header: Logo, Name, Category Pill */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-slate-100 dark:border-zinc-800 bg-white shadow-xs">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white truncate group-hover:text-[#FF6B35] transition-colors">
                          {brand.name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {brand.address || 'Addis Ababa, Ethiopia'}
                        </p>
                      </div>
                    </div>

                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${catMeta.badgeClass}`}>
                      {catMeta.label}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {brand.description}
                  </p>

                  {/* 3 Metric Pills */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-850/50 text-center mb-4">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Branches</span>
                      <p className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">
                        {branchCount} Outlets
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Rating</span>
                      <p className="font-extrabold text-xs text-amber-500 mt-0.5">
                        {brand.average_rating || 4.8} ★
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">SLA Speed</span>
                      <p className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {brand.delivery_sla || '25-35m'}
                      </p>
                    </div>
                  </div>

                  {/* License badge */}
                  <div className="mb-4 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-sm text-[#FF6B35]">verified</span>
                      {brand.license_number || 'EFDA-VERIFIED'}
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Active Partner
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/portal/merchants/${brand.id}`)}
                    className="flex-1 rounded-xl bg-[#FF6B35] py-2.5 px-3 text-xs font-bold text-white shadow-2xs hover:bg-[#e0531f] transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Merchant</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>

                  {firstBranch && (
                    <button
                      type="button"
                      onClick={() => navigate(`/portal/merchants/${brand.id}/branches/${firstBranch.id}`)}
                      className="rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-850 dark:text-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1"
                      title={`Launch ${firstBranch.branch_name} Branch Ops`}
                    >
                      <span className="material-symbols-outlined text-sm">store</span>
                      <span className="hidden sm:inline">Branch Ops</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredMerchants.length === 0 && (
          <div className="py-16 text-center max-w-md mx-auto">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-zinc-600">store_mall_directory</span>
            <p className="mt-2 text-base font-bold text-slate-800 dark:text-white">No merchants match your search</p>
            <p className="mt-1 text-xs text-slate-400">Try adjusting your keyword filter or select &quot;All Merchants&quot;.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="mt-4 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
