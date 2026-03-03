// @shared - layout
import { AuthLayout } from '@shared/components/layout/AuthLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { ResetPasswordPage } from '@domains/auth/views/ResetPasswordPage'

const ResetPasswordRoute: NextPageWithLayout = () => {
  // -- state --

  // -- derived --

  // -- handlers --

  // -- render --
  return <ResetPasswordPage />
}

ResetPasswordRoute.getLayout = (page) => <AuthLayout>{page}</AuthLayout>

export default ResetPasswordRoute
