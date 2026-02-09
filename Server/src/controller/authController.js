const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const { OAuth2Client } = require("google-auth-library");
const { logActivity } = require("./activityLogController");
const AppError = require("../utils/AppError");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15h" });
};

// Register User
exports.registerUser = asyncHandler(async (req, res) => {
  try {
    console.log("Register Request Body:", req.body);
    let { name, email, password, role, mobile, userType } = req.body;

    // ... (rest of registration logic)
    if (role && typeof role === "object" && (role._id || role.value)) {
      role = role._id || role.value;
    }

    const { checkUsageLimit } = require("../utils/usageGuard");

    if (!name || !email || !role) {
      res.status(400);
      throw new Error("Please fill all required fields (Name, Email, Role)");
    }

    if (!password) {
      res.status(400);
      throw new Error("Password is required");
    }

    // SaaS: Check Usage Limit (Max Users)
    // Only check if registrant is NOT a system admin
    if (
      req.user &&
      req.user.level !== "system_admin" &&
      req.user.level !== "superadmin"
    ) {
      await checkUsageLimit(req.tenantId, "users");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      mobile: mobile || "",
      userType: userType || "regularUser",
      permissions: {},
      mobile: mobile || "",
      userType: userType || "regularUser",
      permissions: {},
      // SaaS: Allow System Admin to override tenant, otherwise use context
      tenantId:
        (req.user.level === "system_admin" ||
          req.user.level === "superadmin") &&
        req.body.tenantId
          ? req.body.tenantId
          : req.tenantId,
    });

    if (newUser.role && mongoose.Types.ObjectId.isValid(newUser.role)) {
      const roleDoc = await Role.findById(newUser.role).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) newUser.role = roleDoc;
    }

    req.user = newUser;
    req.tenantId = newUser.tenantId; // SaaS: Set tenantId for logging
    await logActivity(
      req,
      "CREATE",
      "UserManagement",
      `Registered new user: ${newUser.name} (${newUser.email})`,
      { recordId: newUser._id, newData: newUser },
    );

    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        mobile: newUser.mobile,
        userType: newUser.userType,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    res.status(error.statusCode || 500);
    throw new Error(error.message || "Server Error during registration");
  }
});

// Get all users (exclude superadmin accounts unless showAll=true)
exports.getUsers = asyncHandler(async (req, res) => {
  const { showAll } = req.query;
  const total = await User.countDocuments({ ...req.scopeFilter });
  let users = await User.find({ ...req.scopeFilter }).select("-password");

  const populatedUsers = await Promise.all(
    users.map(async (u) => {
      const userObj = u.toObject ? u.toObject() : u;
      if (userObj.role) {
        if (mongoose.Types.ObjectId.isValid(userObj.role)) {
          const roleDoc = await Role.findById(userObj.role).select(
            "name displayName permissions sidebarAccess",
          );
          if (roleDoc) userObj.role = roleDoc;
        } else if (typeof userObj.role === "string") {
          const roleDoc = await Role.findOne({ name: userObj.role }).select(
            "name displayName permissions sidebarAccess",
          );
          if (roleDoc) userObj.role = roleDoc;
        }
      }
      return userObj;
    }),
  );

  if (showAll === "true") {
    res.json({ success: true, data: populatedUsers });
  } else {
    const filtered = populatedUsers.filter(
      (u) => u.role?.name !== "superadmin",
    );
    res.json({ success: true, total, data: filtered });
  }
});

// Get single user by ID
exports.getUserById = asyncHandler(async (req, res) => {
  let user = await User.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  })
    .select("-password")
    .lean();

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role) {
    if (mongoose.Types.ObjectId.isValid(user.role)) {
      const roleDoc = await Role.findById(user.role).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) user.role = roleDoc;
    } else if (typeof user.role === "string") {
      const roleDoc = await Role.findOne({ name: user.role }).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) user.role = roleDoc;
    }
  }

  const roleName = user.role?.name || user.role;
  if (roleName === "superadmin") {
    res.status(403);
    throw new Error("Access denied: Cannot view Superadmin details");
  }

  res.json({ success: true, data: user });
});

// Get current user (me)
exports.getCurrentUser = asyncHandler(async (req, res) => {
  let user = await User.findById(req.user._id).select("-password").lean();

  if (user && user.role) {
    if (mongoose.Types.ObjectId.isValid(user.role)) {
      user.role = await Role.findById(user.role).populate(
        "permissions",
        "name displayName category",
      );
    } else if (typeof user.role === "string") {
      user.role = await Role.findOne({ name: user.role }).populate(
        "permissions",
        "name displayName category",
      );
    }
  }

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Populate tenant info
  if (req.tenantId) {
    const Tenant = require("../models/tenantModel");
    user.tenant = await Tenant.findById(req.tenantId).select("name slug");
  }

  res.json({ success: true, data: user });
});

