/** Demo records keyed by URL slug (e.g. CUST-9821, no #). */
export const demoCustomers = [
  {
    slug: 'CUST-9821',
    id: '#CUST-9821',
    name: 'Alex Curator',
    profile: 'Premium Member',
    email: 'alex.curator@example.com',
    phone: '+1 555-0123',
    joinedDate: 'Oct 24, 2023',
    status: 'Active',
    tier: 'Premium',
    address: 'Bole Road, Addis Ababa, Ethiopia',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDYp1K72qDVSRumgBY9BKQcHe3AQDZRcsR3O2iSjROWhClTbuuKy7vkbT1CL1gieU5dogVKUwbhrzBK3XvRTUGHgBRYrlxTieVsO-rA_ydsIDTApmTp4IN_dCYx0nVjo-Oq_D1wzIRz1haRlMGDugOIDCB4Ts2Dk0x4pl7vS-uCdTIT9hzvettTuEMSOosLFNIfrScl6WOn8VVvCoSp7FVJJ5BlWbrb3dzEMTIMbhJDNePKwxfomqVEXKquc7edA5EgGERZClO3e7s',
  },
  {
    slug: 'CUST-9822',
    id: '#CUST-9822',
    name: 'Sarah Miller',
    profile: 'Regular User',
    email: 'sarah.m@example.com',
    phone: '+1 555-0124',
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
    profile: 'New Account',
    email: 'james.b@example.com',
    phone: '+1 555-0999',
    joinedDate: 'Oct 26, 2023',
    status: 'Inactive',
    tier: 'Regular',
    address: '',
    avatar: null,
    initials: 'JB',
  },
]

export function getDemoCustomerBySlug(slug) {
  if (!slug) return null
  const decoded = decodeURIComponent(slug)
  return demoCustomers.find((c) => c.slug === decoded) ?? null
}
