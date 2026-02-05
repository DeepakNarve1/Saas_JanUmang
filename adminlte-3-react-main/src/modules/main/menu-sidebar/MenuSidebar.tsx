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

  // Check if user is superadmin
  const isSuperadmin = useMemo(() => {
    if (!user || !user.role) return false;
    if (typeof user.role === "string") {
      return user.role === "superadmin";
    }
    return user.role.name === "superadmin";
  }, [user]);

  const canAccess = (item: IMenuItem) => {
    // Superadmin can see everything
    if (isSuperadmin) {
      return true;
    }

    // 1. Check strict permissions if defined (e.g. manage_roles)
    if (item.allowedPermissions && item.allowedPermissions.length > 0) {
      const hasAccess = item.allowedPermissions.some((p) => hasPermission(p));
      return hasAccess;
    }

    // 2. If item has a resource, check view permission for that resource
    if (item.resource) {
      const viewPermission = `view_${item.resource}`;
      const canView = hasPermission(viewPermission);

      return canView;
    }

    // Allow items without resource (like headers)
    return true;
  };

  const filteredMenu = useMemo(() => {
    const filterItems = (items: IMenuItem[]): IMenuItem[] =>
      items
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
                {currentUser?.email?.split("@")[0]}
              </Link>
              <span className="text-xs opacity-60 truncate block">
                Administrator
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
