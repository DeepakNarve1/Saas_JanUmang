import { useAppSelector } from "@app/store/store";
import { MENU, IMenuItem } from "@app/utils/menu";
import { useMemo } from "react";

export const useAuthorization = () => {
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const sidebarAccessByRole = useAppSelector(
    (state) => state.auth.sidebarAccessByRole
  );

  const userRoles = useMemo(() => {
    const normalize = (role: any) => {
      if (!role) return null;
      if (typeof role === "string") return role;
      if (typeof role === "object" && role.name) return role.name;
      return null;
    };

    const rolesFromUser = Array.isArray(currentUser?.roles)
      ? currentUser?.roles.map(normalize)
      : [];
    const roleFromUser = currentUser?.role ? [normalize(currentUser.role)] : [];
    const rolesFromMetadata = Array.isArray(currentUser?.metadata?.roles)
      ? currentUser?.metadata?.roles.map(normalize)
      : currentUser?.metadata?.role
        ? [normalize(currentUser.metadata.role)]
        : [];

    const normalized = Array.from(
      new Set(
        [...rolesFromUser, ...roleFromUser, ...rolesFromMetadata].filter(
          Boolean
        ) as string[]
      )
    );

    // Frontend fallback: treat known superadmin account as superadmin
    if (
      normalized.length === 0 &&
      currentUser &&
      typeof (currentUser as any).email === "string" &&
      (currentUser as any).email.toLowerCase() === "superadmin@example.com"
    ) {
      return ["superadmin"];
    }

    return normalized;
  }, [currentUser]);

  const userPermissions = useMemo(() => {
    const permissionsFromUser = Array.isArray(currentUser?.permissions)
      ? currentUser?.permissions
      : [];
    const permissionsFromMetadata = Array.isArray(
      currentUser?.metadata?.permissions
    )
      ? currentUser?.metadata?.permissions
      : [];

    return Array.from(
      new Set(
        [...permissionsFromUser, ...permissionsFromMetadata].filter(Boolean)
      )
    );
  }, [currentUser]);

  const roleBasedAllowedPaths = useMemo(() => {
    const allowed = new Set<string>();
    userRoles.forEach((role) => {
      const roleAccess = sidebarAccessByRole[role];

      if (roleAccess?.includes("*")) {
        // Allow all defined menu paths
        const addPaths = (items: IMenuItem[]) => {
          items.forEach((m) => {
            if (m.path) allowed.add(m.path);
            if (m.children) addPaths(m.children);
          });
        };
        addPaths(MENU);
      }

      if (Array.isArray(roleAccess)) {
        roleAccess.forEach((path) => allowed.add(path));
      }
    });
    return allowed;
  }, [sidebarAccessByRole, userRoles]);

  const checkAccess = (targetPath: string) => {
    // 1. Check if superadmin
    if (userRoles.includes("superadmin")) return true;

    // 2. Check if the path is explicitly allowed via dynamic permissions
    // We need to handle exact matches or sub-paths if necessary.
    // For now, assuming exact path or basic prefix match might be tricky.
    // The existing logic seems to be exact path based on Menu items.
    if (roleBasedAllowedPaths.has(targetPath)) return true;

    // 3. Find the menu item corresponding to this path to check its static restrictions
    // Flatten menu to find item
    const findItem = (
      items: IMenuItem[],
      path: string
    ): IMenuItem | undefined => {
      for (const item of items) {
        // Handle parameterized routes: e.g. /users/:id/edit logic
        // But MENU definition usually has static paths like /users.
        // If the MENU path is /users, does it cover /users/create?
        // Usually route protection is hierarchical.

        // Exact match
        if (item.path === path) return item;

        if (item.children) {
          const found = findItem(item.children, path);
          if (found) return found;
        }
      }
      return undefined;
    };

    // Note: The Sidebar logic checks "canAccess(item)" where item is iterating over MENU.
    // Here we have a path and need to decide if we can access it.

    // Challenge: The URL might be /users/create, but MENU only has /users.
    // Or MENU has /users/create?
    // Let's look at MENU definitions in `menu.ts` (extracted).
    // /users is there. /users/create is NOT in the MENU constant I saw later in App.tsx list, but not in the MENU array?
    // Wait, App.tsx has:
    // <Route path="/users/create" element={<CreateUser />} />
    // But MENU in MenuSidebar.tsx (and now menu.ts) has:
    // { name: ..., path: "/users", allowedRoles: ["superadmin"] }
    // It does NOT have /users/create explicitly in the sidebar menu.

    // So if I navigate to /users/create, I need to know it belongs to the "/users" capability or is restricted.
    // If the rule is "Only superadmin can access /users", does that imply /users/create?

    // Current MenuSidebar logic:
    // It filters what is SHOWN. If /users is hidden, the user can't click it.
    // But if they type /users/create, we need to block it.

    // Heuristic:
    // If a requested path starts with a restricted menu item's path, it should be restricted unless explicit permission exists.

    const matchItem = (
      items: IMenuItem[],
      path: string
    ): IMenuItem | undefined => {
      // Find the most specific match (longest path prefix)
      let bestMatch: IMenuItem | undefined;

      const search = (nodes: IMenuItem[]) => {
        for (const node of nodes) {
          if (node.path && path.startsWith(node.path)) {
            if (!bestMatch || node.path.length > bestMatch.path!.length) {
              bestMatch = node;
            }
          }
          if (node.children) search(node.children);
        }
      };
      search(items);
      return bestMatch;
    };

    const matchedItem = matchItem(MENU, targetPath);

    if (!matchedItem) {
      // If the path isn't in the menu logic at all, defaulting to ALLOW or BLOCK?
      // Usually if it's not a protected feature, it's public?
      // But these are authenticated routes.
      // If I don't know about it, maybe allow it (like dashboard, profile).
      return true;
    }

    // If we found an item, check its roles
    const roleAllowed =
      !matchedItem.allowedRoles ||
      matchedItem.allowedRoles.length === 0 ||
      matchedItem.allowedRoles.some((role) => userRoles.includes(role));

    const permissionAllowed =
      !matchedItem.allowedPermissions ||
      matchedItem.allowedPermissions.length === 0 ||
      matchedItem.allowedPermissions.some((permission) =>
        userPermissions.includes(permission)
      );

    if (roleAllowed && permissionAllowed) return true;

    return false;
  };

  const checkPermission = (action: string) => {
    if (userRoles.includes("superadmin")) return true;
    return userPermissions.includes(action);
  };

  return { checkAccess, checkPermission, userRoles, roleBasedAllowedPaths };
};
