import { useCallback } from "react";
import { useAppSelector } from "@app/store/store";
import { IRole, IPermission } from "@app/types/user";

export const usePermissions = () => {
  const user = useAppSelector((state) => state.auth.currentUser);

  const hasPermission = useCallback(
    (permissionName: string): boolean => {
      if (!user) return false;

      // Super Admin / System Admin Restriction:
      // They can ONLY manage tenants and view dashboard
      if (user.level === "system_admin" || user.level === "superadmin") {
        const allowedPermissions = [
          "manage_tenants",
          "view_tenants",
          "create_tenants",
          "update_tenants",
          "delete_tenants",
          "view_dashboard",
        ];
        return allowedPermissions.includes(permissionName);
      }

      if (!user.role) {
        return false;
      }

      // Handle role as string (e.g., "superadmin")
      if (typeof user.role === "string") {
        if (user.role === "superadmin" || user.role === "system_admin") {
          const allowedPermissions = [
            "manage_tenants",
            "view_tenants",
            "create_tenants",
            "update_tenants",
            "delete_tenants",
            "view_dashboard",
          ];
          return allowedPermissions.includes(permissionName);
        }
        return false;
      }

      // Handle role as object
      const role = user.role as IRole;

      // Superadmin role restriction (same as level check)
      if (role.name === "superadmin" || role.name === "system_admin") {
        const allowedPermissions = [
          "manage_tenants",
          "view_tenants",
          "create_tenants",
          "update_tenants",
          "delete_tenants",
          "view_dashboard",
        ];
        return allowedPermissions.includes(permissionName);
      }

      // For tenant admins and other roles, check role permissions
      // Check if role has the permission
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

      // Super Admin / System Admin Restriction:
      // They can ONLY see Dashboard and Organizations (/tenants)
      if (user.level === "system_admin" || user.level === "superadmin") {
        const allowedPaths = ["/dashboard", "/tenants"];
        return allowedPaths.includes(path);
      }

      if (!user.role) {
        return false;
      }

      // Handle role as string (e.g., "superadmin")
      if (typeof user.role === "string") {
        if (user.role === "superadmin" || user.role === "system_admin") {
          const allowedPaths = ["/dashboard", "/tenants"];
          return allowedPaths.includes(path);
        }
        return false;
      }

      // Handle role as object
      const role = user.role as IRole;

      // Superadmin role restriction (same as level check)
      if (role.name === "superadmin" || role.name === "system_admin") {
        const allowedPaths = ["/dashboard", "/tenants"];
        return allowedPaths.includes(path);
      }

      // For tenant admins and other roles, check sidebar access
      // Check wildcard access
      if (role.sidebarAccess?.includes("*")) {
        // Even with wildcard, tenant admins should NOT see /tenants
        if (path === "/tenants") {
          return false;
        }
        return true;
      }

      // Check specific path access
      const hasAccess = role.sidebarAccess?.includes(path) || false;
      return hasAccess;
    },
    [user],
  );

  const hasAnyPermission = useCallback(
    (permissionNames: string[]): boolean => {
      return permissionNames.some((perm) => hasPermission(perm));
    },
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (permissionNames: string[]): boolean => {
      return permissionNames.every((perm) => hasPermission(perm));
    },
    [hasPermission],
  );

  const isSuperAdmin = useCallback((): boolean => {
    if (!user) return false;

    // SaaS: Check administrative level
    if (user.level === "system_admin" || user.level === "superadmin") {
      return true;
    }

    // Check userType field
    if (user.userType && user.userType.toLowerCase() === "superadmin") {
      return true;
    }

    if (!user.role) return false;

    // Handle role as string
    if (typeof user.role === "string") {
      return (
        user.role.toLowerCase() === "superadmin" ||
        user.role.toLowerCase() === "system_admin"
      );
    }

    // Handle role as object - check name field
    const role = user.role as IRole;
    if (role && role.name) {
      return role.name.toLowerCase() === "superadmin";
    }

    return false;
  }, [user]);

  return {
    hasPermission,
    hasSidebarAccess,
    hasAnyPermission,
    hasAllPermissions,
    isSuperAdmin,
    user,
  };
};
