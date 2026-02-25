const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const { OAuth2Client } = require("google-auth-library");
const { logActivity } = require("./activityLogController");
const AppError = require("../utils/AppError");
const { getCoreModuleIds } = require("../config/modules");
const { isGlobalAdmin } = require("../utils/authHelpers");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15h" });
};

// Helper to get consistent tenant data including core modules
const getTenantData = async (tenantId) => {
  if (!tenantId) return null;
  const Tenant = require("../models/tenantModel");
  const tenant = await Tenant.findById(tenantId).select(
    "name slug enabledModules plan",
  );
  if (!tenant) return null;

  return {
    _id: tenant._id,
    name: tenant.name,
    slug: tenant.slug,
    enabledModules: [
      ...new Set([...(tenant.enabledModules || []), ...getCoreModuleIds()]),
    ],
    plan: tenant.plan,
  };
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
    // Global admins (no tenantId) are exempt from tenant usage limits.
    if (req.user && !isGlobalAdmin(req.user)) {
      await checkUsageLimit(req.tenantId, "users");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // SaaS: Allow System Admin to override tenant, otherwise use context.
    // Use isGlobalAdmin() which enforces: no tenantId + system-level = true global admin.
    const { isGlobalAdmin: checkIsGlobal } = require("../utils/authHelpers");
    const isAdmin = checkIsGlobal(req.user);

    const tenantId =
      isAdmin && req.body.tenantId ? req.body.tenantId : req.tenantId;

    const {
      level,
      state,
      division,
      district,
      assembly,
      block,
      panchayat,
      village,
      booth,
    } = req.body;

    // LEVEL ASSIGNMENT RULES:
    // - Global admins (no tenantId): can assign any level including system_admin/superadmin
    // - Tenant admins (have tenantId): can only assign levels below their own:
    //   They can create users with levels: tenant_admin, custom, or geographic levels.
    //   They CANNOT assign system_admin or superadmin (platform levels).
    let effectiveLevel = level;

    const isGlobalLevel = ["system_admin", "superadmin"].includes(level);
    if (!isAdmin) {
      if (isGlobalLevel) {
        // Tenant creators cannot grant platform-level access — downgrade silently
        effectiveLevel = "regularUser";
      }
    }

    if (!effectiveLevel) {
      if (tenantId) {
        effectiveLevel = isAdmin ? "tenant_admin" : "regularUser";
      } else {
        effectiveLevel = isAdmin ? "superadmin" : "regularUser";
      }
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      mobile: mobile || "",
      userType: userType || "regularUser",
      level: effectiveLevel,
      state: state || null,
      division: division || null,
      district: district || null,
      assembly: assembly || null,
      block: block || null,
      panchayat: panchayat || null,
      village: village || null,
      booth: booth || null,
      tenantId: tenantId || null,
      permissions: {},
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

    const userObj = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      mobile: newUser.mobile,
      userType: newUser.userType,
      level: newUser.level,
      tenantId: newUser.tenantId,
      token: generateToken(newUser._id),
    };

    if (newUser.tenantId) {
      userObj.tenant = await getTenantData(newUser.tenantId);
    }

    res.status(201).json({
      success: true,
      data: userObj,
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

  const isGlobal = isGlobalAdmin(req.user);

  if (showAll === "true" || isGlobal) {
    res.json({ success: true, total, data: populatedUsers });
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
      const roleDoc = await Role.findById(user.role).populate(
        "permissions",
        "name displayName category",
      );
      if (roleDoc) user.role = roleDoc;
    } else if (typeof user.role === "string") {
      const roleDoc = await Role.findOne({ name: user.role }).populate(
        "permissions",
        "name displayName category",
      );
      if (roleDoc) user.role = roleDoc;
    }
  }

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Convert to plain object to attach non-schema properties
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  // Populate tenant info
  if (req.tenantId) {
    userObj.tenant = await getTenantData(req.tenantId);
  }

  res.json({ success: true, data: userObj });
});

// Delete User
exports.deleteUser = asyncHandler(async (req, res) => {
  const { isGlobalAdmin: checkGlobalAdmin } = require("../utils/authHelpers");
  const requesterIsGlobal = checkGlobalAdmin(req.user);
  const requesterIsTenantAdmin =
    req.user.level === "tenant_admin" && req.user.tenantId;

  const user = await User.findOne({
    _id: req.params.id,
    ...req.scopeFilter, // scopeFilter already restricts to same tenant for non-global admins
  });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // RULE 1: Nobody can delete a true platform-level global admin account.
  if (requesterIsGlobal === false && !req.user.tenantId) {
    // This shouldn't happen since scopeFilter would prevent it anyway
  }

  // RULE 2: The designated Org Admin account (level=tenant_admin) can only be
  // deleted by a true platform global admin (no tenantId).
  // This protects the org admin that was created by the super admin.
  const isTargetDesignatedOrgAdmin = user.level === "tenant_admin";
  if (isTargetDesignatedOrgAdmin && !requesterIsGlobal) {
    res.status(403);
    throw new Error(
      "Unauthorized: The Organisation Admin account can only be removed by the Platform Administrator.",
    );
  }

  // RULE 3: Nobody (including tenant admins) can delete a true platform global admin.
  if (checkGlobalAdmin(user)) {
    res.status(403);
    throw new Error("Cannot delete a Platform Administrator account.");
  }

  // RULE 4: Users with a bad/incorrect level (e.g. a tenant user whose level was
  // incorrectly set to 'system_admin') can still be deleted by their org's tenant admin.
  // The tenantId guard in isGlobalAdmin ensures these users are NOT treated as global admins,
  // so a tenant admin can remove them normally.

  // RULE 5: No self-deletion
  if (user._id.toString() === req.user._id.toString()) {
    res.status(403);
    throw new Error("You cannot delete your own account.");
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

  const userObj = {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    mobile: updatedUser.mobile,
    userType: updatedUser.userType,
    level: updatedUser.level,
    tenantId: updatedUser.tenantId,
  };

  if (updatedUser.tenantId) {
    userObj.tenant = await getTenantData(updatedUser.tenantId);
  }

  res.json({
    success: true,
    data: userObj,
  });
});

// Update User (Admin/Superadmin only)
exports.updateUser = asyncHandler(async (req, res) => {
  try {
    const roleName = req.user?.role?.name || req.user?.role;
    const requesterRole =
      typeof roleName === "object" && roleName.name ? roleName.name : roleName;

    // Any user with a valid level can update users they have access to
    // (scopeFilter already ensures tenant isolation).
    // Further granular checks happen below (e.g. cannot edit tenant_admin).
    if (!req.user) {
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

    // Use the proper isGlobalAdmin check (enforces: no tenantId + system-level)
    const { isGlobalAdmin: checkGlobalAdmin } = require("../utils/authHelpers");
    const isRequesterGlobal = checkGlobalAdmin(req.user);

    // Protect the designated Org Admin account — only a platform global admin can edit it
    const isTargetDesignatedOrgAdmin = user.level === "tenant_admin";
    if (isTargetDesignatedOrgAdmin && !isRequesterGlobal) {
      res.status(403);
      throw new Error(
        "Unauthorized: The Organisation Admin account can only be managed by the Platform Administrator.",
      );
    }

    // Protect true platform global admins from being edited by anyone except themselves or other globals
    if (checkGlobalAdmin(user) && !isRequesterGlobal) {
      res.status(403);
      throw new Error("Cannot modify a Platform Administrator account.");
    }

    const oldData = user.toObject();

    let {
      name,
      email,
      password,
      role,
      mobile,
      userType,
      level,
      tenantId,
      state,
      division,
      district,
      assembly,
      block,
      panchayat,
      village,
      booth,
    } = req.body;

    if (role && typeof role === "object" && (role._id || role.value)) {
      role = role._id || role.value;
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    if (role) user.role = role;
    user.mobile = mobile ?? user.mobile;
    user.userType = userType ?? user.userType;

    // Security: Only platform global admins can assign platform-level roles
    if (level && level !== user.level) {
      const isNewLevelGlobal = ["system_admin", "superadmin"].includes(level);
      if (isNewLevelGlobal && !isRequesterGlobal) {
        // A tenant admin trying to assign a platform level — block it silently
        // Keep existing level unchanged
      } else {
        user.level = level;
      }
    }

    // SaaS hierarchy & scoping
    if (tenantId !== undefined) user.tenantId = tenantId;
    if (state !== undefined) user.state = state;
    if (division !== undefined) user.division = division;
    if (district !== undefined) user.district = district;
    if (assembly !== undefined) user.assembly = assembly;
    if (block !== undefined) user.block = block;
    if (panchayat !== undefined) user.panchayat = panchayat;
    if (village !== undefined) user.village = village;
    if (booth !== undefined) user.booth = booth;

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

    // Populate role and tenant for the response
    if (updated.role && mongoose.Types.ObjectId.isValid(updated.role)) {
      const roleDoc = await Role.findById(updated.role).populate(
        "permissions",
        "name displayName",
      );
      if (roleDoc) updated.role = roleDoc;
    }

    const userObj = updated.toObject();
    delete userObj.password;

    if (updated.tenantId) {
      userObj.tenant = await getTenantData(updated.tenantId);
    }

    res.json({
      success: true,
      data: userObj,
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
    throw new Error("Wrong email or password");
  }

  // SaaS: Block login if organization is suspended (skip for users without tenant, e.g. legacy superadmin)
  let tenant = null;
  if (user.tenantId) {
    const Tenant = require("../models/tenantModel");
    tenant = await Tenant.findById(user.tenantId).select(
      "status name enabledModules plan",
    );
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
        tenant: await getTenantData(user.tenantId),
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
// - Platform global admins (no tenantId + system_admin/superadmin) can reset any user
// - Tenant admins can reset passwords of regular employees within their own org only
exports.resetUserPassword = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { temporaryPassword } = req.body;

  const requestingUser = await User.findById(req.user._id).populate("role");
  if (!requestingUser) {
    throw new AppError("Requesting user not found", 404);
  }

  const requesterIsGlobal = isGlobalAdmin(requestingUser);
  const requesterIsTenantAdmin =
    requestingUser.tenantId &&
    (requestingUser.level === "tenant_admin" ||
      (requestingUser.role &&
        typeof requestingUser.role === "object" &&
        requestingUser.role.name === "tenant_admin"));

  // Must be either a global platform admin OR a tenant admin
  if (!requesterIsGlobal && !requesterIsTenantAdmin) {
    throw new AppError("Only administrators can reset user passwords", 403);
  }

  // Find target user
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  // --- Tenant Admin scope enforcement ---
  if (requesterIsTenantAdmin && !requesterIsGlobal) {
    // Target must be in the same organisation
    const sameOrg =
      targetUser.tenantId &&
      targetUser.tenantId.toString() === requestingUser.tenantId.toString();

    if (!sameOrg) {
      throw new AppError(
        "You can only reset passwords for users within your own organisation",
        403,
      );
    }

    // Tenant admins cannot reset another tenant_admin or platform-level account
    const targetIsElevated =
      targetUser.level === "tenant_admin" ||
      targetUser.level === "system_admin" ||
      targetUser.level === "superadmin";

    if (targetIsElevated) {
      throw new AppError(
        "You cannot reset the password of an administrator account",
        403,
      );
    }

    // Tenant admins cannot reset their own password via this endpoint
    if (targetUser._id.toString() === requestingUser._id.toString()) {
      throw new AppError(
        "Use the Change Password feature to update your own password",
        400,
      );
    }
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
      temporaryPassword,
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

/**
 * ADMIN MAINTENANCE: Sanitize user levels
 *
 * Finds all users who belong to an organisation (have a tenantId) but have
 * been incorrectly assigned a platform-level role (system_admin or superadmin).
 * Resets them to 'custom' so they no longer bypass permission checks.
 *
 * GET /api/auth/admin/sanitize-user-levels
 */
exports.sanitizeUserLevels = asyncHandler(async (req, res) => {
  const { isGlobalAdmin: checkIsGlobal } = require("../utils/authHelpers");

  if (!checkIsGlobal(req.user)) {
    res.status(403);
    throw new Error("System administrators only");
  }

  // Find all tenant users (have tenantId) with platform-level roles
  const badUsers = await User.find({
    tenantId: { $exists: true, $ne: null },
    level: { $in: ["system_admin", "superadmin"] },
  }).select("name email level tenantId");

  if (badUsers.length === 0) {
    return res.json({
      success: true,
      message: "No users need fixing — all levels are correct.",
      fixed: [],
    });
  }

  const fixed = [];

  for (const u of badUsers) {
    const oldLevel = u.level;
    u.level = "regularUser"; // Reset to the standard employee level
    await u.save();
    fixed.push({
      userId: u._id,
      name: u.name,
      email: u.email,
      tenantId: u.tenantId,
      oldLevel,
      newLevel: "custom",
    });
  }

  res.json({
    success: true,
    message: `Fixed ${fixed.length} user(s) with incorrect platform-level roles.`,
    fixed,
  });
});
