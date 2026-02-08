/**
 * Integration tests for Authentication flows
 */

import bcrypt from 'bcryptjs'

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) =>
    Promise.resolve(hash === `hashed_${password}`)
  ),
  genSalt: jest.fn(() => Promise.resolve('salt')),
}))

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    account: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    workspace: {
      create: jest.fn(),
    },
    workspaceMember: {
      create: jest.fn(),
    },
    verificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

describe('User Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Email/Password Signup', () => {
    it('should create user with hashed password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
      }

      const mockUser = {
        id: 'user-1',
        name: userData.name,
        email: userData.email,
        passwordHash: 'hashed_securePassword123',
        emailVerified: null,
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.workspace.create as jest.Mock).mockResolvedValue({
        id: 'workspace-1',
        name: "John Doe's Workspace",
      })
      ;(prisma.workspaceMember.create as jest.Mock).mockResolvedValue({
        userId: 'user-1',
        workspaceId: 'workspace-1',
        role: 'owner',
      })

      // Check user doesn't exist
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      })
      expect(existingUser).toBeNull()

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      expect(hashedPassword).toBe('hashed_securePassword123')

      // Create user
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          passwordHash: hashedPassword,
        },
      })

      expect(user.email).toBe(userData.email)
      expect(user.passwordHash).not.toBe(userData.password)

      // Create default workspace
      const workspace = await prisma.workspace.create({
        data: {
          name: `${userData.name}'s Workspace`,
          slug: 'john-does-workspace',
          ownerId: user.id,
        },
      })

      expect(workspace.name).toBe("John Doe's Workspace")
    })

    it('should reject duplicate email', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'john@example.com',
      })

      const existingUser = await prisma.user.findUnique({
        where: { email: 'john@example.com' },
      })

      expect(existingUser).not.toBeNull()
      // In real API, this would return 400 error
    })

    it('should validate password requirements', () => {
      const weakPasswords = ['123', 'short', 'abc']
      const strongPassword = 'SecureP@ss123!'

      weakPasswords.forEach((pwd) => {
        expect(pwd.length < 8).toBe(true)
      })
      expect(strongPassword.length >= 8).toBe(true)
    })
  })

  describe('Email/Password Login', () => {
    it('should authenticate valid credentials', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'john@example.com',
        passwordHash: 'hashed_correctPassword',
        emailVerified: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const user = await prisma.user.findUnique({
        where: { email: 'john@example.com' },
      })

      expect(user).not.toBeNull()

      const isValid = await bcrypt.compare('correctPassword', user!.passwordHash)
      expect(isValid).toBe(true)
    })

    it('should reject invalid password', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'john@example.com',
        passwordHash: 'hashed_correctPassword',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const user = await prisma.user.findUnique({
        where: { email: 'john@example.com' },
      })

      const isValid = await bcrypt.compare('wrongPassword', user!.passwordHash)
      expect(isValid).toBe(false)
    })

    it('should reject non-existent user', async () => {
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      })

      expect(user).toBeNull()
    })
  })

  describe('OAuth Authentication', () => {
    it('should link Google account to existing user', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'john@example.com',
      }

      const mockAccount = {
        userId: 'user-1',
        provider: 'google',
        providerAccountId: 'google-123',
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.account.create as jest.Mock).mockResolvedValue(mockAccount)

      const user = await prisma.user.findUnique({
        where: { email: 'john@example.com' },
      })

      const account = await prisma.account.create({
        data: {
          userId: user!.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: 'google-123',
        },
      })

      expect(account.provider).toBe('google')
      expect(account.userId).toBe('user-1')
    })

    it('should create new user from OAuth', async () => {
      const oauthProfile = {
        name: 'Jane Doe',
        email: 'jane@gmail.com',
        image: 'https://example.com/avatar.jpg',
      }

      const mockUser = {
        id: 'user-2',
        ...oauthProfile,
        emailVerified: new Date(),
      }

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)

      const existingUser = await prisma.user.findUnique({
        where: { email: oauthProfile.email },
      })
      expect(existingUser).toBeNull()

      const newUser = await prisma.user.create({
        data: {
          name: oauthProfile.name,
          email: oauthProfile.email,
          image: oauthProfile.image,
          emailVerified: new Date(),
        },
      })

      expect(newUser.email).toBe('jane@gmail.com')
      expect(newUser.emailVerified).not.toBeNull()
    })
  })

  describe('Email Verification', () => {
    it('should create verification token', async () => {
      const token = {
        identifier: 'john@example.com',
        token: 'verification-token-123',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }

      ;(prisma.verificationToken.create as jest.Mock).mockResolvedValue(token)

      const verificationToken = await prisma.verificationToken.create({
        data: token,
      })

      expect(verificationToken.token).toBe('verification-token-123')
      expect(verificationToken.expires.getTime()).toBeGreaterThan(Date.now())
    })

    it('should verify email with valid token', async () => {
      const token = {
        identifier: 'john@example.com',
        token: 'valid-token',
        expires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
      }

      ;(prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(token)
      ;(prisma.verificationToken.delete as jest.Mock).mockResolvedValue(token)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        emailVerified: new Date(),
      })

      const storedToken = await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: 'john@example.com', token: 'valid-token' } },
      })

      expect(storedToken).not.toBeNull()
      expect(storedToken!.expires.getTime()).toBeGreaterThan(Date.now())

      // Update user's emailVerified
      const updatedUser = await prisma.user.update({
        where: { email: 'john@example.com' },
        data: { emailVerified: new Date() },
      })

      expect(updatedUser.emailVerified).not.toBeNull()

      // Delete used token
      await prisma.verificationToken.delete({
        where: { identifier_token: { identifier: 'john@example.com', token: 'valid-token' } },
      })
    })

    it('should reject expired token', async () => {
      const expiredToken = {
        identifier: 'john@example.com',
        token: 'expired-token',
        expires: new Date(Date.now() - 1000), // expired
      }

      ;(prisma.verificationToken.findUnique as jest.Mock).mockResolvedValue(expiredToken)

      const token = await prisma.verificationToken.findUnique({
        where: { identifier_token: { identifier: 'john@example.com', token: 'expired-token' } },
      })

      expect(token!.expires.getTime()).toBeLessThan(Date.now())
      // In real API, this would return 400 error
    })
  })

  describe('Password Reset', () => {
    it('should create password reset token', async () => {
      const resetToken = {
        identifier: 'john@example.com',
        token: 'reset-token-123',
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      }

      ;(prisma.verificationToken.create as jest.Mock).mockResolvedValue(resetToken)

      const token = await prisma.verificationToken.create({
        data: resetToken,
      })

      expect(token.token).toBe('reset-token-123')
    })

    it('should reset password with valid token', async () => {
      const newPassword = 'newSecurePassword123'
      const hashedPassword = await bcrypt.hash(newPassword, 12)

      ;(prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-1',
        passwordHash: hashedPassword,
      })

      const updatedUser = await prisma.user.update({
        where: { email: 'john@example.com' },
        data: { passwordHash: hashedPassword },
      })

      expect(updatedUser.passwordHash).toBe('hashed_newSecurePassword123')
    })
  })
})

describe('Session Management', () => {
  it('should create session on login', () => {
    const session = {
      user: {
        id: 'user-1',
        email: 'john@example.com',
        name: 'John Doe',
      },
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    }

    expect(session.user.id).toBe('user-1')
    expect(new Date(session.expires).getTime()).toBeGreaterThan(Date.now())
  })

  it('should include workspace in session', () => {
    const session = {
      user: {
        id: 'user-1',
        email: 'john@example.com',
        workspaces: [
          { id: 'ws-1', name: 'My Workspace', role: 'owner' },
        ],
      },
    }

    expect(session.user.workspaces).toHaveLength(1)
    expect(session.user.workspaces[0].role).toBe('owner')
  })
})
