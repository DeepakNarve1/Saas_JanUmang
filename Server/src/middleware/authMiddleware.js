const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
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
      req.user = await User.findById(decoded.id).select("-password");

      // Manually populate role
      if (req.user && req.user.role) {
        if (mongoose.Types.ObjectId.isValid(req.user.role)) {
          // It's an ObjectId
          const roleDoc = await Role.findById(req.user.role).populate(
            "permissions",
            "name displayName",
          );
          if (roleDoc) {
            req.user.role = roleDoc;
          }
        } else if (typeof req.user.role === "string") {
          // It's a string name (legacy support)
          const roleDoc = await Role.findOne({ name: req.user.role }).populate(
            "permissions",
            "name displayName",
          );
          if (roleDoc) {
            req.user.role = roleDoc;
          }
        }
      }

      // SaaS: Attach tenantId to request
      // Use _doc fallback because mutating req.user.role to a populated object
      // can sometimes cause Mongoose to shadow plain field access on the document.
      req.tenantId = req.user.tenantId || req.user._doc?.tenantId;

      // System Admin / Superadmin can override tenant context via header for management/support
      if (
        isGlobalAdmin(req.user) &&
        req.headers["x-tenant-id"] &&
        mongoose.Types.ObjectId.isValid(req.headers["x-tenant-id"])
      ) {
        const originalTenantId = req.tenantId;
        req.tenantId = new mongoose.Types.ObjectId(req.headers["x-tenant-id"]);

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
