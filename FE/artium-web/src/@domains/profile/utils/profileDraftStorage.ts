import { ProfileOverviewData } from '@domains/profile/types'

export type ProfileDraft = {
  userId?: string
  avatarUrl?: string
  username?: string
  firstName?: string
  lastName?: string
  savedAt?: number
}

const STORAGE_KEY = 'artium.profile.draft'
const DRAFT_TTL_MS = 5 * 60 * 1000

export const loadProfileDraft = (): ProfileDraft | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ProfileDraft
  } catch {
    return null
  }
}

export const saveProfileDraft = (draft: ProfileDraft, options?: { emit?: boolean }) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }))
  if (options?.emit !== false) {
    window.dispatchEvent(new Event('profile-draft-updated'))
  }
}

export const clearProfileDraft = (options?: { emit?: boolean }) => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  if (options?.emit !== false) {
    window.dispatchEvent(new Event('profile-draft-updated'))
  }
}

export const applyProfileDraft = (
  data: ProfileOverviewData,
  draft: ProfileDraft | null,
): ProfileOverviewData => {
  if (!draft) return data
  if (!draft.username || draft.username !== data.user.username) return data
  if (draft.savedAt && Date.now() - draft.savedAt > DRAFT_TTL_MS) return data

  const displayName = [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim()

  return {
    ...data,
    user: {
      ...data.user,
      avatarUrl: draft.avatarUrl || data.user.avatarUrl,
      username: draft.username || data.user.username,
      displayName: displayName || data.user.displayName,
    },
  }
}
