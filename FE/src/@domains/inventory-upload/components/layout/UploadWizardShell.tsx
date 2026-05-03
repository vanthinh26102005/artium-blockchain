// react
import React from 'react'

// @domains - inventory upload
import { UploadStepHeader } from '@domains/inventory-upload/components/layout/UploadStepHeader'
import { UploadStickyFooter } from '@domains/inventory-upload/components/layout/UploadStickyFooter'

type UploadWizardShellProps = {
  title: string
  step: number
  totalSteps: number
  onCancel: () => void
  onPrev: () => void
  onNext: () => void
  isNextDisabled?: boolean
  children: React.ReactNode
}

/**
 * UploadWizardShell - React component
 * @returns React element
 */
export const UploadWizardShell = ({
  title,
  step,
  totalSteps,
  onCancel,
  onPrev,
  onNext,
  isNextDisabled = false,
  children,
}: UploadWizardShellProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDFDFD] text-[#191414]">
      <UploadStepHeader title={title} />
      <main className="w-full px-4 pt-[60px] pb-[70px] lg:px-8 lg:pt-[80px] lg:pb-[80px]">
        <div className="w-full">{children}</div>
      </main>
      <UploadStickyFooter
        step={step}
        totalSteps={totalSteps}
        onCancel={onCancel}
        onPrev={onPrev}
        onNext={onNext}
        isNextDisabled={isNextDisabled}
      />
    </div>
  )
}
