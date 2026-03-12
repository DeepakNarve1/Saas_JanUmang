/**
 * Module Access Middleware
 * Checks if a tenant has access to a specific module
 */

const Tenant = require("../models/tenantModel");
const {
  getModuleById,
  getPlanConfig,
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

      // Fetch tenant
      const tenant = await Tenant.findById(tenantId);

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

      // Check if module is enabled for tenant
      const module = getModuleById(moduleId);
      const isAlwaysEnabled = module?.alwaysEnabled || false;

      if (!isAlwaysEnabled) {
        const planConfig = getPlanConfig(tenant.plan || "basic");
        const coreModules = getCoreModuleIds();

        let hasAccess = false;
        if (planConfig.id === "custom") {
          // Custom plan: check DB
          hasAccess = (tenant.enabledModules || []).includes(moduleId);
        } else {
          // Predefined plans: check plan config
          hasAccess =
            coreModules.includes(moduleId) ||
            (planConfig.enabledModules || []).includes(moduleId);
        }

        if (!hasAccess) {
          const moduleName = module ? module.name : moduleId;
          res.status(403);
          throw new Error(
            `Module '${moduleName}' is not available on your current plan. Please upgrade your plan.`,
          );
        }
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
      // System admins bypass
      if (isGlobalAdmin(req.user)) {
        return next();
      }

      const tenantId = req.user?.tenantId || req.tenantId;

      if (!tenantId) {
        res.status(403);
        throw new Error("No tenant associated with user");
      }

      const tenant = await Tenant.findById(tenantId);

      if (
        !tenant ||
        !tenant.isActive ||
        tenant.status === "suspended" ||
        tenant.status === "inactive"
      ) {
        res.status(403);
        throw new Error("Tenant not found or inactive");
      }

      const planConfig = getPlanConfig(tenant.plan || "basic");
      const coreModules = getCoreModuleIds();

      let allEnabled;
      if (planConfig.id === "custom") {
        allEnabled = [
          ...new Set([...(tenant.enabledModules || []), ...coreModules]),
        ];
      } else {
        allEnabled = [
          ...new Set([...(planConfig.enabledModules || []), ...coreModules]),
        ];
      }

      // Check if tenant has access to at least one module
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
      // System admins bypass
      if (isGlobalAdmin(req.user)) {
        return next();
      }

      const tenantId = req.user?.tenantId || req.tenantId;

      if (!tenantId) {
        res.status(403);
        throw new Error("No tenant associated with user");
      }

      const tenant = await Tenant.findById(tenantId);

      if (
        !tenant ||
        !tenant.isActive ||
        tenant.status === "suspended" ||
        tenant.status === "inactive"
      ) {
        res.status(403);
        throw new Error("Tenant not found or inactive");
      }

      const planConfig = getPlanConfig(tenant.plan || "basic");
      const coreModules = getCoreModuleIds();

      let allEnabled;
      if (planConfig.id === "custom") {
        allEnabled = [
          ...new Set([...(tenant.enabledModules || []), ...coreModules]),
        ];
      } else {
        allEnabled = [
          ...new Set([...(planConfig.enabledModules || []), ...coreModules]),
        ];
      }

      // Check if tenant has access to ALL modules
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

    const tenant = await Tenant.findById(tenantId).select(
      "enabledModules plan",
    );
    const planConfig = getPlanConfig(tenant?.plan || "basic");
    const coreModules = getCoreModuleIds();

    if (planConfig.id === "custom") {
      req.enabledModules = [
        ...new Set([...(tenant?.enabledModules || []), ...coreModules]),
      ];
    } else {
      req.enabledModules = [
        ...new Set([...(planConfig.enabledModules || []), ...coreModules]),
      ];
    }

    next();
  } catch (error) {
    next(error);
  }
};
