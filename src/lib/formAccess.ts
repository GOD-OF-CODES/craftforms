import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type RoleFilter = 'any' | 'editor' | 'admin'

function buildMemberFilter(userId: string, roles: RoleFilter) {
  if (roles === 'any') {
    return { members: { some: { userId } } }
  }
  const roleMap: Record<string, string[]> = {
    editor: ['admin', 'editor'],
    admin: ['admin'],
  }
  return { members: { some: { userId, role: { in: roleMap[roles] } } } }
}

interface FormAccessOptions<T extends Prisma.FormInclude | undefined = undefined> {
  roles?: RoleFilter
  include?: T
}

export async function verifyFormAccess<T extends Prisma.FormInclude | undefined = undefined>(
  formId: string,
  userId: string,
  options: FormAccessOptions<T> = {} as FormAccessOptions<T>
): Promise<
  T extends Prisma.FormInclude
    ? Prisma.FormGetPayload<{ include: T }> | null
    : Prisma.FormGetPayload<{}> | null
> {
  const { roles = 'any', include } = options

  const result = await prisma.form.findFirst({
    where: {
      id: formId,
      workspace: {
        OR: [
          { ownerId: userId },
          buildMemberFilter(userId, roles),
        ]
      }
    },
    ...(include ? { include } : {}),
  })

  return result as any
}

interface WorkspaceAccessOptions<T extends Prisma.WorkspaceInclude | undefined = undefined> {
  roles?: RoleFilter
  ownerOnly?: boolean
  include?: T
}

export async function verifyWorkspaceAccess<T extends Prisma.WorkspaceInclude | undefined = undefined>(
  workspaceId: string,
  userId: string,
  options: WorkspaceAccessOptions<T> = {} as WorkspaceAccessOptions<T>
): Promise<
  T extends Prisma.WorkspaceInclude
    ? Prisma.WorkspaceGetPayload<{ include: T }> | null
    : Prisma.WorkspaceGetPayload<{}> | null
> {
  const { roles = 'any', ownerOnly = false, include } = options

  const where = ownerOnly
    ? { id: workspaceId, ownerId: userId }
    : {
        id: workspaceId,
        OR: [
          { ownerId: userId },
          buildMemberFilter(userId, roles),
        ]
      }

  const result = await prisma.workspace.findFirst({
    where,
    ...(include ? { include } : {}),
  })

  return result as any
}
