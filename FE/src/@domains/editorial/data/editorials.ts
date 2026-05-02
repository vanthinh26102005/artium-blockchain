// @domains - editorial
import type { EditorialItem } from '@domains/editorial/types'

const BASE_EDITORIAL_ITEMS: EditorialItem[] = [
  {
    id: 'editorial-san-francisco-galleries',
    title: 'A bridged guide to San Francisco art galleries in one afternoon',
    category: 'Blog',
    excerpt:
      'A mapped loop through Tenderloin studios, nonprofit spaces, and the blue-chip dens tucked around Union Square.',
    imageUrl:
      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=2000&q=80',
    author: 'Artium Editorial Desk',
    readTime: '6 min read',
    publishedAt: '2024-12-08',
    tags: ['City', 'Galleries', 'Itinerary'],
    featured: true,
  },
  {
    id: 'editorial-young-collectors',
    title: 'What young collectors are asking for at winter fairs',
    category: 'Blog',
    excerpt:
      'From ceramics with provenance to large-format photography, here are the buying signals we picked up on the ground.',
    imageUrl:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=2000&q=80',
    author: 'Maya Richter',
    readTime: '7 min read',
    publishedAt: '2025-01-12',
    tags: ['Fairs', 'Collectors'],
  },
  {
    id: 'editorial-studio-visit-oakland',
    title: 'Studio visit: translating sound into pigment in Oakland',
    category: 'Blog',
    excerpt:
      'A day with musician-turned-painter Lia Tran as she scores canvases with modular synths and analog tape loops.',
    imageUrl:
      'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=2000&q=80',
    author: 'Tayo Bello',
    readTime: '5 min read',
    publishedAt: '2024-11-22',
    tags: ['Process', 'Sound', 'West Coast'],
  },
  {
    id: 'editorial-collector-playbook',
    title: 'The modern collector playbook: building a focused first 10',
    category: 'Blog',
    excerpt:
      'How to set a thesis, work with advisors, and document acquisitions without losing the thrill of discovery.',
    imageUrl:
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=2000&q=80',
    author: 'Artium Research',
    readTime: '8 min read',
    publishedAt: '2025-01-04',
    tags: ['Guides', 'Strategy'],
  },
  {
    id: 'editorial-seoul-night-guide',
    title: 'Seoul after dark: project spaces and late-night openings',
    category: 'Blog',
    excerpt:
      'Independent spaces in Euljiro and Seongsu that keep their doors open for collectors hopping between fairs.',
    imageUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=2000&q=80',
    author: 'Jun Park',
    readTime: '4 min read',
    publishedAt: '2024-10-30',
    tags: ['Asia', 'City', 'Night'],
  },
  {
    id: 'editorial-digital-hospitality',
    title: 'Designing digital hospitality for galleries',
    category: 'Blog',
    excerpt:
      'Simple microcopy, warm follow-ups, and frictionless viewing rooms that make online collectors feel expected.',
    imageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    author: 'Ruthie Carlin',
    readTime: '6 min read',
    publishedAt: '2025-01-10',
    tags: ['Product', 'UX', 'Galleries'],
  },
  {
    id: 'editorial-material-memory',
    title: 'Material memory: clay, fiber, and the stories they keep',
    category: 'Blog',
    excerpt:
      'Four makers on working with tactile materials to archive family narratives and collective histories.',
    imageUrl:
      'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=2000&q=80',
    author: 'Imani Rosario',
    readTime: '5 min read',
    publishedAt: '2024-12-18',
    tags: ['Makers', 'Process', 'Material'],
  },
  {
    id: 'editorial-fair-calendar',
    title: 'Your spring fair calendar with three efficient routes',
    category: 'Blog',
    excerpt:
      'Link out to art weeks in New York, Mexico City, and Berlin with routes that pair satellite shows and studios.',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80',
    author: 'Artium Editorial Desk',
    readTime: '3 min read',
    publishedAt: '2024-12-28',
    tags: ['Itinerary', 'Travel', 'Calendar'],
  },
  {
    id: 'editorial-book-shelf',
    title: 'On the shelf: writing about art without jargon',
    category: 'Blog',
    excerpt:
      'An annotated reading list for press releases, wall text, and emails that feel human and precise.',
    imageUrl:
      'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=2000&q=80',
    author: 'Vera Sutton',
    readTime: '4 min read',
    publishedAt: '2024-11-04',
    tags: ['Books', 'Language'],
  },
  {
    id: 'editorial-artist-toolkit',
    title: 'Artist toolkit: pricing, pacing drops, and staying visible',
    category: 'Blog',
    excerpt:
      'A tactical checklist for independent artists: edition logic, waitlists, and collaborating with pop-ups.',
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80',
    author: 'Leah Benton',
    readTime: '7 min read',
    publishedAt: '2024-12-01',
    tags: ['Career', 'Pricing', 'Distribution'],
  },
  {
    id: 'editorial-archipelago',
    title: 'Archipelago thinking: building a distributed program',
    category: 'Blog',
    excerpt:
      'Why the strongest emerging galleries are acting like networks--running salons, roving residencies, and digital drops.',
    imageUrl:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2000&q=80',
    author: 'Marcelo Ortega',
    readTime: '6 min read',
    publishedAt: '2024-12-15',
    tags: ['Strategy', 'Galleries', 'Remote'],
  },
  {
    id: 'editorial-paper-colle',
    title: 'Artium 101: What is Papier Colle',
    category: 'Blog',
    excerpt:
      'A quick crash course on building layered compositions with scissors, glue, and archival papers.',
    imageUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=2000&q=80',
    author: 'Sandra Song',
    readTime: '5 min read',
    publishedAt: '2024-08-11',
    tags: ['Basics', 'Collage'],
  },
  {
    id: 'editorial-jordyn-owens',
    title: 'Spotlight: Jordyn Owens on finding creativity in chaos and curiosity',
    category: 'Blog',
    excerpt:
      'Brooklyn painter Jordyn Owens blends spontaneity and raw emotion in portraits that feel alive.',
    imageUrl:
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=2000&q=80',
    author: 'Artium',
    readTime: '6 min read',
    publishedAt: '2025-02-11',
    tags: ['Spotlight', 'Process'],
  },
  {
    id: 'editorial-reno-fair',
    title: '17 artists we are excited to see at the Reno Tahoe International Art Show 2025',
    category: 'Blog',
    excerpt:
      'Our shortlist of sculptors, printmakers, and textile artists worth circling on your fair map.',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80',
    author: 'Kendall Warson',
    readTime: '9 min read',
    publishedAt: '2025-09-10',
    tags: ['Fairs', 'Shortlist'],
  },
  {
    id: 'editorial-gome-alon',
    title: 'Spotlight: Gome Alon on capturing the essence of everyday objects',
    category: 'Blog',
    excerpt:
      'Why the artist keeps returning to simple tools and household forms to study memory and repetition.',
    imageUrl:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2000&q=80',
    author: 'Ho Vuong Tuong Vy',
    readTime: '5 min read',
    publishedAt: '2025-03-05',
    tags: ['Spotlight', 'Objects'],
  },
  {
    id: 'editorial-jack-carden',
    title: "Paper Drop: Jack Carden's provocation on art",
    category: 'Blog',
    excerpt:
      'A designer-turned-artist bends paper, neon, and text to question how we consume cultural signals.',
    imageUrl:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=80',
    author: 'Claire Uhar',
    readTime: '5 min read',
    publishedAt: '2024-10-01',
    tags: ['Paper', 'Concept'],
  },
  {
    id: 'editorial-pacing-pricing',
    title: 'Artist toolkit: pricing, pacing drops, and staying visible',
    category: 'Blog',
    excerpt: 'How to time releases, set editions, and keep collectors warm without burning out.',
    imageUrl:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=2000&q=80',
    author: 'Leah Benton',
    readTime: '7 min read',
    publishedAt: '2024-12-01',
    tags: ['Toolkit', 'Pricing'],
  },
  {
    id: 'editorial-venice-notes',
    title: 'Venice notes: quiet shows beyond the Giardini',
    category: 'Blog',
    excerpt:
      'Backstreet palazzi, satellite pavilions, and project spaces worth an afternoon detour.',
    imageUrl:
      'https://images.unsplash.com/photo-1458530970867-aaa3700e966d?auto=format&fit=crop&w=2000&q=80',
    author: 'Anya Rizzo',
    readTime: '4 min read',
    publishedAt: '2024-09-18',
    tags: ['Travel', 'Biennale'],
  },
  {
    id: 'editorial-artist-studio-habits',
    title: 'Studio habits: rituals that keep artists shipping work',
    category: 'Blog',
    excerpt:
      'Morning stretches, batch photographing, and end-of-week reviews that help artists stay consistent.',
    imageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80',
    author: 'Marcus Hale',
    readTime: '6 min read',
    publishedAt: '2025-01-22',
    tags: ['Habits', 'Workflow'],
  },
  {
    id: 'editorial-collectors-winter-shelf',
    title: 'Collectors winter shelf: five books to reset your eye',
    category: 'Blog',
    excerpt:
      'From essays on material memory to interviews with curators, this reading list sharpens your instincts.',
    imageUrl:
      'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=2000&q=80',
    author: 'Vera Sutton',
    readTime: '5 min read',
    publishedAt: '2024-12-05',
    tags: ['Books', 'Collecting'],
  },
  {
    id: 'editorial-spring-fair-routes',
    title: 'Your spring fair calendar with three efficient routes',
    category: 'Blog',
    excerpt:
      'Link out to art weeks in New York, Mexico City, and Berlin with routes that pair satellite shows and studios.',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80',
    author: 'Artium Editorial Desk',
    readTime: '6 min read',
    publishedAt: '2024-12-28',
    tags: ['Fairs', 'Routes'],
  },
]

const CLONE_COUNT = 100
const generatedEditorials: EditorialItem[] = Array.from({ length: CLONE_COUNT }, (_val, index) => {
  const seedableItems = BASE_EDITORIAL_ITEMS.filter((item) => !item.featured)
  const seed = seedableItems[index % seedableItems.length]
  const date = new Date(seed.publishedAt)
  date.setDate(date.getDate() - (index + 1))

  return {
    ...seed,
    id: `${seed.id}-extra-${index + 1}`,
    title: `${seed.title} ${index + 1}`,
    publishedAt: date.toISOString().slice(0, 10),
    featured: false,
  }
})

export const EDITORIAL_ITEMS: EditorialItem[] = [...BASE_EDITORIAL_ITEMS, ...generatedEditorials]
