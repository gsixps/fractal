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
      // On first sign in, add custom fields to the token
      if (user) {
        token.userId = user.id
        token.role = user.role
        token.kycStatus = user.kycStatus
      }
      return token
    },
    async session({ session, token }) {
      // Forward custom fields from token to session
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

// Seed superadmin if none exists
export async function seedSuperAdmin() {
  try {
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@gsp.cl' },
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('GSP@admin2024', 12)
      await db.user.create({
        data: {
          email: 'admin@gsp.cl',
          passwordHash: hashedPassword,
          name: 'GSP Superadmin',
          role: 'superadmin',
          kycStatus: 'verified',
          isActive: true,
          preferredLanguage: 'es',
        },
      })
      console.log('✅ Superadmin seeded: admin@gsp.cl / GSP@admin2024')
    } else if (existingAdmin.role !== 'superadmin' || !existingAdmin.passwordHash) {
      const hashedPassword = existingAdmin.passwordHash || await bcrypt.hash('GSP@admin2024', 12)
      await db.user.update({
        where: { email: 'admin@gsp.cl' },
        data: { role: 'superadmin', kycStatus: 'verified', passwordHash: hashedPassword },
      })
      console.log('✅ Existing admin user promoted to superadmin')
    }
  } catch {
    // Ignore race condition errors during hot reload
  }
}

// Run seed on module load
seedSuperAdmin().catch(() => {})
