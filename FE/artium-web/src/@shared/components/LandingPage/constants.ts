export type SpotlightBlock = {
  image?: string
  name?: string
  highlightNumber?: string
  highlightText?: string
  highlightBackgroundColor?: string
  className?: string
}

export type SpotlightItem =
  | { layout: 'full'; full: SpotlightBlock; className?: string }
  | {
      layout: 'split-small-top' | 'split-large-top'
      top: SpotlightBlock
      bottom: SpotlightBlock
      className?: string
    }

export const SPOTLIGHT_ARTISTS: SpotlightItem[] = [
  {
    layout: 'split-small-top',
    top: {
      highlightNumber: '8,000+',
      highlightText: 'Active Collectors',
      highlightBackgroundColor: '#F5C6CB',
    },
    bottom: {
      image: '/images/homepage-v2/community-spotlight/art-1.jpg',
      name: 'Abi Salami',
    },
  },
  {
    layout: 'full',
    full: {
      image: '/images/homepage-v2/community-spotlight/art-3.jpg',
      name: 'Manuela Karin Knaut',
    },
  },
  {
    layout: 'split-large-top',
    top: {
      image: '/images/homepage-v2/community-spotlight/art-11.jpg',
      name: 'Chris Kelly',
    },
    bottom: {
      highlightNumber: '6,000+',
      highlightText: 'In Artwork Sold',
      highlightBackgroundColor: '#35c9ee',
    },
  },
  {
    layout: 'full',
    full: {
      image: '/images/homepage-v2/community-spotlight/art-4.jpg',
      name: 'Featured',
    },
  },
  {
    layout: 'split-small-top',
    top: {
      highlightNumber: '15,000+',
      highlightText: 'Artworks Sold',
      highlightBackgroundColor: '#f19b10',
    },
    bottom: {
      image: '/images/homepage-v2/community-spotlight/art-8.jpg',
      name: 'Susan Washington',
    },
  },
  {
    layout: 'full',
    full: {
      image: '/images/homepage-v2/community-spotlight/art-6.jpg',
      name: 'Featured',
    },
  },
  {
    layout: 'split-large-top',
    top: {
      image: '/images/homepage-v2/community-spotlight/art-7.jpg',
      name: 'Featured',
    },
    bottom: {
      highlightNumber: '$4.5M+',
      highlightText: 'In Artwork Sales',
      highlightBackgroundColor: '#22D877',
    },
  },
]

export type Feature = {
  title: string
  description: string
  bullets: string[]
  image: string
}

export const FEATURES: Feature[] = [
  {
    title: 'Portfolio',
    description:
      'Create a professional portfolio, display your artworks for sale, and collect subscribers for your newsletters.',
    bullets: [
      'Custom domains & landing pages',
      'Collections, tags, and inventory control',
      'SEO-ready pages',
    ],
    image: '/images/homepage-v2/features/portfolio-workspace.png',
  },
  {
    title: 'Send Newsletters',
    description:
      'Send branded updates to collectors with one click, segment your audience, and track engagement.',
    bullets: ['Beautiful templates', 'Audience segments', 'Open & click tracking'],
    image: '/images/homepage-v2/features/newsletter-workspace.png',
  },
  {
    title: 'Sell Anywhere',
    description: 'Invoices, Tap-to-Pay, and certificates of authenticity built into one workflow.',
    bullets: [
      'Send invoices in seconds',
      'Collect payments securely',
      'Track payouts and receipts',
    ],
    image: '/images/homepage-v2/features/sell-anywhere-workspace.png',
  },
]

export type JourneyItem = {
  title: string
  imageSrc: string
  href: string
  cta: string
}

export const JOURNEY_ITEMS: JourneyItem[] = [
  {
    title: 'For Artists',
    imageSrc: '/images/homepage-v2/platform-player/artist-3.jpg',
    href: '/discover?tab=profiles',
    cta: 'Learn More',
  },
  {
    title: 'For Galleries',
    imageSrc: '/images/homepage-v2/platform-player/gallery.jpg',
    href: '/editorial',
    cta: 'Learn More',
  },
]
