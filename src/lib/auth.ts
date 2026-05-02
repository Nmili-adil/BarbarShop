import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (!parsed.success) return null

        const barber = await prisma.barber.findFirst({
          where: { email: parsed.data.email },
          include: { shop: true },
        })

        if (!barber) return null

        // In production you'd store a hashed password on the barber model.
        // For the MVP we store password on a separate Account table via a simple hash check.
        // We use a workaround: store hash in barber.phone temporarily prefixed with 'hash:'
        let storedHash = null
        if (barber.phone?.startsWith('hash:')) {
          storedHash = barber.phone.replace('hash:', '')
        }

        if (!storedHash) return null

        const valid = await bcrypt.compare(parsed.data.password, storedHash)
        if (!valid) return null

        return {
          id: barber.id,
          name: barber.name,
          email: barber.email,
          shopId: barber.shopId,
          role: barber.role,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.shopId = (user as { shopId?: string }).shopId
        token.role = (user as { role?: string }).role
        token.userId = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { shopId?: string }).shopId = token.shopId as string
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { id?: string }).id = token.userId as string
      }
      return session
    },
  },
})
