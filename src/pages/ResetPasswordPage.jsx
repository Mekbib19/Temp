import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ShimaLogo from '../components/Logo'
import { useAppTheme } from '../providers/theme-context'
import { updateUserPassword } from '../services/authService'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isDark, toggleTheme } = useAppTheme()

  const urlToken = searchParams.get('token')
  const urlEmail = searchParams.get('email')

  // Step state: 'request' | 'sent' | 'reset' | 'success'
  const [step, setStep] = useState(() => {
    if (urlToken) return 'reset'
    return 'request'
  })

  const [email, setEmail] = useState(urlEmail || '')
  const [generatedToken, setGeneratedToken] = useState(urlToken || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  // Carousel slide state for left showcase panel
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    {
      badge: 'ACCOUNT SECURITY PROTOCOL',
      headline: 'Enterprise Credential Governance',
      description:
        'All password resets are secured with single-use, cryptographically signed tokens and audited across Shima operations registries.',
      bullets: [
        'Single-use, time-limited reset links (15 min)',
        'Zero-knowledge encrypted password vault',
        'Automatic active session invalidation',
      ],
      kpis: [
        { label: 'Token Expiry', value: '15 min' },
        { label: 'Encryption', value: 'AES-256' },
        { label: 'Audit Logged', value: '100%' },
      ],
    },
    {
      badge: 'FLEET LOGISTICS',
      headline: 'Uninterrupted Dispatch Telemetry',
      description:
        'Reset your operator credentials securely to regain access to live vehicle telemetry, merchant order routing, and courier payouts.',
      bullets: [
        'Live driver GPS tracking & route maps',
        'Sub-5 minute emergency courier reassignment',
        '24/7 hotline operational control',
      ],
      kpis: [
        { label: 'Active Couriers', value: '1,200+' },
        { label: 'Merchant Stores', value: '450+' },
        { label: 'Platform SLA', value: '99.9%' },
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

  // Password validation rules
  const hasMinLength = newPassword.length >= 8
  const hasNumber = /\d/.test(newPassword)
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword)
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword

  const calculateStrength = () => {
    let score = 0
    if (hasMinLength) score += 25
    if (hasNumber) score += 25
    if (hasUppercase) score += 25
    if (hasSpecial) score += 25
    return score
  }

  const strength = calculateStrength()
  const isFormValid = hasMinLength && hasNumber && hasUppercase && passwordsMatch

  // Step 1: Handle Email Submission
  const handleRequestReset = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      const token = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`
      setGeneratedToken(token)
      setStep('sent')
      setToastMessage('Reset instructions sent to your email!')
      setTimeout(() => setToastMessage(''), 4000)
    }, 650)
  }

  // Step 2: Handle simulated email click to loop into reset password form
  const handleFollowEmailLink = () => {
    setStep('reset')
    setErrorMessage('')
    setToastMessage('Security token verified. Enter your new password.')
    setTimeout(() => setToastMessage(''), 3000)
  }

  // UI Bypass: Skip the email step entirely and jump straight to setting new password
  const handleBypassLink = () => {
    const targetEmail = email.trim() || 'operator@shimadelivery.com'
    setEmail(targetEmail)
    setGeneratedToken(`tok_bypass_${Date.now()}`)
    setErrorMessage('')
    setStep('reset')
    setToastMessage('Email link bypassed! Set your new password below.')
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Step 3: Handle New Password Reset Submission
  const handleResetPassword = (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!hasMinLength) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }
    if (!hasNumber) {
      setErrorMessage('Password must contain at least one number.')
      return
    }
    if (!hasUppercase) {
      setErrorMessage('Password must contain at least one uppercase letter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      // Save password update in authService and localStorage
      updateUserPassword(email, newPassword)
      const usersData = JSON.parse(localStorage.getItem('shima_users_db') || '{}')
      usersData[email] = { password: newPassword, updatedAt: Date.now() }
      localStorage.setItem('shima_users_db', JSON.stringify(usersData))

      setStep('success')
      setToastMessage('Password successfully updated!')
    }, 800)
  }

  return (
    <div className="w-full min-h-screen h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-['Plus_Jakarta_Sans'] transition-colors duration-200 selection:bg-[#FF6B35] selection:text-white overflow-hidden p-0 m-0">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#FF6B35] px-5 py-3.5 text-sm font-bold text-white shadow-2xl shadow-orange-500/40 animate-in slide-in-from-top duration-300">
          <span className="material-symbols-outlined text-xl">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Full-Screen Layout */}
      <div className="w-full h-full min-h-screen flex flex-col lg:flex-row overflow-hidden bg-white dark:bg-zinc-900">
        
        {/* ========================================================
            LEFT PANEL: BRAND & SECURITY SHOWCASE
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
                  Credential Recovery
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
                    <span className="material-symbols-outlined text-sm font-black">check</span>
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
              <span className="material-symbols-outlined text-base">lock</span>
              <span>256-Bit Encrypted Credential Reset</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT PANEL: PASSWORD RESET PROCESSOR
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
                  Password Recovery
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

          {/* Main Center Area */}
          <div className="my-auto py-6 max-w-md w-full mx-auto">
            
            {/* ----------------------------------------------------
                PHASE 1: REQUEST RESET LINK (Enter Email)
               ---------------------------------------------------- */}
            {step === 'request' && (
              <div className="animate-in fade-in duration-300">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#FF6B35] text-xs font-bold mb-3 border border-orange-200/50 dark:border-orange-900/40">
                    <span className="material-symbols-outlined text-sm">mail_lock</span>
                    <span>Step 1 of 2: Identify Account</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Reset your password
                  </h1>

                  <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Enter the email address registered with your Shima Delivery account. We will send you a secure verification link to choose a new password.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-4">
                  <div className="group/field">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 group-hover/field:text-[#FF6B35] transition-colors">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="operator@shimadelivery.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 pl-10 text-sm text-slate-900 placeholder-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs focus:border-[#FF6B35] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF6B35]/15 focus:-translate-y-0.5 focus:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-white dark:placeholder-zinc-500 dark:hover:border-zinc-600 dark:focus:bg-zinc-800 transition-all duration-200"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-3 text-lg text-slate-400 group-hover/field:text-[#FF6B35] focus-within:text-[#FF6B35] dark:text-zinc-500 transition-colors">
                        mail
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2.5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F25A24] hover:from-[#E85B24] hover:to-[#D94814] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-[#FF6B35]/25 hover:shadow-xl hover:shadow-[#FF6B35]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          <span>Generating secure token...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Password Reset Link</span>
                          <span className="material-symbols-outlined text-sm">send</span>
                        </>
                      )}
                    </button>

                    {/* UI Direct Bypass Button */}
                    <button
                      type="button"
                      onClick={handleBypassLink}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-orange-300 dark:border-orange-800/80 bg-orange-50/70 dark:bg-orange-950/20 hover:bg-orange-100/70 dark:hover:bg-orange-950/40 p-2.5 text-xs font-bold text-[#FF6B35] dark:text-orange-400 hover:border-orange-400 transition-all cursor-pointer group shadow-xs active:scale-[0.99]"
                    >
                      <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-12">bolt</span>
                      <span>Bypass Email &bull; Set New Password Directly (UI Preview)</span>
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-xs font-bold text-slate-500 hover:text-[#FF6B35] dark:text-zinc-400 hover:underline cursor-pointer transition-colors"
                    >
                      &larr; Return to Sign In
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ----------------------------------------------------
                PHASE 2: SIMULATED EMAIL INBOX NOTIFICATION
                (User receives link from email and loops to reset)
               ---------------------------------------------------- */}
            {step === 'sent' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-200 dark:border-emerald-800">
                    <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Check your email inbox
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                    We dispatched a secure password reset link to:
                  </p>
                  <p className="font-bold text-sm text-[#FF6B35] mt-1 break-all">
                    {email}
                  </p>
                </div>

                {/* Direct Bypass Button for UI Testing */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={handleBypassLink}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#F25A24] hover:from-[#E85B24] hover:to-[#D94814] py-3 px-4 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-12">bolt</span>
                    <span>Bypass Email Link &bull; Jump Directly to Password Reset</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                {/* Simulated Interactive Email Card */}
                <div className="rounded-2xl border border-slate-200/85 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-5 shadow-lg shadow-slate-100/50 dark:shadow-none mb-5">
  {/* Header banner */}
  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
    <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-zinc-300">
      <span className="material-symbols-outlined text-[15px] text-[#FF6B35] animate-pulse">mail</span>
      <span>Simulated Incoming Email Message</span>
    </span>
    <span className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-100/40 dark:border-emerald-900/20">
      Just Now
    </span>
  </div>
  
  {/* Email Body Content */}
  <div className="pt-3.5 text-xs text-slate-600 dark:text-zinc-300 space-y-3 leading-relaxed">
    {/* Email Metadata Box */}
    <div className="bg-slate-50/80 dark:bg-zinc-800/40 rounded-xl p-2.5 border border-slate-100 dark:border-zinc-800/50 text-[11px] text-slate-500 dark:text-zinc-400">
      <p><strong className="text-slate-400 dark:text-zinc-500 font-medium">From:</strong> security@shimadelivery.com</p>
      <p className="mt-0.5"><strong className="text-slate-400 dark:text-zinc-500 font-medium">Subject:</strong> Password reset authorization</p>
    </div>

    <p className="font-semibold text-slate-700 dark:text-zinc-200">Hello Shima Operator,</p>
    <p>
      A request was received to reset the login credentials for your Shima Delivery account. 
      To set your new password, click the secure link below:
    </p>
    
    {/* The action button link */}
    <div className="pt-1">
      <button
        type="button"
        onClick={handleFollowEmailLink}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] hover:bg-[#E85B24] p-3 text-xs font-bold text-white shadow-md shadow-orange-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer group"
      >
        <span className="material-symbols-outlined text-base transition-transform group-hover:rotate-12">lock_reset</span>
        <span>Click Link to Reset Password (Loop to Reset Page)</span>
      </button>
    </div>
    
    {/* Clean Footer Info */}
    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/50 text-[10px] text-slate-400 dark:text-zinc-500">
      <div className="flex items-center gap-1.5 min-w-0">
        <span>Token:</span>
        <code className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-rose-500 dark:text-rose-400 truncate max-w-[180px]" title={generatedToken}>
          {generatedToken}
        </code>
      </div>
      <span className="flex items-center gap-0.5 font-medium text-amber-600 dark:text-amber-500">
        <span className="material-symbols-outlined text-[12px]">schedule</span>
        expires in 15 minutes
      </span>
    </div>
  </div>
</div>


                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="font-bold text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white cursor-pointer"
                  >
                    Didn&apos;t get email? Try another
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-bold text-[#FF6B35] hover:underline cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                PHASE 3: INSERT NEW PASSWORD WITH CONFIRMATION
               ---------------------------------------------------- */}
            {step === 'reset' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3 border border-emerald-200/50 dark:border-emerald-900/40">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    <span>Step 2 of 2: Create New Password</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Create new password
                  </h1>

                  <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Setting new secure password for <strong className="text-slate-800 dark:text-zinc-200">{email || 'your account'}</strong>.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New Password */}
                  <div className="group/field">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 group-hover/field:text-[#FF6B35] transition-colors">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
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
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 hover:scale-110 dark:hover:text-zinc-200 transition-all cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {showPassword ? 'visibility_off' : 'visibility'}
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

                  {/* Confirm Password */}
                  <div className="group/field">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5 group-hover/field:text-[#FF6B35] transition-colors">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your new password"
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

                  {/* Requirements Checklist */}
                  <div className="rounded-xl bg-slate-50 dark:bg-zinc-800/60 p-3.5 border border-slate-200/70 dark:border-zinc-700/60 text-xs space-y-1.5">
                    <p className="font-bold text-slate-700 dark:text-zinc-300 text-[11px] uppercase tracking-wider mb-1">
                      Password Requirements:
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
                        At least 8 characters
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
                        At least one uppercase letter (A-Z)
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
                          <span>Updating password security vault...</span>
                        </>
                      ) : (
                        <>
                          <span>Update Password &amp; Proceed to Sign In</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ----------------------------------------------------
                PHASE 4: SUCCESS CONFIRMATION
               ---------------------------------------------------- */}
            {step === 'success' && (
              <div className="text-center animate-in zoom-in-95 duration-300 py-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mb-4 border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/20">
                  <span className="material-symbols-outlined text-4xl">task_alt</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Password updated!
                </h2>

                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Your credentials have been securely refreshed. You can now use your new password to access the Shima Delivery console.
                </p>

                <div className="mt-6 space-y-3">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full rounded-xl bg-[#FF6B35] hover:bg-[#E85B24] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-[#FF6B35]/25 hover:scale-[1.01] active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Sign In</span>
                    <span className="material-symbols-outlined text-sm">login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 py-3 px-4 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Go directly to Dashboard Demo
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Security Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-emerald-500">verified_user</span>
              <span>Single-Use Cryptographic Auth Token</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Shima Security Center</span>
              <span>&bull;</span>
              <span>v2.4</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
