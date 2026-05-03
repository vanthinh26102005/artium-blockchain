import { useEffect, useMemo, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, CheckCircle2, ShieldCheck, Store } from 'lucide-react'
import { useRouter } from 'next/router'
import { useForm, type SubmitHandler } from 'react-hook-form'

import { Metadata } from '@/components/SEO/Metadata'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import {
  normalizeOptionalUrl,
  normalizeSellerSlug,
  sellerRegistrationSchema,
  type SellerRegistrationFormValues,
} from '@domains/seller/validations/sellerRegistration.schema'
import profileApis, { type SellerProfilePayload } from '@shared/apis/profileApis'
import usersApi from '@shared/apis/usersApi'
import type { ApiError } from '@shared/services/apiClient'

/**
 * profileTypeOptions - Utility function
 * @returns void
 */
const profileTypeOptions = [
  {
    value: 'individual',
    label: 'Individual artist',
    description: 'For creators selling their own artwork.',
  },
  {
    value: 'gallery',
    label: 'Gallery',
    description: 'For galleries representing artists or collections.',
  },
  {
    value: 'institution',
    label: 'Institution',
    description: 'For museums, foundations, and art organizations.',
  },
] as const

const buildProfileEditHref = (slugOrId: string) =>
  `/profile/${encodeURIComponent(slugOrId)}/edit?registered=seller`

/**
 * buildProfileEditHref - Utility function
 * @returns void
 */
