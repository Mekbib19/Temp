/**
 * Shared demo orders generator & utilities for Merchant and Branch detail views.
 * Aligns with the global Order Management design and data schema.
 */

export const orderStatusConfig = {
  kitchen: {
    label: 'In Kitchen',
    badgeClass: 'bg-orange-50 text-[#FF6B35] ring-1 ring-orange-500/20 dark:bg-orange-950/40 dark:text-orange-400',
    dotClass: 'bg-[#FF6B35] animate-pulse',
    icon: 'soup_kitchen',
  },
  ready: {
    label: 'Ready for Pickup',
    badgeClass: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400',
    dotClass: 'bg-amber-500',
    icon: 'done',
  },
  delivery: {
    label: 'Out for Delivery',
    badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400',
    dotClass: 'bg-blue-500 animate-pulse',
    icon: 'moped',
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
    icon: 'check_circle',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400',
    dotClass: 'bg-rose-500',
    icon: 'cancel',
  },
}

export const generateOrdersForBranch = (merchant, branch) => {
  const branchName = branch?.branch_name || 'Main Branch'
  const merchantName = merchant?.name || 'Merchant'
  const seed = (String(branch?.id || '0') + String(branchName))
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 120)
  const baseNum = 8800 + (seed % 900)

  return [
    {
      id: `#ORD-${baseNum}`,
      customer: { initials: 'SJ', name: 'Sarah Jenkins', phone: '+251 91 234 5678', email: 'sarah.j@gmail.com' },
      merchantName,
      branchName,
      branchId: branch?.id || 'branch-0',
      itemsList: [
        { name: '2x Signature Combo Meal', price: '$26.00' },
        { name: '1x Truffle Parmesan Fries', price: '$7.50' },
        { name: '1x Freshly Brewed Iced Tea', price: '$5.00' },
      ],
      items: '2x Signature Combo Meal, 1x Truffle Fries, 1x Iced Tea',
      total: '$38.50',
      totalNum: 38.5,
      type: 'Delivery',
      typeIcon: 'delivery_dining',
      payment: 'Telebirr (Paid)',
      date: 'Today, 2:42 PM',
      relativeTime: '8 mins ago',
      status: 'In Kitchen',
      statusVariant: 'kitchen',
      deliveryAddress: 'Bole Medhanialem, Building 4B, Apt 302',
      notes: 'Please do not ring the doorbell, infant sleeping.',
      courier: 'Abebe T. (Courier #14)',
    },
    {
      id: `#ORD-${baseNum - 2}`,
      customer: { initials: 'MC', name: 'Michael Chang', phone: '+251 92 888 1234', email: 'm.chang@enterprise.et' },
      merchantName,
      branchName,
      branchId: branch?.id || 'branch-0',
      itemsList: [
        { name: '1x Artisan Family Feast Box', price: '$48.00' },
        { name: '3x Craft Botanical Drinks', price: '$12.00' },
        { name: '1x Garlic Aioli Dip', price: '$4.20' },
      ],
      items: '1x Family Feast Box, 3x Craft Drinks, 1x Garlic Dip',
      total: '$64.20',
      totalNum: 64.2,
      type: 'Delivery',
      typeIcon: 'delivery_dining',
      payment: 'Credit Card •••• 5821',
      date: 'Today, 2:18 PM',
      relativeTime: '24 mins ago',
      status: 'Out for Delivery',
      statusVariant: 'delivery',
      deliveryAddress: 'Kazanchis Commercial District, Tower A, Fl 7',
      notes: 'Call reception upon arrival.',
      courier: 'Beshir K. (Courier #28)',
    },
    {
      id: `#ORD-${baseNum - 5}`,
      customer: { initials: 'HT', name: 'Hanna Tesfaye', phone: '+251 94 555 9012', email: 'hanna.t@yahoo.com' },
      merchantName,
      branchName,
      branchId: branch?.id || 'branch-0',
      itemsList: [
        { name: '1x Gourmet Deluxe Bowl', price: '$16.50' },
        { name: '1x Sweet Potato Wedges', price: '$5.50' },
      ],
      items: '1x Gourmet Deluxe Bowl, 1x Sweet Potato Wedges',
      total: '$22.00',
      totalNum: 22.0,
      type: 'Pickup',
      typeIcon: 'shopping_bag',
      payment: 'CBE Birr (Confirmed)',
      date: 'Today, 1:55 PM',
      relativeTime: '47 mins ago',
      status: 'Ready for Pickup',
      statusVariant: 'ready',
      deliveryAddress: `Front Counter Pickup at ${branchName}`,
      notes: 'Customer will collect inside branch counter.',
      courier: 'Customer Self-Pickup',
    },
    {
      id: `#ORD-${baseNum - 9}`,
      customer: { initials: 'ER', name: 'Elena Rostova', phone: '+251 91 765 4321', email: 'elena.rostova@global.com' },
      merchantName,
      branchName,
      branchId: branch?.id || 'branch-0',
      itemsList: [
        { name: '1x Chef Special Artisan Platter', price: '$22.00' },
        { name: '2x Fresh Mint Lemonade', price: '$7.00' },
      ],
      items: '1x Chef Special Artisan Platter, 2x Fresh Lemonade',
      total: '$29.00',
      totalNum: 29.0,
      type: 'Delivery',
      typeIcon: 'delivery_dining',
      payment: 'Telebirr (Paid)',
      date: 'Today, 1:15 PM',
      relativeTime: '1 hr 25 mins ago',
      status: 'Delivered',
      statusVariant: 'delivered',
      deliveryAddress: 'Old Airport Residential Quarter, Villa 12',
      notes: 'Delivered and signed by client.',
      courier: 'Yonas M. (Courier #09)',
    },
    {
      id: `#ORD-${baseNum - 14}`,
      customer: { initials: 'DK', name: 'David K.', phone: '+251 93 333 4455', email: 'david.k@fastmail.com' },
      merchantName,
      branchName,
      branchId: branch?.id || 'branch-0',
      itemsList: [
        { name: '2x Double Delight Burger Plate', price: '$32.00' },
        { name: '2x Nitro Cold Brew Coffee', price: '$10.00' },
      ],
      items: '2x Double Delight Plate, 2x Nitro Cold Brew',
      total: '$42.00',
      totalNum: 42.0,
      type: 'Dine-In',
      typeIcon: 'restaurant',
      payment: 'Cash on Counter',
      date: 'Today, 12:40 PM',
      relativeTime: '2 hrs ago',
      status: 'Delivered',
      statusVariant: 'delivered',
      deliveryAddress: `${branchName} - Dining Table #06`,
      notes: 'Dine-in table served hot.',
      courier: 'Branch Server (Lidya)',
    },
    {
      id: `#ORD-${baseNum - 19}`,
      customer: { initials: 'BA', name: 'Bethlehem Assefa', phone: '+251 96 111 2233', email: 'beth.assefa@gmail.com' },
      merchantName,
      branchName,
      branchId: branch?.id || 'branch-0',
      itemsList: [
        { name: '3x Crispy Glazed Wings', price: '$21.00' },
        { name: '1x Crisp Caesar Salad Bowl', price: '$10.50' },
      ],
      items: '3x Crispy Glazed Wings, 1x Caesar Salad Bowl',
      total: '$31.50',
      totalNum: 31.5,
      type: 'Delivery',
      typeIcon: 'delivery_dining',
      payment: 'Telebirr (Paid)',
      date: 'Today, 11:50 AM',
      relativeTime: '3 hrs ago',
      status: 'Delivered',
      statusVariant: 'delivered',
      deliveryAddress: 'CMC Road, Sunshine Real Estate, House 88',
      notes: 'Left with security guard as instructed.',
      courier: 'Abebe T. (Courier #14)',
    },
  ]
}

export const generateOrdersForMerchant = (merchant, branches = []) => {
  if (!branches || branches.length === 0) {
    return generateOrdersForBranch(merchant, { branch_name: `${merchant?.name || 'Main'} Branch`, id: 'branch-0' })
  }
  const allOrders = []
  branches.forEach((branch) => {
    const branchOrders = generateOrdersForBranch(merchant, branch)
    allOrders.push(...branchOrders)
  })
  return allOrders
}
