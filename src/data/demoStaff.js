import { loadStoredMerchants } from './demoMerchants'

export const STAFF_STORAGE_KEY = 'deliver_app_staff_data'

/**
 * Standard Permission Catalog for Merchant Branch Staff
 */
export const PERMISSION_CATALOG = [
  {
    category: 'Orders & Dispatch',
    categoryIcon: 'receipt_long',
    items: [
      { key: 'orders:view', label: 'View Orders', description: 'Access live and historical branch order stream' },
      { key: 'orders:accept', label: 'Accept Orders', description: 'Confirm and send orders to kitchen / prep' },
      { key: 'orders:dispatch', label: 'Dispatch Orders', description: 'Hand over prepared orders to delivery riders' },
      { key: 'orders:cancel', label: 'Cancel & Refund', description: 'Cancel unfulfilled orders and issue customer refunds' },
    ],
  },
  {
    category: 'Menu & Inventory',
    categoryIcon: 'restaurant_menu',
    items: [
      { key: 'menu:view', label: 'View Menu Items', description: 'Browse branch menu items, modifier groups, and recipes' },
      { key: 'menu:edit', label: 'Edit Items & Stock', description: 'Update prices, description, and toggle in/out of stock' },
      { key: 'menu:create', label: 'Add New Items', description: 'Create new dishes, SKUs, and category assignments' },
    ],
  },
  {
    category: 'Branch Operations',
    categoryIcon: 'storefront',
    items: [
      { key: 'branch:hours', label: 'Manage Working Hours', description: 'Update weekly opening and closing schedules' },
      { key: 'branch:status', label: 'Toggle Branch Status', description: 'Emergency pause order acceptance or close branch' },
      { key: 'branch:settings', label: 'Branch Settings', description: 'Configure prep time buffers, radius, and SLAs' },
    ],
  },
  {
    category: 'Staff & Team',
    categoryIcon: 'badge',
    items: [
      { key: 'staff:view', label: 'View Staff Roster', description: 'See team members assigned to this branch' },
      { key: 'staff:manage', label: 'Manage Staff', description: 'Invite, assign roles, edit shift hours, and manage access' },
    ],
  },
  {
    category: 'Financials & Reports',
    categoryIcon: 'payments',
    items: [
      { key: 'finance:view', label: 'View Payouts & Sales', description: 'Inspect daily revenue, commission cuts, and payouts' },
      { key: 'reports:export', label: 'Export Data Reports', description: 'Download CSV and Excel operational audits' },
    ],
  },
]

/**
 * Default permission sets by role
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: PERMISSION_CATALOG.flatMap((cat) => cat.items.map((i) => i.key)),
  MANAGER: [
    'orders:view',
    'orders:accept',
    'orders:dispatch',
    'orders:cancel',
    'menu:view',
    'menu:edit',
    'menu:create',
    'branch:hours',
    'branch:status',
    'branch:settings',
    'staff:view',
    'finance:view',
    'reports:export',
  ],
  STAFF: [
    'orders:view',
    'orders:accept',
    'orders:dispatch',
    'menu:view',
    'staff:view',
  ],
}

/**
 * UUID generator helper
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Helper to get all branches with their parent merchant details
 */
export function getAllBranchesWithMerchants() {
  const merchants = loadStoredMerchants() || []
  const branchList = []

  merchants.forEach((m) => {
    if (m.branches && Array.isArray(m.branches) && m.branches.length > 0) {
      m.branches.forEach((b) => {
        branchList.push({
          id: b.id,
          merchant_branch_id: b.id,
          branch_name: b.branch_name || b.name || `${m.name} - Branch`,
          merchant_id: m.id,
          merchant_name: m.name,
          merchant_logo: m.logo,
          merchant_category: m.category_name || m.type || 'General',
          address: b.address || m.address,
          phone: b.phone || m.phone,
          opening_hours: b.opening_hours || '08:00 AM',
          closing_hours: b.closing_hours || '10:00 PM',
          is_open: b.is_open !== false,
          is_main_branch: !!b.is_main_branch,
        })
      })
    } else {
      // Default primary branch
      const synthId = `b-${m.id}-main`
      branchList.push({
        id: synthId,
        merchant_branch_id: synthId,
        branch_name: `${m.name} (Main Branch)`,
        merchant_id: m.id,
        merchant_name: m.name,
        merchant_logo: m.logo,
        merchant_category: m.category_name || m.type || 'General',
        address: m.address || 'Central Business District, Addis Ababa',
        phone: m.phone || '+251 91 122 3344',
        opening_hours: '08:00 AM',
        closing_hours: '10:00 PM',
        is_open: m.status !== 'Inactive',
        is_main_branch: true,
      })
    }
  })

  return branchList
}

