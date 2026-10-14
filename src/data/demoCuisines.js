/**
 * Demo CuisineType Seed Data adhering to the CuisineType schema:
 * uuid id PK
 * uuid category_id FK
 * string name
 * string slug UK
 * string description
 * string icon
 * boolean is_active
 * int sort_order
 * timestamp created_at
 * timestamp updated_at
 */

const STORAGE_KEY = 'deliver_app_cuisines_data'

const getDynamicOffset = (days, hours = 0) => {
  return new Date(Date.now() - (days * 86400000 + hours * 3600000)).toISOString()
}

export const PRESET_CUISINE_ICON_ASSETS = [
  {
    id: 'burger',
    name: 'Burger & Sliders',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C7.58 2 4 4.79 4 8.2h16C20 4.79 16.42 2 12 2zm-8 8.8v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1H4zm1 4c-.55 0-1 .45-1 1 0 2.21 3.58 4 8 4s8-1.79 8-4c0-.55-.45-1-1-1H5z"/></svg>',
  },
  {
    id: 'habesha',
    name: 'Ethiopian & Habesha',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 3a9 9 0 0 0-9 9c0 4.41 3.19 8.08 7.4 8.85l.6 1.15h2l.6-1.15C17.81 20.08 21 16.41 21 12a9 9 0 0 0-9-9zm0 2c3.87 0 7 3.13 7 7 0 1.25-.33 2.43-.9 3.45L12 12 5.9 15.45C5.33 14.43 5 13.25 5 12c0-3.87 3.13-7 7-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>',
  },
  {
    id: 'pizza',
    name: 'Pizza & Pasta',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.77 3.54 15.57 2 12 2zm0 3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-2.5 7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></svg>',
  },
  {
    id: 'coffee',
    name: 'Coffee & Roastery',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M4 19h16v2H4v-2zm16-9h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4v-2h2c1.1 0 2-.9 2-2v-1c0-1.1-.9-2-2-2zm-4 5c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5h12v10zm4-3h-2v-2h2v2z"/></svg>',
  },
  {
    id: 'ramen',
    name: 'Ramen & Noodles',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M22 3.5 11 8.8V11h9v1c0 5-4.03 9-9 9s-9-4-9-9v-1h9V8.8L3 4.5l.8-1.8 17.4 2.6.8-1.8zM4 13c.46 3.95 3.86 7 8 7s7.54-3.05 8-7H4z"/></svg>',
  },
  {
    id: 'bakery',
    name: 'Pastries & Bakery',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 6a2 2 0 0 0 2-2c0-.38-.1-.74-.29-1.05L12 1l-1.71 1.95A1.98 1.98 0 0 0 10 4a2 2 0 0 0 2 2zm6 3h-3V8h-6v1H6c-1.66 0-3 1.34-3 3v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8c0-1.66-1.34-3-3-3zm1 11H5v-4.03c.6.22 1.28.36 2 .36 1.86 0 3.41-1.02 4.24-2.5.83 1.48 2.38 2.5 4.24 2.5.72 0 1.4-.14 2-.36V20z"/></svg>',
  },
  {
    id: 'salad',
    name: 'Fresh Greens & Bowls',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z"/></svg>',
  },
  {
    id: 'seafood',
    name: 'Seafood & Grill',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M2 12c4 1 7-2 10-2s6 3 10 2c-4-1-7 2-10 2s-6-3-10-2zm19.5-3.5C18.5 4 14 3 12 3S5.5 4 2.5 8.5C4 10 7 11 12 11s8-1 9.5-2.5z"/></svg>',
  },
  {
    id: 'beverage',
    name: 'Craft Drinks & Mocktails',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M21 5V3H3v2l8 9v5H6v2h12v-2h-5v-5l8-9zM7.43 7 5.66 5h12.69l-1.78 2H7.43z"/></svg>',
  },
  {
    id: 'dessert',
    name: 'Desserts & Ice Cream',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C8.69 2 6 4.69 6 8c0 1.28.4 2.47 1.09 3.45L12 22l4.91-10.55C17.6 10.47 18 9.28 18 8c0-3.31-2.69-6-6-6zm0 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
  },
]

