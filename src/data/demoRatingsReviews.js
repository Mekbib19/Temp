// Demo Customer Ratings & Reviews Data for Branches and Riders

const BRANCH_REVIEWS_STORAGE_KEY = 'deliver_app_branch_reviews'
const RIDER_REVIEWS_STORAGE_KEY = 'deliver_app_rider_reviews'

export const defaultBranchReviews = [
  {
    id: 'rev-b-101',
    entityId: 'branch-1',
    author: 'Sara Alemayehu',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
    rating: 5,
    date: 'May 24, 2024',
    timestamp: '2024-05-24T14:32:00Z',
    verifiedOrder: true,
    orderId: '#ORD-9982',
    orderItems: '2x Double Whopper Combo, 1x Onion Rings',
    title: 'Piping hot and packed with care!',
    comment:
      'The food arrived in pristine condition, still steaming! The packaging kept the fries delightfully crispy and nothing was spilled or smudged. Definitely our go-to branch in Bole.',
    helpfulCount: 38,
    userVotedHelpful: false,
    tags: ['Food Quality', 'Crispy Fries', 'Eco Packaging'],
    developerReply: {
      author: 'Branch General Manager (Bole Branch)',
      date: 'May 24, 2024',
      comment:
        'Thank you so much for the glowing 5-star review, Sara! Our kitchen crew always uses heat-insulated seal bags to guarantee your burgers and sides stay hot right up to your doorstep.',
    },
  },
  {
    id: 'rev-b-102',
    entityId: 'branch-1',
    author: 'Kidus Yohannes',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
    rating: 5,
    date: 'May 22, 2024',
    timestamp: '2024-05-22T19:15:00Z',
    verifiedOrder: true,
    orderId: '#ORD-9954',
    orderItems: '1x Truffle Pasta, 1x Garlic Bread, 1x Gelato',
    title: 'Consistently top quality every single weekend',
    comment:
      'We order dinner from this branch almost every Friday. Prep time was under 15 minutes, and the flavor profile is authentic Italian. 10/10 recommendation.',
    helpfulCount: 24,
    userVotedHelpful: false,
    tags: ['Fast Prep', 'Authentic Taste'],
    developerReply: null,
  },
  {
    id: 'rev-b-103',
    entityId: 'branch-1',
    author: 'Selamawit Bekele',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
    rating: 4,
    date: 'May 19, 2024',
    timestamp: '2024-05-19T12:45:00Z',
    verifiedOrder: true,
    orderId: '#ORD-9910',
    orderItems: '1x Spicy Chicken Feast Box',
    title: 'Delicious food, slightly missed one extra sauce',
    comment:
      'The spicy chicken was tender and juicy with just the right level of heat. Only taking one star off because my requested extra garlic dipping sauce was left out, but overall still very tasty.',
    helpfulCount: 16,
    userVotedHelpful: false,
    tags: ['Flavorful', 'Sauce Reminder'],
    developerReply: {
      author: 'Customer Experience Lead',
      date: 'May 20, 2024',
      comment:
        'Hello Selamawit, thank you for your candid feedback! We apologize for missing your garlic dip. We have credited your account with an extra condiment voucher and briefed our packing line.',
    },
  },
  {
    id: 'rev-b-104',
    entityId: 'branch-1',
    author: 'Dawit Abebe',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    rating: 5,
    date: 'May 16, 2024',
    timestamp: '2024-05-16T18:20:00Z',
    verifiedOrder: true,
    orderId: '#ORD-9884',
    orderItems: '3x Wood-fired Margherita Pizza',
    title: 'Best crust in town, arrived right on schedule',
    comment:
      'Cheese pull was incredible and the dough has great fermented flavor. Arrived 5 minutes ahead of the ETA.',
    helpfulCount: 19,
    userVotedHelpful: false,
    tags: ['Fresh Ingredients', 'Speedy Delivery'],
    developerReply: null,
  },
  {
    id: 'rev-b-105',
    entityId: 'branch-1',
    author: 'Bethlehem Haile',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
    rating: 3,
    date: 'May 11, 2024',
    timestamp: '2024-05-11T20:10:00Z',
    verifiedOrder: true,
    orderId: '#ORD-9820',
    orderItems: '1x Family Platter with Sodas',
    title: 'Good food, but delayed during Friday evening peak',
    comment:
      'Took about 45 minutes on a Friday night because the branch was overwhelmed with orders. The food was still decent warm, but prep times need tighter supervision during peak dinner hours.',
    helpfulCount: 11,
    userVotedHelpful: false,
    tags: ['Peak Hour Delay', 'Tasty When Warm'],
    developerReply: {
      author: 'Operations Director',
      date: 'May 12, 2024',
      comment:
        'Dear Bethlehem, Friday rush hour had an unprecedented volume spike. We have since brought on two additional kitchen station chefs to handle peak weekend volume and maintain sub-20 minute handoffs.',
    },
  },
  {
    id: 'rev-b-106',
    entityId: 'branch-1',
    author: 'Yared Tadesse',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=faces',
    rating: 5,
    date: 'May 08, 2024',
    timestamp: '2024-05-08T13:00:00Z',
    verifiedOrder: true,
    orderId: '#ORD-9762',
    orderItems: '2x Roasted Salmon Bowl',
    title: 'Healthy, portion size is generous!',
    comment:
      'Very clean presentation, avocado was fresh and ripe. Healthy meal delivery done right.',
    helpfulCount: 7,
    userVotedHelpful: false,
    tags: ['Healthy', 'Generous Portions'],
    developerReply: null,
  },
]

