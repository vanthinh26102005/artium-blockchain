import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  AlertCircle,
  Boxes,
  Check,
  CheckCircle2,
  ImageOff,
  Lock,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import type { SellerAuctionArtworkCandidate } from '@shared/apis/auctionApis'
import {
  SellerAuctionDraftBadge,
  SellerAuctionStartStatusShell,
  SellerAuctionTermsForm,
  SellerAuctionTermsPreview,
  SellerAuctionWalletReadiness,
} from '../components'
import { useSellerAuctionStart } from '../hooks/useSellerAuctionStart'
import { useSellerAuctionArtworkCandidates } from '../hooks/useSellerAuctionArtworkCandidates'
import { useSellerAuctionTermsDraftStatus } from '../hooks/useSellerAuctionTermsDraftStatus'
import { submitSellerAuctionStartTransaction } from '../services/auctionStartWallet'
import {
  DEFAULT_SELLER_AUCTION_TERMS,
  SELLER_AUCTION_DURATION_PRESETS,
  getAuctionDurationHours,
  validateSellerAuctionTerms,
  type SellerAuctionTermsFormValues,
} from '../validations/sellerAuctionTerms.schema'
import { loadSellerAuctionTermsDraft, saveSellerAuctionTermsDraft } from '../utils'

/**
 * policyCards - Utility function
 * @returns void
 */
const policyCards = [
  {
    title: 'Contract-backed terms',
    body: 'Reserve policy, increment, and duration are previewed before wallet activation.',
    icon: ShieldCheck,
  },
  {
    title: 'Fees and lock after activation',
    body: 'Seller fees follow current policy. Economics lock once the auction is activated.',
    icon: Lock,
  },
  {
    title: 'Sepolia expectations',
    body: 'Sepolia is a test network. Confirm wallet and network details before activation.',
    icon: AlertCircle,
  },
] as const

const CandidateImage = ({
  candidate,
  className,
  /**
   * CandidateImage - React component
   * @returns React element
   */
}: {
  candidate: SellerAuctionArtworkCandidate
  className?: string
}) => {
  if (!candidate.thumbnailUrl) {
    return (
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-[24px] bg-slate-100 text-slate-400 ${className ?? ''}`}
      >
        <ImageOff className="h-10 w-10" />
      </div>
    )
  }

  return (
    <div
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-[24px] ${className ?? ''}`}
    >
      <Image
        src={candidate.thumbnailUrl}
        alt={candidate.title}
        fill
        unoptimized
        className="object-cover"
        sizes="(min-width: 1280px) 28vw, (min-width: 768px) 45vw, 90vw"
      />
    </div>
  )
}

