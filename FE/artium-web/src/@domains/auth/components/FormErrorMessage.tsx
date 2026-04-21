// third-party
import { AlertCircle } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

type FormErrorMessageProps = {
  id?: string
  message: string
  visible?: boolean
}

export const FormErrorMessage = ({ id, message, visible = true }: FormErrorMessageProps) => {
  // -- render --
  return (
    <div
      id={id}
      className={cn(
        'flex min-h-5.5 items-center gap-2 text-sm font-semibold text-[#FF4337]',
        !visible && 'opacity-0',
      )}
      aria-live="polite"
    >
      <AlertCircle className="h-5 w-5" />
      <span>{visible ? message : ''}</span>
    </div>
  )
}
