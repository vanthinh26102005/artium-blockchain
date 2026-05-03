// @shared - layout
import { AuthLayout } from '@shared/components/layout/AuthLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { ForgotPasswordPage } from '@domains/auth/views/ForgotPasswordPage'

/**
 * ForgotPasswordRoute - React component
 * @returns React element
 */
const ForgotPasswordRoute: NextPageWithLayout = () => {
  // -- state --

  // -- derived --

  // -- handlers --

  // -- render --
  return <ForgotPasswordPage />
}

ForgotPasswordRoute.getLayout = (page) => <AuthLayout>{page}</AuthLayout>

export default ForgotPasswordRoute
