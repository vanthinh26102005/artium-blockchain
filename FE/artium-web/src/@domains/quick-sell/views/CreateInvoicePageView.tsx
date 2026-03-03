// next
import { FC } from 'react'

// quick-sell types
import type { Invoice } from '../types/invoice'

// quick-sell mock
import { mockEmptyInvoice } from '../mock/mockInvoice'

export type CreateInvoicePageViewProps = {
    artworkId?: string
}

export const CreateInvoicePageView: FC<CreateInvoicePageViewProps> = ({ artworkId }) => {
    // -- state --
    // TODO PR2: Add form state management with React Hook Form
    const invoice = mockEmptyInvoice

    // -- derived --

    // -- handlers --

    // -- render --
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="border-b border-slate-200 bg-white px-6 py-4">
                <h1 className="text-2xl font-semibold text-slate-900">Create Invoice</h1>
                <p className="mt-1 text-sm text-slate-600">
                    {artworkId ? `Pre-filling with artwork: ${artworkId}` : 'Create a new invoice or quote'}
                </p>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Left Column - Form */}
                    <div className="space-y-6">
                        {/* Buyer Information Placeholder */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">Buyer Information</h2>
                            <div className="space-y-4">
                                <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                                <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                                <div className="h-24 rounded border border-slate-300 bg-slate-50"></div>
                            </div>
                            <p className="mt-3 text-sm text-slate-500">Form inputs coming in PR2</p>
                        </div>

                        {/* Artwork/Items Placeholder */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">Items</h2>
                            <div className="space-y-4">
                                <div className="h-32 rounded border border-slate-300 bg-slate-50"></div>
                                <button className="h-10 w-full rounded border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-slate-400">
                                    + Add Item
                                </button>
                            </div>
                            <p className="mt-3 text-sm text-slate-500">Item picker coming in PR2</p>
                        </div>

                        {/* Tax & Shipping Placeholder */}
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">Tax & Shipping</h2>
                            <div className="space-y-4">
                                <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                                <div className="h-10 rounded border border-slate-300 bg-slate-50"></div>
                            </div>
                            <p className="mt-3 text-sm text-slate-500">Tax/shipping controls coming in PR2</p>
                        </div>
                    </div>

                    {/* Right Column - Preview */}
                    <div className="lg:sticky lg:top-8 lg:h-fit">
                        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-slate-900">Invoice Preview</h2>
                            <div className="space-y-4">
                                <div className="h-48 rounded border border-slate-300 bg-slate-50"></div>
                                <div className="h-24 rounded border border-slate-300 bg-slate-50"></div>
                                <div className="h-32 rounded border border-slate-300 bg-slate-50"></div>
                            </div>
                            <p className="mt-3 text-sm text-slate-500">Live preview coming in PR2</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 border-t border-slate-200 bg-white px-6 py-4">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                            Save Draft
                        </button>
                        <div className="flex gap-3">
                            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                Send to Buyer
                            </button>
                            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                                Take Payment (Quick Sell)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
