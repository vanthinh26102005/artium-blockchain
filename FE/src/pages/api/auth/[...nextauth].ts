import NextAuth, { type AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

/**
 * googleClientId - Utility function
 * @returns void
 */
const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

export const authOptions = {
/**
 * googleClientSecret - Utility function
 * @returns void
 */
  providers: [
    GoogleProvider({
      clientId: googleClientId ?? '',
      clientSecret: googleClientSecret ?? '',
      authorization: {
/**
 * authOptions - Utility function
 * @returns void
 */
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token
      }

      return token
    },
    async session({ session, token }) {
      if (token.idToken) {
        session.idToken = token.idToken
      }

      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies AuthOptions

export default NextAuth(authOptions)
