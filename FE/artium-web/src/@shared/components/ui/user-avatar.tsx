// @shared - components
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar'

// @shared - utils
import { cn } from '@shared/lib/utils'

type UserAvatarSize = 'sm' | 'md' | 'lg'

export type UserAvatarProps = {
  src?: string | null
  name?: string | null
  size?: UserAvatarSize
  online?: boolean
  className?: string
}

const sizeClasses: Record<UserAvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const onlineDotClasses: Record<UserAvatarSize, string> = {
  sm: 'h-2.5 w-2.5',
  md: 'h-3 w-3',
  lg: 'h-3.5 w-3.5',
}

const fallbackColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-red-500',
  'bg-orange-500',
]

function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function getColorFromName(name?: string | null): string {
  if (!name) return 'bg-slate-400'
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return fallbackColors[hash % fallbackColors.length]
}

export const UserAvatar = ({ src, name, size = 'md', online = false, className }: UserAvatarProps) => {
  return (
    <div className="relative inline-flex shrink-0">
      <Avatar className={cn(sizeClasses[size], className)}>
        {src ? <AvatarImage src={src} alt={name ?? 'User'} /> : null}
        <AvatarFallback className={cn('font-semibold text-white', getColorFromName(name))}>
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {online ? (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white bg-green-500',
            onlineDotClasses[size],
          )}
        />
      ) : null}
    </div>
  )
}
