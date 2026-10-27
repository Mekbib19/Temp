/**
 * CuisineType (Specialization Types) Data adhering to the schema:
 * uuid id PK
 * uuid category_id FK (References category id)
 * string category_code (FOOD, GROCERY, PHARMACY, RETAIL, FLOWERS_GIFTS, SERVICES, PACKAGE)
 * string name
 * string slug UK
 * string description
 * string icon (Material symbol name)
 * string image (Optional custom icon image or dataUrl)
 * boolean is_active
 * int sort_order
 * timestamp created_at
 * timestamp updated_at
 *
 * "Specialization types for merchants within each category. This table is category-specific and allows merchants to define their specializations."
 */

export const STORAGE_KEY = 'deliver_app_cuisines_v2'

const getDynamicOffset = (days, hours = 0) => {
  return new Date(Date.now() - (days * 86400000 + hours * 3600000)).toISOString()
}

// Fixed Category UUIDs matching demoCategories.js
export const CATEGORY_IDS = {
  FOOD: 'cat-food-1111-4444-8888-000000000001',
  GROCERY: 'cat-groc-2222-4444-8888-000000000002',
  PHARMACY: 'cat-phar-3333-4444-8888-000000000003',
  RETAIL: 'cat-retl-4444-4444-8888-000000000004',
  FLOWERS_GIFTS: 'cat-flow-5555-4444-8888-000000000005',
  SERVICES: 'cat-serv-6666-4444-8888-000000000006',
  PACKAGE: 'cat-pack-7777-4444-8888-000000000007',
}

export const PRESET_CUISINE_ICON_ASSETS = [
  {
    id: 'ethiopian',
    name: 'Ethiopian & Habesha',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 3a9 9 0 0 0-9 9c0 4.41 3.19 8.08 7.4 8.85l.6 1.15h2l.6-1.15C17.81 20.08 21 16.41 21 12a9 9 0 0 0-9-9zm0 2c3.87 0 7 3.13 7 7 0 1.25-.33 2.43-.9 3.45L12 12 5.9 15.45C5.33 14.43 5 13.25 5 12c0-3.87 3.13-7 7-7zm0 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>',
  },
  {
    id: 'italian',
    name: 'Italian & Mediterranean',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.77 3.54 15.57 2 12 2zm0 3.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-2.5 7c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm5 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z"/></svg>',
  },
  {
    id: 'chinese',
    name: 'Chinese & Asian Wok',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M22 3.5 11 8.8V11h9v1c0 5-4.03 9-9 9s-9-4-9-9v-1h9V8.8L3 4.5l.8-1.8 17.4 2.6.8-1.8zM4 13c.46 3.95 3.86 7 8 7s7.54-3.05 8-7H4z"/></svg>',
  },
  {
    id: 'indian',
    name: 'Indian & Curry',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19h15.3l-.62-1.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm0 2c3.87 0 7 3.13 7 7 0 1.58-.53 3.04-1.42 4.22L12 12 6.42 16.22C5.53 15.04 5 13.58 5 12c0-3.87 3.13-7 7-7z"/></svg>',
  },
  {
    id: 'fast_food',
    name: 'Fast Food & Burgers',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF6B35"><path d="M12 2C7.58 2 4 4.79 4 8.2h16C20 4.79 16.42 2 12 2zm-8 8.8v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1H4zm1 4c-.55 0-1 .45-1 1 0 2.21 3.58 4 8 4s8-1.79 8-4c0-.55-.45-1-1-1H5z"/></svg>',
  },
  {
    id: 'organic',
    name: 'Organic & Clean',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310B981"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5c0 3.14 2.1 5.69 5 6.36C8.8 14.54 12 11 17 8z"/></svg>',
  },
  {
    id: 'local_produce',
    name: 'Local Farm Produce',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310B981"><path d="M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h16zM4 12h16v8c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-8z"/></svg>',
  },
  {
    id: 'prescription',
    name: 'Prescription Medicine',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230284C7"><path d="M6 3h12v2H6zm5 3h2v4h4v2h-4v4h-2v-4H7v-2h4zm-6 9h14v2H5zm0 3h14v2H5z"/></svg>',
  },
  {
    id: 'electronics',
    name: 'Electronics & Tech',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239333EA"><path d="M4 6h16v10H4zm14 12H6v-1h12v1zm2-14H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>',
  },
  {
    id: 'bouquets',
    name: 'Floral Bouquets',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23EC4899"><path d="M12 2C8.69 2 6 4.69 6 8c0 1.28.4 2.47 1.09 3.45L12 22l4.91-10.55C17.6 10.47 18 9.28 18 8c0-3.31-2.69-6-6-6zm0 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/></svg>',
  },
  {
    id: 'cleaning',
    name: 'Cleaning & Sanitization',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D97706"><path d="M19.36 10.04l-2.4-2.4-1.42 1.42 2.4 2.4 1.42-1.42zm-3.82-3.82l-2.4-2.4-1.42 1.42 2.4 2.4 1.42-1.42zM15.54 13.86l-2.4-2.4-9.9 9.9c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l9.9-9.9-1.41-1.41 2.4 2.4z"/></svg>',
  },
  {
    id: 'standard_courier',
    name: 'Standard Package',
    dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234F46E5"><path d="M20 7l-8-4-8 4 8 4 8-4zm-8 6l-7-3.5V17l7 3.5 7-3.5v-7.5L12 13z"/></svg>',
  },
]

