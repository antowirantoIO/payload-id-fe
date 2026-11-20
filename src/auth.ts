import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { loginResultSchema, loginSchema } from '@/lib/api/contracts'
import { iamRequest } from '@/lib/api/server'
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 },
  providers: [
    Credentials({
      credentials: { email: {}, password: { type: 'password' } },
      async authorize(credentials) {
        const input = loginSchema.safeParse(credentials)
        if (!input.success) return null
        const response = await iamRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify(input.data),
        })
        if (!response.ok) return null
        const body = await response.json()
        const result = loginResultSchema.parse(body.data)
        // Never create a session from IAM's unauthenticated 2FA challenge response.
        if (result.requires_two_factor || !result.access_token || !result.expires_in) return null
        return {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          backendToken: result.access_token,
          backendExpires: Date.now() + result.expires_in * 1000,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken
        token.backendExpires = user.backendExpires
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub ?? ''
      session.error =
        !token.backendExpires || Date.now() >= token.backendExpires ? 'SessionExpired' : undefined
      // Bearer tokens remain in the encrypted HTTP-only cookie, never in client session JSON.
      return session
    },
  },
})
