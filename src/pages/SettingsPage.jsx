import { useState, useMemo, useEffect, useCallback } from 'react'
import MainLayout from '../layouts/MainLayout'
import {
  loadSettings,
  saveSettings,
  resetSettings,
} from '../data/settingsData'

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => loadSettings())
  const [initialSnapshot, setInitialSnapshot] = useState(() => JSON.stringify(loadSettings()))
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pricing' | 'delivery' | 'commission' | 'timing' | 'support'
  const [isSaving, setIsSaving] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Simulation calculator states
  const [simSubtotal, setSimSubtotal] = useState(250)
  const [simDistance, setSimDistance] = useState(6.5)

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Detect unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(settings) !== initialSnapshot
  }, [settings, initialSnapshot])

  // Sync when changed elsewhere
  const handleStorageSync = useCallback(() => {
    const updated = loadSettings()
    setSettings(updated)
    setInitialSnapshot(JSON.stringify(updated))
  }, [])

  useEffect(() => {
    window.addEventListener('system-settings-updated', handleStorageSync)
    return () => window.removeEventListener('system-settings-updated', handleStorageSync)
  }, [handleStorageSync])

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNumberChange = (field, value) => {
    const parsed = value === '' ? 0 : Number(value)
    setSettings((prev) => ({
      ...prev,
      [field]: isNaN(parsed) ? 0 : parsed,
    }))
  }

  const handleSave = (e) => {
    if (e) e.preventDefault()
    setIsSaving(true)

    setTimeout(() => {
      saveSettings(settings)
      setInitialSnapshot(JSON.stringify(settings))
      setIsSaving(false)
      showToast('System configuration saved successfully!', 'success')
    }, 300)
  }

  const handleResetToDefaults = () => {
    const def = resetSettings()
    setSettings(def)
    setInitialSnapshot(JSON.stringify(def))
    setShowResetConfirm(false)
    showToast('All parameters restored to factory defaults.', 'success')
  }


  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(settings, null, 4)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shima_settings_${settings.app_version}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Settings exported as JSON file.', 'success')
  }

  // Live Simulation Calculation
  const simCalculation = useMemo(() => {
    const sub = Number(simSubtotal) || 0
    const dist = Math.min(Number(simDistance) || 0, Number(settings.max_delivery_distance_km) || 50)
    
    // Delivery Fee = base + (km * per_km)
    const deliveryFee = Number(settings.base_delivery_fee) + dist * Number(settings.delivery_fee_per_km)

    // Service Charge = fixed + (sub * percentage)
    const serviceCharge = Number(settings.service_charge_fixed_amount) + (sub * (Number(settings.service_charge_percentage) / 100))

    // Tax
    const tax = sub * (Number(settings.tax_percentage) / 100)

    // Grand Total
    const total = sub + deliveryFee + serviceCharge + tax

    // Rider Earnings from Delivery
    const riderCommission = deliveryFee * (Number(settings.rider_commission_percentage) / 100)

    // Platform Fee from Order
    const platformFee = sub * (Number(settings.platform_fee_percentage) / 100)

    return {
      subtotal: sub,
      distance: dist,
      deliveryFee,
      serviceCharge,
      tax,
      total,
      riderCommission,
      platformFee,
      isBelowMinimum: sub < Number(settings.minimum_order_amount),
    }
  }, [simSubtotal, simDistance, settings])

  const tabs = [
    { id: 'all', label: 'All Settings', icon: 'tune' },
    { id: 'pricing', label: 'Pricing & Taxes', icon: 'receipt' },
    { id: 'delivery', label: 'Delivery & Logistics', icon: 'local_shipping' },
    { id: 'commission', label: 'Commissions & Fees', icon: 'percent' },
    { id: 'timing', label: 'Dispatch & Timers', icon: 'timer' },
  ]

  return (
    <MainLayout
      activeMenuKey="settings"
      breadcrumbParent="Dashboard"
      breadcrumbCurrent="Settings"
    >
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom duration-200 dark:bg-white dark:text-slate-900">
            <span
              className={`material-symbols-outlined text-base ${
                toastMessage.type === 'error' ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {toastMessage.type === 'error' ? 'error' : 'check_circle'}
            </span>
            <span>{toastMessage.message}</span>
          </div>
        )}

        {/* Confirmation Modal for Reset */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 animate-in zoom-in-95 duration-150">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                <span className="material-symbols-outlined text-2xl">restart_alt</span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-zinc-100">
                Restore Factory Settings?
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                This will reset all service charges, delivery rates, commission percentages, dispatch timers, and contact details to the standard default parameters. Any unsaved custom modifications will be lost.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-['Plus_Jakarta_Sans'] text-xl font-extrabold text-slate-900 dark:text-zinc-100 sm:text-2xl">
                System Settings &amp; Configuration
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-extrabold text-[#FF6B35] ring-1 ring-orange-500/20 dark:bg-orange-950/40">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
              </span>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse">
                  <span className="material-symbols-outlined text-xs">warning</span>
                  <span>Unsaved Changes</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
              Configure delivery rates, commission sharing, cancellation rules, tax percentages, and dispatch timing windows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
              title="Reset all settings to default values"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJSON}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 cursor-pointer"
              title="Export configuration as JSON file"
            >
              <span className="material-symbols-outlined text-base">file_download</span>
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] active:scale-95 transition disabled:opacity-50 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-base ${isSaving ? 'animate-spin' : ''}`}>
                {isSaving ? 'sync' : 'save'}
              </span>
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200/90 pb-2 dark:border-zinc-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-[#FF6B35] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Main Content Grid: Forms on Left/Center, Live Fee Calculator on Right */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Main Configuration Panels */}
          <div className="space-y-6 lg:col-span-8">
            
            {/* SECTION 1: PRICING & TAXATION */}
            {(activeTab === 'all' || activeTab === 'pricing') && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                      <span className="material-symbols-outlined text-xl">payments</span>
                    </span>
                    <div>
                      <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                        Pricing, Tax &amp; Service Charges
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Global tax rates, service charges, order checkout minimums, and currency presentation.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                    Finance Settings
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Service Charge Fixed */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Fixed Service Charge
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={settings.service_charge_fixed_amount}
                        onChange={(e) => handleNumberChange('service_charge_fixed_amount', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-14 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        {settings.currency_symbol}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Mandatory fixed booking and processing fee appended to every order.
                    </p>
                  </div>

                  {/* Service Charge Percentage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Service Charge Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={settings.service_charge_percentage}
                        onChange={(e) => handleNumberChange('service_charge_percentage', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Variable service charge percentage calculated on basket subtotal.
                    </p>
                  </div>

                  {/* Tax Percentage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Tax Percentage (VAT)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={settings.tax_percentage}
                        onChange={(e) => handleNumberChange('tax_percentage', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Standard government VAT rate applied to checkout items.
                    </p>
                  </div>

                  {/* Minimum Order Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Minimum Order Amount
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="5"
                        min="0"
                        value={settings.minimum_order_amount}
                        onChange={(e) => handleNumberChange('minimum_order_amount', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-14 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        {settings.currency_symbol}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Lowest subtotal basket required before a customer can check out.
                    </p>
                  </div>

                  {/* Currency Code & Symbol */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Currency Code (ISO)
                    </label>
                    <input
                      type="text"
                      value={settings.currency_code}
                      onChange={(e) => handleInputChange('currency_code', e.target.value.toUpperCase())}
                      placeholder="ETB"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Official 3-letter currency code (e.g. ETB, USD, EUR).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Currency Symbol / Name
                    </label>
                    <input
                      type="text"
                      value={settings.currency_symbol}
                      onChange={(e) => handleInputChange('currency_symbol', e.target.value)}
                      placeholder="Birr"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                      Visual display unit printed on invoices and badges (e.g. Birr).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: DELIVERY & LOGISTICS */}
            {(activeTab === 'all' || activeTab === 'delivery') && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                      <span className="material-symbols-outlined text-xl">moped</span>
                    </span>
                    <div>
                      <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                        Delivery Logistics &amp; Distance Rates
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Control baseline delivery pricing, mileage escalations, and maximum fulfillment radiuses.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    Routing Engine
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Base Delivery Fee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Base Delivery Fee
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={settings.base_delivery_fee}
                        onChange={(e) => handleNumberChange('base_delivery_fee', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-14 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        {settings.currency_symbol}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Starting flat drop fee applied before mileage calculations.
                    </p>
                  </div>

                  {/* Delivery Fee Per KM */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Delivery Fee Per KM
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={settings.delivery_fee_per_km}
                        onChange={(e) => handleNumberChange('delivery_fee_per_km', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-14 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        {settings.currency_symbol}/km
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Rate charged per kilometer from merchant pickup point to customer door.
                    </p>
                  </div>

                  {/* Max Delivery Distance */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Max Delivery Distance
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="200"
                        value={settings.max_delivery_distance_km}
                        onChange={(e) => handleNumberChange('max_delivery_distance_km', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        km
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Orders beyond this radius will be blocked as out of service range.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: COMMISSIONS & FEES */}
            {(activeTab === 'all' || activeTab === 'commission') && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                      <span className="material-symbols-outlined text-xl">monetization_on</span>
                    </span>
                    <div>
                      <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                        Driver Commissions &amp; Penalty Fees
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Courier split percentages, platform share margin, and late cancellation charges.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    Revenue Split
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {/* Rider Commission Percentage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Rider Commission Share
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={settings.rider_commission_percentage}
                        onChange={(e) => handleNumberChange('rider_commission_percentage', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Percentage of the delivery fee credited directly to the courier&apos;s wallet.
                    </p>
                  </div>

                  {/* Platform Fee Percentage */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Platform Fee Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={settings.platform_fee_percentage}
                        onChange={(e) => handleNumberChange('platform_fee_percentage', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Take-rate retained by Shima Delivery from merchant order value.
                    </p>
                  </div>

                  {/* Cancellation Fee */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Cancellation Penalty Fee
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={settings.cancellation_fee}
                        onChange={(e) => handleNumberChange('cancellation_fee', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-14 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        {settings.currency_symbol}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Fee assessed if an order is cancelled after merchant preparation begins.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: DISPATCH & TIMING RULES */}
            {(activeTab === 'all' || activeTab === 'timing') && (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40">
                      <span className="material-symbols-outlined text-xl">hourglass_top</span>
                    </span>
                    <div>
                      <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                        Dispatch Automation &amp; Cancellation Windows
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Time thresholds for automated order confirmations, driver acceptance timers, and grace periods.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                    SLA &amp; Timers
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Order Auto-Accept Minutes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Auto-Accept Window
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.order_auto_accept_minutes}
                        onChange={(e) => handleNumberChange('order_auto_accept_minutes', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-12 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        min
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Minutes before unconfirmed orders are automatically approved for kitchen.
                    </p>
                  </div>

                  {/* Rider Accept Timeout Seconds */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Rider Accept Timeout
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="10"
                        max="180"
                        step="5"
                        value={settings.rider_accept_timeout_seconds}
                        onChange={(e) => handleNumberChange('rider_accept_timeout_seconds', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-12 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        sec
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Seconds a courier has to accept before pinging the next nearest driver.
                    </p>
                  </div>

                  {/* Customer Cancellation Window */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Customer Cancel Grace
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.customer_cancellation_window_minutes}
                        onChange={(e) => handleNumberChange('customer_cancellation_window_minutes', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-12 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        min
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Minutes allowed for customers to cancel free of charge.
                    </p>
                  </div>

                  {/* Rider Cancellation Window */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1.5">
                      Rider Reassign Window
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={settings.rider_cancellation_window_minutes}
                        onChange={(e) => handleNumberChange('rider_cancellation_window_minutes', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-12 text-xs font-mono font-bold text-slate-900 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        min
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Minutes an assigned courier can reassign without penalty.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Live Fee Calculation & Financial Simulator */}
          <div className="space-y-6 lg:col-span-4">
            
            {/* Live Pricing Simulator Card */}
            <div className="sticky top-6 rounded-2xl border border-orange-200/80 bg-gradient-to-b from-orange-50/60 to-white p-6 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900">
              <div className="flex items-center gap-2 pb-3 border-b border-orange-200/60 dark:border-zinc-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35] text-white">
                  <span className="material-symbols-outlined text-base">calculate</span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                    Live Pricing Simulator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Test how current parameters affect an active order.
                  </p>
                </div>
              </div>

              {/* Interactive test sliders/inputs */}
              <div className="mt-4 space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    <span>Order Subtotal</span>
                    <span className="font-mono text-[#FF6B35]">
                      {simSubtotal} {settings.currency_symbol}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    step="25"
                    value={simSubtotal}
                    onChange={(e) => setSimSubtotal(Number(e.target.value))}
                    className="w-full accent-[#FF6B35] cursor-pointer"
                  />
                  {simCalculation.isBelowMinimum && (
                    <p className="mt-1 text-[11px] font-bold text-rose-500 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">error</span>
                      Below minimum order limit ({settings.minimum_order_amount} {settings.currency_symbol})
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    <span>Delivery Distance</span>
                    <span className="font-mono text-blue-600">
                      {simDistance} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max={Math.min(50, Number(settings.max_delivery_distance_km) || 50)}
                    step="0.5"
                    value={simDistance}
                    onChange={(e) => setSimDistance(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Calculated Breakdown Card */}
              <div className="mt-5 rounded-xl border border-slate-200/80 bg-white p-4 text-xs dark:border-zinc-800 dark:bg-zinc-850 shadow-2xs space-y-2.5">
                <div className="flex justify-between text-slate-500">
                  <span>Basket Subtotal</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {simCalculation.subtotal.toFixed(2)} {settings.currency_symbol}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <div className="flex flex-col">
                    <span>Delivery Fee</span>
                    <span className="text-[10px] text-slate-400">
                      Base ({settings.base_delivery_fee}) + {simDistance}km × {settings.delivery_fee_per_km}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {simCalculation.deliveryFee.toFixed(2)} {settings.currency_symbol}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>Service Charge (Fixed + %)</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {simCalculation.serviceCharge.toFixed(2)} {settings.currency_symbol}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span>VAT Tax ({settings.tax_percentage}%)</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-zinc-200">
                    {simCalculation.tax.toFixed(2)} {settings.currency_symbol}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800 flex justify-between items-baseline text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  <span>Total Customer Bill</span>
                  <span className="text-base text-[#FF6B35]">
                    {simCalculation.total.toFixed(2)} {settings.currency_symbol}
                  </span>
                </div>
              </div>

              {/* Revenue Distribution Preview */}
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs dark:border-zinc-800 dark:bg-zinc-850 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Projected Partner Distribution
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                    <span className="material-symbols-outlined text-sm text-emerald-500">two_wheeler</span>
                    <span>Rider Delivery Payout ({settings.rider_commission_percentage}%)</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600">
                    {simCalculation.riderCommission.toFixed(2)} {settings.currency_symbol}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                    <span className="material-symbols-outlined text-sm text-[#FF6B35]">store</span>
                    <span>Platform Order Share ({settings.platform_fee_percentage}%)</span>
                  </div>
                  <span className="font-mono font-bold text-[#FF6B35]">
                    {simCalculation.platformFee.toFixed(2)} {settings.currency_symbol}
                  </span>
                </div>
              </div>

              {/* Quick Save Card Action */}
              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#e0531f] transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-base ${isSaving ? 'animate-spin' : ''}`}>
                    {isSaving ? 'sync' : 'save'}
                  </span>
                  <span>{isSaving ? 'Applying Settings...' : 'Apply & Save System Settings'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </MainLayout>
  )
}
