const { isGlobalAdmin } = require("../utils/authHelpers");

/**
 * Middleware: requireGlobalAdmin
 *
 * Restricts write access (POST / PUT / DELETE) on master/global data to
 * platform-level administrators only (level = system_admin | superadmin,
 * and NO tenantId attached to the user account).
 *
 * Used on geographic master data routes:
 *   - State, Division, Parliament (the top of the geographic hierarchy)
 *
 * Tenant admins and regular users can READ these records (no restriction on
 * GET routes) but cannot create, modify, or delete them.
 */
const requireGlobalAdmin = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authenticated"));
  }

  if (!isGlobalAdmin(req.user)) {
    res.status(403);
    return next(
      new Error(
        "Access denied. Only platform administrators can manage this master data.",
      ),
    );
  }

  next();
};

module.exports = { requireGlobalAdmin };
