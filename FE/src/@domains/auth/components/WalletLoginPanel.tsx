// third-party
import { AlertTriangle, CheckCircle2, Circle, Loader2, Wallet, Wifi } from 'lucide-react'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - auth
import type { WalletLoginStatus } from '@domains/auth/hooks/useWalletLogin'

type WalletLoginPanelProps = {
  buttonLabel: string
  isLoading: boolean
  isWrongNetwork: boolean
  onLogin: () => void
  onSwitchNetwork: () => void
  shortenedAddress: string | null
  status: WalletLoginStatus
  targetChainName: string
}

type StepState = 'idle' | 'active' | 'complete' | 'warning'

type WalletStep = {
  label: string
  state: StepState
}

/**
 * getWalletSteps - Utility function
 * @returns void
 */
const getWalletSteps = ({
  isWrongNetwork,
  shortenedAddress,
  status,
}: {
  isWrongNetwork: boolean
  shortenedAddress: string | null
  status: WalletLoginStatus
}): WalletStep[] => {
  const hasWallet = Boolean(shortenedAddress)
  const hasSigned = status === 'logging_in' || status === 'authenticated'

/**
 * hasWallet - Utility function
 * @returns void
 */
  return [
    {
      label: 'Connect wallet',
      state: status === 'connecting' ? 'active' : hasWallet ? 'complete' : 'idle',
/**
 * hasSigned - Utility function
 * @returns void
 */
    },
    {
      label: 'Sepolia network',
      state: isWrongNetwork
        ? 'warning'
        : status === 'switching_network'
          ? 'active'
          : hasWallet
            ? 'complete'
            : 'idle',
    },
    {
      label: 'Sign message',
      state:
        status === 'requesting_nonce' || status === 'signing'
          ? 'active'
          : hasSigned
            ? 'complete'
            : 'idle',
    },
    {
      label: 'Create session',
      state:
        status === 'logging_in'
          ? 'active'
          : status === 'authenticated'
            ? 'complete'
            : 'idle',
    },
  ]
}

const WalletStepIcon = ({ state }: { state: StepState }) => {
  if (state === 'complete') {
    return <CheckCircle2 className="h-4 w-4 text-[#1f7a43]" />
  }

  if (state === 'active') {
    return <Loader2 className="h-4 w-4 animate-spin text-[#191414]" />
  }

/**
 * WalletStepIcon - React component
 * @returns React element
 */
  if (state === 'warning') {
    return <AlertTriangle className="h-4 w-4 text-[#9a3412]" />
  }

  return <Circle className="h-4 w-4 text-[#b8b4b1]" />
}

export const WalletLoginPanel = ({
  buttonLabel,
  isLoading,
  isWrongNetwork,
  onLogin,
  onSwitchNetwork,
  shortenedAddress,
  status,
  targetChainName,
}: WalletLoginPanelProps) => {
  const steps = getWalletSteps({ isWrongNetwork, shortenedAddress, status })
  const shouldShowSwitchButton = isWrongNetwork && status !== 'switching_network'
/**
 * WalletLoginPanel - React component
 * @returns React element
 */
  const networkLabel = isWrongNetwork ? 'Required' : targetChainName

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={onLogin}
        disabled={isLoading}
        className="flex h-[54px] w-full items-center justify-center gap-3 rounded-lg border border-[#191414] bg-[#191414] px-5 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:border-black/30 disabled:bg-[#191414]/70"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        ) : (
/**
 * steps - Utility function
 * @returns void
 */
          <Wallet className="h-5 w-5 text-white" />
        )}
        <span>{buttonLabel}</span>
      </button>
/**
 * shouldShowSwitchButton - Utility function
 * @returns void
 */

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex min-h-[72px] items-center gap-3 rounded-lg border border-black/10 bg-white px-4 py-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7f5f2]">
/**
 * networkLabel - Utility function
 * @returns void
 */
            <Wallet className="h-5 w-5 text-[#191414]" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold tracking-[0.14em] text-[#8d8784] uppercase">
              Wallet
            </span>
            <span className="block truncate text-sm font-bold text-[#191414]">
              {shortenedAddress ?? 'Not connected'}
            </span>
          </span>
        </div>

        <div
          className={cn(
            'flex min-h-[72px] items-center gap-3 rounded-lg border px-4 py-3',
            isWrongNetwork
              ? 'border-[#f4c36d] bg-[#fff8ed]'
              : 'border-black/10 bg-white',
          )}
        >
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              isWrongNetwork ? 'bg-[#fff1d6]' : 'bg-[#f7f5f2]',
            )}
          >
            {isWrongNetwork ? (
              <AlertTriangle className="h-5 w-5 text-[#9a3412]" />
            ) : (
              <Wifi className="h-5 w-5 text-[#191414]" />
            )}
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold tracking-[0.14em] text-[#8d8784] uppercase">
              Network
            </span>
            <span
              className={cn(
                'block truncate text-sm font-bold',
                isWrongNetwork ? 'text-[#9a3412]' : 'text-[#191414]',
              )}
            >
              {networkLabel}
            </span>
          </span>
        </div>
      </div>

      {shouldShowSwitchButton ? (
        <div className="flex flex-col gap-3 rounded-lg border border-[#f4c36d] bg-[#fff8ed] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-bold text-[#191414]">Sepolia required</p>
            <p className="text-xs font-semibold text-[#8a5a17]">
              Wallet {shortenedAddress ?? 'connected'} needs the right network.
            </p>
          </div>
          <button
            type="button"
            onClick={onSwitchNetwork}
            disabled={isLoading}
            className="h-10 shrink-0 rounded-lg bg-[#191414] px-4 text-xs font-bold tracking-[0.12em] text-white uppercase transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            Switch to {targetChainName}
          </button>
        </div>
      ) : null}

      <ol className="space-y-2 rounded-lg border border-black/10 bg-[#fbfaf9] p-2">
        {steps.map((step) => (
          <li
            key={step.label}
            className={cn(
              'flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 text-sm font-bold transition-colors',
              step.state === 'complete'
                ? 'bg-[#f1faf4] text-[#1f7a43]'
                : step.state === 'active'
                  ? 'bg-white text-[#191414] shadow-[0_1px_0_rgba(25,20,20,0.06)]'
                  : step.state === 'warning'
                    ? 'bg-[#fff3df] text-[#9a3412]'
                    : 'text-[#8d8784]',
            )}
          >
            <span className="flex min-w-0 items-center gap-3">
              <WalletStepIcon state={step.state} />
              <span className="truncate">{step.label}</span>
            </span>
            {step.state === 'active' ? (
              <span className="text-xs font-semibold text-[#6f6a67]">In progress</span>
            ) : step.state === 'complete' ? (
              <span className="text-xs font-semibold text-[#1f7a43]">Done</span>
            ) : step.state === 'warning' ? (
              <span className="text-xs font-semibold text-[#9a3412]">Action needed</span>
            ) : null}
          </li>
        ))}
      </ol>

      {status === 'switching_network' ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-black/10" aria-hidden="true">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#191414]" />
        </div>
      ) : null}
    </section>
  )
}
