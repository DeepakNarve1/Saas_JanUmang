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
            "name displayName"
          );
          if (roleDoc) {
            req.user.role = roleDoc;
          }
        } else if (typeof req.user.role === "string") {
          // It's a string name (legacy support)
          const roleDoc = await Role.findOne({ name: req.user.role }).populate(
            "permissions",
            "name displayName"
          );
          if (roleDoc) {
            req.user.role = roleDoc;
          }
        }
      }

      console.log("[authMiddleware] User:", req.user.email);
      console.log("[authMiddleware] Role:", req.user.role);
      console.log(
        "[authMiddleware] Permissions:",
        req.user.role?.permissions?.map((p) => p.name)
      );

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
