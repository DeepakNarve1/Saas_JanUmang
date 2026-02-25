/**
 * Authorization Helper Utilities
 * Centralized functions for authorization checks to ensure consistency
 *
 * SECURITY MODEL:
 * - A "Global Admin" is a platform-level administrator with NO tenant scoping.
 *   They MUST have (level = system_admin OR superadmin) AND have NO tenantId.
 * - A "Tenant Admin" is an organisation-level admin who MUST have a tenantId.
 * - A tenant user (any level) with a tenantId is NEVER a global admin.
 *
 * This prevents privilege escalation: even if a tenant user has level = "system_admin"
 * (e.g. due to a bug in user creation), they still cannot get global admin access
 * because they have a tenantId attached.
 */

/**
 * Check if a user is a global administrator.
 * Global admins have no tenantId and have a platform-level admin level.
 *
 * @param {Object} user - User object from req.user
 * @returns {boolean} - True if user is a global admin
 */
exports.isGlobalAdmin = (user) => {
  if (!user) return false;

  // CRITICAL SECURITY RULE:
  // Any user who belongs to an organisation (has a tenantId) is NEVER a global admin.
  // This is the primary guard against privilege escalation.
  if (user.tenantId) return false;

  // Only trust the level field for platform-wide admins (those without a tenantId)
  return user.level === "system_admin" || user.level === "superadmin";
};

/**
 * Check if a user is a tenant administrator
 * Tenant admins have full control over their organization
 *
 * @param {Object} user - User object from req.user
 * @returns {boolean} - True if user is a tenant admin
 */
exports.isTenantAdmin = (user) => {
  if (!user) return false;

  return (
    user.level === "tenant_admin" ||
    (user.role &&
      typeof user.role === "object" &&
      user.role.level === "tenant_admin")
  );
};

/**
 * Validate that a user belongs to a specific tenant
 *
 * @param {Object} user - User object from req.user
 * @param {string|ObjectId} tenantId - Tenant ID to validate against
 * @returns {boolean} - True if user belongs to the tenant
 */
exports.validateUserTenant = (user, tenantId) => {
  if (!user || !tenantId) return false;

  // Global admins can access any tenant
  if (exports.isGlobalAdmin(user)) return true;

  // Check if user's tenantId matches
  const userTenantId = user.tenantId?.toString();
  const targetTenantId = tenantId.toString();

  return userTenantId === targetTenantId;
};

/**
 * Get the effective tenant ID for a request
 * Handles tenant context switching for global admins via the x-tenant-id header.
 *
 * @param {Object} req - Express request object
 * @returns {string|ObjectId|null} - Effective tenant ID
 */
exports.getEffectiveTenantId = (req) => {
  // If user is global admin and has specified a tenant via header, use that
  if (exports.isGlobalAdmin(req.user) && req.headers["x-tenant-id"]) {
    return req.headers["x-tenant-id"];
  }

  // Otherwise use the user's tenant
  return req.user?.tenantId || req.tenantId || null;
};

/**
 * Get the tenant ID to use when CREATING a new record.
 *
 * - Regular users (tenant staff, tenant_admin): always use their own tenantId.
 * - System Admin without x-tenant-id header: returns null → creates an "orphan"
 *   test record that belongs to no tenant and is invisible to all organisations.
 * - System Admin WITH x-tenant-id header: creates the record under that specific
 *   tenant (useful for seeding data into a tenant from the admin panel).
 *
 * @param {Object} req - Express request object
 * @returns {string|ObjectId|null} - Tenant ID for the new record, or null
 */
exports.getCreateTenantId = (req) => {
  // System admins create orphan records by default (no tenantId pollution)
  if (exports.isGlobalAdmin(req.user)) {
    // If they pinned a specific tenant via header, write to that tenant
    if (req.tenantId) return req.tenantId; // already resolved by authMiddleware
    return null; // true orphan test record
  }

  // Everyone else must be scoped to their own organisation
  return req.tenantId;
};

/**
 * Check if user has permission to manage a specific tenant
 *
 * @param {Object} user - User object from req.user
 * @param {string|ObjectId} tenantId - Tenant ID to check
 * @returns {boolean} - True if user can manage the tenant
 */
exports.canManageTenant = (user, tenantId) => {
  if (!user || !tenantId) return false;

  // Global admins can manage any tenant
  if (exports.isGlobalAdmin(user)) return true;

  // Tenant admins can only manage their own tenant
  if (exports.isTenantAdmin(user)) {
    return exports.validateUserTenant(user, tenantId);
  }

  return false;
};

/**
 * Format user role for logging
 * Handles both string and object role formats
 *
 * @param {Object} user - User object
 * @returns {string} - Formatted role name
 */
exports.getUserRoleName = (user) => {
  if (!user) return "unknown";

  if (typeof user.role === "string") return user.role;
  if (user.role && user.role.name) return user.role.name;
  if (user.level) return user.level;

  return "unknown";
};

module.exports = exports;
