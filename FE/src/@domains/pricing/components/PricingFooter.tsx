import React from 'react'

/**
 * PricingFooter - React component
 * @returns React element
 */
export const PricingFooter: React.FC = () => {
    return (
        // mb-[-96px] sm:mb-[-112px] pulls SiteFooter up so curve SVG sits on black bridge layer
        <section className="relative mb-[-96px] sm:mb-[-112px] w-full overflow-hidden bg-linear-to-b from-slate-900 via-slate-900 to-black pt-20 pb-0">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 via-transparent to-purple-900/20" />

            <div className="relative mx-auto max-w-4xl px-4 text-center pb-16">
                <h2 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                    You bring the vision, we
                    <br />
                    manage the details
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
                    Artium streamlines your entire workflow.
                    <br />
                    Save money and spend less time doing admin — we've got your back!
                </p>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <button className="rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700">
                        Start free trial
                    </button>
                    <span className="text-sm text-slate-400">
                        Try it now, cancel anytime
                    </span>
                </div>
            </div>

            {/* Bridge layer for the footer curve - creates black background behind the SVG curve */}
            <div className="h-24 w-full bg-black sm:h-28" />
        </section>
    )
}
