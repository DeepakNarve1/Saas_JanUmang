const asyncHandler = require("express-async-handler");

// @desc    Check if user has a specific permission
const checkPermission = (permissionName) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(403);
      throw new Error("User or role not found");
    }

    // Superadmin has all permissions - check both string and object
    const isSuperAdmin =
      req.user.role === "superadmin" ||
      (req.user.role && req.user.role.name === "superadmin");

    /* console.log(`[RBAC] Checking permission: ${permissionName}`);
    console.log(`[RBAC] User Role: ${JSON.stringify(req.user.role)}`);
    console.log(`[RBAC] Is SuperAdmin: ${isSuperAdmin}`); */

    if (isSuperAdmin) {
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
      res.status(403);
      const roleName =
        req.user.role && req.user.role.name
          ? req.user.role.name
          : JSON.stringify(req.user.role);
      throw new Error(
        `Permission Denied. Required: ${permissionName}. Your Role: ${roleName}. Perms: ${userPermNames.join(
          ","
        )}`
      );
    }

    next();
  });
};

// Check any permission
const checkAnyPermission = (permissionNames) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(403);
      throw new Error("User or role not found");
    }

    // Unified Superadmin check
    if (
      req.user.role === "superadmin" ||
      (req.user.role && req.user.role.name === "superadmin")
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
      res.status(403);
      throw new Error(
        `You do not have any of the required permissions: ${permissionNames.join(
          ", "
        )}`
      );
    }

    next();
  });
};

// Check all permissions
const checkAllPermissions = (permissionNames) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      res.status(403);
      throw new Error("User or role not found");
    }

    // Unified Superadmin check
    if (
      req.user.role === "superadmin" ||
      (req.user.role && req.user.role.name === "superadmin")
    ) {
      return next();
    }

    const permissions = req.user.role.permissions || [];
    const userPermNames = Array.isArray(permissions)
      ? permissions.map((p) => p.name)
      : [];
    const hasAll = permissionNames.every((perm) =>
      userPermNames.includes(perm)
    );

    if (!hasAll) {
      res.status(403);
      throw new Error("You do not have all required permissions");
    }

    next();
  });
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
};
