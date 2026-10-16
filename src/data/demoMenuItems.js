/**
 * Multi-Category Menu Items & Products Data
 * 
 * Supports merchant-specific category filtering and product catalogs:
 * - Bakery & Cafe (Caffe Bella): Coffee, Drinks, Bakery, Desserts, Sandwiches
 * - Burgers & Fast Food (Burger Collective): Burgers, Drinks, Appetizers, Sandwiches
 * - Grocery & Fresh Produce (Whole Harvest, FreshMart): Fruits, Vegetables, Dairy, Bakery, Household
 * - Pharmacy & Health (MedExpress): Medicines, Vitamins, Personal Care, First Aid
 * - Japanese & Dining (Sashimi Zen): Sushi, Appetizers, Bento, Drinks
 * - Beverage & Spirits (Urban Cellar): Fine Wines, Craft Beers, Spirits, Mixers
 * 
 * Relationships:
 * - Belongs to MerchantBranch (merchant_branch_id)
 * - Belongs to MenuCategory (menu_category_id)
 * - Has many MenuItemSize (menu_item_sizes)
 * - Has many MenuItemExtraGroup (menu_item_extra_groups)
 *   - Has many MenuItemExtraOption (menu_item_extra_options)
 */

import { loadStoredMenuCategories } from './demoMenuCategories'

export const MENU_ITEMS_STORAGE_KEY = 'deliver_app_branch_menu_items_v3'

// Icon resolver for category names
export function getCategoryIcon(name, code = '') {
  const n = (name || '').toLowerCase()
  const c = (code || '').toUpperCase()

  if (n.includes('coffee') || n.includes('roast')) return 'local_cafe'
  if (n.includes('drink') || n.includes('beverage') || n.includes('juice') || n.includes('bar')) return 'local_bar'
  if (n.includes('bakery') || n.includes('bread') || n.includes('croissant')) return 'bakery_dining'
  if (n.includes('dessert') || n.includes('cake') || n.includes('sweet') || n.includes('tart')) return 'cake'
  if (n.includes('sandwich') || n.includes('panini') || n.includes('wrap') || n.includes('sub')) return 'lunch_dining'
  if (n.includes('burger')) return 'lunch_dining'
  if (n.includes('pizza')) return 'local_pizza'
  if (n.includes('appetizer') || n.includes('side') || n.includes('fry') || n.includes('snack')) return 'tapas'
  if (n.includes('sushi') || n.includes('roll') || n.includes('sashimi')) return 'set_meal'
  if (n.includes('wine') || n.includes('beer') || n.includes('spirit')) return 'liquor'
  if (n.includes('fruit')) return 'nutrition'
  if (n.includes('vegetable') || n.includes('produce') || n.includes('herb')) return 'eco'
  if (n.includes('dairy') || n.includes('milk') || n.includes('egg') || n.includes('cheese')) return 'egg'
  if (n.includes('household') || n.includes('pantry') || n.includes('clean')) return 'cleaning_services'
  if (n.includes('medicine') || n.includes('rx') || n.includes('drug')) return 'medication'
  if (n.includes('vitamin') || n.includes('supplement')) return 'vital_signs'
  if (n.includes('first aid') || n.includes('bandage')) return 'medical_services'
  if (n.includes('personal care') || n.includes('skin') || n.includes('soap')) return 'soap'
  if (n.includes('electronic') || n.includes('device') || n.includes('charge')) return 'devices'
  if (n.includes('cloth') || n.includes('apparel') || n.includes('wear')) return 'apparel'
  if (n.includes('flower') || n.includes('bouquet') || n.includes('plant')) return 'local_florist'
  if (n.includes('service') || n.includes('courier') || n.includes('delivery')) return 'handshake'

  if (c === 'FOOD') return 'restaurant'
  if (c === 'GROCERY') return 'local_grocery_store'
  if (c === 'PHARMACY') return 'medication'
  if (c === 'RETAIL') return 'shopping_bag'
  if (c === 'FLOWERS_GIFTS') return 'local_florist'
  if (c === 'SERVICES') return 'handshake'

  return 'category'
}

