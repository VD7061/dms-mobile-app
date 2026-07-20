export const ROLES = {
  owner: 'owner',
  manager: 'manager',
  employee: 'employee',
  sales: 'sales',
  accountant: 'accountant',
  staff: 'staff',
} as const;

export type AppRole = keyof typeof ROLES | (string & {});

export type PermissionKey =
  | 'account.view'
  | 'dashboard.view'
  | 'reports.view'
  | 'sales.invoice.create'
  | 'sales.invoice.share'
  | 'showroom.create'
  | 'showroom.members.add'
  | 'showroom.members.remove'
  | 'showroom.members.role.update'
  | 'showroom.members.view'
  | 'showroom.switch'
  | 'showroom.update'
  | 'tags.manage'
  | 'users.manage'
  | 'vehicles.create'
  | 'vehicles.view';

const rolePermissions = {
  owner: [
    'account.view',
    'dashboard.view',
    'reports.view',
    'sales.invoice.create',
    'sales.invoice.share',
    'showroom.create',
    'showroom.members.add',
    'showroom.members.remove',
    'showroom.members.role.update',
    'showroom.members.view',
    'showroom.switch',
    'showroom.update',
    'tags.manage',
    'users.manage',
    'vehicles.create',
    'vehicles.view',
  ],
  manager: [
    'account.view',
    'dashboard.view',
    'reports.view',
    'sales.invoice.create',
    'sales.invoice.share',
    'showroom.create',
    'showroom.members.add',
    'showroom.members.remove',
    'showroom.members.view',
    'showroom.switch',
    'showroom.update',
    'tags.manage',
    'vehicles.create',
    'vehicles.view',
  ],
  employee: [
    'account.view',
    'dashboard.view',
    'sales.invoice.create',
    'sales.invoice.share',
    'vehicles.view',
  ],
  sales: [
    'account.view',
    'dashboard.view',
    'sales.invoice.create',
    'sales.invoice.share',
    'vehicles.view',
  ],
  accountant: ['account.view', 'dashboard.view', 'reports.view'],
  staff: ['account.view', 'dashboard.view', 'vehicles.view'],
} satisfies Record<keyof typeof ROLES, PermissionKey[]>;

export function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase() ?? '';
}

export function canRole(role: string | null | undefined, permission: PermissionKey) {
  const normalizedRole = normalizeRole(role);
  const permissions: readonly PermissionKey[] =
    rolePermissions[normalizedRole as keyof typeof rolePermissions] ?? [];

  return permissions.includes(permission);
}

export function getRolePermissions(role: string | null | undefined) {
  const normalizedRole = normalizeRole(role);

  return rolePermissions[normalizedRole as keyof typeof rolePermissions] ?? [];
}
