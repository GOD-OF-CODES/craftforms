/**
 * Role-Based Access Control (RBAC) System
 *
 * Defines roles and permissions for workspace members.
 */

// Workspace member roles
export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'

// Permission types
export type Permission =
  | 'workspace:read'
  | 'workspace:update'
  | 'workspace:delete'
  | 'workspace:manage_members'
  | 'workspace:manage_billing'
  | 'form:create'
  | 'form:read'
  | 'form:update'
  | 'form:delete'
  | 'form:publish'
  | 'response:read'
  | 'response:delete'
  | 'response:export'
  | 'theme:create'
  | 'theme:read'
  | 'theme:update'
  | 'theme:delete'
  | 'webhook:create'
  | 'webhook:read'
  | 'webhook:update'
  | 'webhook:delete'
  | 'analytics:read'

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY: WorkspaceRole[] = ['viewer', 'editor', 'admin', 'owner']

// Permissions by role
const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  viewer: [
    'workspace:read',
    'form:read',
    'response:read',
    'theme:read',
    'webhook:read',
    'analytics:read'
  ],
  editor: [
    'workspace:read',
    'form:create',
    'form:read',
    'form:update',
    'form:publish',
    'response:read',
    'response:export',
    'theme:create',
    'theme:read',
    'theme:update',
    'webhook:read',
    'analytics:read'
  ],
  admin: [
    'workspace:read',
    'workspace:update',
    'workspace:manage_members',
    'form:create',
    'form:read',
    'form:update',
    'form:delete',
    'form:publish',
    'response:read',
    'response:delete',
    'response:export',
    'theme:create',
    'theme:read',
    'theme:update',
    'theme:delete',
    'webhook:create',
    'webhook:read',
    'webhook:update',
    'webhook:delete',
    'analytics:read'
  ],
  owner: [
    'workspace:read',
    'workspace:update',
    'workspace:delete',
    'workspace:manage_members',
    'workspace:manage_billing',
    'form:create',
    'form:read',
    'form:update',
    'form:delete',
    'form:publish',
    'response:read',
    'response:delete',
    'response:export',
    'theme:create',
    'theme:read',
    'theme:update',
    'theme:delete',
    'webhook:create',
    'webhook:read',
    'webhook:update',
    'webhook:delete',
    'analytics:read'
  ]
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: WorkspaceRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Check if role1 is higher than or equal to role2
 */
export function isRoleHigherOrEqual(role1: WorkspaceRole, role2: WorkspaceRole): boolean {
  const index1 = ROLE_HIERARCHY.indexOf(role1)
  const index2 = ROLE_HIERARCHY.indexOf(role2)
  return index1 >= index2
}

/**
 * Check if a user can manage another user based on roles
 */
export function canManageUser(managerRole: WorkspaceRole, targetRole: WorkspaceRole): boolean {
  // Only admins and owners can manage users
  if (!hasPermission(managerRole, 'workspace:manage_members')) {
    return false
  }
  // Can only manage users with lower role
  return ROLE_HIERARCHY.indexOf(managerRole) > ROLE_HIERARCHY.indexOf(targetRole)
}

/**
 * Check if a user can change another user's role
 */
export function canChangeRole(
  managerRole: WorkspaceRole,
  currentRole: WorkspaceRole,
  newRole: WorkspaceRole
): boolean {
  // Must be able to manage the user
  if (!canManageUser(managerRole, currentRole)) {
    return false
  }
  // Cannot promote to equal or higher role
  if (ROLE_HIERARCHY.indexOf(newRole) >= ROLE_HIERARCHY.indexOf(managerRole)) {
    return false
  }
  return true
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: WorkspaceRole): string {
  const names: Record<WorkspaceRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer'
  }
  return names[role]
}

/**
 * Get role description
 */
export function getRoleDescription(role: WorkspaceRole): string {
  const descriptions: Record<WorkspaceRole, string> = {
    owner: 'Full access including billing and workspace deletion',
    admin: 'Can manage members, forms, and settings',
    editor: 'Can create and edit forms, view responses',
    viewer: 'Can view forms and responses only'
  }
  return descriptions[role]
}

/**
 * Permission check middleware helper
 */
export function requirePermission(
  userRole: WorkspaceRole | undefined,
  permission: Permission
): { allowed: boolean; error?: string } {
  if (!userRole) {
    return { allowed: false, error: 'Not a member of this workspace' }
  }

  if (!hasPermission(userRole, permission)) {
    return {
      allowed: false,
      error: `Insufficient permissions. Required: ${permission}`
    }
  }

  return { allowed: true }
}

/**
 * Check multiple permissions (AND logic)
 */
export function requireAllPermissions(
  userRole: WorkspaceRole | undefined,
  permissions: Permission[]
): { allowed: boolean; error?: string } {
  if (!userRole) {
    return { allowed: false, error: 'Not a member of this workspace' }
  }

  for (const permission of permissions) {
    if (!hasPermission(userRole, permission)) {
      return {
        allowed: false,
        error: `Insufficient permissions. Required: ${permission}`
      }
    }
  }

  return { allowed: true }
}

/**
 * Check any permission (OR logic)
 */
export function requireAnyPermission(
  userRole: WorkspaceRole | undefined,
  permissions: Permission[]
): { allowed: boolean; error?: string } {
  if (!userRole) {
    return { allowed: false, error: 'Not a member of this workspace' }
  }

  for (const permission of permissions) {
    if (hasPermission(userRole, permission)) {
      return { allowed: true }
    }
  }

  return {
    allowed: false,
    error: `Insufficient permissions. Required one of: ${permissions.join(', ')}`
  }
}
