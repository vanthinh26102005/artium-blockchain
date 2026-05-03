/**
 * BILLING_CYCLES - React component
 * @returns React element
 */
export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const

export type BillingCycle = (typeof BILLING_CYCLES)[keyof typeof BILLING_CYCLES]

export const PRICING_PLANS = [
  {
    id: 'basic',
/**
 * PRICING_PLANS - React component
 * @returns React element
 */
    name: 'Basic',
    description: 'For hobbyists and new collectors.',
    price: {
      monthly: 0,
      yearly: 0,
    },
    actionLabel: '',
    features: ['Up to 50 artworks'],
    isPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For emerging artists and serious collectors.',
    price: {
      monthly: 19,
      yearly: 15, // Assumed discount
    },
    actionLabel: 'Subscribe now',
    features: ['Up to 200 artworks'],
    isPopular: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing galleries and studios.',
    price: {
      monthly: 49,
      yearly: 39, // Assumed discount
    },
    actionLabel: 'Subscribe now',
    features: ['Up to 500 artworks'],
    isPopular: true,
  },
  {
    id: 'premier',
    name: 'Premier',
    description: 'For established institutions.',
    price: {
      monthly: 99,
      yearly: 79, // Assumed discount
    },
    actionLabel: 'Subscribe now',
    features: ['Unlimited artworks'],
    isPopular: false,
  },
]

export const SUPPORT_SERVICES = [
  {
    name: 'Artwork Migration',
    price: '$50 one-time',
    includedIn: ['Premier'],
    description:
/**
 * SUPPORT_SERVICES - React component
 * @returns React element
 */
      "We'll help migrate your existing artwork data into Artium so you can get started faster.",
  },
  {
    name: 'Contact Migration',
    price: '$50 one-time',
    includedIn: ['Premier'],
    description: 'Move your existing contacts to Artium. No limit on number of contacts.',
  },
  {
    name: 'Product Training',
    price: '$50/hour',
    includedIn: ['Growth', 'Premier'],
    description: 'Live session covering key features and workflows you need most.',
  },
  {
    name: 'Pricing & Career Advice',
    price: '$60/30 minutes',
    includedIn: [],
    description: 'Talk to an art professional about pricing, positioning, and career strategy.',
  },
  {
    name: 'Website Setup',
    price: '$200 one-time',
    includedIn: [],
    description: "We'll help you set up your custom website (up to 6 pages).",
  },
]

export const COMPARISON_FEATURES = [
  {
    category: 'Get Started',
    items: [
      {
        name: 'Upload artworks',
        basic: '1-by-1 only',
        pro: '1-by-1 only',
        growth: '+ Bulk upload',
/**
 * COMPARISON_FEATURES - React component
 * @returns React element
 */
        premier: '+ Bulk upload',
      },
      { name: 'Inventory limit', basic: '50', pro: '200', growth: '500', premier: 'unlimited' },
      {
        name: 'Inventory management',
        basic: 'No Folders',
        pro: 'Folders',
        growth: 'Folders',
        premier: 'Folders',
      },
      { name: 'Artwork migration', basic: false, pro: false, growth: false, premier: true },
    ],
  },
  {
    category: 'Profile & Storefront',
    items: [
      { name: 'Custom Domain', basic: false, pro: true, growth: true, premier: true },
      { name: 'Website analytics', basic: false, pro: false, growth: true, premier: true },
      { name: 'Event management', basic: false, pro: false, growth: true, premier: true },
    ],
  },
  {
    category: 'Sales & Payments',
    items: [{ name: 'Commission Fee', basic: '5%', pro: '2%', growth: '0%', premier: '0%' }],
  },
  {
    category: 'Support',
    items: [
      { name: 'Email Support', basic: true, pro: true, growth: true, premier: true },
      { name: 'Priority Support', basic: false, pro: false, growth: true, premier: true },
    ],
  },
  {
    category: 'AI-Features',
    items: [
      { name: '3D virtual gallery', basic: false, pro: false, growth: false, premier: true },
      { name: '24/7 AI twin', basic: false, pro: false, growth: false, premier: true },
      { name: 'Continue chats by phone', basic: false, pro: false, growth: false, premier: true },
    ],
  },
  {
    category: 'Manage Buyers Info',
    items: [
      { name: 'Collect buyers information', basic: false, pro: true, growth: true, premier: true },
      { name: 'Contact management', basic: false, pro: true, growth: true, premier: true },
      { name: 'Contact migration', basic: false, pro: false, growth: false, premier: true },
      { name: 'Export contacts', basic: false, pro: false, growth: false, premier: true },
    ],
  },
  {
    category: 'Build Audience',
    items: [
      { name: 'Affiliate earnings', basic: false, pro: true, growth: true, premier: true },
      { name: 'Messaging', basic: false, pro: true, growth: true, premier: true },
      { name: 'Discount & promo codes', basic: false, pro: false, growth: false, premier: true },
      {
        name: 'Email sends per month',
        basic: '10 emails',
        pro: '50 emails',
        growth: '5,000 emails',
        premier: '30,000 emails',
      },
      { name: 'Email analytics', basic: false, pro: true, growth: true, premier: true },
      { name: 'Private view', basic: '1', pro: '3', growth: '10', premier: 'unlimited' },
    ],
  },
  {
    category: 'Support',
    items: [
      {
        name: 'Artium customer support',
        basic: false,
        pro: 'Email',
        growth: 'Email',
        premier: 'Email & 1:1 call',
      },
      { name: 'Product training', basic: false, pro: false, growth: false, premier: false },
    ],
  },
]
