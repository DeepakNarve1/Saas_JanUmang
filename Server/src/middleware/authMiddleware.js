const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const Role = require("../models/roleModel");

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

      /*
      console.log("[authMiddleware] User:", req.user.email);
      // Clean log for role which can be object or string
      const roleLog = typeof req.user.role === 'object' ? req.user.role?.name : req.user.role;
      console.log("[authMiddleware] Role:", roleLog);
      */

      // SaaS: Attach tenantId to request
      req.tenantId = req.user.tenantId;

      // System Admin / Superadmin can override tenant context via header for management/support
      const isGlobalAdmin =
        req.user.level === "system_admin" || req.user.level === "superadmin";

      if (
        isGlobalAdmin &&
        req.headers["x-tenant-id"] &&
        mongoose.Types.ObjectId.isValid(req.headers["x-tenant-id"])
      ) {
        req.tenantId = new mongoose.Types.ObjectId(req.headers["x-tenant-id"]);
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
