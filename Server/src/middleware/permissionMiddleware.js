const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const { isGlobalAdmin, getUserRoleName } = require("../utils/authHelpers");

const DEFAULT_SECONDARY_ADMIN_PERMISSIONS = [
  "view_user_count",
  "view_dashboard",
  "view_activity_logs",
  "view_user_activity_report",
  "view_roles",
  "manage_roles",
];

// @desc    Check if user has a specific permission
const checkPermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError("User or role not found", 403));
    }

    // Global Admins (Superadmin/SystemAdmin) have all permissions
    if (isGlobalAdmin(req.user)) {
      return next();
    }

    // Tenant Admins and secondary System Administrators get default access to core views
    const isSecondaryAdmin =
      req.user.level === "tenant_admin" ||
      req.user.userType === "systemAdministrator";

    if (
      isSecondaryAdmin &&
      DEFAULT_SECONDARY_ADMIN_PERMISSIONS.includes(permissionName)
    ) {
      return next();
    }

    // Permissions should already be populated in req.user.role
    const permissions = req.user.role.permissions || [];
    const userPermNames = Array.isArray(permissions)
      ? permissions.map((p) => p.name)
      : [];

    if (!userPermNames.includes(permissionName)) {
      const roleName = getUserRoleName(req.user);

      return next(
        new AppError(
          `Permission Denied. Required: ${permissionName}. Your Role: ${roleName}.`,
          403,
        ),
      );
    }

    next();
  });
};

// Check any permission
const checkAnyPermission = (permissionNames) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError("User or role not found", 403));
    }

    // Global Admins have all permissions
    if (isGlobalAdmin(req.user)) {
      return next();
    }

    // Tenant Admins and secondary System Administrators get default access to core views
    const isSecondaryAdmin =
      req.user.level === "tenant_admin" ||
      req.user.userType === "systemAdministrator";

    if (
      isSecondaryAdmin &&
      permissionNames.some((p) =>
        DEFAULT_SECONDARY_ADMIN_PERMISSIONS.includes(p),
      )
    ) {
      return next();
    }

    const permissions = req.user.role.permissions || [];
    const userPermNames = Array.isArray(permissions)
      ? permissions.map((p) => p.name)
      : [];

    // Debug log
    /* console.log(`[RBAC] Checking Any: Required=[${permissionNames}], UserHas=[${userPermNames}]`); */

    const hasAny = permissionNames.some((perm) => userPermNames.includes(perm));

    if (!hasAny) {
      return next(
        new AppError(
          `You do not have any of the required permissions: ${permissionNames.join(
            ", ",
          )}`,
          403,
        ),
      );
    }

    next();
  });
};

// Check all permissions
const checkAllPermissions = (permissionNames) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError("User or role not found", 403));
    }

    // Global Admins have all permissions
    if (isGlobalAdmin(req.user)) {
      return next();
    }

    // Tenant Admins and secondary System Administrators get default access to core views
    const isSecondaryAdmin =
      req.user.level === "tenant_admin" ||
      req.user.userType === "systemAdministrator";

    if (
      isSecondaryAdmin &&
      permissionNames.every((p) =>
        DEFAULT_SECONDARY_ADMIN_PERMISSIONS.includes(p),
      )
    ) {
      return next();
    }

    const permissions = req.user.role.permissions || [];
    const userPermNames = Array.isArray(permissions)
      ? permissions.map((p) => p.name)
      : [];
    const hasAll = permissionNames.every((perm) =>
      userPermNames.includes(perm),
    );

    if (!hasAll) {
      return next(
        new AppError("You do not have all required permissions", 403),
      );
    }

    next();
  });
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
};
