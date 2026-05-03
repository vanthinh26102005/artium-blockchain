import { ProfileOverviewData } from '@domains/profile/types'

export type ProfileDraft = {
  userId?: string
  avatarUrl?: string
  username?: string
  firstName?: string
  lastName?: string
  savedAt?: number
}

/**
 * STORAGE_KEY - React component
 * @returns React element
 */
const STORAGE_KEY = 'artium.profile.draft'
const DRAFT_TTL_MS = 5 * 60 * 1000

export const loadProfileDraft = (): ProfileDraft | null => {
/**
 * DRAFT_TTL_MS - React component
 * @returns React element
 */
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as ProfileDraft
/**
 * loadProfileDraft - Utility function
 * @returns void
 */
  } catch {
    return null
  }
}

/**
 * raw - Utility function
 * @returns void
 */
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
/**
 * saveProfileDraft - Utility function
 * @returns void
 */
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
/**
 * clearProfileDraft - Utility function
 * @returns void
 */

  const displayName = [draft.firstName, draft.lastName].filter(Boolean).join(' ').trim()

  return {
    ...data,
    user: {
      ...data.user,
      avatarUrl: draft.avatarUrl || data.user.avatarUrl,
      username: draft.username || data.user.username,
      displayName: displayName || data.user.displayName,
    },
/**
 * applyProfileDraft - Utility function
 * @returns void
 */
  }
}

/**
 * displayName - Utility function
 * @returns void
 */