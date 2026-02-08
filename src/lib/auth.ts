import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth sign-ins, create a default workspace if user doesn't have one
      if (account?.provider && account.provider !== 'credentials' && user.id) {
        try {
          const existingMembership = await prisma.workspaceMember.findFirst({
            where: { userId: user.id },
          })

          if (!existingMembership) {
            // Create default workspace for OAuth user
            const workspaceName = user.name ? `${user.name}'s Workspace` : 'My Workspace'
            let workspaceSlug = workspaceName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
              .substring(0, 50) || 'my-workspace'

            // Ensure slug is unique
            const existingWorkspace = await prisma.workspace.findUnique({
              where: { slug: workspaceSlug },
            })
            if (existingWorkspace) {
              workspaceSlug = `${workspaceSlug}-${Date.now()}`
            }

            const workspace = await prisma.workspace.create({
              data: {
                name: workspaceName,
                slug: workspaceSlug,
                ownerId: user.id,
              },
            })

            await prisma.workspaceMember.create({
              data: {
                workspaceId: workspace.id,
                userId: user.id,
                role: 'owner',
              },
            })
          }
        } catch (error) {
          console.error('Error creating workspace for OAuth user:', error)
        }
      }
      return true
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