/**
 * Find branch and parent merchant given merchant_branch_id
 */
export function getBranchAndMerchant(branchId) {
  if (!branchId) return null
  const all = getAllBranchesWithMerchants()
  const found = all.find((b) => b.id === branchId || b.merchant_branch_id === branchId)
  if (found) return found

  // Fallback if not found directly
  const merchants = loadStoredMerchants() || []
  for (const m of merchants) {
    if (m.branches) {
      const match = m.branches.find((b) => b.id === branchId)
      if (match) {
        return {
          id: match.id,
          merchant_branch_id: match.id,
          branch_name: match.branch_name || match.name || `${m.name} - Branch`,
          merchant_id: m.id,
          merchant_name: m.name,
          merchant_logo: m.logo,
          merchant_category: m.category_name || m.type || 'General',
          address: match.address || m.address,
          phone: match.phone || m.phone,
          opening_hours: match.opening_hours || '08:00 AM',
          closing_hours: match.closing_hours || '10:00 PM',
          is_open: match.is_open !== false,
          is_main_branch: !!match.is_main_branch,
        }
      }
    }
  }

  // Graceful stub if dynamic branch
  return {
    id: branchId,
    merchant_branch_id: branchId,
    branch_name: `Branch #${branchId}`,
    merchant_id: 'unknown-merchant',
    merchant_name: 'Merchant Partner',
    merchant_logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
    merchant_category: 'Food',
    address: 'Bole Sub-City, Addis Ababa',
    phone: '+251 91 000 0000',
    opening_hours: '08:00 AM',
    closing_hours: '10:00 PM',
    is_open: true,
    is_main_branch: false,
  }
}

/**
 * Initial Staff Seed Data (Key fields strictly compliant with user specification):
 * - id (UUID - Primary key)
 * - merchant_branch_id (FK to merchant_branches)
 * - full_name (Staff name)
 * - email (Staff email - indexed)
 * - password (Hashed password)
 * - phone_number (Contact number)
 * - profile_picture (Profile image)
 * - is_owner (Owner flag)
 * - role (OWNER, MANAGER, STAFF)
 * - permissions (JSONB array of permissions)
 * - status (ACTIVE, INACTIVE, PENDING, BLOCKED)
 * - created_at, updated_at
 */
