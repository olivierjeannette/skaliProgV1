// Configuration des rôles et permissions

import type { UserRole } from '@/types';

export const ROLES: Record<UserRole, {
  label: string;
  color: string;
  permissions: string[];
  canAccess: string[];
}> = {
  ADMIN: {
    label: 'Administrateur',
    color: '#dc2626',
    permissions: ['all'],
    canAccess: ['/*'],
  },
  COACH: {
    label: 'Coach',
    color: '#2563eb',
    permissions: [
      'view_members',
      'edit_members',
      'view_sessions',
      'edit_sessions',
      'view_calendar',
    ],
    canAccess: ['/members', '/calendar', '/dashboard'],
  },
  ATHLETE: {
    label: 'Athlète',
    color: '#059669',
    permissions: ['view_own_data'],
    canAccess: [],
  },
};

export const DEFAULT_PASSWORDS = {
  ADMIN: 'skaliprog',
  COACH: 'coach2024',
  ATHLETE: 'athlete2024',
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const roleConfig = ROLES[role];
  return roleConfig.permissions.includes('all') || roleConfig.permissions.includes(permission);
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  const roleConfig = ROLES[role];
  if (roleConfig.permissions.includes('all')) return true;

  return roleConfig.canAccess.some(pattern => {
    if (pattern.endsWith('/*')) {
      return route.startsWith(pattern.slice(0, -2));
    }
    return route === pattern;
  });
}
