/**
 * Multi-Vendor Merchant Seed Data & Storage Utilities
 * Supports diverse merchants: Restaurants, Groceries, Pharmacies, Retail, Bakeries, Beverages, etc.
 * Enriched with Category Name alignment (Food, Grocery, Pharmacy, Retail, Flowers & Gifts, Package),
 * regulatory compliance licenses (EFDA / Agri), cold-chain flags, delivery SLAs, and domain specialties.
 */

export const STORAGE_KEY = 'deliver_app_merchants_data'

export const MERCHANT_TYPES = [
  'Food',
  'Grocery',
  'Pharmacy',
  'Retail',
  'Flowers & Gifts',
  'Services',
  'Package',
]

/**
 * Returns visual and categorization metadata for a given merchant category
 */
export function getCategoryMeta(catName = '') {
  const norm = String(catName).toLowerCase()
  if (norm.includes('pharm') || norm.includes('health') || norm.includes('med')) {
    return {
      label: 'Pharmacy',
      code: 'PHARMACY',
      icon: 'medication',
      badgeClass: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300',
      pillClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40',
      borderClass: 'border-sky-200 dark:border-sky-800',
      accentColor: '#0284C7',
    }
  }
  if (norm.includes('groc') || norm.includes('market') || norm.includes('supermarket')) {
    return {
      label: 'Grocery',
      code: 'GROCERY',
      icon: 'local_grocery_store',
      badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300',
      pillClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
      borderClass: 'border-emerald-200 dark:border-emerald-800',
      accentColor: '#10B981',
    }
  }
  if (
    norm.includes('food') ||
    norm.includes('restaurant') ||
    norm.includes('dining') ||
    norm.includes('bakery') ||
    norm.includes('cafe') ||
    norm.includes('burger') ||
    norm.includes('sushi') ||
    norm.includes('pizza')
  ) {
    return {
      label: 'Food',
      code: 'FOOD',
      icon: 'restaurant',
      badgeClass: 'bg-orange-50 text-[#FF6B35] ring-1 ring-orange-600/20 dark:bg-orange-950/40 dark:text-orange-300',
      pillClass: 'text-[#FF6B35] bg-orange-50 dark:bg-orange-950/40',
      borderClass: 'border-orange-200 dark:border-orange-800',
      accentColor: '#FF6B35',
    }
  }
  if (
    norm.includes('retail') ||
    norm.includes('tech') ||
    norm.includes('spirit') ||
    norm.includes('beverage') ||
    norm.includes('pet')
  ) {
    return {
      label: 'Retail',
      code: 'RETAIL',
      icon: 'shopping_bag',
      badgeClass: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300',
      pillClass: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
      borderClass: 'border-purple-200 dark:border-purple-800',
      accentColor: '#9333EA',
    }
  }
  if (norm.includes('flower') || norm.includes('gift')) {
    return {
      label: 'Flowers & Gifts',
      code: 'FLOWERS_GIFTS',
      icon: 'local_florist',
      badgeClass: 'bg-pink-50 text-pink-700 ring-1 ring-pink-600/20 dark:bg-pink-950/40 dark:text-pink-300',
      pillClass: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40',
      borderClass: 'border-pink-200 dark:border-pink-800',
      accentColor: '#EC4899',
    }
  }
  if (norm.includes('package') || norm.includes('courier') || norm.includes('parcel')) {
    return {
      label: 'Package',
      code: 'PACKAGE',
      icon: 'inventory_2',
      badgeClass: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-300',
      pillClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
      borderClass: 'border-indigo-200 dark:border-indigo-800',
      accentColor: '#4F46E5',
    }
  }
  return {
    label: catName || 'General',
    code: 'GENERAL',
    icon: 'category',
    badgeClass: 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20 dark:bg-zinc-800 dark:text-zinc-300',
    pillClass: 'text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800',
    borderClass: 'border-slate-200 dark:border-zinc-700',
    accentColor: '#64748B',
  }
}