// Category-specific specialization types (cuisine_types) exactly per specification
export const initialCuisines = [
  // ==========================================
  // Category: FOOD
  // Examples: Ethiopian, Italian, Chinese, Indian, Fast Food
  // ==========================================
  {
    id: 'cs-food-0001',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Ethiopian',
    slug: 'ethiopian',
    description: 'Traditional Habesha cuisine featuring injera, doro wat, kitfo, beef tibs, and vegetarian shiro combos.',
    icon: 'restaurant',
    image: PRESET_CUISINE_ICON_ASSETS[0].dataUrl,
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(90),
    updated_at: getDynamicOffset(0, 2),
  },
  {
    id: 'cs-food-0002',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Italian',
    slug: 'italian',
    description: 'Wood-fired sourdough pizzas, fresh handmade pasta, creamy risottos, and authentic antipasti.',
    icon: 'local_pizza',
    image: PRESET_CUISINE_ICON_ASSETS[1].dataUrl,
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(88),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'cs-food-0003',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Chinese',
    slug: 'chinese',
    description: 'Wok-tossed delicacies, Cantonese dim sum, hand-pulled noodles, dumplings, and Szechuan specialties.',
    icon: 'ramen_dining',
    image: PRESET_CUISINE_ICON_ASSETS[2].dataUrl,
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(85),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'cs-food-0004',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Indian',
    slug: 'indian',
    description: 'Fragrant aromatic curries, tandoori grills, royal biryanis, fresh tandoor naans, and rich samosas.',
    icon: 'soup_kitchen',
    image: PRESET_CUISINE_ICON_ASSETS[3].dataUrl,
    is_active: true,
    sort_order: 4,
    created_at: getDynamicOffset(80),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'cs-food-0005',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Fast Food',
    slug: 'fast-food',
    description: 'Caramelized smashed Angus burgers, crispy golden fried chicken, loaded fries, hot dogs, and milkshakes.',
    icon: 'lunch_dining',
    image: PRESET_CUISINE_ICON_ASSETS[4].dataUrl,
    is_active: true,
    sort_order: 5,
    created_at: getDynamicOffset(75),
    updated_at: getDynamicOffset(4),
  },

  // ==========================================
  // Category: GROCERY
  // Examples: Organic, Local Produce, International, Bulk
  // ==========================================
  {
    id: 'cs-groc-0001',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Organic',
    slug: 'organic',
    description: '100% certified organic vegetables, pesticide-free fruits, non-GMO pantry foods, and pasture-raised dairy.',
    icon: 'eco',
    image: PRESET_CUISINE_ICON_ASSETS[5].dataUrl,
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(90),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'cs-groc-0002',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Local Produce',
    slug: 'local-produce',
    description: 'Direct-from-farm seasonal greens, fresh local eggs, artisanal cheeses, honey, and harvested produce.',
    icon: 'agriculture',
    image: PRESET_CUISINE_ICON_ASSETS[6].dataUrl,
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(86),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'cs-groc-0003',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'International',
    slug: 'international',
    description: 'Imported specialty groceries, global seasonings, authentic condiments, European and Asian pantry goods.',
    icon: 'public',
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(82),
    updated_at: getDynamicOffset(4),
  },
  {
    id: 'cs-groc-0004',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Bulk Goods & Teff',
    slug: 'bulk-teff',
    description: 'Wholesale grains, pulses, Ethiopian highland teff, legumes, flours, and zero-waste pantry refills.',
    icon: 'inventory_2',
    is_active: true,
    sort_order: 4,
    created_at: getDynamicOffset(78),
    updated_at: getDynamicOffset(5),
  },
  {
    id: 'cs-groc-0005',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Farmstead Dairy & Cheese',
    slug: 'dairy-cheese',
    description: 'Refrigerated artisan cheeses, cultured butter, raw highland milk, kefir, and fresh cottage ayib.',
    icon: 'egg',
    is_active: true,
    sort_order: 5,
    created_at: getDynamicOffset(72),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'cs-groc-0006',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Butcher & Deli Cuts',
    slug: 'butcher-cuts',
    description: 'Fresh hygienic halal cuts, prime aged beef, minced steak for kitfo, and poultry cold cuts.',
    icon: 'set_meal',
    is_active: true,
    sort_order: 6,
    created_at: getDynamicOffset(70),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'cs-groc-0007',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Fresh Bakery & Pantry',
    slug: 'bakery-pantry',
    description: 'Daily fresh sourdough bread, pita, breakfast buns, olive oils, and staple family food items.',
    icon: 'bakery_dining',
    is_active: true,
    sort_order: 7,
    created_at: getDynamicOffset(68),
    updated_at: getDynamicOffset(1),
  },

  // ==========================================
  // Category: PHARMACY
  // Examples: Prescription, Over-the-Counter, Natural Health
  // ==========================================
  {
    id: 'cs-phar-0001',
    category_id: CATEGORY_IDS.PHARMACY,
    category_code: 'PHARMACY',
    name: 'Prescription',
    slug: 'prescription',
    description: 'Licensed prescription drug dispensing, medication refills, dosage coordination, and pharmacy consults.',
    icon: 'prescriptions',
    image: PRESET_CUISINE_ICON_ASSETS[7].dataUrl,
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(88),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'cs-phar-0002',
    category_id: CATEGORY_IDS.PHARMACY,
    category_code: 'PHARMACY',
    name: 'Over-the-Counter',
    slug: 'over-the-counter',
    description: 'Non-prescription medicines, pain management, digestive remedies, cold & flu relief, and first aid kits.',
    icon: 'medication',
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(85),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'cs-phar-0003',
    category_id: CATEGORY_IDS.PHARMACY,
    category_code: 'PHARMACY',
    name: 'Natural Health',
    slug: 'natural-health',
    description: 'Holistic wellness remedies, multivitamin complexes, herbal tonics, probiotics, and clean supplements.',
    icon: 'vital_signs',
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(80),
    updated_at: getDynamicOffset(3),
  },

  // ==========================================
  // Category: RETAIL
  // Examples: Electronics, Fashion, Home & Garden, Sports
  // ==========================================
  {
    id: 'cs-retl-0001',
    category_id: CATEGORY_IDS.RETAIL,
    category_code: 'RETAIL',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Smartphones, audio gear, wireless chargers, computing accessories, smart watches, and home tech.',
    icon: 'devices',
    image: PRESET_CUISINE_ICON_ASSETS[8].dataUrl,
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(85),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'cs-retl-0002',
    category_id: CATEGORY_IDS.RETAIL,
    category_code: 'RETAIL',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Designer apparel, casual streetwear, seasonal footwear, jewelry, leather goods, and fashion accessories.',
    icon: 'apparel',
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(82),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'cs-retl-0003',
    category_id: CATEGORY_IDS.RETAIL,
    category_code: 'RETAIL',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Kitchenware, decorative home furnishings, bedroom linens, indoor lighting, and garden tools.',
    icon: 'yard',
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(78),
    updated_at: getDynamicOffset(4),
  },
  {
    id: 'cs-retl-0004',
    category_id: CATEGORY_IDS.RETAIL,
    category_code: 'RETAIL',
    name: 'Sports',
    slug: 'sports',
    description: 'Athletic wear, workout gear, weights, yoga essentials, balls, cycling gear, and sports hydration.',
    icon: 'sports_soccer',
    is_active: true,
    sort_order: 4,
    created_at: getDynamicOffset(74),
    updated_at: getDynamicOffset(5),
  },

  // ==========================================
  // Category: FLOWERS_GIFTS
  // Examples: Bouquets, Plants, Arrangements, Gifts
  // ==========================================
  {
    id: 'cs-flow-0001',
    category_id: CATEGORY_IDS.FLOWERS_GIFTS,
    category_code: 'FLOWERS_GIFTS',
    name: 'Bouquets',
    slug: 'bouquets',
    description: 'Fresh long-stem roses, seasonal wildflower bouquets, hand-tied posies, and anniversary flowers.',
    icon: 'local_florist',
    image: PRESET_CUISINE_ICON_ASSETS[9].dataUrl,
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(80),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'cs-flow-0002',
    category_id: CATEGORY_IDS.FLOWERS_GIFTS,
    category_code: 'FLOWERS_GIFTS',
    name: 'Plants',
    slug: 'plants',
    description: 'Living potted house plants, low-maintenance succulents, air-purifying foliage, and ceramic planters.',
    icon: 'potted_plant',
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(77),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'cs-flow-0003',
    category_id: CATEGORY_IDS.FLOWERS_GIFTS,
    category_code: 'FLOWERS_GIFTS',
    name: 'Arrangements',
    slug: 'arrangements',
    description: 'Bespoke event floral centerpieces, wedding flower decor, celebration arches, and sympathy wreaths.',
    icon: 'filter_vintage',
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(73),
    updated_at: getDynamicOffset(4),
  },
  {
    id: 'cs-flow-0004',
    category_id: CATEGORY_IDS.FLOWERS_GIFTS,
    category_code: 'FLOWERS_GIFTS',
    name: 'Gifts',
    slug: 'gifts',
    description: 'Artisanal gift hampers, celebration chocolates, scented candles, plush toys, and custom gift wrapping.',
    icon: 'featured_seasonal_and_gifts',
    is_active: true,
    sort_order: 4,
    created_at: getDynamicOffset(70),
    updated_at: getDynamicOffset(5),
  },

  // ==========================================
  // Category: SERVICES
  // Examples: Cleaning, Maintenance, Professional, Consulting
  // ==========================================
  {
    id: 'cs-serv-0001',
    category_id: CATEGORY_IDS.SERVICES,
    category_code: 'SERVICES',
    name: 'Cleaning',
    slug: 'cleaning',
    description: 'Residential housekeeping, deep cleaning, commercial office sanitization, carpet washing, and move-in prep.',
    icon: 'cleaning_services',
    image: PRESET_CUISINE_ICON_ASSETS[10].dataUrl,
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(78),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'cs-serv-0002',
    category_id: CATEGORY_IDS.SERVICES,
    category_code: 'SERVICES',
    name: 'Maintenance',
    slug: 'maintenance',
    description: 'Certified plumbing, electrical wiring repairs, appliance diagnostics, carpentry, and handyman repairs.',
    icon: 'build',
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(75),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'cs-serv-0003',
    category_id: CATEGORY_IDS.SERVICES,
    category_code: 'SERVICES',
    name: 'Professional',
    slug: 'professional',
    description: 'Certified public accounting, legal drafting, certified translations, notary public, and documentation.',
    icon: 'clinical_notes',
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(71),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'cs-serv-0004',
    category_id: CATEGORY_IDS.SERVICES,
    category_code: 'SERVICES',
    name: 'Consulting',
    slug: 'consulting',
    description: 'Strategic management consulting, technology advisory, brand marketing strategy, and workflow optimization.',
    icon: 'psychology',
    is_active: true,
    sort_order: 4,
    created_at: getDynamicOffset(67),
    updated_at: getDynamicOffset(4),
  },

  // ==========================================
  // Category: PACKAGE
  // Examples: Standard, Express, International, Fragile
  // ==========================================
  {
    id: 'cs-pack-0001',
    category_id: CATEGORY_IDS.PACKAGE,
    category_code: 'PACKAGE',
    name: 'Standard',
    slug: 'standard',
    description: 'Dependable everyday courier parcel delivery, scheduled envelope dispatch, and route shipping.',
    icon: 'local_shipping',
    image: PRESET_CUISINE_ICON_ASSETS[11].dataUrl,
    is_active: true,
    sort_order: 1,
    created_at: getDynamicOffset(75),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'cs-pack-0002',
    category_id: CATEGORY_IDS.PACKAGE,
    category_code: 'PACKAGE',
    name: 'Express',
    slug: 'express',
    description: 'Ultra-fast rush courier, 60-minute citywide express point-to-point dispatch, and real-time tracking.',
    icon: 'bolt',
    is_active: true,
    sort_order: 2,
    created_at: getDynamicOffset(72),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'cs-pack-0003',
    category_id: CATEGORY_IDS.PACKAGE,
    category_code: 'PACKAGE',
    name: 'International',
    slug: 'international',
    description: 'Worldwide air courier, customs declaration support, cross-border freight, and door-to-door tracking.',
    icon: 'flight_takeoff',
    is_active: true,
    sort_order: 3,
    created_at: getDynamicOffset(69),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'cs-pack-0004',
    category_id: CATEGORY_IDS.PACKAGE,
    category_code: 'PACKAGE',
    name: 'Fragile',
    slug: 'fragile',
    description: 'Shock-cushioned white-glove courier handling for delicate glassware, ceramics, art, and sensitive gear.',
    icon: 'warning',
    is_active: true,
    sort_order: 4,
    created_at: getDynamicOffset(65),
    updated_at: getDynamicOffset(4),
  },
]

export const loadStoredCuisines = () => {
  if (typeof window === 'undefined') return initialCuisines
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge any new initial cuisines (e.g. newly added grocery specializations)
        const existingIds = new Set(parsed.map((c) => c.id))
        const missing = initialCuisines.filter((c) => !existingIds.has(c.id))
        if (missing.length > 0) {
          const updated = [...parsed, ...missing]
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          return updated
        }
        return parsed
      }
    }
    // Seed new initial specializations table
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCuisines))
  } catch (e) {
    console.error('Failed to load stored cuisines:', e)
  }
  return initialCuisines
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCuisines))
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
