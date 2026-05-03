import { ArrowRight } from 'lucide-react'
import { Button } from '@shared/components/ui/button'

interface CustomWebsiteHeaderProps {
    username?: string
}

/**
 * CustomWebsiteHeader - React component
 * @returns React element
 */
export const CustomWebsiteHeader = ({ username = 'artiumartist' }: CustomWebsiteHeaderProps) => {
    return (
        <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Custom Website</h1>
                    <p className="text-slate-600 max-w-2xl text-base leading-relaxed">
                        Your personal webpage is already built—Artium has pre-filled it with your inventory, bio, and details.
                        All you need to do is choose your domain: either purchase a custom one through us or use a free Artium
                        subdomain like <span className="font-medium text-slate-800">{username}.artium.com</span>.
                        It's live in minutes with zero setup.
                    </p>
                </div>

                <Button
                    className="shrink-0 text-white font-semibold shadow-lg px-6 py-3 h-auto bg-linear-to-r from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600"
                >
                    Claim {username}.artium.com
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
