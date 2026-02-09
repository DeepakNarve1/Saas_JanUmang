const Tenant = require("../models/tenantModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");

// @desc    Get all tenants (with userCount for usage display)
// @route   GET /api/tenants
// @access  Private/SystemAdmin
const getTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find({}).populate("owner", "name email").lean();
  const tenantsWithCount = await Promise.all(
    tenants.map(async (t) => {
      const userCount = await User.countDocuments({ tenantId: t._id });
      return { ...t, userCount };
    }),
  );
  res.status(200).json({
    status: "success",
    results: tenantsWithCount.length,
    data: tenantsWithCount,
  });
});

// @desc    Get SaaS stats for super admin dashboard
// @route   GET /api/tenants/stats
// @access  Private/SystemAdmin
const getTenantStats = asyncHandler(async (req, res) => {
  const [
    totalTenants,
    totalUsers,
    statusCounts,
    planCounts,
    recentTenants,
    recentUsers,
  ] = await Promise.all([
    Tenant.countDocuments({}),
    User.countDocuments({}),
    Tenant.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Tenant.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }]),
    Tenant.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("owner", "name email")
      .select("name slug plan status maxUsers createdAt")
      .lean(),
    User.find({})
      .select("name email tenantId createdAt level")
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("tenantId", "name slug")
      .lean(),
  ]);

  const byStatus = { active: 0, suspended: 0, trialing: 0 };
  statusCounts.forEach((s) => {
    if (byStatus[s._id] !== undefined) byStatus[s._id] = s.count;
  });

  const byPlan = { Basic: 0, Pro: 0, Enterprise: 0 };
  planCounts.forEach((p) => {
    if (byPlan[p._id] !== undefined) byPlan[p._id] = p.count;
  });

  // Add userCount to each recent tenant
  const recentTenantsWithCount = await Promise.all(
    recentTenants.map(async (t) => {
      const userCount = await User.countDocuments({ tenantId: t._id });
      return { ...t, userCount };
    }),
  );

  res.status(200).json({
    status: "success",
    data: {
      totalTenants,
      totalUsers,
      byStatus,
      byPlan,
      recentTenants: recentTenantsWithCount,
      recentUsers,
    },
  });
});

// @desc    Get single tenant (with userCount for usage display)
// @route   GET /api/tenants/:id
// @access  Private/SystemAdmin
const getTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.id).populate(
    "owner",
    "name email",
  );
  if (!tenant) {
    throw new AppError("No tenant found with that ID", 404);
  }
  const userCount = await User.countDocuments({ tenantId: req.params.id });
  const tenantObj = tenant.toObject ? tenant.toObject() : tenant;
  tenantObj.userCount = userCount;
  res.status(200).json({
    status: "success",
    data: tenantObj,
  });
});

// @desc    Get users for a tenant (system admin only)
// @route   GET /api/tenants/:id/users
// @access  Private/SystemAdmin
const getTenantUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ tenantId: req.params.id })
    .select("-password")
    .populate("role", "name displayName")
    .sort({ createdAt: -1 })
    .lean();
  const total = users.length;
  res.status(200).json({
    status: "success",
    results: total,
    data: users,
  });
});

const createTenant = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    plan,
    maxUsers,
    status,
    settings,
    owner: ownerPayload,
  } = req.body;

  if (slug) {
    const tenantExists = await Tenant.findOne({ slug });
    if (tenantExists) {
      throw new AppError("Slug already exists", 400);
    }
  }

  const tenant = await Tenant.create({
    name,
    slug,
    plan,
    maxUsers,
    status,
    settings,
  });

  // Optional: create tenant admin (first user) and set as owner
  if (
    ownerPayload &&
    typeof ownerPayload === "object" &&
    ownerPayload.email &&
    ownerPayload.name &&
    ownerPayload.password
  ) {
    const existingUser = await User.findOne({ email: ownerPayload.email });
    if (existingUser) {
      await Tenant.findByIdAndDelete(tenant._id);
      throw new AppError(
        `A user with email ${ownerPayload.email} already exists. Use a different email for the organization admin.`,
        400,
      );
    }

    const Role = require("../models/roleModel");
    let roleId = ownerPayload.roleId || null;
    if (!roleId) {
      const adminRole = await Role.findOne({
        name: { $in: ["admin", "tenant_admin", "organization admin"] },
        $or: [{ tenantId: null }, { tenantId: tenant._id }],
      }).sort({ tenantId: 1 });
      if (adminRole) roleId = adminRole._id;
    }
    if (!roleId) {
      const anyRole = await Role.findOne({}).sort({ createdAt: 1 });
      if (anyRole) roleId = anyRole._id;
    }
    if (!roleId) {
      await Tenant.findByIdAndDelete(tenant._id);
      throw new AppError(
        "No role found in the system. Please create at least one role (e.g. Admin) first.",
        400,
      );
    }

    const ownerUser = await User.create({
      name: ownerPayload.name,
      email: ownerPayload.email,
      password: ownerPayload.password,
      role: roleId,
      mobile: ownerPayload.mobile || "",
      userType: ownerPayload.userType || "tenant_admin",
      level: "tenant_admin",
      tenantId: tenant._id,
      permissions: {},
    });

    tenant.owner = ownerUser._id;
    await tenant.save();
  }

  const populated = await Tenant.findById(tenant._id).populate(
    "owner",
    "name email",
  );

  res.status(201).json({
    status: "success",
    data: populated,
  });
});

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private/SystemAdmin
const updateTenant = asyncHandler(async (req, res) => {
  const { owner: ownerId, ...rest } = req.body;
  const update = { ...rest };
  if (ownerId !== undefined) {
    if (ownerId === null || ownerId === "") {
      update.$unset = update.$unset || {};
      update.$unset.owner = 1;
    } else {
      const userBelongsToTenant = await User.findOne({
        _id: ownerId,
        tenantId: req.params.id,
      });
      if (!userBelongsToTenant) {
        throw new AppError(
          "Owner must be a user belonging to this organization",
          400,
        );
      }
      update.owner = ownerId;
    }
  }

  const tenant = await Tenant.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  }).populate("owner", "name email");

  if (!tenant) {
    throw new AppError("No tenant found with that ID", 404);
  }

  res.status(200).json({
    status: "success",
    data: tenant,
  });
});

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private/SystemAdmin
const deleteTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findByIdAndDelete(req.params.id);

  if (!tenant) {
    throw new AppError("No tenant found with that ID", 404);
  }

  // Optionally delete all users associated with this tenant
  // await User.deleteMany({ tenantId: req.params.id });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// @desc    Create a new admin for a tenant
