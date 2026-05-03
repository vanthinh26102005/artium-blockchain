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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Custom Website</h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600">
            Your personal webpage is already built—Artium has pre-filled it with your inventory,
            bio, and details. All you need to do is choose your domain: either purchase a custom one
            through us or use a free Artium subdomain like{' '}
            <span className="font-medium text-slate-800">{username}.artium.com</span>. It's live in
            minutes with zero setup.
          </p>
        </div>

        <Button className="bg-linear-to-r h-auto shrink-0 from-rose-500 via-pink-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg hover:from-rose-600 hover:via-pink-600 hover:to-purple-600">
          Claim {username}.artium.com
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
