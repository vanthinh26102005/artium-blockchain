// react
import { useEffect, useMemo, useRef, useState, ChangeEvent, FormEvent } from 'react'

// next
import { useRouter } from 'next/router'

// third-party
import { zodResolver } from '@hookform/resolvers/zod'
import { useController, useForm, useWatch, SubmitHandler } from 'react-hook-form'

// internal - components
import { Metadata } from '@/components/SEO/Metadata'

// @shared - ui
import { Portal } from '@shared/components/ui/Portal'

// @domains - profile
import { AboutMeSection } from '@domains/profile/components/edit-profile/AboutMeSection'
import { BasicInformationSection } from '@domains/profile/components/edit-profile/BasicInformationSection'
import { EditProfileHeader } from '@domains/profile/components/edit-profile/EditProfileHeader'
import { SaveStatusToast } from '@domains/profile/components/edit-profile/SaveStatusToast'
import { useProfileDraftData } from '@domains/profile/hooks/useProfileDraftData'
import { useProfileOverview } from '@domains/profile/hooks/useProfileOverview'
import { FormValues } from '@domains/profile/types/editProfile'
import {
  editProfileSchema,
  normalizeProfileSlug,
} from '@domains/profile/validations/editProfile.schema'
import { ProfileAbout, ProfileUser } from '@domains/profile/types'
import { clearProfileDraft } from '@domains/profile/utils/profileDraftStorage'
import profileApis, { type SellerProfilePayload } from '@shared/apis/profileApis'
import artworkUploadApi from '@shared/apis/artworkUploadApi'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import usersApi from '@shared/apis/usersApi'

type ProfileEditPageViewProps = {
  username?: string | string[]
}

type SaveStatus = 'idle' | 'saving' | 'success'

/**
 * splitName - Utility function
 * @returns void
 */
const splitName = (displayName: string) => {
  const parts = displayName.trim().split(' ')
  if (parts.length === 0) return { firstName: '', lastName: '' }
  return {
/**
 * parts - Utility function
 * @returns void
 */
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

const buildInitialValues = (
  user: ProfileUser,
  about: ProfileAbout,
  resolvedUsername: string,
  sellerProfile?: SellerProfilePayload | null,
): FormValues => {
/**
 * buildInitialValues - Utility function
 * @returns void
 */
  const { firstName, lastName } = splitName(user.displayName)
  const businessAddress = sellerProfile?.businessAddress ?? null
  return {
    avatarUrl: user.avatarUrl || '',
    username: resolvedUsername || user.username || '',
    firstName,
    lastName,
    phoneNumber: sellerProfile?.businessPhone || '',
    addressLine1: businessAddress?.line1 || '',
    addressLine2: businessAddress?.line2 || '',
/**
 * businessAddress - Utility function
 * @returns void
 */
    district: businessAddress?.city || '',
    province: businessAddress?.state || '',
    country: businessAddress?.country || 'VN',
    postalCode: businessAddress?.postalCode || '',
    headline: user.headline || '',
    biography: about.biography || user.bio || '',
    websiteUrl: about.websiteUrl || '',
    instagram: about.instagram || '',
    twitter: about.twitter || '',
    profileCategories: about.profileCategories || [],
    roles: about.roles || [],
    artisticVibes: about.artisticVibes || [],
    artisticValues: about.artisticValues || [],
    artisticMediums: about.artisticMediums || [],
    connectionAffiliations: about.connectionAffiliations || '',
    connectionSeenAt: about.connectionSeenAt || '',
    connectionCurrently: about.connectionCurrently || '',
    inspireVibes: about.inspireVibes || [],
    inspireValues: about.inspireValues || [],
    inspireMediums: about.inspireMediums || [],
    bankName: '',
    bankAccountHolder: '',
    bankAccountNumber: '',
    bankBranch: '',
    bankSwiftCode: '',
    bankAddress: '',
  }
}

export const ProfileEditPageView = ({ username: _username }: ProfileEditPageViewProps) => {
  const usernameFromRoute = Array.isArray(_username) ? _username[0] : _username
  const {
    data: baseData,
    sellerProfile,
    isLoading,
    error,
    resolvedUsername,
  } = useProfileOverview({
    username: usernameFromRoute,
  })
  const profileData = useProfileDraftData(baseData)
/**
 * ProfileEditPageView - React component
 * @returns React element
 */
  const finalUsername = resolvedUsername || profileData?.user.username || ''
  const pageTitle = profileData ? `Edit Profile | ${profileData.user.displayName}` : 'Edit Profile'
  const initialValues = useMemo(
    () =>
/**
 * usernameFromRoute - Custom React hook
 * @returns void
 */
      profileData
        ? buildInitialValues(profileData.user, profileData.about, finalUsername, sellerProfile)
        : null,
    [profileData, finalUsername, sellerProfile],
  )
  const formKey = useMemo(
    () =>
      initialValues
        ? [
            initialValues.username,
            initialValues.firstName,
            initialValues.lastName,
            initialValues.avatarUrl,
/**
 * profileData - Utility function
 * @returns void
 */
          ].join('|')
        : 'profile-edit-loading',
    [initialValues],
  )
/**
 * finalUsername - Utility function
 * @returns void
 */

  return (
    <>
      <Metadata title={pageTitle} />
/**
 * pageTitle - Utility function
 * @returns void
 */
      {isLoading ? (
        <div className="container py-10 text-sm text-slate-500">Loading profile...</div>
      ) : error || !initialValues ? (
        <div className="container py-10 text-sm text-rose-600">{error ?? 'Profile not found.'}</div>
/**
 * initialValues - Utility function
 * @returns void
 */
      ) : (
        <ProfileEditForm
          key={formKey}
          initialValues={initialValues}
          sellerProfile={sellerProfile}
        />
      )}
    </>
  )
}
/**
 * formKey - Utility function
 * @returns void
 */

type ProfileEditFormProps = {
  initialValues: FormValues
  sellerProfile: SellerProfilePayload | null
}

const ProfileEditForm = ({ initialValues, sellerProfile }: ProfileEditFormProps) => {
  const router = useRouter()
  const authUser = useAuthStore((state) => state.user)
  const refreshMe = useAuthStore((state) => state.refreshMe)

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const pendingRouteRef = useRef<string | null>(null)
  const saveTimerRef = useRef<number | null>(null)
  const toastTimerRef = useRef<number | null>(null)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting, submitCount },
  } = useForm<FormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: initialValues,
    mode: 'onChange',
  })
  const { field: avatarField } = useController({
    control,
    name: 'avatarUrl',
  })
  const avatarValue = useWatch({ control, name: 'avatarUrl' })

  useEffect(() => {
    const saveTimer = saveTimerRef.current
/**
 * ProfileEditForm - React component
 * @returns React element
 */
    const toastTimer = toastTimerRef.current

    return () => {
      if (saveTimer) {
/**
 * router - Utility function
 * @returns void
 */
        window.clearTimeout(saveTimer)
      }
      if (toastTimer) {
        window.clearTimeout(toastTimer)
/**
 * authUser - Utility function
 * @returns void
 */
      }
    }
  }, [saveStatus])

