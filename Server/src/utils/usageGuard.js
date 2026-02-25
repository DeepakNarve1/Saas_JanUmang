const User = require("../models/userModel");
const Tenant = require("../models/tenantModel");
const AppError = require("./AppError");

/**
 * Usage Guard: Checks if a tenant has reached their limit for a specific resource
 * @param {string} tenantId - The ID of the tenant
 * @param {string} resourceType - The resource to check (e.g., 'users')
 * @returns {Promise<boolean>} - True if limit ok, throws AppError if limit reached
 */
const checkUsageLimit = async (tenantId, resourceType = "users") => {
  if (!tenantId) return true; // Global admins not limited

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new AppError("Organization not found", 404);
  }

  if (resourceType === "users") {
    // If maxUsers is -1, it means unlimited
    if (tenant.maxUsers === -1) {
      return true;
    }

    const userCount = await User.countDocuments({ tenantId });
    if (userCount >= tenant.maxUsers) {
      throw new AppError(
        `Your organization has reached the limit of ${tenant.maxUsers} users. Please upgrade your plan or contact to the provider for that`,
        403,
      );
    }
  }

  return true;
};

module.exports = { checkUsageLimit };
