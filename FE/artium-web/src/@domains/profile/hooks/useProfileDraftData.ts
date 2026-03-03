// react
import { useMemo, useSyncExternalStore } from 'react'

// @domains - profile
import { ProfileOverviewData } from '@domains/profile/types'
import { applyProfileDraft, ProfileDraft } from '@domains/profile/utils/profileDraftStorage'

let cachedDraft: ProfileDraft | null = null
let cachedDraftRaw: string | null = null

const readDraft = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem('artium.profile.draft')
  if (raw === cachedDraftRaw) return cachedDraft
  cachedDraftRaw = raw
  if (!raw) {
    cachedDraft = null
    return cachedDraft
  }
  try {
    cachedDraft = JSON.parse(raw) as ProfileDraft
  } catch {
    cachedDraft = null
  }
  return cachedDraft
}

const getSnapshot = () => readDraft()

const subscribe = (onStoreChange: () => void) => {
  if (typeof window === 'undefined') return () => {}
  const handleChange = () => onStoreChange()
  window.addEventListener('storage', handleChange)
  window.addEventListener('profile-draft-updated', handleChange)
  return () => {
    window.removeEventListener('storage', handleChange)
    window.removeEventListener('profile-draft-updated', handleChange)
  }
}

export const useProfileDraftData = (data: ProfileOverviewData) => {
  const draft = useSyncExternalStore<ProfileDraft | null>(subscribe, getSnapshot, () => null)
console.log(draft)
  return useMemo(() => applyProfileDraft(data, draft), [data, draft])
}
