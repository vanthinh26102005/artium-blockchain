// https://21st.dev/jolbol1/file-trigger

import { useState } from 'react'
import { FileTrigger } from 'react-aria-components'
import type { ButtonProps } from '@shared/components/ui/aria-button'
import { Button } from '@shared/components/ui/aria-button'

type FileTriggerButtonProps = ButtonProps & {
  onSelect?: (files: File[]) => any
  acceptedFileTypes?: string[]
}

/**
 * FileTriggerButton - React component
 * @returns React element
 */
export const FileTriggerButton = ({
  onSelect,
  acceptedFileTypes,
  ...btnProps
}: FileTriggerButtonProps) => {
  const [loading, setLoading] = useState(false)

  return (
    <FileTrigger
      onSelect={async (e) => {
        if (!e) return
        setLoading(true)
        const files = Array.from(e)
        try {
          await onSelect?.(files)
          /**
           * files - Utility function
           * @returns void
           */
          // eslint-disable-next-line no-empty
        } catch (error) {}
        setLoading(false)
      }}
      acceptedFileTypes={acceptedFileTypes}
    >
      <Button {...btnProps} loading={loading} />
    </FileTrigger>
  )
}
