/**
 * Centralized Role & Permission Utilities (Frontend)
 *
 * This module provides a single source of truth for role checking logic.
 * Use these functions instead of scattered role checks throughout the codebase.
 */

import { IUser, IRole } from "@app/types/user";

/**
 * Check if user is a System Administrator (global platform access)
 *
 * SECURITY RULE: A user who belongs to an organisation (has tenantId) is NEVER
 * a platform admin, regardless of their level or role name.
 * This mirrors the backend isGlobalAdmin() check in authHelpers.js.
 */
export const isSystemAdmin = (user: IUser | null | undefined): boolean => {
  if (!user) return false;

  // CRITICAL: Users belonging to an organisation are NEVER platform admins
  if (user.tenantId) return false;

  // Only trust the level field for platform-wide users (those without a tenantId)
  return user.level === "system_admin" || user.level === "superadmin";
};

/**
 * Check if user is a Tenant Administrator
 */
export const isTenantAdmin = (user: IUser | null | undefined): boolean => {
  if (!user) return false;

  // Check level field (primary)
  if (user.level === "tenant_admin") {
    return true;
  }

  // Check role field
  if (user.role) {
    if (typeof user.role === "string") {
      return user.role === "tenant_admin";
    }
    const roleObj = user.role as IRole;
    if (roleObj.name) {
      return roleObj.name === "tenant_admin";
    }
  }

  // Check userType field (deprecated)
  if (user.userType) {
    return user.userType.toLowerCase() === "tenant_admin";
  }

  return false;
};

/**
 * Check if user has a specific role by name
 */
export const hasRole = (
  user: IUser | null | undefined,
  roleName: string,
): boolean => {
  if (!user || !roleName) return false;

  const roleNameLower = roleName.toLowerCase();

  // Check level field
  if (user.level && user.level.toLowerCase() === roleNameLower) {
    return true;
  }

  // Check role field
  if (user.role) {
    if (typeof user.role === "string") {
      return user.role.toLowerCase() === roleNameLower;
    }
    const roleObj = user.role as IRole;
    if (roleObj.name) {
      return roleObj.name.toLowerCase() === roleNameLower;
    }
  }

  // Check userType field (deprecated)
  if (user.userType) {
    return user.userType.toLowerCase() === roleNameLower;
  }

  return false;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (
  user: IUser | null | undefined,
  roleNames: string[],
): boolean => {
  if (!user || !roleNames || !Array.isArray(roleNames)) return false;
  return roleNames.some((roleName) => hasRole(user, roleName));
};

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (
  user: IUser | null | undefined,
  roleNames: string[],
): boolean => {
  if (!user || !roleNames || !Array.isArray(roleNames)) return false;
  return roleNames.every((roleName) => hasRole(user, roleName));
};

/**
 * Get user's primary role name
 */
export const getUserRole = (user: IUser | null | undefined): string | null => {
  if (!user) return null;

  // Prefer level field
  if (user.level) return user.level;

  // Then role field
  if (user.role) {
    if (typeof user.role === "string") return user.role;
    const roleObj = user.role as IRole;
    if (roleObj.name) return roleObj.name;
  }

  // Finally userType (deprecated)
  if (user.userType) return user.userType;

  return null;
};

/**
 * Check if user is a global admin (system_admin or superadmin)
 * Alias for isSystemAdmin for backward compatibility
 */
export const isGlobalAdmin = isSystemAdmin;

/**
 * Alias for isSystemAdmin (used in some components)
 */
export const isSuperAdmin = isSystemAdmin;

/**
 * Check if user can manage tenants (system admins only)
 */
export const canManageTenants = (user: IUser | null | undefined): boolean => {
  return isSystemAdmin(user);
};

/**
 * Check if user can access a specific tenant
 */
export const canAccessTenant = (
  user: IUser | null | undefined,
  tenantId: string,
): boolean => {
  if (!user) return false;

  // System admins can access all tenants
  if (isSystemAdmin(user)) return true;

  // Other users can only access their own tenant
  if (!tenantId) return false;

  return user.tenantId === tenantId;
};

/**
 * Get user's access level (for display purposes)
 */
export const getUserAccessLevel = (user: IUser | null | undefined): string => {
  if (isSystemAdmin(user)) return "Platform Administrator";
  if (isTenantAdmin(user)) return "Organization Administrator";

  const role = getUserRole(user);
  if (role) {
    // Capitalize first letter
    return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ");
  }

  return "User";
};

/**
 * Role hierarchy levels (higher number = more access)
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  system_admin: 100,
  superadmin: 100,
  tenant_admin: 50,
  district: 40,
  assembly: 30,
  block: 20,
  panchayat: 15,
  village: 10,
  booth: 5,
  regularUser: 1,
};

/**
 * Check if user has higher or equal access level than specified role
 */
export const hasMinimumRole = (
  user: IUser | null | undefined,
  minimumRole: string,
): boolean => {
  const userRole = getUserRole(user);
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

  return userLevel >= requiredLevel;
};

/**
 * User level enum for type safety
 */
export enum UserLevel {
  SYSTEM_ADMIN = "system_admin",
  SUPERADMIN = "superadmin",
  TENANT_ADMIN = "tenant_admin",
  DISTRICT = "district",
  ASSEMBLY = "assembly",
  BLOCK = "block",
  PANCHAYAT = "panchayat",
  VILLAGE = "village",
  BOOTH = "booth",
}

/**
 * User status enum
 */
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}
