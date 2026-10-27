/**
 * Category Data adhering to the Category schema:
 * uuid id PK
 * string code UK (e.g. FOOD, GROCERY, PHARMACY, RETAIL, FLOWERS_GIFTS, SERVICES, PACKAGE)
 * string name
 * string slug UK
 * string description
 * string icon (Material symbol name)
 * string image (Data URL / vector icon image)
 * string badgeColor
 * boolean is_active
 * int sort_order
 * timestamp created_at
 * timestamp updated_at
 */

export const STORAGE_KEY = 'deliver_app_categories_v2'

const getDynamicOffset = (days, hours = 0) => {
  return new Date(Date.now() - (days * 86400000 + hours * 3600000)).toISOString()
}

// Built-in curated SVG vector icons for each supported category
export const PRESET_ICON_ASSETS = [
  {
    id: 'food',
    name: 'Food & Restaurants',
    code: 'FOOD',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B35"><path d="M12 2C7.58 2 4 4.79 4 8.2h16C20 4.79 16.42 2 12 2zm-8 8.8v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1H4zm1 4c-.55 0-1 .45-1 1 0 2.21 3.58 4 8 4s8-1.79 8-4c0-.55-.45-1-1-1H5z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C7.58 2 4 4.79 4 8.2h16C20 4.79 16.42 2 12 2zm-8 8.8v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1H4zm1 4c-.55 0-1 .45-1 1 0 2.21 3.58 4 8 4s8-1.79 8-4c0-.55-.45-1-1-1H5z"/></svg>',
  },
  {
    id: 'grocery',
    name: 'Grocery & Fresh Produce',
    code: 'GROCERY',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10B981"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310B981"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Medicine',
    code: 'PHARMACY',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0284C7"><path d="M6 3h12v2H6zm5 3h2v4h4v2h-4v4h-2v-4H7v-2h4zm-6 9h14v2H5zm0 3h14v2H5z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230284C7"><path d="M6 3h12v2H6zm5 3h2v4h4v2h-4v4h-2v-4H7v-2h4zm-6 9h14v2H5zm0 3h14v2H5z"/></svg>',
  },
  {
    id: 'retail',
    name: 'Retail & Merchandise',
    code: 'RETAIL',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#9333EA"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239333EA"><path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h6v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>',
  },
  {
    id: 'flowers_gifts',
    name: 'Flowers & Gifts',
    code: 'FLOWERS_GIFTS',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EC4899"><path d="M12 3c-1.1 0-2 .9-2 2 0 .55.22 1.05.59 1.41C9.65 7.15 9 8.5 9 10c-1.5 0-2.85.65-3.41 1.59C5.22 11.22 4.72 11 4.17 11c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2 .55 0 1.05-.22 1.41-.59C6.15 15.35 7.5 16 9 16v5h2v-5c1.5 0 2.85-.65 3.41-1.59.36.37.86.59 1.41.59 1.1 0 2-.9 2-2 0-1.1-.9-2-2-2-.55 0-1.05.22-1.41.59C13.85 10.65 12.5 10 11 10c0-1.5.65-2.85 1.59-3.41.37.36.87.59 1.41.59 1.1 0 2-.9 2-2 0-1.1-.9-2-2-2-.55 0-1.05.22-1.41.59C12.05 4.05 12 3.55 12 3z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EC4899"><path d="M12 3c-1.1 0-2 .9-2 2 0 .55.22 1.05.59 1.41C9.65 7.15 9 8.5 9 10c-1.5 0-2.85.65-3.41 1.59C5.22 11.22 4.72 11 4.17 11c-1.1 0-2 .9-2 2 0 1.1.9 2 2 2 .55 0 1.05-.22 1.41-.59C6.15 15.35 7.5 16 9 16v5h2v-5c1.5 0 2.85-.65 3.41-1.59.36.37.86.59 1.41.59 1.1 0 2-.9 2-2 0-1.1-.9-2-2-2-.55 0-1.05.22-1.41.59C13.85 10.65 12.5 10 11 10c0-1.5.65-2.85 1.59-3.41.37.36.87.59 1.41.59 1.1 0 2-.9 2-2 0-1.1-.9-2-2-2-.55 0-1.05.22-1.41.59C12.05 4.05 12 3.55 12 3z"/></svg>',
  },
  {
    id: 'services',
    name: 'Services & Maintenance',
    code: 'SERVICES',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D97706"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D97706"><path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/></svg>',
  },
  {
    id: 'package',
    name: 'Package & Courier',
    code: 'PACKAGE',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4F46E5"><path d="M20 7l-8-4-8 4 8 4 8-4zm-8 6l-7-3.5V17l7 3.5 7-3.5v-7.5L12 13z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M20 7l-8-4-8 4 8 4 8-4zm-8 6l-7-3.5V17l7 3.5 7-3.5v-7.5L12 13z"/></svg>',
  },
]

