/**
 * Rider Wallet Transactions Data Set
 * 
 * Key Fields:
 * - id (UUID) - Primary key
 * - rider_id - FK to riders
 * - order_id - FK to orders (nullable)
 * - type - EARNING, BONUS, WITHDRAW, DEPOSIT, REFUND, CHARGE, ADJUSTMENT, OTHER
 * - amount - Transaction amount (ETB)
 * - reason - Transaction reason
 * - description - Detailed transaction description
 * - created_at, updated_at - Timestamps
 * - balance_after - Running balance after transaction execution
 */

export const demoRiderTransactions = [
  // --- Transactions for RDR-7201 (Marcus Thorne - Balance: 6,420.50 ETB) ---
  {
    id: 'c7d4e2a1-9f1a-4a6c-8e3b-2d1e0f9a8b7c',
    rider_id: 'RDR-7201',
    order_id: null,
    type: 'WITHDRAW',
    amount: 3500.0,
    reason: 'Instant Telebirr mobile wallet withdrawal',
    description: 'Automated courier mobile money withdrawal disbursement to registered Telebirr account (+251 911 234567).',
    created_at: '2024-10-25 11:20:00',
    updated_at: '2024-10-25 11:20:15',
    balance_after: 6420.5,
  },
  {
    id: 'e3a1e9d8-6b2c-4f7e-9a0d-1c3b5e7f9a2b',
    rider_id: 'RDR-7201',
    order_id: 'ORD-9982',
    type: 'EARNING',
    amount: 220.0,
    reason: 'Delivery fee & customer tip payout for Order #ORD-9982',
    description: 'Completed express food delivery dispatch from The Burger Joint to Bole Sub-City (Base fare: 185.00 ETB + Customer tip: 35.00 ETB).',
    created_at: '2024-10-24 15:05:00',
    updated_at: '2024-10-24 15:05:00',
    balance_after: 9920.5,
  },
  {
    id: 'a9e8d7c6-5b4a-4f3e-8d2c-1b0a9f8e7d6c',
    rider_id: 'RDR-7201',
    order_id: null,
    type: 'BONUS',
    amount: 500.0,
    reason: 'Weekly high-performance on-time streak reward',
    description: 'Awarded for completing 35 consecutive deliveries with an on-time completion rate exceeding 98% during peak lunch and dinner windows.',
    created_at: '2024-10-23 09:00:00',
    updated_at: '2024-10-23 09:00:00',
    balance_after: 9700.5,
  },
  {
    id: 'b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e',
    rider_id: 'RDR-7201',
    order_id: 'ORD-9975',
    type: 'EARNING',
    amount: 250.0,
    reason: 'Delivery fee & tip for Order #ORD-9975',
    description: 'Completed scheduled dinner delivery from Mamma Mia Pizza to Kazanchis (Base: 210.00 ETB + Tip: 40.00 ETB).',
    created_at: '2024-10-22 19:45:00',
    updated_at: '2024-10-22 19:45:00',
    balance_after: 9200.5,
  },
  {
    id: 'f4e3d2c1-0b9a-4c8d-7e6f-5a4b3c2d1e0f',
    rider_id: 'RDR-7201',
    order_id: null,
    type: 'DEPOSIT',
    amount: 1500.0,
    reason: 'COD cash order remittance reconciliation deposit',
    description: 'Reconciled cash-on-delivery payments collected from customers and deposited at Shima Logistics Central Hub cashier.',
    created_at: '2024-10-21 17:30:00',
    updated_at: '2024-10-21 17:31:10',
    balance_after: 8950.5,
  },
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    rider_id: 'RDR-7201',
    order_id: 'ORD-9710',
    type: 'REFUND',
    amount: 85.0,
    reason: 'Toll gate pass expense reimbursement',
    description: 'Approved expense reimbursement credit for municipal expressway toll bridge fee incurred during expedited order delivery #ORD-9710.',
    created_at: '2024-10-20 14:15:00',
    updated_at: '2024-10-20 14:15:00',
    balance_after: 7450.5,
  },
  {
    id: 'd4c3b2a1-0f9e-4d8c-7b6a-5f4e3d2c1b0a',
    rider_id: 'RDR-7201',
    order_id: null,
    type: 'CHARGE',
    amount: 60.0,
    reason: 'Monthly insulated delivery equipment & tech fee',
    description: 'Routine monthly deduction for GPS navigation access, logistics server connectivity, and thermal box maintenance.',
    created_at: '2024-10-18 00:00:00',
    updated_at: '2024-10-18 00:00:00',
    balance_after: 7365.5,
  },
  {
    id: 'e5d4c3b2-1a0f-4e9d-8c7b-6a5f4e3d2c1b',
    rider_id: 'RDR-7201',
    order_id: 'ORD-9912',
    type: 'EARNING',
    amount: 290.0,
    reason: 'Delivery fee for Order #ORD-9912',
    description: 'Completed priority delivery from Sakura Sushi to Old Airport Area (Base: 240.00 ETB + Tip: 50.00 ETB).',
    created_at: '2024-10-17 13:55:00',
    updated_at: '2024-10-17 13:55:00',
    balance_after: 7425.5,
  },
  {
    id: 'f6e5d4c3-b2a1-40f9-9e8d-7c6b5a4f3e2d',
    rider_id: 'RDR-7201',
    order_id: 'ORD-9762',
    type: 'ADJUSTMENT',
    amount: 110.0,
    reason: 'Route detour distance adjustment credit',
    description: 'Logistics audit credit compensating for a 2.8 km construction detour on Bole Ring Road during delivery #ORD-9762.',
    created_at: '2024-10-15 16:10:00',
    updated_at: '2024-10-15 16:10:00',
    balance_after: 7135.5,
  },
  {
    id: '9a8b7c6d-5e4f-4a3b-2c1d-0e9f8a7b6c5d',
    rider_id: 'RDR-7201',
    order_id: null,
    type: 'OTHER',
    amount: 300.0,
    reason: 'Quarterly zero-incident safe driver reward',
    description: 'Corporate logistics safety incentive credited for maintaining a flawless driving record and 100% helmet inspection compliance in Q3.',
    created_at: '2024-10-12 10:00:00',
    updated_at: '2024-10-12 10:00:00',
    balance_after: 7025.5,
  },
  {
    id: '8b7c6d5e-4f3a-4b2c-1d0e-9f8a7b6c5d4e',
    rider_id: 'RDR-7201',
    order_id: 'ORD-9884',
    type: 'EARNING',
    amount: 185.0,
    reason: 'Delivery fee for Order #ORD-9884',
    description: 'Completed lunch run from Taco Haven to Gerji Imperial (Base: 160.00 ETB + Tip: 25.00 ETB).',
    created_at: '2024-10-10 12:50:00',
    updated_at: '2024-10-10 12:50:00',
    balance_after: 6725.5,
  },
  {
    id: '7c6d5e4f-3a2b-4c1d-0e9f-8a7b6c5d4e3f',
    rider_id: 'RDR-7201',
    order_id: null,
    type: 'WITHDRAW',
    amount: 2500.0,
    reason: 'Commercial Bank of Ethiopia (CBE) wire payout',
    description: 'Direct account transfer to Commercial Bank of Ethiopia (CBE account ending in *9102).',
    created_at: '2024-10-05 09:30:00',
    updated_at: '2024-10-05 09:30:22',
    balance_after: 6540.5,
  },

  // --- Transactions for RDR-7202 (Sofia Chen - Balance: 3,890.00 ETB) ---
  {
    id: '6d5e4f3a-2b1c-4d0e-9f8a-7b6c5d4e3f2a',
    rider_id: 'RDR-7202',
    order_id: 'ORD-8821',
    type: 'EARNING',
    amount: 190.0,
    reason: 'Bicycle green courier delivery fee for Order #ORD-8821',
    description: 'Eco-friendly bicycle food delivery dispatch from Green Garden Salad to Kazanchis.',
    created_at: '2024-10-24 13:40:00',
    updated_at: '2024-10-24 13:40:00',
    balance_after: 3890.0,
  },
  {
    id: '5e4f3a2b-1c0d-4e9f-8a7b-6c5d4e3f2a1b',
    rider_id: 'RDR-7202',
    order_id: null,
    type: 'BONUS',
    amount: 400.0,
    reason: 'Zero-emission green fleet monthly stipend',
    description: 'Sustainability bonus granted to high-volume bicycle couriers operating in dense downtown sectors.',
    created_at: '2024-10-20 10:00:00',
    updated_at: '2024-10-20 10:00:00',
    balance_after: 3700.0,
  },
  {
    id: '4f3a2b1c-0d9e-4f8a-7b6c-5d4e3f2a1b0c',
    rider_id: 'RDR-7202',
    order_id: null,
    type: 'WITHDRAW',
    amount: 1500.0,
    reason: 'Telebirr courier payout',
    description: 'Withdrawal to registered Telebirr wallet (+251 922 456789).',
    created_at: '2024-10-18 16:20:00',
    updated_at: '2024-10-18 16:20:10',
    balance_after: 3300.0,
  },

  // --- Transactions for RDR-7203 (Dawit Mengistu - Balance: 7,850.75 ETB) ---
  {
    id: '3a2b1c0d-9e8f-4a7b-6c5d-4e3f2a1b0c9d',
    rider_id: 'RDR-7203',
    order_id: 'ORD-9104',
    type: 'EARNING',
    amount: 340.0,
    reason: 'Heavy package & long distance delivery fee',
    description: 'Completed multi-dish catering delivery dispatch from Habesha Kitchen to CMC Heights.',
    created_at: '2024-10-24 18:20:00',
    updated_at: '2024-10-24 18:20:00',
    balance_after: 7850.75,
  },
  {
    id: '2b1c0d9e-8f7a-4b6c-5d4e-3f2a1b0c9d8e',
    rider_id: 'RDR-7203',
    order_id: null,
    type: 'BONUS',
    amount: 650.0,
    reason: 'Weekend night-shift delivery bonus',
    description: 'Earned for completing 15 midnight deliveries during high-demand weekend surge periods.',
    created_at: '2024-10-21 02:00:00',
    updated_at: '2024-10-21 02:00:00',
    balance_after: 7510.75,
  },
  {
    id: '1c0d9e8f-7a6b-4c5d-4e3f-2a1b0c9d8e7f',
    rider_id: 'RDR-7203',
    order_id: null,
    type: 'WITHDRAW',
    amount: 4000.0,
    reason: 'Bank of Abyssinia weekly withdrawal payout',
    description: 'Scheduled wire transfer payout to Bank of Abyssinia account (*4481).',
    created_at: '2024-10-16 11:00:00',
    updated_at: '2024-10-16 11:00:15',
    balance_after: 6860.75,
  },

  // --- Transactions for RDR-7208 (Solomon Worku - Blocked Courier) ---
  {
    id: '0d9e8f7a-6b5c-4d4e-3f2a-1b0c9d8e7f6a',
    rider_id: 'RDR-7208',
    order_id: 'ORD-7712',
    type: 'CHARGE',
    amount: 280.0,
    reason: 'Disputed delivery chargeback penalty',
    description: 'Customer refund chargeback deduction applied following unreturned damaged order dispute.',
    created_at: '2024-10-19 14:00:00',
    updated_at: '2024-10-19 14:00:00',
    balance_after: 120.0,
  },
  {
    id: '9e8f7a6b-5c4d-4e3f-2a1b-0c9d8e7f6a5b',
    rider_id: 'RDR-7208',
    order_id: 'ORD-7688',
    type: 'EARNING',
    amount: 170.0,
    reason: 'Delivery fee for Order #ORD-7688',
    description: 'Completed delivery from Pizza Roma to Piassa.',
    created_at: '2024-10-17 12:10:00',
    updated_at: '2024-10-17 12:10:00',
    balance_after: 400.0,
  },
]

