import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ShimaLogo from '../components/Logo'
import { useAppTheme } from '../providers/theme-context'
import { completeFirstTimeSetup } from '../services/authService'

export default function FirstTimeLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark, toggleTheme } = useAppTheme()

  // Initial account data if navigated from auth or fallback to default
  const email = location.state?.email || 'firsttime@shimadelivery.com'
  const userRole = location.state?.role || 'Fleet Dispatch Coordinator'

  // Form states - pre-fill currentTempPassword if passed from login
  const [currentTempPassword, setCurrentTempPassword] = useState(() => {
    return location.state?.tempPassword || ''
  })
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showTempPassword, setShowTempPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeSecurityPolicy, setAgreeSecurityPolicy] = useState(true)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successToast, setSuccessToast] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [countdown, setCountdown] = useState(4)

  // Carousel slide for left showcase panel
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    {
      badge: 'FIRST-TIME ONBOARDING',
      headline: 'Welcome to the Shima Operations Console',
      description:
        'To protect customer privacy, merchant financial records, and real-time courier telemetry, your initial provisioning password must be replaced with a permanent master credential.',
      bullets: [
        'Mandatory policy for all new operators & dispatchers',
        'Direct cryptographic vault hashing via PBKDF2',
        'Grants immediate console access upon completion',
      ],
      kpis: [
        { label: 'Security Standard', value: 'Zero-Trust' },
        { label: 'Session Expiry', value: '30 Days' },
        { label: 'Access Tier', value: 'Operations' },
      ],
    },
    {
      badge: 'ACCESS CONTROL',
      headline: 'Granular Operational Permissions',
      description:
        'Once your permanent password is confirmed, your account will be activated for live dispatch maps, order exception resolution, and merchant menu synchronization.',
      bullets: [
        'Dedicated audit trail per operator ID',
        'Instant courier reassignment capabilities',
        '24/7 internal supervisor channel support',
      ],
      kpis: [
        { label: 'Fleet Couriers', value: '1,200+' },
        { label: 'Addis Branches', value: '450+' },
        { label: 'Dispatch SLA', value: '< 5 min' },
      ],
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [slides.length])

  // Countdown effect on completion
  useEffect(() => {
    if (!isCompleted) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isCompleted, navigate])

  // Password rules validation
  const hasMinLength = newPassword.length >= 8
  const hasNumber = /\d/.test(newPassword)
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword
  const isDifferentFromTemp = currentTempPassword.length > 0 && newPassword !== currentTempPassword

  const calculateStrength = () => {
    let score = 0
    if (hasMinLength) score += 25
    if (hasNumber) score += 25
    if (hasUppercase) score += 25
    if (hasSpecial) score += 25
    return score
  }

  const strength = calculateStrength()
  const isFormValid =
    currentTempPassword.trim().length > 0 &&
    hasMinLength &&
    hasNumber &&
    hasUppercase &&
    passwordsMatch &&
    isDifferentFromTemp &&
    agreeSecurityPolicy

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!currentTempPassword.trim()) {
      setErrorMessage('Please enter your temporary password.')
      return
    }

    if (!hasMinLength) {
      setErrorMessage('New password must be at least 8 characters long.')
      return
    }

    if (!hasNumber) {
      setErrorMessage('New password must contain at least one number.')
      return
    }

    if (!hasUppercase) {
      setErrorMessage('New password must contain at least one uppercase letter.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    if (newPassword === currentTempPassword) {
      setErrorMessage('Your new password cannot be the same as your temporary password.')
      return
    }

    if (!agreeSecurityPolicy) {
      setErrorMessage('You must acknowledge the enterprise security compliance protocol.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)

      // Complete first-time password setup in auth.json registry (localStorage)
      completeFirstTimeSetup(email, newPassword)

      setIsCompleted(true)
      setSuccessToast('Permanent password verified! Account active.')
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

      {/* Main Full-Screen Layout */}
      <div className="w-full h-full min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-zinc-900">
        
        {/* ========================================================
            LEFT PANEL: ONBOARDING SECURITY SHOWCASE
           ======================================================== */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[52%] h-full flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#FF6B35] via-[#F25A24] to-[#C93F10] text-white relative overflow-hidden select-none">
          {/* Ambient glowing shapes */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-black/20 blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/25 pointer-events-none" />

          {/* Top Bar */}
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
                  First-Time Account Activation
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur-md px-4 py-2 text-xs font-bold text-white hover:bg-white/25 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Login</span>
            </button>
          </div>

          {/* Center Showcase */}
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

            <div className="mt-6 space-y-2.5 max-w-lg">
              {slides[activeSlide].bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-xs xl:text-sm font-semibold text-white/95 rounded-xl p-2.5 bg-white/10 hover:bg-white/15 transition-all duration-200 backdrop-blur-xs"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25">
                    <span className="material-symbols-outlined text-sm font-black">shield_lock</span>
                  </span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

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

          {/* Bottom Bar */}
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
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/90">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Zero-Trust Credential Activation</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT PANEL: FIRST TIME PASSWORD SETUP FORM
           ======================================================== */}
        <div className="w-full lg:w-1/2 xl:w-[48%] h-full flex flex-col justify-between overflow-y-auto px-6 py-8 sm:px-12 sm:py-10 lg:px-12 xl:px-20 bg-white dark:bg-zinc-900 transition-colors">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/40 p-1.5 border border-orange-200/60 dark:border-orange-800/60">
                <ShimaLogo className="h-6 w-6" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                  SHIMA DELIVERY
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                  First-Time Login
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B35] hover:underline"
              >
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Sign In</span>
              </button>

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

          {/* Form Container */}
          <div className="my-auto py-6 max-w-md w-full mx-auto">
            {isCompleted ? (
              <div className="text-center animate-in zoom-in-95 duration-300 py-4 sm:py-6">
                {/* Status Hero Icon with subtle ambient glow */}
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-500/20 shadow-xl shadow-emerald-500/15">
                  <div className="absolute inset-0 rounded-3xl bg-emerald-500/15 blur-xl animate-pulse pointer-events-none" />
                  <span className="material-symbols-outlined text-4xl relative z-10">verified_user</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Permanent Password Active</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Security Setup Complete!
                </h2>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Your account is fully activated. Next time you sign in, use your permanent password for direct console access.
                </p>

                {/* Account Details Card */}
                <div className="mt-5 rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/50 p-4 text-left space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">Account Email</span>
                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/60 dark:border-zinc-700/60">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">Assigned Role</span>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{userRole}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">Access Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Authorized &amp; Verified</span>
                    </span>
                  </div>
                </div>

                {/* Progress bar toward automatic redirect */}
                <div className="mt-5 space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span>Redirecting to Console</span>
                    <span className="font-bold text-[#FF6B35]">{countdown}s</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B35] to-[#F25A24] transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${((4 - countdown) / 4) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Selected Element: Action Buttons Container */}
                <div className="mt-5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#FF6B35] via-[#F25A24] to-[#E85B24] p-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Enter Console Dashboard Now</span>
                    <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem('shima_auth_user')
                      navigate('/login')
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 p-2.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">logout</span>
                    <span>Sign Out to Test Next Login Flow</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#FF6B35] text-xs font-bold mb-3 border border-orange-200/50 dark:border-orange-900/40">
                    <span className="material-symbols-outlined text-sm">vpn_key_alert</span>
                    <span>Security Onboarding Required</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Set permanent password
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    You are logging in with a temporary initial password. For security compliance, please set your permanent password to activate your console permissions.
                  </p>
                </div>

            {/* User Account Info Chip */}
            <div className="mb-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/80 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/60 text-[#FF6B35] font-black text-sm">
                  {email[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[260px]">
                    {email}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Role: {userRole}
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                <span className="material-symbols-outlined text-xs">pending</span>
                <span>Setup Required</span>
              </span>
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
              
              {/* Temporary Password */}
              <div className="group/field">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 group-hover/field:text-[#FF6B35] transition-colors">
                  Current Temporary Password
                </label>
                <div className="relative">
                  <input
                    type={showTempPassword ? 'text' : 'password'}
                    placeholder="Enter the initial temporary password provided"
                    value={currentTempPassword}
                    onChange={(e) => setCurrentTempPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs focus:border-[#FF6B35] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6B35]/15 focus:-translate-y-0.5 focus:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:placeholder-zinc-500 dark:hover:border-zinc-600 dark:focus:bg-zinc-800 transition-all duration-200"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-lg text-slate-400 group-hover/field:text-[#FF6B35] focus-within:text-[#FF6B35] dark:text-zinc-500 transition-colors">
                    key
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTempPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 hover:scale-110 dark:hover:text-zinc-200 transition-all cursor-pointer"
                    title={showTempPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showTempPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* New Permanent Password */}
              <div className="group/field">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 group-hover/field:text-[#FF6B35] transition-colors">
                  New Permanent Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Choose your confidential password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs focus:border-[#FF6B35] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6B35]/15 focus:-translate-y-0.5 focus:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:placeholder-zinc-500 dark:hover:border-zinc-600 dark:focus:bg-zinc-800 transition-all duration-200"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-lg text-slate-400 group-hover/field:text-[#FF6B35] focus-within:text-[#FF6B35] dark:text-zinc-500 transition-colors">
                    lock
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 hover:scale-110 dark:hover:text-zinc-200 transition-all cursor-pointer"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* Password Strength Gauge */}
                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-500 dark:text-zinc-400">Password strength:</span>
                      <span
                        className={
                          strength <= 25
                            ? 'text-rose-500'
                            : strength <= 50
                            ? 'text-amber-500'
                            : strength <= 75
                            ? 'text-blue-500'
                            : 'text-emerald-500'
                        }
                      >
                        {strength <= 25
                          ? 'Weak'
                          : strength <= 50
                          ? 'Fair'
                          : strength <= 75
                          ? 'Good'
                          : 'Strong'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          strength <= 25
                            ? 'bg-rose-500 w-1/4'
                            : strength <= 50
                            ? 'bg-amber-500 w-2/4'
                            : strength <= 75
                            ? 'bg-blue-500 w-3/4'
                            : 'bg-emerald-500 w-full'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Permanent Password */}
              <div className="group/field">
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 group-hover/field:text-[#FF6B35] transition-colors">
                  Confirm Permanent Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat the new permanent password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs focus:border-[#FF6B35] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6B35]/15 focus:-translate-y-0.5 focus:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:placeholder-zinc-500 dark:hover:border-zinc-600 dark:focus:bg-zinc-800 transition-all duration-200"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3 text-lg text-slate-400 group-hover/field:text-[#FF6B35] focus-within:text-[#FF6B35] dark:text-zinc-500 transition-colors">
                    verified_user
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 hover:scale-110 dark:hover:text-zinc-200 transition-all cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Security Checklist */}
              <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-3.5 border border-slate-200/70 dark:border-zinc-700/60 text-xs space-y-1.5">
                <p className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider mb-1">
                  Compliance Criteria:
                </p>
                
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      hasMinLength ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    {hasMinLength ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={hasMinLength ? 'text-slate-900 dark:text-zinc-100 font-semibold' : 'text-slate-500 dark:text-zinc-400'}>
                    Minimum 8 characters
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      hasNumber ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    {hasNumber ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={hasNumber ? 'text-slate-900 dark:text-zinc-100 font-semibold' : 'text-slate-500 dark:text-zinc-400'}>
                    At least one number (0-9)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      hasUppercase ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    {hasUppercase ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={hasUppercase ? 'text-slate-900 dark:text-zinc-100 font-semibold' : 'text-slate-500 dark:text-zinc-400'}>
                    At least one uppercase character (A-Z)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      passwordsMatch ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    {passwordsMatch ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={passwordsMatch ? 'text-slate-900 dark:text-zinc-100 font-semibold' : 'text-slate-500 dark:text-zinc-400'}>
                    Passwords match
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      isDifferentFromTemp ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    {isDifferentFromTemp ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={isDifferentFromTemp ? 'text-slate-900 dark:text-zinc-100 font-semibold' : 'text-slate-500 dark:text-zinc-400'}>
                    Distinct from temporary password
                  </span>
                </div>
              </div>

              {/* Policy Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setAgreeSecurityPolicy((prev) => !prev)}
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all cursor-pointer hover:scale-110 ${
                    agreeSecurityPolicy
                      ? 'border-[#FF6B35] bg-[#FF6B35] text-white shadow-xs'
                      : 'border-slate-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
                  }`}
                >
                  {agreeSecurityPolicy && (
                    <span className="material-symbols-outlined text-xs font-black">check</span>
                  )}
                </button>
                <label className="text-xs text-slate-600 dark:text-zinc-400 leading-snug">
                  I certify that this password is kept confidential and will not be shared across non-authorized devices.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !isFormValid}
                  className="w-full rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F25A24] hover:from-[#E85B24] hover:to-[#D94814] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-[#FF6B35]/25 hover:shadow-xl hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Activating permanent security key...</span>
                    </>
                  ) : (
                    <>
                      <span>Set Permanent Password &amp; Enter Console</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs font-bold text-slate-500 hover:text-[#FF6B35] dark:text-zinc-400 hover:underline cursor-pointer"
                >
                  &larr; Return to Sign In
                </button>
              </div>

            </form>
              </>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-500">lock_reset</span>
              <span>Encrypted First-Time Provisioning</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Shima Identity Management</span>
              <span>&bull;</span>
              <span>v2.4</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
