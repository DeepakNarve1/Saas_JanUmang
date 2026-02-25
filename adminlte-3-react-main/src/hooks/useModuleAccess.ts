import { useMemo } from "react";
import { useAppSelector } from "@app/store/store";
import { ModuleId } from "@app/config/modules"; // Assuming this exists or I'll create it
import { usePermissions } from "./usePermissions";

export const useModuleAccess = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const { isSuperAdmin } = usePermissions();

  const checkModuleAccess = useMemo(
    () => (moduleId: string) => {
      // Platform admins (no tenantId + system_admin/superadmin level) always have access
      if (isSuperAdmin()) return true;

      // If no tenant, deny access (unless superadmin)
      if (!currentUser?.tenant) return false;

      // Check tenant's enabled modules
      const enabledModules = currentUser.tenant.enabledModules || [];
      return enabledModules.includes(moduleId);
    },
    [currentUser, isSuperAdmin],
  );

  return {
    checkModuleAccess,
    enabledModules: currentUser?.tenant?.enabledModules || [],
  };
};