// @route   POST /api/tenants/:id/admins
// @access  Private/SystemAdmin
const createTenantAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, mobile, roleId } = req.body;
  const tenantId = req.params.id;

  // Verify tenant exists
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(
      `A user with email ${email} already exists. Please use a different email.`,
      400,
    );
  }

  // Check if tenant has reached max users
  const currentUserCount = await User.countDocuments({ tenantId });
  if (tenant.maxUsers && currentUserCount >= tenant.maxUsers) {
    throw new AppError(
      `This organization has reached its maximum user limit (${tenant.maxUsers})`,
      400,
    );
  }

  // Find appropriate admin role
  const Role = require("../models/roleModel");
  let adminRoleId = roleId;

  if (!adminRoleId) {
    const adminRole = await Role.findOne({
      name: { $in: ["admin", "tenant_admin", "organization admin"] },
      $or: [{ tenantId: null }, { tenantId: tenantId }],
    }).sort({ tenantId: 1 });

    if (adminRole) {
      adminRoleId = adminRole._id;
    } else {
      // Fallback to any role
      const anyRole = await Role.findOne({}).sort({ createdAt: 1 });
      if (anyRole) adminRoleId = anyRole._id;
    }
  }

  if (!adminRoleId) {
    throw new AppError(
      "No role found in the system. Please create at least one role first.",
      400,
    );
  }

  // Create the admin user
  const newAdmin = await User.create({
    name,
    email,
    password,
    role: adminRoleId,
    mobile: mobile || "",
    userType: "tenant_admin",
    level: "tenant_admin",
    tenantId: tenantId,
    permissions: {},
    status: "active",
  });

  // Return user without password
  const adminUser = await User.findById(newAdmin._id)
    .select("-password")
    .populate("role", "name displayName");

  res.status(201).json({
    status: "success",
    data: adminUser,
  });
});

// @desc    Delete a tenant admin/user
// @route   DELETE /api/tenants/:id/admins/:userId
// @access  Private/SystemAdmin
const deleteTenantAdmin = asyncHandler(async (req, res) => {
  const { id: tenantId, userId } = req.params;

  // Verify tenant exists
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  // Find the user
  const user = await User.findOne({ _id: userId, tenantId });
  if (!user) {
    throw new AppError("User not found in this organization", 404);
  }

  // Prevent deletion if user is the tenant owner
  if (tenant.owner && tenant.owner.toString() === userId) {
    throw new AppError(
      "Cannot delete the organization owner. Please transfer ownership first.",
      400,
    );
  }

  // Check if user is a superadmin (additional safety)
  if (user.role === "superadmin") {
    throw new AppError("Cannot delete superadmin account", 403);
  }

  const Role = require("../models/roleModel");
  if (user.role && typeof user.role === "object") {
    const roleDoc = await Role.findById(user.role);
    if (roleDoc?.name === "superadmin") {
      throw new AppError("Cannot delete superadmin account", 403);
    }
  }

  // Delete the user
  await User.findByIdAndDelete(userId);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getTenants,
  getTenant,
  getTenantStats,
  getTenantUsers,
  createTenant,
  updateTenant,
  deleteTenant,
  createTenantAdmin,
  deleteTenantAdmin,
};
