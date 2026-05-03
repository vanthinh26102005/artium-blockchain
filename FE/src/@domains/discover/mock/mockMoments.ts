export interface DiscoverMoment {
  id: string
  caption: string
  user: {
    id: string
    username: string
    fullName: string
    avatarUrl: string
    isVerified?: boolean
  }
  contents: Array<{
    video?: { title: string; processedThumb: string; videoUrl: string }
    image?: { imageMedium: string }
    artwork?: { imageMedium: string }
  }>
  stats: {
    likes: number
    comments: number
  }
}

/**
 * SAMPLE_VIDEO_URL - React component
 * @returns React element
 */
const SAMPLE_VIDEO_URL =
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

export const mockMoments: DiscoverMoment[] = [
  {
    id: 'mo-001',
/**
 * mockMoments - Utility function
 * @returns void
 */
    caption: 'Studio morning: layering texture on canvas.',
    user: {
      id: 'u-101',
      username: 'christina',
      fullName: 'Christina Jimenez',
      avatarUrl: 'https://i.pravatar.cc/64?u=71',
      isVerified: true,
    },
    contents: [
      {
        video: {
          title: 'Layering texture',
          processedThumb: 'https://picsum.photos/seed/moment-01/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 320, comments: 18 },
  },
  {
    id: 'mo-002',
    caption: 'Close-up work on the eyes.',
    user: {
      id: 'u-101',
      username: 'christina',
      fullName: 'Christina Jimenez',
      avatarUrl: 'https://i.pravatar.cc/64?u=71',
      isVerified: true,
    },
    contents: [
      {
        video: {
          title: 'Detail study',
          processedThumb: 'https://picsum.photos/seed/moment-02/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 280, comments: 22 },
  },
  {
    id: 'mo-003',
    caption: 'Color blocking session before the final pass.',
    user: {
      id: 'u-102',
      username: 'sora',
      fullName: 'Sora Park',
      avatarUrl: 'https://i.pravatar.cc/64?u=72',
      isVerified: true,
    },
    contents: [
      {
        video: {
          title: 'Color blocking',
          processedThumb: 'https://picsum.photos/seed/moment-03/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 410, comments: 31 },
  },
  {
    id: 'mo-004',
    caption: 'Soft shadows and a calm palette today.',
    user: {
      id: 'u-103',
      username: 'naomi',
      fullName: 'Naomi Wells',
      avatarUrl: 'https://i.pravatar.cc/64?u=73',
      isVerified: true,
    },
    contents: [
      {
        image: {
          imageMedium: 'https://picsum.photos/seed/moment-04/600/760',
        },
      },
    ],
    stats: { likes: 198, comments: 12 },
  },
  {
    id: 'mo-005',
    caption: 'Sketching folds for the textile series.',
    user: {
      id: 'u-104',
      username: 'zoe',
      fullName: 'Zoe Hart',
      avatarUrl: 'https://i.pravatar.cc/64?u=74',
      isVerified: false,
    },
    contents: [
      {
        video: {
          title: 'Fabric study',
          processedThumb: 'https://picsum.photos/seed/moment-05/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 152, comments: 9 },
  },
  {
    id: 'mo-006',
    caption: 'Experimenting with muted cyan layers.',
    user: {
      id: 'u-105',
      username: 'jules',
      fullName: 'Jules Bennett',
      avatarUrl: 'https://i.pravatar.cc/64?u=75',
      isVerified: true,
    },
    contents: [
      {
        artwork: {
          imageMedium: 'https://picsum.photos/seed/moment-06/600/760',
        },
      },
    ],
    stats: { likes: 275, comments: 16 },
  },
  {
    id: 'mo-007',
    caption: 'New brush strokes in the garden series.',
    user: {
      id: 'u-106',
      username: 'nina',
      fullName: 'Nina Lovelace',
      avatarUrl: 'https://i.pravatar.cc/64?u=76',
      isVerified: true,
    },
    contents: [
      {
        video: {
          title: 'Garden series',
          processedThumb: 'https://picsum.photos/seed/moment-07/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 305, comments: 14 },
  },
  {
    id: 'mo-008',
    caption: 'Working on sculptural textures with clay.',
    user: {
      id: 'u-107',
      username: 'leo',
      fullName: 'Leo Cruz',
      avatarUrl: 'https://i.pravatar.cc/64?u=77',
      isVerified: false,
    },
    contents: [
      {
        image: {
          imageMedium: 'https://picsum.photos/seed/moment-08/600/760',
        },
      },
    ],
    stats: { likes: 94, comments: 5 },
  },
  {
    id: 'mo-009',
    caption: 'Studio light test for the portrait setup.',
    user: {
      id: 'u-108',
      username: 'komy',
      fullName: 'Komy Thomas',
      avatarUrl: 'https://i.pravatar.cc/64?u=78',
      isVerified: true,
    },
    contents: [
      {
        video: {
          title: 'Light test',
          processedThumb: 'https://picsum.photos/seed/moment-09/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 208, comments: 11 },
  },
  {
    id: 'mo-010',
    caption: 'Watercolor washes drying between passes.',
    user: {
      id: 'u-109',
      username: 'aria',
      fullName: 'Aria Solis',
      avatarUrl: 'https://i.pravatar.cc/64?u=79',
      isVerified: true,
    },
    contents: [
      {
        image: {
          imageMedium: 'https://picsum.photos/seed/moment-10/600/760',
        },
      },
    ],
    stats: { likes: 188, comments: 8 },
  },
  {
    id: 'mo-011',
    caption: 'Building depth with quick palette swaps.',
    user: {
      id: 'u-110',
      username: 'lucas',
      fullName: 'Lucas Mint',
      avatarUrl: 'https://i.pravatar.cc/64?u=80',
      isVerified: false,
    },
    contents: [
      {
        video: {
          title: 'Palette swap',
          processedThumb: 'https://picsum.photos/seed/moment-11/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 160, comments: 10 },
  },
  {
    id: 'mo-012',
    caption: 'Ink outlines for the new series.',
    user: {
      id: 'u-111',
      username: 'ella',
      fullName: 'Ella Marino',
      avatarUrl: 'https://i.pravatar.cc/64?u=81',
      isVerified: true,
    },
    contents: [
      {
        artwork: {
          imageMedium: 'https://picsum.photos/seed/moment-12/600/760',
        },
      },
    ],
    stats: { likes: 246, comments: 19 },
  },
  {
    id: 'mo-013',
    caption: 'Found light reflections I want to keep.',
    user: {
      id: 'u-112',
      username: 'ren',
      fullName: 'Ren Tan',
      avatarUrl: 'https://i.pravatar.cc/64?u=82',
      isVerified: false,
    },
    contents: [
      {
        video: {
          title: 'Reflections',
          processedThumb: 'https://picsum.photos/seed/moment-13/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 130, comments: 6 },
  },
  {
    id: 'mo-014',
    caption: 'Clay study for a public art proposal.',
    user: {
      id: 'u-113',
      username: 'sol',
      fullName: 'Sol Avery',
      avatarUrl: 'https://i.pravatar.cc/64?u=83',
      isVerified: true,
    },
    contents: [
      {
        image: {
          imageMedium: 'https://picsum.photos/seed/moment-14/600/760',
        },
      },
    ],
    stats: { likes: 220, comments: 13 },
  },
  {
    id: 'mo-015',
    caption: 'Packing the knit sculptures for shipping.',
    user: {
      id: 'u-114',
      username: 'mila',
      fullName: 'Mila Goodwin',
      avatarUrl: 'https://i.pravatar.cc/64?u=84',
      isVerified: true,
    },
    contents: [
      {
        video: {
          title: 'Knits',
          processedThumb: 'https://picsum.photos/seed/moment-15/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 310, comments: 21 },
  },
  {
    id: 'mo-016',
    caption: 'New pet portrait series launch.',
    user: {
      id: 'u-115',
      username: 'jay',
      fullName: 'Jay Monroe',
      avatarUrl: 'https://i.pravatar.cc/64?u=85',
      isVerified: true,
    },
    contents: [
      {
        artwork: {
          imageMedium: 'https://picsum.photos/seed/moment-16/600/760',
        },
      },
    ],
    stats: { likes: 420, comments: 28 },
  },
  {
    id: 'mo-017',
    caption: 'Mixing pigments for the lake series.',
    user: {
      id: 'u-116',
      username: 'ivy',
      fullName: 'Ivy Chen',
      avatarUrl: 'https://i.pravatar.cc/64?u=86',
      isVerified: false,
    },
    contents: [
      {
        video: {
          title: 'Pigments',
          processedThumb: 'https://picsum.photos/seed/moment-17/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 110, comments: 7 },
  },
  {
    id: 'mo-018',
    caption: 'Ink map for the architectural piece.',
    user: {
      id: 'u-117',
      username: 'noah',
      fullName: 'Noah Pierce',
      avatarUrl: 'https://i.pravatar.cc/64?u=87',
      isVerified: true,
    },
    contents: [
      {
        image: {
          imageMedium: 'https://picsum.photos/seed/moment-18/600/760',
        },
      },
    ],
    stats: { likes: 175, comments: 15 },
  },
  {
    id: 'mo-019',
    caption: 'Studio clean-up and a quick recap.',
    user: {
      id: 'u-118',
      username: 'zo',
      fullName: 'Zo McLean',
      avatarUrl: 'https://i.pravatar.cc/64?u=88',
      isVerified: false,
    },
    contents: [
      {
        video: {
          title: 'Studio recap',
          processedThumb: 'https://picsum.photos/seed/moment-19/600/760',
          videoUrl: SAMPLE_VIDEO_URL,
        },
      },
    ],
    stats: { likes: 142, comments: 10 },
  },
  {
    id: 'mo-020',
    caption: 'Final varnish before delivery.',
    user: {
      id: 'u-119',
      username: 'zenia',
      fullName: 'Zenia Mazzucato',
      avatarUrl: 'https://i.pravatar.cc/64?u=89',
      isVerified: true,
    },
    contents: [
      {
        artwork: {
          imageMedium: 'https://picsum.photos/seed/moment-20/600/760',
        },
      },
    ],
    stats: { likes: 260, comments: 20 },
  },
]
