/**
 * System Settings & Operational Thresholds Data Store
 * Provides persistent configuration for delivery rates, commissions, cancellation rules, and branding.
 */

export const SETTINGS_STORAGE_KEY = 'deliver_app_system_settings_v1'

export const DEFAULT_SETTINGS = {
  service_charge_fixed_amount: 5.0,
  service_charge_percentage: 0.0,
  tax_percentage: 15.0,
  minimum_order_amount: 100.0,
  base_delivery_fee: 25.0,
  delivery_fee_per_km: 5.0,
  rider_commission_percentage: 20.0,
  platform_fee_percentage: 5.0,
  cancellation_fee: 10.0,
  max_delivery_distance_km: 50.0,
  order_auto_accept_minutes: 5,
  rider_accept_timeout_seconds: 30,
  customer_cancellation_window_minutes: 10,
  rider_cancellation_window_minutes: 5,
  support_email: 'support@shimadelivery.com',
  support_phone: '+251911234567',
  currency_code: 'ETB',
  currency_symbol: 'Birr',
  app_name: 'Shima Delivery',
  app_version: '1.0.0',
}

/**
 * Loads settings from localStorage or returns default values
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (err) {
    console.error('Failed to load system settings from localStorage:', err)
  }
  return { ...DEFAULT_SETTINGS }
}

/**
 * Persists settings to localStorage and dispatches sync event
 */
export function saveSettings(newSettings) {
  try {
    const merged = { ...DEFAULT_SETTINGS, ...newSettings }
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged))
    window.dispatchEvent(new CustomEvent('system-settings-updated', { detail: { settings: merged } }))
    return merged
  } catch (err) {
    console.error('Failed to save system settings to localStorage:', err)
    return newSettings
  }
}

/**
 * Resets settings to default values
 */
export function resetSettings() {
  return saveSettings(DEFAULT_SETTINGS)
}