export const defaultRiderReviews = [
  {
    id: 'rev-r-201',
    entityId: 'RDR-7201',
    author: 'Hanna Tadesse',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
    rating: 5,
    date: 'May 24, 2024',
    timestamp: '2024-05-24T15:10:00Z',
    verifiedOrder: true,
    orderId: '#DEL-9982',
    orderItems: 'Delivery from The Burger Joint',
    title: 'Extremely polite and speedy delivery!',
    comment:
      'The rider called politely upon arrival at the gate, followed all complex building directions to my floor, and handled the drinks tray with zero spillage. Thank you so much!',
    helpfulCount: 42,
    userVotedHelpful: false,
    tags: ['Polite Courier', 'Followed Instructions', 'Careful Handling'],
    developerReply: {
      author: 'Dispatch Operations Supervisor',
      date: 'May 24, 2024',
      comment:
        'Thank you Hanna! We will commend the rider and award them an On-Time Customer Satisfaction bonus for exemplary service.',
    },
  },
  {
    id: 'rev-r-202',
    entityId: 'RDR-7201',
    author: 'Michael Bekele',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
    rating: 5,
    date: 'May 23, 2024',
    timestamp: '2024-05-23T19:40:00Z',
    verifiedOrder: true,
    orderId: '#DEL-9975',
    orderItems: 'Delivery from Mamma Mia Pizza',
    title: 'Kept pizza perfectly flat and hot',
    comment:
      'Pizza arrived hot with cheese in place! Many couriers tilt the bag, but this courier took special care. Truly professional service.',
    helpfulCount: 29,
    userVotedHelpful: false,
    tags: ['Thermal Bag Care', 'Punctual'],
    developerReply: null,
  },
  {
    id: 'rev-r-203',
    entityId: 'RDR-7201',
    author: 'Ruth Assefa',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
    rating: 5,
    date: 'May 20, 2024',
    timestamp: '2024-05-20T13:20:00Z',
    verifiedOrder: true,
    orderId: '#DEL-9912',
    orderItems: 'Delivery from Sakura Sushi',
    title: 'Great communication during heavy traffic',
    comment:
      'There was unexpected road construction near Kazanchis, and the courier promptly messaged me with an updated ETA so I was never left wondering. Very appreciated.',
    helpfulCount: 18,
    userVotedHelpful: false,
    tags: ['Proactive Updates', 'Courteous'],
    developerReply: null,
  },
  {
    id: 'rev-r-204',
    entityId: 'RDR-7201',
    author: 'Daniel Getachew',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
    rating: 4,
    date: 'May 17, 2024',
    timestamp: '2024-05-17T20:05:00Z',
    verifiedOrder: true,
    orderId: '#DEL-9884',
    orderItems: 'Delivery from Taco Haven',
    title: 'Good delivery, slight delay at compound entrance',
    comment:
      'Rider arrived safely with all food intact. Only minor hiccup was locating the visitor parking spot at our compound, but he was very courteous.',
    helpfulCount: 12,
    userVotedHelpful: false,
    tags: ['Safe Transit', 'Friendly'],
    developerReply: null,
  },
  {
    id: 'rev-r-205',
    entityId: 'RDR-7201',
    author: 'Eden Mengistu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=faces',
    rating: 5,
    date: 'May 12, 2024',
    timestamp: '2024-05-12T14:15:00Z',
    verifiedOrder: true,
    orderId: '#DEL-9820',
    orderItems: 'Delivery from Pasta Prime',
    title: 'Delivered in the rain with a smile!',
    comment:
      'It was pouring rain in Addis this afternoon, yet the courier kept the food 100% dry inside the waterproof insulated top box. Deserved a double tip!',
    helpfulCount: 35,
    userVotedHelpful: false,
    tags: ['Weather Proof Box', 'Exemplary Effort'],
    developerReply: {
      author: 'Rider Fleet Support',
      date: 'May 12, 2024',
      comment:
        'Thank you Eden! We equip all certified riders with commercial-grade all-weather gear so your meals arrive dry and hot in any Addis weather.',
    },
  },
  {
    id: 'rev-r-206',
    entityId: 'RDR-7201',
    author: 'Robel Girma',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=faces',
    rating: 3,
    date: 'May 06, 2024',
    timestamp: '2024-05-06T18:40:00Z',
    verifiedOrder: true,
    orderId: '#DEL-9762',
    orderItems: 'Delivery from Greens & Grains',
    title: 'Smooth ride, but arrived right on the cusp of estimated time',
    comment:
      'Delivery took right up to the final minute of the 35-min estimate. Food was fine and packaging was secure.',
    helpfulCount: 5,
    userVotedHelpful: false,
    tags: ['Met SLA Window'],
    developerReply: null,
  },
]

