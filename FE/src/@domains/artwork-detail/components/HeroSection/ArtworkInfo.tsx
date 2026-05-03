'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { BadgeCheck, Pen, FileText, ChevronUp, ChevronDown, Lock, DollarSign, ShieldCheck, ShoppingCart } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { ArtworkDetail } from '../../types'
import { SatisfactionGuaranteeModal } from './SatisfactionGuaranteeModal'
import { ToastPortal } from '@domains/events/components/ui/ToastPortal'

type ArtworkInfoProps = {
    artwork: ArtworkDetail
}

/**
 * ArtworkInfo - React component
 * @returns React element
 */
export const ArtworkInfo = ({ artwork }: ArtworkInfoProps) => {
    const router = useRouter()
    const [isGuaranteeExpanded, setIsGuaranteeExpanded] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
/**
 * router - Utility function
 * @returns void
 */
    const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null)

    const handlePurchase = () => {
        if (artwork.isSold) {
            setToast({
                message: 'This artwork is temporarily out of stock.',
                variant: 'error',
            })
/**
 * handlePurchase - Utility function
 * @returns void
 */
            setTimeout(() => setToast(null), 3000)
            return
        }
        router.push(`/checkout/${artwork.id}`)
    }

    const handleMakeOffer = () => {
        // TODO: Implement make offer functionality
    }

    return (
        <>
            <div className="flex flex-col space-y-5">
                {/* Title and Year */}
                <div>
/**
 * handleMakeOffer - Utility function
 * @returns void
 */
                    <h1 className="font-semibold text-slate-900" style={{ fontFamily: 'Inter', fontSize: '40px', lineHeight: '44px', fontWeight: 600, letterSpacing: '0%' }}>
                        {artwork.title}
                        {artwork.year && <span className="text-slate-500">, {artwork.year}</span>}
                    </h1>

                    {/* Artist Link */}
                    <p className="mt-1 text-slate-600" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '100%', fontWeight: 400, letterSpacing: '0%' }}>
                        Created and listed by{' '}
                        <Link
                            href={artwork.creator.slug ? `/profile/${artwork.creator.slug}` : '#'}
                            className="inline-flex items-center gap-1 text-slate-900 hover:underline" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}
                        >
                            {artwork.creator.displayName}
                            {artwork.creator.verified && (
                                <BadgeCheck className="h-4 w-4 text-blue-500" />
                            )}
                        </Link>
                    </p>
                </div>

                {/* Medium and Dimensions */}
                <div className="text-slate-600" style={{ fontFamily: 'Inter', fontSize: '16px', lineHeight: '100%', fontWeight: 400, letterSpacing: '0%' }}>
                    <p>{artwork.medium}{artwork.frame && ` - ${artwork.frame}`}</p>
                    <p className="mt-1">{artwork.dimensions}</p>
                    {artwork.weight && <p className="mt-1">{artwork.weight}</p>}
                </div>

                {/* Unique Piece Info */}
                <div className="space-y-1 text-slate-500" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}>
                    {artwork.isUnique && (
                        <p className="flex items-center gap-2">
                            <Pen className="h-4 w-4 text-slate-500" />
                            <span>Unique piece. Only 1 available. Get yours now!</span>
                        </p>
                    )}
                    {artwork.hasCertificate && (
                        <p className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <span>Includes a Certificate of Authenticity</span>
                        </p>
                    )}
                </div>

                {/* Price and Actions */}
                <div className="space-y-3 border-t border-slate-200 pt-5">
                    <p className="text-slate-900 uppercase" style={{ fontFamily: 'Inter', fontSize: '24px', lineHeight: '20px', fontWeight: 600, letterSpacing: '0%' }}>{artwork.priceLabel}</p>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={handleMakeOffer}
                        >
                            Make an Offer
                        </Button>
                        <Button
                            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-white transition hover:bg-blue-700"
                            onClick={handlePurchase}
                        >
                            <ShoppingCart className="h-4 w-4 text-white" aria-hidden />
                            <span>Purchase</span>
                        </Button>
                    </div>
                </div>

                {/* Artium Satisfaction Guarantee */}
                <div className="border-t border-slate-200 pt-5">
                    <button
                        onClick={() => setIsGuaranteeExpanded(!isGuaranteeExpanded)}
                        className="flex w-full cursor-pointer items-center justify-between text-left"
                    >
                        <span className="text-slate-900 uppercase" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}>
                            ARTIUM SATISFACTION GUARANTEE
                        </span>
                        {isGuaranteeExpanded ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                        )}
                    </button>

                    {isGuaranteeExpanded && (
                        <div className="mt-4 space-y-2 text-slate-600" style={{ fontFamily: 'Inter', fontSize: '14px', lineHeight: '20px', fontWeight: 500, letterSpacing: '0%' }}>
                            <p className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-slate-500" />
                                <span>Secure checkout</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-slate-500" />
                                <span>100% money-back guarantee</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-slate-500" />
                                <span>Authenticity guarantee</span>
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-2 cursor-pointer text-sm font-medium text-slate-900 underline hover:text-slate-700"
                            >
                                Learn more
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Satisfaction Guarantee Modal */}
            <SatisfactionGuaranteeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            {toast && (
                <ToastPortal
                    message={toast.message}
                    variant={toast.variant}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    )
}
