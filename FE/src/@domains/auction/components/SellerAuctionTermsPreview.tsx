import Image from 'next/image'
import { CheckCircle2, Circle, ImageOff } from 'lucide-react'
import type { SellerAuctionArtworkCandidate } from '@shared/apis/auctionApis'
import {
  SELLER_AUCTION_DURATION_PRESETS,
  getAuctionDurationHours,
  type SellerAuctionTermsFormValues,
} from '../validations/sellerAuctionTerms.schema'

type SellerAuctionTermsPreviewProps = {
  candidate: SellerAuctionArtworkCandidate
  values: SellerAuctionTermsFormValues
  isTermsValid: boolean
  mode?: 'draft' | 'submitted'
}

/**
 * formatDurationLabel - Utility function
 * @returns void
 */
const formatDurationLabel = (values: SellerAuctionTermsFormValues) => {
  const presetLabel = SELLER_AUCTION_DURATION_PRESETS.find(
    (preset) => preset.value === values.durationPreset,
  )?.label
/**
 * presetLabel - Utility function
 * @returns void
 */

  if (presetLabel) {
    return presetLabel
  }

  const customDurationHours = getAuctionDurationHours(values)
  if (!customDurationHours) {
    return null
  }

  if (customDurationHours % 24 === 0) {
/**
 * customDurationHours - Utility function
 * @returns void
 */
    const days = customDurationHours / 24
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  return `${customDurationHours} ${customDurationHours === 1 ? 'hour' : 'hours'}`
}

const formatEthAmount = (value: string) => {
  const trimmed = value.trim()
/**
 * days - Utility function
 * @returns void
 */
  return trimmed ? `${trimmed} ETH` : 'Not set'
}

const ChecklistRow = ({
  label,
  complete,
}: {
  label: string
  complete: boolean
}) => (
/**
 * formatEthAmount - Utility function
 * @returns void
 */
  <div
    className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm ${
      complete ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#F7F7F7] text-[#191414]/65'
    }`}
/**
 * trimmed - Utility function
 * @returns void
 */
  >
    {complete ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Circle className="h-4 w-4 shrink-0" />}
    <span className="font-medium">{label}</span>
  </div>
)

export const SellerAuctionTermsPreview = ({
/**
 * ChecklistRow - React component
 * @returns React element
 */
  candidate,
  values,
  isTermsValid,
  mode = 'draft',
}: SellerAuctionTermsPreviewProps) => {
  const durationLabel = formatDurationLabel(values)
  const reserveCopy =
    values.reservePolicy === 'none'
      ? 'No reserve threshold configured'
      : `Reserve price: ${formatEthAmount(values.reservePriceEth)}`

  return (
    <aside className="rounded-[32px] border border-black/10 bg-white p-6 md:p-8 lg:sticky lg:top-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
        {mode === 'submitted' ? 'Submitted snapshot' : 'Auction preview'}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#191414]">
        {mode === 'submitted' ? 'Submitted auction snapshot' : 'Auction preview'}
      </h2>

/**
 * SellerAuctionTermsPreview - React component
 * @returns React element
 */
      <div className="mt-6 overflow-hidden rounded-[28px] border border-[#E5E5E5] bg-[#FDFDFD]">
        {candidate.thumbnailUrl ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image
              src={candidate.thumbnailUrl}
              alt={candidate.title}
              fill
              unoptimized
              className="object-cover"
/**
 * durationLabel - Utility function
 * @returns void
 */
              sizes="(min-width: 1280px) 420px, (min-width: 768px) 60vw, 100vw"
            />
          </div>
        ) : (
/**
 * reserveCopy - Utility function
 * @returns void
 */
          <div className="flex aspect-[4/3] items-center justify-center bg-[#F5F5F5] text-[#191414]/45">
            <ImageOff className="h-10 w-10" />
          </div>
        )}

        <div className="space-y-6 p-5">
          <div>
            <h3 className="text-2xl font-semibold leading-tight text-[#191414]">{candidate.title}</h3>
            <p className="mt-2 text-sm text-[#191414]/60">
              {candidate.creatorName || 'Unknown creator'}
            </p>
          </div>

          <div className="space-y-4 rounded-[24px] border border-[#E5E5E5] bg-white p-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
                Timing
              </p>
              <p className="mt-2 text-sm font-medium text-[#191414]">Starts when activated</p>
              <p className="mt-1 text-sm text-[#191414]/60">
                {durationLabel ? `Ends ${durationLabel} after activation` : 'Ends after activation'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
                First bid floor
              </p>
              <p className="mt-2 text-sm font-medium text-[#191414]">
                {formatEthAmount(values.minBidIncrementEth)}
              </p>
              <p className="mt-1 text-sm text-[#191414]/60">
                Contract-backed by minimum bid increment.
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
                Reserve
              </p>
              <p className="mt-2 text-sm text-[#191414]">{reserveCopy}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E5E5E5] bg-white px-4 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
              Fees and activation costs
            </p>
            <div className="mt-3 space-y-2 text-sm leading-6 text-[#191414]/70">
              <p>Marketplace seller fees follow current policy.</p>
              <p>Network gas is shown in MetaMask during activation.</p>
              <p>Sepolia is a test network. Confirm wallet and network details before activation.</p>
              <p>Shipping and payment disclosures are shown to buyers before bidding.</p>
            </div>
          </div>

          <div className="rounded-[24px] bg-[#FFF7E6] px-4 py-4 text-sm text-[#7A4B00]">
            <p className="font-semibold text-[#191414]">Sepolia test network</p>
            <p className="mt-2">
              Reserve, increment, and duration cannot be edited after activation.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
                Shipping and fulfillment notes
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[#191414]/70">
                {values.shippingDisclosure.trim() || 'Shipping and payment disclosures are shown to buyers before bidding.'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2351FC]">
                Payment and buyer expectations
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[#191414]/70">
                {values.paymentDisclosure.trim() || 'Buyer-facing payment expectations will appear here.'}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-[#E5E5E5] pt-5">
            <ChecklistRow label="Eligible artwork selected" complete />
            <ChecklistRow label="Terms validated" complete={isTermsValid} />
            <ChecklistRow
              label={mode === 'submitted' ? 'Submitted snapshot locked' : 'Ready for wallet handoff'}
              complete
            />
          </div>
        </div>
      </div>
    </aside>
  )
}
