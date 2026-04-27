import { useCallback, useMemo, useRef, useState } from 'react'
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
  SellerAuctionStartStatusShell,
  SellerAuctionTermsForm,
  SellerAuctionTermsPreview,
} from '../components'
import { useSellerAuctionStart } from '../hooks/useSellerAuctionStart'
import { useSellerAuctionArtworkCandidates } from '../hooks/useSellerAuctionArtworkCandidates'
import {
  submitSellerAuctionStartTransaction,
} from '../services/auctionStartWallet'
import {
  DEFAULT_SELLER_AUCTION_TERMS,
  SELLER_AUCTION_DURATION_PRESETS,
  getAuctionDurationHours,
  validateSellerAuctionTerms,
  type SellerAuctionTermsFormValues,
} from '../validations/sellerAuctionTerms.schema'
import {
  loadSellerAuctionTermsDraft,
  saveSellerAuctionTermsDraft,
} from '../utils'

const policyCards = [
  {
    title: 'Contract-backed terms',
    body: 'Reserve policy, increment, and duration are previewed as seller-set rules before activation.',
    icon: ShieldCheck,
  },
  {
    title: 'Fees and lock after activation',
    body: 'Seller fees follow current policy. Reserve, increment, and duration lock once the auction is activated.',
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
}: {
  candidate: SellerAuctionArtworkCandidate
  className?: string
}) => {
  if (!candidate.thumbnailUrl) {
    return (
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-[28px] bg-[#f5f5f5] text-[#191414]/45 ${className ?? ''}`}
      >
        <ImageOff className="h-10 w-10" />
      </div>
    )
  }

  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-[28px] ${className ?? ''}`}>
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
  isSelected?: boolean
  onSelect?: () => void
}) => {
  const isBlocked = !candidate.isEligible

  return (
    <article
      className={`flex h-full flex-col rounded-[34px] border bg-white p-3 shadow-sm transition ${
        isSelected
          ? 'border-[#2351FC] shadow-[0_24px_80px_rgba(35,81,252,0.16)]'
          : 'border-black/10'
      } ${isBlocked ? 'bg-[#f5f5f5]' : 'hover:-translate-y-1 hover:shadow-xl'}`}
    >
      <CandidateImage candidate={candidate} />
      <div className="flex flex-1 flex-col gap-4 px-2 pb-2 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2351FC]">
            {candidate.status}
          </p>
          <h3 className="mt-2 line-clamp-2 text-2xl font-semibold leading-tight text-[#191414]">
            {candidate.title}
          </h3>
          <p className="mt-1 text-sm text-[#191414]/60">{candidate.creatorName || 'Unknown creator'}</p>
        </div>

        {isBlocked ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {candidate.recoveryActions.slice(0, 2).map((action) => (
                <span
                  key={action.reasonCode}
                  className="rounded-full border border-[#191414]/10 bg-white px-3 py-1 text-xs font-medium text-[#191414]"
                >
                  {action.message}
                </span>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-[#191414]/65">
              {candidate.recoveryActions.map((action) => (
                <li key={action.reasonCode} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2351FC]" />
                  <span>{action.actionLabel}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              isSelected ? 'bg-[#2351FC] text-white' : 'bg-[#2351FC]/10 text-[#2351FC]'
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
                ? 'bg-[#191414]/20 text-[#191414]'
                : isSelected
                  ? 'bg-[#2351FC] text-white hover:bg-[#1d46d9]'
                  : 'bg-[#191414] text-white hover:bg-[#2351FC]'
            }`}
          >
            {isBlocked ? 'Unavailable for auction' : isSelected ? 'Selected for auction' : 'Select artwork'}
          </Button>
        </div>
      </div>
    </article>
  )
}

