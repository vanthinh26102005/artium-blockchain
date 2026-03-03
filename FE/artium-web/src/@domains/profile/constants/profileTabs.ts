import { ProfileTabKey } from '@domains/profile/types'

export const PROFILE_TABS: Array<{ key: ProfileTabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'artworks', label: 'Artworks' },
  { key: 'moments', label: 'Moments' },
  { key: 'moodboards', label: 'Moodboards' },
]
