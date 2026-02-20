import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth } from '@/lib/apiHandler'

export const GET = withAuth(async (_req, _ctx, session) => {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
})

export const PATCH = withAuth(async (req, _ctx, session) => {
  const { name, email } = await req.json()

  // Validate
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  if (name.trim().length > 100) {
    return NextResponse.json({ error: 'Name must be 100 characters or less' }, { status: 400 })
  }

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  // Check if email is taken by another user
  if (email !== session.user.email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.id !== session.user.id) {
      return NextResponse.json({ error: 'Email is already in use' }, { status: 409 })
    }
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
    },
  })

  return NextResponse.json({ user })
})
