import { useCallback } from "react";
import { useAppSelector } from "@app/store/store";
import { IRole, IPermission } from "@app/types/user";

export const usePermissions = () => {
  const user = useAppSelector((state) => state.auth.currentUser);

  const hasPermission = useCallback(
    (permissionName: string): boolean => {
      if (!user || !user.role) {
        return false;
      }

      // Handle role as string (e.g., "superadmin")
      if (typeof user.role === "string") {
        if (user.role === "superadmin") {
          return true;
        }
        return false;
      }

      // Handle role as object
      const role = user.role as IRole;

      // Superadmin bypass
      if (role.name === "superadmin") {
        return true;
      }

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
      if (!user || !user.role) {
        return false;
      }

      // Handle role as string (e.g., "superadmin")
      if (typeof user.role === "string") {
        if (user.role === "superadmin") {
          return true;
        }
        return false;
      }

      // Handle role as object
      const role = user.role as IRole;

      // Superadmin bypass
      if (role.name === "superadmin") {
        return true;
      }

      // Check wildcard access
      if (role.sidebarAccess?.includes("*")) {
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
    if (!user || !user.role) {
      return false;
    }

    // Debug logging (remove in production)
    console.log("isSuperAdmin check:", {
      userType: user.userType,
      role: user.role,
      roleType: typeof user.role,
    });

    // Check userType field - must be exactly "superadmin"
    if (user.userType && user.userType.toLowerCase() === "superadmin") {
      return true;
    }

    // Handle role as string - must be exactly "superadmin"
    if (typeof user.role === "string") {
      return user.role.toLowerCase() === "superadmin";
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
