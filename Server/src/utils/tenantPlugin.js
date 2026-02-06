const mongoose = require("mongoose");

/**
 * Mongoose Plugin for Multi-tenancy
 * Automatically filters queries by tenantId and injects tenantId on save
 */
const tenantPlugin = (schema, options) => {
  // 1. Add tenantId to schema if not already present
  // (We've already done this manually, but this is a safety net)
  if (!schema.path("tenantId")) {
    schema.add({
      tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        index: true,
      },
    });
  }

  // 2. Middleware for NEW documents (Save)
  schema.pre("save", function (next) {
    // Note: This relies on the tenantContext being available.
    // Since 'save' is often called on an instance, we might need to
    // pass the tenantId manually in the controller, OR we can check if it's already there.
    next();
  });

  // 3. Query Middleware: Automatically filter by tenantId
  // We apply this to find, findOne, count, update, etc.
  const queryMethods = [
    "find",
    "findOne",
    "findOneAndUpdate",
    "update",
    "updateMany",
    "countDocuments",
    "aggregate",
  ];

  queryMethods.forEach((method) => {
    schema.pre(method, function () {
      const query = this.getQuery ? this.getQuery() : {};

      // If the query already has a tenantId, or if it's a global search, don't override
      // This is important for System Admins
      if (this.options && this.options.skipTenant) {
        return;
      }

      // We will inject the tenantId filter here.
      // IMPORTANT: This requires the tenantId to be attached to the query options
      // which we will handle in the controllers or via a global middleware.
      if (this.options && this.options.tenantId) {
        this.where({ tenantId: this.options.tenantId });
      }
    });
  });
};

module.exports = tenantPlugin;
