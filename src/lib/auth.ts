import type { NextAuthOptions, User as NextAuthUser, Session, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      role: string
      kycStatus: string
    } & DefaultSession['user']
  }

  interface User extends NextAuthUser {
    role?: string
    kycStatus?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    role?: string
    kycStatus?: string
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        if (!user.isActive) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!isValid) {
          return null
        }

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          kycStatus: user.kycStatus,
          avatarUrl: user.avatarUrl,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.role = user.role
        token.kycStatus = user.kycStatus
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId || ''
        session.user.role = token.role || 'investor'
        session.user.kycStatus = token.kycStatus || 'pending'
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}
