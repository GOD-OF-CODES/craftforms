import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    })

    // Generate a secure token
    const token = crypto.randomBytes(48).toString('hex')

    // Store token with 1-hour expiry
    await prisma.passwordResetToken.create({
      data: {
        token,
        email,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    // Send the reset email
    const emailResult = await sendPasswordResetEmail(email, user.name || 'there', token)

    if (!emailResult.success) {
      console.error('[Password Reset] Failed to send email')
      return NextResponse.json(
        { error: 'Unable to send reset email. Please try again later.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
