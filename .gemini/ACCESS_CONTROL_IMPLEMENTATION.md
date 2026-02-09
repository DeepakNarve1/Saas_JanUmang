# Access Control Implementation - Super Admin vs Tenant Admin

## Overview

Implemented proper role-based access control to separate Super Admin (System Administrator) and Tenant Admin responsibilities.

## Access Control Rules

### **Super Admin / System Administrator**

**Level**: `system_admin` or `superadmin`

**Can Access:**

- ✅ **Dashboard** - Super admin specific dashboard
- ✅ **Organizations Module** - Full tenant management
  - Create organizations
  - Edit organizations
  - Delete organizations
  - Manage organization users
  - View organization details

**Cannot Access:**

- ❌ All other application modules (assemblies, blocks, booths, events, etc.)
- ❌ Tenant-specific data and operations

**Purpose**: Platform management only - managing organizations and their settings

---

### **Tenant Admin (Organization Admin)**

**Level**: `tenant_admin`

**Can Access:**

- ✅ **Dashboard** - General dashboard with module statistics
- ✅ **All Application Modules**:
  - Users Management
  - Roles Management
  - Master Data (States, Districts, Divisions, Assemblies, etc.)
  - Events Management
  - Call Management
  - Department Management
  - Document Management (Inward/Dispatch)
  - Activity Logs
  - And all other modules

**Cannot Access:**

- ❌ **Organizations Module** - Cannot manage other tenants

**Purpose**: Full application functionality within their organization

---

## Implementation Details

### Files Modified:

#### 1. **`src/hooks/usePermissions.ts`**

**Changes Made:**

##### `hasPermission` Function:

- Super admins can ONLY have these permissions:
  - `manage_tenants`
  - `view_tenants`
  - `create_tenants`
  - `update_tenants`
  - `delete_tenants`
  - `view_dashboard`
- All other permission checks return `false` for super admins
- Tenant admins check permissions from their role

##### `hasSidebarAccess` Function:

- Super admins can ONLY access these paths:
  - `/dashboard`
  - `/tenants`
- All other sidebar paths return `false` for super admins
- Tenant admins with wildcard (`*`) access can see all paths EXCEPT `/tenants`
- Other roles check their specific sidebar access list

**Before:**

```typescript
// Super admins had full access to everything
if (user.level === "system_admin" || user.level === "superadmin") {
  return true; // ❌ Too permissive
}
```

**After:**

```typescript
// Super admins restricted to specific paths/permissions
if (user.level === "system_admin" || user.level === "superadmin") {
  const allowedPaths = ["/dashboard", "/tenants"];
  return allowedPaths.includes(path); // ✅ Restricted
}
```

#### 2. **`src/utils/menu.ts`**

**Changes Made:**

- Changed `allowedRoles` from `["superadmin"]` to `["tenant_admin"]` for ALL modules except:
  - Dashboard (accessible to both)
  - Organizations (only super admin)

**Modules Updated** (changed to `tenant_admin`):

- Users
- Roles
- User Count
- Member List
- MP Public Problem
- Assembly Issue
- Vidhasabha Samiti
- Project Summary
- Visitors
- Events
- Voter
- Samiti
- District
- Vidhan Sabha
- Block
- Booth
- Panchayat
- Village
- Party
- Department
- Worktype
- Sub Type of Work
- State
- Division
- Parliament
- Assembly
- Phone Directory
- In Docs
- Inward Register
- Dispatch Register
- Call Management
- Activity Management

**Organizations Module** (kept as super admin only):

```typescript
{
  name: "Organizations",
  icon: "fas fa-building nav-icon",
  path: "/tenants",
  allowedRoles: ["superadmin", "system_admin"], // ✅ Only super admins
  resource: "tenants",
}
```

---

## How It Works

### For Super Admin Login:

1. User logs in with `level: "superadmin"` or `level: "system_admin"`
2. `hasSidebarAccess("/dashboard")` → ✅ Returns `true`
3. `hasSidebarAccess("/tenants")` → ✅ Returns `true`
4. `hasSidebarAccess("/users")` → ❌ Returns `false`
5. `hasSidebarAccess("/events")` → ❌ Returns `false`
6. **Result**: Sidebar shows only Dashboard and Organizations

### For Tenant Admin Login:

1. User logs in with `level: "tenant_admin"`
2. `hasSidebarAccess("/dashboard")` → ✅ Returns `true`
3. `hasSidebarAccess("/tenants")` → ❌ Returns `false` (explicitly blocked)
4. `hasSidebarAccess("/users")` → ✅ Returns `true` (checks role permissions)
5. `hasSidebarAccess("/events")` → ✅ Returns `true` (checks role permissions)
6. **Result**: Sidebar shows Dashboard + all modules except Organizations

---

## Dashboard Differences

### Super Admin Dashboard:

Should show:

- Total number of organizations
- Active/Inactive organizations
- Total users across all organizations
- Organization statistics
- System-wide metrics

### Tenant Admin Dashboard:

Should show:

- Module-specific statistics (events, calls, assemblies, etc.)
- User activity within their organization
- Data counts for their organization
- Reports and analytics for their data

