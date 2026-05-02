// @shared - layout
import { AuthLayout } from '@shared/components/layout/AuthLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { SignUpPage } from '@domains/auth/views/SignUpPage'

const SignUpRoute: NextPageWithLayout = () => {
  // -- state --

  // -- derived --

  // -- handlers --

  // -- render --
  return <SignUpPage />
}

SignUpRoute.getLayout = (page) => <AuthLayout>{page}</AuthLayout>

export default SignUpRoute