/**
 * Returns categories that belong to a specific merchant based on assignments or type
 */
export function getMerchantCategories(merchant) {
  if (!merchant) {
    return [
      { id: 'cat-all', name: 'General', code: 'FOOD', icon: 'category', description: 'General items' },
    ]
  }

  const allMenuCats = loadStoredMenuCategories()

  // 1. Look for categories assigned to this specific merchant ID in demoMenuCategories
  const assigned = allMenuCats.filter(
    (c) => Array.isArray(c.merchant_ids) && c.merchant_ids.includes(merchant.id)
  )

  if (assigned.length > 0) {
    return assigned.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.category_code,
      description: c.description,
      icon: getCategoryIcon(c.name, c.category_code),
    }))
  }

  // 2. Derive based on merchant.type or category code
  const typeStr = (merchant.type || merchant.category_name || merchant.category_code || '').toLowerCase()

  if (typeStr.includes('bakery') || typeStr.includes('cafe') || typeStr.includes('coffee') || typeStr.includes('roaster')) {
    return [
      { id: 'mcat-food-002', name: 'Drinks', code: 'FOOD', icon: 'local_cafe', description: 'Artisanal roasts, cold brews, and teas' },
      { id: 'mcat-groc-004', name: 'Bakery', code: 'FOOD', icon: 'bakery_dining', description: 'Fresh croissants, sourdough, and breads' },
      { id: 'mcat-food-003', name: 'Desserts', code: 'FOOD', icon: 'cake', description: 'Brownies, tarts, and sweet treats' },
      { id: 'mcat-food-005', name: 'Sandwiches', code: 'FOOD', icon: 'lunch_dining', description: 'Paninis, focaccia, and club melts' },
    ]
  }

  if (typeStr.includes('burger') || typeStr.includes('fast food')) {
    return [
      { id: 'mcat-food-001', name: 'Burgers', code: 'FOOD', icon: 'lunch_dining', description: 'Prime smash burgers and sliders' },
      { id: 'mcat-food-004', name: 'Appetizers', code: 'FOOD', icon: 'tapas', description: 'Fries, wings, and sides' },
      { id: 'mcat-food-002', name: 'Drinks', code: 'FOOD', icon: 'local_bar', description: 'Shakes, craft sodas, and juices' },
      { id: 'mcat-food-003', name: 'Desserts', code: 'FOOD', icon: 'cake', description: 'Sweet treats' },
    ]
  }

  if (typeStr.includes('groc') || typeStr.includes('supermarket') || typeStr.includes('market')) {
    return [
      { id: 'mcat-groc-001', name: 'Fruits', code: 'GROCERY', icon: 'nutrition', description: 'Fresh organic fruits' },
      { id: 'mcat-groc-002', name: 'Vegetables', code: 'GROCERY', icon: 'eco', description: 'Farm-fresh greens' },
      { id: 'mcat-groc-003', name: 'Dairy', code: 'GROCERY', icon: 'egg', description: 'Milk, butter, and cheese' },
      { id: 'mcat-groc-004', name: 'Bakery', code: 'GROCERY', icon: 'bakery_dining', description: 'Fresh loaves and rolls' },
      { id: 'mcat-groc-005', name: 'Household', code: 'GROCERY', icon: 'cleaning_services', description: 'Home essentials' },
    ]
  }

  if (typeStr.includes('pharm') || typeStr.includes('health') || typeStr.includes('care')) {
    return [
      { id: 'mcat-phar-001', name: 'Medicines', code: 'PHARMACY', icon: 'medication', description: 'Pain relief and healthcare' },
      { id: 'mcat-phar-002', name: 'Vitamins', code: 'PHARMACY', icon: 'vital_signs', description: 'Supplements and boosters' },
      { id: 'mcat-phar-003', name: 'Personal Care', code: 'PHARMACY', icon: 'soap', description: 'Hygiene and skin care' },
      { id: 'mcat-phar-004', name: 'First Aid', code: 'PHARMACY', icon: 'medical_services', description: 'Bandages and antiseptic' },
    ]
  }

  if (typeStr.includes('beverage') || typeStr.includes('wine') || typeStr.includes('spirit')) {
    return [
      { id: 'mcat-bev-001', name: 'Fine Wines', code: 'FOOD', icon: 'liquor', description: 'Curated red and white vintages' },
      { id: 'mcat-bev-002', name: 'Craft Beers', code: 'FOOD', icon: 'sports_bar', description: 'Local craft IPAs and lagers' },
      { id: 'mcat-bev-003', name: 'Spirits', code: 'FOOD', icon: 'liquor', description: 'Aged whiskey and spirits' },
      { id: 'mcat-bev-004', name: 'Mixers & Sodas', code: 'FOOD', icon: 'local_bar', description: 'Artisanal tonic and sodas' },
    ]
  }

  if (typeStr.includes('flower') || typeStr.includes('gift')) {
    return [
      { id: 'mcat-flow-001', name: 'Bouquets', code: 'FLOWERS_GIFTS', icon: 'local_florist', description: 'Arranged seasonal flowers' },
      { id: 'mcat-flow-002', name: 'Gift Sets', code: 'FLOWERS_GIFTS', icon: 'card_giftcard', description: 'Hampers and chocolates' },
      { id: 'mcat-flow-003', name: 'Indoor Plants', code: 'FLOWERS_GIFTS', icon: 'potted_plant', description: 'Potted greens and succulents' },
    ]
  }

  if (typeStr.includes('retail') || typeStr.includes('cloth') || typeStr.includes('electr')) {
    return [
      { id: 'mcat-retl-001', name: 'Electronics', code: 'RETAIL', icon: 'devices', description: 'Cables, chargers, and gadgets' },
      { id: 'mcat-retl-002', name: 'Apparel', code: 'RETAIL', icon: 'apparel', description: 'Cotton tees and activewear' },
      { id: 'mcat-retl-003', name: 'Accessories', code: 'RETAIL', icon: 'watch', description: 'Wallets, bags, and sunglasses' },
    ]
  }

  // General Restaurant fallback
  return [
    { id: 'mcat-food-001', name: 'Main Dishes', code: 'FOOD', icon: 'dinner_dining', description: 'Chef signature courses' },
    { id: 'mcat-food-004', name: 'Appetizers & Sides', code: 'FOOD', icon: 'tapas', description: 'Starters and accompaniments' },
    { id: 'mcat-food-002', name: 'Beverages', code: 'FOOD', icon: 'local_bar', description: 'Cold and hot refreshments' },
    { id: 'mcat-food-003', name: 'Desserts', code: 'FOOD', icon: 'cake', description: 'Pastries and sweets' },
  ]
}

