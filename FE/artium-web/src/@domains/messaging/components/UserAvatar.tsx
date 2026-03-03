import { User } from 'lucide-react'

type UserAvatarProps = {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  online?: boolean
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export const UserAvatar = ({ src, name, size = 'md', online = false }: UserAvatarProps) => {
  const getInitials = (name?: string | null) => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  const getColorFromName = (name?: string | null) => {
    if (!name) return 'bg-slate-400'
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500',
    ]
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full ${
          src ? 'overflow-hidden' : getColorFromName(name)
        }`}
      >
        {src ? (
          <img src={src} alt={name || 'User'} className="h-full w-full object-cover" />
        ) : name ? (
          <span className="font-semibold text-white">{getInitials(name)}</span>
        ) : (
          <User className={`${iconSizes[size]} text-white`} />
        )}
      </div>

      {online && (
        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
      )}
    </div>
  )
}
