import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shared/components/ui/tooltip'
import { cn } from '@shared/lib/utils'

type CopyState = 'idle' | 'copied' | 'error'

export type CopyValueFieldProps = {
  label: string
  value?: string | null
  displayValue?: string
  emptyLabel?: string
  className?: string
}

const copyText = async (value: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is not available.')
  }

  const input = document.createElement('textarea')
  input.value = value
  input.setAttribute('readonly', '')
  input.style.position = 'absolute'
  input.style.left = '-9999px'
  document.body.appendChild(input)
  input.select()

  try {
    const succeeded = document.execCommand('copy')
    if (!succeeded) {
      throw new Error('Copy command failed.')
    }
  } finally {
    document.body.removeChild(input)
  }
}

export const CopyValueField = ({
  label,
  value,
  displayValue,
  emptyLabel = 'Not available',
  className,
}: CopyValueFieldProps) => {
  const resetTimerRef = useRef<number | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const scheduleReset = () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = window.setTimeout(() => {
      setCopyState('idle')
      resetTimerRef.current = null
    }, 1500)
  }

  const handleCopy = async () => {
    if (!value) {
      return
    }

    try {
      await copyText(value)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    } finally {
      scheduleReset()
    }
  }

  const tooltipLabel =
    copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy'

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>

      {value ? (
        <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="min-w-0 flex-1 break-all font-mono text-[13px] text-slate-900">
            {displayValue ?? value}
          </p>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full text-slate-500 hover:bg-white hover:text-slate-900"
                  onClick={() => void handleCopy()}
                  aria-label={`Copy ${label}`}
                >
                  {copyState === 'copied' ? (
                    <Check className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border-slate-200 bg-white text-xs text-slate-700">
                {tooltipLabel}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
          {emptyLabel}
        </p>
      )}
    </div>
  )
}
