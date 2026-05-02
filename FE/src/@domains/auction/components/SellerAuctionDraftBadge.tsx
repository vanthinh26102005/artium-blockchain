import { FilePenLine } from 'lucide-react'

type SellerAuctionDraftBadgeProps = {
  className?: string
}

export const SellerAuctionDraftBadge = ({ className }: SellerAuctionDraftBadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-amber-800 uppercase shadow-sm ${
      className ?? ''
    }`}
  >
    <FilePenLine className="h-3.5 w-3.5" />
    Draft
  </span>
)