/**
 * refreshMe - Utility function
 * @returns void
 */
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
/**
 * avatarInputRef - Utility function
 * @returns void
 */
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty])

/**
 * pendingRouteRef - Utility function
 * @returns void
 */
  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (!isDirty) return true
      pendingRouteRef.current = as
/**
 * saveTimerRef - Utility function
 * @returns void
 */
      setShowExitConfirm(true)
      return false
    })

/**
 * toastTimerRef - Utility function
 * @returns void
 */
    return () => {
      router.beforePopState(() => true)
    }
  }, [isDirty, router])

  // Intercept all navigation attempts via links
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      // Allow navigation if no unsaved changes
      if (!isDirty) return

      // Check if navigating to same page
      if (router.asPath === url) return

      // Prevent navigation and show confirmation modal
      pendingRouteRef.current = url
      setShowExitConfirm(true)
      router.events.emit('routeChangeError')
      throw 'Route change aborted by user confirmation'
/**
 * avatarValue - Utility function
 * @returns void
 */
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
/**
 * saveTimer - Utility function
 * @returns void
 */
    }
  }, [isDirty, router])

  // Lock body scroll when modal is open
/**
 * toastTimer - Utility function
 * @returns void
 */
  useEffect(() => {
    if (showExitConfirm) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
/**
 * handleBeforeUnload - Utility function
 * @returns void
 */
  }, [showExitConfirm])

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed
    }
    return `https://${trimmed}`
  }

  const buildLocation = (district: string, province: string, country: string) => {
    const parts = [district.trim(), province.trim(), country.trim()].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : undefined
  }

  const buildCanonicalSavedValues = (data: FormValues, slug: string): FormValues => ({
    ...data,
    avatarUrl: data.avatarUrl.trim(),
    username: slug,
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phoneNumber: sellerProfile ? data.phoneNumber.trim() : initialValues.phoneNumber,
    addressLine1: sellerProfile ? data.addressLine1.trim() : initialValues.addressLine1,
    addressLine2: sellerProfile ? data.addressLine2.trim() : initialValues.addressLine2,
    district: sellerProfile ? data.district.trim() : initialValues.district,
    province: sellerProfile ? data.province.trim() : initialValues.province,
    country: sellerProfile ? data.country.trim() : initialValues.country,
    postalCode: sellerProfile ? data.postalCode.trim() : initialValues.postalCode,
    headline: sellerProfile ? data.headline.trim() : initialValues.headline,
    biography: sellerProfile ? data.biography.trim() : initialValues.biography,
/**
 * handleRouteChangeStart - Utility function
 * @returns void
 */
    websiteUrl:
      sellerProfile && data.websiteUrl ? normalizeUrl(data.websiteUrl) : initialValues.websiteUrl,
    instagram:
      sellerProfile && data.instagram ? normalizeUrl(data.instagram) : initialValues.instagram,
    twitter: sellerProfile && data.twitter ? normalizeUrl(data.twitter) : initialValues.twitter,
    profileCategories: sellerProfile ? data.profileCategories : initialValues.profileCategories,
    roles: sellerProfile ? data.roles : initialValues.roles,
    connectionAffiliations: sellerProfile
      ? data.connectionAffiliations.trim()
      : initialValues.connectionAffiliations,
    connectionSeenAt: sellerProfile ? data.connectionSeenAt.trim() : initialValues.connectionSeenAt,
    connectionCurrently: sellerProfile
      ? data.connectionCurrently.trim()
      : initialValues.connectionCurrently,
  })

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!authUser?.id) {
      setSubmitError('Please log in to update your profile.')
      return
    }

    setSaveStatus('saving')
    setSubmitError(null)

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current)
/**
 * scrollY - Utility function
 * @returns void
 */
    }
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
    }

    try {
      const displayName = [data.firstName.trim(), data.lastName.trim()].filter(Boolean).join(' ')
      const slug = normalizeProfileSlug(data.username)
      const avatarUrl = data.avatarUrl.trim() || null

      // Step 1: Update basic user profile (all users)
      await usersApi.updateMe({
        fullName: displayName || null,
        slug: slug || null,
        avatarUrl,
      })

      // Step 2: Update seller profile if user is a seller
      if (sellerProfile) {
/**
 * normalizeUrl - Utility function
 * @returns void
 */
        const sellerProfileId = sellerProfile.profileId ?? sellerProfile.id
        if (sellerProfileId) {
          const businessAddress = {
            line1: data.addressLine1?.trim() || null,
/**
 * trimmed - Utility function
 * @returns void
 */
            line2: data.addressLine2?.trim() || null,
            city: data.district?.trim() || null,
            state: data.province?.trim() || null,
            postalCode: data.postalCode?.trim() || null,
            country: data.country?.trim() || null,
          }

          const sellerPayload = {
            displayName: displayName || sellerProfile.displayName,
            bio: data.biography?.trim() || null,
            profileImageUrl: avatarUrl,
/**
 * buildLocation - Utility function
 * @returns void
 */
            websiteUrl: data.websiteUrl ? normalizeUrl(data.websiteUrl) : null,
            instagramUrl: data.instagram ? normalizeUrl(data.instagram) : null,
            twitterUrl: data.twitter ? normalizeUrl(data.twitter) : null,
            location: buildLocation(data.district, data.province, data.country) ?? null,
/**
 * parts - Utility function
 * @returns void
 */
            businessPhone: data.phoneNumber?.trim() || null,
            businessAddress,
            metaDescription: data.headline?.trim() || null,
          }

          await profileApis.updateSellerProfile(sellerProfileId, sellerPayload)
        }
/**
 * buildCanonicalSavedValues - Utility function
 * @returns void
 */
      }

      await refreshMe()

      reset(buildCanonicalSavedValues(data, slug), { keepSubmitCount: true })
      clearProfileDraft()
      setSaveStatus('success')

      // If slug changed, redirect to new edit URL
      const previousSlug = authUser?.slug ?? authUser?.username
      if (slug && slug !== previousSlug) {
        window.setTimeout(() => {
          void router.replace(`/profile/${encodeURIComponent(slug)}/edit`, undefined, {
            shallow: true,
          })
        }, 1000)
      }

      toastTimerRef.current = window.setTimeout(() => {
        setSaveStatus('idle')
      }, 2400)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile.'
      setSubmitError(message)
      setSaveStatus('idle')
    }
  }

  const handleFormSubmitEvent = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(handleFormSubmit)(event)
  }

  const handleFormChange = () => {
    if (saveStatus === 'success') {
/**
 * handleFormSubmit - Utility function
 * @returns void
 */
      setSaveStatus('idle')
    }
    if (submitError) {
      setSubmitError(null)
    }
  }

  const handleAvatarPick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const targetUserId = authUser?.id || sellerProfile?.userId
    if (!targetUserId) {
      setSubmitError('Please log in to upload an avatar.')
      return
    }

