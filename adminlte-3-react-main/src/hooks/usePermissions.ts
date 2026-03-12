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

/**
 * Checks if a user is a Secondary Org Admin (System Administrative) within their tenant.
 * These users should have full access to all modules enabled by their organisation's plan,
 * regardless of the specific role permissions assigned to them.
 */
const isSecondaryOrgAdmin = (user: any): boolean => {
  if (!user) return false;
  if (!user.tenantId) return false; // must be a tenant user
  return (
    user.userType === "systemAdministrator" || user.level === "tenant_admin"
  );
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

      // Secondary Org Admin check: tenant users marked as "System Administrator"
      // or level=tenant_admin bypass ROLE-BASED checks but are still bound by their
      // organisation's SUBSCRIPTION PLAN (module-level checks below still apply).
      const secondaryAdmin = isSecondaryOrgAdmin(user);

      // ─── CRITICAL SAAS CHECK FOR ALL TENANT USERS ───
      // If a user belongs to a tenant, we MUST verify the module is enabled.
      // This immediately blocks access if the subscription doesn't permit it,
      // regardless of the user's role or admin status in MongoDB.
      if (user.tenantId) {
        const enabledModules = user.tenant?.enabledModules || [];

        const permissionToModuleMap: Record<string, string> = {
          // Members
          view_member: "members",
          create_member: "members",
          edit_member: "members",
          delete_member: "members",
          // Events
          view_event: "events",
          create_event: "events",
          edit_event: "events",
          delete_event: "events",
          view_events_calendar: "events",
          // Visitors
          view_visitor: "visitors",
          create_visitor: "visitors",
          edit_visitor: "visitors",
          delete_visitor: "visitors",
          // Projects
          view_project: "projects",
          create_project: "projects",
          edit_project: "projects",
          delete_project: "projects",
          // Assembly Issues
          view_assembly_issue: "assembly_issues",
          create_assembly_issue: "assembly_issues",
          edit_assembly_issue: "assembly_issues",
          delete_assembly_issue: "assembly_issues",
          // Voters
          view_voter: "voters",
          create_voter: "voters",
          edit_voter: "voters",
          delete_voter: "voters",
          export_voter: "voters",
          view_voters: "voters",
          create_voters: "voters",
          edit_voters: "voters",
          delete_voters: "voters",
          export_voters: "voters",
          // Panchayats (both singular & plural)
          view_panchayat: "panchayats",
          create_panchayat: "panchayats",
          edit_panchayat: "panchayats",
          delete_panchayat: "panchayats",
          manage_panchayat: "panchayats",
          view_panchayats: "panchayats",
          create_panchayats: "panchayats",
          edit_panchayats: "panchayats",
          delete_panchayats: "panchayats",
          manage_panchayats: "panchayats",
          // Parliaments (both singular & plural)
          view_parliament: "parliaments",
          create_parliament: "parliaments",
          edit_parliament: "parliaments",
          delete_parliament: "parliaments",
          manage_parliament: "parliaments",
          view_parliaments: "parliaments",
          create_parliaments: "parliaments",
          edit_parliaments: "parliaments",
          delete_parliaments: "parliaments",
          manage_parliaments: "parliaments",
          // Villages
          view_village: "villages",
          create_village: "villages",
          edit_village: "villages",
          delete_village: "villages",
          manage_village: "villages",
          view_villages: "villages",
          create_villages: "villages",
          edit_villages: "villages",
          delete_villages: "villages",
          manage_villages: "villages",
          // Booths
          view_booth: "booths",
          create_booth: "booths",
          edit_booth: "booths",
          delete_booth: "booths",
          manage_booth: "booths",
          view_booths: "booths",
          create_booths: "booths",
          edit_booths: "booths",
          delete_booths: "booths",
          manage_booths: "booths",
          // Blocks
          view_block: "blocks",
          create_block: "blocks",
          edit_block: "blocks",
          delete_block: "blocks",
          manage_block: "blocks",
          view_blocks: "blocks",
          create_blocks: "blocks",
          edit_blocks: "blocks",
          delete_blocks: "blocks",
          manage_blocks: "blocks",
          // Departments
          view_department: "departments",
          create_department: "departments",
          edit_department: "departments",
          delete_department: "departments",
          manage_department: "departments",
          view_departments: "departments",
          create_departments: "departments",
          edit_departments: "departments",
          delete_departments: "departments",
          manage_departments: "departments",
          // Parties
          view_party: "parties",
          create_party: "parties",
          edit_party: "parties",
          delete_party: "parties",
          manage_party: "parties",
          view_parties: "parties",
          create_parties: "parties",
          edit_parties: "parties",
          delete_parties: "parties",
          manage_parties: "parties",
          // Work Types
          view_worktype: "work_types",
          view_work_types: "work_types",
          create_work_types: "work_types",
          edit_work_types: "work_types",
          delete_work_types: "work_types",
          manage_work_types: "work_types",
          // Sub Work Types
          view_sub_type_of_work: "sub_work_types",
          view_sub_work_types: "sub_work_types",
          create_sub_work_types: "sub_work_types",
          edit_sub_work_types: "sub_work_types",
          delete_sub_work_types: "sub_work_types",
          manage_sub_work_types: "sub_work_types",
          // States
          view_state: "states",
          view_states: "states",
          create_states: "states",
          edit_states: "states",
          delete_states: "states",
          manage_states: "states",
          // Divisions
          view_division: "divisions",
          view_divisions: "divisions",
          create_divisions: "divisions",
          edit_divisions: "divisions",
          delete_divisions: "divisions",
          manage_divisions: "divisions",
          // Districts
          view_district: "districts",
          view_districts: "districts",
          create_districts: "districts",
          edit_districts: "districts",
          delete_districts: "districts",
          manage_districts: "districts",
          // Samiti
          view_samiti: "samiti",
          create_samiti: "samiti",
          edit_samiti: "samiti",
          delete_samiti: "samiti",
          manage_samiti: "samiti",
          export_samiti: "samiti",
          // Activity
          view_activity_logs: "activity_management",
          view_user_activity_report: "activity_management",
          // Assemblies (Vidhan Sabha)
          view_assemblies: "assemblies",
          create_assemblies: "assemblies",
          edit_assemblies: "assemblies",
          delete_assemblies: "assemblies",
          manage_assemblies: "assemblies",
          // Vidhan Sabha Samiti
          view_vidhan_sabha_samiti: "vidhan_sabha_samiti",
          // MP Public Problems
          view_mp_public_problems: "mp_public_problems",
          create_mp_public_problems: "mp_public_problems",
          edit_mp_public_problems: "mp_public_problems",
          delete_mp_public_problems: "mp_public_problems",
        };

        const requiredModule =
          permissionToModuleMap[permissionName] ||
          permissionName.replace(
            /^(view|create|edit|delete|manage|export)_/,
            "",
          );

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

      // Tenant Admin Level OR System Administrator userType — always allow core views
      if (secondaryAdmin) {
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
          // Full permission → module map (same as above, ensures singular/plural both work)
          const permissionToModuleMap: Record<string, string> = {
            view_member: "members",
            create_member: "members",
            view_event: "events",
            create_event: "events",
            view_visitor: "visitors",
            create_visitor: "visitors",
            view_project: "projects",
            create_project: "projects",
            view_assembly_issue: "assembly_issues",
            view_voter: "voters",
            view_voters: "voters",
            create_voter: "voters",
            create_voters: "voters",
            edit_voter: "voters",
            edit_voters: "voters",
            delete_voter: "voters",
            delete_voters: "voters",
            export_voter: "voters",
            export_voters: "voters",
            view_panchayat: "panchayats",
            view_panchayats: "panchayats",
            create_panchayat: "panchayats",
            create_panchayats: "panchayats",
            edit_panchayat: "panchayats",
            edit_panchayats: "panchayats",
            delete_panchayat: "panchayats",
            delete_panchayats: "panchayats",
            manage_panchayat: "panchayats",
            manage_panchayats: "panchayats",
            view_parliament: "parliaments",
            view_parliaments: "parliaments",
            create_parliament: "parliaments",
            create_parliaments: "parliaments",
            edit_parliament: "parliaments",
            edit_parliaments: "parliaments",
            delete_parliament: "parliaments",
            delete_parliaments: "parliaments",
            manage_parliament: "parliaments",
            manage_parliaments: "parliaments",
            view_village: "villages",
            view_villages: "villages",
            view_booth: "booths",
            view_booths: "booths",
            view_block: "blocks",
            view_blocks: "blocks",
            view_department: "departments",
            view_departments: "departments",
            view_party: "parties",
            view_parties: "parties",
            view_worktype: "work_types",
            view_work_types: "work_types",
            view_sub_type_of_work: "sub_work_types",
            view_sub_work_types: "sub_work_types",
            view_state: "states",
            view_states: "states",
            view_division: "divisions",
            view_divisions: "divisions",
            view_district: "districts",
            view_districts: "districts",
            view_samiti: "samiti",
            view_activity_logs: "activity_management",
            view_user_activity_report: "activity_management",
            view_assemblies: "assemblies",
            manage_assemblies: "assemblies",
            view_vidhan_sabha_samiti: "vidhan_sabha_samiti",
            view_mp_public_problems: "mp_public_problems",
          };

          const rawModule =
            permissionToModuleMap[permissionName] ||
            permissionName.replace(
              /^(view|create|edit|delete|manage|export)_/,
              "",
            );

          if (user.tenant.enabledModules.includes(rawModule)) {
            return true;
          }
        }
      }

      // Secondary org admins bypass the role-based check below.
      // If we got here, the module subscription check passed — grant access.
      if (secondaryAdmin) {
        return true;
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