// Delete User
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "superadmin") {
    res.status(403);
    throw new Error("Cannot delete superadmin account");
  }

  if (user.role && mongoose.Types.ObjectId.isValid(user.role)) {
    const roleDoc = await Role.findById(user.role);
    if (roleDoc?.name === "superadmin") {
      res.status(403);
      throw new Error("Cannot delete superadmin account");
    }
  }

  const userName = user.name;
  const userId = user._id;

  await user.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "UserManagement",
    `Deleted user: ${userName} (ID: ${userId})`,
    { recordId: userId, oldData: user },
  );

  res.json({ success: true, message: "User removed" });
});

// Update Profile (Self update)
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const oldData = user.toObject();

  const { name, email, mobile } = req.body;

  user.name = name ?? user.name;
  user.email = email ?? user.email;
  user.mobile = mobile ?? user.mobile;

  const updatedUser = await user.save();

  await logActivity(
    req,
    "UPDATE",
    "Profile",
    `User updated their profile: ${updatedUser.name}`,
    { recordId: updatedUser._id, newData: updatedUser, oldData },
  );

  // Re-populate role before sending back if needed
  if (updatedUser.role) {
    if (mongoose.Types.ObjectId.isValid(updatedUser.role)) {
      const roleDoc = await Role.findById(updatedUser.role).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) updatedUser.role = roleDoc;
    } else if (typeof updatedUser.role === "string") {
      const roleDoc = await Role.findOne({ name: updatedUser.role }).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) updatedUser.role = roleDoc;
    }
  }

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      mobile: updatedUser.mobile,
      userType: updatedUser.userType,
    },
  });
});

// Update User (Admin/Superadmin only)
exports.updateUser = asyncHandler(async (req, res) => {
  try {
    const roleName = req.user?.role?.name || req.user?.role;
    const requesterRole =
      typeof roleName === "object" && roleName.name ? roleName.name : roleName;

    // SaaS: Allow System/Tenant Admins to update users
    const isAuthorized =
      ["admin", "superadmin", "system_admin", "tenant_admin"].includes(
        requesterRole,
      ) ||
      req.user.level === "system_admin" ||
      req.user.level === "superadmin" ||
      req.user.level === "tenant_admin";

    if (!req.user || !isAuthorized) {
      res.status(403);
      throw new Error("Not authorized to update users");
    }

    let user = await User.findOne({
      _id: req.params.id,
      ...req.scopeFilter,
    });
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    let isTargetSuperAdmin = false;
    if (user.role === "superadmin") isTargetSuperAdmin = true;
    else if (user.role && mongoose.Types.ObjectId.isValid(user.role)) {
      const roleDoc = await Role.findById(user.role);
      if (roleDoc?.name === "superadmin") isTargetSuperAdmin = true;
    }

    if (isTargetSuperAdmin) {
      res.status(403);
      throw new Error("Cannot modify superadmin");
    }

    const oldData = user.toObject();

    let { name, email, password, role, mobile, userType } = req.body;

    if (role && typeof role === "object" && (role._id || role.value)) {
      role = role._id || role.value;
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    if (role) user.role = role;
    user.mobile = mobile ?? user.mobile;
    user.userType = userType ?? user.userType;

    if (password && password.trim() !== "") {
      user.password = password;
    }

    const updated = await user.save();

    await logActivity(
      req,
      "UPDATE",
      "UserManagement",
      "UserManagement",
      `Updated user: ${updated.name} (ID: ${updated._id})`,
      { recordId: updated._id, newData: updated, oldData },
    );

    res.json({
      success: true,
      data: { ...updated._doc, password: undefined, block: undefined },
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Server Error during update");
  }
});

// Login User
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && user.role) {
    if (mongoose.Types.ObjectId.isValid(user.role)) {
      const roleDoc = await Role.findById(user.role).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) user.role = roleDoc;
    } else if (typeof user.role === "string") {
      const roleDoc = await Role.findOne({ name: user.role }).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) user.role = roleDoc;
    }
  }

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // SaaS: Block login if organization is suspended (skip for users without tenant, e.g. legacy superadmin)
  if (user.tenantId) {
    const Tenant = require("../models/tenantModel");
    const tenant = await Tenant.findById(user.tenantId).select("status name");
    if (tenant && tenant.status === "suspended") {
      res.status(401);
      throw new Error(
        "Your organization has been suspended. Please contact support.",
      );
    }
  }

  req.user = user;
  req.tenantId = user.tenantId; // SaaS: Set tenantId for logging
  await logActivity(
    req,
    "LOGIN",
    "Auth",
    `User logged in: ${user.name} (${user.email})`,
  );

  res.json({
    success: true,
    data: {
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        userType: user.userType,
        tenantId: user.tenantId,
        level: user.level,
      },
    },
  });
});