export const initialCuisines = [
  // Under Category 1: Artisan Burgers & Sliders (a8b1c2d3-1111-4444-8888-000000000001)
  {
    id: '10000001-aaaa-4444-9999-000000000001',
    category_id: 'a8b1c2d3-1111-4444-8888-000000000001',
    name: 'Gourmet Angus Smashburgers',
    slug: 'gourmet-angus-smashburgers',
    description: 'Crispy caramelized-edge double smashed Angus beef patties with aged cheddar, caramelized onions, and secret relish.',
    icon: 'lunch_dining',
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(80),
    updated_at: getDynamicOffset(0, 3), // 3 hours ago
  },
  {
    id: '10000002-aaaa-4444-9999-000000000002',
    category_id: 'a8b1c2d3-1111-4444-8888-000000000001',
    name: 'Crispy Buttermilk Chicken Sliders',
    slug: 'crispy-buttermilk-chicken-sliders',
    description: '24-hour marinated fried chicken thighs coated in honey sriracha glaze served on mini toasted milk brioche.',
    icon: 'egg_alt',
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(85),
    updated_at: getDynamicOffset(1), // 1 day ago
  },
  {
    id: '10000003-aaaa-4444-9999-000000000003',
    category_id: 'a8b1c2d3-1111-4444-8888-000000000001',
    name: 'Plant-Based Truffle Burgers',
    slug: 'plant-based-truffle-burgers',
    description: 'Charred pea protein with black truffle aioli.',
    icon: 'nutrition',
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(90),
    updated_at: getDynamicOffset(4), // 4 days ago
  },

  // Under Category 2: Traditional Ethiopian & Habesha Bites (b9c2d3e4-2222-4444-8888-000000000002)
  {
    id: '20000001-bbbb-4444-9999-000000000001',
    category_id: 'b9c2d3e4-2222-4444-8888-000000000002',
    name: 'Habesha Wats & Stews',
    slug: 'habesha-wats-stews',
    description: 'Slow-simmered doro wat with hardboiled eggs, spicy sega wat, and fragrant key wot cooked with clarified spiced butter (niter kibbeh).',
    icon: 'soup_kitchen',
    is_active: true,
    sort_order: 4,
    created_at: getDynamicOffset(110),
    updated_at: getDynamicOffset(2), // 2 days ago
  },
  {
    id: '20000002-bbbb-4444-9999-000000000002',
    category_id: 'b9c2d3e4-2222-4444-8888-000000000002',
    name: 'Sizzling Meat & Tibs Platters',
    slug: 'sizzling-meat-tibs-platters',
    description: 'Hot clay dish (shekla) tibs with tender beef, rosemary sprigs, jalapeños, garlic, and fresh teff injera rolls.',
    icon: 'restaurant',
    is_active: true,
    sort_order: 5,
    created_at: getDynamicOffset(115),
    updated_at: getDynamicOffset(6), // 6 days ago
  },
  {
    id: '20000003-bbbb-4444-9999-000000000003',
    category_id: 'b9c2d3e4-2222-4444-8888-000000000002',
    name: 'Fasting & Vegan Combos (Beyaynetu)',
    slug: 'fasting-vegan-combos-beyaynetu',
    description: 'Color-packed vegan banquet featuring shiro tegabino, misir wat, gomen, atkilt wat, and fresh timatim salata.',
    icon: 'eco',
    is_active: true,
    sort_order: 6,
    created_at: getDynamicOffset(120),
    updated_at: getDynamicOffset(12), // 12 days ago
  },
  {
    id: '20000004-bbbb-4444-9999-000000000004',
    category_id: 'b9c2d3e4-2222-4444-8888-000000000002',
    name: 'Traditional Kitfo & Dulet Delights',
    slug: 'traditional-kitfo-dulet-delights',
    description: 'Finely minced prime lean beef warmed in spiced mitmita and niter kibbeh, served with kocho and ayib cottage cheese.',
    icon: 'room_service',
    is_active: true,
    sort_order: 7,
    created_at: getDynamicOffset(130),
    updated_at: getDynamicOffset(20), // 20 days ago
  },

  // Under Category 3: Wood-Fired Pizza & Pasta (c0d3e4f5-3333-4444-8888-000000000003)
  {
    id: '30000001-cccc-4444-9999-000000000001',
    category_id: 'c0d3e4f5-3333-4444-8888-000000000003',
    name: 'Artisan Neapolitan Pizzas',
    slug: 'artisan-neapolitan-pizzas',
    description: 'Blistered crust baked at 900°F with fresh fior di latte mozzarella, basil leaves, and cold-pressed extra virgin olive oil.',
    icon: 'local_pizza',
    is_active: true,
    sort_order: 8,
    created_at: getDynamicOffset(140),
    updated_at: getDynamicOffset(35), // 1 month ago
  },
  {
    id: '30000002-cccc-4444-9999-000000000002',
    category_id: 'c0d3e4f5-3333-4444-8888-000000000003',
    name: 'Handmade Tagliatelle & Gnocchi',
    slug: 'handmade-tagliatelle-gnocchi',
    description: 'Bronze-die cut pasta ribbons tossed in slow-braised bolognese ragù, wild truffles, and aged Parmigiano Reggiano.',
    icon: 'dinner_dining',
    is_active: true,
    sort_order: 9,
    created_at: getDynamicOffset(145),
    updated_at: getDynamicOffset(45), // 1 month ago
  },

  // Under Category 4: Specialty Coffee & Roastery (d1e4f5a6-4444-4444-8888-000000000004)
  {
    id: '40000001-dddd-4444-9999-000000000001',
    category_id: 'd1e4f5a6-4444-4444-8888-000000000004',
    name: 'Single-Origin Ethiopian Pour-Overs',
    slug: 'single-origin-ethiopian-pour-overs',
    description: 'Light roast floral and citrus notes from Sidama, Guji, and Yirgacheffe regions brewed via V60 and Chemex.',
    icon: 'coffee',
    is_active: true,
    sort_order: 10,
    created_at: getDynamicOffset(170),
    updated_at: getDynamicOffset(65), // 2 months ago
  },
  {
    id: '40000002-dddd-4444-9999-000000000002',
    category_id: 'd1e4f5a6-4444-4444-8888-000000000004',
    name: 'Artisanal Espresso & Flat Whites',
    slug: 'artisanal-espresso-flat-whites',
    description: 'Velvety micro-foamed organic oat and dairy milk poured over double ristretto extraction.',
    icon: 'local_cafe',
    is_active: true,
    sort_order: 11,
    created_at: getDynamicOffset(175),
    updated_at: getDynamicOffset(80), // 2 months ago
  },

  // Under Category 5: Asian Wok & Ramen Bowls (e2f5a6b7-5555-4444-8888-000000000005)
  {
    id: '50000001-eeee-4444-9999-000000000001',
    category_id: 'e2f5a6b7-5555-4444-8888-000000000005',
    name: 'Rich Tonkotsu & Miso Ramen',
    slug: 'rich-tonkotsu-miso-ramen',
    description: '18-hour slow-cooked pork marrow broth with springy curly noodles, torched chashu pork, and molten ajitsuke tamago.',
    icon: 'ramen_dining',
    is_active: true,
    sort_order: 12,
    created_at: getDynamicOffset(200),
    updated_at: getDynamicOffset(110), // 3 months ago
  },
  {
    id: '50000002-eeee-4444-9999-000000000002',
    category_id: 'e2f5a6b7-5555-4444-8888-000000000005',
    name: 'Szechuan Fire Wok & Chow Mein',
    slug: 'szechuan-fire-wok-chow-mein',
    description: 'Wok-tossed noodles with crispy duck, numbing red peppercorns, scallions, and toasted sesame oil.',
    icon: 'whatshot',
    is_active: true,
    sort_order: 13,
    created_at: getDynamicOffset(205),
    updated_at: getDynamicOffset(130), // 4 months ago
  },

  // Under Category 6: Pastries, Cakes & Bakery (f3a6b7c8-6666-4444-8888-000000000006)
  {
    id: '60000001-ffff-4444-9999-000000000001',
    category_id: 'f3a6b7c8-6666-4444-8888-000000000006',
    name: 'French Croissants & Danish Pastries',
    slug: 'french-croissants-danish-pastries',
    description: 'Multi-layered laminated pastry with Isigny butter, Valrhona dark chocolate batons, and roasted almond frangipane.',
    icon: 'bakery_dining',
    is_active: true,
    sort_order: 14,
    created_at: getDynamicOffset(230),
    updated_at: getDynamicOffset(180), // 6 months ago
  },
  {
    id: '60000002-ffff-4444-9999-000000000002',
    category_id: 'f3a6b7c8-6666-4444-8888-000000000006',
    name: 'Bespoke Celebration Cakes & Tarts',
    slug: 'bespoke-celebration-cakes-tarts',
    description: 'Tiered red velvet, Sicilian lemon curd meringue tarts, and Madagascar vanilla bean layer cakes.',
    icon: 'cake',
    is_active: true,
    sort_order: 15,
    created_at: getDynamicOffset(235),
    updated_at: getDynamicOffset(210), // 7 months ago
  },

  // Under Category 7: Fresh Greens & Protein Bowls (a4b7c8d9-7777-4444-8888-000000000007)
  {
    id: '70000001-0000-4444-9999-000000000001',
    category_id: 'a4b7c8d9-7777-4444-8888-000000000007',
    name: 'Macro Mediterranean Quinoa Bowls',
    slug: 'macro-mediterranean-quinoa-bowls',
    description: 'Herbed organic quinoa, kalamata olives, marinated feta cubes, sun-dried tomatoes, and lemon tahini dressing.',
    icon: 'spa',
    is_active: true,
    sort_order: 16,
    created_at: getDynamicOffset(290),
    updated_at: getDynamicOffset(260), // 8 months ago
  },

  // Under Category 9: Gourmet Seafood & Grill (c6d9e0f1-9999-4444-8888-000000000009)
  {
    id: '90000001-1111-4444-9999-000000000001',
    category_id: 'c6d9e0f1-9999-4444-8888-000000000009',
    name: 'Charcoal Grilled Ocean Salmon & Prawns',
    slug: 'charcoal-grilled-ocean-salmon-prawns',
    description: 'Skewered jumbo tiger prawns and Atlantic salmon fillets glazed with dill garlic butter and char-grilled lemons.',
    icon: 'set_meal',
    is_active: true,
    sort_order: 17,
    created_at: getDynamicOffset(700),
    updated_at: getDynamicOffset(380), // 1 year ago
  },

  // Under Category 10: Seasonal Holiday Specials (d7e0f1a2-0000-4444-8888-000000000010)
  {
    id: '00000001-2222-4444-9999-000000000001',
    category_id: 'd7e0f1a2-0000-4444-8888-000000000010',
    name: 'Festive Holiday Roast Carvery',
    slug: 'festive-holiday-roast-carvery',
    description: 'Herb butter basted whole roasted turkey with rosemary stuffing, cranberry orange sauce, and gravy.',
    icon: 'celebration',
    is_active: false,
    sort_order: 18,
    created_at: getDynamicOffset(4), // Created 4 days ago, never updated
    updated_at: null,
  },
]

