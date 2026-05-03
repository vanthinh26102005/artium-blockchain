'use client'

import { Lock, Truck, ShieldCheck, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogClose } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'

type SatisfactionGuaranteeModalProps = {
    isOpen: boolean
    onClose: () => void
}

/**
 * SatisfactionGuaranteeModal - React component
 * @returns React element
 */
export const SatisfactionGuaranteeModal = ({
    isOpen,
    onClose,
}: SatisfactionGuaranteeModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                size="3xl"
                className="rounded-2xl bg-white p-8"
                disableCloseOnOutsideClick={false}
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <DialogTitle className="text-2xl font-semibold text-slate-900">
                        Artium Satisfaction Guarantee
                    </DialogTitle>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* 100% money-back guarantee */}
                    <div className="flex flex-col">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <Lock className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="mb-2 text-base font-semibold text-slate-900">
                            100% money-back guarantee
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-600">
                            Return your purchase for any reason within 48 hours after delivery. The buyer is
                            responsible for all return shipping costs.{' '}
                            <span className="text-amber-600">
                                The refund will be in your account 5-7 days after Artium successfully receives the artwork.
                            </span>
                        </p>
                    </div>

                    {/* Insured, flat-rate shipping */}
                    <div className="flex flex-col">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="mb-2 text-base font-semibold text-slate-900">
                            Artium offers insured, flat-rate shipping
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-600">
                            Artium insures your order. If you select ship, shipping fee is calculated based on order
                            subtotal (after discounts), and shows in the final total at checkout, with a flat fee of 5%
                            for domestic, 8% for international. Oversized artworks will incur a flat fee of 10% for
                            domestic, 15% for international shipping. If you select pick up in-person, it's free.
                            Total at checkout excludes local customs duties, taxes, and import fees; your carrier may
                            collect these on delivery.{' '}
                        </p>
                    </div>

                    {/* Certificate of Authenticity */}
                    <div className="flex flex-col">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                            <ShieldCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="mb-2 text-base font-semibold text-slate-900">
                            Certificate of Authenticity included
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-600">
                            All artworks are authenticated by the Artium team. You will receive a certificate of
                            authenticity from the artist when you purchase a work through Artium.
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                <div className="mt-8 flex justify-center">
                    <Button
                        variant="outline"
                        className="rounded-full border-slate-300 px-8 py-2 text-slate-700 hover:bg-slate-50"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