/**
 * displayName - Utility function
 * @returns void
 */
    const localPreview = URL.createObjectURL(file)
    setAvatarPreview(localPreview)
    setAvatarUploading(true)

/**
 * slug - Utility function
 * @returns void
 */
    void (async () => {
      try {
        const response = await artworkUploadApi.uploadAvatar({
          file,
/**
 * avatarUrl - Utility function
 * @returns void
 */
          userId: targetUserId,
        })
        const uploadedUrl = response.secureUrl || response.url
        setAvatarPreview(uploadedUrl)
        avatarField.onChange(uploadedUrl)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload avatar.'
        setSubmitError(message)
        setAvatarPreview(null)
      } finally {
        setAvatarUploading(false)
      }
    })()
  }
/**
 * sellerProfileId - Utility function
 * @returns void
 */

  const handleAvatarRemove = () => {
    setAvatarPreview(null)
    avatarField.onChange('')
  }
/**
 * businessAddress - Utility function
 * @returns void
 */

  const avatarSrc = avatarPreview || avatarValue || ''
  const showErrors = submitCount > 0
  const isSaving = saveStatus === 'saving' || isSubmitting

  const handleConfirmExit = () => {
    setShowExitConfirm(false)
    const nextRoute = pendingRouteRef.current
    pendingRouteRef.current = null
    if (nextRoute) {
      router.push(nextRoute)
      return
/**
 * sellerPayload - Utility function
 * @returns void
 */
    }
    router.back()
  }

  const handleCancelExit = () => {
    pendingRouteRef.current = null
    setShowExitConfirm(false)
  }

  return (
    <>
      <div className="min-h-screen bg-slate-50/60 font-['Inter']">
        <form
          onSubmit={handleFormSubmitEvent}
          onChange={handleFormChange}
          className="container py-8 lg:py-10"
        >
          <EditProfileHeader isDirty={isDirty} isSaving={isSaving} />
          {submitError ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {submitError}
            </div>
          ) : null}
          {avatarUploading ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Uploading avatar...
            </div>
/**
 * previousSlug - Utility function
 * @returns void
 */
          ) : null}

          <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:gap-6">
            <div className="space-y-6">
              <BasicInformationSection
                register={register}
                control={control}
                errors={errors}
                showErrors={showErrors}
                avatarSrc={avatarSrc}
                avatarInputRef={avatarInputRef}
                onAvatarPick={handleAvatarPick}
                onAvatarRemove={handleAvatarRemove}
                onAvatarChange={handleAvatarChange}
                showSellerContactFields={Boolean(sellerProfile)}
              />