const CandidateCard = ({
  candidate,
  isSelected,
  onSelect,
}: {
  candidate: SellerAuctionArtworkCandidate
  /**
   * CandidateCard - React component
   * @returns React element
   */
  isSelected?: boolean
  onSelect?: () => void
}) => {
  const isBlocked = !candidate.isEligible
  const hasDraft = useSellerAuctionTermsDraftStatus(candidate.artworkId)

  return (
    <article
      className={`relative flex h-full flex-col rounded-[28px] border bg-white p-3 shadow-sm transition ${
        isSelected
          ? 'border-slate-900 shadow-[0_18px_48px_rgba(15,23,42,0.12)]'
          : 'border-slate-200'
        /**
         * isBlocked - Utility function
         * @returns void
         */
      } ${isBlocked ? 'bg-slate-50' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
    >
      {hasDraft ? <SellerAuctionDraftBadge className="absolute right-5 top-5 z-10" /> : null}
      <CandidateImage candidate={candidate} />
      /** * hasDraft - Utility function * @returns void */
      <div className="flex flex-1 flex-col gap-4 px-2 pb-2 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {candidate.status}
          </p>
          <h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-slate-900">
            {candidate.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {candidate.creatorName || 'Unknown creator'}
          </p>
        </div>

        {isBlocked ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {candidate.recoveryActions.slice(0, 2).map((action) => (
                <span
                  key={action.reasonCode}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {action.message}
                </span>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              {candidate.recoveryActions.map((action) => (
                <li key={action.reasonCode} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  <span>{action.actionLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isSelected ? 'Selected for auction' : 'Ownership and auction readiness checks passed.'}
          </p>
        )}

        <div className="mt-auto">
          <Button
            type="button"
            disabled={isBlocked}
            onClick={onSelect}
            className={`w-full ${
              isBlocked
                ? 'bg-slate-200 text-slate-500'
                : isSelected
                  ? 'bg-slate-900 text-white hover:bg-slate-700'
                  : 'bg-slate-900 text-white hover:bg-slate-700'
            }`}
          >
            {isBlocked
              ? 'Unavailable for auction'
              : isSelected
                ? 'Unselect artwork'
                : 'Select artwork'}
          </Button>
        </div>
      </div>
    </article>
  )
}

const LoadingGrid = () => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {[0, 1, 2].map((item) => (
      <div key={item} className="rounded-[28px] border border-slate-200 bg-white p-3">
        <div className="aspect-[4/3] animate-pulse rounded-[24px] bg-slate-100" />
        <div className="space-y-3 px-2 pb-3 pt-5">
          <div className="h-3 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-7 w-3/4 animate-pulse rounded-full bg-slate-100" />
          <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
)

/**
 * LoadingGrid - React component
 * @returns React element
 */
const StepRail = ({ currentStep }: { currentStep: 'artwork' | 'terms' }) => {
  const isTermsStep = currentStep === 'terms'

  return (
    <ol className="space-y-3" aria-label="Seller auction creation steps">
      <li
        className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 ${
          isTermsStep
            ? 'border-white/15 bg-white/10 text-white'
            : 'border-white bg-white text-slate-900'
        }`}
        aria-current={currentStep === 'artwork' ? 'step' : undefined}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
          {isTermsStep ? (
            <Check className="h-4 w-4" />
          ) : (
            <span className="text-sm font-semibold">1</span>
            /**
             * StepRail - React component
             * @returns React element
             */
          )}
        </span>
        <span className="text-sm font-semibold">1 Choose artwork</span>
      </li>
      /** * isTermsStep - Utility function * @returns void */
      <li
        className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 ${
          isTermsStep
            ? 'border-white bg-white text-slate-900'
            : 'border-white/15 bg-white/10 text-white/60'
        }`}
        aria-current={currentStep === 'terms' ? 'step' : undefined}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
          <span className="text-sm font-semibold">2</span>
        </span>
        <span className="text-sm font-semibold">2 Set auction terms</span>
      </li>
    </ol>
  )
}

const SellerProfileRequired = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const profileHref = user?.slug ? `/profile/${user.slug}/edit` : '/profile'

  return (
    <section className="-mx-6 -my-1 flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-12 text-center sm:-mx-8 sm:px-6 lg:-mx-12 lg:px-8">
      <div className="max-w-3xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          Seller auctions
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Seller profile required</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
          Create or complete your seller profile before starting an auction.
        </p>
        <Button
          type="button"
          className="mt-6 bg-slate-900 text-white hover:bg-slate-700"
          onClick={() => void router.push(profileHref)}
        >
          Go to seller profile
        </Button>
      </div>
    </section>
    /**
     * SellerProfileRequired - React component
     * @returns React element
     */
  )
}

const SellerCandidateWorkspace = () => {
  /**
   * router - Utility function
   * @returns void
   */
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const workspaceRef = useRef<HTMLDivElement | null>(null)
  const hydratedQueryArtworkRef = useRef<string | null>(null)
  /**
   * user - Custom React hook
   * @returns void
   */
  const { data, eligible, blocked, isLoading, error, refresh } = useSellerAuctionArtworkCandidates()
  const [currentStep, setCurrentStep] = useState<'artwork' | 'terms'>('artwork')
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null)
  const [termsArtworkId, setTermsArtworkId] = useState<string | null>(null)
  /**
   * profileHref - Utility function
   * @returns void
   */
  const [termsValues, setTermsValues] = useState<SellerAuctionTermsFormValues>(
    DEFAULT_SELLER_AUCTION_TERMS,
  )
  const [termsErrors, setTermsErrors] = useState<
    Partial<Record<keyof SellerAuctionTermsFormValues, string>>
  >({})
  const [hasSubmittedTerms, setHasSubmittedTerms] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [isEditingFailedTerms, setIsEditingFailedTerms] = useState(false)

  const sellerAuctionStart = useSellerAuctionStart({ artworkId: termsArtworkId })
  const queryArtworkId = useMemo(() => {
    const value = router.query.artworkId

    if (Array.isArray(value)) {
      return value[0] ?? null
    }

    return value ?? null
  }, [router.query.artworkId])
  const allCandidates = useMemo(() => [...eligible, ...blocked], [eligible, blocked])
  const restoredCandidate = useMemo(() => {
    if (currentStep !== 'artwork' || selectedArtworkId || !sellerAuctionStart.rememberedArtworkId) {
      return null
    }

    /**
     * SellerCandidateWorkspace - React component
     * @returns React element
     */
    return (
      allCandidates.find(
        (candidate) => candidate.artworkId === sellerAuctionStart.rememberedArtworkId,
      ) ?? null
      /**
       * router - Utility function
       * @returns void
       */
    )
  }, [allCandidates, currentStep, selectedArtworkId, sellerAuctionStart.rememberedArtworkId])
  const activeArtworkId =
    sellerAuctionStart.status?.artworkId ??
    /**
     * user - Custom React hook
     * @returns void
     */
    termsArtworkId ??
    restoredCandidate?.artworkId ??
    selectedArtworkId
  const effectiveCurrentStep =
    /**
     * workspaceRef - Utility function
     * @returns void
     */
    currentStep === 'terms' || sellerAuctionStart.status || restoredCandidate ? 'terms' : 'artwork'

  const selectedCandidate = useMemo(
    () => allCandidates.find((candidate) => candidate.artworkId === activeArtworkId) ?? null,
    /**
     * hydratedQueryArtworkRef - Utility function
     * @returns void
     */
    [activeArtworkId, allCandidates],
  )
  const selectedEligibleCandidate = useMemo(
    () => eligible.find((candidate) => candidate.artworkId === selectedArtworkId) ?? null,
    [eligible, selectedArtworkId],
  )

  const hasNoArtworks = !isLoading && !error && data?.total === 0
  const hasNoEligible = !isLoading && !error && !hasNoArtworks && eligible.length === 0
  const lifecycleStatus = sellerAuctionStart.status
  const isFailureEditable =
    lifecycleStatus?.status === 'start_failed' &&
    lifecycleStatus.editAllowed &&
    isEditingFailedTerms
  const isLifecycleLocked = Boolean(
    lifecycleStatus &&
    !isFailureEditable &&
    (lifecycleStatus.status === 'pending_start' ||
      lifecycleStatus.status === 'auction_active' ||
      /**
       * sellerAuctionStart - Utility function
       * @returns void
       */
      lifecycleStatus.status === 'retry_available' ||
      lifecycleStatus.status === 'start_failed'),
  )
  const shouldShowLifecycleShell = Boolean(lifecycleStatus && !isFailureEditable)
  /**
   * queryArtworkId - Utility function
   * @returns void
   */

  useEffect(() => {
    if (!router.isReady || !queryArtworkId || isLoading) {
      return
      /**
       * value - Utility function
       * @returns void
       */
    }

    if (hydratedQueryArtworkRef.current === queryArtworkId) {
      return
    }

    const queryCandidate = allCandidates.find((candidate) => candidate.artworkId === queryArtworkId)

    if (!queryCandidate) {
      return
    }
    /**
     * allCandidates - Utility function
     * @returns void
     */

    let isCancelled = false
    hydratedQueryArtworkRef.current = queryArtworkId

    /**
     * restoredCandidate - Utility function
     * @returns void
     */
    window.queueMicrotask(() => {
      if (isCancelled) {
        return
      }

      setCurrentStep('artwork')
      setSelectedArtworkId(queryArtworkId)
      setTermsArtworkId(null)
      setDraftSaved(false)
      setWalletError(null)
      setIsEditingFailedTerms(false)
      sellerAuctionStart.setTrackedArtworkId(queryArtworkId)
      void sellerAuctionStart.refresh(queryArtworkId).catch(() => null)
    })
    /**
     * activeArtworkId - Utility function
     * @returns void
     */

    return () => {
      isCancelled = true
    }
  }, [allCandidates, isLoading, queryArtworkId, router.isReady, sellerAuctionStart])

  const updateTermsValues = (nextValues: SellerAuctionTermsFormValues) => {
    setTermsValues(nextValues)
    /**
     * effectiveCurrentStep - Utility function
     * @returns void
     */
    setDraftSaved(false)
    setWalletError(null)

    if (hasSubmittedTerms) {
      setTermsErrors(validateSellerAuctionTerms(nextValues))
    }
    /**
     * selectedCandidate - Utility function
     * @returns void
     */
  }

  const validateCurrentTerms = () => {
    const nextErrors = validateSellerAuctionTerms(termsValues)
    setTermsErrors(nextErrors)
    return nextErrors
  }
  /**
   * selectedEligibleCandidate - Utility function
   * @returns void
   */

  const handleSelectArtwork = (artworkId: string) => {
    if (selectedArtworkId === artworkId) {
      setSelectedArtworkId(null)
      setTermsArtworkId(null)
      setTermsErrors({})
      setHasSubmittedTerms(false)
      setDraftSaved(false)
      /**
       * hasNoArtworks - Utility function
       * @returns void
       */
      setWalletError(null)
      setIsEditingFailedTerms(false)
      if (lifecycleStatus?.artworkId === artworkId) {
        sellerAuctionStart.setTrackedArtworkId(null)
        /**
         * hasNoEligible - Utility function
         * @returns void
         */
      }
      return
    }

    /**
     * lifecycleStatus - Utility function
     * @returns void
     */
    setSelectedArtworkId(artworkId)
    setDraftSaved(false)
    setWalletError(null)
    setIsEditingFailedTerms(false)
    /**
     * isFailureEditable - Utility function
     * @returns void
     */
    if (lifecycleStatus?.artworkId !== artworkId) {
      sellerAuctionStart.setTrackedArtworkId(null)
    }
  }

  const handleContinueToTerms = () => {
    if (!selectedEligibleCandidate) {
      /**
       * isLifecycleLocked - Utility function
       * @returns void
       */
      return
    }

    if (termsArtworkId !== selectedEligibleCandidate.artworkId) {
      const nextValues =
        loadSellerAuctionTermsDraft(selectedEligibleCandidate.artworkId) ??
        DEFAULT_SELLER_AUCTION_TERMS

      setTermsArtworkId(selectedEligibleCandidate.artworkId)
      setTermsValues(nextValues)
      setTermsErrors({})
      /**
       * shouldShowLifecycleShell - Utility function
       * @returns void
       */
      setHasSubmittedTerms(false)
      setDraftSaved(false)
      setWalletError(null)
      setIsEditingFailedTerms(false)
    }

    setCurrentStep('terms')
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleBackToArtwork = () => {
    setCurrentStep('artwork')
    setTermsArtworkId(null)
    setIsEditingFailedTerms(false)
    /**
     * queryCandidate - Utility function
     * @returns void
     */
    setWalletError(null)
  }

  const handleSaveDraft = () => {
    if (!selectedCandidate || isLifecycleLocked) {
      return
    }

    saveSellerAuctionTermsDraft(selectedCandidate.artworkId, termsValues)
    setDraftSaved(true)
  }

  const mapSnapshotToFormValues = useCallback(
    (snapshot: NonNullable<typeof lifecycleStatus>['submittedTermsSnapshot']) => {
      const preset =
        SELLER_AUCTION_DURATION_PRESETS.find((option) => option.hours === snapshot.durationHours)
          ?.value ?? 'custom'

      return {
        reservePolicy: snapshot.reservePolicy,
        reservePriceEth: snapshot.reservePriceEth ?? '',
        minBidIncrementEth: snapshot.minBidIncrementEth,
        durationPreset: preset,
        customDurationHours: preset === 'custom' ? String(snapshot.durationHours) : '',
        shippingDisclosure: snapshot.shippingDisclosure,
        paymentDisclosure: snapshot.paymentDisclosure,
        economicsLockedAcknowledged: snapshot.economicsLockedAcknowledged,
      } satisfies SellerAuctionTermsFormValues
    },
    [],
  )

  /**
   * updateTermsValues - Utility function
   * @returns void
   */
  const buildStartRequest = useCallback(
    (artworkId: string, values: SellerAuctionTermsFormValues) => ({
      artworkId,
      reservePolicy: values.reservePolicy,
      reservePriceEth:
        values.reservePolicy === 'set' ? values.reservePriceEth.trim() || null : null,
      minBidIncrementEth: values.minBidIncrementEth.trim(),
      durationHours: getAuctionDurationHours(values) ?? 0,
      shippingDisclosure: values.shippingDisclosure.trim(),
      paymentDisclosure: values.paymentDisclosure.trim(),
      economicsLockedAcknowledged: values.economicsLockedAcknowledged,
    }),
    [],
    /**
     * validateCurrentTerms - Utility function
     * @returns void
     */
  )

  const runWalletHandoff = useCallback(
    async (attempt: NonNullable<typeof lifecycleStatus>) => {
      /**
       * nextErrors - Utility function
       * @returns void
       */
      if (!attempt.transactionRequest) {
        await sellerAuctionStart.refresh(attempt.artworkId)
        return
      }

      setWalletError(null)

      try {
        /**
         * handleSelectArtwork - Utility function
         * @returns void
         */
        const walletResult = await submitSellerAuctionStartTransaction({
          transactionRequest: attempt.transactionRequest,
        })

        await sellerAuctionStart.attachTransaction(attempt.attemptId, {
          walletAddress: walletResult.walletAddress,
          txHash: walletResult.txHash,
        })
      } catch (nextError) {
        const message =
          nextError instanceof Error
            ? nextError.message
            : 'MetaMask could not continue the seller auction start.'
        setWalletError(message)
        await sellerAuctionStart.refresh(attempt.artworkId).catch(() => null)
      }
    },
    [sellerAuctionStart],
  )

  const handleStartAttempt = async () => {
    setHasSubmittedTerms(true)
    setWalletError(null)

    const nextErrors = validateCurrentTerms()
    if (Object.keys(nextErrors).length > 0 || !selectedCandidate) {
      return
      /**
       * handleContinueToTerms - Utility function
       * @returns void
       */
    }

    try {
      setIsEditingFailedTerms(false)
      const response = await sellerAuctionStart.start(
        buildStartRequest(selectedCandidate.artworkId, termsValues),
      )
      await runWalletHandoff(response)
    } catch {
      /**
       * nextValues - Utility function
       * @returns void
       */
      return
    }
  }

  const handleRetryStart = async () => {
    if (!selectedCandidate) {
      return
    }

    setWalletError(null)
    try {
      const response = await sellerAuctionStart.retry(
        buildStartRequest(selectedCandidate.artworkId, termsValues),
      )
      await runWalletHandoff(response)
    } catch {
      return
    }
  }

  /**
   * handleBackToArtwork - Utility function
   * @returns void
   */
  const displayedTermsValues =
    shouldShowLifecycleShell && lifecycleStatus
      ? mapSnapshotToFormValues(lifecycleStatus.submittedTermsSnapshot)
      : termsValues
  const isTermsValid = Object.keys(validateSellerAuctionTerms(displayedTermsValues)).length === 0
  const previewMode = isLifecycleLocked ? 'submitted' : 'draft'
  const startButtonLabel = sellerAuctionStart.isStarting
    ? 'Preparing auction...'
    : lifecycleStatus?.status === 'pending_start'
      ? 'Auction start in progress'
      : /**
         * handleSaveDraft - Utility function
         * @returns void
         */
        lifecycleStatus?.status === 'auction_active'
        ? 'Auction active'
        : lifecycleStatus?.status === 'retry_available'
          ? 'Retry from status shell'
          : lifecycleStatus?.status === 'start_failed' && !isEditingFailedTerms
            ? 'Review failure state above'
            : 'Start Auction'
  const supportingMessage =
    lifecycleStatus?.status === 'pending_start'
      ? 'Do not submit again while auction start is in progress.'
      : lifecycleStatus?.status === 'auction_active'
        ? 'Reserve, increment, and duration cannot be edited after activation.'
        : /**
           * mapSnapshotToFormValues - Utility function
           * @returns void
           */
          'Network gas is shown in MetaMask during activation.'

  return (
    <div
      ref={workspaceRef}
      /**
       * preset - Utility function
       * @returns void
       */
      className="-mx-6 -my-1 min-h-screen bg-[#F7F8FA] px-4 pb-12 text-slate-900 sm:-mx-8 sm:px-6 lg:-mx-12 lg:px-8"
    >
      <div className="pt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Seller workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create auction</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Select an eligible artwork, set buyer-facing auction terms, and hand off activation to
              your wallet.
            </p>
          </div>
          <div className="w-full rounded-[28px] border border-slate-900 bg-slate-900 p-5 text-white shadow-sm lg:w-[360px]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
              Auction setup
            </p>
            <div className="mt-4">
              <StepRail currentStep={effectiveCurrentStep} />
            </div>
            /** * buildStartRequest - Utility function * @returns void */
            {effectiveCurrentStep === 'artwork' ? (
              <>
                <p className="mt-5 text-sm leading-6 text-white/75">
                  Select an eligible artwork to unlock terms setup and preview.
                </p>
                <Button
                  type="button"
                  disabled={!selectedEligibleCandidate}
                  onClick={handleContinueToTerms}
                  className="mt-6 w-full bg-white text-slate-900 hover:bg-white/90 disabled:bg-white/25 disabled:text-white"
                >
                  Continue to auction terms
                </Button>
              </>
            ) : (
              <p className="mt-5 text-sm leading-6 text-white/75">
                Review terms, MetaMask handoff, and persisted lifecycle status. /** *
                runWalletHandoff - Utility function * @returns void */
              </p>
            )}
          </div>
        </div>
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {policyCards.map((card) => {
          const Icon = card.icon

          return (
            <article
              key={card.title}
              /**
               * walletResult - Utility function
               * @returns void
               */
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Icon className="h-6 w-6 text-slate-600" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{card.body}</p>
            </article>
          )
        })}
      </section>
      <SellerAuctionWalletReadiness userWalletAddress={user?.walletAddress} />
      /** * message - Utility function * @returns void */
      {error ? (
        <section className="mt-8 rounded-[32px] border border-rose-200 bg-rose-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-rose-950">
                We could not load auction eligibility. Try again or return to inventory.
              </h2>
              <p className="mt-2 text-sm text-rose-700">{error.message}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => void refresh()}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
          /** * handleStartAttempt - Utility function * @returns void */
        </section>
      ) : null}
      {effectiveCurrentStep === 'terms' && selectedCandidate ? (
        <section className="mt-10">
          {shouldShowLifecycleShell && lifecycleStatus ? (
            <div className="mb-6">
              /** * nextErrors - Utility function * @returns void */
              <SellerAuctionStartStatusShell
                status={lifecycleStatus}
                walletError={walletError || sellerAuctionStart.error}
                isWalletActionLoading={
                  sellerAuctionStart.isRetrying || sellerAuctionStart.isAttachingTx
                }
                onOpenMetaMask={() => void runWalletHandoff(lifecycleStatus)}
                onRetry={() => void handleRetryStart()}
                onBackToTerms={
                  lifecycleStatus.editAllowed
                    ? /**
                       * response - Utility function
                       * @returns void
                       */
                      () => {
                        setIsEditingFailedTerms(true)
                        setWalletError(null)
                        setTermsErrors({})
                        setHasSubmittedTerms(false)
                        setTermsValues(
                          mapSnapshotToFormValues(lifecycleStatus.submittedTermsSnapshot),
                        )
                      }
                    : undefined
                }
              />
              /** * handleRetryStart - Utility function * @returns void */
            </div>
          ) : null}

          {!shouldShowLifecycleShell && sellerAuctionStart.error ? (
            <div className="mb-6 rounded-[24px] border border-[#FF4337]/20 bg-[#FFF5F4] px-4 py-3 text-sm text-[#FF4337]">
              {sellerAuctionStart.error}
            </div>
          ) : null}

          <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            /** * response - Utility function * @returns void */
            <div className="grid gap-5 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-center">
              <CandidateImage candidate={selectedCandidate} className="max-w-[160px]" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Selected artwork
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {selectedCandidate.title}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedCandidate.creatorName || 'Unknown creator'}
                </p>
                /** * displayedTermsValues - Utility function * @returns void */
                <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  {selectedCandidate.status}
                </span>
              </div>
              <div className="md:justify-self-end">
                <Button
                  type="button"
                  /**
                   * isTermsValid - Utility function
                   * @returns void
                   */
                  variant="outline"
                  onClick={handleBackToArtwork}
                  disabled={isLifecycleLocked}
                >
                  /** * previewMode - Utility function * @returns void */ Change artwork
                </Button>
              </div>
            </div>
            /** * startButtonLabel - Utility function * @returns void */
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div>
              <SellerAuctionTermsForm
                values={displayedTermsValues}
                errors={termsErrors}
                hasSubmitted={hasSubmittedTerms}
                onChange={updateTermsValues}
                onValidate={validateCurrentTerms}
                onBack={handleBackToArtwork}
                onSaveDraft={handleSaveDraft}
                onStartAttempt={() => void handleStartAttempt()}
                isStartDisabled={sellerAuctionStart.isBusy || isLifecycleLocked}
                /**
                 * supportingMessage - Utility function
                 * @returns void
                 */
                isLocked={isLifecycleLocked}
                isBackDisabled={isLifecycleLocked}
                isSaveDraftDisabled={isLifecycleLocked}
                startButtonLabel={startButtonLabel}
                supportingMessage={supportingMessage}
              />
              {draftSaved ? (
                <p className="mt-3 text-sm font-medium text-[#027A48]">
                  Draft saved on this device.
                </p>
              ) : null}
            </div>

            <SellerAuctionTermsPreview
              candidate={selectedCandidate}
              values={displayedTermsValues}
              isTermsValid={previewMode === 'submitted' ? true : isTermsValid}
              mode={previewMode}
            />
          </div>
        </section>
      ) : (
        <>
          <section className="mt-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Ready for auction
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {hasNoEligible ? 'No auction-ready artworks' : 'Ready for auction'}
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                {eligible.length} ready / {blocked.length} needs attention
              </p>
            </div>

            <div className="mt-5">
              {isLoading ? <LoadingGrid /> : null}
              {hasNoArtworks ? (
                <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                  <Boxes className="mx-auto h-10 w-10 text-slate-500" />
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                    No artworks in your inventory yet
                  </h3>
                  <p className="mt-2 text-slate-500">
                    Upload or publish an artwork before starting an auction.
                  </p>
                </div>
              ) : null}
              {hasNoEligible ? (
                <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                  <Boxes className="mx-auto h-10 w-10 text-slate-500" />
                  <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                    No auction-ready artworks
                  </h3>
                  <p className="mt-2 max-w-2xl text-slate-500">
                    Your artworks need to be active, published, single-edition, and complete before
                    they can enter an auction. /** * Icon - React component * @returns React element
                    */
                  </p>
                </div>
              ) : null}
              {!isLoading && eligible.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {eligible.map((candidate) => (
                    <CandidateCard
                      key={candidate.artworkId}
                      candidate={candidate}
                      isSelected={selectedArtworkId === candidate.artworkId}
                      onSelect={() => handleSelectArtwork(candidate.artworkId)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          {!hasNoArtworks && !isLoading ? (
            <section className="mt-12">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Needs attention
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Needs attention</h2>
                </div>
                <p className="text-sm text-slate-500">
                  Blocked artworks stay visible for recovery.
                </p>
              </div>
              {blocked.length > 0 ? (
                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {blocked.map((candidate) => (
                    <CandidateCard
                      key={candidate.artworkId}
                      candidate={candidate}
                      isSelected={selectedArtworkId === candidate.artworkId}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  <p className="mt-3 text-lg font-semibold text-slate-900">
                    No blocked artworks found.
                  </p>
                </div>
              )}
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}

export const SellerAuctionArtworkPickerPage = () => {
  const user = useAuthStore((state) => state.user)
  const isSeller = user?.roles?.includes('seller') ?? false

  if (!isSeller) {
    return <SellerProfileRequired />
  }

  return <SellerCandidateWorkspace />
}

/**
 * SellerAuctionArtworkPickerPage - React component
 * @returns React element
 */
/**
 * user - Custom React hook
 * @returns void
 */
/**
 * isSeller - Utility function
 * @returns void
 */
