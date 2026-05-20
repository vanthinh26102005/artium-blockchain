// third-party
import { AlertTriangle, ArrowLeft, CheckCircle2, ShieldCheck, Trash2, Wallet } from 'lucide-react'

// @shared - ui
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'

// @domains - auth
import { WalletLoginPanel } from '@domains/auth/components'
import type { WalletLinkStatus } from '@domains/auth/hooks/useWalletLink'

type WalletDialogView = 'manage' | 'connect' | 'remove'

type ProfileWalletManagerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  view: WalletDialogView
  onViewChange: (view: WalletDialogView) => void
  currentWalletAddress: string | null
  canRemoveWallet: boolean
  walletError: string | null
  isLoading: boolean
  isWrongNetwork: boolean
  buttonLabel: string
  shortenedAddress: string | null
  status: WalletLinkStatus
  targetChainName: string
  onConnectWallet: () => void
  onSwitchNetwork: () => void
  onRemoveWallet: () => void
}

const shortenAddress = (address: string | null) =>
  address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null

export type { WalletDialogView }

export const ProfileWalletManagerDialog = ({
  open,
  onOpenChange,
  view,
  onViewChange,
  currentWalletAddress,
  canRemoveWallet,
  walletError,
  isLoading,
  isWrongNetwork,
  buttonLabel,
  shortenedAddress,
  status,
  targetChainName,
  onConnectWallet,
  onSwitchNetwork,
  onRemoveWallet,
}: ProfileWalletManagerDialogProps) => {
  const currentShortAddress = shortenAddress(currentWalletAddress)
  const hasWallet = Boolean(currentWalletAddress)
  const title =
    view === 'connect' ? (hasWallet ? 'Change wallet' : 'Add wallet') : view === 'remove' ? 'Remove wallet?' : 'Manage wallet'
  const description =
    view === 'connect'
      ? 'Sign with MetaMask to bind the selected wallet to this account.'
      : view === 'remove'
        ? 'Removing this wallet turns off wallet login until another wallet is connected.'
        : 'Control the wallet attached to your Artium account.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="lg"
        closeButtonClassName="top-6 right-6 h-10 w-10 border border-black/10 bg-white text-[#6f6a67] hover:bg-[#f7f5f2] hover:text-[#191414] focus:ring-black/20 sm:top-7 sm:right-7"
        className="max-h-[90vh] max-w-[520px] overflow-y-auto rounded-2xl bg-white p-6 text-black shadow-[0_30px_90px_rgba(0,0,0,0.28)] sm:p-7"
      >
        <DialogHeader className="mb-6 !px-0 pr-14 text-left sm:mb-7">
          <DialogTitle className="text-left text-[22px] leading-[1.15] font-bold text-[#191414] sm:text-2xl">
            {title}
          </DialogTitle>
          <p className="max-w-[390px] text-left text-sm leading-6 font-medium text-[#6f6a67]">
            {description}
          </p>
        </DialogHeader>

        {view === 'manage' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-black/10 bg-[#fbfaf9] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white">
                  <Wallet className="h-5 w-5 text-[#191414]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold tracking-[0.14em] text-[#8d8784] uppercase">
                    Current wallet
                  </p>
                  <p className="mt-1 break-all text-sm font-bold text-[#191414]">
                    {currentWalletAddress ?? 'No wallet connected'}
                  </p>
                  <p className="mt-2 text-xs leading-5 font-medium text-[#6f6a67]">
                    {hasWallet
                      ? 'This wallet can be used to log in and to continue bidding flows from this account.'
                      : 'Connect a wallet after account registration to enable wallet login and auction bidding.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <p className="text-sm leading-6 font-medium text-emerald-900">
                  Wallets stay attached to one account. Changing your wallet replaces the wallet
                  login address for this account.
                </p>
              </div>
            </div>

            {!canRemoveWallet && hasWallet ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-sm leading-6 font-medium text-amber-900">
                    Add or verify an email/social login before removing this wallet so the account
                    remains recoverable.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onViewChange('connect')}
                disabled={isLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#191414] px-4 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Wallet className="h-4 w-4" />
                {hasWallet ? 'Change Wallet' : 'Add Wallet'}
              </button>
              <button
                type="button"
                onClick={() => onViewChange('remove')}
                disabled={!hasWallet || isLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 text-sm font-bold text-[#191414] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove Wallet
              </button>
            </div>
          </div>
        ) : null}

        {view === 'connect' ? (
          <div className="space-y-4">
            {hasWallet ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-sm leading-6 font-medium text-amber-900">
                    Signing with a different MetaMask account will replace {currentShortAddress} as
                    your wallet login address.
                  </p>
                </div>
              </div>
            ) : null}
            <WalletLoginPanel
              buttonLabel={buttonLabel}
              isLoading={isLoading}
              isWrongNetwork={isWrongNetwork}
              onLogin={onConnectWallet}
              onSwitchNetwork={onSwitchNetwork}
              shortenedAddress={shortenedAddress}
              status={status}
              targetChainName={targetChainName}
            />
            {walletError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {walletError}
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => onViewChange('manage')}
              disabled={isLoading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-black/10 text-sm font-bold text-[#191414] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to wallet settings
            </button>
          </div>
        ) : null}

        {view === 'remove' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-rose-950">
                    Confirm before disconnecting this wallet.
                  </p>
                  <p className="mt-2 break-all text-sm leading-6 font-medium text-rose-900">
                    {currentWalletAddress ?? 'No wallet connected'}
                  </p>
                </div>
              </div>
            </div>

            {canRemoveWallet ? (
              <div className="rounded-xl border border-black/10 bg-[#fbfaf9] p-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1f7a43]" />
                  <p className="text-sm leading-6 font-medium text-[#191414]">
                    Your email or social login remains available after this wallet is removed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-sm leading-6 font-medium text-amber-900">
                    Removing is blocked until the account has another verified sign-in method.
                  </p>
                </div>
              </div>
            )}

            {walletError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {walletError}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onViewChange('manage')}
                disabled={isLoading}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-bold text-[#191414] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep Wallet
              </button>
              <button
                type="button"
                onClick={onRemoveWallet}
                disabled={!canRemoveWallet || !hasWallet || isLoading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove Wallet
              </button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
