import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Create the password_reset_tokens table directly via raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "token" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "expires_at" TIMESTAMP(3) NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
      )
    `)

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key"
      ON "password_reset_tokens"("token")
    `)

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "password_reset_tokens_email_idx"
      ON "password_reset_tokens"("email")
    `)

    // Also add missing "type" column to accounts if needed
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "accounts" ADD COLUMN IF NOT EXISTS "type" TEXT
    `)

    // Verify it worked
    const result = await prisma.$queryRawUnsafe(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'password_reset_tokens'`
    )

    return NextResponse.json({
      success: true,
      message: 'Table created successfully',
      verification: result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