export const loadStoredCuisines = () => {
  if (typeof window === 'undefined') return initialCuisines
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mapInitial = new Map(initialCuisines.map((c) => [c.id, c]))

        const refreshed = parsed.map((cuisine, idx) => {
          const seed = mapInitial.get(cuisine.id)
          let defaultImg = cuisine.image || (seed ? seed.image : '')
          if (!defaultImg) {
            const ico = (cuisine.icon || (seed ? seed.icon : '')).toLowerCase()
            if (ico.includes('burger') || ico.includes('lunch')) defaultImg = PRESET_CUISINE_ICON_ASSETS[0].dataUrl
            else if (ico.includes('soup') || ico.includes('wat') || ico.includes('habesha')) defaultImg = PRESET_CUISINE_ICON_ASSETS[1].dataUrl
            else if (ico.includes('pizza')) defaultImg = PRESET_CUISINE_ICON_ASSETS[2].dataUrl
            else if (ico.includes('coffee') || ico.includes('cafe')) defaultImg = PRESET_CUISINE_ICON_ASSETS[3].dataUrl
            else if (ico.includes('ramen') || ico.includes('noodle')) defaultImg = PRESET_CUISINE_ICON_ASSETS[4].dataUrl
            else if (ico.includes('cake') || ico.includes('bakery')) defaultImg = PRESET_CUISINE_ICON_ASSETS[5].dataUrl
            else if (ico.includes('nutrition') || ico.includes('eco') || ico.includes('salad')) defaultImg = PRESET_CUISINE_ICON_ASSETS[6].dataUrl
            else if (ico.includes('set_meal') || ico.includes('fish')) defaultImg = PRESET_CUISINE_ICON_ASSETS[7].dataUrl
            else if (ico.includes('bar') || ico.includes('drink')) defaultImg = PRESET_CUISINE_ICON_ASSETS[8].dataUrl
            else defaultImg = PRESET_CUISINE_ICON_ASSETS[0].dataUrl
          }
          return {
            ...cuisine,
            image: defaultImg,
            sort_order: cuisine.sort_order || (seed ? seed.sort_order : idx + 1),
            created_at: seed && cuisine.updated_at?.startsWith('2024-') ? seed.created_at : cuisine.created_at,
            updated_at: seed && cuisine.updated_at?.startsWith('2024-') ? seed.updated_at : cuisine.updated_at,
          }
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(refreshed))
        return refreshed
      }
    }
  } catch (e) {
    console.error('Failed to load stored cuisines:', e)
  }
  return initialCuisines.map((c) => {
    let img = c.image
    if (!img) {
      const ico = (c.icon || '').toLowerCase()
      if (ico.includes('burger') || ico.includes('lunch')) img = PRESET_CUISINE_ICON_ASSETS[0].dataUrl
      else if (ico.includes('soup') || ico.includes('wat') || ico.includes('habesha')) img = PRESET_CUISINE_ICON_ASSETS[1].dataUrl
      else if (ico.includes('pizza')) img = PRESET_CUISINE_ICON_ASSETS[2].dataUrl
      else if (ico.includes('coffee') || ico.includes('cafe')) img = PRESET_CUISINE_ICON_ASSETS[3].dataUrl
      else if (ico.includes('ramen') || ico.includes('noodle')) img = PRESET_CUISINE_ICON_ASSETS[4].dataUrl
      else if (ico.includes('cake') || ico.includes('bakery')) img = PRESET_CUISINE_ICON_ASSETS[5].dataUrl
      else if (ico.includes('nutrition') || ico.includes('eco') || ico.includes('salad')) img = PRESET_CUISINE_ICON_ASSETS[6].dataUrl
      else if (ico.includes('set_meal') || ico.includes('fish')) img = PRESET_CUISINE_ICON_ASSETS[7].dataUrl
      else if (ico.includes('bar') || ico.includes('drink')) img = PRESET_CUISINE_ICON_ASSETS[8].dataUrl
      else img = PRESET_CUISINE_ICON_ASSETS[0].dataUrl
    }
    return { ...c, image: img }
  })
}

export const saveStoredCuisines = (cuisines) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cuisines))
  } catch (e) {
    console.error('Failed to save cuisines to storage:', e)
  }
}

export const resetStoredCuisines = () => {
  if (typeof window === 'undefined') return initialCuisines
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to reset cuisines:', e)
  }
  return initialCuisines
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