export const SellerRegistrationPage = () => {
  const router = useRouter()
  const authUser = useAuthStore((state) => state.user)
  const refreshMe = useAuthStore((state) => state.refreshMe)
  const [existingSellerProfile, setExistingSellerProfile] = useState<SellerProfilePayload | null>(
    null,
    /**
     * SellerRegistrationPage - React component
     * @returns React element
     */
  )
  const [isCheckingExisting, setIsCheckingExisting] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  /**
   * router - Utility function
   * @returns void
   */
  const defaultValues = useMemo<SellerRegistrationFormValues>(
    () => ({
      displayName: authUser?.fullName || authUser?.displayName || '',
      slug: normalizeSellerSlug(authUser?.slug || authUser?.username || ''),
      /**
       * authUser - Utility function
       * @returns void
       */
      profileType: 'individual',
      bio: '',
      location: '',
      websiteUrl: '',
      /**
       * refreshMe - Utility function
       * @returns void
       */
    }),
    [authUser?.displayName, authUser?.fullName, authUser?.slug, authUser?.username],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SellerRegistrationFormValues>({
    /**
     * defaultValues - Utility function
     * @returns void
     */
    resolver: zodResolver(sellerRegistrationSchema),
    defaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    let isActive = true

    const checkExistingSellerProfile = async () => {
      if (!authUser?.id) {
        setIsCheckingExisting(false)
        return
      }

      setIsCheckingExisting(true)
      try {
        const profile = await profileApis.getSellerProfileByUserId(authUser.id)
        if (isActive) {
          setExistingSellerProfile(profile)
        }
      } catch (error) {
        const status = (error as ApiError).status
        if (isActive && status !== 404) {
          setSubmitError(
            error instanceof Error
              ? error.message
              : 'Unable to check your seller registration status.',
          )
        }
        /**
         * checkExistingSellerProfile - Utility function
         * @returns void
         */
      } finally {
        if (isActive) {
          setIsCheckingExisting(false)
        }
      }
    }

    void checkExistingSellerProfile()

    return () => {
      isActive = false
      /**
       * profile - Utility function
       * @returns void
       */
    }
  }, [authUser?.id])

  const handleRegister: SubmitHandler<SellerRegistrationFormValues> = async (values) => {
    if (!authUser?.id) {
      setSubmitError('Please log in before registering as a seller.')
      return
    }
    /**
     * status - Utility function
     * @returns void
     */

    const displayName = values.displayName.trim()
    const slug = normalizeSellerSlug(values.slug)
    const bio = values.bio?.trim() || null
    const location = values.location?.trim() || null

    setSubmitError(null)

    try {
      const needsUserUpdate = displayName !== authUser.fullName || slug !== authUser.slug
      if (needsUserUpdate) {
        await usersApi.updateMe({
          fullName: displayName,
          slug,
          avatarUrl: authUser.avatarUrl ?? null,
        })
      }

      const response = await profileApis.createSellerProfile({
        profileType: values.profileType,
        displayName,
        bio,
        profileImageUrl: authUser.avatarUrl ?? null,
        websiteUrl: normalizeOptionalUrl(values.websiteUrl),
        location,
        /**
         * handleRegister - Utility function
         * @returns void
         */
      })

      setExistingSellerProfile(response.sellerProfile)
      await refreshMe()

      const refreshedUser = useAuthStore.getState().user
      const profileSlug = refreshedUser?.slug || slug || authUser.id
      void router.replace(buildProfileEditHref(profileSlug))
    } catch (error) {
      /**
       * displayName - Utility function
       * @returns void
       */
      const status = (error as ApiError).status
      if (status === 409) {
        try {
          const profile = await profileApis.getSellerProfileByUserId(authUser.id)
          /**
           * slug - Utility function
           * @returns void
           */
          setExistingSellerProfile(profile)
        } catch {
          // Preserve the original conflict message if lookup fails.
        }
        /**
         * bio - Utility function
         * @returns void
         */
      }

      setSubmitError(
        error instanceof Error
          ? /**
             * location - Utility function
             * @returns void
             */
            error.message
          : 'Unable to register seller profile. Please try again.',
      )
    }
  }

  const existingProfileHref = buildProfileEditHref(authUser?.slug || authUser?.id || '')
  const fieldLabelClass = 'text-sm font-semibold text-slate-800'
  /**
   * needsUserUpdate - Utility function
   * @returns void
   */
  const inputClass =
    'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10'
  const errorTextClass = 'mt-2 block text-xs font-medium text-rose-600'

  return (
    <>
      <Metadata title="Register as Seller | Artium" />
      <div className="-mx-6 -my-1 min-h-screen bg-[#F7F8FA] px-4 pb-12 text-slate-900 sm:-mx-8 sm:px-6 lg:-mx-12 lg:px-8">
        <div className="pt-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                /** * response - Utility function * @returns void */ Seller workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Register seller</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Create the seller profile required for auction setup, fulfillment, and seller-only
                marketplace tools.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-slate-500" />
              {existingSellerProfile ? 'Seller active' : 'Onboarding'}
            </span>
          </div>
        </div>
        /** * refreshedUser - Utility function * @returns void */
        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={(event) => void handleSubmit(handleRegister)(event)}
            className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8"
            /**
             * profileSlug - Utility function
             * @returns void
             */
          >
            {submitError ? (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {submitError}
              </div>
            ) : null}
            /** * status - Utility function * @returns void */
            {existingSellerProfile ? (
              <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
                    /** * profile - Utility function * @returns void */
                    <h2 className="text-lg font-semibold text-emerald-950">
                      Your seller profile is already active.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                      Continue to profile editing to finish seller details, banking notes, and
                      auction preparation.
                    </p>
                    <button
                      type="button"
                      onClick={() => void router.push(existingProfileHref)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
                    >
                      Continue profile setup
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /**
               * existingProfileHref - Utility function
               * @returns void
               */
              <div className="space-y-6">
                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="block">
                    /** * fieldLabelClass - Utility function * @returns void */
                    <span className={fieldLabelClass}>Seller display name</span>
                    <input
                      {...register('displayName')}
                      className={inputClass}
                      /**
                       * inputClass - Utility function
                       * @returns void
                       */
                      placeholder="Your artist or gallery name"
                    />
                    {errors.displayName ? (
                      <span className={errorTextClass}>{errors.displayName.message}</span>
                    ) : null}
                    /** * errorTextClass - Utility function * @returns void */
                  </label>

                  <label className="block">
                    <span className={fieldLabelClass}>Profile URL</span>
                    <input
                      {...register('slug', { setValueAs: normalizeSellerSlug })}
                      className={inputClass}
                      placeholder="atelier-nguyen"
                    />
                    {errors.slug ? (
                      <span className={errorTextClass}>{errors.slug.message}</span>
                    ) : null}
                  </label>
                </div>

                <div>
                  <span className={fieldLabelClass}>Seller type</span>
                  <div className="mt-3 grid gap-3 lg:grid-cols-3">
                    {profileTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        className="cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100 has-[:checked]:border-slate-900 has-[:checked]:bg-white has-[:checked]:shadow-sm"
                      >
                        <input
                          {...register('profileType')}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <span className="block text-sm font-semibold text-slate-900">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {option.description}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.profileType ? (
                    <span className={errorTextClass}>{errors.profileType.message}</span>
                  ) : null}
                </div>

                <label className="block">
                  <span className={fieldLabelClass}>Seller bio</span>
                  <textarea
                    {...register('bio')}
                    rows={5}
                    className={inputClass}
                    placeholder="Describe your practice, gallery program, or collection focus."
                  />
                  {errors.bio ? <span className={errorTextClass}>{errors.bio.message}</span> : null}
                </label>

                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="block">
                    <span className={fieldLabelClass}>Location</span>
                    <input
                      {...register('location')}
                      className={inputClass}
                      placeholder="Ho Chi Minh City, Vietnam"
                    />
                    {errors.location ? (
                      <span className={errorTextClass}>{errors.location.message}</span>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className={fieldLabelClass}>Website</span>
                    <input
                      {...register('websiteUrl')}
                      className={inputClass}
                      placeholder="https://yourstudio.com"
                    />
                    {errors.websiteUrl ? (
                      <span className={errorTextClass}>{errors.websiteUrl.message}</span>
                    ) : null}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingExisting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                >
                  {isSubmitting ? 'Registering seller profile...' : 'Register as seller'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>

          <aside className="space-y-4">
            <div className="rounded-[32px] border border-slate-900 bg-slate-900 p-6 text-white shadow-sm">
              <Store className="h-6 w-6 text-white/80" />
              <h2 className="mt-4 text-xl font-semibold">What this unlocks</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Seller registration enables profile seller sections and seller-only auction
                preparation routes.
              </p>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-slate-700" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">Policy defaults</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                New seller profiles start active but unverified. Payment onboarding is not marked
                complete during registration.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </>
  )
}