// Google Login
exports.googleLogin = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error("Google token is required");
  }

  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { email, name, picture, sub } = ticket.getPayload();

  let user = await User.findOne({ email });

  if (!user) {
    const defaultRole = await Role.findOne({ name: "regularUser" });
    user = await User.create({
      name,
      email,
      password: Math.random().toString(36).slice(-16),
      role: defaultRole?._id || null,
      mobile: "",
      userType: "regularUser",
      googleId: sub,
    });
  }

  if (user.role) {
    if (mongoose.Types.ObjectId.isValid(user.role)) {
      const roleDoc = await Role.findById(user.role).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) user.role = roleDoc;
    } else if (typeof user.role === "string") {
      const roleDoc = await Role.findOne({ name: user.role }).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) user.role = roleDoc;
    }
  }

  res.json({
    success: true,
    data: {
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        userType: user.userType,
        tenantId: user.tenantId,
        level: user.level,
        photoURL: picture,
      },
    },
  });
});

// Change Password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new AppError("Current password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  await logActivity(
    req,
    "UPDATE",
    "Auth",
    `User changed password: ${user.name}`,
  );

  res.json({
    success: true,
    message: "Password changed successfully",
  });
});

// Admin Reset User Password
exports.resetUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { temporaryPassword } = req.body;

  // Check if requesting user is super admin with strict validation
  const requestingUser = await User.findById(req.user._id).populate("role");

  if (!requestingUser) {
    throw new AppError("Requesting user not found", 404);
  }

  // Strict super admin check
  let isSuperAdmin = false;

  // Check userType field (case-insensitive)
  // Check userType field (case-insensitive)
  if (
    requestingUser.userType &&
    requestingUser.userType.toLowerCase() === "superadmin"
  ) {
    isSuperAdmin = true;
  }

  // Check administrative level
  if (
    requestingUser.level === "system_admin" ||
    requestingUser.level === "superadmin"
  ) {
    isSuperAdmin = true;
  }

  // Check role field
  if (requestingUser.role) {
    // If role is a string
    if (
      typeof requestingUser.role === "string" &&
      requestingUser.role.toLowerCase() === "superadmin"
    ) {
      isSuperAdmin = true;
    }
    // If role is an object with name property
    else if (
      requestingUser.role.name &&
      requestingUser.role.name.toLowerCase() === "superadmin"
    ) {
      isSuperAdmin = true;
    }
  }

  console.log("Password Reset Attempt:", {
    requestingUserId: requestingUser._id,
    requestingUserEmail: requestingUser.email,
    requestingUserType: requestingUser.userType,
    requestingUserRole: requestingUser.role,
    isSuperAdmin,
  });

  if (!isSuperAdmin) {
    throw new AppError("Only super admins can reset user passwords", 403);
  }

  // Find target user
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  // Validate temporary password
  if (!temporaryPassword || temporaryPassword.length < 8) {
    throw new AppError("Temporary password must be at least 8 characters", 400);
  }

  // Update user password and set requirePasswordChange flag
  targetUser.password = temporaryPassword;
  targetUser.requirePasswordChange = true;
  await targetUser.save();

  // Log activity
  await logActivity(
    req,
    "UPDATE",
    "Auth",
    `Admin reset password for user: ${targetUser.name} (${targetUser.email})`,
    { userId: targetUser._id, resetBy: req.user._id },
  );

  res.json({
    success: true,
    message: "Password reset successfully",
    data: {
      userId: targetUser._id,
      email: targetUser.email,
      temporaryPassword, // Return to admin to give to user
      requirePasswordChange: true,
    },
  });
});

// Logout User
exports.logoutUser = asyncHandler(async (req, res) => {
  if (req.user) {
    await logActivity(
      req,
      "LOGOUT",
      "Auth",
      `User logged out: ${req.user.name} (${req.user.email})`,
    );
  }
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