export const initialStaffMembers = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    merchant_branch_id: 'b-agf-01',
    full_name: 'Dawit Hailu Mengesha',
    email: 'dawit.mengesha@addisgreenfarm.et',
    password: '$2a$12$K89x1O3j7Z4VvC2lW5aR9eB3y7t6P0mQ8s2u4v6w8x0z2y4w6a8u.',
    phone_number: '+251 91 123 7890',
    profile_picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    is_owner: true,
    role: 'OWNER',
    permissions: DEFAULT_ROLE_PERMISSIONS.OWNER,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 320 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    notes: 'Primary franchise owner for Addis Green Farm Organics group.',
  },
  {
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    merchant_branch_id: 'b-agf-01',
    full_name: 'Biruk Wolde Gidey',
    email: 'biruk.wolde@addisgreenfarm.et',
    password: '$2a$12$Y1p8z9Q0w2x3e4r5t6y7u8i9o0p1a2s3d4f5g6h7j8k9l0z1x2c3.',
    phone_number: '+251 92 667 1122',
    profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'MANAGER',
    permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 210 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    notes: 'General store manager overseeing Kality Depot operations and driver dispatches.',
  },
  {
    id: 'e2a87d19-9401-4475-b384-cb904ef234f9',
    merchant_branch_id: 'b-agf-02',
    full_name: 'Hiwot Teshome Belay',
    email: 'hiwot.teshome@addisgreenfarm.et',
    password: '$2a$12$R4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0x1c2v3b4n5m6q7w8e9.',
    phone_number: '+251 92 667 3344',
    profile_picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'MANAGER',
    permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 180 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Branch Manager at Sarbet Express retail location.',
  },
  {
    id: '1c6d3f82-a745-42f0-b9e3-8571c264d18e',
    merchant_branch_id: 'b-metro-01',
    full_name: 'Fikadu Alemu Tessema',
    email: 'f.alemu@metrohypermarket.et',
    password: '$2a$12$X9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2h1g0f9e8d7c6b5a4.',
    phone_number: '+251 91 112 5566',
    profile_picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'MANAGER',
    permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 140 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    notes: 'Operations lead for Metro Hypermarket Bole Medhanialem branch.',
  },
  {
    id: '3f7d82a1-e0c4-4b5f-912a-6d3e8749bc10',
    merchant_branch_id: 'b-metro-01',
    full_name: 'Bethlehem Girma Kebede',
    email: 'b.girma@metrohypermarket.et',
    password: '$2a$12$N3m4v5c6x7z8l9k0j1h2g3f4d5s6a7p8o9i0u1y2t3r4e5w6q7a8.',
    phone_number: '+251 91 112 8899',
    profile_picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'STAFF',
    permissions: DEFAULT_ROLE_PERMISSIONS.STAFF,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 95 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    notes: 'Order fulfillment and packaging coordinator.',
  },
  {
    id: '5e9c0172-88b4-4113-95ad-29fa71358f23',
    merchant_branch_id: 'b-m-003-main',
    full_name: 'Dr. Senait Abera Worku',
    email: 'dr.senait@medexpress.com',
    password: '$2a$12$P0o9i8u7y6t5r4e3w2q1a0s9d8f7g6h5j4k3l2z1x0c9v8b7n6m5.',
    phone_number: '+251 91 998 3344',
    profile_picture: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    is_owner: true,
    role: 'OWNER',
    permissions: DEFAULT_ROLE_PERMISSIONS.OWNER,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 400 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    notes: 'Founding Pharmacist and Chief Executive of MedExpress Pharmacy Group.',
  },
  {
    id: '7b2a4190-6421-4f18-a684-1836f32e9871',
    merchant_branch_id: 'b-m-003-main',
    full_name: 'Yonas Kassahun Desta',
    email: 'yonas.k@medexpress.com',
    password: '$2a$12$M1n2b3v4c5x6z7l8k9j0h1g2f3d4s5a6p7o8i9u0y1t2r3e4w5q6.',
    phone_number: '+251 91 998 7788',
    profile_picture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'STAFF',
    permissions: ['orders:view', 'orders:accept', 'orders:dispatch', 'menu:view'],
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    notes: 'Cold-chain dispatch specialist handling temperature-sensitive deliveries.',
  },
  {
    id: 'a89c24de-11fe-46b5-93df-520c027b4012',
    merchant_branch_id: 'b-m-013-main',
    full_name: 'Tewodros Assefa Kassa',
    email: 'tewodros.assefa@curepointpharmacy.com',
    password: '$2a$12$T5y6u7i8o9p0q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0.',
    phone_number: '+251 92 334 9900',
    profile_picture: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'MANAGER',
    permissions: DEFAULT_ROLE_PERMISSIONS.MANAGER,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 110 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    notes: 'Pharmacy dispensator and certified compounding manager.',
  },
  {
    id: '61a294fc-4809-4ce4-8d9e-e31899a22f30',
    merchant_branch_id: 'b-m-013-main',
    full_name: 'Selamawit Dagne Mamo',
    email: 'selamawit.d@curepointpharmacy.com',
    password: '$2a$12$Z0x1c2v3b4n5m6l7k8j9h0g1f2d3s4a5p6o7i8u9y0t1r2e3w4q5.',
    phone_number: '+251 92 334 1155',
    profile_picture: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'STAFF',
    permissions: DEFAULT_ROLE_PERMISSIONS.STAFF,
    status: 'PENDING',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    notes: 'Newly hired prescription validator awaiting final EFDA accreditation upload.',
  },
  {
    id: 'd48e0291-76a3-4a11-897b-cf1098450123',
    merchant_branch_id: 'b-agf-01',
    full_name: 'Ephrem Kidane Wolde',
    email: 'ephrem.k@addisgreenfarm.et',
    password: '$2a$12$H3j4k5l6z7x8c9v0b1n2m3q4w5e6r7t8y9u0i1o2p3a4s5d6f7g8.',
    phone_number: '+251 91 345 6789',
    profile_picture: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'STAFF',
    permissions: DEFAULT_ROLE_PERMISSIONS.STAFF,
    status: 'INACTIVE',
    created_at: new Date(Date.now() - 250 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    notes: 'Seasonal inventory clerk currently on unpaid temporary leave.',
  },
  {
    id: 'bc72910a-319b-4328-98e4-842091fa6438',
    merchant_branch_id: 'b-metro-01',
    full_name: 'Solomon Regassa Tolossa',
    email: 's.regassa@metrohypermarket.et',
    password: '$2a$12$A1s2d3f4g5h6j7k8l9z0x1c2v3b4n5m6q7w8e9r0t1y2u3i4o5p6.',
    phone_number: '+251 91 112 0011',
    profile_picture: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'STAFF',
    permissions: ['orders:view'],
    status: 'BLOCKED',
    created_at: new Date(Date.now() - 170 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    notes: 'Account suspended following audit flag for repeated missing order scans.',
  },
  {
    id: '81f0923b-6e41-4775-9273-195ad863c015',
    merchant_branch_id: 'b-agf-02',
    full_name: 'Tigist Gebremedhin',
    email: 'tigist.g@addisgreenfarm.et',
    password: '$2a$12$B2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7.',
    phone_number: '+251 92 667 9901',
    profile_picture: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    is_owner: false,
    role: 'STAFF',
    permissions: DEFAULT_ROLE_PERMISSIONS.STAFF,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 75 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    notes: 'Customer desk associate managing direct pickup orders.',
  },
]

/**
 * Load staff members from localStorage (falls back to initialStaffMembers)
 */
export function loadStoredStaff() {
  if (typeof window === 'undefined') return initialStaffMembers
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY)
    if (!raw) {
      saveStoredStaff(initialStaffMembers)
      return initialStaffMembers
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveStoredStaff(initialStaffMembers)
      return initialStaffMembers
    }
    return parsed
  } catch (e) {
    console.error('Failed to load stored staff:', e)
    return initialStaffMembers
  }
}

