'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components'
import { Slottable } from '@radix-ui/react-slot'
import { Loader2 } from 'lucide-react'

import { cn } from '@shared/lib/utils'
import { buttonVariants } from '@shared/components/ui/button'

interface ButtonProps extends AriaButtonProps, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = ({
  className,
  loading = false,
  children,
  isDisabled,
  variant,
  size,
  ...props
}: ButtonProps) => {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        cn(
          buttonVariants({
            variant,
            size,
            className,
          }),
        ),
      )}
      isDisabled={loading || isDisabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
      {/* @ts-ignore */}
      <Slottable>{children}</Slottable>
    </AriaButton>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
