import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type TurnstileChallengeProps = {
  action: string
  challengeKey: number
  onError?: () => void
  onTokenChange: (token: string | null) => void
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          action?: string
          callback: (token: string) => void
          'expired-callback': () => void
          'error-callback': () => void
        },
      ) => string
      remove: (widgetId: string) => void
    }
  }
}

const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export const TurnstileChallenge = ({
  action,
  challengeKey,
  onError,
  onTokenChange,
}: TurnstileChallengeProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onErrorRef = useRef(onError)
  const onTokenChangeRef = useRef(onTokenChange)
  const [isScriptReady, setIsScriptReady] = useState(false)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()

  useEffect(() => {
    onErrorRef.current = onError
    onTokenChangeRef.current = onTokenChange
  }, [onError, onTokenChange])

  useEffect(() => {
    onTokenChangeRef.current(null)

    if (!siteKey || !isScriptReady || !containerRef.current || !window.turnstile) {
      return
    }

    if (widgetIdRef.current) {
      window.turnstile.remove(widgetIdRef.current)
      widgetIdRef.current = null
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      callback: (token) => onTokenChangeRef.current(token),
      'expired-callback': () => onTokenChangeRef.current(null),
      'error-callback': () => {
        onTokenChangeRef.current(null)
        onErrorRef.current?.()
      },
    })

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [action, challengeKey, isScriptReady, siteKey])

  if (!siteKey) {
    return (
      <p className="border-auth-error/30 bg-auth-error/5 text-auth-error rounded-lg border px-3 py-2 text-sm font-medium">
        Verification is unavailable. Contact support before retrying.
      </p>
    )
  }

  return (
    <div className="flex min-h-[70px] justify-center">
      <Script
        src={TURNSTILE_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => setIsScriptReady(true)}
      />
      <div key={challengeKey} ref={containerRef} />
    </div>
  )
}