/**
 * Save staff members to localStorage
 */
export function saveStoredStaff(staffList) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staffList))
  } catch (e) {
    console.error('Failed to save staff:', e)
  }
}

/**
 * Get staff member by id
 */
export function getStaffById(id) {
  if (!id) return null
  const staff = loadStoredStaff()
  return staff.find((s) => s.id === id) || null
}

/**
 * Add a new staff member
 */
export function createStaffMember(data) {
  const current = loadStoredStaff()
  const now = new Date().toISOString()
  const newId = data.id || generateUUID()

  // Default hashed password placeholder if not provided
  const hashedPassword =
    data.password ||
    `$2a$12$${generateUUID().replace(/-/g, '').slice(0, 22)}${generateUUID().replace(/-/g, '').slice(0, 31)}`

  const role = data.role || 'STAFF'
  const is_owner = data.is_owner === true || role === 'OWNER'

  const newStaff = {
    id: newId,
    merchant_branch_id: data.merchant_branch_id,
    full_name: (data.full_name || '').trim(),
    email: (data.email || '').trim().toLowerCase(),
    password: hashedPassword,
    phone_number: (data.phone_number || '').trim(),
    profile_picture:
      data.profile_picture ||
      `https://ui-avatars.com/api/?background=FF6B35&color=fff&bold=true&name=${encodeURIComponent(
        data.full_name || 'Staff'
      )}`,
    is_owner: is_owner,
    role: role,
    permissions: Array.isArray(data.permissions)
      ? data.permissions
      : DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.STAFF,
    status: data.status || 'ACTIVE',
    created_at: now,
    updated_at: now,
    notes: data.notes || '',
  }

  const updated = [newStaff, ...current]
  saveStoredStaff(updated)
  return newStaff
}

/**
 * Update an existing staff member
 */
export function updateStaffMember(id, data) {
  const current = loadStoredStaff()
  const now = new Date().toISOString()
  let updatedRecord = null

  const updatedList = current.map((s) => {
    if (s.id === id) {
      const role = data.role !== undefined ? data.role : s.role
      const is_owner =
        data.is_owner !== undefined
          ? data.is_owner
          : role === 'OWNER'
          ? true
          : s.is_owner

      updatedRecord = {
        ...s,
        ...data,
        role,
        is_owner,
        updated_at: now,
      }
      return updatedRecord
    }
    return s
  })

  saveStoredStaff(updatedList)
  return updatedRecord
}

/**
 * Change status of staff member (ACTIVE, INACTIVE, PENDING, BLOCKED)
 */
export function setStaffStatus(id, newStatus, reason = '') {
  return updateStaffMember(id, {
    status: newStatus,
    status_reason: reason,
    updated_at: new Date().toISOString(),
  })
}

/**
 * Delete a staff member
 */
export function deleteStaffMember(id) {
  const current = loadStoredStaff()
  const filtered = current.filter((s) => s.id !== id)
  saveStoredStaff(filtered)
  return filtered
}
