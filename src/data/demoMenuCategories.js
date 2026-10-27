/**
 * Menu Category Data adhering to the schema:
 * uuid id PK
 * uuid category_id FK (References category id)
 * string category_code (FOOD, GROCERY, PHARMACY, RETAIL, FLOWERS_GIFTS, SERVICES, PACKAGE)
 * string name - Type name
 * string description - Type description
 * boolean is_active - Active flag
 * int sort_order - Display order
 * array merchant_ids - Many-to-many relationship with Merchants
 * timestamp created_at - Creation timestamp
 * timestamp updated_at - Last updated timestamp
 */

export const STORAGE_KEY = 'deliver_app_menu_categories_v2'

const getDynamicOffset = (days, hours = 0) => {
  return new Date(Date.now() - (days * 86400000 + hours * 3600000)).toISOString()
}

export const CATEGORY_IDS = {
  FOOD: 'cat-food-1111-4444-8888-000000000001',
  GROCERY: 'cat-groc-2222-4444-8888-000000000002',
  PHARMACY: 'cat-phar-3333-4444-8888-000000000003',
  RETAIL: 'cat-retl-4444-4444-8888-000000000004',
  FLOWERS_GIFTS: 'cat-flow-5555-4444-8888-000000000005',
  SERVICES: 'cat-serv-6666-4444-8888-000000000006',
  PACKAGE: 'cat-pack-7777-4444-8888-000000000007',
}

