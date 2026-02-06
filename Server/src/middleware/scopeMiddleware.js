const asyncHandler = require("express-async-handler");

/**
 * Middleware to restrict database queries based on user's geographic assignment (level and scope).
 * This ensures a 'District Admin' can't see data from other districts, even if they hit the same API.
 */
const scopeQuery = (levelFieldMap = {}) => {
  return (req, res, next) => {
    // Global Admins can see everything
    const isGlobalAdmin =
      req.user.level === "system_admin" || req.user.level === "superadmin";

    if (isGlobalAdmin) {
      // If a global admin has selected a specific tenant, filter by it
      if (req.tenantId) {
        req.scopeFilter = { tenantId: req.tenantId };
      } else {
        req.scopeFilter = {};
      }
      return next();
    }

    const { level } = req.user;

    // SaaS: Every user (except global admin) MUST be restricted by their tenantId
    req.scopeFilter = { tenantId: req.tenantId };

    // Default field mapping for geographic scopes
    const fieldMap = {
      state: "state",
      division: "division",
      district: "district",
      assembly: "assembly",
      block: "block",
      panchayat: "panchayat",
      village: "village",
      booth: "booth",
      ...levelFieldMap,
    };

    const targetField = fieldMap[level];

    // If the user's level has a corresponding geographic field, add it to the filter
    if (targetField && req.user[level]) {
      req.scopeFilter[targetField] = req.user[level];
    }

    next();
  };
};

module.exports = { scopeQuery };
