import { AlertCircle } from 'lucide-react'

import { cn } from '@shared/lib/utils'

type FormErrorMessageProps = {
  id?: string
  message: string
  visible?: boolean
}

export const FormErrorMessage = ({ id, message, visible = true }: FormErrorMessageProps) => {
  return (
    <div
      id={id}
      className={cn(
        'flex min-h-5.5 items-center gap-2 text-sm font-semibold text-auth-error',
        !visible && 'opacity-0',
      )}
      aria-live="polite"
    >
      <AlertCircle className="h-5 w-5" />
      <span>{visible ? message : ''}</span>
    </div>
  )
}
