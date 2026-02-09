import { prisma } from '@/lib/prisma'

/**
 * Verify that a user has access to a form via workspace ownership or membership.
 * Returns the form if access is granted, null otherwise.
 */
export async function verifyFormAccess(
  formId: string,
  userId: string,
  options?: { includeFields?: boolean; includeScreens?: boolean; includeTheme?: boolean }
) {
  return prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    },
    include: {
      fields: options?.includeFields ? { orderBy: { orderIndex: 'asc' } } : false,
      screens: options?.includeScreens ?? false,
      theme: options?.includeTheme ?? false,
    },
  })
}

/**
 * Verify that a user has access to a workspace via ownership or membership.
 */
export async function verifyWorkspaceAccess(workspaceId: string, userId: string) {
  return prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
  })
}
