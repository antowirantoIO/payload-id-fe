import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    backendToken?: string
    backendExpires?: number
  }
  interface Session {
    error?: 'SessionExpired'
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    backendToken?: string
    backendExpires?: number
  }
}