export const RIDER_TRANSACTIONS_STORAGE_KEY = 'deliver_app_rider_transactions'

export function loadStoredRiderTransactions() {
  if (typeof window === 'undefined') return [...demoRiderTransactions]
  try {
    const raw = localStorage.getItem(RIDER_TRANSACTIONS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(RIDER_TRANSACTIONS_STORAGE_KEY, JSON.stringify(demoRiderTransactions))
      return [...demoRiderTransactions]
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...demoRiderTransactions]
  } catch (e) {
    console.error('Failed to parse stored rider transactions', e)
    return [...demoRiderTransactions]
  }
}

export function saveStoredRiderTransactions(transactions) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RIDER_TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions))
    window.dispatchEvent(new Event('rider-transactions-updated'))
  } catch (e) {
    console.error('Failed to save rider transactions', e)
  }
}

/**
 * Returns transactions belonging to a specific rider.
 * If the rider has no pre-seeded transactions, generates logical initial transactions so the tab is never empty.
 */
export function getTransactionsByRiderId(riderId) {
  const all = loadStoredRiderTransactions()
  const filtered = all.filter((t) => t.rider_id === riderId || String(t.rider_id).toLowerCase() === String(riderId).toLowerCase())
  
  if (filtered.length > 0) return filtered

  // Dynamic fallback dataset tailored to this rider id
  return [
    {
      id: `tx-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}`,
      rider_id: riderId,
      order_id: 'ORD-8941',
      type: 'EARNING',
      amount: 210.0,
      reason: 'Delivery fee for completed order #ORD-8941',
      description: 'Standard delivery dispatch fee credited upon confirmation of dropoff.',
      created_at: '2024-10-24 14:10:00',
      updated_at: '2024-10-24 14:10:00',
      balance_after: 1250.0,
    },
    {
      id: `tx-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}`,
      rider_id: riderId,
      order_id: null,
      type: 'BONUS',
      amount: 300.0,
      reason: 'Weekly milestone incentive bonus',
      description: 'Performance bonus for completing 20 deliveries with high rating.',
      created_at: '2024-10-22 09:00:00',
      updated_at: '2024-10-22 09:00:00',
      balance_after: 1040.0,
    },
    {
      id: `tx-${Math.random().toString(36).substring(2, 10)}-${Math.random().toString(36).substring(2, 6)}`,
      rider_id: riderId,
      order_id: null,
      type: 'WITHDRAW',
      amount: 1000.0,
      reason: 'Direct courier wallet withdrawal',
      description: 'Disbursement transfer to mobile money account.',
      created_at: '2024-10-18 16:30:00',
      updated_at: '2024-10-18 16:30:10',
      balance_after: 740.0,
    },
  ]
}

export function isCreditTransaction(type) {
  // Types that add money to the rider's wallet
  return ['EARNING', 'BONUS', 'DEPOSIT', 'REFUND', 'OTHER'].includes(type)
}
