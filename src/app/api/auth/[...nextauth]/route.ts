// ./src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: 'database'
  },
  callbacks: {
    async session({ session, user }) {
      // Fix rapid: verificăm existența și returnăm o nouă sesiune cu id-ul injectat
      if (user && session?.user) {
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
          },
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to home page after successful login
      return baseUrl
    }
  },
  pages: {
    signIn: '/login'
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
