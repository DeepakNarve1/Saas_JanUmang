"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePermissions } from "@app/hooks/usePermissions";

import { Permission } from "@app/config/permissions";

interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermission?: Permission | string;
  requiredPermissions?: (Permission | string)[];
  requireAll?: boolean; // If true, user must have ALL permissions. If false, ANY permission is enough
  redirectTo?: string;
  checkSidebarAccess?: boolean; // Optional: check sidebar access (default: false)
}

import { toast } from "react-toastify";
import { MENU } from "@app/utils/menu";

// ... (existing imports)

export const RouteGuard = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  redirectTo = "/dashboard",
  checkSidebarAccess = false,
}: RouteGuardProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasSidebarAccess,
    user,
  } = usePermissions();

  // Helper to find the first accessible path
  const getFirstAccessiblePath = () => {
    for (const item of MENU) {
      if (item.path) {
        let hasAccess = false;

        // 1. Check Role Match
        const roleName = typeof user?.role === "string" ? "" : user?.role?.name;
        if (item.allowedRoles && item.allowedRoles.length > 0) {
          if (item.allowedRoles.includes(roleName || "")) {
            hasAccess = true;
          }
        }

        // 2. Check Permission Match
        if (
          !hasAccess &&
          item.allowedPermissions &&
          item.allowedPermissions.length > 0
        ) {
          if (hasAnyPermission(item.allowedPermissions)) {
            hasAccess = true;
          }
        }

        // 3. Public Item
        if (
          (!item.allowedRoles || item.allowedRoles.length === 0) &&
          (!item.allowedPermissions || item.allowedPermissions.length === 0)
        ) {
          hasAccess = true;
        }

        // 4. Resource Check (Fallback if not caught by explicit permissions above, mostly for sidebar consistency)
        if (!hasAccess && item.resource) {
          const viewPermission = `view_${item.resource}`;
          if (hasPermission(viewPermission)) {
            hasAccess = true;
          }
        }

        if (hasAccess) {
          return item.path;
        }
      }
    }
    return "/no-permission"; // Redirect to no-permission page if no access found
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    let hasAccess = true;

    // Optional: Check sidebar access
    if (checkSidebarAccess && !hasSidebarAccess(pathname)) {
      hasAccess = false;
    }

    // Check specific permission
    if (hasAccess && requiredPermission && !hasPermission(requiredPermission)) {
      hasAccess = false;
    }

    // Check multiple permissions
    if (hasAccess && requiredPermissions && requiredPermissions.length > 0) {
      hasAccess = requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);
    }

    if (!hasAccess) {
      // Find where to go
      const fallbackPath = getFirstAccessiblePath();

      // Avoid infinite loop if fallback is same as current or if we are already redirecting
      if (fallbackPath !== pathname) {
        toast.error("Permission Denied: Redirecting to authorized module...");
        router.push(fallbackPath);
      }
      return;
    }
  }, [
    user,
    pathname,
    requiredPermission,
    requiredPermissions,
    requireAll,
    redirectTo,
    checkSidebarAccess,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasSidebarAccess,
    router,
  ]);

  // Show nothing while checking permissions or redirecting
  if (!user) return null;

  // Re-check for rendering (same logic as effect)
  let hasAccess = true;
  if (checkSidebarAccess && !hasSidebarAccess(pathname)) hasAccess = false;
  if (hasAccess && requiredPermission && !hasPermission(requiredPermission))
    hasAccess = false;
  if (hasAccess && requiredPermissions && requiredPermissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  }

  if (!hasAccess) {
    // Return null instead of error message, since we are redirecting
    return null;
  }

  return <>{children}</>;
};