export const initialMenuCategories = [
  // --- Food Category ---
  {
    id: 'mcat-food-001',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Burgers',
    description: 'Juicy prime Angus patties, smash burgers, slider platters, and plant-based burgers with house-made buns.',
    is_active: true,
    sort_order: 1,
    requires_stock_quantity: false,
    requires_unit: false,
    requires_sku: false,
    requires_prescription: false,
    is_age_restricted_category: false,
    merchant_ids: ['m-001'],
    created_at: getDynamicOffset(60),
    updated_at: getDynamicOffset(0, 3),
  },
  {
    id: 'mcat-food-002',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Drinks',
    description: 'Cold-pressed citrus juices, craft sodas, iced coffees, bubble teas, smoothies, and sparkling refreshments.',
    is_active: true,
    requires_stock_quantity: true,
    requires_unit: true,
    requires_sku: false,
    requires_prescription: false,
    is_age_restricted: true,
    is_age_restricted_category: true,
    sort_order: 2,
    merchant_ids: ['m-001', 'm-005', 'm-006'],
    created_at: getDynamicOffset(58),
    updated_at: getDynamicOffset(1, 2),
  },
  {
    id: 'mcat-food-003',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Desserts',
    description: 'Decadent chocolate cakes, fresh fruit tarts, macarons, gelato pints, and gourmet warm pastries.',
    is_active: true,
    sort_order: 3,
    merchant_ids: ['m-006', 'm-008'],
    created_at: getDynamicOffset(55),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'mcat-food-004',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Appetizers',
    description: 'Crispy wings, loaded fries, fresh dips, bruschetta, and gourmet finger snacks for sharing.',
    is_active: true,
    sort_order: 4,
    merchant_ids: ['m-001', 'm-004'],
    created_at: getDynamicOffset(50),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'mcat-food-005',
    category_id: CATEGORY_IDS.FOOD,
    category_code: 'FOOD',
    name: 'Sandwiches',
    description: 'Toasted paninis, artisan deli subs, club sandwiches, and fresh herb-infused wraps.',
    is_active: true,
    sort_order: 5,
    merchant_ids: ['m-001', 'm-006'],
    created_at: getDynamicOffset(45),
    updated_at: getDynamicOffset(4),
  },

  // --- Grocery Category ---
  {
    id: 'mcat-groc-001',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Fruits',
    description: 'Organic crisp apples, tropical mangoes, sweet berries, citrus fruits, and seasonal whole produce.',
    is_active: true,
    sort_order: 1,
    merchant_ids: ['m-002', 'm-007', 'm-017', 'm-018', 'm-025'],
    created_at: getDynamicOffset(40),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'mcat-groc-002',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Vegetables',
    description: 'Fresh farm-picked greens, root vegetables, crisp bell peppers, vine tomatoes, and aromatic culinary herbs.',
    is_active: true,
    sort_order: 2,
    merchant_ids: ['m-002', 'm-007', 'm-017', 'm-018', 'm-025'],
    created_at: getDynamicOffset(38),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'mcat-groc-003',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Dairy',
    description: 'Whole milk, unsalted butter, artisanal cheeses, organic yogurts, and plant-based milk alternatives.',
    is_active: true,
    sort_order: 3,
    merchant_ids: ['m-002', 'm-007', 'm-017', 'm-018', 'm-026'],
    created_at: getDynamicOffset(35),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'mcat-groc-004',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Bakery',
    description: 'Fresh sourdough loaves, artisan baguettes, butter croissants, gluten-free sandwich bread, and breakfast muffins.',
    is_active: true,
    sort_order: 4,
    merchant_ids: ['m-002', 'm-007', 'm-018', 'm-006'],
    created_at: getDynamicOffset(32),
    updated_at: getDynamicOffset(0, 10),
  },
  {
    id: 'mcat-groc-005',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Household',
    description: 'Eco-friendly kitchen detergents, disinfectant multi-surface sprays, recycled paper towels, and trash bags.',
    is_active: true,
    sort_order: 5,
    merchant_ids: ['m-002', 'm-007', 'm-018'],
    created_at: getDynamicOffset(30),
    updated_at: getDynamicOffset(5),
  },
  {
    id: 'mcat-groc-006',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Meat & Deli',
    description: 'Prime butchery beef cuts, fresh poultry, minced meat for kitfo, and hygienic cold deli charcuterie.',
    is_active: true,
    sort_order: 6,
    merchant_ids: ['m-007', 'm-018', 'm-019'],
    created_at: getDynamicOffset(28),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'mcat-groc-007',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Pantry & Grains',
    description: 'Ethiopian white maganaja teff, organic highland berbere, basmati rice, pasta, and pure cooking oils.',
    is_active: true,
    sort_order: 7,
    merchant_ids: ['m-002', 'm-007', 'm-017', 'm-018'],
    created_at: getDynamicOffset(26),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'mcat-groc-008',
    category_id: CATEGORY_IDS.GROCERY,
    category_code: 'GROCERY',
    name: 'Beverages',
    description: 'Bottled spring water, cold-pressed cane and tropical juices, milkshakes, and sparkling sodas.',
    is_active: true,
    sort_order: 8,
    merchant_ids: ['m-002', 'm-007', 'm-018', 'm-025', 'm-026'],
    created_at: getDynamicOffset(25),
    updated_at: getDynamicOffset(1),
  },

  // --- Pharmacy Category ---
  {
    id: 'mcat-phar-001',
    category_id: CATEGORY_IDS.PHARMACY,
    category_code: 'PHARMACY',
    name: 'Medicines',
    description: 'Over-the-counter pain relief, fever reducers, cold & cough remedies, anti-allergy tablets, and digestive health.',
    is_active: true,
    requires_stock_quantity: true,
    requires_unit: true,
    requires_sku: true,
    requires_prescription: true,
    is_age_restricted: false,
    is_age_restricted_category: false,
    sort_order: 1,
    merchant_ids: ['m-003'],
    created_at: getDynamicOffset(28),
    updated_at: getDynamicOffset(0, 5),
  },
  {
    id: 'mcat-phar-002',
    category_id: CATEGORY_IDS.PHARMACY,
    category_code: 'PHARMACY',
    name: 'Vitamins',
    description: 'Daily multivitamin complexes, Vitamin C & D supplements, omega-3 capsules, and mineral immune boosters.',
    is_active: true,
    sort_order: 2,
    merchant_ids: ['m-003'],
    created_at: getDynamicOffset(25),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'mcat-phar-003',
    category_id: CATEGORY_IDS.PHARMACY,
    category_code: 'PHARMACY',
    name: 'Personal Care',
    description: 'Dermatological skincare cleansers, restorative shampoos, body moisturizers, oral dental care, and deodorants.',
    is_active: true,
    sort_order: 3,
    merchant_ids: ['m-003'],
    created_at: getDynamicOffset(24),
    updated_at: getDynamicOffset(4),
  },
  {
    id: 'mcat-phar-004',
    category_id: CATEGORY_IDS.PHARMACY,
    category_code: 'PHARMACY',
    name: 'First Aid',
    description: 'Sterile adhesive bandages, antiseptic cleansing sprays, medical gauze, instant ice packs, and digital thermometers.',
    is_active: true,
    sort_order: 4,
    merchant_ids: ['m-003'],
    created_at: getDynamicOffset(22),
    updated_at: getDynamicOffset(6),
  },

  // --- Retail Category ---
  {
    id: 'mcat-retl-001',
    category_id: CATEGORY_IDS.RETAIL,
    category_code: 'RETAIL',
    name: 'Electronics',
    description: 'Fast wireless charging pads, braided USB cables, portable power banks, audio adapters, and phone mounts.',
    is_active: true,
    sort_order: 1,
    merchant_ids: ['m-004'],
    created_at: getDynamicOffset(20),
    updated_at: getDynamicOffset(0, 8),
  },
  {
    id: 'mcat-retl-002',
    category_id: CATEGORY_IDS.RETAIL,
    category_code: 'RETAIL',
    name: 'Clothing',
    description: 'Everyday casual apparel, premium cotton tees, breathable activewear, loungewear, and seasonal outerwear jackets.',
    is_active: true,
    sort_order: 2,
    merchant_ids: ['m-004'],
    created_at: getDynamicOffset(19),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'mcat-retl-003',
    category_id: CATEGORY_IDS.RETAIL,
    category_code: 'RETAIL',
    name: 'Accessories',
    description: 'Leather wallets, canvas messenger tote bags, stainless steel wristwatches, sunglasses, and unisex belts.',
    is_active: true,
    sort_order: 3,
    merchant_ids: ['m-004'],
    created_at: getDynamicOffset(18),
    updated_at: getDynamicOffset(3),
  },
  {
    id: 'mcat-retl-004',
    category_id: CATEGORY_IDS.RETAIL,
    category_code: 'RETAIL',
    name: 'Home & Living',
    description: 'Cozy decorative throw pillows, ambient scented soy candles, modular drawer organizers, and modern kitchenware.',
    is_active: true,
    sort_order: 4,
    merchant_ids: ['m-004'],
    created_at: getDynamicOffset(16),
    updated_at: getDynamicOffset(7),
  },

  // --- Flowers & Gifts Category ---
  {
    id: 'mcat-flow-001',
    category_id: CATEGORY_IDS.FLOWERS_GIFTS,
    category_code: 'FLOWERS_GIFTS',
    name: 'Bouquets',
    description: 'Handcrafted red and pink rose arrangements, fresh tulips, exotic orchids, and celebration bouquets.',
    is_active: true,
    sort_order: 1,
    merchant_ids: ['m-007'],
    created_at: getDynamicOffset(15),
    updated_at: getDynamicOffset(0, 1),
  },
  {
    id: 'mcat-flow-002',
    category_id: CATEGORY_IDS.FLOWERS_GIFTS,
    category_code: 'FLOWERS_GIFTS',
    name: 'Plants',
    description: 'Low-maintenance indoor succulent planters, leafy bonsai trees, air-purifying snake plants, and terracotta pots.',
    is_active: true,
    sort_order: 2,
    merchant_ids: ['m-007'],
    created_at: getDynamicOffset(14),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'mcat-flow-003',
    category_id: CATEGORY_IDS.FLOWERS_GIFTS,
    category_code: 'FLOWERS_GIFTS',
    name: 'Gifts',
    description: 'Luxury artisanal chocolate boxes, celebratory greeting cards, gift baskets, and souvenir keepsake sets.',
    is_active: true,
    sort_order: 3,
    merchant_ids: ['m-007'],
    created_at: getDynamicOffset(13),
    updated_at: getDynamicOffset(4),
  },
  {
    id: 'mcat-flow-004',
    category_id: CATEGORY_IDS.FLOWERS_GIFTS,
    category_code: 'FLOWERS_GIFTS',
    name: 'Arrangements',
    description: 'Custom ceramic vase centerpieces, dried botanicals, sympathy floral arrangements, and festive wreaths.',
    is_active: true,
    sort_order: 4,
    merchant_ids: ['m-007'],
    created_at: getDynamicOffset(12),
    updated_at: getDynamicOffset(5),
  },

  // --- Services Category ---
  {
    id: 'mcat-serv-001',
    category_id: CATEGORY_IDS.SERVICES,
    category_code: 'SERVICES',
    name: 'Cleaning',
    description: 'Residential home deep cleaning, standard recurring housekeeping, steam carpet cleaning, and move-out sanitization.',
    is_active: true,
    sort_order: 1,
    merchant_ids: [],
    created_at: getDynamicOffset(10),
    updated_at: getDynamicOffset(2),
  },
  {
    id: 'mcat-serv-002',
    category_id: CATEGORY_IDS.SERVICES,
    category_code: 'SERVICES',
    name: 'Maintenance',
    description: 'Plumbing leak inspections, electrical outlet repairs, AC system maintenance, and handyman carpentry services.',
    is_active: true,
    sort_order: 2,
    merchant_ids: [],
    created_at: getDynamicOffset(9),
    updated_at: getDynamicOffset(3),
  },

  // --- Package Delivery Category ---
  {
    id: 'mcat-pack-001',
    category_id: CATEGORY_IDS.PACKAGE,
    category_code: 'PACKAGE',
    name: 'Documents',
    description: 'Urgent legal contracts, signed papers, certified business letters, and passport parcel courier delivery.',
    is_active: true,
    sort_order: 1,
    merchant_ids: [],
    created_at: getDynamicOffset(8),
    updated_at: getDynamicOffset(1),
  },
  {
    id: 'mcat-pack-002',
    category_id: CATEGORY_IDS.PACKAGE,
    category_code: 'PACKAGE',
    name: 'Small Parcels',
    description: 'Boxes up to 5kg, electronic accessories, retail orders, clothing purchases, and fragile gift packages.',
    is_active: true,
    sort_order: 2,
    merchant_ids: [],
    created_at: getDynamicOffset(7),
    updated_at: getDynamicOffset(2),
  },
]

