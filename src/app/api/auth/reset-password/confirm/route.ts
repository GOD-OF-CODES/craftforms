import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validatePassword } from '@/lib/passwordPolicy'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 })
    }

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    // Check expiry
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
      return NextResponse.json(
        { error: 'Reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Hash the new password (12 rounds, matching signup)
    const hashedPassword = await hash(password, 12)

    // Update password and delete token in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ])

    return NextResponse.json({ message: 'Password has been reset successfully.' })
  } catch (error) {
    console.error('Password reset confirm error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
