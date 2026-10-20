import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import {
  loadStoredMenuCategories,
  generateUUID,
} from '../data/demoMenuCategories'
import { MENU_ITEMS_STORAGE_KEY } from '../data/demoMenuItems'

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
  const { categoryId } = useParams()
  const navigate = useNavigate()

  // 1. Load All Categories
  const allCategories = useMemo(() => {
    return loadStoredMenuCategories()
  }, [])

  // 2. Resolve Active Category (gracefully fallback so NEVER shows "not found")
  const category = useMemo(() => {
    if (!allCategories.length) return null
    return (
      allCategories.find(
        (c) =>
          c.id === categoryId ||
          c.category_code?.toLowerCase() === categoryId?.toLowerCase() ||
          c.name?.toLowerCase() === categoryId?.toLowerCase()
      ) || allCategories[0]
    )
  }, [allCategories, categoryId])

  // 3. Load & Initialize Food Items (3 Prototype Card Radios)
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

  // Unified single picture for this category
  const categoryPicture = currentFood?.image_url || CATEGORY_HERO_IMAGES.fallback

  return (
    <MainLayout
      activeMenuKey="menuCategory"
      breadcrumbParent="Dashboard"
      breadcrumbMiddle="Menu Categories"
      breadcrumbCurrent={category?.name || 'Category Customization'}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/10 dark:bg-white dark:text-zinc-900">
          <span className="material-symbols-outlined text-lg text-[#FF6B35]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6 pb-20">
        {/* Header matching Cuisine Types style and orientation */}
        <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100">
                {category?.name || 'Menu Category'}
              </h1>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
              {category?.description || `Cuisine types and menu customizations for merchants within each category`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/menu-categories')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              title="Return to Menu Categories"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Menu Categories
            </button>
            <button
              type="button"
              onClick={handleOpenAddGroupModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B35] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#e0531f]"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add Option Group
            </button>
          </div>
        </section>

        {/* 1. Food Item Selector - 3 Prototype Card Radios with ONE cohesive picture */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60 text-xs font-black">
                1
              </span>
              <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                Select a Food Item in "{category?.name}" to Adjust Customizations
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Select a card radio below to update and adjust its extra option prices
            </span>
          </div>

          {/* Top Prototype Preview Banner with ONE picture */}
          <div className="mb-4 flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-850/60">
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xs dark:border-zinc-700">
              <img
                src={categoryPicture}
                alt={category?.name || 'Category Prototype'}
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1 right-1 rounded-sm bg-black/60 px-1 py-0.2 text-[9px] font-bold text-white">
                Prototype
              </span>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-['Plus_Jakarta_Sans'] text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                  {category?.name} Master Prototype
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  Synchronized Groups & Visibility
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                All 3 size variants share identical option groups. Select a tier card to view or adjust its specific Price Adjustment.
              </p>
            </div>
          </div>

          {/* 3 Cohesive Card Radios */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {foodItems.map((food) => {
              const isSelected = food.id === currentFood?.id

              return (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => setSelectedFoodId(food.id)}
                  className={`group relative flex flex-col rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-[#FF6B35] bg-orange-50/30 shadow-md ring-2 ring-[#FF6B35]/25 dark:border-[#FF6B35] dark:bg-orange-950/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                  }`}
                >
                  {/* Radio indicator and Portion badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                          isSelected
                            ? 'border-[#FF6B35] bg-[#FF6B35]'
                            : 'border-slate-300 bg-white dark:border-zinc-600 dark:bg-zinc-800'
                        }`}
                      >
                        {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <span className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-[#FF6B35] transition-colors">
                        {food.name}
                      </span>
                    </div>

                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        isSelected
                          ? 'bg-[#FF6B35] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      {food.badge || 'Standard'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-2 line-clamp-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    {food.description}
                  </p>

                  {/* Base Price & Price Adjustment Status */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Base Price
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-zinc-100">
                        ETB {Number(food.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Price Delta
                      </span>
                      <span
                        className={`text-[11px] font-bold ${
                          isSelected ? 'text-[#FF6B35]' : 'text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {isSelected ? 'Active for Editing' : 'Click to View'}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Active selection banner with current food details */}
          {currentFood && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-200/70 bg-orange-50/60 px-4 py-2.5 text-xs text-orange-950 dark:border-orange-900/40 dark:bg-orange-950/20 dark:text-orange-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#FF6B35]">tune</span>
                <span>
                  Adjusting Price Adjustments for: <strong>{currentFood.name}</strong> (Base: ETB {Number(currentFood.price || 0).toFixed(2)})
                </span>
              </div>
              <span className="text-[11px] font-medium text-orange-700 dark:text-orange-300">
                Toggling active or default switches updates all variants
              </span>
            </div>
          )}
        </div>

        {/* 2. Extra Option Groups & Individual Extra Options Editor */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-100 text-[#FF6B35] dark:bg-orange-950/60 text-xs font-black">
                2
              </span>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Extra Option Groups & Individual Extra Options
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Option visibility, defaults, and option names are synchronized. Price adjustments reflect {currentFood?.name}.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search filter within options */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 shadow-2xs focus:border-[#FF6B35] focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
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

              {/* Add New Group Button */}
              <button
                type="button"
                onClick={handleOpenAddGroupModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Option Group</span>
              </button>
            </div>
          </div>

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
    </MainLayout>
  )
}