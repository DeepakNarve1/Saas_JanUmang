const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Tenant = require("../models/tenantModel");
const { isGlobalAdmin } = require("../utils/authHelpers");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Single DB call with deep population
      req.user = await User.findById(decoded.id)
        .select("-password")
        .populate({
          path: "role",
          populate: {
            path: "permissions",
            select: "name displayName category",
          },
        });

      if (!req.user) {
        throw new AppError("User not found", 401);
      }

      // SaaS: Attach tenant & tenantId to request
      req.tenantId = req.user.tenantId || req.user._doc?.tenantId;

      if (req.tenantId) {
        req.tenant = await Tenant.findById(req.tenantId);
        
        // SaaS: Block access if organization is suspended
        // (Only for non-global admins, so SuperAdmins can still manage the organization)
        if (req.tenant && req.tenant.status === "suspended" && !isGlobalAdmin(req.user)) {
          throw new AppError("Your organization has been suspended. Please contact support.", 403);
        }
      }

      // System Admin / Superadmin override logic... [unchanged]
      if (
        isGlobalAdmin(req.user) &&
        req.headers["x-tenant-id"] &&
        mongoose.Types.ObjectId.isValid(req.headers["x-tenant-id"])
      ) {
        const originalTenantId = req.tenantId;
        req.tenantId = new mongoose.Types.ObjectId(req.headers["x-tenant-id"]);
        // Fetch new tenant context
        req.tenant = await Tenant.findById(req.tenantId);

        // Log tenant context switching for audit trail
        if (process.env.NODE_ENV !== "test") {
          console.log(
            `[AUDIT] Tenant Context Switch: User ${req.user.email} (${req.user.level}) switched from ${originalTenantId || "none"} to ${req.tenantId}`,
          );

          // Optionally log to activity log (import logActivity if needed)
          // This provides a permanent audit trail
          try {
            const {
              logActivity,
            } = require("../controller/activityLogController");
            await logActivity(
              req,
              "TENANT_SWITCH",
              "TenantContext",
              `Admin switched tenant context to ${req.tenantId}`,
              {
                originalTenantId: originalTenantId?.toString(),
                newTenantId: req.tenantId.toString(),
              },
            );
          } catch (logError) {
            // Don't fail the request if logging fails
            console.error(
              "[AUDIT] Failed to log tenant switch:",
              logError.message,
            );
          }
        }
      }

      next();
    } catch (error) {
      throw new AppError("Not authorized, token failed", 401);
    }
  }

  if (!token) {
    throw new AppError("Not authorized, no token", 401);
  }
});

module.exports = protect;
