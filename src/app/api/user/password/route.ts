import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'
import { validatePassword } from '@/lib/passwordPolicy'
import { withAuth } from '@/lib/apiHandler'

export const POST = withAuth(async (req, _ctx, session) => {
  const { currentPassword, newPassword } = await req.json()

  const passwordCheck = validatePassword(newPassword)
  if (!passwordCheck.valid) {
    return NextResponse.json({ error: passwordCheck.error }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // If user has an existing password, verify the current one
  if (user.password) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 })
    }
    const isValid = await compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 })
    }
  }

  const hashedPassword = await hash(newPassword, 12)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  return NextResponse.json({ success: true })
})