/**
 * message - Utility function
 * @returns void
 */
            </div>
            <div className="space-y-6">
              {sellerProfile ? (
                <AboutMeSection
                  register={register}
                  control={control}
                  errors={errors}
                  showErrors={showErrors}
                  showClassificationFields={false}
/**
 * handleFormSubmitEvent - Utility function
 * @returns void
 */
                />
              ) : null}
              {!sellerProfile ? (
                <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-6">
                  <h2 className="text-sm font-semibold tracking-[0.2em] text-slate-400 uppercase">
                    Become a Seller
                  </h2>
/**
 * handleFormChange - Utility function
 * @returns void
 */
                  <p className="mt-3 text-sm text-slate-600">
                    Register as a seller to unlock advanced profile fields and seller-only auction
                    preparation. Verification and payment onboarding remain separate policy steps.
                  </p>
                  <button
                    type="button"
                    onClick={() => void router.push('/seller/register')}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Register as Seller
                  </button>
                </section>
/**
 * handleAvatarPick - Utility function
 * @returns void
 */
              ) : null}
            </div>
          </div>
        </form>
      </div>

      {saveStatus !== 'idle' ? (
/**
 * handleAvatarChange - Utility function
 * @returns void
 */
        <Portal>
          <SaveStatusToast
            status={saveStatus === 'saving' ? 'saving' : 'success'}
            onClose={() => setSaveStatus('idle')}
/**
 * file - Utility function
 * @returns void
 */
          />
        </Portal>
      ) : null}

      {showExitConfirm ? (
/**
 * targetUserId - Utility function
 * @returns void
 */
        <Portal>
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900">Leave without saving?</h3>
              <p className="mt-2 text-sm text-slate-600">
                You have unsaved changes. Are you sure you want to leave this page?
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
/**
 * localPreview - Utility function
 * @returns void
 */
                  type="button"
                  onClick={handleCancelExit}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExit}
/**
 * response - Utility function
 * @returns void
 */
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
/**
 * uploadedUrl - Utility function
 * @returns void
 */
        </Portal>
      ) : null}
    </>
  )
}

/**
 * message - Utility function
 * @returns void
 */
/**
 * handleAvatarRemove - Utility function
 * @returns void
 */
/**
 * avatarSrc - Utility function
 * @returns void
 */
/**
 * showErrors - Utility function
 * @returns void
 */
/**
 * isSaving - Utility function
 * @returns void
 */
/**
 * handleConfirmExit - Utility function
 * @returns void
 */
/**
 * nextRoute - Utility function
 * @returns void
 */
/**
 * handleCancelExit - Utility function
 * @returns void
 */