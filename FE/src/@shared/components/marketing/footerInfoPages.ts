import {
  BadgeCheck,
  BookOpen,
  Building2,
  ClipboardCheck,
  FileCheck2,
  GalleryVerticalEnd,
  Handshake,
  HelpCircle,
  Landmark,
  LockKeyhole,
  Mail,
  Palette,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react'
import type { FooterInfoPageData } from './FooterInfoPage'

export const footerInfoPages = {
  about: {
    slug: 'about',
    eyebrow: 'Company',
    title: 'A better operating layer for the art market.',
    description:
      'Artium connects public discovery with the private workflows artists and galleries need to sell, manage, and fulfill artwork without losing the collector experience.',
    metaTitle: 'About Artium | Digital Art Marketplace',
    metaDescription:
      'Learn how Artium connects art discovery, auctions, inventory, invoices, CRM, and payments.',
    primaryAction: { label: 'Explore marketplace', href: '/discover' },
    secondaryAction: { label: 'View live auctions', href: '/auction' },
    metrics: [
      { value: '15K+', label: 'Artworks sold' },
      { value: '8K+', label: 'Active collectors' },
      { value: '$4.5M+', label: 'Artwork sales' },
    ],
    cards: [
      {
        title: 'Collector-first',
        body: 'Artwork pages, editorial context, and auction moments are designed around buyer confidence.',
        icon: Users,
      },
      {
        title: 'Artist-owned',
        body: 'Profiles, inventory, invoices, and client records stay connected to the people creating the work.',
        icon: Palette,
      },
      {
        title: 'Market-ready',
        body: 'The same system supports browsing, bidding, checkout, provenance, and post-sale operations.',
        icon: BadgeCheck,
      },
    ],
    stepsTitle: 'How Artium works.',
    stepsDescription:
      'The platform is built as one flow from first view to final payout, not a set of disconnected tools.',
    steps: [
      {
        title: 'Publish work with context',
        body: 'Artists and galleries can present works with imagery, pricing, availability, and supporting story.',
      },
      {
        title: 'Convert demand into transactions',
        body: 'Collectors can browse, bid, and check out through flows that keep trust signals close.',
      },
      {
        title: 'Manage the back office',
        body: 'Inventory, invoices, CRM, email, events, and sales records stay available after the public moment.',
      },
    ],
  },
  contact: {
    slug: 'contact',
    eyebrow: 'Contact us',
    title: 'Talk to the Artium team.',
    description:
      'Reach out for marketplace onboarding, gallery workflows, auction setup, partnership questions, or support with an existing collector flow.',
    metaTitle: 'Contact Artium | Support and Partnerships',
    metaDescription: 'Contact Artium for onboarding, gallery tools, auction setup, and support.',
    primaryAction: { label: 'Email support', href: 'mailto:support@artium.market' },
    secondaryAction: { label: 'Browse FAQs', href: '/faqs' },
    metrics: [
      { value: '24h', label: 'Typical reply' },
      { value: '3', label: 'Support paths' },
      { value: '1:1', label: 'Onboarding help' },
    ],
    cards: [
      {
        title: 'Sales support',
        body: 'Ask about pricing, marketplace launch plans, gallery operations, or demo preparation.',
        icon: Handshake,
      },
      {
        title: 'Product help',
        body: 'Get help with profiles, auctions, checkout, invoices, CRM, and connected workflows.',
        icon: HelpCircle,
      },
      {
        title: 'Partnerships',
        body: 'Discuss gallery programs, artist communities, events, editorial, or integration opportunities.',
        icon: Building2,
      },
    ],
    stepsTitle: 'Best contact path.',
    stepsDescription:
      'Send the team enough context so the right person can respond without a long back-and-forth.',
    steps: [
      {
        title: 'Share your role',
        body: 'Tell us whether you are an artist, gallery, collector, curator, partner, or developer.',
      },
      {
        title: 'Include the workflow',
        body: 'Mention the page, auction, artwork, invoice, or account area connected to your request.',
      },
      {
        title: 'Add timing needs',
        body: 'If your request is tied to a launch, demo, event, or active sale, include the target date.',
      },
    ],
    noteTitle: 'Support note',
    noteBody:
      'For urgent payment or auction issues, include the order, invoice, auction, or transaction reference if available.',
  },
  onboardingGuide: {
    slug: 'onboarding-guide',
    eyebrow: 'Onboarding guide',
    title: 'Launch your public art workflow.',
    description:
      'Use this guide to move from a blank account to a collector-ready storefront with inventory, sales paths, and client records in place.',
    metaTitle: 'Onboarding Guide | Artium',
    metaDescription: 'A practical onboarding guide for setting up Artium as an artist or gallery.',
    primaryAction: { label: 'Create account', href: '/sign-up' },
    secondaryAction: { label: 'View marketplace', href: '/discover' },
    metrics: [
      { value: '01', label: 'Profile' },
      { value: '02', label: 'Inventory' },
      { value: '03', label: 'Sales flow' },
    ],
    cards: [
      {
        title: 'Profile setup',
        body: 'Add your identity, statement, images, and public context so collectors know who they are buying from.',
        icon: Users,
      },
      {
        title: 'Work catalog',
        body: 'Upload artwork records with images, pricing, availability, and supporting metadata.',
        icon: GalleryVerticalEnd,
      },
      {
        title: 'Sales tools',
        body: 'Prepare auctions, invoices, checkout, and client records before sending buyers into the flow.',
        icon: WalletCards,
      },
    ],
    stepsTitle: 'Setup sequence.',
    stepsDescription:
      'Start with the identity layer, then add inventory, then connect the sales and operations layer.',
    steps: [
      {
        title: 'Complete your profile',
        body: 'Add a name, handle, bio, image, contact details, and marketplace-facing story.',
      },
      {
        title: 'Upload core works',
        body: 'Start with a focused set of available works, then expand with archived or sold pieces.',
      },
      {
        title: 'Choose the selling path',
        body: 'Use fixed-price checkout, live auctions, private invoices, or a mix based on the work.',
      },
      {
        title: 'Review the demo flow',
        body: 'Walk through discovery, artwork detail, checkout, and order states before inviting collectors.',
      },
    ],
  },
  forArtists: {
    slug: 'for-artists',
    eyebrow: 'For artists',
    title: 'A storefront and studio desk in one place.',
    description:
      'Artium helps artists present work beautifully while keeping sales, invoices, collector conversations, and records connected behind the scenes.',
    metaTitle: 'For Artists | Artium',
    metaDescription:
      'Tools for artists to publish portfolios, sell artworks, run auctions, and manage collectors.',
    primaryAction: { label: 'Start as artist', href: '/seller/register' },
    secondaryAction: { label: 'Browse artists', href: '/discover' },
    metrics: [
      { value: '15K+', label: 'Works sold' },
      { value: 'Live', label: 'Auction tools' },
      { value: 'CRM', label: 'Collector records' },
    ],
    cards: [
      {
        title: 'Publish',
        body: 'Create a profile and artwork catalog that collectors can browse, save, and share.',
        icon: Palette,
      },
      {
        title: 'Sell',
        body: 'Move buyers into checkout, auction, or invoice flows without rebuilding each sale manually.',
        icon: WalletCards,
      },
      {
        title: 'Remember',
        body: 'Keep collector records, notes, orders, and communication history attached to the work.',
        icon: BookOpen,
      },
    ],
    stepsTitle: 'Artist workflow.',
    stepsDescription:
      'The artist experience is built to support both public presentation and repeat studio operations.',
    steps: [
      {
        title: 'Show the work',
        body: 'Use high-quality listing pages with image, description, price, and provenance context.',
      },
      {
        title: 'Create a buying path',
        body: 'Offer a direct purchase, live auction, private invoice, or contact-led sales flow.',
      },
      {
        title: 'Follow through after payment',
        body: 'Track orders, collectors, payouts, and post-sale details from the same workspace.',
      },
    ],
  },
  forGalleries: {
    slug: 'for-galleries',
    eyebrow: 'For galleries',
    title: 'A quieter operating system for gallery programs.',
    description:
      'Artium gives galleries a digital layer for exhibitions, private sales, auctions, contacts, invoices, inventory, and collector follow-up.',
    metaTitle: 'For Galleries | Artium',
    metaDescription:
      'Gallery tools for inventory, collectors, invoices, auctions, private sales, and public programs.',
    primaryAction: { label: 'Plan gallery setup', href: '/contact' },
    secondaryAction: { label: 'View pricing', href: '/pricing' },
    metrics: [
      { value: 'CRM', label: 'Collector context' },
      { value: 'Multi', label: 'Sales channels' },
      { value: 'Live', label: 'Auction support' },
    ],
    cards: [
      {
        title: 'Inventory',
        body: 'Track works, availability, pricing, provenance, and placement status across programs.',
        icon: GalleryVerticalEnd,
      },
      {
        title: 'Collectors',
        body: 'Keep contacts, preferences, notes, transactions, and follow-up signals in one place.',
        icon: Users,
      },
      {
        title: 'Transactions',
        body: 'Generate invoices, support checkout, and maintain a clear record after each sale.',
        icon: ClipboardCheck,
      },
    ],
    stepsTitle: 'Gallery workflow.',
    stepsDescription:
      'The gallery pages focus on repeat operational work rather than one-off campaign pages.',
    steps: [
      {
        title: 'Import or create inventory',
        body: 'Build the catalog that powers public pages, private views, invoices, and sales records.',
      },
      {
        title: 'Prepare collector paths',
        body: 'Use public listings, private views, live auctions, or direct invoices depending on the work.',
      },
      {
        title: 'Centralize follow-up',
        body: 'Keep buyer context, order history, and post-sale communication available for the team.',
      },
    ],
  },
  whyArtists: {
    slug: 'why-artium-for-artists',
    eyebrow: 'Why Artium for artists',
    title: 'Because discovery should lead somewhere useful.',
    description:
      'Artists need more than a public profile. Artium connects attention to the practical work of pricing, selling, invoicing, and staying close to collectors.',
    metaTitle: 'Why Artium for Artists | Artium',
    metaDescription: 'Why artists use Artium for discovery, auctions, checkout, invoices, and CRM.',
    primaryAction: { label: 'Create artist account', href: '/seller/register' },
    secondaryAction: { label: 'Read FAQs', href: '/faqs' },
    metrics: [
      { value: 'Less', label: 'Manual admin' },
      { value: 'More', label: 'Collector signal' },
      { value: 'One', label: 'Connected flow' },
    ],
    cards: [
      {
        title: 'Keep context',
        body: 'Each artwork can carry images, story, availability, price, and transaction context.',
        icon: BookOpen,
      },
      {
        title: 'Reduce admin',
        body: 'Invoices, orders, contacts, and sale records do not need to live in separate tools.',
        icon: ClipboardCheck,
      },
      {
        title: 'Build memory',
        body: 'Collector interactions become useful history instead of disappearing after a sale.',
        icon: Sparkles,
      },
    ],
    stepsTitle: 'Why it matters.',
    stepsDescription:
      'The value is strongest when an artist needs a professional sales flow without losing control of the work.',
    steps: [
      {
        title: 'Public demand becomes actionable',
        body: 'Listings, auctions, and checkout routes make collector interest easier to convert.',
      },
      {
        title: 'Admin stays near the artwork',
        body: 'Sale records, buyer details, and invoice data remain connected to the piece.',
      },
      {
        title: 'The artist keeps momentum',
        body: 'Artium supports the next listing, the next collector message, and the next sale.',
      },
    ],
  },
  whyGalleries: {
    slug: 'why-artium-for-galleries',
    eyebrow: 'Why Artium for galleries',
    title: 'Because gallery work is relationship work.',
    description:
      'Artium gives galleries a connected workspace for programs, buyers, inventory, private sales, auctions, and repeat collector communication.',
    metaTitle: 'Why Artium for Galleries | Artium',
    metaDescription:
      'Why galleries use Artium to connect inventory, collectors, auctions, invoices, and programs.',
    primaryAction: { label: 'Contact gallery team', href: '/contact' },
    secondaryAction: { label: 'View gallery tools', href: '/for-galleries' },
    metrics: [
      { value: 'One', label: 'Team workspace' },
      { value: 'Clear', label: 'Sales records' },
      { value: 'Live', label: 'Auction flow' },
    ],
    cards: [
      {
        title: 'Program clarity',
        body: 'Keep exhibition, artwork, and sales context accessible across the gallery team.',
        icon: Landmark,
      },
      {
        title: 'Buyer memory',
        body: 'Collector interest, communication, and transaction history can inform the next conversation.',
        icon: Users,
      },
      {
        title: 'Sale control',
        body: 'Public, private, invoice, and auction flows can all resolve back into a single operating layer.',
        icon: FileCheck2,
      },
    ],
    stepsTitle: 'Gallery advantage.',
    stepsDescription:
      'Artium is built around the operational reality of galleries: repeat programs, repeat buyers, and high-context sales.',
    steps: [
      {
        title: 'Create a source of truth',
        body: 'Inventory, collectors, invoices, and records can be managed without recreating data between tools.',
      },
      {
        title: 'Support multiple sales modes',
        body: 'Run direct sales, private offers, checkout, and auctions from the same system.',
      },
      {
        title: 'Keep the team aligned',
        body: 'A shared workspace gives staff the information needed before and after collector conversations.',
      },
    ],
  },
  faqs: {
    slug: 'faqs',
    eyebrow: 'FAQs',
    title: 'Questions before you start.',
    description:
      'A quick reference for how Artium supports artists, galleries, collectors, listings, auctions, checkout, and account setup.',
    metaTitle: 'FAQs | Artium',
    metaDescription:
      'Frequently asked questions about Artium marketplace, auctions, and art tools.',
    primaryAction: { label: 'Contact support', href: '/contact' },
    secondaryAction: { label: 'Start onboarding', href: '/onboarding-guide' },
    metrics: [
      { value: 'Artists', label: 'Profiles and sales' },
      { value: 'Galleries', label: 'Inventory and CRM' },
      { value: 'Collectors', label: 'Browse and bid' },
    ],
    cards: [
      {
        title: 'Who can use Artium?',
        body: 'Artists, galleries, and collectors can use the marketplace, with management tools focused on sellers.',
        icon: Users,
      },
      {
        title: 'Can I run auctions?',
        body: 'Yes. Artium includes live auction flows alongside direct checkout and invoice-based selling.',
        icon: BadgeCheck,
      },
      {
        title: 'Is checkout connected?',
        body: 'Orders, invoices, payment context, and buyer records can stay connected after the transaction.',
        icon: WalletCards,
      },
    ],
    stepsTitle: 'Common answers.',
    stepsDescription:
      'These answers cover the flows a demo user is most likely to click from the footer.',
    steps: [
      {
        title: 'Do I need a gallery to sell?',
        body: 'No. Independent artists can publish work and use seller workflows directly.',
      },
      {
        title: 'Can galleries manage many artists?',
        body: 'Yes. Gallery workflows are designed around inventory, contacts, programs, and sales records.',
      },
      {
        title: 'Where do collectors start?',
        body: 'Collectors can browse the marketplace, read editorial, view artwork pages, and enter checkout or auctions.',
      },
      {
        title: 'What should I demo first?',
        body: 'Start with discovery, open an artwork, review auction or checkout, then show the seller-side tools.',
      },
    ],
  },
  communityGuidelines: {
    slug: 'community-guidelines',
    eyebrow: 'Community guidelines',
    title: 'Trust rules for a serious art market.',
    description:
      'Artium relies on accurate artwork information, respectful collector communication, and transparent sales behavior.',
    metaTitle: 'Community Guidelines | Artium',
    metaDescription:
      'Community guidelines for artists, galleries, collectors, listings, communication, and marketplace trust.',
    primaryAction: { label: 'Review FAQs', href: '/faqs' },
    secondaryAction: { label: 'Contact team', href: '/contact' },
    metrics: [
      { value: 'Clear', label: 'Listings' },
      { value: 'Respect', label: 'Communication' },
      { value: 'Trust', label: 'Transactions' },
    ],
    cards: [
      {
        title: 'Accurate listings',
        body: 'Artwork details, availability, images, and pricing should be represented honestly.',
        icon: BadgeCheck,
      },
      {
        title: 'Respectful conduct',
        body: 'Collectors, artists, and gallery teams should communicate professionally and without harassment.',
        icon: Handshake,
      },
      {
        title: 'Transparent sales',
        body: 'Bids, invoices, checkout, and post-sale communication should reflect the agreed transaction.',
        icon: ShieldCheck,
      },
    ],
    stepsTitle: 'Community baseline.',
    stepsDescription:
      'These guidelines keep marketplace interactions clear enough for buyers and sellers to trust the flow.',
    steps: [
      {
        title: 'Represent artwork honestly',
        body: 'Do not misstate authorship, condition, pricing, ownership, or availability.',
      },
      {
        title: 'Respect buyer and seller boundaries',
        body: 'Do not spam, pressure, impersonate, or move conversations into unsafe payment channels.',
      },
      {
        title: 'Honor transaction commitments',
        body: 'If a sale, bid, invoice, or fulfillment detail changes, communicate promptly and clearly.',
      },
    ],
    noteTitle: 'Guideline note',
    noteBody:
      'For a class demo, this page gives a complete public-facing destination instead of an empty footer link.',
  },
  terms: {
    slug: 'terms-of-service',
    eyebrow: 'Terms of service',
    title: 'The operating rules for using Artium.',
    description:
      'These terms summarize account responsibilities, marketplace behavior, listings, auctions, checkout, and platform access.',
    metaTitle: 'Terms of Service | Artium',
    metaDescription:
      'Terms of service for using Artium marketplace, auctions, accounts, and sales tools.',
    primaryAction: { label: 'Contact support', href: '/contact' },
    secondaryAction: { label: 'Privacy policy', href: '/privacy-policy' },
    metrics: [
      { value: 'Account', label: 'Responsibility' },
      { value: 'Market', label: 'Conduct' },
      { value: 'Sales', label: 'Records' },
    ],
    cards: [
      {
        title: 'Accounts',
        body: 'Users are responsible for account access, accurate information, and activity under their profile.',
        icon: LockKeyhole,
      },
      {
        title: 'Listings',
        body: 'Artwork, auction, and sales information should be accurate and lawful to publish.',
        icon: FileCheck2,
      },
      {
        title: 'Transactions',
        body: 'Checkout, invoices, bidding, and fulfillment depend on clear seller and buyer commitments.',
        icon: WalletCards,
      },
    ],
    stepsTitle: 'Terms overview.',
    stepsDescription:
      'The full legal version can evolve later, but the route now has a credible public UI surface.',
    steps: [
      {
        title: 'Use the platform lawfully',
        body: 'Do not misuse accounts, interfere with other users, or publish misleading marketplace information.',
      },
      {
        title: 'Maintain accurate records',
        body: 'Sellers should keep artwork, inventory, invoice, auction, and contact details up to date.',
      },
      {
        title: 'Respect transaction flows',
        body: 'Buyers and sellers should follow the checkout, invoice, auction, and order flows shown in Artium.',
      },
    ],
    noteTitle: 'Terms note',
    noteBody:
      'This page is structured as a demo-ready policy page and should be reviewed by counsel before production use.',
  },
  privacy: {
    slug: 'privacy-policy',
    eyebrow: 'Privacy policy',
    title: 'How Artium thinks about data.',
    description:
      'Artium uses account, artwork, collector, order, and communication data to support marketplace and operating workflows.',
    metaTitle: 'Privacy Policy | Artium',
    metaDescription:
      'Privacy policy overview for Artium account, artwork, collector, order, and communication data.',
    primaryAction: { label: 'Contact privacy team', href: '/contact' },
    secondaryAction: { label: 'Terms of service', href: '/terms-of-service' },
    metrics: [
      { value: 'Data', label: 'Minimized' },
      { value: 'Access', label: 'Controlled' },
      { value: 'Trust', label: 'Centered' },
    ],
    cards: [
      {
        title: 'Account data',
        body: 'Profile, login, seller, and contact details help the product identify users and route workflows.',
        icon: LockKeyhole,
      },
      {
        title: 'Market data',
        body: 'Artwork, listing, auction, invoice, and order information powers marketplace transactions.',
        icon: GalleryVerticalEnd,
      },
      {
        title: 'Communication data',
        body: 'Messages, notes, and support requests help teams manage collector and seller relationships.',
        icon: Mail,
      },
    ],
    stepsTitle: 'Privacy overview.',
    stepsDescription:
      'A clear privacy page helps collectors and sellers understand why data exists in the workflow.',
    steps: [
      {
        title: 'Collect data for product function',
        body: 'Artium uses data needed to authenticate users, publish work, process sales, and support accounts.',
      },
      {
        title: 'Use data to support transactions',
        body: 'Order, auction, invoice, and collector data helps buyers and sellers complete and review sales.',
      },
      {
        title: 'Protect sensitive access',
        body: 'Account and payment-adjacent workflows should use appropriate permissions and secure handling.',
      },
    ],
    noteTitle: 'Privacy note',
    noteBody:
      'This demo page is informational and should be expanded into a full legal policy before production launch.',
  },
} satisfies Record<string, FooterInfoPageData>
