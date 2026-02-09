import { useMemo } from "react";
import Link from "next/link";
import { MenuItem } from "@components";
import Image from "@app/components/Image";
import { useAppSelector } from "@app/store/store";
import { MENU, IMenuItem, SUPER_ADMIN_MENU_PATHS } from "@app/utils/menu";
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

  // Check if user is superadmin (Global platform access)
  const isSuperadmin = useMemo(() => {
    if (!user) return false;

    // SaaS Level check
    if (user.level === "system_admin" || user.level === "superadmin") {
      return true;
    }

    if (!user.role) return false;

    // Legacy/Role check
    if (typeof user.role === "string") {
      return user.role === "superadmin" || user.role === "system_admin";
    }
    return user.role.name === "superadmin" || user.role.name === "system_admin";
  }, [user]);

  const canAccess = (item: IMenuItem) => {
    // Super admin sees only Dashboard + Organizations
    if (isSuperadmin) {
      const path = item.path ?? item.children?.[0]?.path;
      return path ? SUPER_ADMIN_MENU_PATHS.includes(path) : false;
    }

    // For tenant admins and other users:
    // Block access to Organizations module
    if (item.path === "/tenants" || item.resource === "tenants") {
      return false;
    }

    // 1. Check role-based access if allowedRoles is defined
    if (item.allowedRoles && item.allowedRoles.length > 0) {
      // Check if user's level matches any allowed role
      const userLevel = user?.level || "";
      const hasRoleAccess = item.allowedRoles.includes(userLevel);
      if (hasRoleAccess) return true;

      // Also check user's role name
      if (user?.role) {
        const roleName =
          typeof user.role === "string" ? user.role : user.role.name;
        if (item.allowedRoles.includes(roleName)) return true;
      }
    }

    // 2. Check strict permissions if defined (e.g. manage_roles)
    if (item.allowedPermissions && item.allowedPermissions.length > 0) {
      const hasAccess = item.allowedPermissions.some((p) => hasPermission(p));
      if (hasAccess) return true;
    }

    // 3. If item has a resource, check view permission for that resource
    if (item.resource) {
      const viewPermission = `view_${item.resource}`;
      const canView = hasPermission(viewPermission);
      if (canView) return true;
    }

    // 4. Allow items without specific restrictions (like headers)
    // But only if they don't have allowedRoles or allowedPermissions defined
    if (!item.allowedRoles && !item.allowedPermissions && !item.resource) {
      return true;
    }

    return false;
  };

  const filteredMenu = useMemo(() => {
    let items = MENU;
    // Super admin: only show Dashboard and Organizations (no nested children for others)
    if (isSuperadmin) {
      items = MENU.filter((item) => {
        const path = item.path ?? item.children?.[0]?.path;
        return path && SUPER_ADMIN_MENU_PATHS.includes(path);
      });
    }

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

    return filterItems(items);
  }, [user, isSuperadmin]); // Re-filter when user changes

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
                {currentUser?.level || "Member"}
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