export const defaultMerchants = [
  // ==========================================
  // PHARMACY & HEALTHCARE MERCHANTS
  // ==========================================
  {
    id: 'm-003',
    name: 'MedExpress Care Pharmacy',
    category_name: 'Pharmacy',
    category_code: 'PHARMACY',
    type: 'Pharmacy & Health',
    locations: 6,
    status: 'Active',
    description: 'Licensed 24/7 pharmaceutical dispensary providing certified prescription refills, pediatric medication, diabetes care, and sterile first aid supplies.',
    sort_order: 1,
    created_at: new Date(Date.now() - 100 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 998 1122',
    email: 'care@medexpress.com',
    address: '750 Healthcare Way, Bole Medical District',
    commission_rate: 8,
    license_number: 'EFDA-MED-2024-8841',
    specialties: ['Prescription Refills (Rx)', 'Insulin Cold-Storage', 'OTC Pain & Cold', 'Pediatric Antibiotics'],
    is_rx_licensed: true,
    is_emergency_247: true,
    is_cold_chain: true,
    delivery_sla: '15-25 min',
    min_order: 'ETB 150',
    average_rating: 4.9,
    total_reviews: 418,
    is_featured: true,
  },
  {
    id: 'm-013',
    name: 'CurePoint 24/7 Compound Pharmacy',
    category_name: 'Pharmacy',
    category_code: 'PHARMACY',
    type: 'Pharmacy & Health',
    locations: 4,
    status: 'Active',
    description: 'Specialized sterile compounding pharmacy handling custom medical dosage preparations, chronic care fulfillment, and cold-chain temperature-controlled insulin.',
    sort_order: 2,
    created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=150&auto=format&fit=crop&q=80',
    phone: '+251 92 334 5566',
    email: 'rx@curepointpharmacy.com',
    address: '14 Red Cross Boulevard, Kirkos',
    commission_rate: 8,
    license_number: 'EFDA-MED-2023-7412',
    specialties: ['Sterile Compounding', 'Chronic Care Refills', 'Vaccine Cold-Chain', 'Cardiac Prescriptions'],
    is_rx_licensed: true,
    is_emergency_247: true,
    is_cold_chain: true,
    delivery_sla: '20-30 min',
    min_order: 'ETB 200',
    average_rating: 4.8,
    total_reviews: 289,
    is_featured: false,
  },
  {
    id: 'm-014',
    name: 'PharmaPlus Wellness & Rx Depot',
    category_name: 'Pharmacy',
    category_code: 'PHARMACY',
    type: 'Pharmacy & Health',
    locations: 5,
    status: 'Active',
    description: 'Full-line community pharmacy with certified pharmacist consultations, diagnostic monitors, infant wellness supplies, and daily health vitamins.',
    sort_order: 3,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 445 6677',
    email: 'info@pharmaplus.et',
    address: '22 Mazoria Commercial Center, Bole',
    commission_rate: 9,
    license_number: 'EFDA-MED-2024-9102',
    specialties: ['Blood Pressure Monitors', 'Pediatric Syrups', 'Diabetic Test Strips', 'Prenatal Vitamins'],
    is_rx_licensed: true,
    is_emergency_247: false,
    is_cold_chain: true,
    delivery_sla: '20-35 min',
    min_order: 'ETB 120',
    average_rating: 4.7,
    total_reviews: 195,
    is_featured: false,
  },
  {
    id: 'm-015',
    name: 'GreenCross Health & Herbal Dispensary',
    category_name: 'Pharmacy',
    category_code: 'PHARMACY',
    type: 'Pharmacy & Health',
    locations: 3,
    status: 'Active',
    description: 'Holistic wellness and OTC dispensary offering approved natural therapeutic remedies, skin wellness serums, herbal tonics, and preventive health.',
    sort_order: 4,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=150&auto=format&fit=crop&q=80',
    phone: '+251 93 556 7788',
    email: 'wellness@greencross.et',
    address: '88 Wellness Avenue, Kazanchis',
    commission_rate: 10,
    license_number: 'EFDA-MED-2022-5509',
    specialties: ['Natural Therapeutic Remedies', 'Dermatological Creams', 'Immunity Boosters', 'Organic Herbal Teas'],
    is_rx_licensed: false,
    is_emergency_247: false,
    is_cold_chain: false,
    delivery_sla: '25-40 min',
    min_order: 'ETB 180',
    average_rating: 4.8,
    total_reviews: 160,
    is_featured: false,
  },
  {
    id: 'm-016',
    name: 'LifeCare Clinical Pharmacy',
    category_name: 'Pharmacy',
    category_code: 'PHARMACY',
    type: 'Pharmacy & Health',
    locations: 2,
    status: 'Active',
    description: 'Hospital-adjacent 24/7 clinical pharmacy providing express delivery of critical hospital discharge prescriptions, wound care, and specialized medication.',
    sort_order: 5,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=150&auto=format&fit=crop&q=80',
    phone: '+251 94 889 0011',
    email: 'dispatch@lifecarepharm.com',
    address: 'Opposite Black Lion Hospital, Lideta',
    commission_rate: 8,
    license_number: 'EFDA-MED-2024-3388',
    specialties: ['Hospital Discharge Meds', 'Orthopedic Braces', 'Post-Op Wound Care', 'Elderly Pill Organizers'],
    is_rx_licensed: true,
    is_emergency_247: true,
    is_cold_chain: true,
    delivery_sla: '15-20 min',
    min_order: 'ETB 250',
    average_rating: 4.9,
    total_reviews: 312,
    is_featured: true,
  },
  {
    id: 'm-023',
    name: 'RedCross Emergency 24/7 Dispensary',
    category_name: 'Pharmacy',
    category_code: 'PHARMACY',
    type: 'Pharmacy & Health',
    locations: 6,
    status: 'Active',
    description: 'Rapid response 24/7 emergency pharmacy depot providing priority dispatch of critical asthma rescue inhalers, insulin pens, trauma wound dressings, and fever reducers.',
    sort_order: 6,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 100 2233',
    email: 'emergency@redcrossdispensary.et',
    address: '10 Red Cross Way, Sarbet Medical Hub',
    commission_rate: 8,
    license_number: 'EFDA-MED-2024-5510',
    specialties: ['Emergency Rescue Inhalers', 'Injectable Insulin Depot', 'Cardiac Emergency Kits', 'Trauma Wound Care'],
    is_rx_licensed: true,
    is_emergency_247: true,
    is_cold_chain: true,
    delivery_sla: '10-20 min',
    min_order: 'ETB 100',
    average_rating: 5.0,
    total_reviews: 490,
    is_featured: true,
  },
  {
    id: 'm-024',
    name: 'Apex Pediatric & Maternal Pharmacy',
    category_name: 'Pharmacy',
    category_code: 'PHARMACY',
    type: 'Pharmacy & Health',
    locations: 3,
    status: 'Active',
    description: 'Specialized healthcare dispensary offering certified pediatric liquid suspensions, maternal prenatals, infant nebulizers, baby rehydration salts, and gentle skincare.',
    sort_order: 7,
    created_at: new Date(Date.now() - 50 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=150&auto=format&fit=crop&q=80',
    phone: '+251 92 778 9911',
    email: 'care@apexpediatricrx.com',
    address: '55 Mother & Child Boulevard, Bole Sub-City',
    commission_rate: 8,
    license_number: 'EFDA-MED-2024-7723',
    specialties: ['Pediatric Liquid Suspensions', 'Maternal Health Prenatals', 'Nebulizers & Spacers', 'Baby Formula & Electrolites'],
    is_rx_licensed: true,
    is_emergency_247: false,
    is_cold_chain: true,
    delivery_sla: '15-30 min',
    min_order: 'ETB 150',
    average_rating: 4.9,
    total_reviews: 215,
    is_featured: false,
  },

  // ==========================================
  // GROCERY & SUPERMARKET MERCHANTS
  // ==========================================
  {
    id: 'm-002',
    name: 'Whole Harvest Organic Market',
    category_name: 'Grocery',
    category_code: 'GROCERY',
    type: 'Grocery & Supermarket',
    locations: 5,
    status: 'Active',
    description: 'Certified organic produce, local farm dairy, gluten-free pantry essentials, fresh bulk goods, and heirloom cold-pressed culinary oils.',
    sort_order: 6,
    created_at: new Date(Date.now() - 110 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 876 5432',
    email: 'support@wholeharvest.com',
    address: '1100 Green Blvd, West End, Old Airport',
    commission_rate: 10,
    license_number: 'AGRI-ORG-2024-118',
    specialties: ['Certified Organic Vegetables', 'Highland Farm Dairy', 'Gluten-Free Flour', 'Cold-Pressed Oils'],
    is_cold_chain: true,
    is_emergency_247: false,
    delivery_sla: '25-40 min',
    min_order: 'ETB 300',
    average_rating: 4.8,
    total_reviews: 532,
    is_featured: true,
  },
  {
    id: 'm-007',
    name: 'FreshMart 24/7 Supermarket',
    category_name: 'Grocery',
    category_code: 'GROCERY',
    type: 'Grocery & Supermarket',
    locations: 15,
    status: 'Active',
    description: 'Round-the-clock neighborhood supermarket providing express daily grocery delivery, dairy, eggs, pantry staples, and cleaning products.',
    sort_order: 7,
    created_at: new Date(Date.now() - 250 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 321 7654',
    email: 'contact@freshmart247.com',
    address: '500 Central Avenue, Meskel Square',
    commission_rate: 10,
    license_number: 'COMM-RET-2023-994',
    specialties: ['Express 20-Min Essentials', 'Fresh Bakery & Eggs', 'Household Cleaning', 'Pantry Grains & Rice'],
    is_cold_chain: true,
    is_emergency_247: true,
    delivery_sla: '15-25 min',
    min_order: 'ETB 150',
    average_rating: 4.7,
    total_reviews: 640,
    is_featured: true,
  },
  {
    id: 'm-017',
    name: 'Addis Green Farm Organics & Dairy',
    category_name: 'Grocery',
    category_code: 'GROCERY',
    type: 'Grocery & Supermarket',
    locations: 4,
    status: 'Active',
    description: 'Direct farm cooperative supplying morning-fresh pasteurized milk, traditional ayib cheese, premium white maganaja teff, and crisp greens.',
    sort_order: 8,
    created_at: new Date(Date.now() - 80 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=150&auto=format&fit=crop&q=80',
    phone: '+251 92 667 8899',
    email: 'orders@addisgreenfarm.com',
    address: '42 Debre Zeit Road, Kality Depot',
    commission_rate: 9,
    license_number: 'AGRI-DAIRY-2024-402',
    specialties: ['Fresh Pasteurized Milk', 'Artisan Butter & Ayib', 'Organic Berbere & Teff', 'Hydroponic Greens'],
    is_cold_chain: true,
    is_emergency_247: false,
    delivery_sla: '20-35 min',
    min_order: 'ETB 200',
    average_rating: 4.9,
    total_reviews: 345,
    is_featured: false,
  },
  {
    id: 'm-018',
    name: 'Metro Hypermarket & Pantry Goods',
    category_name: 'Grocery',
    category_code: 'GROCERY',
    type: 'Grocery & Supermarket',
    locations: 8,
    status: 'Active',
    description: 'Large-scale hypermarket stocking over 12,000 pantry items, bulk grains, olive oils, imported spices, and complete family household groceries.',
    sort_order: 9,
    created_at: new Date(Date.now() - 150 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 112 3344',
    email: 'info@metrohypermarket.et',
    address: 'Mega Mall Ground Floor, Bole Medhanialem',
    commission_rate: 10,
    license_number: 'COMM-RET-2022-875',
    specialties: ['Bulk Rice & Pasta', 'Imported Olive Oils', 'Family Pack Canned Goods', 'Baby Food & Formula'],
    is_cold_chain: false,
    is_emergency_247: false,
    delivery_sla: '30-50 min',
    min_order: 'ETB 400',
    average_rating: 4.6,
    total_reviews: 480,
    is_featured: false,
  },
  {
    id: 'm-019',
    name: 'Gourmet Butcher & Deli Essentials',
    category_name: 'Grocery',
    category_code: 'GROCERY',
    type: 'Grocery & Supermarket',
    locations: 3,
    status: 'Active',
    description: 'Hygienic butcher shop and European deli offering prime cuts, specialty aged steaks, cold-chain packaged poultry, and imported cheeses.',
    sort_order: 10,
    created_at: new Date(Date.now() - 70 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=150&auto=format&fit=crop&q=80',
    phone: '+251 93 221 4455',
    email: 'butcher@gourmetdeli.com',
    address: '29 Atlas Hotel Street, Bole',
    commission_rate: 12,
    license_number: 'FOOD-MEAT-2024-619',
    specialties: ['Prime Aged Ribeye', 'Fresh Minced Beef (Kitfo)', 'Gouda & Cheddar Cheeses', 'Marinated Poultry'],
    is_cold_chain: true,
    is_emergency_247: false,
    delivery_sla: '20-30 min',
    min_order: 'ETB 350',
    average_rating: 4.9,
    total_reviews: 275,
    is_featured: false,
  },
  {
    id: 'm-025',
    name: 'SunRipe Tropical Produce & Organics',
    category_name: 'Grocery',
    category_code: 'GROCERY',
    type: 'Grocery & Supermarket',
    locations: 5,
    status: 'Active',
    description: 'Fresh highland ripe avocados, organic papayas, sun-kissed mangoes, crisp local garden vegetables, and cold-pressed pure sugarcane juice.',
    sort_order: 11,
    created_at: new Date(Date.now() - 65 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 789 4433',
    email: 'fresh@sunripeorganics.et',
    address: '77 Orchard Lane, Old Airport Residential Area',
    commission_rate: 9,
    license_number: 'AGRI-FRUIT-2024-331',
    specialties: ['Highland Ripe Avocados', 'Organic Papayas & Citrus', 'Cold-Pressed Cane Juices', 'Fresh Garden Salad Mix'],
    is_cold_chain: true,
    is_emergency_247: false,
    delivery_sla: '20-30 min',
    min_order: 'ETB 150',
    average_rating: 4.9,
    total_reviews: 388,
    is_featured: true,
  },
  {
    id: 'm-026',
    name: 'Bole Artisan Dairy & Gourmet Farm Depot',
    category_name: 'Grocery',
    category_code: 'GROCERY',
    type: 'Grocery & Supermarket',
    locations: 4,
    status: 'Active',
    description: 'Farmstead refrigerated dairy depot offering traditional probiotic kefir, cultured cow butter, aged smoked gouda, organic eggs, and raw honeycomb.',
    sort_order: 12,
    created_at: new Date(Date.now() - 85 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=150&auto=format&fit=crop&q=80',
    phone: '+251 92 445 1199',
    email: 'dairy@boledepot.com',
    address: '19 Dairy Valley Road, Bole Bulbula',
    commission_rate: 10,
    license_number: 'AGRI-DAIRY-2024-884',
    specialties: ['Aged Gouda & Mozzarella', 'Farm-Fresh Greek Yogurt', 'Cultured Cow Butter', 'Probiotic Kefir Drinks'],
    is_cold_chain: true,
    is_emergency_247: false,
    delivery_sla: '15-25 min',
    min_order: 'ETB 200',
    average_rating: 4.8,
    total_reviews: 290,
    is_featured: false,
  },

  // ==========================================
  // FOOD, RESTAURANT & CAFE MERCHANTS
  // ==========================================
  {
    id: 'm-001',
    name: 'The Burger Collective',
    category_name: 'Food',
    category_code: 'FOOD',
    type: 'Restaurant & Dining',
    locations: 8,
    status: 'Active',
    description: 'Fresh prime Angus beef patties, toasted brioche buns, melted cheddar, and house-made artisan barbecue sauces.',
    sort_order: 11,
    created_at: new Date(Date.now() - 90 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFRDuht5UUADKd0HllFwOJDeE3JBLMu_46u5n8nsCdPLpHH8BuBeJZaNLjoUxLehXVdTj_iAfCy6dc7H_lctXhQqe27jPepaK6IA7GlMqbTUogMgcLZ8r6zHZ90Hy4Zu-tZsmHB7-LKh5-4XzcNkj4S3Mta2qIsnDrfK6ughLgrFtSm4hOlCbjVtqE9sDNK9Cxh4MqJ71G0UPwG3I3ljbQkppfZH5zaUXr0RsFAg75wPNdvyANxYzDdQjEP8A8Y4_cZmcNz5VfoHA',
    phone: '+251 91 234 5678',
    email: 'orders@burgercollective.com',
    address: '428 Market Street, Downtown Bole',
    commission_rate: 15,
    license_number: 'REST-DINE-2023-104',
    specialties: ['Prime Smash Burgers', 'Truffle Parmesan Fries', 'Handcrafted Milkshakes', 'Crispy Chicken Sliders'],
    delivery_sla: '20-30 min',
    min_order: 'ETB 180',
    average_rating: 4.8,
    total_reviews: 820,
    is_featured: true,
  },
  {
    id: 'm-006',
    name: 'Caffe Bella Artisan Roastery',
    category_name: 'Food',
    category_code: 'FOOD',
    type: 'Bakery & Cafe',
    locations: 12,
    status: 'Active',
    description: 'Single-origin Ethiopian Yirgacheffe pour-overs, nitro cold brew, artisanal teas, and fresh baked flaky croissants.',
    sort_order: 12,
    created_at: new Date(Date.now() - 210 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 678 9012',
    email: 'hello@caffebella.com',
    address: '15 Roasted Bean Alley, Sarbet',
    commission_rate: 14,
    license_number: 'REST-CAFE-2022-771',
    specialties: ['Single-Origin Yirgacheffe', 'Nitro Cascara Infusion', 'French Butter Croissants', 'Pistachio Tarts'],
    delivery_sla: '15-25 min',
    min_order: 'ETB 120',
    average_rating: 4.9,
    total_reviews: 950,
    is_featured: true,
  },
  {
    id: 'm-004',
    name: 'Sashimi Zen Omakase',
    category_name: 'Food',
    category_code: 'FOOD',
    type: 'Restaurant & Dining',
    locations: 3,
    status: 'Active',
    description: 'Wild ocean-caught nigiri, omakase sushi platters, fresh salmon sashimi, and authentic Japanese hand rolls.',
    sort_order: 13,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCgm3zm21EQNCetbzOgS2fPmVnxZvbwUVKPx7Kglx0_K8Xzn2y93Ec70Ae5RxZeyVcpDC5UtO_RNzyRHIFbt7T5-J_A63VOJ3mMvcMqd8hCbglzUMRn3-G7-jIi69O6uo9Pk14nr47x-DUOzHJM__w3BgcI8xGgo19g8OGtKGICWkUzGpnYUl3Ky6S6VW8XZbrVUUuPmk00L19GgLomUChxfk3-L0dlAp19Txqv8Yv7GPjGcSx6C0TRbZKdsX_eOppSnm0YEV1hrM',
    phone: '+251 91 345 6789',
    email: 'concierge@sashimizen.com',
    address: '88 Waterfront Pier, Marina District',
    commission_rate: 18,
    license_number: 'REST-DINE-2023-305',
    specialties: ['Chef Omakase Platters', 'Spicy Salmon Rolls', 'Tuna Nigiri Set', 'Miso Glazed Black Cod'],
    delivery_sla: '30-45 min',
    min_order: 'ETB 450',
    average_rating: 4.9,
    total_reviews: 420,
    is_featured: false,
  },
  {
    id: 'm-011',
    name: 'Habesha Bites & Grill',
    category_name: 'Food',
    category_code: 'FOOD',
    type: 'Restaurant & Dining',
    locations: 6,
    status: 'Active',
    description: 'Authentic 100% teff injera served with sizzling derek tibs, slow-cooked doro wat, and kitfo tartare with spiced butter.',
    sort_order: 14,
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 223 9988',
    email: 'contact@habeshabites.com',
    address: '210 Addis Way, Piazza',
    commission_rate: 15,
    license_number: 'REST-DINE-2022-440',
    specialties: ['Special Kitfo with Kocho', 'Derek Tibs Platter', 'Doro Wat with Hard-boiled Egg', 'Beyaynetu Fasting Platter'],
    delivery_sla: '25-40 min',
    min_order: 'ETB 250',
    average_rating: 4.9,
    total_reviews: 670,
    is_featured: true,
  },
  {
    id: 'm-008',
    name: 'Sweet Tooth Patisserie',
    category_name: 'Food',
    category_code: 'FOOD',
    type: 'Bakery & Cafe',
    locations: 7,
    status: 'Inactive',
    description: 'French macarons, velvet celebration cakes, fresh fruit tarts, and artisanal Belgian hot chocolate.',
    sort_order: 15,
    created_at: new Date(Date.now() - 360 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 543 2109',
    email: 'orders@sweettoothbakery.com',
    address: '94 Pastry Lane, Olympia',
    commission_rate: 16,
    license_number: 'REST-BAKE-2021-120',
    specialties: ['Assorted Macaron Box', 'Red Velvet Cake Slice', 'Belgian Chocolate Eclairs', 'Berry Tartlets'],
    delivery_sla: '20-30 min',
    min_order: 'ETB 150',
    average_rating: 4.7,
    total_reviews: 310,
    is_featured: false,
  },
  {
    id: 'm-012',
    name: 'Green Oasis Kitchen',
    category_name: 'Food',
    category_code: 'FOOD',
    type: 'Restaurant & Dining',
    locations: 4,
    status: 'Inactive',
    description: 'Cold-pressed organic green juices, protein quinoa bowls, massaged kale, and toasted seed salads.',
    sort_order: 16,
    created_at: new Date(Date.now() - 270 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 667 1122',
    email: 'info@greenoasis.com',
    address: '89 Eco Plaza, Bisrate Gabriel',
    commission_rate: 14,
    license_number: 'REST-HLTH-2023-882',
    specialties: ['Avocado Quinoa Protein Bowl', 'Detox Kale Cleanse Juice', 'Acai Berry Energy Bowl', 'Lentil Falafel Wraps'],
    delivery_sla: '20-35 min',
    min_order: 'ETB 190',
    average_rating: 4.6,
    total_reviews: 145,
    is_featured: false,
  },
  {
    id: 'm-020',
    name: 'Bella Napoli Woodfire Pizza',
    category_name: 'Food',
    category_code: 'FOOD',
    type: 'Restaurant & Dining',
    locations: 5,
    status: 'Active',
    description: 'Neapolitan style sourdough pizzas baked in 450°C Italian wood-fired ovens with imported buffalo mozzarella.',
    sort_order: 17,
    created_at: new Date(Date.now() - 130 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 778 9900',
    email: 'ciao@bellanapolipizza.com',
    address: '34 Cameroon Street, Bole Atlas',
    commission_rate: 15,
    license_number: 'REST-PIZZA-2023-512',
    specialties: ['Margherita DOC', 'Quattro Formaggi', 'Truffle Mushroom Pizza', 'Calzone Classico'],
    delivery_sla: '25-35 min',
    min_order: 'ETB 260',
    average_rating: 4.8,
    total_reviews: 580,
    is_featured: false,
  },

  // ==========================================
  // RETAIL, BEVERAGE & LIFESTYLE MERCHANTS
  // ==========================================
  {
    id: 'm-009',
    name: 'TechZone Essentials & Retail',
    category_name: 'Retail',
    category_code: 'RETAIL',
    type: 'Retail & Convenience',
    locations: 8,
    status: 'Active',
    description: 'Rapid on-demand smartphone accessories, 65W GaN fast chargers, noise-cancelling earbuds, USB-C cables, and travel electronics.',
    sort_order: 18,
    created_at: new Date(Date.now() - 170 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 887 3344',
    email: 'orders@techzone.io',
    address: '102 Innovation Drive, Tech Hub, Dembel',
    commission_rate: 12,
    license_number: 'RET-ELEC-2023-339',
    specialties: ['GaN Multi-Port Chargers', 'Wireless Bluetooth Earbuds', 'Braided Lightning Cables', 'Tempered Glass Protectors'],
    delivery_sla: '25-45 min',
    min_order: 'ETB 250',
    average_rating: 4.7,
    total_reviews: 320,
    is_featured: false,
  },
  {
    id: 'm-005',
    name: 'Urban Cellar & Fine Spirits',
    category_name: 'Retail',
    category_code: 'RETAIL',
    type: 'Beverage & Spirits',
    locations: 4,
    status: 'Active',
    description: 'Curated natural wines, cold craft IPAs, imported aged whiskeys, champagne vintages, and chilled cocktail party mixers.',
    sort_order: 19,
    created_at: new Date(Date.now() - 140 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 432 1098',
    email: 'cheers@urbancellar.com',
    address: '320 Vintage Row, Arts District, Kazanchis',
    commission_rate: 12,
    license_number: 'RET-LIQ-2022-901',
    specialties: ['Bordeaux Red Vintages', 'Single Malt Scotch Whiskey', 'Chilled Craft IPAs', 'Sparkling Champagne Brut'],
    delivery_sla: '20-30 min',
    min_order: 'ETB 500',
    average_rating: 4.8,
    total_reviews: 410,
    is_featured: false,
  },
  {
    id: 'm-010',
    name: 'PetCare Haven Supplies',
    category_name: 'Retail',
    category_code: 'RETAIL',
    type: 'Pet Care & Supplies',
    locations: 3,
    status: 'Active',
    description: 'Premium organic pet food, dog dental chews, cat care accessories, grooming hygiene essentials, and emergency pet care.',
    sort_order: 20,
    created_at: new Date(Date.now() - 200 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 22 * 86400000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 776 5544',
    email: 'woof@petcarehaven.com',
    address: '44 Paws Crossing, Gerji',
    commission_rate: 12,
    license_number: 'RET-PET-2023-112',
    specialties: ['Grain-Free Dry Dog Kibble', 'Clumping Cat Litter', 'Flea & Tick Prevention', 'Interactive Chew Toys'],
    delivery_sla: '30-45 min',
    min_order: 'ETB 200',
    average_rating: 4.9,
    total_reviews: 180,
    is_featured: false,
  },
  {
    id: 'm-021',
    name: 'Bloom & Petal Florist Boutique',
    category_name: 'Flowers & Gifts',
    category_code: 'FLOWERS_GIFTS',
    type: 'Flowers & Gifts',
    locations: 4,
    status: 'Active',
    description: 'Fresh highland red roses, bespoke celebration bouquets, Swiss luxury chocolates, and handcrafted anniversary gift sets.',
    sort_order: 21,
    created_at: new Date(Date.now() - 115 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 889 1122',
    email: 'orders@bloometal.com',
    address: '17 Flora Lane, Bole Michael',
    commission_rate: 14,
    license_number: 'RET-FLOR-2024-220',
    specialties: ['50 Long-Stem Red Roses', 'Orchid Floral Arrangement', 'Gift Chocolate Hampers', 'Helium Celebration Balloons'],
    delivery_sla: '25-40 min',
    min_order: 'ETB 300',
    average_rating: 4.9,
    total_reviews: 260,
    is_featured: true,
  },
  {
    id: 'm-022',
    name: 'SwiftParcel Express Hub',
    category_name: 'Package',
    category_code: 'PACKAGE',
    type: 'Courier & Package',
    locations: 10,
    status: 'Active',
    description: 'Same-day on-demand parcel dispatch, confidential legal document couriers, fragile electronics transit, and e-commerce return pickups.',
    sort_order: 22,
    created_at: new Date(Date.now() - 160 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
    phone: '+251 91 554 9900',
    email: 'dispatch@swiftparcel.et',
    address: 'Central Logistics Terminal, Stadium Area',
    commission_rate: 10,
    license_number: 'LOG-POST-2023-889',
    specialties: ['Express Same-Hour Documents', 'Secure Tamper-Evident Bags', 'Fragile Item Cushioning', 'GPS Real-Time Tracking'],
    delivery_sla: '15-30 min',
    min_order: 'ETB 100',
    average_rating: 4.8,
    total_reviews: 730,
    is_featured: false,
  },
]

export const loadStoredMerchants = () => {
  if (typeof window === 'undefined') return defaultMerchants
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    let parsed = raw ? JSON.parse(raw) : null

    // If no storage exists or empty, seed fresh
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMerchants))
      parsed = defaultMerchants
    } else {
      // Ensure missing default merchants are added so user gets full catalog
      const existingIds = new Set(parsed.map((m) => m.id || m.merchant_id))
      const missingDefaults = defaultMerchants.filter((dm) => !existingIds.has(dm.id))
      if (missingDefaults.length > 0) {
        parsed = [...parsed, ...missingDefaults]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
      }
    }

    const enrichedList = parsed.map((m) => {
      const def = defaultMerchants.find((d) => d.id === (m.id || m.merchant_id))
      const catMeta = getCategoryMeta(m.category_name || m.type || def?.category_name)

      return {
        ...def,
        ...m,
        merchant_id: m.merchant_id || m.id,
        status: (m.status || 'ACTIVE').toUpperCase(),
        category_name: m.category_name || def?.category_name || catMeta.label,
        category_code: m.category_code || def?.category_code || catMeta.code,
        specialties: (m.specialties && m.specialties.length > 0) ? m.specialties : (def?.specialties || []),
        license_number: m.license_number || def?.license_number || '',
        is_rx_licensed: m.is_rx_licensed !== undefined ? Boolean(m.is_rx_licensed) : Boolean(def?.is_rx_licensed),
        is_emergency_247: m.is_emergency_247 !== undefined ? Boolean(m.is_emergency_247) : Boolean(def?.is_emergency_247),
        is_cold_chain: m.is_cold_chain !== undefined ? Boolean(m.is_cold_chain) : Boolean(def?.is_cold_chain),
        delivery_sla: m.delivery_sla || def?.delivery_sla || '20-35 min',
        min_order: m.min_order || def?.min_order || 'ETB 150',
        branch_name: m.branch_name || `${m.name} Main Branch`,
        is_featured: Boolean(m.is_featured ?? def?.is_featured),
        is_main_branch: m.is_main_branch !== undefined ? Boolean(m.is_main_branch) : true,
        latitude: typeof m.latitude === 'number' ? m.latitude : (def?.latitude || 9.0016),
        longitude: typeof m.longitude === 'number' ? m.longitude : (def?.longitude || 38.7842),
        address: m.address || def?.address || 'Central Commercial Boulevard',
        opening_hours: m.opening_hours || def?.opening_hours || '08:00 AM',
        closing_hours: m.closing_hours || def?.closing_hours || '10:00 PM',
        is_open: m.is_open !== undefined ? Boolean(m.is_open) : true,
        accepts_orders: m.accepts_orders !== undefined ? Boolean(m.accepts_orders) : true,
        eta_min: m.eta_min || def?.eta_min || 20,
        eta_max: m.eta_max || def?.eta_max || 40,
        average_rating: m.average_rating || def?.average_rating || 4.8,
        total_rating: m.total_rating || def?.total_rating || 5,
        total_reviews: m.total_reviews || def?.total_reviews || 24,
      }
    })

    // Write back any newly hydrated attributes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrichedList))
    return enrichedList
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
  const catMeta = getCategoryMeta(newMerchantData.category_name || newMerchantData.type)

  const created = {
    id: merchantId,
    merchant_id: merchantId,
    sort_order: nextOrder,
    created_at: now,
    updated_at: now,
    status: (newMerchantData.status || 'ACTIVE').toUpperCase(),
    category_name: newMerchantData.category_name || catMeta.label,
    category_code: newMerchantData.category_code || catMeta.code,
    locations: 1,
    is_main_branch: true,
    is_open: true,
    accepts_orders: true,
    average_rating: 4.8,
    total_rating: 5,
    total_reviews: 12,
    delivery_sla: '20-30 min',
    min_order: 'ETB 150',
    specialties: [],
    ...newMerchantData,
  }
  const updatedList = [created, ...current].map((m, idx) => ({ ...m, sort_order: idx + 1 }))
  saveStoredMerchants(updatedList)
  return created
}

export const deleteMerchant = (id) => {
  const current = loadStoredMerchants()
  const updatedList = current.filter((m) => m.id !== id && m.merchant_id !== id)
  saveStoredMerchants(updatedList)
  return updatedList
}