export function loadStoredReviews(storageKey, defaultList) {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) {
      localStorage.setItem(storageKey, JSON.stringify(defaultList))
      return defaultList
    }
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to load reviews from localStorage', err)
    return defaultList
  }
}

export function saveStoredReviews(storageKey, reviews) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(reviews))
    window.dispatchEvent(new CustomEvent('reviews-updated', { detail: { storageKey } }))
  } catch (err) {
    console.error('Failed to save reviews to localStorage', err)
  }
}

export function getBranchReviews(branchId) {
  const all = loadStoredReviews(BRANCH_REVIEWS_STORAGE_KEY, defaultBranchReviews)
  const matches = all.filter((r) => !branchId || r.entityId === branchId || r.entityId === 'branch-1')
  return matches.length > 0 ? matches : defaultBranchReviews
}

export function saveBranchReviews(reviews) {
  saveStoredReviews(BRANCH_REVIEWS_STORAGE_KEY, reviews)
}

export function getRiderReviews(riderId) {
  const all = loadStoredReviews(RIDER_REVIEWS_STORAGE_KEY, defaultRiderReviews)
  const matches = all.filter((r) => !riderId || r.entityId === riderId || r.entityId === 'RDR-7201')
  return matches.length > 0 ? matches : defaultRiderReviews
}

export function saveRiderReviews(reviews) {
  saveStoredReviews(RIDER_REVIEWS_STORAGE_KEY, reviews)
}
