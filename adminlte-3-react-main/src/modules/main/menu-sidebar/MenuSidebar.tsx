import { useMemo } from "react";
import Link from "next/link";
import { MenuItem } from "@components";
import Image from "@app/components/Image";
import { useAppSelector } from "@app/store/store";
import { MENU, IMenuItem } from "@app/utils/menu";
import { usePermissions } from "@app/hooks/usePermissions";
import { Avatar, AvatarFallback, AvatarImage } from "@app/components/ui/avatar";
import { Users } from "lucide-react";

const MenuSidebar = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sidebarSkin = useAppSelector((state) => state.ui.sidebarSkin);
  const menuItemFlat = useAppSelector((state) => state.ui.menuItemFlat);
  const menuChildIndent = useAppSelector((state) => state.ui.menuChildIndent);
  const menuSidebarCollapsed = useAppSelector(
    (state) => state.ui.menuSidebarCollapsed,
  );
  const screenSize = useAppSelector((state) => state.ui.screenSize);

  // Use our permission hook
  const { hasPermission, user } = usePermissions();

  // Check if user is superadmin (Global platform access — NO tenantId allowed)
  const isSuperadmin = useMemo(() => {
    if (!user) return false;

    // CRITICAL: Any user belonging to an organisation is NEVER a platform admin.
    // This mirrors the backend isGlobalAdmin() security check.
    if (user.tenantId) return false;

    // Only users without a tenantId and with platform-level roles are superadmins
    if (user.level === "system_admin" || user.level === "superadmin") {
      return true;
    }

    if (!user.role) return false;

    // Legacy/Role check (only valid for platform users, i.e. no tenantId already checked above)
    if (typeof user.role === "string") {
      return user.role === "superadmin" || user.role === "system_admin";
    }
    return user.role.name === "superadmin" || user.role.name === "system_admin";
  }, [user]);

  const canAccess = (item: IMenuItem) => {
    // 1. Basic SaaS isolation — hide /tenants from non-platform-admins
    if (
      !isSuperadmin &&
      (item.path === "/tenants" || item.resource === "tenants")
    ) {
      return false;
    }

    // 2. Subscription is strictly tenant_admin only.
    //    Only an org admin (level=tenant_admin WITH a tenantId) can see it.
    //    Platform admins, employees, and custom-role users cannot.
    if (item.path === "/subscription") {
      return !!(user as any)?.tenantId && user?.level === "tenant_admin";
    }

    // 3. Check allowedRoles if defined — match on level only (NOT role name)
    //    Matching on role.name is a security risk: a tenant could create a role
    //    named "tenant_admin" and get access to restricted menu items.
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      const userLevel = user?.level || "";
      const hasRoleMatch = item.allowedRoles.includes(userLevel);
      if (!hasRoleMatch) return false;
    }

    // 4. Check specific permissions if defined
    if (item.allowedPermissions && item.allowedPermissions.length > 0) {
      const hasPerm = item.allowedPermissions.some((p) => hasPermission(p));
      if (!hasPerm) return false;
    }

    // 5. Check view permission for the resource if defined
    if (item.resource) {
      if (!isSuperadmin) {
        const tenantModules = (user as any)?.tenant?.enabledModules || [];
        // Core items that should always be allowed regardless of the subscription configuration
        // (to prevent accidentally locking out the user from logging in/viewing profiles)
        const ALWAYS_ALLOWED_RESOURCES = [
          "dashboard",
          "users",
          "roles",
          "tenants",
          "activity_management",
          "activity_logs",
          "user_activity_report",
        ];

        if (
          !ALWAYS_ALLOWED_RESOURCES.includes(item.resource) &&
          !tenantModules.includes(item.resource)
        ) {
          return false;
        }
      }

      // Handle legacy singular resource names in permissions
      const resourceMap: Record<string, string> = {
        panchayats: "panchayat",
        parties: "party",
        work_types: "worktype",
        sub_work_types: "sub_type_of_work",
        departments: "department",
        voters: "voter",
        inward_register: "inward_register",
        dispatch_register: "dispatch_register",
        call_management: "call_management",
        booths: "booth",
      };

      const permissionResource =
        resourceMap[item.resource as string] || item.resource;
      const viewPermission = `view_${permissionResource}`;

      // Check both mapped (singular/legacy) and original (plural/standard) permissions
      if (
        !hasPermission(viewPermission) &&
        !hasPermission(`view_${item.resource}`)
      )
        return false;
    }

    return true;
  };

  const filteredMenu = useMemo(() => {
    // 1. Super Admin Logic: Dashboard & Tenants + Modules Dropdown + Plans
    if (isSuperadmin) {
      const superAdminPaths = ["/dashboard", "/tenants"];
      const planPath = "/plans";

      // Core items (Dashboard, Organizations)
      const mainItems = MENU.filter((item) => {
        const path = item.path ?? item.children?.[0]?.path;
        return path && superAdminPaths.includes(path);
      });

      // Plans item
      const planItem = MENU.find((item) => item.path === planPath);

      // All other items go into "Modules" dropdown
      const tenantOnlyPaths = ["/subscription"];
      const moduleItems = MENU.filter((item) => {
        const path = item.path ?? item.children?.[0]?.path;
        // Exclude core admin items and Plans (as we handle it standalone)
        if (path && (superAdminPaths.includes(path) || path === planPath))
          return false;
        // Exclude tenant-only items
        if (path && tenantOnlyPaths.includes(path)) return false;
        return true;
      });

      const modulesDropdown: IMenuItem = {
        name: "Modules",
        icon: "fas fa-cubes nav-icon",
        children: moduleItems,
      };

      // Return order: Dashboard & Organizations, then Plans, then Modules dropdown
      const finalMenu = [...mainItems];
      if (planItem) finalMenu.push(planItem);
      finalMenu.push(modulesDropdown);

      return finalMenu;
    }

    // 2. Normal Logic for Tenant Admins / Others
    // Show flat list (or whatever structure is in MENU), filtered by permissions
    const filterItems = (list: IMenuItem[]): IMenuItem[] =>
      list
        .map((item) => {
          const filteredChildren = item.children
            ? filterItems(item.children)
            : undefined;
          const itemAllowed = canAccess(item);

          if (
            !itemAllowed &&
            (!filteredChildren || filteredChildren.length === 0)
          ) {
            return null;
          }

          return { ...item, children: filteredChildren };
        })
        .filter(Boolean) as IMenuItem[];

    return filterItems(MENU);
  }, [user, isSuperadmin]);

  const darkMode = useAppSelector((state) => state.ui.darkMode);

  const sidebarClasses = useMemo(() => {
    let classes = `fixed top-0 left-0 h-screen overflow-y-hidden z-[1038] transition-all duration-300 shadow-2xl group border-r `;

    if (darkMode) {
      // Premium Dark - Modern Charcoal theme
      classes += "bg-[#17181A] text-gray-100 border-gray-800";
    } else {
      // Clean Light Mode
      classes += "bg-white text-slate-700 border-gray-100";
    }

    if (screenSize === "lg") {
      if (menuSidebarCollapsed) {
        // Mini sidebar, expands on hover
        classes += " w-[73px] hover:w-[260px]";
      } else {
        classes += " w-[260px]";
      }
    } else {
      classes += menuSidebarCollapsed
        ? " w-[260px] translate-x-0"
        : " w-[260px] -translate-x-full";
    }
    return classes;
  }, [darkMode, screenSize, menuSidebarCollapsed]);

  const isMini = screenSize === "lg" && menuSidebarCollapsed;

  return (
    <aside id="menu-sidebar" className={sidebarClasses}>
      {/* Brand Logo */}
      <Link
        id="brand-logo"
        href="/"
        className={`flex items-center h-[57px] px-6 border-b transition-colors ${
          !darkMode
            ? "border-gray-100 hover:bg-gray-50"
            : "border-gray-800 hover:bg-gray-800/50"
        }`}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-[#368F8B] to-[#2d7a76] shadow-lg shrink-0">
          <Users className="w-5 h-5 text-white" />
        </div>
        <span
          className={`ml-3 text-lg font-semibold tracking-wide whitespace-nowrap transition-all duration-300 ${
            darkMode ? "text-gray-100" : "text-emerald-950"
          } ${
            isMini ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
          } group-hover:opacity-100 group-hover:w-auto`}
        >
          JAN UMANG
        </span>
      </Link>

      {/* Sidebar Content */}
      <div className="h-full overflow-y-auto overflow-x-hidden pb-16 custom-scrollbar">
        {/* User Panel */}
        <div
          id="user-panel"
          className={`px-4 py-6 border-b transition-colors ${
            !darkMode ? "border-gray-100" : "border-gray-800"
          }`}
        >
          <div className="flex items-center">
            <div className="shrink-0 relative">
              <Avatar className="mx-auto h-12 w-12 ring-4 ring-white shadow-lg">
                <AvatarImage src={currentUser?.photoURL || ""} />
                <AvatarFallback className="bg-linear-to-br from-[#00563B] to-[#368F8B] text-white text-2xl font-bold">
                  {currentUser?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div
              className={`ml-3 overflow-hidden transition-all duration-300 ${
                isMini ? "opacity-0 w-0" : "opacity-100 w-auto"
              } group-hover:opacity-100 group-hover:w-auto`}
            >
              <Link
                href={"/profile"}
                className="block text-sm font-semibold truncate hover:text-pink-500 transition-colors"
              >
                {currentUser?.name || currentUser?.email?.split("@")[0]}
              </Link>
              <span className="text-xs font-bold text-[#368F8B] truncate block">
                {(currentUser as any).tenant?.name || "Organization"}
              </span>
              <span className="text-[10px] opacity-60 truncate block uppercase">
                {(() => {
                  const u = currentUser as any;
                  // Show role displayName if available (most specific)
                  if (u?.role?.displayName) return u.role.displayName;
                  // Translate level to friendly label
                  const levelMap: Record<string, string> = {
                    system_admin: "Platform Admin",
                    superadmin: "Platform Admin",
                    tenant_admin: "Org Admin",
                    regularUser: u?.role?.name || "Member",
                  };
                  return levelMap[u?.level] || u?.role?.name || "Member";
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Search
        <div
          className={`px-3 py-4 transition-all duration-300 ${
            isMini ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
          } group-hover:opacity-100 group-hover:h-auto group-hover:overflow-visible`}
        >
          <SidebarSearch />
        </div> */}

        {/* Navigation */}
        <nav className="mt-2 px-3 overflow-y-hidden">
          <ul
            className={`flex flex-col gap-1 w-full m-0 p-0 list-none ${
              menuItemFlat ? " nav-flat" : ""
            }${menuChildIndent ? " nav-child-indent" : ""}`}
            role="menu"
          >
            {filteredMenu.map((menuItem: IMenuItem) => (
              <MenuItem
                key={menuItem.name + menuItem.path}
                menuItem={menuItem}
              />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default MenuSidebar;
