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

export const SellerRegistrationPage = () => {
  const router = useRouter()
  const authUser = useAuthStore((state) => state.user)
  const refreshMe = useAuthStore((state) => state.refreshMe)
  const [existingSellerProfile, setExistingSellerProfile] = useState<SellerProfilePayload | null>(
    null,
  )
  const [isCheckingExisting, setIsCheckingExisting] = useState(true)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const defaultValues = useMemo<SellerRegistrationFormValues>(
    () => ({
      displayName: authUser?.fullName || authUser?.displayName || '',
      slug: normalizeSellerSlug(authUser?.slug || authUser?.username || ''),
      profileType: 'individual',
      bio: '',
      location: '',
      websiteUrl: '',
    }),
    [authUser?.displayName, authUser?.fullName, authUser?.slug, authUser?.username],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SellerRegistrationFormValues>({
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
      } finally {
        if (isActive) {
          setIsCheckingExisting(false)
        }
      }
    }

    void checkExistingSellerProfile()

    return () => {
      isActive = false
    }
  }, [authUser?.id])

  const handleRegister: SubmitHandler<SellerRegistrationFormValues> = async (values) => {
    if (!authUser?.id) {
      setSubmitError('Please log in before registering as a seller.')
      return
    }

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
      })

      setExistingSellerProfile(response.sellerProfile)
      await refreshMe()

      const refreshedUser = useAuthStore.getState().user
      const profileSlug = refreshedUser?.slug || slug || authUser.id
      void router.replace(buildProfileEditHref(profileSlug))
    } catch (error) {
      const status = (error as ApiError).status
      if (status === 409) {
        try {
          const profile = await profileApis.getSellerProfileByUserId(authUser.id)
          setExistingSellerProfile(profile)
        } catch {
          // Preserve the original conflict message if lookup fails.
        }
      }

      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Unable to register seller profile. Please try again.',
      )
    }
  }

  const existingProfileHref = buildProfileEditHref(authUser?.slug || authUser?.id || '')

  return (
    <>
      <Metadata title="Register as Seller | Artium" />
      <main className="min-h-screen bg-[#f6f1e8] font-['Inter'] text-[#251d16]">
        <section className="relative overflow-hidden border-b border-[#d8c9b5] bg-[radial-gradient(circle_at_top_left,#f8d58a_0,#f6f1e8_32%,#efe3d1_100%)]">
          <div className="absolute top-[-14rem] right-[-12rem] h-96 w-96 rounded-full bg-[#9f4d2f]/20 blur-3xl" />
          <div className="relative container py-12 lg:py-16">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold tracking-[0.3em] text-[#9f4d2f] uppercase">
                Seller onboarding
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#21170f] lg:text-6xl">
                Register your seller profile before starting an auction.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#6f5a45]">
                This creates your seller profile and grants your account seller access. Verification
                and payment onboarding remain separate policy gates for future marketplace controls.
              </p>
            </div>
          </div>
        </section>

        <section className="container grid gap-6 py-8 lg:grid-cols-[1fr_360px] lg:py-10">
          <form
            onSubmit={(event) => void handleSubmit(handleRegister)(event)}
            className="rounded-[2rem] border border-[#d9c8b1] bg-white/90 p-6 shadow-[0_18px_60px_rgba(80,52,30,0.12)] lg:p-8"
          >
            {submitError ? (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            ) : null}

            {existingSellerProfile ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
                  <div>
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
              <div className="space-y-6">
                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#3c2d20]">
                      Seller display name
                    </span>
                    <input
                      {...register('displayName')}
                      className="mt-2 w-full rounded-2xl border border-[#d9c8b1] bg-white px-4 py-3 text-sm transition outline-none focus:border-[#9f4d2f] focus:ring-4 focus:ring-[#9f4d2f]/10"
                      placeholder="Your artist or gallery name"
                    />
                    {errors.displayName ? (
                      <span className="mt-2 block text-xs text-rose-600">
                        {errors.displayName.message}
                      </span>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-[#3c2d20]">Profile URL</span>
                    <input
                      {...register('slug', { setValueAs: normalizeSellerSlug })}
                      className="mt-2 w-full rounded-2xl border border-[#d9c8b1] bg-white px-4 py-3 text-sm transition outline-none focus:border-[#9f4d2f] focus:ring-4 focus:ring-[#9f4d2f]/10"
                      placeholder="atelier-nguyen"
                    />
                    {errors.slug ? (
                      <span className="mt-2 block text-xs text-rose-600">
                        {errors.slug.message}
                      </span>
                    ) : null}
                  </label>
                </div>

                <div>
                  <span className="text-sm font-semibold text-[#3c2d20]">Seller type</span>
                  <div className="mt-3 grid gap-3 lg:grid-cols-3">
                    {profileTypeOptions.map((option) => (
                      <label
                        key={option.value}
                        className="cursor-pointer rounded-2xl border border-[#d9c8b1] bg-[#fbf7ef] p-4 transition has-[:checked]:border-[#9f4d2f] has-[:checked]:bg-[#fff3dd]"
                      >
                        <input
                          {...register('profileType')}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <span className="block text-sm font-semibold text-[#2d2017]">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#7a6651]">
                          {option.description}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.profileType ? (
                    <span className="mt-2 block text-xs text-rose-600">
                      {errors.profileType.message}
                    </span>
                  ) : null}
                </div>

                <label className="block">
                  <span className="text-sm font-semibold text-[#3c2d20]">Seller bio</span>
                  <textarea
                    {...register('bio')}
                    rows={5}
                    className="mt-2 w-full rounded-2xl border border-[#d9c8b1] bg-white px-4 py-3 text-sm transition outline-none focus:border-[#9f4d2f] focus:ring-4 focus:ring-[#9f4d2f]/10"
                    placeholder="Describe your practice, gallery program, or collection focus."
                  />
                  {errors.bio ? (
                    <span className="mt-2 block text-xs text-rose-600">{errors.bio.message}</span>
                  ) : null}
                </label>

                <div className="grid gap-5 lg:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#3c2d20]">Location</span>
                    <input
                      {...register('location')}
                      className="mt-2 w-full rounded-2xl border border-[#d9c8b1] bg-white px-4 py-3 text-sm transition outline-none focus:border-[#9f4d2f] focus:ring-4 focus:ring-[#9f4d2f]/10"
                      placeholder="Ho Chi Minh City, Vietnam"
                    />
                    {errors.location ? (
                      <span className="mt-2 block text-xs text-rose-600">
                        {errors.location.message}
                      </span>
                    ) : null}
                  </label>

                  <label className="block">
                    <span className="text-sm font-semibold text-[#3c2d20]">Website</span>
                    <input
                      {...register('websiteUrl')}
                      className="mt-2 w-full rounded-2xl border border-[#d9c8b1] bg-white px-4 py-3 text-sm transition outline-none focus:border-[#9f4d2f] focus:ring-4 focus:ring-[#9f4d2f]/10"
                      placeholder="https://yourstudio.com"
                    />
                    {errors.websiteUrl ? (
                      <span className="mt-2 block text-xs text-rose-600">
                        {errors.websiteUrl.message}
                      </span>
                    ) : null}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingExisting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#21170f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#3a281b] disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                >
                  {isSubmitting ? 'Registering seller profile...' : 'Register as seller'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </form>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-[#d9c8b1] bg-[#21170f] p-6 text-white shadow-[0_18px_60px_rgba(33,23,15,0.22)]">
              <Store className="h-6 w-6 text-[#f6d990]" />
              <h2 className="mt-4 text-xl font-semibold">What this unlocks</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Seller registration enables profile seller sections and seller-only auction
                preparation routes.
              </p>
            </div>
            <div className="rounded-[2rem] border border-[#d9c8b1] bg-white/80 p-6">
              <ShieldCheck className="h-6 w-6 text-[#9f4d2f]" />
              <h2 className="mt-4 text-lg font-semibold text-[#251d16]">Policy defaults</h2>
              <p className="mt-3 text-sm leading-6 text-[#6f5a45]">
                New seller profiles start active but unverified. Payment onboarding is not marked
                complete during registration.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </>
  )
}
