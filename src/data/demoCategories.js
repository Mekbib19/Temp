/**
 * Demo Category Seed Data adhering to the Category schema:
 * uuid id PK
 * string name
 * string slug UK
 * string description
 * string icon
 * string image (optional custom icon image or downloaded icon)
 * boolean is_active
 * int sort_order
 * timestamp created_at
 * timestamp updated_at
 */

const STORAGE_KEY = 'deliver_app_categories_data'

const getDynamicOffset = (days, hours = 0) => {
  return new Date(Date.now() - (days * 86400000 + hours * 3600000)).toISOString()
}

// Built-in curated SVG food icons (clean, scalable vector data URIs)
export const PRESET_ICON_ASSETS = [
  {
    id: 'burger',
    name: 'Burger & Sliders',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B35"><path d="M12 2C7.58 2 4 4.79 4 8.2h16C20 4.79 16.42 2 12 2zm-8 8.8v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1H4zm1 4c-.55 0-1 .45-1 1 0 2.21 3.58 4 8 4s8-1.79 8-4c0-.55-.45-1-1-1H5z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C7.58 2 4 4.79 4 8.2h16C20 4.79 16.42 2 12 2zm-8 8.8v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1H4zm1 4c-.55 0-1 .45-1 1 0 2.21 3.58 4 8 4s8-1.79 8-4c0-.55-.45-1-1-1H5z"/></svg>',
  },
  {
    id: 'ethiopian',
    name: 'Ethiopian Injera & Pot',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B35"><path d="M12 3a9 9 0 0 0-9 9c0 4.41 3.19 8.08 7.4 8.85l.6 1.15h2l.6-1.15C17.81 20.08 21 16.41 21 12a9 9 0 0 0-9-9zm0 2c3.87 0 7 3.13 7 7 0 1.25-.33 2.43-.9 3.45L12 12 5.9 15.45C5.33 14.43 5 13.25 5 12c0-3.87 3.13-7 7-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 3a9 9 0 0 0-9 9c0 4.41 3.19 8.08 7.4 8.85l.6 1.15h2l.6-1.15C17.81 20.08 21 16.41 21 12a9 9 0 0 0-9-9zm0 2c3.87 0 7 3.13 7 7 0 1.25-.33 2.43-.9 3.45L12 12 5.9 15.45C5.33 14.43 5 13.25 5 12c0-3.87 3.13-7 7-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>',
  },
  {
    id: 'pizza',
    name: 'Pizza Slice',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B35"><path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.77 3.54 15.57 2 12 2zm0 3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-2.5 7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.77 3.54 15.57 2 12 2zm0 3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-2.5 7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></svg>',
  },
  {
    id: 'coffee',
    name: 'Coffee Cup & Steam',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B35"><path d="M4 19h16v2H4v-2zm16-9h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4v-2h2c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2zm-4 5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5h12v10zm4-3h-2v-2h2v2z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M4 19h16v2H4v-2zm16-9h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4v-2h2c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2zm-4 5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5h12v10zm4-3h-2v-2h2v2z"/></svg>',
  },
  {
    id: 'ramen',
    name: 'Ramen & Chopsticks',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B35"><path d="M22 3.5 11 8.8V11h9v1c0 5-4.03 9-9 9s-9-4-9-9v-1h9V8.8L3 4.5l.8-1.8 17.4 2.6.8-1.8zM4 13c.46 3.95 3.86 7 8 7s7.54-3.05 8-7H4z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M22 3.5 11 8.8V11h9v1c0 5-4.03 9-9 9s-9-4-9-9v-1h9V8.8L3 4.5l.8-1.8 17.4 2.6.8-1.8zM4 13c.46 3.95 3.86 7 8 7s7.54-3.05 8-7H4z"/></svg>',
  },
  {
    id: 'cake',
    name: 'Bakery & Cake',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF6B35"><path d="M12 6a2 2 0 0 0 2-2c0-.38-.1-.74-.29-1.05L12 1l-1.71 1.95A1.98 1.98 0 0 0 10 4a2 2 0 0 0 2 2zm6 3h-3V8h-6v1H6c-1.66 0-3 1.34-3 3v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.66-1.34-3-3-3zm1 11H5v-4.03c.6.22 1.28.36 2 .36 1.86 0 3.41-1.02 4.24-2.5.83 1.48 2.38 2.5 4.24 2.5.72 0 1.4-.14 2-.36V20z"/></svg>`,
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 6a2 2 0 0 0 2-2c0-.38-.1-.74-.29-1.05L12 1l-1.71 1.95A1.98 1.98 0 0 0 10 4a2 2 0 0 0 2 2zm6 3h-3V8h-6v1H6c-1.66 0-3 1.34-3 3v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.66-1.34-3-3-3zm1 11H5v-4.03c.6.22 1.28.36 2 .36 1.86 0 3.41-1.02 4.24-2.5.83 1.48 2.38 2.5 4.24 2.5.72 0 1.4-.14 2-.36V20z"/></svg>',
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

export const initialCategories = [
  {
    id: 'a8b1c2d3-1111-4444-8888-000000000001',
    name: 'Artisan Burgers & Sliders',
    slug: 'artisan-burgers-sliders',
    description: 'Fresh ground prime Angus beef patties, toasted brioche buns, and house-made artisan sauces.',
    icon: 'lunch_dining',
    image: PRESET_ICON_ASSETS[0].dataUrl, // Uses custom vector icon image
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(90),
    updated_at: getDynamicOffset(0, 2), // 2 hours ago
  },
  {
    id: 'b9c2d3e4-2222-4444-8888-000000000002',
    name: 'Traditional Ethiopian & Habesha Bites',
    slug: 'traditional-ethiopian-habesha',
    description: 'Authentic injera with doro wat, kitfo, tibs, and flavorful vegetarian shiro combos.',
    icon: 'restaurant',
    image: PRESET_ICON_ASSETS[1].dataUrl, // Uses custom vector icon image
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(120),
    updated_at: getDynamicOffset(1), // 1 day ago
  },
  {
    id: 'c0d3e4f5-3333-4444-8888-000000000003',
    name: 'Wood-Fired Pizza & Pasta',
    slug: 'wood-fired-pizza-pasta',
    description: 'Neapolitan style sourdough crust, San Marzano tomato base, and handmade fresh egg pasta.',
    icon: 'local_pizza',
    image: PRESET_ICON_ASSETS[2].dataUrl, // Uses custom vector icon image
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(150),
    updated_at: getDynamicOffset(3), // 3 days ago
  },
  {
    id: 'd1e4f5a6-4444-4444-8888-000000000004',
    name: 'Specialty Coffee & Roastery',
    slug: 'specialty-coffee-roastery',
    description: 'Single-origin pour-overs and cold brew infusions.',
    icon: 'coffee',
    image: '', // Uses Material Symbol icon
    is_active: true,
    sort_order: 4,
    created_at: getDynamicOffset(180),
    updated_at: getDynamicOffset(7), // 7 days ago
  },
  {
    id: 'e2f5a6b7-5555-4444-8888-000000000005',
    name: 'Asian Wok & Ramen Bowls',
    slug: 'asian-wok-ramen-bowls',
    description: 'Slow-simmered rich tonkotsu broth, hand-pulled noodles, spicy kimchi, and crispy gyoza.',
    icon: 'ramen_dining',
    image: '', // Uses Material Symbol icon
    is_active: true,
    sort_order: 5,
    created_at: getDynamicOffset(210),
    updated_at: getDynamicOffset(14), // 14 days ago
  },
  {
    id: 'f3a6b7c8-6666-4444-8888-000000000006',
    name: 'Pastries, Cakes & Bakery',
    slug: 'pastries-cakes-bakery',
    description: 'Flaky French butter croissants, artisan sourdough loaves, cupcakes, and celebration cakes.',
    icon: 'cake',
    image: '', // Uses Material Symbol icon
    is_active: true,
    sort_order: 6,
    created_at: getDynamicOffset(240),
    updated_at: getDynamicOffset(32), // 1 month ago
  },
  {
    id: 'a4b7c8d9-7777-4444-8888-000000000007',
    name: 'Fresh Greens & Protein Bowls',
    slug: 'fresh-greens-protein-bowls',
    description: 'Organic grain bowls, Mediterranean salads, grilled halloumi, and cold-pressed wellness juices.',
    icon: 'nutrition',
    image: '',
    is_active: true,
    sort_order: 7,
    created_at: getDynamicOffset(300),
    updated_at: getDynamicOffset(95), // 3 months ago
  },
  {
    id: 'b5c8d9e0-8888-4444-8888-000000000008',
    name: 'Craft Mocktails & Refreshers',
    slug: 'craft-mocktails-refreshers',
    description: 'Botanical fizzes and iced coolers.',
    icon: 'local_bar',
    image: '',
    is_active: false,
    sort_order: 8,
    created_at: getDynamicOffset(400),
    updated_at: getDynamicOffset(240), // 8 months ago
  },
  {
    id: 'c6d9e0f1-9999-4444-8888-000000000009',
    name: 'Gourmet Seafood & Grill',
    slug: 'gourmet-seafood-grill',
    description: 'Wild-caught salmon fillets, garlic herb king prawns, and smoked ocean delicacies.',
    icon: 'set_meal',
    image: '',
    is_active: true,
    sort_order: 9,
    created_at: getDynamicOffset(750),
    updated_at: getDynamicOffset(390), // 1 year ago
  },
  {
    id: 'd7e0f1a2-0000-4444-8888-000000000010',
    name: 'Seasonal Holiday Specials',
    slug: 'seasonal-holiday-specials',
    description: 'Limited edition festive family feasts, seasonal roasts, and holiday dessert platters.',
    icon: 'celebration',
    image: '',
    is_active: false,
    sort_order: 10,
    created_at: getDynamicOffset(5), // Created 5 days ago, never updated
    updated_at: null,
  },
]

export const loadStoredCategories = () => {
  if (typeof window === 'undefined') return initialCategories
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mapInitial = new Map(initialCategories.map((c) => [c.id, c]))
        const refreshed = parsed.map((cat) => {
          const seed = mapInitial.get(cat.id)
          if (seed) {
            // Keep user updates, but sync seed descriptions for demonstrative short/large variety if default
            if (
              cat.id === 'd1e4f5a6-4444-4444-8888-000000000004' ||
              cat.id === 'b5c8d9e0-8888-4444-8888-000000000008'
            ) {
              return { ...cat, description: seed.description }
            }
            if (cat.updated_at?.startsWith('2024-')) {
              return { ...cat, created_at: seed.created_at, updated_at: seed.updated_at }
            }
          }
          return cat
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed))
        return refreshed
      }
    }
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
