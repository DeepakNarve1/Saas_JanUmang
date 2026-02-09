const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");

// @desc    Check if user has a specific permission
const checkPermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError("User or role not found", 403));
    }

    // Global Admins (Superadmin/SystemAdmin) have all permissions
    const isGlobalAdmin =
      req.user.role === "superadmin" ||
      (req.user.role && req.user.role.name === "superadmin") ||
      req.user.level === "system_admin" ||
      req.user.level === "superadmin";

    /* console.log(`[RBAC] Checking permission: ${permissionName}`);
    console.log(`[RBAC] User Role: ${JSON.stringify(req.user.role)}`);
    console.log(`[RBAC] Is GlobalAdmin: ${isGlobalAdmin}`); */

    if (isGlobalAdmin) {
      return next();
    }

    // Permissions should already be populated in req.user.role
    const permissions = req.user.role.permissions || [];
    const userPermNames = Array.isArray(permissions)
      ? permissions.map((p) => p.name)
      : [];

    console.log(`[RBAC] User Permissions: ${userPermNames.join(", ")}`);
    console.log(`[RBAC] Checking for: ${permissionName}`);

    if (!userPermNames.includes(permissionName)) {
      const roleName =
        req.user.role && req.user.role.name
          ? req.user.role.name
          : JSON.stringify(req.user.role);

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

    // Unified Global Admin check
    if (
      req.user.role === "superadmin" ||
      (req.user.role && req.user.role.name === "superadmin") ||
      req.user.level === "system_admin" ||
      req.user.level === "superadmin"
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

    // Unified Global Admin check
    if (
      req.user.role === "superadmin" ||
      (req.user.role && req.user.role.name === "superadmin") ||
      req.user.level === "system_admin" ||
      req.user.level === "superadmin"
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
