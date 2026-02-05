const asyncHandler = require("express-async-handler");

/**
 * Middleware to restrict database queries based on user's geographic assignment (level and scope).
 * This ensures a 'District Admin' can't see data from other districts, even if they hit the same API.
 */
const scopeQuery = (levelFieldMap = {}) => {
  return (req, res, next) => {
    // Superadmins can see everything
    if (!req.user || req.user.level === "superadmin") {
      return next();
    }

    const { level } = req.user;

    // Default field mapping if not provided
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

    // If the user's level has a corresponding field in the model, apply filter
    if (targetField && req.user[level]) {
      // Initialize query object if it doesn't exist
      req.query = req.query || {};

      // Inject the scope filter into the query parameters
      // This will be used by controllers to build the Mongoose query
      req.scopeFilter = { [targetField]: req.user[level] };
    }

    next();
  };
};

module.exports = { scopeQuery };
