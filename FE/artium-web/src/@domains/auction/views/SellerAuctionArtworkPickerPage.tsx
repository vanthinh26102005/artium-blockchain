import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  ImageOff,
  Lock,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { useSellerAuctionArtworkCandidates } from '../hooks/useSellerAuctionArtworkCandidates'
import type { SellerAuctionArtworkCandidate } from '@shared/apis/auctionApis'

const policyCards = [
  {
    title: 'Seller-only access',
    body: 'Auction creation starts from an authenticated seller workspace.',
    icon: ShieldCheck,
  },
  {
    title: 'Owned artwork only',
    body: 'Candidate records are scoped to the seller account on the backend.',
    icon: Lock,
  },
  {
    title: 'Blocked reasons shown',
    body: 'Every unavailable artwork stays visible with recovery guidance.',
    icon: AlertCircle,
  },
]

const CandidateImage = ({ candidate }: { candidate: SellerAuctionArtworkCandidate }) => {
  if (!candidate.thumbnailUrl) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[28px] bg-[#f5f5f5] text-[#191414]/45">
        <ImageOff className="h-10 w-10" />
      </div>
    )
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px]">
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
          <p className="rounded-2xl bg-[#2351FC]/10 px-4 py-3 text-sm font-medium text-[#2351FC]">
            Ownership and auction readiness checks passed.
          </p>
        )}

        <div className="mt-auto">
          <Button
            type="button"
            disabled={isBlocked}
            onClick={onSelect}
            className={`w-full ${isBlocked ? 'bg-[#191414]/20 text-[#191414]' : 'bg-[#191414] text-white hover:bg-[#2351FC]'}`}
          >
            {isBlocked ? 'Unavailable for auction' : 'Select artwork'}
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
  const { data, eligible, blocked, isLoading, error, refresh } =
    useSellerAuctionArtworkCandidates()
  const [selectedArtworkId, setSelectedArtworkId] = useState<string | null>(null)
  const hasNoArtworks = !isLoading && !error && data?.total === 0
  const hasNoEligible = !isLoading && !error && !hasNoArtworks && eligible.length === 0

  return (
    <main className="min-h-screen bg-[#FDFDFD] px-5 py-8 text-[#191414] md:px-10 lg:px-12">
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
            <p className="text-sm uppercase tracking-[0.2em] text-white/55">Phase 18 scope</p>
            <p className="mt-4 text-3xl font-semibold leading-tight">
              Pick the artwork now. Terms and on-chain start come next.
            </p>
            <Button
              type="button"
              disabled
              className="mt-8 w-full bg-white text-[#191414]"
            >
              Continue to auction terms
            </Button>
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
              <p className="mt-2 text-[#191414]/60">Upload artwork before starting an auction.</p>
            </div>
          ) : null}
          {!isLoading && eligible.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {eligible.map((candidate) => (
                <CandidateCard
                  key={candidate.artworkId}
                  candidate={candidate}
                  isSelected={selectedArtworkId === candidate.artworkId}
                  onSelect={() => setSelectedArtworkId(candidate.artworkId)}
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
