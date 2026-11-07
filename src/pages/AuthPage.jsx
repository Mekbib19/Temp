import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ShimaLogo from '../components/Logo'
import { useAppTheme } from '../providers/theme-context'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useAppTheme()

  // Always login mode (or forgot password mode) - 'register' / 'create account' is removed
  const [isForgotMode, setIsForgotMode] = useState(() => {
    return location.pathname.includes('forgot')
  })

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successToast, setSuccessToast] = useState('')
  const [showTermsModal, setShowTermsModal] = useState(false)

  // Carousel slide state for hero showcase
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    {
      badge: 'HYPERLOCAL FULFILLMENT',
      headline: 'Fast, Intelligent Logistics Across Ethiopia',
      description:
        'Shima Delivery powers seamless on-demand food and parcel fulfillment, connecting local merchants, certified delivery riders, and customers with sub-5 minute dispatching.',
      bullets: [
        'Real-time fleet tracking & live telemetry',
        'Transparent 20% fleet commission rates',
        'Automated dispatch & zone-based routing',
      ],
      kpis: [
        { label: 'Orders Fulfilled', value: '10,000+' },
        { label: 'Avg Delivery Time', value: '28 min' },
        { label: 'Fleet Reliability', value: '99.4%' },
      ],
    },
    {
      badge: 'MERCHANT COMMERCE',
      headline: 'Empowering Local Kitchens & Retailers',
      description:
        'A comprehensive operations suite built for restaurants, grocery outlets, and cloud kitchens to manage branches, synchronize digital menus, and monitor settlements in Birr (ETB).',
      bullets: [
        'Multi-branch menu & stock management',
        'Automated 15% VAT & transparent service fees',
        'Complete end-to-end order audit logs',
      ],
      kpis: [
        { label: 'Active Merchants', value: '450+' },
        { label: 'Settlement Speed', value: 'Instant' },
        { label: 'Platform Fee', value: '5.0%' },
      ],
    },
    {
      badge: 'FLEET OPERATIONS',
      headline: 'Enterprise Dispatch & Driver Safety',
      description:
        'Supervise couriers with verified licenses, track vehicle compliance, reassign active deliveries in real time, and ensure dependable 24/7 hotline operations.',
      bullets: [
        'Rigorous rider document & KYC verification',
        'Emergency courier reassignment in 1 click',
        '24/7 direct customer & rider support',
      ],
      kpis: [
        { label: 'Verified Riders', value: '1,200+' },
        { label: 'Coverage Radius', value: '50 km' },
        { label: 'Support Hotline', value: '24/7' },
      ],
    },
  ]

  // Auto advance hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [slides.length])

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (isForgotMode) {
      if (!email.trim()) {
        setErrorMessage('Please enter your email address to receive password reset instructions.')
        return
      }
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        setSuccessToast(`Password reset link dispatched to ${email}`)
        setTimeout(() => {
          setIsForgotMode(false)
        }, 1500)
      }, 700)
      return
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email address and password.')
      return
    }

    setIsLoading(true)

    // Simulate authenticating and setting user session
    setTimeout(() => {
      setIsLoading(false)
      const user = {
        name: email.includes('admin') ? 'Julian Casablancas' : 'Demo Staff',
        email,
        role: email.includes('admin') ? 'Platform Super Admin' : 'Staff Member',
        token: `shima_session_${Date.now()}`,
      }
      localStorage.setItem('shima_auth_user', JSON.stringify(user))

      setSuccessToast('Welcome back! Signing you in...')

      setTimeout(() => {
        navigate('/dashboard')
      }, 700)
    }, 600)
  }

  return (
    <div className="w-full min-h-screen h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-['Plus_Jakarta_Sans'] transition-colors duration-200 selection:bg-[#FF6B35] selection:text-white overflow-hidden p-0 m-0">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#FF6B35] px-5 py-3.5 text-sm font-bold text-white shadow-2xl shadow-orange-500/40 animate-in slide-in-from-top duration-300">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Full-Screen Auth Section - Covers entire viewport edge-to-edge */}
      <div className="w-full h-full min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-zinc-900">
        
        {/* ========================================================
            LEFT PANEL: BRAND & OPERATIONS HERO (Full Height / Screen)
           ======================================================== */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[52%] h-full flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#FF6B35] via-[#F25A24] to-[#C93F10] text-white relative overflow-hidden select-none">
          
          {/* Ambient decorative glowing backdrops */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-black/20 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/25 pointer-events-none" />

          {/* Top Bar: Brand Logo & Back to Dashboard */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg p-2 transition-transform duration-300 hover:rotate-6">
                <ShimaLogo className="h-8 w-8" />
              </div>
              <div>
                <span className="font-['Plus_Jakarta_Sans'] text-lg font-black tracking-tight text-white block leading-none">
                  SHIMA DELIVERY
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 block mt-1">
                  Enterprise Operations Platform
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 text-xs font-bold text-white hover:bg-white/25 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <span>Explore Dashboard</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Center Content: Showcase Highlights */}
          <div className="relative z-10 my-auto py-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-xs backdrop-blur-md mb-4">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>{slides[activeSlide].badge}</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
              {slides[activeSlide].headline}
            </h2>

            <p className="mt-4 text-sm xl:text-base text-white/90 leading-relaxed max-w-xl">
              {slides[activeSlide].description}
            </p>

            {/* Feature Bullets */}
            <div className="mt-6 space-y-2.5 max-w-lg">
              {slides[activeSlide].bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-xs xl:text-sm font-semibold text-white/95 rounded-xl p-2.5 bg-white/10 hover:bg-white/15 transition-all duration-200 backdrop-blur-xs"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25">
                    <span className="material-symbols-outlined text-sm font-black">check</span>
                  </span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-6 max-w-lg">
              {slides[activeSlide].kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-white/10 backdrop-blur-sm p-3.5 text-center border border-white/15 hover:bg-white/20 hover:scale-105 transition-all duration-200"
                >
                  <p className="text-lg xl:text-xl font-black tracking-tight text-white leading-tight">
                    {kpi.value}
                  </p>
                  <p className="text-[11px] font-medium text-white/80 truncate mt-1">
                    {kpi.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar: Carousel Indicators & System Uptime */}
          <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`h-2 transition-all duration-300 rounded-full cursor-pointer hover:scale-125 ${
                    activeSlide === idx
                      ? 'w-10 bg-white shadow-sm'
                      : 'w-3 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to highlight slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/90">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Platform Active • 99.9% Telemetry Uptime</span>
            </div>
          </div>

        </div>

        {/* ========================================================
            RIGHT PANEL: FULL-SCREEN AUTH PORTAL (Sign In Only)
           ======================================================== */}
        <div className="w-full lg:w-1/2 xl:w-[48%] h-full flex flex-col justify-between overflow-y-auto px-6 py-8 sm:px-12 sm:py-10 lg:px-12 xl:px-20 bg-white dark:bg-zinc-900 transition-colors">
          
          {/* Top Row: Mobile Logo & Theme Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
            {/* Brand Logo visible on mobile and desktop */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40 p-1.5 border border-orange-200/60 dark:border-orange-800/60">
                <ShimaLogo className="h-6 w-6" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  SHIMA DELIVERY
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                  Console Auth
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="lg:hidden inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline"
              >
                <span>Dashboard</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-[#FF6B35] dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition cursor-pointer shadow-xs"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="material-symbols-outlined text-lg">
                  {isDark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            </div>
          </div>

          {/* Center Form Container */}
          <div className="my-auto py-6 max-w-md w-full mx-auto">
            
            {/* Header */}
            <div className="mb-6">

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {isForgotMode ? 'Reset your password' : 'Sign in to Shima Delivery'}
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                {isForgotMode
                  ? 'Enter your verified administrator email to receive recovery instructions.'
                  : 'Welcome back. Enter your credentials to access operations, dispatch, and merchant telemetry.'}
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="group/field">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 group-hover/field:text-[#FF6B35] transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@shimadelivery.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 pl-10 text-sm text-slate-900 placeholder-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs focus:border-[#FF6B35] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6B35]/15 focus:-translate-y-0.5 focus:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:placeholder-zinc-500 dark:hover:border-zinc-600 dark:focus:bg-zinc-800 transition-all duration-200"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-lg text-slate-400 group-hover/field:text-[#FF6B35] focus-within:text-[#FF6B35] dark:text-zinc-500 transition-colors">
                    mail
                  </span>
                </div>
              </div>

              {/* Password Input (only in sign in mode) */}
              {!isForgotMode && (
                <div className="group/field">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover/field:text-[#FF6B35] transition-colors">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate(`/reset-password${email ? `?email=${encodeURIComponent(email)}` : ''}`)}
                      className="text-xs font-bold text-slate-500 hover:text-[#FF6B35] dark:text-zinc-400 hover:underline transition-all cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your security password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs focus:border-[#FF6B35] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6B35]/15 focus:-translate-y-0.5 focus:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:placeholder-zinc-500 dark:hover:border-zinc-600 dark:focus:bg-zinc-800 transition-all duration-200"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-3 text-lg text-slate-400 group-hover/field:text-[#FF6B35] focus-within:text-[#FF6B35] dark:text-zinc-500 transition-colors">
                      lock
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 hover:scale-110 dark:hover:text-zinc-200 transition-all cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me toggle */}
              {!isForgotMode && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRememberMe((prev) => !prev)}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all cursor-pointer hover:scale-110 ${
                      rememberMe
                        ? 'border-[#FF6B35] bg-[#FF6B35] text-white shadow-xs'
                        : 'border-slate-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
                    }`}
                  >
                    {rememberMe && (
                      <span className="material-symbols-outlined text-xs font-black">check</span>
                    )}
                  </button>
                  <span className="text-xs text-slate-600 dark:text-zinc-400">
                    Keep me signed in on this workstation for 30 days
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F25A24] hover:from-[#E85B24] hover:to-[#D94814] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-[#FF6B35]/25 hover:shadow-xl hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Authenticating console credentials...</span>
                    </>
                  ) : (
                    <span>
                      {isForgotMode ? 'Send Reset Instructions' : 'Sign In to Console'}
                    </span>
                  )}
                </button>
              </div>

              {/* First-time login password change prompt */}
              {!isForgotMode && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/first-time-login', { state: { email } })}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#FF6B35] dark:text-zinc-400 dark:hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-[#FF6B35]">vpn_key_alert</span>
                    <span>First-time login with temporary password? Click here</span>
                  </button>
                </div>
              )}

              {/* Back to sign in if in forgot mode */}
              {isForgotMode && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false)
                      setErrorMessage('')
                    }}
                    className="text-xs font-bold text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    &larr; Back to sign in
                  </button>
                </div>
              )}

              {/* SSO Divider */}
              {!isForgotMode && (
                <>
                  <div className="relative py-3 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
                    </div>
                    
                  </div>
                </>
              )}

            </form>
          </div>

          {/* Bottom Security Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="hover:text-slate-600 dark:hover:text-zinc-300 underline cursor-pointer"
              >
                Security &amp; Terms
              </button>
              <span>•</span>
              <span>Shima v2.4</span>
            </div>
          </div>

        </div>

      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 text-slate-700 dark:text-zinc-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF6B35]">gavel</span>
                <span>Enterprise Terms &amp; Security Protocol</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-md"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed max-h-72 overflow-y-auto pr-2">
              <p>
                <strong>1. Acceptance of Terms:</strong> By accessing the Shima Delivery administrative console, you agree to comply with system security protocols, audit logging, and data privacy policies.
              </p>
              <p>
                <strong>2. Platform Commission &amp; Fees:</strong> Delivery rates, rider commissions, and service fees adhere to the active parameters configured in the system settings registry.
              </p>
              <p>
                <strong>3. Privacy &amp; Data Protection:</strong> Personal customer and courier information is processed solely for dispatching, fulfillment, and accounting operations.
              </p>
              <p>
                <strong>4. Account Security:</strong> Administrators are responsible for safeguarding credentials and multi-factor authentication devices.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white hover:bg-[#E85B24] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
