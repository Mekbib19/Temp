import { useState, useMemo, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import {
  loadStoredMenuCategories,
  generateUUID,
} from '../data/demoMenuCategories'
import { loadStoredCategories } from '../data/demoCategories'
import { MENU_ITEMS_STORAGE_KEY, saveMenuItem } from '../data/demoMenuItems'

// Dedicated category customizations storage key to prevent collision
const CATEGORY_PROTOTYPE_KEY = 'deliver_app_category_prototype_customizations_v5'

// Curated single hero picture per category
const CATEGORY_HERO_IMAGES = {
  burgers: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
  drinks: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
  desserts: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
  appetizers: 'https://images.unsplash.com/photo-1541592727228-3e2840506eb3?w=800&auto=format&fit=crop&q=80',
  sandwiches: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
  fallback: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
}

// Prototype extra groups & options shared across all card radios for Burgers
const BURGER_SHARED_GROUPS = [
  {
    id: 'grp-b-cheese',
    name: 'Cheese & Gourmet Toppings',
    description: 'Customize your burger with gourmet melted cheese and premium toppings',
    selection_type: 'multiple',
    is_required: false,
    min_select: 0,
    max_select: 4,
    is_active: true,
    sort_order: 1,
    options: [
      { id: 'opt-b-1', name: 'Extra Aged Sharp Cheddar', price_by_tier: { single: 25, double: 45, triple: 65 }, is_default: false, is_active: true, sort_order: 1 },
      { id: 'opt-b-2', name: 'Crispy Smoked Beef Bacon', price_by_tier: { single: 35, double: 65, triple: 90 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-b-3', name: 'Sautéed Wild Truffle Mushrooms', price_by_tier: { single: 30, double: 55, triple: 75 }, is_default: false, is_active: true, sort_order: 3 },
      { id: 'opt-b-4', name: 'Grilled Spicy Jalapeños', price_by_tier: { single: 15, double: 25, triple: 35 }, is_default: false, is_active: true, sort_order: 4 },
      { id: 'opt-b-5', name: 'Sunny-Side Fried Egg', price_by_tier: { single: 20, double: 35, triple: 45 }, is_default: false, is_active: true, sort_order: 5 },
    ],
  },
  {
    id: 'grp-b-sauce',
    name: 'Signature Sauces & Dips',
    description: 'Choose your chef special drizzle and dipping sauce',
    selection_type: 'single',
    is_required: true,
    min_select: 1,
    max_select: 1,
    is_active: true,
    sort_order: 2,
    options: [
      { id: 'opt-b-6', name: 'House Secret Smash Sauce', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: true, is_active: true, sort_order: 1 },
      { id: 'opt-b-7', name: 'Black Truffle Garlic Aioli', price_by_tier: { single: 15, double: 30, triple: 45 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-b-8', name: 'Smokey Honey Chipotle BBQ', price_by_tier: { single: 10, double: 20, triple: 30 }, is_default: false, is_active: true, sort_order: 3 },
      { id: 'opt-b-9', name: 'Spicy Ghost Pepper Relish', price_by_tier: { single: 15, double: 25, triple: 35 }, is_default: false, is_active: true, sort_order: 4 },
    ],
  },
  {
    id: 'grp-b-bun',
    name: 'Bun / Bread Selection',
    description: 'Select your preferred bakery-fresh bun style',
    selection_type: 'single',
    is_required: true,
    min_select: 1,
    max_select: 1,
    is_active: true,
    sort_order: 3,
    options: [
      { id: 'opt-b-10', name: 'Golden Butter Toasted Brioche', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: true, is_active: true, sort_order: 1 },
      { id: 'opt-b-11', name: 'Artisan Potato Bun', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-b-12', name: 'Gluten-Free Seeded Artisan Bun', price_by_tier: { single: 30, double: 50, triple: 70 }, is_default: false, is_active: true, sort_order: 3 },
      { id: 'opt-b-13', name: 'Crisp Green Butterhead Lettuce Wrap', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: false, is_active: true, sort_order: 4 },
    ],
  },
  {
    id: 'grp-b-side',
    name: 'Choice of Side Accompaniment',
    description: 'Pair your burger with a hot side',
    selection_type: 'single',
    is_required: false,
    min_select: 0,
    max_select: 1,
    is_active: true,
    sort_order: 4,
    options: [
      { id: 'opt-b-14', name: 'Classic Salted French Fries', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: true, is_active: true, sort_order: 1 },
      { id: 'opt-b-15', name: 'Truffle Parmesan Hand-Cut Fries', price_by_tier: { single: 40, double: 60, triple: 80 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-b-16', name: 'Crispy Sweet Potato Wedges', price_by_tier: { single: 30, double: 45, triple: 60 }, is_default: false, is_active: true, sort_order: 3 },
      { id: 'opt-b-17', name: 'Zesty Cabbage Apple Slaw', price_by_tier: { single: 20, double: 30, triple: 40 }, is_default: false, is_active: true, sort_order: 4 },
    ],
  },
]

// Prototype extra groups & options shared across all card radios for Drinks
const DRINKS_SHARED_GROUPS = [
  {
    id: 'grp-d-roast',
    name: 'Bean Roast Profile',
    description: 'Select your customized roast degree',
    selection_type: 'single',
    is_required: true,
    min_select: 1,
    max_select: 1,
    is_active: true,
    sort_order: 1,
    options: [
      { id: 'opt-d-1', name: 'Light Roast (Floral & Jasmine)', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: true, is_active: true, sort_order: 1 },
      { id: 'opt-d-2', name: 'Medium Roast (Caramel & Citrus)', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-d-3', name: 'Dark Roast (Rich Cocoa Finish)', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: false, is_active: true, sort_order: 3 },
    ],
  },
  {
    id: 'grp-d-milk',
    name: 'Milk & Plant Alternatives',
    description: 'Choose your milk or dairy-free alternative',
    selection_type: 'single',
    is_required: false,
    min_select: 0,
    max_select: 1,
    is_active: true,
    sort_order: 2,
    options: [
      { id: 'opt-d-4', name: 'No Milk (Black Pour-Over)', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: true, is_active: true, sort_order: 1 },
      { id: 'opt-d-5', name: 'Steamed Whole Cow Milk', price_by_tier: { single: 15, double: 25, triple: 35 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-d-6', name: 'Barista Organic Oat Milk', price_by_tier: { single: 25, double: 40, triple: 55 }, is_default: false, is_active: true, sort_order: 3 },
      { id: 'opt-d-7', name: 'Vanilla Almond Milk', price_by_tier: { single: 30, double: 45, triple: 60 }, is_default: false, is_active: true, sort_order: 4 },
    ],
  },
  {
    id: 'grp-d-sweet',
    name: 'Sweetener & Mountain Honey',
    description: 'Sweetness adjustment',
    selection_type: 'single',
    is_required: false,
    min_select: 0,
    max_select: 1,
    is_active: true,
    sort_order: 3,
    options: [
      { id: 'opt-d-8', name: 'Unsweetened (Zero Sugar)', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: true, is_active: true, sort_order: 1 },
      { id: 'opt-d-9', name: 'Raw Sidama Mountain Honey', price_by_tier: { single: 20, double: 30, triple: 45 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-d-10', name: 'Organic Brown Cane Sugar', price_by_tier: { single: 10, double: 15, triple: 20 }, is_default: false, is_active: true, sort_order: 3 },
    ],
  },
]

// Prototype extra groups & options shared across all card radios for Desserts
const DESSERTS_SHARED_GROUPS = [
  {
    id: 'grp-des-pairing',
    name: 'Gelato Scoop Pairing',
    description: 'Pair with artisan churned gelato',
    selection_type: 'single',
    is_required: false,
    min_select: 0,
    max_select: 1,
    is_active: true,
    sort_order: 1,
    options: [
      { id: 'opt-des-1', name: 'Madagascar Vanilla Bean Gelato', price_by_tier: { single: 35, double: 60, triple: 85 }, is_default: false, is_active: true, sort_order: 1 },
      { id: 'opt-des-2', name: 'Dark Chocolate Fudge Gelato', price_by_tier: { single: 40, double: 70, triple: 95 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-des-3', name: 'Sicilian Pistachio Crunch Scoop', price_by_tier: { single: 45, double: 80, triple: 110 }, is_default: false, is_active: true, sort_order: 3 },
    ],
  },
  {
    id: 'grp-des-drizzle',
    name: 'Warm Drizzle Sauce',
    description: 'Chef signature finishing sauces',
    selection_type: 'single',
    is_required: false,
    min_select: 0,
    max_select: 1,
    is_active: true,
    sort_order: 2,
    options: [
      { id: 'opt-des-4', name: 'Warm Belgian Dark Chocolate Ganache', price_by_tier: { single: 25, double: 40, triple: 55 }, is_default: true, is_active: true, sort_order: 1 },
      { id: 'opt-des-5', name: 'Salted Caramel Sea Salt Drizzle', price_by_tier: { single: 25, double: 40, triple: 55 }, is_default: false, is_active: true, sort_order: 2 },
      { id: 'opt-des-6', name: 'Wild Raspberry Coulis', price_by_tier: { single: 20, double: 35, triple: 50 }, is_default: false, is_active: true, sort_order: 3 },
    ],
  },
]

// Fallback generic prototype groups
function getGenericSharedGroups(catName, categoryId) {
  const norm = (catName || 'Dish').trim()
  return [
    {
      id: `grp-${categoryId}-toppings`,
      name: `${norm} Custom Add-ons & Toppings`,
      description: `Personalize your ${norm.toLowerCase()} with extra portions and signature toppings`,
      selection_type: 'multiple',
      is_required: false,
      min_select: 0,
      max_select: 4,
      is_active: true,
      sort_order: 1,
      options: [
        { id: `opt-${categoryId}-1`, name: 'Extra Premium Portion', price_by_tier: { single: 30, double: 50, triple: 75 }, is_default: false, is_active: true, sort_order: 1 },
        { id: `opt-${categoryId}-2`, name: 'Chef Special Herb Dressing', price_by_tier: { single: 15, double: 25, triple: 35 }, is_default: true, is_active: true, sort_order: 2 },
        { id: `opt-${categoryId}-3`, name: 'Gourmet Side Accompaniment', price_by_tier: { single: 25, double: 45, triple: 65 }, is_default: false, is_active: true, sort_order: 3 },
      ],
    },
    {
      id: `grp-${categoryId}-style`,
      name: 'Preparation Style & Spice Level',
      description: 'Select your preferred preparation preference',
      selection_type: 'single',
      is_required: true,
      min_select: 1,
      max_select: 1,
      is_active: true,
      sort_order: 2,
      options: [
        { id: `opt-${categoryId}-4`, name: 'Standard Chef Preparation', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: true, is_active: true, sort_order: 1 },
        { id: `opt-${categoryId}-5`, name: 'Spicy Seasoned Finish', price_by_tier: { single: 10, double: 15, triple: 20 }, is_default: false, is_active: true, sort_order: 2 },
        { id: `opt-${categoryId}-6`, name: 'Gluten-Conscious / Low Salt', price_by_tier: { single: 0, double: 0, triple: 0 }, is_default: false, is_active: true, sort_order: 3 },
      ],
    },
  ]
}

// Builds the 3 cohesive Card Radios representing the prototype tiers of the clicked category
function buildPrototypeCardsForCategory(cat) {
  const norm = (cat?.name || 'Category').trim()
  const key = norm.toLowerCase()

  let heroImage
  let sharedGroups
  let cardDefinitions

  if (key.includes('burger')) {
    heroImage = CATEGORY_HERO_IMAGES.burgers
    sharedGroups = BURGER_SHARED_GROUPS
    cardDefinitions = [
      {
        tier_key: 'single',
        name: 'Single Patty Burger',
        badge: 'Single (150g)',
        price: 280,
        description: 'Single 100% Angus smash patty, aged sharp cheddar, caramelized shallots, house secret sauce on toasted brioche.',
      },
      {
        tier_key: 'double',
        name: 'Double Prime Smash Burger',
        badge: 'Double (300g - Popular)',
        price: 380,
        description: 'Two 100% Angus smash patties, double aged sharp cheddar, caramelized shallots, house secret sauce on toasted brioche.',
      },
      {
        tier_key: 'triple',
        name: 'Triple Deluxe Burger',
        badge: 'Triple (450g - Feast)',
        price: 480,
        description: 'Three 100% Angus prime smash patties, triple aged sharp cheddar, house secret sauce on toasted brioche.',
      },
    ]
  } else if (key.includes('drink') || key.includes('beverage') || key.includes('juice') || key.includes('coffee')) {
    heroImage = CATEGORY_HERO_IMAGES.drinks
    sharedGroups = DRINKS_SHARED_GROUPS
    cardDefinitions = [
      {
        tier_key: 'single',
        name: 'Regular Glass (350ml)',
        badge: 'Standard 350ml',
        price: 120,
        description: 'Single serving cold or hot craft drink with fresh ingredients.',
      },
      {
        tier_key: 'double',
        name: 'Large Tumbler (500ml)',
        badge: 'Large 500ml (Popular)',
        price: 160,
        description: 'Generous tumbler size with customized milk & roast options.',
      },
      {
        tier_key: 'triple',
        name: 'Jumbo Pitcher (1000ml)',
        badge: 'Jumbo 1000ml (Sharing)',
        price: 240,
        description: 'Extra-large portion ideal for sharing with customized sweeteners.',
      },
    ]
  } else if (key.includes('dessert') || key.includes('sweet') || key.includes('cake')) {
    heroImage = CATEGORY_HERO_IMAGES.desserts
    sharedGroups = DESSERTS_SHARED_GROUPS
    cardDefinitions = [
      {
        tier_key: 'single',
        name: 'Individual Slice',
        badge: 'Single Portion',
        price: 180,
        description: 'Fresh individual portion with chef garnish.',
      },
      {
        tier_key: 'double',
        name: 'Double Sharing Platter',
        badge: 'Double (Popular)',
        price: 290,
        description: 'Generous double portion with choice of gelato pairing.',
      },
      {
        tier_key: 'triple',
        name: 'Whole Celebration Platter',
        badge: 'Party Platter',
        price: 490,
        description: 'Full celebration size with multiple sauces and toppings.',
      },
    ]
  } else {
    // Other categories: Appetizers, Sandwiches, Pizza, etc.
    heroImage = CATEGORY_HERO_IMAGES[key] || CATEGORY_HERO_IMAGES.fallback
    sharedGroups = getGenericSharedGroups(norm, cat?.id || 'gen')
    cardDefinitions = [
      {
        tier_key: 'single',
        name: `Standard ${norm}`,
        badge: 'Standard Portion',
        price: 240,
        description: `Classic single serving of ${norm.toLowerCase()} prepared fresh daily with signature seasoning.`,
      },
      {
        tier_key: 'double',
        name: `Deluxe ${norm}`,
        badge: 'Deluxe (Popular)',
        price: 340,
        description: `Enhanced double portion of ${norm.toLowerCase()} with generous premium additions.`,
      },
      {
        tier_key: 'triple',
        name: `Supreme ${norm} Platter`,
        badge: 'Supreme Platter',
        price: 480,
        description: `Full platter portion of ${norm.toLowerCase()} with all chef accompaniment options.`,
      },
    ]
  }

  // Create the 3 food items with the EXACT SAME extra_groups, but where price_delta reflects each card's tier_key
  return cardDefinitions.map((def, idx) => {
    const tierGroups = sharedGroups.map((grp) => ({
      ...grp,
      options: (grp.options || []).map((opt) => {
        const delta =
          opt.price_by_tier?.[def.tier_key] ??
          opt.price_delta ??
          (idx === 0 ? 25 : idx === 1 ? 45 : 65)
        return {
          id: opt.id,
          name: opt.name,
          price_delta: delta,
          price_by_tier: opt.price_by_tier || {
            single: delta,
            double: Math.round(delta * 1.5),
            triple: Math.round(delta * 2),
          },
          is_default: Boolean(opt.is_default),
          is_active: opt.is_active !== false,
          sort_order: opt.sort_order ?? 1,
        }
      }),
    }))

    return {
      id: `food-${cat?.id || 'cat'}-${def.tier_key}`,
      tier_key: def.tier_key,
      name: def.name,
      badge: def.badge,
      price: def.price,
      description: def.description,
      image_url: heroImage, // ONE unified picture across all card radios!
      extra_groups: tierGroups,
    }
  })
}

// Load prototype foods for category with local storage fallback
function getFoodsForCategory(cat) {
  if (!cat) return []
  try {
    const customStored = localStorage.getItem(`${CATEGORY_PROTOTYPE_KEY}_${cat.id}`)
    if (customStored) {
      const parsed = JSON.parse(customStored)
      if (Array.isArray(parsed) && parsed.length === 3) {
        return parsed
      }
    }
  } catch {
    // ignore
  }

  return buildPrototypeCardsForCategory(cat)
}

export default function MenuCategoryDetailsPage() {
  const { categoryId, itemId } = useParams()
  const [searchParams] = useSearchParams()
  const branchId = searchParams.get('branchId') || ''
  const merchantId = searchParams.get('merchantId') || ''
  const navigate = useNavigate()

  const isNew = itemId === 'new' || (!itemId && !categoryId)
  const lookupId = isNew ? (categoryId || 'burgers') : (itemId || categoryId)

  // 1. Load All Categories (combining menu categories and configured categories)
  const allCategories = useMemo(() => {
    const menuCats = loadStoredMenuCategories()
    const primaryCats = loadStoredCategories()

    const nameMap = new Map()
    menuCats.forEach((c) => {
      if (c && c.name) nameMap.set(c.name.toLowerCase(), c)
    })

    primaryCats.forEach((pc) => {
      if (pc && pc.name && !nameMap.has(pc.name.toLowerCase())) {
        nameMap.set(pc.name.toLowerCase(), {
          id: pc.id,
          category_id: pc.id,
          category_code: pc.code || 'FOOD',
          name: pc.name,
          description: pc.description || '',
          is_active: pc.is_active ?? true,
          sort_order: pc.sort_order || 99,
          requires_stock_quantity: Boolean(pc.requires_stock_quantity),
          requires_unit: Boolean(pc.requires_unit),
          requires_sku: Boolean(pc.requires_sku),
          requires_prescription: Boolean(pc.requires_prescription),
          is_age_restricted_category: Boolean(pc.is_age_restricted_category ?? pc.is_age_restricted),
          is_age_restricted: Boolean(pc.is_age_restricted_category ?? pc.is_age_restricted),
        })
      }
    })

    return Array.from(nameMap.values())
  }, [])

  // 2. Resolve Existing Item if editing
  const existingStoredItem = useMemo(() => {
    if (!itemId || itemId === 'new') return null
    try {
      const raw = localStorage.getItem(MENU_ITEMS_STORAGE_KEY)
      const all = raw ? JSON.parse(raw) : []
      if (Array.isArray(all)) {
        return all.find((i) => String(i.id) === String(itemId)) || null
      }
    } catch {
      // ignore
    }
    return null
  }, [itemId])

  // 3. Resolve Active Category (gracefully fallback so NEVER shows "not found")
  const category = useMemo(() => {
    if (!allCategories.length) return null
    if (existingStoredItem?.menu_category_id) {
      const found = allCategories.find((c) => c.id === existingStoredItem.menu_category_id)
      if (found) return found
    }
    if (existingStoredItem?.category_type) {
      const found = allCategories.find((c) => c.name?.toLowerCase() === existingStoredItem.category_type?.toLowerCase())
      if (found) return found
    }
    return (
      allCategories.find(
        (c) =>
          c.id === lookupId ||
          c.category_code?.toLowerCase() === lookupId?.toLowerCase() ||
          c.name?.toLowerCase() === lookupId?.toLowerCase()
      ) || allCategories[0]
    )
  }, [allCategories, lookupId, existingStoredItem])

  // Form State for Menu Item Details
  const [itemName, setItemName] = useState(() => existingStoredItem?.name || '')
  const [itemBasePrice, setItemBasePrice] = useState(() => existingStoredItem?.price ?? 280)
  const [itemCategoryName, setItemCategoryName] = useState(() => existingStoredItem?.category_type || category?.name || 'Burgers')
  const [itemDescription, setItemDescription] = useState(() => existingStoredItem?.description || '')
  const [itemStock, setItemStock] = useState(() => existingStoredItem?.stock_quantity ?? 50)
  const [itemSku, setItemSku] = useState(() => existingStoredItem?.sku || '')
  const [itemUnit, setItemUnit] = useState(() => existingStoredItem?.unit || 'pcs')
  const [itemIsAvailable, setItemIsAvailable] = useState(() => existingStoredItem?.is_available !== false)
  const [itemImageUrl, setItemImageUrl] = useState(() => existingStoredItem?.image_url || '')
  const [itemRequiresPrescription, setItemRequiresPrescription] = useState(() => Boolean(existingStoredItem?.requires_prescription))
  const [itemIsAgeRestricted, setItemIsAgeRestricted] = useState(() => Boolean(existingStoredItem?.is_age_restricted))
  const fileInputRef = useRef(null)

  // Active category derived dynamically from selected category dropdown
  const activeSelectedCategory = useMemo(() => {
    if (itemCategoryName) {
      const match = allCategories.find(
        (c) => c.name?.toLowerCase() === itemCategoryName.toLowerCase()
      )
      if (match) return match
    }
    return category || allCategories[0] || null
  }, [itemCategoryName, allCategories, category])

  // Dynamic UI flags strictly derived from selected category's JSON configuration:
  // 1. requires_stock_quantity -> Show or hide Stock Quantity input
  const showStockQuantityInput = Boolean(activeSelectedCategory?.requires_stock_quantity)

  // 2. requires_unit -> Show or hide Unit of Measure input
  const showUnitInput = Boolean(activeSelectedCategory?.requires_unit)

  // 3. requires_sku -> Show or hide SKU input
  const showSkuInput = Boolean(activeSelectedCategory?.requires_sku)

  // 4. requires_prescription -> Show or hide Prescription-related field
  const showPrescriptionField = Boolean(activeSelectedCategory?.requires_prescription)

  // 5. is_age_restricted_category -> Show or hide relevant Age Restriction field
  const showAgeRestrictedField = Boolean(
    activeSelectedCategory?.is_age_restricted_category ?? activeSelectedCategory?.is_age_restricted
  )

  const [prevItemId, setPrevItemId] = useState(itemId)
  if (itemId !== prevItemId) {
    setPrevItemId(itemId)
    if (existingStoredItem) {
      setItemName(existingStoredItem.name || '')
      setItemBasePrice(existingStoredItem.price ?? 280)
      setItemCategoryName(existingStoredItem.category_type || category?.name || 'Burgers')
      setItemDescription(existingStoredItem.description || '')
      setItemStock(existingStoredItem.stock_quantity ?? 50)
      setItemSku(existingStoredItem.sku || '')
      setItemUnit(existingStoredItem.unit || 'pcs')
      setItemIsAvailable(existingStoredItem.is_available !== false)
      setItemImageUrl(existingStoredItem.image_url || '')
      setItemRequiresPrescription(Boolean(existingStoredItem.requires_prescription))
      setItemIsAgeRestricted(Boolean(existingStoredItem.is_age_restricted))
    }
  }

  // 4. Load & Initialize Food Items (Portion Size Variants / Card Radios)
  const [foodItems, setFoodItems] = useState(() => getFoodsForCategory(category))
  const [selectedFoodId, setSelectedFoodId] = useState(() => foodItems[1]?.id || foodItems[0]?.id || '')

  // Keep state synchronized if category changes during navigation
  const [prevCatId, setPrevCatId] = useState(category?.id)
  if (category && category.id !== prevCatId) {
    setPrevCatId(category.id)
    const freshFoods = getFoodsForCategory(category)
    setFoodItems(freshFoods)
    setSelectedFoodId(freshFoods[1]?.id || freshFoods[0]?.id || '')
  }

  const currentFood = useMemo(() => {
    return foodItems.find((f) => f.id === selectedFoodId) || foodItems[0] || null
  }, [foodItems, selectedFoodId])

  // Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setItemImageUrl(event.target.result)
        showToast('Image uploaded successfully.')
      }
    }
    reader.readAsDataURL(file)
  }

  // Navigation Back Handler
  const handleBack = () => {
    if (merchantId && branchId) {
      navigate(`/merchants/${merchantId}/branches/${branchId}`)
    } else if (merchantId) {
      navigate(`/merchants/${merchantId}`)
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/restaurants')
    }
  }

  // Search filter inside extra options
  const [searchQuery, setSearchQuery] = useState('')

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null)
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Modals state
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false)
  const [optionModalMode, setOptionModalMode] = useState('add') // 'add' | 'edit'
  const [targetGroupId, setTargetGroupId] = useState('')
  const [editingOption, setEditingOption] = useState(null)

  const [optionFormData, setOptionFormData] = useState({
    name: '',
    price_delta: 0,
    is_default: false,
    is_active: true,
    sort_order: 1,
    apply_to_all_variants: false,
  })

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [groupModalMode, setGroupModalMode] = useState('add') // 'add' | 'edit'
  const [editingGroup, setEditingGroup] = useState(null)
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: '',
    selection_type: 'single', // 'single' | 'multiple'
    is_required: false,
    max_select: 1,
  })

  // Portion Size Modal state
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false)
  const [sizeModalMode, setSizeModalMode] = useState('add') // 'add' | 'edit'
  const [editingSize, setEditingSize] = useState(null)
  const [sizeFormData, setSizeFormData] = useState({
    name: '',
    badge: '',
    price: 280,
    description: '',
    is_default: false,
  })

  // Quick inline price editing state (optionId -> number)
  const [editingPriceOptId, setEditingPriceOptId] = useState(null)
  const [tempPriceInput, setTempPriceInput] = useState('')

  // Persist foodItems to localStorage and sync database representations
  const saveFoodsState = (updatedFoods, toastText) => {
    setFoodItems(updatedFoods)
    try {
      if (category?.id) {
        localStorage.setItem(`${CATEGORY_PROTOTYPE_KEY}_${category.id}`, JSON.stringify(updatedFoods))
      }

      // Also persist to general menu items key for backward compatibility
      const stored = localStorage.getItem(MENU_ITEMS_STORAGE_KEY)
      let all = stored ? JSON.parse(stored) : []
      if (!Array.isArray(all)) all = []

      updatedFoods.forEach((food) => {
        const idx = all.findIndex((x) => x.id === food.id)
        if (idx >= 0) {
          all[idx] = { ...all[idx], ...food }
        } else {
          all.push({
            ...food,
            menu_category_id: category?.id,
            category_type: category?.name,
          })
        }
      })
      localStorage.setItem(MENU_ITEMS_STORAGE_KEY, JSON.stringify(all))

      // Also persist flat extra options and groups for database sync
      const flatOptions = []
      const flatGroups = []
      const activeFood = updatedFoods.find((f) => f.id === currentFood?.id) || updatedFoods[0]
      if (activeFood) {
        (activeFood.extra_groups || []).forEach((grp) => {
          flatGroups.push({
            id: grp.id,
            category_id: category?.id,
            food_id: activeFood.id,
            name: grp.name,
            description: grp.description,
            selection_type: grp.selection_type,
            is_required: grp.is_required,
            max_select: grp.max_select,
            is_active: grp.is_active,
            sort_order: grp.sort_order,
          })
          ;(grp.options || []).forEach((opt) => {
            flatOptions.push({
              id: opt.id,
              group_id: grp.id,
              name: opt.name,
              price_delta: opt.price_delta,
              is_default: opt.is_default,
              is_active: opt.is_active,
              sort_order: opt.sort_order,
            })
          })
        })
      }
      localStorage.setItem('menu_item_extra_groups', JSON.stringify(flatGroups))
      localStorage.setItem('menu_item_extra_options', JSON.stringify(flatOptions))
    } catch (e) {
      console.error('Failed to sync extra options:', e)
    }

    if (toastText) showToast(toastText)
  }

  // --- Handlers for Extra Options ---
  const handleOpenAddOptionModal = (groupId) => {
    setTargetGroupId(groupId)
    setEditingOption(null)
    setOptionModalMode('add')
    const grp = currentFood?.extra_groups?.find((g) => g.id === groupId)
    const nextOrder = (grp?.options?.length || 0) + 1
    setOptionFormData({
      name: '',
      price_delta: 0,
      is_default: false,
      is_active: true,
      sort_order: nextOrder,
      apply_to_all_variants: true,
    })
    setIsOptionModalOpen(true)
  }

  const handleOpenEditOptionModal = (groupId, option) => {
    setTargetGroupId(groupId)
    setEditingOption(option)
    setOptionModalMode('edit')
    setOptionFormData({
      name: option.name || '',
      price_delta: option.price_delta ?? 0,
      is_default: Boolean(option.is_default),
      is_active: option.is_active !== false,
      sort_order: option.sort_order ?? 1,
      apply_to_all_variants: false,
    })
    setIsOptionModalOpen(true)
  }

  // Save Option (Synchronizes option structure across all 3 card radios, while handling price for current or all cards)
  const handleSaveOption = (e) => {
    e.preventDefault()
    if (!currentFood || !targetGroupId) return
    const optName = optionFormData.name.trim()
    if (!optName) {
      showToast('Please enter an option name.')
      return
    }

    const priceNum = Number(optionFormData.price_delta) || 0
    const applyToAll = optionFormData.apply_to_all_variants

    const updatedFoods = foodItems.map((food) => {
      const isTargetFood = food.id === currentFood.id

      const updatedGroups = (food.extra_groups || []).map((grp) => {
        if (grp.id !== targetGroupId) return grp

        let updatedOpts = [...(grp.options || [])]
        if (optionModalMode === 'edit' && editingOption) {
          // If setting this option as default in single choice, reset other defaults
          if (optionFormData.is_default && grp.selection_type === 'single') {
            updatedOpts = updatedOpts.map((o) => ({ ...o, is_default: false }))
          }
          updatedOpts = updatedOpts.map((opt) => {
            if (opt.id !== editingOption.id) return opt

            // Update price_delta for this card, or if applyToAll is true, apply to all cards
            const updatedPriceDelta = isTargetFood || applyToAll ? priceNum : opt.price_delta
            return {
              ...opt,
              name: optName,
              price_delta: updatedPriceDelta,
              is_default: optionFormData.is_default,
              is_active: optionFormData.is_active,
              sort_order: Number(optionFormData.sort_order) || 1,
            }
          })
        } else {
          // Add mode: Add option across all 3 card radios
          const newOptId = editingOption?.id || generateUUID()
          if (optionFormData.is_default && grp.selection_type === 'single') {
            updatedOpts = updatedOpts.map((o) => ({ ...o, is_default: false }))
          }
          const newOpt = {
            id: newOptId,
            name: optName,
            price_delta: priceNum,
            is_default: optionFormData.is_default,
            is_active: optionFormData.is_active,
            sort_order: Number(optionFormData.sort_order) || updatedOpts.length + 1,
          }
          updatedOpts.push(newOpt)
        }

        updatedOpts.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        return { ...grp, options: updatedOpts }
      })

      return { ...food, extra_groups: updatedGroups }
    })

    saveFoodsState(
      updatedFoods,
      optionModalMode === 'edit'
        ? `Updated option "${optName}" for ${currentFood.name}`
        : `Added option "${optName}" across prototype`
    )
    setIsOptionModalOpen(false)
  }

  // Quick inline update price for selected card radio
  const handleInlinePriceSave = (groupId, optionId, newPrice) => {
    const val = Math.max(0, parseFloat(newPrice) || 0)
    const updatedFoods = foodItems.map((food) => {
      if (food.id !== currentFood.id) return food
      const updatedGroups = (food.extra_groups || []).map((grp) => {
        if (grp.id !== groupId) return grp
        const updatedOpts = (grp.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, price_delta: val } : opt
        )
        return { ...grp, options: updatedOpts }
      })
      return { ...food, extra_groups: updatedGroups }
    })

    saveFoodsState(updatedFoods, `Updated price adjustment to +${val.toFixed(2)} ETB`)
    setEditingPriceOptId(null)
  }

  // Quick toggle active (Synchronized across all card radios for clean master visibility control)
  const handleToggleOptionActive = (groupId, optionId) => {
    if (!currentFood) return
    const currentOpt = currentFood.extra_groups
      ?.find((g) => g.id === groupId)
      ?.options?.find((o) => o.id === optionId)
    const nextState = currentOpt ? currentOpt.is_active === false : false

    const updatedFoods = foodItems.map((food) => {
      const updatedGroups = (food.extra_groups || []).map((grp) => {
        if (grp.id !== groupId) return grp
        const updatedOpts = (grp.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, is_active: nextState } : opt
        )
        return { ...grp, options: updatedOpts }
      })
      return { ...food, extra_groups: updatedGroups }
    })
    saveFoodsState(updatedFoods, `Option visibility set to ${nextState ? 'Active' : 'Inactive'}`)
  }

  // Quick toggle default (Synchronized across all card radios)
  const handleToggleOptionDefault = (groupId, optionId) => {
    if (!currentFood) return
    const targetGroup = currentFood.extra_groups?.find((g) => g.id === groupId)
    const isSingle = targetGroup?.selection_type === 'single'
    const targetOpt = targetGroup?.options?.find((o) => o.id === optionId)
    const nextDefault = !targetOpt?.is_default

    const updatedFoods = foodItems.map((food) => {
      const updatedGroups = (food.extra_groups || []).map((grp) => {
        if (grp.id !== groupId) return grp
        const updatedOpts = (grp.options || []).map((opt) => {
          if (opt.id === optionId) {
            return { ...opt, is_default: nextDefault }
          }
          if (isSingle && nextDefault) {
            return { ...opt, is_default: false }
          }
          return opt
        })
        return { ...grp, options: updatedOpts }
      })
      return { ...food, extra_groups: updatedGroups }
    })
    saveFoodsState(updatedFoods, nextDefault ? 'Set as default choice' : 'Removed default flag')
  }

  // Delete Option across all card radios
  const handleDeleteOption = (groupId, optionId, optionName) => {
    if (!window.confirm(`Are you sure you want to delete option "${optionName}"?`)) return

    const updatedFoods = foodItems.map((food) => {
      const updatedGroups = (food.extra_groups || []).map((grp) => {
        if (grp.id !== groupId) return grp
        const updatedOpts = (grp.options || []).filter((opt) => opt.id !== optionId)
        return { ...grp, options: updatedOpts }
      })
      return { ...food, extra_groups: updatedGroups }
    })
    saveFoodsState(updatedFoods, `Removed option "${optionName}"`)
  }

  // --- Handlers for Groups (Synchronized across all card radios) ---
  const handleOpenAddGroupModal = () => {
    setGroupModalMode('add')
    setEditingGroup(null)
    setGroupFormData({
      name: '',
      description: '',
      selection_type: 'single',
      is_required: false,
      max_select: 1,
    })
    setIsGroupModalOpen(true)
  }

  const handleOpenEditGroupModal = (grp) => {
    setGroupModalMode('edit')
    setEditingGroup(grp)
    setGroupFormData({
      name: grp.name || '',
      description: grp.description || '',
      selection_type: grp.selection_type || 'single',
      is_required: Boolean(grp.is_required),
      max_select: grp.max_select || 1,
    })
    setIsGroupModalOpen(true)
  }

  const handleSaveGroup = (e) => {
    e.preventDefault()
    const grpName = groupFormData.name.trim()
    if (!grpName) {
      showToast('Please enter a group name.')
      return
    }

    const newGroupId = editingGroup ? editingGroup.id : generateUUID()

    const updatedFoods = foodItems.map((food) => {
      let groups = [...(food.extra_groups || [])]

      if (groupModalMode === 'edit' && editingGroup) {
        groups = groups.map((g) =>
          g.id === editingGroup.id
            ? {
                ...g,
                name: grpName,
                description: groupFormData.description.trim(),
                selection_type: groupFormData.selection_type,
                is_required: groupFormData.is_required,
                max_select: Number(groupFormData.max_select) || 1,
              }
            : g
        )
      } else {
        const newGroup = {
          id: newGroupId,
          name: grpName,
          description: groupFormData.description.trim(),
          selection_type: groupFormData.selection_type,
          is_required: groupFormData.is_required,
          min_select: groupFormData.is_required ? 1 : 0,
          max_select: Number(groupFormData.max_select) || 1,
          is_active: true,
          sort_order: groups.length + 1,
          options: [],
        }
        groups.push(newGroup)
      }
      return { ...food, extra_groups: groups }
    })

    saveFoodsState(
      updatedFoods,
      groupModalMode === 'edit'
        ? `Updated group "${grpName}"`
        : `Created new group "${grpName}"`
    )
    setIsGroupModalOpen(false)
  }

  const handleDeleteGroup = (groupId, groupName) => {
    if (!window.confirm(`Delete group "${groupName}" and all its extra options across all variants?`)) return

    const updatedFoods = foodItems.map((food) => {
      const groups = (food.extra_groups || []).filter((g) => g.id !== groupId)
      return { ...food, extra_groups: groups }
    })
    saveFoodsState(updatedFoods, `Deleted group "${groupName}"`)
  }

  // --- Handlers for Portion Sizes (menu_item_sizes) ---
  const handleOpenAddSizeModal = () => {
    setEditingSize(null)
    setSizeModalMode('add')
    setSizeFormData({
      name: '',
      badge: '',
      price: parseFloat(itemBasePrice) || 280,
      description: '',
      is_default: foodItems.length === 0,
    })
    setIsSizeModalOpen(true)
  }

  const handleOpenEditSizeModal = (food) => {
    setEditingSize(food)
    setSizeModalMode('edit')
    setSizeFormData({
      name: food.name || '',
      badge: food.badge || '',
      price: food.price ?? 280,
      description: food.description || '',
      is_default: Boolean(food.is_default),
    })
    setIsSizeModalOpen(true)
  }

  const handleSaveSize = (e) => {
    e.preventDefault()
    const sName = sizeFormData.name.trim()
    if (!sName) {
      showToast('Please enter a size name.')
      return
    }
    const sPrice = Math.max(0, parseFloat(sizeFormData.price) || 0)

    if (sizeModalMode === 'edit' && editingSize) {
      const updated = foodItems.map((f) => {
        if (f.id !== editingSize.id) {
          return sizeFormData.is_default ? { ...f, is_default: false } : f
        }
        return {
          ...f,
          name: sName,
          badge: sizeFormData.badge.trim() || sName,
          price: sPrice,
          description: sizeFormData.description.trim(),
          is_default: sizeFormData.is_default,
        }
      })
      saveFoodsState(updated, `Updated portion size "${sName}"`)
    } else {
      const newId = generateUUID()
      const newSize = {
        id: newId,
        tier_key: `tier_${foodItems.length + 1}`,
        name: sName,
        badge: sizeFormData.badge.trim() || sName,
        price: sPrice,
        description: sizeFormData.description.trim(),
        image_url: categoryPicture,
        is_default: sizeFormData.is_default || foodItems.length === 0,
        is_active: true,
        extra_groups: JSON.parse(JSON.stringify(currentFood?.extra_groups || [])),
      }
      let updated = sizeFormData.is_default
        ? foodItems.map((f) => ({ ...f, is_default: false }))
        : [...foodItems]
      updated.push(newSize)
      saveFoodsState(updated, `Added portion size "${sName}"`)
      setSelectedFoodId(newId)
    }
    setIsSizeModalOpen(false)
  }

  const handleDeleteSize = (sizeId, sizeName) => {
    if (foodItems.length <= 1) {
      showToast('At least one portion size is required.')
      return
    }
    if (!window.confirm(`Delete portion size "${sizeName}"?`)) return
    const remaining = foodItems.filter((f) => f.id !== sizeId)
    if (selectedFoodId === sizeId) {
      setSelectedFoodId(remaining[0].id)
    }
    saveFoodsState(remaining, `Deleted portion size "${sizeName}"`)
  }

  const handleToggleSizeDefault = (sizeId) => {
    const updated = foodItems.map((f) => ({
      ...f,
      is_default: f.id === sizeId,
    }))
    saveFoodsState(updated, 'Default portion size updated.')
  }

  const handleToggleSizeActive = (sizeId) => {
    const updated = foodItems.map((f) =>
      f.id === sizeId ? { ...f, is_active: f.is_active === false ? true : false } : f
    )
    saveFoodsState(updated, 'Portion status updated.')
  }

  const handleInlineSizePriceSave = (sizeId, newPrice) => {
    const val = Math.max(0, parseFloat(newPrice) || 0)
    const updated = foodItems.map((f) => (f.id === sizeId ? { ...f, price: val } : f))
    saveFoodsState(updated, `Updated portion price to ETB ${val.toFixed(2)}`)
    setEditingPriceOptId(null)
  }

  // Unified single picture for this category or item
  const categoryPicture = itemImageUrl || currentFood?.image_url || CATEGORY_HERO_IMAGES.fallback

  const handleSaveAll = () => {
    const finalName = itemName.trim() || currentFood?.name || ''
    if (!finalName) {
      showToast('Please enter a menu item name.')
      return
    }

    const priceNum = parseFloat(itemBasePrice) || currentFood?.price || 0
    if (priceNum <= 0) {
      showToast('Please enter a valid base price.')
      return
    }

    const targetId = isNew ? generateUUID() : (itemId || existingStoredItem?.id || generateUUID())

    const savedItemData = {
      id: targetId,
      name: finalName,
      category_type: itemCategoryName || activeSelectedCategory?.name || category?.name || 'Burgers',
      menu_category_id: activeSelectedCategory?.id || category?.id,
      price: priceNum,
      description: itemDescription.trim() || currentFood?.description || '',
      sku: showSkuInput ? (itemSku.trim() || `SKU-${targetId.slice(-4).toUpperCase()}`) : '',
      unit: showUnitInput ? (itemUnit || 'pcs') : '',
      stock_quantity: showStockQuantityInput ? (parseInt(itemStock, 10) || 0) : null,
      is_available: itemIsAvailable,
      image_url: itemImageUrl || categoryPicture,
      requires_prescription: showPrescriptionField ? Boolean(itemRequiresPrescription) : false,
      is_age_restricted: showAgeRestrictedField ? Boolean(itemIsAgeRestricted) : false,
      merchant_id: merchantId || 'm-1',
      merchant_branch_id: branchId || 'b-1',
      sizes: foodItems.map((f, idx) => ({
        id: `sz-${targetId}-${idx + 1}`,
        name: f.badge || f.name,
        price_delta: Math.max(0, (f.price || priceNum) - priceNum),
        is_default: idx === 0,
        is_active: true,
        sort_order: idx + 1,
      })),
      extra_groups: currentFood?.extra_groups || [],
    }

    // Save to demoMenuItems storage
    saveMenuItem(savedItemData)

    // Save category prototype customization
    if (category?.id) {
      try {
        localStorage.setItem(`${CATEGORY_PROTOTYPE_KEY}_${category.id}`, JSON.stringify(foodItems))
      } catch (err) {
        console.error(err)
      }
    }

    showToast(`"${savedItemData.name}" and extra customizations saved successfully!`)
    setTimeout(() => {
      handleBack()
    }, 600)
  }

  return (
    <MainLayout
      activeMenuKey="merchantManagement"
      breadcrumbParent="Merchants"
      breadcrumbMiddle="Menu Items"
      breadcrumbCurrent={category?.name ? `${category.name} Customizations` : 'Menu Item Customizations'}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 dark:bg-white dark:text-zinc-900">
          <span className="material-symbols-outlined text-lg text-[#FF6B35]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 pb-20">
        {/* Header Action Bar */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                title="Return to Menu Items"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
              </button>
              <h1 className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-3xl">
                {isNew ? 'Add Menu Item & Extra Customizations' : `${itemName || currentFood?.name || 'Menu Item'} — Details & Customizations`}
              </h1>
            </div>
            
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
              {category?.description || `Food item configurations, portion sizes, and extra option customizations`}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f] active:scale-95"
            >
              <span className="material-symbols-outlined text-base">check</span>
              <span>Save Menu Item</span>
            </button>
          </div>
        </section>

        {/* 1. Core Menu Item Details (Merged from Add Menu Item modal) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60 text-xs font-black">
                1
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                Menu Item Core Details & Information
              </h3>
            </div>

            {/* Catalog Status Toggle */}
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Status:</span>
              <button
                type="button"
                onClick={() => setItemIsAvailable(!itemIsAvailable)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                  itemIsAvailable
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${itemIsAvailable ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                {itemIsAvailable ? 'Active for Orders' : 'Paused (Hidden)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Form Fields: 8 cols */}
            <div className="space-y-4 lg:col-span-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Item Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Prime Truffle Smash Burger"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    {activeSelectedCategory && (
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                        {`[${[
                          showStockQuantityInput && 'stock',
                          showUnitInput && 'unit',
                          showSkuInput && 'sku',
                          showPrescriptionField && 'rx',
                          showAgeRestrictedField && '18+',
                        ].filter(Boolean).join(', ') || 'default'}]`}
                      </span>
                    )}
                  </div>
                  <select
                    value={itemCategoryName}
                    onChange={(e) => {
                      setItemCategoryName(e.target.value)
                    }}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Core Fields Row: Base Price (always) + SKU + Stock + Unit (controlled by JSON flags) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Base Price (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={itemBasePrice}
                    onChange={(e) => setItemBasePrice(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-bold text-slate-900 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                </div>

                {showSkuInput && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={itemSku}
                      onChange={(e) => setItemSku(e.target.value)}
                      placeholder="e.g. SKU-84920"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                )}

                {showStockQuantityInput && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={itemStock}
                      onChange={(e) => setItemStock(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 font-mono text-xs font-medium text-slate-900 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                )}

                {showUnitInput && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                      Unit of Measure
                    </label>
                    <select
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      <option value="pcs">Pieces (pcs)</option>
                      <option value="portion">Portion</option>
                      <option value="plate">Plate</option>
                      <option value="glass">Glass</option>
                      <option value="bottle">Bottle</option>
                      <option value="cup">Cup</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="box">Box</option>
                      <option value="strip">Strip</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Item Description
                </label>
                <textarea
                  rows="2"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="Ingredients, preparation method, allergens, or chef notes..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-900 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {(showPrescriptionField || showAgeRestrictedField) && (
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {showPrescriptionField && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-sky-700 dark:text-sky-400">
                      <input
                        type="checkbox"
                        checked={itemRequiresPrescription}
                        onChange={(e) => setItemRequiresPrescription(e.target.checked)}
                        className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500"
                      />
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">medication</span>
                        Requires Prescription (Rx Pharmacy)
                      </span>
                    </label>
                  )}
                  {showAgeRestrictedField && (
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <input
                        type="checkbox"
                        checked={itemIsAgeRestricted}
                        onChange={(e) => setItemIsAgeRestricted(e.target.checked)}
                        className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">no_adult_content</span>
                        Age-Restricted 18+ (Alcohol & Spirits)
                      </span>
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* Photo preview: 4 cols */}
            <div className="lg:col-span-4">
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                Item Photo
              </label>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-850">
                <div className="relative h-36 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
                  <img
                    src={categoryPicture}
                    alt={itemName || 'Product photo'}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs">
                    {itemImageUrl ? 'Custom Image' : 'Hero Preset'}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-col gap-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span>
                    <span>Upload Photo</span>
                  </button>
                  {itemImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setItemImageUrl('')
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="text-center text-[11px] font-medium text-rose-500 hover:underline"
                    >
                      Reset to Category Hero
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Portion Sizes & Variants - Styled EXACTLY like Cheese & Gourmet Toppings */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          {/* Group Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-850">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60 text-xs font-black">
                  2
                </span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  Portion Sizes & Variants
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                  Single Selection (Pick 1)
                </span>
                <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                  Required Selection
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Customer portion serving sizes and base prices. Select a row to view and tune its extra option prices below.
              </p>
            </div>

            {/* Group Header Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenAddSizeModal}
                className="inline-flex items-center gap-1 rounded-xl bg-[#FF6B35] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#e0531f]"
                title="Add portion size variant"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Size</span>
              </button>
            </div>
          </div>

          {/* Individual Portion Sizes Data Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800 dark:bg-zinc-900">
                <tr>
                  <th className="px-5 py-3">Option / Size Name</th>
                  <th className="px-5 py-3 text-right">Base Price</th>
                  <th className="px-5 py-3 text-center">Default Portion</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Active For Tuning</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {foodItems.map((food, idx) => {
                  const isSelected = food.id === currentFood?.id
                  const isDefault = food.is_default !== undefined ? food.is_default : idx === 0

                  return (
                    <tr
                      key={food.id}
                      onClick={() => setSelectedFoodId(food.id)}
                      className={`cursor-pointer transition ${
                        isSelected
                          ? 'bg-orange-50/50 dark:bg-orange-950/20'
                          : 'hover:bg-slate-50/70 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* Option Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
                              isSelected
                                ? 'bg-[#FF6B35] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">straighten</span>
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-zinc-100">
                                {food.name}
                              </span>
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                                {food.badge || 'Portion'}
                              </span>
                            </div>
                            {food.description && (
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-zinc-400">
                                {food.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Base Price with inline editing */}
                      <td className="px-5 py-3.5 text-right font-mono font-bold">
                        {editingPriceOptId === `size-${food.id}` ? (
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative">
                              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-[10px] text-slate-400">
                                ETB
                              </span>
                              <input
                                type="number"
                                step="1"
                                min="0"
                                value={tempPriceInput}
                                onChange={(e) => setTempPriceInput(e.target.value)}
                                className="w-24 rounded-lg border border-[#FF6B35] bg-white py-1 pl-8 pr-1 text-right text-xs font-mono font-bold text-slate-900 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleInlineSizePriceSave(food.id, tempPriceInput)
                                  } else if (e.key === 'Escape') {
                                    setEditingPriceOptId(null)
                                  }
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleInlineSizePriceSave(food.id, tempPriceInput)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Save Price"
                            >
                              <span className="material-symbols-outlined text-xs">check</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceOptId(null)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 dark:border-zinc-700"
                              title="Cancel"
                            >
                              <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingPriceOptId(`size-${food.id}`)
                              setTempPriceInput(String(food.price || 0))
                            }}
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                            title="Click to inline edit size price"
                          >
                            <span>ETB {Number(food.price || 0).toFixed(2)}</span>
                            <span className="material-symbols-outlined text-[11px] opacity-40">edit</span>
                          </button>
                        )}
                      </td>

                      {/* Default Option Toggle */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleSizeDefault(food.id)
                          }}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                            isDefault
                              ? 'bg-orange-100 text-[#FF6B35] ring-1 ring-[#FF6B35]/30 dark:bg-orange-950/60 dark:text-orange-400'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:bg-zinc-800 dark:text-zinc-500'
                          }`}
                          title={isDefault ? 'Default serving size' : 'Set as default'}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {isDefault ? 'radio_button_checked' : 'radio_button_unchecked'}
                          </span>
                          <span>{isDefault ? 'Default' : 'Set Default'}</span>
                        </button>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleSizeActive(food.id)
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition ${
                            food.is_active !== false
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400'
                              : 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-500'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              food.is_active !== false ? 'bg-emerald-500' : 'bg-zinc-400'
                            }`}
                          />
                          <span>{food.is_active !== false ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Active For Tuning Indicator */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition ${
                            isSelected
                              ? 'bg-[#FF6B35] text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xs">
                            {isSelected ? 'check_circle' : 'tune'}
                          </span>
                          <span>{isSelected ? 'Editing Extras' : 'Click to Tune'}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEditSizeModal(food)
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                            title="Edit portion size"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSize(food.id, food.name)
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                            title="Delete portion size"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Extra Option Groups & Individual Extra Options Editor */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          
          {/* Section Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-5 py-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60 text-xs font-black">
                3
              </span>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Extra Option Groups & Add-ons
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Option visibility, defaults, and names are synchronized. Price adjustments apply to the selected tier.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* 1. Tier Selector Dropdown */}
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tier:
                </span>
                <select
                  value={selectedFoodId}
                  onChange={(e) => setSelectedFoodId(e.target.value)}
                  className="h-8 appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-8 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {foodItems.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.badge || f.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 text-sm text-slate-400">
                  expand_more
                </span>
              </div>

              {/* 2. Search filter */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-40 rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-700 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400">
                  <span className="material-symbols-outlined text-sm">search</span>
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>

              {/* 3. Add Group Button */}
              <button
                type="button"
                onClick={handleOpenAddGroupModal}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Group</span>
              </button>
            </div>
          </div>

          {/* Group Cards List Container */}
          <div className="space-y-4 p-5 bg-slate-50/30 dark:bg-zinc-900/10">

          {/* Group Cards List */}
          {(!currentFood?.extra_groups || currentFood.extra_groups.length === 0) ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B35] dark:bg-orange-950/40">
                <span className="material-symbols-outlined text-2xl">tune</span>
              </div>
              <h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-zinc-200">
                No extra options configured for {category?.name || 'this category'}
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                Create customization groups like "Cheese & Toppings", "Sauce Selection", or "Choice of Sides".
              </p>
              <button
                type="button"
                onClick={handleOpenAddGroupModal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Create First Option Group</span>
              </button>
            </div>
          ) : (
            currentFood.extra_groups.map((group) => {
              const filteredOptions = (group.options || []).filter((opt) =>
                searchQuery
                  ? opt.name.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              )

              return (
                <div
                  key={group.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                >
                  {/* Group Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-850">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-['Plus_Jakarta_Sans'] text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                          {group.name}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            group.selection_type === 'single'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                          }`}
                        >
                          {group.selection_type === 'single'
                            ? 'Single Selection (Pick 1)'
                            : `Multi-Select (Max ${group.max_select || 'Unlimited'})`}
                        </span>
                        {group.is_required ? (
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                            Required Selection
                          </span>
                        ) : (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                            Optional Add-on
                          </span>
                        )}
                      </div>
                      {group.description && (
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                          {group.description}
                        </p>
                      )}
                    </div>

                    {/* Group Header Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAddOptionModal(group.id)}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#FF6B35] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#e0531f]"
                        title="Add extra option to this group"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span>Add Option</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditGroupModal(group)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                        title="Edit option group settings"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteGroup(group.id, group.name)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        title="Delete group across all variants"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Individual Extra Options Data Grid (menu_item_extra_options) */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-zinc-800 dark:bg-zinc-900">
                        <tr>
                          <th className="px-5 py-3">Option Name</th>
                          <th className="px-5 py-3 text-right">
                            Price Adjustment ({currentFood.name})
                          </th>
                          <th className="px-5 py-3 text-center">Default Option</th>
                          <th className="px-5 py-3 text-center">Status</th>
                          <th className="px-5 py-3 text-center">Sort Order</th>
                          <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {filteredOptions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                              {searchQuery
                                ? `No options matching "${searchQuery}"`
                                : 'No extra options in this group yet. Click "+ Add Option" above.'}
                            </td>
                          </tr>
                        ) : (
                          filteredOptions.map((opt) => (
                            <tr
                              key={opt.id}
                              className="transition hover:bg-slate-50/70 dark:hover:bg-zinc-800/40"
                            >
                              {/* Option Name */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                                    <span className="material-symbols-outlined text-sm">tune</span>
                                  </span>
                                  <span className="font-bold text-slate-900 dark:text-zinc-100">
                                    {opt.name}
                                  </span>
                                </div>
                              </td>

                              {/* Price Adjustment for selected card radio with quick inline editing */}
                              <td className="px-5 py-3.5 text-right font-mono font-bold">
                                {editingPriceOptId === opt.id ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <div className="relative">
                                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 text-[10px] text-slate-400">
                                        +
                                      </span>
                                      <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        value={tempPriceInput}
                                        onChange={(e) => setTempPriceInput(e.target.value)}
                                        className="w-20 rounded-lg border border-[#FF6B35] bg-white py-1 pl-4 pr-1 text-right text-xs font-mono font-bold text-slate-900 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleInlinePriceSave(group.id, opt.id, tempPriceInput)
                                          } else if (e.key === 'Escape') {
                                            setEditingPriceOptId(null)
                                          }
                                        }}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleInlinePriceSave(group.id, opt.id, tempPriceInput)}
                                      className="rounded-lg bg-emerald-600 p-1 text-white hover:bg-emerald-700"
                                      title="Save price"
                                    >
                                      <span className="material-symbols-outlined text-xs">check</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingPriceOptId(null)}
                                      className="rounded-lg bg-slate-200 p-1 text-slate-600 hover:bg-slate-300 dark:bg-zinc-700 dark:text-zinc-300"
                                      title="Cancel"
                                    >
                                      <span className="material-symbols-outlined text-xs">close</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-end gap-1.5 group/price">
                                    {Number(opt.price_delta) === 0 ? (
                                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                                        Free / 0.00
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        +{Number(opt.price_delta).toFixed(2)} ETB
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingPriceOptId(opt.id)
                                        setTempPriceInput(String(opt.price_delta ?? 0))
                                      }}
                                      className="opacity-0 group-hover/price:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-[#FF6B35]"
                                      title="Quick edit price for this card"
                                    >
                                      <span className="material-symbols-outlined text-xs">edit</span>
                                    </button>
                                  </div>
                                )}
                              </td>

                              {/* Default Flag (Clickable switch) */}
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleOptionDefault(group.id, opt.id)}
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                    opt.is_default
                                      ? 'bg-emerald-100 text-emerald-800 shadow-2xs hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                  }`}
                                  title="Click to toggle default option across variants"
                                >
                                  <span
                                    className={`material-symbols-outlined text-xs ${
                                      opt.is_default ? 'text-emerald-700' : 'text-slate-400'
                                    }`}
                                  >
                                    {opt.is_default ? 'check_circle' : 'radio_button_unchecked'}
                                  </span>
                                  <span>{opt.is_default ? 'Default' : 'Optional'}</span>
                                </button>
                              </td>

                              {/* Active Status (Clickable switch) */}
                              <td className="px-5 py-3.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleOptionActive(group.id, opt.id)}
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                                    opt.is_active !== false
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400'
                                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400'
                                  }`}
                                  title="Click to toggle active availability across variants"
                                >
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      opt.is_active !== false ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  />
                                  <span>{opt.is_active !== false ? 'Active' : 'Inactive'}</span>
                                </button>
                              </td>

                              {/* Sort Order */}
                              <td className="px-5 py-3.5 text-center font-mono text-xs font-bold text-slate-500 dark:text-zinc-400">
                                #{opt.sort_order ?? 1}
                              </td>

                              {/* Action Buttons */}
                              <td className="px-5 py-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditOptionModal(group.id, opt)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                    title="Edit option"
                                  >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOption(group.id, opt.id, opt.name)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                                    title="Delete option"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
              })
            )}
          </div>
        </div>

        {/* Sticky Bottom Save Action Bar */}
        <div className="sticky bottom-6 z-40 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#FF6B35]">inventory</span>
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-300">
              Saving updates product catalog attributes and extra option customizations simultaneously.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B35] px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#e0531f] active:scale-95"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Save Menu Item & Customizations</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add / Edit Extra Option */}
      {isOptionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOptionModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                  <span className="material-symbols-outlined text-lg">
                    {optionModalMode === 'edit' ? 'edit' : 'add'}
                  </span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                    {optionModalMode === 'edit' ? 'Edit Extra Option' : 'Add New Extra Option'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Individual add-on option within this group
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOptionModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveOption} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Option Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra Aged Sharp Cheddar"
                  value={optionFormData.name}
                  onChange={(e) => setOptionFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Price Adjustment for {currentFood?.name} (ETB)
                  </label>
                  <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#FF6B35] dark:bg-orange-950/40">
                    {currentFood?.badge}
                  </span>
                </div>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">
                    + ETB
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="0.00 (Enter 0 for free choice)"
                    value={optionFormData.price_delta}
                    onChange={(e) =>
                      setOptionFormData((prev) => ({
                        ...prev,
                        price_delta: Math.max(0, parseFloat(e.target.value) || 0),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-16 pr-3.5 text-xs font-mono font-bold text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Set 0 if this option is included without extra charge for {currentFood?.name}.
                </p>

                <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-850">
                  <input
                    type="checkbox"
                    id="applyToAllVariants"
                    checked={optionFormData.apply_to_all_variants}
                    onChange={(e) =>
                      setOptionFormData((prev) => ({
                        ...prev,
                        apply_to_all_variants: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <label htmlFor="applyToAllVariants" className="text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                    Apply this price adjustment to all 3 size variants
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Default Flag */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Default Option
                    </span>
                    <span className="text-[10px] text-slate-400">Selected by default</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={optionFormData.is_default}
                    onChange={(e) =>
                      setOptionFormData((prev) => ({ ...prev, is_default: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                      Active Status
                    </span>
                    <span className="text-[10px] text-slate-400">Available to order</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={optionFormData.is_active}
                    onChange={(e) =>
                      setOptionFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                    className="h-4 w-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Display Order Priority
                </label>
                <input
                  type="number"
                  min="1"
                  value={optionFormData.sort_order}
                  onChange={(e) =>
                    setOptionFormData((prev) => ({
                      ...prev,
                      sort_order: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOptionModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{optionModalMode === 'edit' ? 'Save Option' : 'Add Option'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Option Group */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsGroupModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                  <span className="material-symbols-outlined text-lg">layers</span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                    {groupModalMode === 'edit' ? 'Edit Option Group' : 'New Option Group'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Group container for related customizations across all variants
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Group Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cheese Selection, Add-on Toppings"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Choose up to 2 extra gourmet cheeses"
                  value={groupFormData.description}
                  onChange={(e) =>
                    setGroupFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Selection Type
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGroupFormData((prev) => ({ ...prev, selection_type: 'single', max_select: 1 }))}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      groupFormData.selection_type === 'single'
                        ? 'border-[#FF6B35] bg-orange-50/50 text-[#FF6B35] dark:border-orange-500 dark:bg-orange-950/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">Single Choice</span>
                    <span className="text-[10px] text-slate-400">Pick exactly 1</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupFormData((prev) => ({ ...prev, selection_type: 'multiple', max_select: 3 }))}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      groupFormData.selection_type === 'multiple'
                        ? 'border-[#FF6B35] bg-orange-50/50 text-[#FF6B35] dark:border-orange-500 dark:bg-orange-950/20'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="block text-xs font-bold">Multi-Select</span>
                    <span className="text-[10px] text-slate-400">Choose multiple</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Required Selection
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Customer must make a choice before checkout
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={groupFormData.is_required}
                  onChange={(e) =>
                    setGroupFormData((prev) => ({ ...prev, is_required: e.target.checked }))
                  }
                  className="h-4 w-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>

              {groupFormData.selection_type === 'multiple' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Maximum Allowed Choices
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={groupFormData.max_select}
                    onChange={(e) =>
                      setGroupFormData((prev) => ({
                        ...prev,
                        max_select: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{groupModalMode === 'edit' ? 'Save Group' : 'Create Group'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add / Edit Portion Size Variant */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSizeModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60">
                  <span className="material-symbols-outlined text-lg">straighten</span>
                </span>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900 dark:text-zinc-100">
                    {sizeModalMode === 'edit' ? 'Edit Portion Size' : 'Add Portion Size'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Configure portion size variant and baseline pricing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveSize} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Portion Size Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regular, Large, Family Pack"
                  value={sizeFormData.name}
                  onChange={(e) => setSizeFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Badge / Short Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Standard, 350g, 12-inch"
                    value={sizeFormData.badge}
                    onChange={(e) => setSizeFormData((prev) => ({ ...prev, badge: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                    Base Price (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="280.00"
                    value={sizeFormData.price}
                    onChange={(e) => setSizeFormData((prev) => ({ ...prev, price: e.target.value }))}
                    required
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Serves 1-2 people, approx 350 grams"
                  value={sizeFormData.description}
                  onChange={(e) => setSizeFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-850">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Default Selection
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Pre-selected serving size on the customer menu
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={sizeFormData.is_default}
                  onChange={(e) => setSizeFormData((prev) => ({ ...prev, is_default: e.target.checked }))}
                  className="h-4 w-4 rounded text-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsSizeModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#e0531f]"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{sizeModalMode === 'edit' ? 'Save Changes' : 'Add Size'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}