const LoadingGrid = () => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
    {[0, 1, 2].map((item) => (
      <div key={item} className="rounded-[34px] border border-black/10 bg-white p-3">
        <div className="aspect-[4/3] animate-pulse rounded-[28px] bg-[#f5f5f5]" />
        <div className="space-y-3 px-2 pb-3 pt-5">
          <div className="h-3 w-24 animate-pulse rounded-full bg-[#f5f5f5]" />
          <div className="h-7 w-3/4 animate-pulse rounded-full bg-[#f5f5f5]" />
          <div className="h-12 animate-pulse rounded-2xl bg-[#f5f5f5]" />
        </div>
      </div>
    ))}
  </div>
)

const StepRail = ({ currentStep }: { currentStep: 'artwork' | 'terms' }) => {
  const isTermsStep = currentStep === 'terms'

  return (
    <ol className="space-y-3" aria-label="Seller auction creation steps">
      <li
        className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 ${
          isTermsStep ? 'border-black/10 bg-white text-[#191414]' : 'border-[#2351FC] bg-[#2351FC]/10 text-[#2351FC]'
        }`}
        aria-current={currentStep === 'artwork' ? 'step' : undefined}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
          {isTermsStep ? <Check className="h-4 w-4" /> : <span className="text-sm font-semibold">1</span>}
        </span>
        <span className="text-sm font-semibold">1 Choose artwork</span>
      </li>
      <li
        className={`flex items-center gap-3 rounded-[22px] border px-4 py-3 ${
          isTermsStep ? 'border-[#2351FC] bg-[#2351FC]/10 text-[#2351FC]' : 'border-black/10 bg-white text-[#191414]/55'
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
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2351FC]">
        SELLER AUCTIONS
      </p>
      <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-[#191414]">
        Seller profile required
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-[#191414]/65">
        Create or complete your seller profile before starting an auction.
      </p>
      <Button
        type="button"
        className="mt-8 bg-[#191414] text-white hover:bg-[#2351FC]"
        onClick={() => void router.push(profileHref)}
      >
        Go to seller profile
      </Button>
    </section>
  )
}

const SellerCandidateWorkspace = () => {
  const workspaceRef = useRef<HTMLElement | null>(null)
  const { data, eligible, blocked, isLoading, error, refresh } =
    useSellerAuctionArtworkCandidates()
  const [currentStep, setCurrentStep] = useState<'artwork' | 'terms'>('artwork')
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null)
  const [termsArtworkId, setTermsArtworkId] = useState<string | null>(null)
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
  const allCandidates = useMemo(() => [...eligible, ...blocked], [eligible, blocked])
  const restoredCandidate = useMemo(() => {
    if (currentStep !== 'artwork' || selectedArtworkId || !sellerAuctionStart.rememberedArtworkId) {
      return null
    }

    return (
      allCandidates.find(
        (candidate) => candidate.artworkId === sellerAuctionStart.rememberedArtworkId,
      ) ?? null
    )
  }, [allCandidates, currentStep, selectedArtworkId, sellerAuctionStart.rememberedArtworkId])
  const activeArtworkId =
    sellerAuctionStart.status?.artworkId ??
    termsArtworkId ??
    restoredCandidate?.artworkId ??
    selectedArtworkId
  const effectiveCurrentStep =
    currentStep === 'terms' || sellerAuctionStart.status || restoredCandidate ? 'terms' : 'artwork'

  const selectedCandidate = useMemo(
    () => allCandidates.find((candidate) => candidate.artworkId === activeArtworkId) ?? null,
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
    lifecycleStatus?.status === 'start_failed' && lifecycleStatus.editAllowed && isEditingFailedTerms
  const isLifecycleLocked = Boolean(
    lifecycleStatus &&
      !isFailureEditable &&
      (lifecycleStatus.status === 'pending_start' ||
        lifecycleStatus.status === 'auction_active' ||
        lifecycleStatus.status === 'retry_available' ||
        lifecycleStatus.status === 'start_failed'),
  )
  const shouldShowLifecycleShell = Boolean(lifecycleStatus && !isFailureEditable)

  const updateTermsValues = (nextValues: SellerAuctionTermsFormValues) => {
    setTermsValues(nextValues)
    setDraftSaved(false)
    setWalletError(null)

    if (hasSubmittedTerms) {
      setTermsErrors(validateSellerAuctionTerms(nextValues))
    }
  }

  const validateCurrentTerms = () => {
    const nextErrors = validateSellerAuctionTerms(termsValues)
    setTermsErrors(nextErrors)
    return nextErrors
  }

  const handleSelectArtwork = (artworkId: string) => {
    setSelectedArtworkId(artworkId)
    setDraftSaved(false)
    setWalletError(null)
    setIsEditingFailedTerms(false)
    if (lifecycleStatus?.artworkId !== artworkId) {
      sellerAuctionStart.setTrackedArtworkId(null)
    }
  }

  const handleContinueToTerms = () => {
    if (!selectedEligibleCandidate) {
      return
    }

    if (termsArtworkId !== selectedEligibleCandidate.artworkId) {
      const nextValues =
        loadSellerAuctionTermsDraft(selectedEligibleCandidate.artworkId) ??
        DEFAULT_SELLER_AUCTION_TERMS

      setTermsArtworkId(selectedEligibleCandidate.artworkId)
      setTermsValues(nextValues)
      setTermsErrors({})
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
  )

  const runWalletHandoff = useCallback(
    async (attempt: NonNullable<typeof lifecycleStatus>) => {
      if (!attempt.transactionRequest) {
        await sellerAuctionStart.refresh(attempt.artworkId)
        return
      }

      setWalletError(null)

      try {
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
    }

    try {
      setIsEditingFailedTerms(false)
      const response = await sellerAuctionStart.start(
        buildStartRequest(selectedCandidate.artworkId, termsValues),
      )
      await runWalletHandoff(response)
    } catch {
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
      : lifecycleStatus?.status === 'auction_active'
        ? 'Auction active'
        : lifecycleStatus?.status === 'retry_available'
          ? 'Retry from status shell'
          : lifecycleStatus?.status === 'start_failed' && !isEditingFailedTerms
            ? 'Review failure state above'
            : 'Start Auction'
  const supportingMessage = lifecycleStatus?.status === 'pending_start'
    ? 'Do not submit again while auction start is in progress.'
    : lifecycleStatus?.status === 'auction_active'
      ? 'Reserve, increment, and duration cannot be edited after activation.'
      : 'Network gas is shown in MetaMask during activation.'

  return (
    <main
      ref={workspaceRef}
      className="min-h-screen bg-[#FDFDFD] px-5 py-8 text-[#191414] md:px-10 lg:px-12"
    >
      <section className="overflow-hidden rounded-[40px] border border-black/10 bg-white">
        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.3fr_0.7fr] lg:p-12">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#2351FC]">
              SELLER AUCTIONS
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.06em] md:text-7xl">
              Choose artwork for auction
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#191414]/65">
              We check ownership and auction readiness before you set reserve price, duration, or
              bid rules.
            </p>
          </div>

          <div className="rounded-[32px] bg-[#191414] p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-white/55">Phase 19 workspace</p>
            <div className="mt-5">
              <StepRail currentStep={effectiveCurrentStep} />
            </div>

            {effectiveCurrentStep === 'artwork' ? (
              <>
                <p className="mt-5 text-sm leading-6 text-white/75">
                  Select an eligible artwork to unlock local terms setup and buyer-facing preview.
                </p>
                <Button
                  type="button"
                  disabled={!selectedEligibleCandidate}
                  onClick={handleContinueToTerms}
                  className="mt-8 w-full bg-white text-[#191414] hover:bg-white/90 disabled:bg-white/25 disabled:text-white"
                >
                  Continue to auction terms
                </Button>
              </>
            ) : (
              <p className="mt-5 text-sm leading-6 text-white/75">
                Review submitted terms, MetaMask handoff, and persisted lifecycle status without
                leaving this page.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {policyCards.map((card) => {
          const Icon = card.icon

          return (
            <article key={card.title} className="rounded-[28px] border border-black/10 bg-white p-5">
              <Icon className="h-6 w-6 text-[#2351FC]" />
              <h2 className="mt-4 text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#191414]/60">{card.body}</p>
            </article>
          )
        })}
      </section>

      {error ? (
        <section className="mt-8 rounded-[32px] border border-red-200 bg-red-50 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-red-950">
                We could not load auction eligibility. Try again or return to inventory.
              </h2>
              <p className="mt-2 text-sm text-red-700">{error.message}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => void refresh()}>
              <RefreshCcw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </section>
      ) : null}

      {effectiveCurrentStep === 'terms' && selectedCandidate ? (
        <section className="mt-10">
          {shouldShowLifecycleShell && lifecycleStatus ? (
            <div className="mb-6">
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
                    ? () => {
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
            </div>
          ) : null}

          {!shouldShowLifecycleShell && sellerAuctionStart.error ? (
            <div className="mb-6 rounded-[24px] border border-[#FF4337]/20 bg-[#FFF5F4] px-4 py-3 text-sm text-[#FF4337]">
              {sellerAuctionStart.error}
            </div>
          ) : null}

          <div className="rounded-[32px] border border-black/10 bg-white p-4 md:p-6">
            <div className="grid gap-5 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-center">
              <CandidateImage candidate={selectedCandidate} className="max-w-[160px]" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
                  Selected artwork
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#191414]">
                  {selectedCandidate.title}
                </h2>
                <p className="mt-2 text-sm text-[#191414]/60">
                  {selectedCandidate.creatorName || 'Unknown creator'}
                </p>
                <span className="mt-4 inline-flex rounded-full bg-[#2351FC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#2351FC]">
                  {selectedCandidate.status}
                </span>
              </div>
              <div className="md:justify-self-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToArtwork}
                  disabled={isLifecycleLocked}
                >
                  Change artwork
                </Button>
              </div>
            </div>
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
                isLocked={isLifecycleLocked}
                isBackDisabled={isLifecycleLocked}
                isSaveDraftDisabled={isLifecycleLocked}
                startButtonLabel={startButtonLabel}
                supportingMessage={supportingMessage}
              />
              {draftSaved ? (
                <p className="mt-3 text-sm font-medium text-[#027A48]">Draft saved on this device.</p>
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
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2351FC]">
                  Ready for auction
                </p>
                <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">
                  {hasNoEligible ? 'No auction-ready artworks' : 'Ready for auction'}
                </h2>
              </div>
              <p className="text-sm text-[#191414]/55">
                {eligible.length} ready / {blocked.length} needs attention
              </p>
            </div>

            <div className="mt-5">
              {isLoading ? <LoadingGrid /> : null}
              {hasNoArtworks ? (
                <div className="rounded-[32px] border border-dashed border-black/20 bg-white p-10 text-center">
                  <Boxes className="mx-auto h-10 w-10 text-[#2351FC]" />
                  <h3 className="mt-4 text-2xl font-semibold">No artworks in your inventory yet</h3>
                  <p className="mt-2 text-[#191414]/60">
                    Upload or publish an artwork before starting an auction.
                  </p>
                </div>
              ) : null}
              {hasNoEligible ? (
                <div className="rounded-[32px] border border-dashed border-black/20 bg-white p-10 text-center">
                  <Boxes className="mx-auto h-10 w-10 text-[#2351FC]" />
                  <h3 className="mt-4 text-2xl font-semibold">No auction-ready artworks</h3>
                  <p className="mt-2 max-w-2xl text-[#191414]/60">
                    Your artworks need to be active, published, single-edition, and complete before
                    they can enter an auction.
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
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2351FC]">
                    Needs attention
                  </p>
                  <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em]">Needs attention</h2>
                </div>
                <p className="text-sm text-[#191414]/55">Blocked artworks stay visible for recovery.</p>
              </div>
              {blocked.length > 0 ? (
                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {blocked.map((candidate) => (
                    <CandidateCard key={candidate.artworkId} candidate={candidate} />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[32px] border border-black/10 bg-white p-8">
                  <CheckCircle2 className="h-8 w-8 text-[#2351FC]" />
                  <p className="mt-3 text-lg font-semibold">No blocked artworks found.</p>
                </div>
              )}
            </section>
          ) : null}
        </>
      )}
    </main>
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
