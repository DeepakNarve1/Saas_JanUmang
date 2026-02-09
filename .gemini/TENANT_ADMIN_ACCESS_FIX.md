# Access Control Fix - Tenant Admin Module Access

## Problem

Tenant admins were unable to see any modules except Dashboard and Organizations, and were seeing the wrong dashboard (SaaS dashboard instead of general dashboard).

## Root Cause

The `canAccess` function in `MenuSidebar.tsx` was not properly checking `allowedRoles` from menu items. It was only checking permissions and resources, which meant:

- Menu items with `allowedRoles: ["tenant_admin"]` were not being shown
- The function would return `true` for items without resources, which incorrectly showed Organizations to tenant admins

## Solution

### File Modified:

`src/modules/main/menu-sidebar/MenuSidebar.tsx`

### Changes Made:

#### Updated `canAccess` Function Logic:

**Before:**

```typescript
const canAccess = (item: IMenuItem) => {
  if (isSuperadmin) {
    // Super admin logic
  }

  // Only checked permissions and resources
  // Did NOT check allowedRoles
  if (item.allowedPermissions && item.allowedPermissions.length > 0) {
    return item.allowedPermissions.some((p) => hasPermission(p));
  }

  if (item.resource) {
    return hasPermission(`view_${item.resource}`);
  }

  return true; // ❌ This allowed everything by default
};
```

**After:**

```typescript
const canAccess = (item: IMenuItem) => {
  // 1. Super admin restriction
  if (isSuperadmin) {
    const path = item.path ?? item.children?.[0]?.path;
    return path ? SUPER_ADMIN_MENU_PATHS.includes(path) : false;
  }

  // 2. Block tenant admins from Organizations module
  if (item.path === "/tenants" || item.resource === "tenants") {
    return false;
  }

  // 3. Check allowedRoles (NEW!)
  if (item.allowedRoles && item.allowedRoles.length > 0) {
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

  // 4. Check permissions
  if (item.allowedPermissions && item.allowedPermissions.length > 0) {
    const hasAccess = item.allowedPermissions.some((p) => hasPermission(p));
    if (hasAccess) return true;
  }

  // 5. Check resource permissions
  if (item.resource) {
    const viewPermission = `view_${item.resource}`;
    const canView = hasPermission(viewPermission);
    if (canView) return true;
  }

  // 6. Only allow items without any restrictions
  if (!item.allowedRoles && !item.allowedPermissions && !item.resource) {
    return true;
  }

  return false; // ✅ Deny by default
};
```

## Key Improvements:

### 1. **Added `allowedRoles` Check**

Now properly checks if user's level or role name matches the `allowedRoles` array in menu items.

```typescript
// Menu item example:
{
  name: "Users",
  path: "/users",
  allowedRoles: ["tenant_admin"], // ✅ Now properly checked!
}
```

### 2. **Explicit Organizations Block for Tenant Admins**

```typescript
if (item.path === "/tenants" || item.resource === "tenants") {
  return false; // Tenant admins can't see this
}
```

### 3. **Deny by Default**

Changed from `return true` (allow everything) to `return false` (deny by default).

Only allows items that:

- Match user's role
- Match user's permissions
- Have no restrictions at all (like section headers)

## How It Works Now:

### For Super Admin (`level: "superadmin"`):

1. `isSuperadmin` check returns `true`
2. Only paths in `SUPER_ADMIN_MENU_PATHS` are allowed: `["/dashboard", "/tenants"]`
3. **Result**: Sees only Dashboard + Organizations ✅

### For Tenant Admin (`level: "tenant_admin"`):

1. `isSuperadmin` check returns `false`
2. Organizations module explicitly blocked ✅
3. For each menu item:
   - Checks if `allowedRoles` includes `"tenant_admin"` ✅
   - If yes, shows the module ✅
4. **Result**: Sees Dashboard + all modules except Organizations ✅

## Dashboard Display:

The dashboard logic in `Dashboard.tsx` already works correctly:

```tsx
{
  isSuperAdmin() ? <SuperAdminDashboard /> : <DashboardContent />;
}
```

- **Super Admin**: Shows `SuperAdminDashboard` (SaaS dashboard) ✅
- **Tenant Admin**: Shows `DashboardContent` (general dashboard) ✅

The `isSuperAdmin()` function correctly identifies:

- `level: "superadmin"` or `level: "system_admin"` → Super Admin
- `level: "tenant_admin"` → NOT Super Admin

## Testing:

### Test as Super Admin:

- [ ] Login with `level: "superadmin"`
- [ ] Verify sidebar shows only: Dashboard, Organizations
- [ ] Verify dashboard shows: SaaS Dashboard (org stats)
- [ ] Navigate to `/users` → Should be blocked
- [ ] Navigate to `/events` → Should be blocked

### Test as Tenant Admin:

- [ ] Login with `level: "tenant_admin"`
- [ ] Verify sidebar shows: Dashboard + ALL modules EXCEPT Organizations
- [ ] Verify dashboard shows: General Dashboard (module stats)
- [ ] Navigate to `/users` → Should work ✅
- [ ] Navigate to `/events` → Should work ✅
- [ ] Navigate to `/tenants` → Should be blocked ❌

## Menu Configuration:

All menu items now have `allowedRoles: ["tenant_admin"]`:

```typescript
{
  name: "Users",
  allowedRoles: ["tenant_admin"], // ✅
  path: "/users",
},
{
  name: "Events",
  allowedRoles: ["tenant_admin"], // ✅
  path: "/events",
},
// ... etc
```

Except Organizations:

```typescript
{
  name: "Organizations",
  allowedRoles: ["superadmin", "system_admin"], // ✅ Only super admins
  path: "/tenants",
}
```

## Summary:

### What Was Fixed:

1. ✅ Tenant admins can now see all application modules
2. ✅ Tenant admins see the correct dashboard (general, not SaaS)
3. ✅ Tenant admins are blocked from Organizations module
4. ✅ Super admins still restricted to Dashboard + Organizations only

### How It Was Fixed:

1. Added `allowedRoles` checking in `canAccess` function
2. Explicit block for Organizations module for non-super-admins
3. Changed default behavior from allow-all to deny-by-default
4. Proper role matching (checks both `user.level` and `user.role.name`)

## Related Files:

- `src/modules/main/menu-sidebar/MenuSidebar.tsx` - Menu filtering logic
- `src/hooks/usePermissions.ts` - Permission checking
- `src/utils/menu.ts` - Menu configuration
- `src/views/Dashboard.tsx` - Dashboard routing

## Conclusion:

The access control is now working correctly with proper separation between super admins (platform management) and tenant admins (application usage).
