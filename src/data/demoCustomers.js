/** Demo records keyed by URL slug (e.g. CUST-9821, no #). */
export const demoCustomers = [
  {
    slug: 'CUST-9821',
    id: '#CUST-9821',
    name: 'Alex Curator',
    profile: 'Premium Member',
    email: 'alex.curator@example.com',
    phone: '0911223344',
    joinedDate: 'Oct 24, 2023',
    status: 'Active',
    tier: 'Premium',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    avatar: '/assets/alex_curator.png',
  },
  {
    slug: 'CUST-9822',
    id: '#CUST-9822',
    name: 'Sarah Miller',
    profile: 'Regular User',
    email: 'sarah.m@example.com',
    phone: '0922330124',
    joinedDate: 'Oct 22, 2023',
    status: 'Active',
    tier: 'Regular',
    address: '22 King St, Toronto, ON',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmZ5l3_lJ-qjN66QmIKrLUT4CQ_ldJ0vuN6hEm-I9AkO6dyqFUTRSnB8lH0xXQo-SWAk-LyLo3Aa1rc3_KAk19bSt9T0Sy6Qd4Xinzp3hYc85dzib4si3jTMF_W1TzblXhXl9XrTeH5hiR0FVxwRBIDwP7H0of_SzEVWqUgbV30Aqgz4r2okMjhKzXtDxQ3gHbv9AEhIK0EnShSYe-p-WS03H6b5smrLuvejOsMEKRom9zm19kaq9zYfumEzOzzn432-gDJLOwIPo',
  },
  {
    slug: 'CUST-9823',
    id: '#CUST-9823',
    name: 'James Brown',
    profile: 'Blocked Account',
    email: 'james.b@example.com',
    phone: '0933330999',
    joinedDate: 'Oct 26, 2023',
    status: 'Blocked',
    tier: 'Regular',
    address: 'Bole Medhanialem, Addis Ababa',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    initials: 'JB',
    banInfo: {
      duration: '30 Days',
      reason: 'Payment chargeback dispute & policy violation',
      formattedDue: 'Nov 25, 2024',
      createdAt: 'Oct 26, 2024',
    },
  },
]

export function getDemoCustomerBySlug(slug) {
  if (!slug) return null
  const decoded = decodeURIComponent(slug)
  return demoCustomers.find((c) => c.slug === decoded) ?? null
}
