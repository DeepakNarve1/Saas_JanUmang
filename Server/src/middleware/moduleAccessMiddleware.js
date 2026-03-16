/**
 * Module Access Middleware
 * Checks if a tenant has access to a specific module
 */

const Tenant = require("../models/tenantModel");
const Plan = require("../models/planModel");
const {
  getModuleById,
  getCoreModuleIds,
} = require("../config/modules");
const { isGlobalAdmin } = require("../utils/authHelpers");

/**
 * Middleware to check if tenant has access to a specific module
 *
 * Usage:
 * router.get('/problems', protect, checkModuleAccess('mp_public_problems'), getProblems)
 *
 * @param {string} moduleId - The module ID to check access for
 * @returns {Function} Express middleware function
 */
exports.checkModuleAccess = (moduleId) => {
  return async (req, res, next) => {
    try {
      // System admins and superadmins bypass all module checks
      if (isGlobalAdmin(req.user)) {
        return next();
      }

      // Get tenant ID from request
      const tenantId = req.user?.tenantId || req.tenantId;

      if (!tenantId) {
        res.status(403);
        throw new Error("No tenant associated with user");
      }

      // Use cached tenant if available, otherwise fetch
      const tenant = req.tenant || (await Tenant.findById(tenantId));

      if (!tenant) {
        res.status(403);
        throw new Error("Tenant not found");
      }

      // Check if tenant is active
      if (
        !tenant.isActive ||
        tenant.status === "suspended" ||
        tenant.status === "inactive"
      ) {
        res.status(403);
        throw new Error(
          "Organization is suspended or inactive. Please contact support.",
        );
      }

      // Check subscription status
      if (tenant.subscriptionStatus === "suspended") {
        res.status(403);
        throw new Error("Subscription is suspended. Please renew to continue.");
      }

      if (
        tenant.subscriptionStatus === "cancelled" ||
        tenant.subscriptionStatus === "expired"
      ) {
        res.status(403);
        throw new Error("Subscription has expired. Please renew to continue.");
      }

      // Check if module is always enabled (core system module)
      const module = getModuleById(moduleId);
      if (module?.alwaysEnabled) {
        return next();
      }

      // Also allow core modules to always pass
      const coreModules = getCoreModuleIds();
      if (coreModules.includes(moduleId)) {
        return next();
      }

      // Fetch plan from DB — uses the tenant's current plan slug
      const planConfig = await Plan.findOne({ planId: tenant.plan || "basic" });

      if (!planConfig) {
        // Plan not found in DB — warn and fall back to tenant's own enabledModules only
        console.warn(
          `[ModuleAccess] Plan "${tenant.plan}" not found in DB for tenant ${tenantId}. Falling back to tenant.enabledModules.`
        );
      }

      // Build the full set of accessible modules for this tenant
      const tenantModuleOverrides = tenant.enabledModules || [];
      const planModules = planConfig?.enabledModules || [];

      const hasAccess =
        planModules.includes(moduleId) ||
        tenantModuleOverrides.includes(moduleId);

      if (!hasAccess) {
        const moduleName = module ? module.name : moduleId;
        res.status(403);
        throw new Error(
          `Module '${moduleName}' is not available on your current plan. Please upgrade your plan.`,
        );
      }

      // Module access granted
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if tenant has access to multiple modules (any one)
 *
 * Usage:
 * router.get('/data', protect, checkAnyModuleAccess(['projects', 'mp_public_problems']), getData)
 *
 * @param {string[]} moduleIds - Array of module IDs
 * @returns {Function} Express middleware function
 */
exports.checkAnyModuleAccess = (moduleIds) => {
  return async (req, res, next) => {
    try {
      if (isGlobalAdmin(req.user)) return next();

      const tenantId = req.user?.tenantId || req.tenantId;
      if (!tenantId) {
        res.status(403);
        throw new Error("No tenant associated with user");
      }

      const tenant = req.tenant || (await Tenant.findById(tenantId));
      if (!tenant || !tenant.isActive) {
        res.status(403);
        throw new Error("Tenant not found or inactive");
      }

      const coreModules = getCoreModuleIds();
      const planConfig = await Plan.findOne({ planId: tenant.plan || "basic" });

      const allEnabled = [
        ...new Set([
          ...coreModules,
          ...(planConfig?.enabledModules || []),
          ...(tenant.enabledModules || []),
        ]),
      ];

      const hasAccess = moduleIds.some((moduleId) =>
        allEnabled.includes(moduleId),
      );

      if (!hasAccess) {
        res.status(403);
        throw new Error(
          "You do not have access to any of the required modules",
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if tenant has access to all specified modules
 *
 * Usage:
 * router.get('/combined', protect, checkAllModulesAccess(['projects', 'departments']), getCombined)
 *
 * @param {string[]} moduleIds - Array of module IDs
 * @returns {Function} Express middleware function
 */
exports.checkAllModulesAccess = (moduleIds) => {
  return async (req, res, next) => {
    try {
      if (isGlobalAdmin(req.user)) return next();

      const tenantId = req.user?.tenantId || req.tenantId;
      if (!tenantId) {
        res.status(403);
        throw new Error("No tenant associated with user");
      }

      const tenant = req.tenant || (await Tenant.findById(tenantId));
      if (!tenant || !tenant.isActive) {
        res.status(403);
        throw new Error("Tenant not found or inactive");
      }

      const coreModules = getCoreModuleIds();
      const planConfig = await Plan.findOne({ planId: tenant.plan || "basic" });

      const allEnabled = [
        ...new Set([
          ...coreModules,
          ...(planConfig?.enabledModules || []),
          ...(tenant.enabledModules || []),
        ]),
      ];

      const missingModules = moduleIds.filter(
        (moduleId) => !allEnabled.includes(moduleId),
      );

      if (missingModules.length > 0) {
        res.status(403);
        throw new Error(
          `Missing access to modules: ${missingModules.join(", ")}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to attach tenant's enabled modules to request
 * Useful for filtering data based on available modules
 *
 * Usage:
 * router.get('/dashboard', protect, attachEnabledModules, getDashboard)
 * Then access via: req.enabledModules
 */
exports.attachEnabledModules = async (req, res, next) => {
  try {
    // System admins get all modules
    if (isGlobalAdmin(req.user)) {
      const { getAllModuleIds } = require("../config/modules");
      req.enabledModules = getAllModuleIds();
      return next();
    }

    const tenantId = req.user?.tenantId || req.tenantId;

    if (!tenantId) {
      req.enabledModules = [];
      return next();
    }

    const tenant = req.tenant || (await Tenant.findById(tenantId).select(
      "enabledModules plan",
    ));
    const coreModules = getCoreModuleIds();
    const planConfig = await Plan.findOne({ planId: tenant?.plan || "basic" });

    req.enabledModules = [
      ...new Set([
        ...coreModules,
        ...(planConfig?.enabledModules || []),
        ...(tenant?.enabledModules || []),
      ]),
    ];

    next();
  } catch (error) {
    next(error);
  }
};