export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'mcat-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36)
}

export const loadStoredMenuCategories = () => {
  if (typeof window === 'undefined') return initialMenuCategories
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMenuCategories))
      return initialMenuCategories
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge missing initial menu categories and ensure updated merchant_ids
      const existingMap = new Map(parsed.map((item) => [item.id, item]))
      initialMenuCategories.forEach((initCat) => {
        if (!existingMap.has(initCat.id)) {
          existingMap.set(initCat.id, initCat)
        } else {
          // Merge merchant_ids if initial has more (e.g. newly linked grocery merchants)
          const curr = existingMap.get(initCat.id)
          const mergedMids = Array.from(new Set([...(curr.merchant_ids || []), ...(initCat.merchant_ids || [])]))
          existingMap.set(initCat.id, { ...curr, merchant_ids: mergedMids })
        }
      })
      const mergedList = Array.from(existingMap.values()).map((item) => {
        const clean = { ...item }
        delete clean.slug
        clean.requires_stock_quantity = Boolean(item.requires_stock_quantity)
        clean.requires_unit = Boolean(item.requires_unit)
        clean.requires_sku = Boolean(item.requires_sku)
        clean.requires_prescription = Boolean(
          item.requires_prescription !== undefined
            ? item.requires_prescription
            : clean.category_code === 'PHARMACY' &&
              (clean.name?.toLowerCase().includes('medicin') || clean.id === 'mcat-phar-001')
        )
        clean.is_age_restricted_category = Boolean(
          item.is_age_restricted_category !== undefined
            ? item.is_age_restricted_category
            : item.is_age_restricted !== undefined
            ? item.is_age_restricted
            : clean.name?.toLowerCase().includes('drink') ||
              clean.name?.toLowerCase().includes('spirit') ||
              clean.name?.toLowerCase().includes('wine') ||
              clean.name?.toLowerCase().includes('beer') ||
              clean.id === 'mcat-food-002'
        )
        clean.is_age_restricted = clean.is_age_restricted_category
        return clean
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList))
      return mergedList
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMenuCategories))
    return initialMenuCategories
  } catch (err) {
    console.error('Failed to load menu categories from localStorage:', err)
    return initialMenuCategories
  }
}

export const saveStoredMenuCategories = (items) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (err) {
    console.error('Failed to save menu categories to localStorage:', err)
  }
}
