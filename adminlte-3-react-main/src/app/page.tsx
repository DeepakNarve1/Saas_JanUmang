"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@app/hooks/usePermissions";
import { PERMISSIONS } from "@app/config/permissions";
import { MENU } from "@app/utils/menu";

export default function Home() {
  const { user, hasPermission, hasAnyPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Find the first accessible menu item
      let firstAllowedPath = "/no-permission"; // Default to no-permission if nothing found
      let found = false;

      // Check Dashboard explicitly
      if (hasPermission(PERMISSIONS.VIEW_DASHBOARD)) {
        firstAllowedPath = "/dashboard";
        found = true;
      } else {
        // Search through menu items
        for (const item of MENU) {
          if (item.path && item.path !== "/dashboard") {
            // Determine access
            let hasAccess = false;

            // 1. Check Role Match
            const roleName =
              typeof user.role === "string" ? "" : user.role?.name;
            if (item.allowedRoles && item.allowedRoles.length > 0) {
              if (item.allowedRoles.includes(roleName || "")) {
                hasAccess = true;
              }
            }

            // 2. Check Permission Match (if not already accessible)
            if (
              !hasAccess &&
              item.allowedPermissions &&
              item.allowedPermissions.length > 0
            ) {
              if (hasAnyPermission(item.allowedPermissions)) {
                hasAccess = true;
              }
            }

            // 3. Public Item (no roles or perms defined)
            if (
              (!item.allowedRoles || item.allowedRoles.length === 0) &&
              (!item.allowedPermissions || item.allowedPermissions.length === 0)
            ) {
              hasAccess = true;
            }

            if (hasAccess) {
              firstAllowedPath = item.path;
              found = true;
              break;
            }
          }
        }
      }

      router.push(firstAllowedPath);
    } else {
      router.push("/login");
    }
  }, [user, router, hasPermission, hasAnyPermission]);

  return null;
}