// Official Supported Categories Definition
export const SUPPORTED_CATEGORIES = [
  {
    code: 'FOOD',
    name: 'Food',
    slug: 'food',
    description: 'Restaurants, cafes, fast food',
    icon: 'restaurant',
    badgeColor: 'orange',
  },
  {
    code: 'GROCERY',
    name: 'Grocery',
    slug: 'grocery',
    description: 'Supermarkets, fresh produce',
    icon: 'local_grocery_store',
    badgeColor: 'emerald',
  },
  {
    code: 'PHARMACY',
    name: 'Pharmacy',
    slug: 'pharmacy',
    description: 'Medicines, health products',
    icon: 'medication',
    badgeColor: 'sky',
  },
  {
    code: 'RETAIL',
    name: 'Retail',
    slug: 'retail',
    description: 'Electronics, fashion, general merchandise',
    icon: 'shopping_bag',
    badgeColor: 'purple',
  },
  {
    code: 'FLOWERS_GIFTS',
    name: 'Flowers & Gifts',
    slug: 'flowers-gifts',
    description: 'Florists, gift shops',
    icon: 'local_florist',
    badgeColor: 'pink',
  },
  {
    code: 'SERVICES',
    name: 'Services',
    slug: 'services',
    description: 'Cleaning, Maintenance, Professional, Consulting',
    icon: 'handyman',
    badgeColor: 'amber',
  },
  {
    code: 'PACKAGE',
    name: 'Package',
    slug: 'package',
    description: 'Courier services',
    icon: 'inventory_2',
    badgeColor: 'indigo',
  },
]

