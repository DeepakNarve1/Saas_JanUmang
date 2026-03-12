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

      // ─── CRITICAL SAAS CHECK FOR ALL TENANT USERS ───
      // If a user belongs to a tenant, we MUST verify the module is enabled.
      // This immediately blocks access if the subscription doesn't permit it,
      // regardless of the user's role or admin status in MongoDB.
      if (user.tenantId) {
        const enabledModules = user.tenant?.enabledModules || [];

        const permissionToModuleMap: Record<string, string> = {
          view_member: "members",
          create_member: "members",
          edit_member: "members",
          delete_member: "members",
          view_event: "events",
          view_visitor: "visitors",
          view_project: "projects",
          view_assembly_issue: "assembly_issues",
          view_voter: "voters",
          create_voter: "voters",
          edit_voter: "voters",
          delete_voter: "voters",
          view_panchayat: "panchayats",
          view_village: "villages",
          view_booth: "booths",
          view_block: "blocks",
          view_department: "departments",
          view_party: "parties",
          view_worktype: "work_types",
          view_sub_type_of_work: "sub_work_types",
          view_activity_logs: "activity_management",
          view_user_activity_report: "activity_management",
          view_assemblies: "assemblies",
          view_vidhan_sabha_samiti: "vidhan_sabha_samiti",
        };

        const requiredModule =
          permissionToModuleMap[permissionName] ||
          permissionName.replace(/^(view|create|edit|delete|manage)_/, "");

        const IS_A_KNOWN_OPTIONAL_MODULE =
          Object.values(permissionToModuleMap).includes(requiredModule) ||
          [
            "members",
            "events",
            "visitors",
            "projects",
            "voters",
            "phone_directory",
            "mp_public_problems",
            "departments",
            "blocks",
            "villages",
            "panchayats",
            "booths",
            "states",
            "divisions",
            "districts",
            "parliaments",
            "assemblies",
            "samiti",
            "parties",
            "work_types",
            "sub_work_types",
            "assembly_issues",
            "inward_register",
            "dispatch_register",
            "call_management",
            "in_docs",
            "vidhan_sabha_samiti",
            "ganesh_samiti",
            "tenkar_samiti",
            "dp_samiti",
            "mandir_samiti",
            "bhagoria_samiti",
            "nirman_samiti",
            "booth_samiti",
            "block_samiti",
          ].includes(requiredModule);

        if (
          IS_A_KNOWN_OPTIONAL_MODULE &&
          requiredModule !== "activity_management" &&
          !enabledModules.includes(requiredModule)
        ) {
          return false; // HARDBLOCK: Module disabled by plan
        }
      }

      // Tenant Admin Level - always allow core views
      if (user.level === "tenant_admin") {
        if (
          permissionName === "view_user_count" ||
          permissionName === "view_dashboard" ||
          permissionName === "manage_roles" ||
          permissionName === "view_roles" ||
          permissionName === "view_activity_logs" ||
          permissionName === "view_user_activity_report"
        ) {
          return true;
        }

        // Auto-grant access to enabled modules for tenant_admin
        if (user.tenant?.enabledModules) {
          // Check using the same mapping logic to ensure singular permissions (view_voter)
          // match up with plural module IDs (voters)
          const permissionToModuleMap: Record<string, string> = {
            view_member: "members",
            view_event: "events",
            view_visitor: "visitors",
            view_project: "projects",
            view_assembly_issue: "assembly_issues",
            view_voter: "voters",
            create_voter: "voters",
            edit_voter: "voters",
            delete_voter: "voters",
            view_panchayat: "panchayats",
            view_village: "villages",
            view_booth: "booths",
            view_block: "blocks",
            view_department: "departments",
            view_party: "parties",
            view_worktype: "work_types",
            view_sub_type_of_work: "sub_work_types",
            view_activity_logs: "activity_management",
            view_user_activity_report: "activity_management",
            view_assemblies: "assemblies",
            view_vidhan_sabha_samiti: "vidhan_sabha_samiti",
          };

          const rawModule =
            permissionToModuleMap[permissionName] ||
            permissionName.replace(/^(view|create|edit|delete|manage)_/, "");

          if (user.tenant.enabledModules.includes(rawModule)) {
            return true;
          }
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
