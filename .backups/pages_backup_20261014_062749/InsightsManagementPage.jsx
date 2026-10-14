import { useState } from 'react'
import MainLayout from '../layouts/MainLayout'

const topRestaurants = [
  {
    id: 1,
    name: 'Heritage Burgers',
    category: 'Modern American • 12 Branches',
    orders: '24,812 orders',
    trendPercent: '8.2%',
    trendIcon: 'arrow_upward',
    trendColor: 'text-green-600 dark:text-green-400',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAr5B0uIZlUGONuf6UM9n8sVlpIV6ZLPXinVx39oIGPuwWBNqL_NqwcrB_isWdaG-cHIChF77brKO2iHJoIoU-LQJVAqGQ4djFQ55KGhH6ldosh9tuF8s3qIkY7B0ae36oH5eBpaDzA7-KR6JGjcV9HgD8aj3tX7sAKq67n2s4CCu1z_oec6hFfIWvXUao70hYppYNBudlgP8duxvO2tprz9ax6vQt09g-voH4IAYwVCPXwB0BG0VwtOZTgqu1h9snZ6pKzbwhXz6k'
  },
  {
    id: 2,
    name: 'Sakura Sushi Central',
    category: 'Premium Japanese • 8 Branches',
    orders: '19,430 orders',
    trendPercent: '12.5%',
    trendIcon: 'arrow_upward',
    trendColor: 'text-green-600 dark:text-green-400',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXfToe9yVyOyo-q7DydWwTEpvszI0ODWNkNLBLaxWWGy30j3XosPB6sv5j9yB7XGacBhfJ7VbVPtX6-2toyfQPK8OAYYE4qsIbE2j9opG1aO74P-8nsE0PRFzkAxqi_eaW4gc8B-pbKd4nTxdZBpVBDr7WoONiXFMczxJvDb3RQFZFr4cK0JNuc19mbCmWdZXI0xyeJiKd5MbIDED3IQvIHJCn2oJzGmfrvoks5NwZdgmM3PaVrT7o-YpZ9Uv4cfQ7CPyRy7If6T4'
  },
  {
    id: 3,
    name: 'Bella Napoli Pizza',
    category: 'Traditional Italian • 15 Branches',
    orders: '17,211 orders',
    trendPercent: '0.4%',
    trendIcon: 'remove',
    trendColor: 'text-slate-400 dark:text-slate-500',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOqiXseQmPlEhgkr1sRsyKqpolug5D_aj2MB_ipSu4Yx_CZPjAwlyAPp4lW3DcMUlwlC4LAFPqZ0-eZQC1A76vds9vAvvG3njop3uCQ4NuTI0kIHyrd_ys6YR6pDTkBOAryYSqS5U2_KCXEp2Lt2-Y0lJ0K69Gnqbxb4A73buyac3Z6ssf7d0CfUV0Hp_DgRXVT0V6eBrCzZUL_eqrmnMNkv4c9Xwm2x0Aw9b2sW6trr4iQsSj8VSLvSdgTVMIgzIsOuSOIB622K4'
  }
]

const InsightsManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [timeframeFilter, setTimeframeFilter] = useState('30d')
  const [metricFilter, setMetricFilter] = useState('all')

  const filteredRestaurants = topRestaurants.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  })

  return (
    <MainLayout
      activeMenuKey="insights"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Insights"
    >
      <div className="space-y-6 pb-12">
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] mb-2 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
              Platform Insights
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">
              Real-time performance analytics across all restaurant networks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700">
              <span className="material-symbols-outlined text-base">calendar_today</span>
              <span>Last 30 Days</span>
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]">
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Report</span>
            </button>
          </div>
        </section>

        {/* 4 Standardized Metric Cards matching Category Management */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Total Orders
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] ring-1 ring-orange-200/60 dark:bg-orange-950/40 dark:ring-orange-800/40">
                <span className="material-symbols-outlined text-lg">receipt_long</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                124.5k
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +12.4% vs last mo
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Avg. Order Value
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60 dark:bg-emerald-950/40 dark:ring-emerald-800/40">
                <span className="material-symbols-outlined text-lg">payments</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                $42.80
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                +5.2% vs avg
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Active Fleet Peak
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200/60 dark:bg-blue-950/40 dark:ring-blue-800/40">
                <span className="material-symbols-outlined text-lg">local_shipping</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                1,842
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500">
                Peak lunch rush
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Growth Velocity
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-200/60 dark:bg-purple-950/40 dark:ring-purple-800/40">
                <span className="material-symbols-outlined text-lg">trending_up</span>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-['Plus_Jakarta_Sans'] text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                +14.2%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Top tier
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
              placeholder="Search insight topic, merchant partner, or category..."
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

          {/* District Filter */}
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              District / Zone
            </label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Districts</option>
              <option value="soho">Soho District (+40% surge)</option>
              <option value="downtown">Downtown Central</option>
              <option value="westside">Westside Hub</option>
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
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last Quarter</option>
            </select>
          </div>

          {/* Metric Focus Filter */}
          <div className="flex min-w-[160px] flex-col gap-1">
            <label className="px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Metric Focus
            </label>
            <select
              value={metricFilter}
              onChange={(e) => setMetricFilter(e.target.value)}
              className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-slate-900 focus:ring-0 dark:text-zinc-100"
            >
              <option value="all">All Metrics</option>
              <option value="density">Order Density</option>
              <option value="peak">Peak Hours</option>
              <option value="delivery">Fleet Velocity</option>
            </select>
          </div>

          {(searchQuery || districtFilter !== 'all' || timeframeFilter !== '30d' || metricFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setDistrictFilter('all')
                setTimeframeFilter('30d')
                setMetricFilter('all')
              }}
              className="rounded-lg px-4 py-2 text-sm font-bold text-[#FF6B35] transition-colors hover:bg-orange-500/10 md:ml-auto dark:text-orange-400"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Main Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Heatmap Visualization */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">Order Density Heatmap</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Real-time geographic distribution of active requests</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-zinc-800 rounded-xl p-1 border border-slate-200 dark:border-zinc-700">
                <button className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-white dark:bg-zinc-700 text-slate-900 dark:text-zinc-100 shadow-sm">Map View</button>
                <button className="px-3.5 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors rounded-lg">Grid View</button>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
              <img className="w-full h-full object-cover dark:opacity-80 dark:mix-blend-luminosity mix-blend-multiply" alt="Security Map Insight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXTH9Gq2e5MioMTLI93lFbGVzuoYdrJmQRD0465A_80HWfYpFlMiwxHTbbpPcp9pc-VdvmlVl0bB5-eVfGMv1EUV2Yy3c7dd9itn13SXbr1bDY3-_-4qhFpOmE2hjbpeYnR384TDPmtRtAVLUdmt6hMwTi3tesAJD_myJfdR3i_tDJQq6U0sa0bMk9kpEoFeU5rmUP1SGjp0i7SE1FDHhriXgl9VXQfeP4xHSDTU_tWBY5EpgvNCXWT0nznYt3WsSo_NJhQQScd7I" />
              
              <div className="absolute inset-0 bg-[#ab3500]/10 mix-blend-multiply dark:bg-[#ff6b35]/20"></div>
              
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200/80 dark:border-zinc-700">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Live Insight</p>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">Soho District: +40% surge</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="space-y-1 md:border-r border-slate-200 dark:border-zinc-700 pr-4">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Peak Area</p>
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">Downtown Central</p>
              </div>
              <div className="space-y-1 md:border-r border-slate-200 dark:border-zinc-700 pr-4">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Density Score</p>
                <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">High (8.4/10)</p>
              </div>
              <div className="space-y-1 md:border-r border-slate-200 dark:border-zinc-700 pr-4">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Delay Prob.</p>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">Moderate Risk</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">Best Value</p>
                <p className="text-sm font-bold text-[#006a62] dark:text-[#4fdbcc]">Westside Hub</p>
              </div>
            </div>
          </div>

          {/* Peak Hours Visualization */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col">
            <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100 mb-1">Peak Hour Trends</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mb-4">Traffic analysis by delivery hour</p>
            
            <div className="flex-1 flex items-end justify-between gap-2 h-48 mb-6 mt-4">
              <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-t-lg group relative h-[30%] hover:bg-[#ab3500] dark:hover:bg-orange-500 transition-colors">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 dark:bg-zinc-200 text-white dark:text-zinc-900 text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">11am</div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-t-lg group relative h-[45%] hover:bg-[#ab3500] dark:hover:bg-orange-500 transition-colors"></div>
              <div className="w-full bg-[#ff6b35] dark:bg-[#c24b21] rounded-t-lg group relative h-[90%]">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className="bg-[#5f1900] text-white text-[10px] px-2 py-1 rounded-full font-bold leading-none">LUNCH</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-t-lg group relative h-[50%] hover:bg-[#ab3500] dark:hover:bg-orange-500 transition-colors"></div>
              <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-t-lg group relative h-[35%] hover:bg-[#ab3500] dark:hover:bg-orange-500 transition-colors"></div>
              <div className="w-full bg-[#ab3500] dark:bg-orange-500 rounded-t-lg group relative h-[100%]">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <span className="bg-[#ab3500] dark:bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full font-bold leading-none">DINNER</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-t-lg group relative h-[70%] hover:bg-[#ab3500] dark:hover:bg-orange-500 transition-colors"></div>
              <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-t-lg group relative h-[40%] hover:bg-[#ab3500] dark:hover:bg-orange-500 transition-colors"></div>
            </div>
            
            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-between border border-slate-100 dark:border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <span className="material-symbols-outlined text-base">timer</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Wait Time Prediction</p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">18-24m</span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl flex items-center justify-between border border-slate-100 dark:border-zinc-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#70f8e8]/20 dark:bg-[#007168]/20 flex items-center justify-center text-[#007168] dark:text-[#70f8e8]">
                    <span className="material-symbols-outlined text-base">trending_up</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Growth Velocity</p>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">+14.2%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Top Restaurants Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Top Performing Brands */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold font-['Plus_Jakarta_Sans'] tracking-tight text-slate-900 dark:text-zinc-100">Top Merchants</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Highest order volume across network</p>
              </div>
              <a className="text-[#FF6B35] dark:text-orange-400 text-xs font-bold hover:underline" href="#">View All</a>
            </div>
            
            <div className="space-y-4">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm">
                      <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={restaurant.name} src={restaurant.image}/>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">{restaurant.name}</h4>
                      <p className="text-slate-400 text-[11px]">{restaurant.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-zinc-100">{restaurant.orders}</p>
                    <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${restaurant.trendColor}`}>
                      <span className="material-symbols-outlined text-xs">{restaurant.trendIcon}</span>
                      <span>{restaurant.trendPercent}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ad/CTA card */}
          <div className="lg:col-span-2 relative rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm dark:border-zinc-800 bg-zinc-900 group cursor-pointer min-h-[300px]">
            <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60" alt="Kitchen Tech Features" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCitHXtOnqhMLLcPdsrREfJxCJvK7ZSqr2NBubC4db2iDVjTmxowH6kGjAiO1p7Dyp973f4Y0rp4U7AIf5XOwRyojm8rKTzu0_mA5UQY2tNFZEqhc-W7VKepNbn5puD6rxLv8i9Y9YWK3osEhjmF64ossUpbas0bk52DCKGmNU7QuR6vcrG8gp9GhDBAPRWq-3DSB__R0wZ3AIcYsJRQFhYkOK6KwSSMTwXIByxhQt4z0ST1Z0m73Ho12D-ltM6zwu4KumbH8LNS7Q"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-6">
              <span className="inline-block px-2.5 py-0.5 bg-[#FF6B35] text-white text-[10px] font-bold rounded-lg mb-3">NEW FEATURE</span>
              <h3 className="text-xl font-bold font-['Plus_Jakarta_Sans'] text-white mb-2 leading-tight">Predictive Supply Intelligence</h3>
              <p className="text-white/80 text-xs mb-5 max-w-[280px]">Anticipate inventory needs based on local event trends and weather patterns.</p>
              <button className="bg-white text-slate-900 px-5 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-slate-100 transition-all">Learn More</button>
            </div>
          </div>
          
        </div>
      </div>
    </MainLayout>
  )
}

export default InsightsManagementPage