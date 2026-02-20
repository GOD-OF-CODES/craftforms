import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'
import { withAuth } from '@/lib/apiHandler'

export const GET = withAuth(async (_req, { params }) => {
  const forms = await prisma.form.findMany({
    where: {
      workspaceId: params.workspaceId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      _count: {
        select: { responses: true },
      },
    },
  })

  return NextResponse.json({ forms })
})

export const POST = withAuth(async (req, { params }, session) => {
  const { title, description } = await req.json()

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const slug = generateSlug(title, { maxLength: 40, fallback: 'untitled-form', appendTimestamp: true })

  const form = await prisma.form.create({
    data: {
      title,
      description: description || '',
      slug,
      workspaceId: params.workspaceId,
      createdBy: session.user.id,
      isPublished: false,
    },
  })

  return NextResponse.json({ form }, { status: 201 })
})