**Note**: Dashboard component may need updates to show different content based on user level.

---

## Security Implications

### What This Prevents:

1. **Super Admins Cannot:**
   - Access tenant-specific data
   - Modify assemblies, blocks, booths
   - Create events or manage calls
   - View or edit master data
   - Access activity logs of tenant operations

2. **Tenant Admins Cannot:**
   - View other organizations
   - Create new organizations
   - Modify organization settings (except their own via different flow)
   - Delete organizations
   - Access system-wide administration

### Why This Matters:

- **Separation of Concerns**: Platform management vs application usage
- **Data Isolation**: Tenants can't see other tenants' data
- **Security**: Limits blast radius of compromised accounts
- **Compliance**: Clear audit trail of who can access what
- **Scalability**: Easy to onboard new organizations without security risks

---

## Testing Checklist

### Test as Super Admin:

- [ ] Login as super admin
- [ ] Verify sidebar shows only Dashboard and Organizations
- [ ] Navigate to `/dashboard` - should work
- [ ] Navigate to `/tenants` - should work
- [ ] Try to navigate to `/users` - should redirect or show error
- [ ] Try to navigate to `/events` - should redirect or show error
- [ ] Verify can create/edit/delete organizations
- [ ] Verify can add/remove users from organizations

### Test as Tenant Admin:

- [ ] Login as tenant admin
- [ ] Verify sidebar shows Dashboard + all modules EXCEPT Organizations
- [ ] Navigate to `/dashboard` - should work
- [ ] Navigate to `/users` - should work
- [ ] Navigate to `/events` - should work
- [ ] Try to navigate to `/tenants` - should redirect or show error
- [ ] Verify can access all application modules
- [ ] Verify can manage data within their organization

### Test Permission Checks:

- [ ] Super admin calling `hasPermission("manage_users")` → false
- [ ] Super admin calling `hasPermission("manage_tenants")` → true
- [ ] Tenant admin calling `hasPermission("manage_users")` → true (if role has it)
- [ ] Tenant admin calling `hasPermission("manage_tenants")` → false

---

## Migration Notes

### For Existing Super Admins:

If you have existing super admin users who were using the application modules, you'll need to:

1. **Option A**: Change their level to `tenant_admin`
   - They lose access to organization management
   - They gain access to all application modules

2. **Option B**: Create separate accounts
   - Keep super admin account for platform management
   - Create tenant admin account for application usage

3. **Option C**: Implement a hybrid role (not recommended)
   - Would require additional logic
   - Defeats the purpose of separation

### Recommended Approach:

- System administrators should have TWO accounts:
  1. Super admin account - for managing organizations
  2. Tenant admin account - for using the application

---

## Future Enhancements

### Potential Improvements:

1. **Role Switching**:
   - Allow users with both roles to switch context
   - UI toggle between "Platform Admin" and "Application User" modes

2. **Granular Permissions**:
   - Allow super admins to view (but not edit) some tenant data
   - Implement read-only access for auditing

3. **Organization Impersonation**:
   - Allow super admins to "login as" a tenant admin for support
   - Audit trail of all impersonation sessions

4. **Multi-tenancy Enhancements**:
   - Organization-specific branding
   - Per-organization feature flags
   - Custom module visibility per organization

---

## API Endpoints

### Super Admin Endpoints:

```
GET    /api/tenants              - List all organizations
POST   /api/tenants              - Create organization
GET    /api/tenants/:id          - Get organization details
PUT    /api/tenants/:id          - Update organization
DELETE /api/tenants/:id          - Delete organization
GET    /api/tenants/:id/users    - Get organization users
POST   /api/tenants/:id/admins   - Create organization admin
DELETE /api/tenants/:id/admins/:userId - Delete organization user
```

### Tenant Admin Endpoints:

All other application endpoints (users, events, assemblies, etc.)

---

## Troubleshooting

### Issue: Super admin can't see any modules

**Solution**: Check that user has `level: "superadmin"` or `level: "system_admin"` and verify `/dashboard` and `/tenants` paths are accessible.

### Issue: Tenant admin can see Organizations module

**Solution**: Verify the wildcard check in `hasSidebarAccess` explicitly blocks `/tenants` path.

### Issue: User sees no modules at all

**Solution**: Check user's role has proper `sidebarAccess` array or wildcard (`*`) access.

### Issue: Permission checks not working

**Solution**: Verify user's role object has `permissions` array populated correctly.

---

## Related Files

- `src/hooks/usePermissions.ts` - Permission checking logic
- `src/utils/menu.ts` - Menu configuration
- `src/modules/main/menu-sidebar/MenuSidebar.tsx` - Sidebar rendering
- `Server/src/middleware/permissionMiddleware.js` - Backend permission checks
- `Server/src/controller/tenantController.js` - Tenant management logic

---

## Conclusion

This implementation provides clear separation between:

- **Platform Administration** (Super Admin) - Managing organizations
- **Application Usage** (Tenant Admin) - Using the application features

This architecture supports true multi-tenancy with proper data isolation and security boundaries.
