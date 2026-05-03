import { ExternalLink } from 'lucide-react'
import { Button } from '@shared/components/ui/button'

export interface TemplateCardProps {
    id: string
    name: string
    description: string
    previewImage: string
    isPro?: boolean
    isGrowth?: boolean
    demoUrl?: string
}

/**
 * TemplateCard - React component
 * @returns React element
 */
export const TemplateCard = ({
    name,
    description,
    previewImage,
    isPro,
    isGrowth,
    demoUrl = '#',
}: TemplateCardProps) => {
    return (
        <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-300">
            {/* Preview Image */}
            <div className="relative aspect-[589/337] overflow-hidden bg-slate-100">
                <img
                    src={previewImage}
                    alt={name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-3 right-3 flex gap-2">
                    {isPro && (
                        <span className="rounded-full bg-[#0066FF] px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            Pro
                        </span>
                    )}
                    {isGrowth && (
                        <span className="rounded-full bg-purple-500 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                            Growth
                        </span>
                    )}
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/20" />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{description}</p>

                <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-slate-200 hover:bg-slate-50"
                    onClick={() => window.open(demoUrl, '_blank')}
                >
                    View Demo
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
