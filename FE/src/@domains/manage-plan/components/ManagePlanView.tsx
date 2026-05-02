import {
    ArrowRight,
    HelpCircle,
    LayoutGrid,
    Presentation,
    Settings,
    Truck,
} from 'lucide-react'

export const ManagePlanView = () => {
    return (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Manage Your Plan</h1>
                <p className="mt-2 text-slate-600">
                    Manage your subscription and explore the benefits of upgrading.
                </p>
            </div>

            {/* Current Plan Banner */}
            <div className="flex flex-col items-start justify-between space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-8 md:flex-row md:items-center md:space-y-0">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">You are on the Free Plan!</h2>
                    <p className="mt-1 max-w-2xl text-slate-600">
                        Enjoy the core tools to manage your art. Unlock more with Pro to grow your audience and
                        sales.
                    </p>
                    <button className="mt-3 flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                        See all plans here <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
                <button className="shrink-0 cursor-pointer rounded-full bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
                    Try Pro free for 14 days
                </button>
            </div>

            {/* Credits Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300">
                    <h3 className="mb-4 font-bold text-slate-900">Email Credits</h3>
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        Available Credits <HelpCircle className="inline h-3 w-3 text-slate-400" />
                    </p>
                    <p className="mb-2 font-semibold text-slate-900">
                        10 (10 subscription credits + 0 paid credits)
                    </p>
                    <button className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                        Get more email credits <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300">
                    <h3 className="mb-4 font-bold text-slate-900">Marketplace Visibility Listings</h3>
                    <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 uppercase">
                        Available Slots <HelpCircle className="inline h-3 w-3 text-slate-400" />
                    </p>
                    <p className="mb-2 font-semibold text-slate-900">0/0</p>
                    <button className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                        Get more visibility slots <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            </div>

            {/* Add-ons & Services */}
            <div>
                <h2 className="mb-1 text-lg font-bold text-slate-900">Setup add-ons & support services</h2>
                <p className="mb-8 text-slate-600">Included with your plan or purchased separately.</p>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Item 1 */}
                    <div>
                        <div className="mb-4 h-10 w-10 text-slate-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Artwork Migration</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">$50 one-time</p>
                        <button className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                            Purchase Migration <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                    {/* Item 2 */}
                    <div>
                        <div className="mb-4 h-10 w-10 text-slate-600">
                            <Settings className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Contact Migration</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">$50 one-time</p>
                        <button className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                            Purchase Migration <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                    {/* Item 3 */}
                    <div>
                        <div className="mb-4 h-10 w-10 text-slate-600">
                            <Presentation className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Product Training</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">$50 / hour</p>
                        <button className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                            Purchase Training <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                    {/* Item 4 */}
                    <div>
                        <div className="mb-4 h-10 w-10 text-slate-600">
                            <LayoutGrid className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Website Setup</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">$200 one-time</p>
                        <button className="mt-2 flex cursor-pointer items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
                            Purchase Addon <ArrowRight className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Usage & Limits */}
            <div className="border-t border-slate-200 pt-8">
                <h2 className="mb-1 text-lg font-bold text-slate-900">Usage & limits</h2>
                <p className="text-slate-600">Track your current plan usage and see what is included.</p>
            </div>
        </div>
    )
}
