const asyncHandler = require("express-async-handler");
const Tenant = require("../models/tenantModel");
const AppError = require("../utils/AppError");

/**
 * Middleware to load tenant data once per request.
 * This prevents N+1 database calls when multiple module-access
 * or plan-gating middlewares are used on a single route.
 */
const loadTenant = asyncHandler(async (req, res, next) => {
  // 1. Get tenant ID (populated usually by authMiddleware/protect)
  // System admins might have a tenant override in the header
  const tenantId = req.tenantId || req.user?.tenantId;

  if (!tenantId) {
    // If no tenant (e.g. global admin context without override), proceed
    return next();
  }

  // 2. Fetch tenant once
  const tenant = await Tenant.findById(tenantId).select(
    "name slug plan enabledModules isActive status subscriptionStatus subscriptionEndDate trialEndsAt",
  );

  if (!tenant) {
    return next(new AppError("Organization not found", 404));
  }

  // 3. Attach to request for downstream reuse
  req.tenant = tenant;
  next();
});

module.exports = loadTenant;
