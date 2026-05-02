import { Dialog, DialogContent } from '@shared/components/ui/dialog'
import { Check } from 'lucide-react'

interface Plan {
    name: string
    description: string
    price: string
    billing: string
    features: string[]
    recommended?: boolean
    buttonText: string
}

const plans: Plan[] = [
    {
        name: 'Basic',
        description: 'For hobbyists and new collectors.',
        price: 'Free',
        billing: 'Free Forever',
        features: ['Up to 50 artworks'],
        buttonText: 'Current Plan',
    },
    {
        name: 'Pro',
        description: 'For emerging artists and serious collectors.',
        price: 'US$ 19',
        billing: 'Billed monthly',
        features: ['Up to 200 artworks'],
        buttonText: 'Subscribe now',
    },
    {
        name: 'Growth',
        description: 'For growing galleries and studios.',
        price: 'US$ 49',
        billing: 'Billed monthly',
        features: ['Up to 500 artworks'],
        recommended: true,
        buttonText: 'Subscribe now',
    },
    {
        name: 'Premier',
        description: 'For established institutions.',
        price: 'US$ 99',
        billing: 'Billed monthly',
        features: ['Unlimited artworks'],
        buttonText: 'Subscribe now',
    },
]

interface PlanUpgradeModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export const PlanUpgradeModal = ({ isOpen, onOpenChange }: PlanUpgradeModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent size="5xl" className="w-[95vw] bg-white p-6 sm:p-10 rounded-3xl !max-h-[90vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-3xl border p-6 transition-all ${plan.recommended
                                ? 'border-blue-600 shadow-lg ring-1 ring-blue-600'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-bold text-white shadow-sm">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-4 text-center">
                                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                <p className="mt-2 text-sm text-slate-500 h-10 leading-snug">{plan.description}</p>
                            </div>

                            <div className="mb-6 text-center">
                                {plan.price === 'Free' ? (
                                    <div className="h-[52px] flex items-center justify-center">
                                        <span className="text-4xl font-bold text-slate-900">Free</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-sm font-bold text-slate-500">US$</span>
                                            <span className="text-4xl font-bold text-slate-900">{plan.price.replace('US$ ', '')}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-500">/month</span>
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-slate-400">{plan.billing}</p>
                            </div>

                            <ul className="mb-8 flex-1 space-y-3">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center justify-center gap-2 text-sm text-slate-600">
                                        <Check className="h-4 w-4 text-blue-600 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full rounded-full py-2.5 text-sm font-semibold transition-colors cursor-pointer ${plan.name === 'Basic'
                                        ? 'bg-transparent text-slate-900 pointer-events-none cursor-default'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                    }`}
                            >
                                {plan.name === 'Basic' ? '' : plan.buttonText}
                            </button>

                            {plan.name !== 'Basic' && (
                                <button className="mt-3 w-full text-xs font-medium text-blue-600 hover:underline cursor-pointer">
                                    Start Free Trial
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