// Helper function to trigger browser download of an SVG icon file
export const downloadIconFile = (filename, svgContent) => {
  if (typeof window === 'undefined') return
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename || 'category-icon'}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Initial Seed Categories - Primary Supported Categories
export const initialCategories = [
  {
    id: 'cat-food-1111-4444-8888-000000000001',
    code: 'FOOD',
    name: 'Food',
    slug: 'food',
    description: 'Restaurants, cafes, fast food',
    icon: 'restaurant',
    image: PRESET_ICON_ASSETS[0].dataUrl,
    badgeColor: 'orange',
    is_active: true,
    sort_order: 1,
    requires_stock_quantity: false,
    requires_unit: false,
    requires_sku: false,
    requires_prescription: false,
    is_age_restricted_category: false,
    created_at: getDynamicOffset(90),
    updated_at: getDynamicOffset(0, 2),
  },
  {
    id: 'cat-groc-2222-4444-8888-000000000002',
    code: 'GROCERY',
    name: 'Grocery',
    slug: 'grocery',
    description: 'Supermarkets, fresh produce',
    icon: 'local_grocery_store',
    image: PRESET_ICON_ASSETS[1].dataUrl,
    badgeColor: 'emerald',
    is_active: true,
    sort_order: 2,
    requires_stock_quantity: true,
    requires_unit: true,
    requires_sku: true,
    requires_prescription: false,
    is_age_restricted_category: false,
    created_at: getDynamicOffset(90),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'cat-phar-3333-4444-8888-000000000003',
    code: 'PHARMACY',
    name: 'Pharmacy',
    slug: 'pharmacy',
    description: 'Medicines, health products',
    icon: 'medication',
    image: PRESET_ICON_ASSETS[2].dataUrl,
    badgeColor: 'sky',
    is_active: true,
    sort_order: 3,
    requires_stock_quantity: true,
    requires_unit: true,
    requires_sku: true,
    requires_prescription: true,
    is_age_restricted_category: false,
    created_at: getDynamicOffset(85),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'cat-retl-4444-4444-8888-000000000004',
    code: 'RETAIL',
    name: 'Retail',
    slug: 'retail',
    description: 'Electronics, fashion, general merchandise',
    icon: 'shopping_bag',
    image: PRESET_ICON_ASSETS[3].dataUrl,
    badgeColor: 'purple',
    is_active: true,
    sort_order: 4,
    requires_stock_quantity: true,
    requires_unit: false,
    requires_sku: true,
    requires_prescription: false,
    is_age_restricted_category: false,
    created_at: getDynamicOffset(80),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'cat-flow-5555-4444-8888-000000000005',
    code: 'FLOWERS_GIFTS',
    name: 'Flowers & Gifts',
    slug: 'flowers-gifts',
    description: 'Florists, gift shops',
    icon: 'local_florist',
    image: PRESET_ICON_ASSETS[4].dataUrl,
    badgeColor: 'pink',
    is_active: true,
    sort_order: 5,
    requires_stock_quantity: false,
    requires_unit: false,
    requires_sku: false,
    requires_prescription: false,
    is_age_restricted_category: false,
    created_at: getDynamicOffset(75),
    updated_at: getDynamicOffset(4),
  },
  {
    id: 'cat-serv-6666-4444-8888-000000000006',
    code: 'SERVICES',
    name: 'Services',
    slug: 'services',
    description: 'Cleaning, Maintenance, Professional, Consulting',
    icon: 'handyman',
    image: PRESET_ICON_ASSETS[5].dataUrl,
    badgeColor: 'amber',
    is_active: true,
    sort_order: 6,
    requires_stock_quantity: false,
    requires_unit: false,
    requires_sku: false,
    requires_prescription: false,
    is_age_restricted_category: false,
    created_at: getDynamicOffset(70),
    updated_at: getDynamicOffset(5),
  },
  {
    id: 'cat-pack-7777-4444-8888-000000000007',
    code: 'PACKAGE',
    name: 'Package',
    slug: 'package',
    description: 'Courier services',
    icon: 'inventory_2',
    image: PRESET_ICON_ASSETS[6].dataUrl,
    badgeColor: 'indigo',
    is_active: true,
    sort_order: 7,
    requires_stock_quantity: false,
    requires_unit: false,
    requires_sku: false,
    requires_prescription: false,
    is_age_restricted_category: false,
    created_at: getDynamicOffset(65),
    updated_at: getDynamicOffset(6),
  },
]

export const loadStoredCategories = () => {
  if (typeof window === 'undefined') return initialCategories
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Check if existing data contains the supported categories (FOOD, GROCERY, etc.)
        const hasFoodCode = parsed.some((c) => c.code === 'FOOD' || c.id === 'cat-food-1111-4444-8888-000000000001')
        if (hasFoodCode) {
          const sanitized = parsed.map((c) => ({
            ...c,
            requires_stock_quantity: Boolean(c.requires_stock_quantity),
            requires_unit: Boolean(c.requires_unit),
            requires_sku: Boolean(c.requires_sku),
            requires_prescription: Boolean(c.requires_prescription),
            is_age_restricted_category: Boolean(c.is_age_restricted_category ?? c.is_age_restricted),
          }))
          return sanitized
        }
      }
    }
    // If not set or old schema, save initialCategories to STORAGE_KEY
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCategories))
  } catch (e) {
    console.error('Failed to load stored categories:', e)
  }
  return initialCategories
}

export const saveStoredCategories = (categories) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  } catch (e) {
    console.error('Failed to save categories to storage:', e)
  }
}

export const resetStoredCategories = () => {
  if (typeof window === 'undefined') return initialCategories
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCategories))
  } catch (e) {
    console.error('Failed to reset categories:', e)
  }
  return initialCategories
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

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}
