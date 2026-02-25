/**
 * Centralized Role & Permission Utilities
 *
 * This module provides a single source of truth for role checking logic.
 * Use these functions instead of scattered role checks throughout the codebase.
 */

/**
 * Check if user is a System Administrator (global platform access)
 *
 * SECURITY RULE: A user who belongs to an organisation (has tenantId) is NEVER
 * a global admin, regardless of their level or role name. This prevents privilege
 * escalation where a tenant user cloned a system-level role name.
 *
 * @param {Object} user - User object
 * @returns {boolean}
 */
const isSystemAdmin = (user) => {
  if (!user) return false;

  // CRITICAL: Any user who belongs to an organisation is NEVER a global admin.
  if (user.tenantId) return false;

  // Only trust level for platform-wide users (those without a tenantId)
  if (user.level === "system_admin" || user.level === "superadmin") {
    return true;
  }

  return false;
};

/**
 * Check if user is a Tenant Administrator
 * @param {Object} user - User object
 * @returns {boolean}
 */
const isTenantAdmin = (user) => {
  if (!user) return false;

  // Check level field (primary)
  if (user.level === "tenant_admin") {
    return true;
  }

  // Check role field
  if (user.role) {
    if (typeof user.role === "string") {
      return user.role === "tenant_admin";
    }
    if (user.role.name) {
      return user.role.name === "tenant_admin";
    }
  }

  // Check userType field (deprecated)
  if (user.userType) {
    return user.userType.toLowerCase() === "tenant_admin";
  }

  return false;
};

/**
 * Check if user has a specific role by name
 * @param {Object} user - User object
 * @param {string} roleName - Role name to check
 * @returns {boolean}
 */
const hasRole = (user, roleName) => {
  if (!user || !roleName) return false;

  const roleNameLower = roleName.toLowerCase();

  // Check level field
  if (user.level && user.level.toLowerCase() === roleNameLower) {
    return true;
  }

  // Check role field
  if (user.role) {
    if (typeof user.role === "string") {
      return user.role.toLowerCase() === roleNameLower;
    }
    if (user.role.name) {
      return user.role.name.toLowerCase() === roleNameLower;
    }
  }

  // Check userType field (deprecated)
  if (user.userType) {
    return user.userType.toLowerCase() === roleNameLower;
  }

  return false;
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object
 * @param {string[]} roleNames - Array of role names
 * @returns {boolean}
 */
const hasAnyRole = (user, roleNames) => {
  if (!user || !roleNames || !Array.isArray(roleNames)) return false;
  return roleNames.some((roleName) => hasRole(user, roleName));
};

/**
 * Check if user has all of the specified roles
 * @param {Object} user - User object
 * @param {string[]} roleNames - Array of role names
 * @returns {boolean}
 */
const hasAllRoles = (user, roleNames) => {
  if (!user || !roleNames || !Array.isArray(roleNames)) return false;
  return roleNames.every((roleName) => hasRole(user, roleName));
};

/**
 * Get user's primary role name
 * @param {Object} user - User object
 * @returns {string|null}
 */
const getUserRole = (user) => {
  if (!user) return null;

  // Prefer level field
  if (user.level) return user.level;

  // Then role field
  if (user.role) {
    if (typeof user.role === "string") return user.role;
    if (user.role.name) return user.role.name;
  }

  // Finally userType (deprecated)
  if (user.userType) return user.userType;

  return null;
};

/**
 * Check if user is a global admin (system_admin or superadmin)
 * Alias for isSystemAdmin for backward compatibility
 * @param {Object} user - User object
 * @returns {boolean}
 */
const isGlobalAdmin = isSystemAdmin;

/**
 * Check if user can manage tenants (system admins only)
 * @param {Object} user - User object
 * @returns {boolean}
 */
const canManageTenants = (user) => {
  return isSystemAdmin(user);
};

/**
 * Check if user can access a specific tenant
 * @param {Object} user - User object
 * @param {string} tenantId - Tenant ID to check
 * @returns {boolean}
 */
const canAccessTenant = (user, tenantId) => {
  if (!user) return false;

  // System admins can access all tenants
  if (isSystemAdmin(user)) return true;

  // Other users can only access their own tenant
  if (!tenantId) return false;

  return user.tenantId && user.tenantId.toString() === tenantId.toString();
};

/**
 * Get user's access level (for display purposes)
 * @param {Object} user - User object
 * @returns {string}
 */
const getUserAccessLevel = (user) => {
  if (isSystemAdmin(user)) return "Platform Administrator";
  if (isTenantAdmin(user)) return "Organization Administrator";

  const role = getUserRole(user);
  if (role) {
    // Capitalize first letter
    return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ");
  }

  return "User";
};

/**
 * Role hierarchy levels (higher number = more access)
 */
const ROLE_HIERARCHY = {
  system_admin: 100,
  superadmin: 100,
  tenant_admin: 50,
  district: 40,
  assembly: 30,
  block: 20,
  panchayat: 15,
  village: 10,
  booth: 5,
  regularUser: 1,
};

/**
 * Check if user has higher or equal access level than specified role
 * @param {Object} user - User object
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean}
 */
const hasMinimumRole = (user, minimumRole) => {
  const userRole = getUserRole(user);
  if (!userRole) return false;

  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

  return userLevel >= requiredLevel;
};

module.exports = {
  // Primary functions
  isSystemAdmin,
  isTenantAdmin,
  hasRole,
  hasAnyRole,
  hasAllRoles,
  getUserRole,

  // Aliases and helpers
  isGlobalAdmin,
  canManageTenants,
  canAccessTenant,
  getUserAccessLevel,
  hasMinimumRole,

  // Constants
  ROLE_HIERARCHY,
};
