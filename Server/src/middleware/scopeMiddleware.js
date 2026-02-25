const asyncHandler = require("express-async-handler");
const { isGlobalAdmin } = require("../utils/authHelpers");

/**
 * Middleware to restrict database queries based on user's geographic assignment (level and scope).
 * This ensures a 'District Admin' can't see data from other districts, even if they hit the same API.
 */
const scopeQuery = (levelFieldMap = {}, geographic = true) => {
  return (req, res, next) => {
    // Global Admins can see everything
    if (isGlobalAdmin(req.user)) {
      // If a global admin has selected a specific tenant, show that tenant's data PLUS global data
      if (req.tenantId) {
        req.scopeFilter = {
          tenantId: { $in: [req.tenantId, null, undefined] },
        };
      } else {
        // Show Global data
        // For roles specifically, we also want to show 'tenant_admin' roles by name
        // so the frontend can deduplicate them and show the "Organization Admin" option.
        req.scopeFilter = {
          $or: [
            { tenantId: { $in: [null, undefined] } },
            { level: "tenant_admin" },
            { name: "tenant_admin" },
            { name: "organization admin" },
          ],
        };
      }
      return next();
    }

    const { level } = req.user;

    // SaaS: Every user (except global admin) MUST be restricted by their tenantId
    req.scopeFilter = { tenantId: req.tenantId };

    // If geographic filtering is disabled, or it's a tenant admin, we stop here
    if (!geographic || level === "tenant_admin") {
      return next();
    }

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