// Merchant-specific curated catalog generators
const CATALOG_GENERATORS = {
  // CAFFE BELLA ARTISAN ROASTERY (m-006)
  'm-006': (branchId, merchantId) => [
    {
      id: `item-${branchId}-cb-1`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-002',
      category_type: 'Drinks',
      name: 'Single-Origin Yirgacheffe Pour-Over',
      description: 'Award-winning washed Yirgacheffe beans with floral jasmine aroma, bergamot citrus notes, and honey finish.',
      price: 180,
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 120,
      unit: 'cup',
      sku: 'CAF-YIR-001',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb1-1', name: 'Regular Cup (250ml)', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-cb1-2', name: 'Large Mug (350ml)', price_delta: 35, is_default: false, is_active: true, sort_order: 2 },
        { id: 'sz-cb1-3', name: 'Chemex Carafe for Two (500ml)', price_delta: 90, is_default: false, is_active: true, sort_order: 3 },
      ],
      extra_groups: [
        {
          id: 'eg-cb1-1',
          name: 'Bean Roast Profile',
          description: 'Select your customized roast degree',
          selection_type: 'single',
          is_required: true,
          min_select: 1,
          max_select: 1,
          is_active: true,
          sort_order: 1,
          options: [
            { id: 'eo-cb1-1', name: 'Light Roast (Floral & Bright)', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
            { id: 'eo-cb1-2', name: 'Medium Roast (Caramel & Balanced)', price_delta: 0, is_default: false, is_active: true, sort_order: 2 },
          ],
        },
      ],
    },
    {
      id: `item-${branchId}-cb-2`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-002',
      category_type: 'Drinks',
      name: 'Cold-Brew Nitro Cascara Infusion',
      description: 'Slow-steeped 24-hour Ethiopian cold brew charged with nitrogen for an ultra-velvety foam head.',
      price: 210,
      image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 80,
      unit: 'glass',
      sku: 'CAF-NIT-002',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb2-1', name: 'Standard (350ml)', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-cb2-2', name: 'Grande (500ml)', price_delta: 45, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-cb-3`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-002',
      category_type: 'Drinks',
      name: 'Artisanal Spiced Chai Macchiato',
      description: 'Double ristretto espresso, micro-foamed oat milk, stone-ground cardamom, and raw Sidama mountain honey.',
      price: 165,
      image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 95,
      unit: 'cup',
      sku: 'CAF-MAC-003',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb3-1', name: '8 oz Cup', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-cb3-2', name: '12 oz Mug', price_delta: 30, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-cb-4`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-groc-004',
      category_type: 'Bakery',
      name: 'French Butter Golden Croissant',
      description: 'Laminated with pure Normandy butter, 48 hours fermentation, crisp flaky exterior, and airy honeycomb crumb.',
      price: 130,
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 45,
      unit: 'pcs',
      sku: 'BAK-CRS-001',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb4-1', name: 'Single Croissant', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-cb4-2', name: 'Box of 2 Croissants', price_delta: 110, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [
        {
          id: 'eg-cb4-1',
          name: 'Serving Option',
          description: 'Warm or room temperature',
          selection_type: 'single',
          is_required: false,
          min_select: 0,
          max_select: 1,
          is_active: true,
          sort_order: 1,
          options: [
            { id: 'eo-cb4-1', name: 'Oven Warmed', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
            { id: 'eo-cb4-2', name: 'With Berry Jam & Butter (+20 ETB)', price_delta: 20, is_default: false, is_active: true, sort_order: 2 },
          ],
        },
      ],
    },
    {
      id: `item-${branchId}-cb-5`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-groc-004',
      category_type: 'Bakery',
      name: 'Artisan Pain au Chocolat (Dark Belgian)',
      description: 'Two batons of 70% dark Belgian chocolate enveloped in layered golden butter puff pastry.',
      price: 155,
      image_url: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 38,
      unit: 'pcs',
      sku: 'BAK-CHO-002',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb5-1', name: 'Standard Size', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-cb-6`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-003',
      category_type: 'Desserts',
      name: 'Espresso Fudge Brownie with Sea Salt',
      description: 'Intense dark chocolate and crushed espresso bean brownie sprinkled with coarse Maldon sea salt flakes.',
      price: 175,
      image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 26,
      unit: 'slice',
      sku: 'DES-BRN-001',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb6-1', name: 'Single Slice', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-cb6-2', name: 'Double Slice with Gelato (+75 ETB)', price_delta: 75, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-cb-7`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-003',
      category_type: 'Desserts',
      name: 'Classic Venetian Tiramisu Jar',
      description: 'Espresso-soaked Savoiardi ladyfingers layered with zabaione mascarpone cream and Valrhona cocoa dust.',
      price: 220,
      image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 30,
      unit: 'jar',
      sku: 'DES-TIR-002',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb7-1', name: 'Individual Jar (180g)', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-cb-8`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-005',
      category_type: 'Sandwiches',
      name: 'Smoked Turkey & Basil Pesto Ciabatta Panini',
      description: 'Thinly sliced smoked turkey breast, fresh buffalo mozzarella, sun-dried tomatoes, and basil pesto on crusty ciabatta.',
      price: 295,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 40,
      unit: 'pcs',
      sku: 'SAN-TUR-001',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb8-1', name: 'Standard Panini', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-cb8-2', name: 'Combo with Iced Coffee (+80 ETB)', price_delta: 80, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-cb-9`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-005',
      category_type: 'Sandwiches',
      name: 'Ripe Avocado & Caprese Focaccia Melt',
      description: 'Sliced Hass avocado, heirloom tomatoes, pesto, aged balsamic glaze, and melted provolone on olive rosemary focaccia.',
      price: 270,
      image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 35,
      unit: 'pcs',
      sku: 'SAN-CAP-002',
      requires_prescription: false,
      is_age_restricted: false,
      expiry_date: null,
      sizes: [
        { id: 'sz-cb9-1', name: 'Standard Melt', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
      ],
      extra_groups: [],
    },
  ],

  // THE BURGER COLLECTIVE (m-001)
  'm-001': (branchId, merchantId) => [
    {
      id: `item-${branchId}-bc-1`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-001',
      category_type: 'Burgers',
      name: 'Special Double Prime Smash Burger',
      description: 'Two 100% Angus smash patties, aged sharp cheddar, caramelized shallots, house secret sauce on toasted brioche.',
      price: 380,
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 85,
      unit: 'pcs',
      sku: 'BUR-SM-001',
      requires_prescription: false,
      is_age_restricted: false,
      sizes: [
        { id: 'sz-bc1-1', name: 'Regular (4 oz)', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-bc1-2', name: 'Double Patty (8 oz)', price_delta: 120, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-bc-2`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-001',
      category_type: 'Burgers',
      name: 'Truffle Mushroom Swiss Burger',
      description: 'Seared beef patty, sautéed wild forest mushrooms, melted Swiss emmental, and black truffle garlic aioli.',
      price: 420,
      image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 42,
      unit: 'pcs',
      sku: 'BUR-TRF-002',
      requires_prescription: false,
      is_age_restricted: false,
      sizes: [
        { id: 'sz-bc2-1', name: 'Single', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-bc2-2', name: 'Double (+140 ETB)', price_delta: 140, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-bc-3`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-004',
      category_type: 'Appetizers',
      name: 'Crispy Seasoned Truffle Fries',
      description: 'Hand-cut Idaho potatoes fried golden with white truffle oil, grated parmesan, and roasted garlic aioli.',
      price: 180,
      image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 110,
      unit: 'basket',
      sku: 'APP-FRY-001',
      requires_prescription: false,
      is_age_restricted: false,
      sizes: [
        { id: 'sz-bc3-1', name: 'Standard Basket', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-bc3-2', name: 'Mega Party Basket', price_delta: 90, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-bc-4`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-food-002',
      category_type: 'Drinks',
      name: 'Salted Caramel Thick Milkshake',
      description: 'Madagascar vanilla ice cream blended with rich whole milk, house caramel drizzle, and pretzel crumbles.',
      price: 170,
      image_url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 65,
      unit: 'cup',
      sku: 'BEV-SHK-001',
      requires_prescription: false,
      is_age_restricted: false,
      sizes: [
        { id: 'sz-bc4-1', name: '16 oz Regular', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
      ],
      extra_groups: [],
    },
  ],

  // WHOLE HARVEST ORGANIC MARKET (m-002)
  'm-002': (branchId, merchantId) => [
    {
      id: `item-${branchId}-wh-1`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-groc-001',
      category_type: 'Fruits',
      name: 'Organic Hass Avocados (Pack of 3)',
      description: 'Creamy ripe organic Hass avocados grown in Rift Valley highlands. Ready to eat.',
      price: 195,
      image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 120,
      unit: 'pack',
      sku: 'GROC-AVO-010',
      requires_prescription: false,
      is_age_restricted: false,
      sizes: [
        { id: 'sz-wh1-1', name: 'Pack of 3', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-wh-2`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-groc-003',
      category_type: 'Dairy',
      name: 'Highland Pure Fresh Whole Milk',
      description: 'Farm-fresh pasteurized homogenized 3.5% milk in sealed BPA-free bottles.',
      price: 110,
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 45,
      unit: 'liters',
      sku: 'GROC-MLK-012',
      requires_prescription: false,
      is_age_restricted: false,
      sizes: [
        { id: 'sz-wh2-1', name: '1 Liter', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: 'sz-wh2-2', name: '2 Liters', price_delta: 95, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    },
  ],

  // MEDEXPRESS CARE PHARMACY (m-003)
  'm-003': (branchId, merchantId) => [
    {
      id: `item-${branchId}-me-1`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-phar-001',
      category_type: 'Medicines',
      name: 'Paracetamol Extra 500mg Tablets',
      description: 'Fast acting pain relief and fever reducer with caffeine booster. Blister box of 20 caplets.',
      price: 140,
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 210,
      unit: 'box',
      sku: 'MED-PCT-020',
      requires_prescription: false,
      is_age_restricted: false,
      sizes: [
        { id: 'sz-me1-1', name: 'Box of 20 (500mg)', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
      ],
      extra_groups: [],
    },
    {
      id: `item-${branchId}-me-2`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: 'mcat-phar-001',
      category_type: 'Medicines',
      name: 'Amoxicillin Trihydrate 500mg (Rx Required)',
      description: 'Broad-spectrum antibiotic caplets. Strict pharmacist verification required.',
      price: 320,
      image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 35,
      unit: 'box',
      sku: 'RX-AMX-500',
      requires_prescription: true,
      is_age_restricted: true,
      sizes: [
        { id: 'sz-me2-1', name: 'Course 21 Caplets', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
      ],
      extra_groups: [],
    },
  ],
}

/**
 * Generate default seed items for generic or newly created merchants based on their categories
 */
function generateGenericMerchantCatalog(branchId, merchantId, merchant) {
  const categories = getMerchantCategories(merchant)
  const items = []

  categories.forEach((cat, idx) => {
    const catName = cat.name
    items.push({
      id: `item-${branchId}-gen-${idx + 1}-a`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: cat.id || `mcat-${idx + 1}`,
      category_type: catName,
      name: `Signature ${catName} Selection`,
      description: `Crafted ${catName.toLowerCase()} prepared fresh daily by ${merchant?.name || 'the branch'}.`,
      price: 240 + idx * 30,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 50,
      unit: 'pcs',
      sku: `SKU-${catName.substring(0, 3).toUpperCase()}-101`,
      requires_prescription: cat.code === 'PHARMACY',
      is_age_restricted: false,
      sizes: [
        { id: `sz-g-${idx}-1`, name: 'Standard Regular', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
        { id: `sz-g-${idx}-2`, name: 'Deluxe Special', price_delta: 60, is_default: false, is_active: true, sort_order: 2 },
      ],
      extra_groups: [],
    })

    items.push({
      id: `item-${branchId}-gen-${idx + 1}-b`,
      merchant_branch_id: branchId,
      merchant_id: merchantId,
      menu_category_id: cat.id || `mcat-${idx + 1}`,
      category_type: catName,
      name: `Chef Special ${catName} Duo`,
      description: `Artisanal recipe with premium selected ingredients.`,
      price: 310 + idx * 25,
      image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      is_available: true,
      stock_quantity: 35,
      unit: 'pcs',
      sku: `SKU-${catName.substring(0, 3).toUpperCase()}-102`,
      requires_prescription: false,
      is_age_restricted: false,
      sizes: [
        { id: `sz-g-${idx}-3`, name: 'Single Serving', price_delta: 0, is_default: true, is_active: true, sort_order: 1 },
      ],
      extra_groups: [],
    })
  })

  return items
}

/**
 * Resolves the relevant categories for a given merchant/branch,
 * strictly relating to the merchant's assigned categories earlier and items present.
 */
export function getCategoriesForBranch(merchant, menuItems = []) {
  const base = getMerchantCategories(merchant)
  const names = new Set(base.map((c) => (c.name || '').toLowerCase()))

  if (Array.isArray(menuItems)) {
    menuItems.forEach((item) => {
      const cName = item.category_type || item.category_name
      if (cName && !names.has(cName.toLowerCase())) {
        names.add(cName.toLowerCase())
        base.push({
          id: item.menu_category_id || `cat-${cName.toLowerCase().replace(/\s+/g, '-')}`,
          name: cName,
          code: item.category_code || 'FOOD',
          icon: getCategoryIcon(cName),
          description: `${cName} catalog items`,
        })
      }
    })
  }

  return base
}

/**
 * Load items for a given branch, filtered strictly to that merchant's domain & categories
 */
export function getMenuItemsForBranch(branchId, merchantId, merchant) {
  try {
    const raw = localStorage.getItem(MENU_ITEMS_STORAGE_KEY)
    let allItems = raw ? JSON.parse(raw) : []

    // Check if items already exist for this branch
    let branchItems = allItems.filter(
      (item) => item.merchant_branch_id === branchId || (branchId && item.merchant_branch_id?.includes(branchId))
    )

    // Check if branchItems are valid and not contaminated with global default items from wrong merchant
    const isMismatched = branchItems.length > 0 && branchItems.some(item => {
      // If merchant is Caffe Bella (m-006), should only have its assigned categories: Drinks, Bakery, Desserts, Sandwiches
      if (merchantId === 'm-006') {
        const allowedCats = ['drinks', 'bakery', 'desserts', 'sandwiches']
        const currentCat = (item.category_type || '').toLowerCase()
        if (!allowedCats.includes(currentCat)) {
          return true
        }
      }
      return false
    })

    if (branchItems.length === 0 || isMismatched) {
      // Remove any old mismatched items for this branch
      if (isMismatched) {
        allItems = allItems.filter((item) => item.merchant_branch_id !== branchId)
      }

      // Generate seed items tailored specifically to this merchant
      let seeded = []
      if (merchantId && CATALOG_GENERATORS[merchantId]) {
        seeded = CATALOG_GENERATORS[merchantId](branchId, merchantId)
      } else {
        seeded = generateGenericMerchantCatalog(branchId, merchantId, merchant)
      }

      allItems = [...allItems, ...seeded]
      localStorage.setItem(MENU_ITEMS_STORAGE_KEY, JSON.stringify(allItems))
      return seeded
    }

    return branchItems
  } catch (err) {
    console.error('Failed to load menu items:', err)
    if (merchantId && CATALOG_GENERATORS[merchantId]) {
      return CATALOG_GENERATORS[merchantId](branchId, merchantId)
    }
    return generateGenericMerchantCatalog(branchId, merchantId, merchant)
  }
}

/**
 * Save / Update an item
 */
export function saveMenuItem(item) {
  try {
    const raw = localStorage.getItem(MENU_ITEMS_STORAGE_KEY)
    let allItems = raw ? JSON.parse(raw) : []

    const existingIndex = allItems.findIndex((i) => i.id === item.id)
    if (existingIndex >= 0) {
      allItems[existingIndex] = { ...item, updated_at: new Date().toISOString() }
    } else {
      allItems.unshift({
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    localStorage.setItem(MENU_ITEMS_STORAGE_KEY, JSON.stringify(allItems))
    return allItems
  } catch (err) {
    console.error('Failed to save menu item', err)
    return []
  }
}

/**
 * Delete a menu item
 */
export function deleteMenuItem(itemId) {
  try {
    const raw = localStorage.getItem(MENU_ITEMS_STORAGE_KEY)
    let allItems = raw ? JSON.parse(raw) : []
    allItems = allItems.filter((i) => i.id !== itemId)
    localStorage.setItem(MENU_ITEMS_STORAGE_KEY, JSON.stringify(allItems))
    return allItems
  } catch (err) {
    console.error('Failed to delete menu item', err)
    return []
  }
}
