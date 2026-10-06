/**
 * Multi-Vendor Merchant Seed Data & Storage Utilities
 * Supports diverse merchants: Restaurants, Groceries, Pharmacies, Retail, Bakeries, Beverages, etc.
 */

export const STORAGE_KEY = 'deliver_app_merchants_data'

export const MERCHANT_TYPES = [
  'Restaurant & Dining',
  'Grocery & Supermarket',
  'Pharmacy & Health',
  'Bakery & Cafe',
  'Beverage & Spirits',
  'Retail & Convenience',
  'Specialty & Gourmet',
  'Pet Care & Supplies',
]

export const defaultMerchants = [
  {
    id: 'm-001',
    name: 'The Burger Collective',
    type: 'Restaurant & Dining',
    locations: 8,
    status: 'Active',
    description: 'Fresh prime Angus beef patties, toasted brioche buns, and house-made artisan sauces.',
    sort_order: 1,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFRDuht5UUADKd0HllFwOJDeE3JBLMu_46u5n8nsCdPLpHH8BuBeJZaNLjoUxLehXVdTj_iAfCy6dc7H_lctXhQqe27jPepaK6IA7GlMqbTUogMgcLZ8r6zHZ90Hy4Zu-tZsmHB7-LKh5-4XzcNkj4S3Mta2qIsnDrfK6ughLgrFtSm4hOlCbjVtqE9sDNK9Cxh4MqJ71G0UPwG3I3ljbQkppfZH5zaUXr0RsFAg75wPNdvyANxYzDdQjEP8A8Y4_cZmcNz5VfoHA',
    phone: '+1 (555) 234-5678',
    email: 'orders@burgercollective.com',
    address: '428 Market Street, Downtown',
    commission_rate: 15,
  },
  {
    id: 'm-002',
    name: 'Whole Harvest Organic Market',
    type: 'Grocery & Supermarket',
    locations: 5,
    status: 'Active',
    description: 'Certified organic produce, local farm dairy, gluten-free pantry essentials, and fresh bulk goods.',
    sort_order: 2,
    created_at: new Date(Date.now() - 110 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 876-5432',
    email: 'support@wholeharvest.com',
    address: '1100 Green Blvd, West End',
    commission_rate: 10,
  },
  {
    id: 'm-003',
    name: 'MedExpress Care Pharmacy',
    type: 'Pharmacy & Health',
    locations: 6,
    status: 'Active',
    description: 'Prescription refills, over-the-counter medicine, first aid, vitamins, and rapid wellness essentials.',
    sort_order: 3,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 998-1122',
    email: 'care@medexpress.com',
    address: '750 Healthcare Way, Suite 100',
    commission_rate: 8,
  },
  {
    id: 'm-004',
    name: 'Sashimi Zen Omakase',
    type: 'Restaurant & Dining',
    locations: 3,
    status: 'Active',
    description: 'Wild ocean-caught nigiri, omakase sushi platters, and authentic Japanese hand rolls.',
    sort_order: 4,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCgm3zm21EQNCetbzOgS2fPmVnxZvbwUVKPx7Kglx0_K8Xzn2y93Ec70Ae5RxZeyVcpDC5UtO_RNzyRHIFbt7T5-J_A63VOJ3mMvcMqd8hCbglzUMRn3-G7-jIi69O6uo9Pk14nr47x-DUOzHJM__w3BgcI8xGgo19g8OGtKGICWkUzGpnYUl3Ky6S6VW8XZbrVUUuPmk00L19GgLomUChxfk3-L0dlAp19Txqv8Yv7GPjGcSx6C0TRbZKdsX_eOppSnm0YEV1hrM',
    phone: '+1 (555) 345-6789',
    email: 'concierge@sashimizen.com',
    address: '88 Waterfront Pier, Marina District',
    commission_rate: 18,
  },
  {
    id: 'm-005',
    name: 'Urban Cellar & Fine Spirits',
    type: 'Beverage & Spirits',
    locations: 4,
    status: 'Active',
    description: 'Curated natural wines, craft IPAs, imported aged whiskeys, and chilled party mixers.',
    sort_order: 5,
    created_at: new Date(Date.now() - 140 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 432-1098',
    email: 'cheers@urbancellar.com',
    address: '320 Vintage Row, Arts District',
    commission_rate: 12,
  },
  {
    id: 'm-006',
    name: 'Caffe Bella Artisan Roastery',
    type: 'Bakery & Cafe',
    locations: 12,
    status: 'Active',
    description: 'Single-origin Ethiopian Yirgacheffe pour-overs, nitro cold brew, and fresh baked flaky croissants.',
    sort_order: 6,
    created_at: new Date(Date.now() - 210 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 678-9012',
    email: 'hello@caffebella.com',
    address: '15 Roasted Bean Alley',
    commission_rate: 14,
  },
  {
    id: 'm-007',
    name: 'FreshMart 24/7 Supermarket',
    type: 'Grocery & Supermarket',
    locations: 15,
    status: 'Active',
    description: 'Express daily grocery delivery, fresh dairy, household supplies, and pantry staples around the clock.',
    sort_order: 7,
    created_at: new Date(Date.now() - 250 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 321-7654',
    email: 'contact@freshmart247.com',
    address: '500 Central Avenue',
    commission_rate: 10,
  },
  {
    id: 'm-008',
    name: 'Sweet Tooth Patisserie',
    type: 'Bakery & Cafe',
    locations: 7,
    status: 'Inactive',
    description: 'French macarons, velvet celebration cakes, fresh fruit tarts, and artisanal Belgian hot chocolate.',
    sort_order: 8,
    created_at: new Date(Date.now() - 360 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 543-2109',
    email: 'orders@sweettoothbakery.com',
    address: '94 Pastry Lane',
    commission_rate: 16,
  },
  {
    id: 'm-009',
    name: 'TechZone Essentials & Retail',
    type: 'Retail & Convenience',
    locations: 8,
    status: 'Active',
    description: 'Rapid on-demand smartphone accessories, chargers, earbuds, cables, and travel electronics.',
    sort_order: 9,
    created_at: new Date(Date.now() - 170 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 887-3344',
    email: 'orders@techzone.io',
    address: '102 Innovation Drive, Tech Hub',
    commission_rate: 12,
  },
  {
    id: 'm-010',
    name: 'PetCare Haven Supplies',
    type: 'Pet Care & Supplies',
    locations: 3,
    status: 'Active',
    description: 'Premium organic pet food, dog treats, cat care accessories, and emergency pet supplies.',
    sort_order: 10,
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 22 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 776-5544',
    email: 'woof@petcarehaven.com',
    address: '44 Paws Crossing',
    commission_rate: 12,
  },
  {
    id: 'm-011',
    name: 'Habesha Bites & Grill',
    type: 'Restaurant & Dining',
    locations: 6,
    status: 'Active',
    description: 'Authentic teff injera served with sizzling derek tibs, rich doro wat, and kitfo tartare.',
    sort_order: 11,
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 223-9988',
    email: 'contact@habeshabites.com',
    address: '210 Addis Way',
    commission_rate: 15,
  },
  {
    id: 'm-012',
    name: 'Green Oasis Kitchen',
    type: 'Restaurant & Dining',
    locations: 4,
    status: 'Inactive',
    description: 'Cold-pressed organic green juices, protein quinoa bowls, massaged kale, and toasted seed salads.',
    sort_order: 12,
    created_at: new Date(Date.now() - 270 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 667-1122',
    email: 'info@greenoasis.com',
    address: '89 Eco Plaza',
    commission_rate: 14,
  },
]

export const loadStoredMerchants = () => {
  if (typeof window === 'undefined') return defaultMerchants
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m) => ({
          ...m,
          merchant_id: m.merchant_id || m.id,
          status: (m.status || 'ACTIVE').toUpperCase(),
          branch_name: m.branch_name || `${m.name} Main Branch`,
          is_featured: Boolean(m.is_featured),
          is_main_branch: m.is_main_branch !== undefined ? Boolean(m.is_main_branch) : true,
          latitude: typeof m.latitude === 'number' ? m.latitude : 9.0016,
          longitude: typeof m.longitude === 'number' ? m.longitude : 38.7842,
          address: m.address || 'Central Commercial Boulevard',
          opening_hours: m.opening_hours || '08:00 AM',
          closing_hours: m.closing_hours || '10:00 PM',
          is_open: m.is_open !== undefined ? Boolean(m.is_open) : true,
          accepts_orders: m.accepts_orders !== undefined ? Boolean(m.accepts_orders) : true,
          eta_min: m.eta_min || 20,
          eta_max: m.eta_max || 40,
          average_rating: m.average_rating || 4.8,
          total_rating: m.total_rating || 5,
          total_reviews: m.total_reviews || 12,
        }))
      }
    }
  } catch (e) {
    console.error('Failed to load stored merchants:', e)
  }
  return defaultMerchants
}

export const getMerchantById = (id) => {
  if (!id) return null
  const current = loadStoredMerchants()
  return current.find((m) => m.id === id || m.merchant_id === id) || null
}

export const updateMerchant = (id, updatedFields) => {
  const current = loadStoredMerchants()
  const now = new Date().toISOString()
  let updatedRecord = null
  const updatedList = current.map((m) => {
    if (m.id === id || m.merchant_id === id) {
      updatedRecord = {
        ...m,
        ...updatedFields,
        updated_at: now,
      }
      return updatedRecord
    }
    return m
  })
  saveStoredMerchants(updatedList)
  return updatedRecord
}

export const saveStoredMerchants = (data) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save merchants:', e)
  }
}

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const addMerchant = (newMerchantData) => {
  const current = loadStoredMerchants()
  const nextOrder = current.length > 0 ? Math.max(...current.map((m) => m.sort_order || 0)) + 1 : 1
  const now = new Date().toISOString()
  const merchantId = newMerchantData.id || generateUUID()
  const created = {
    id: merchantId,
    merchant_id: merchantId,
    sort_order: nextOrder,
    created_at: now,
    updated_at: now,
    status: (newMerchantData.status || 'ACTIVE').toUpperCase(),
    locations: 1,
    is_main_branch: true,
    is_open: true,
    accepts_orders: true,
    average_rating: 4.8,
    total_rating: 5,
    total_reviews: 12,
    ...newMerchantData,
  }
  const updatedList = [created, ...current].map((m, idx) => ({ ...m, sort_order: idx + 1 }))
  saveStoredMerchants(updatedList)
  return created
}
