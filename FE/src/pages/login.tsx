// @shared - layout
import { AuthLayout } from '@shared/components/layout/AuthLayout'

// @shared - types
import type { NextPageWithLayout } from '@shared/types/next'

// @domains - auth
import { LoginPage } from '@domains/auth/views/LoginPage'

const LoginRoute: NextPageWithLayout = () => {
  // -- state --

  // -- derived --

  // -- handlers --

  // -- render --
  return <LoginPage />
}

LoginRoute.getLayout = (page) => <AuthLayout>{page}</AuthLayout>

export default LoginRoute
