import { useCallback } from "react";
import { useAppSelector } from "@app/store/store";
import { IRole, IPermission } from "@app/types/user";
import { PERMISSIONS, Permission } from "@app/config/permissions";

/**
 * A helper that mirrors the backend isGlobalAdmin() security rule:
 * A user who belongs to an organisation (has a tenantId) is NEVER a platform admin.
 */
const isGlobalPlatformAdmin = (user: any): boolean => {
  if (!user) return false;
  // Users with a tenantId belong to an organisation — they are NEVER platform admins
  if (user.tenantId) return false;
  return user.level === "system_admin" || user.level === "superadmin";
};

export const usePermissions = () => {
  const user = useAppSelector((state) => state.auth.currentUser);

  const hasPermission = useCallback(
    (permissionName: Permission | string): boolean => {
      if (!user) return false;

      // Platform-level admin check (no tenantId + system_admin/superadmin level)
      if (isGlobalPlatformAdmin(user)) {
        return true;
      }

      // Tenant Admin Level - always allow core views
      if (user.level === "tenant_admin") {
        if (
          permissionName === "view_user_count" ||
          permissionName === "view_dashboard" ||
          permissionName === "manage_roles" ||
          permissionName === "view_roles"
        ) {
          return true;
        }

        // Auto-grant access to enabled modules for tenant_admin
        if (user.tenant?.enabledModules) {
          const enabledModules = user.tenant.enabledModules;
          const isEnabled = enabledModules.some((modId: string) =>
            permissionName.includes(modId),
          );
          if (isEnabled) return true;
        }
      }

      if (!user.role) {
        return false;
      }

      // Handle role as string (legacy)
      if (typeof user.role === "string") {
        return false; // No permission escalation from role name strings
      }

      // Handle role as object — check the permissions array only
      const role = user.role as IRole;

      if (!role.permissions || !Array.isArray(role.permissions)) {
        return false;
      }

      const hasIt = role.permissions.some((perm: any) => {
        if (typeof perm === "string") {
          return perm === permissionName;
        }
        return perm.name === permissionName;
      });

      return hasIt;
    },
    [user],
  );

  const hasSidebarAccess = useCallback(
    (path: string): boolean => {
      if (!user) return false;

      // Platform-level admin check
      if (isGlobalPlatformAdmin(user)) {
        return true;
      }

      // Tenant Admin access to core paths
      if (
        user.level === "tenant_admin" &&
        (path === "/user-count" || path === "/" || path === "/dashboard")
      ) {
        return true;
      }

      if (!user.role) return false;
      const role = user.role as IRole;

      // Check wildcard access
      if (role.sidebarAccess?.includes("*")) {
        // Even with wildcard, tenant users should NOT see /tenants
        if (path === "/tenants") {
          return false;
        }
        return true;
      }

      const hasAccess = role.sidebarAccess?.includes(path) || false;
      return hasAccess;
    },
    [user],
  );

  const hasAnyPermission = useCallback(
    (permissionNames: (Permission | string)[]): boolean => {
      return permissionNames.some((perm) => hasPermission(perm));
    },
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (permissionNames: (Permission | string)[]): boolean => {
      return permissionNames.every((perm) => hasPermission(perm));
    },
    [hasPermission],
  );

  const isSuperAdmin = useCallback((): boolean => {
    return isGlobalPlatformAdmin(user);
  }, [user]);

  /**
   * Mirrors the backend requesterIsTenantAdmin check:
   * The user must have a tenantId AND be at the tenant_admin level.
   */
  const isTenantAdmin = useCallback((): boolean => {
    if (!user) return false;
    if (isGlobalPlatformAdmin(user)) return false; // global admins are NOT tenant admins
    return (
      !!user.tenantId &&
      (user.level === "tenant_admin" ||
        (typeof user.role === "object" &&
          user.role !== null &&
          (user.role as any).name === "tenant_admin"))
    );
  }, [user]);

  return {
    hasPermission,
    hasSidebarAccess,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    isTenantAdmin,
    user,
  };
};
