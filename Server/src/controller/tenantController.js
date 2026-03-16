const mongoose = require("mongoose");
const Tenant = require("../models/tenantModel");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const Payment = require("../models/paymentModel"); // Added for completeness if needed
const Plan = require("../models/planModel");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const {
  MODULES,
  getCoreModuleIds,
} = require("../config/modules");

// @desc    Get all tenants (with userCount for usage display)
// @route   GET /api/tenants
// @access  Private/SystemAdmin
const getTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find({}).populate("owner", "name email").lean();
  const tenantsWithCount = await Promise.all(
    tenants.map(async (t) => {
      const userCount = await User.countDocuments({ tenantId: t._id });
      return {
        ...t,
        status: t.status || "active",
        subscriptionStatus: t.subscriptionStatus || "active",
        userCount,
      };
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

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all permissions for given module IDs
 * Robust version: Creates permissions if they don't exist in DB
 */
const getPermissionsForModules = async (moduleIds) => {
  const allPermissionIds = [];

  for (const moduleId of moduleIds) {
    const moduleConfig = MODULES[moduleId.toUpperCase()];
    if (!moduleConfig) continue;

    const permissions = moduleConfig.permissions || [];
    for (const permName of permissions) {
      // Find or create permission to ensure we have an ID
      const permissionDoc = await Permission.findOneAndUpdate(
        { name: permName },
        {
          $setOnInsert: {
            name: permName,
            displayName: permName
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            module: moduleId,
            category: permName.split("_")[0] || "other",
            description: `Permission for ${moduleConfig.name}`,
            isActive: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      if (permissionDoc) {
        allPermissionIds.push(permissionDoc._id);
      }
    }
  }

  // Remove duplicates
  return [...new Set(allPermissionIds.map((id) => id.toString()))];
};

/**
 * Synchronize tenant role permissions with enabled modules
 * Robust version: Adds missing permissions and removes invalid ones
 */
const syncTenantPermissions = async (tenantId, enabledModules) => {
  // Get all potential permission IDs for currently enabled modules
  // Use getPermissionsForModules to ensure they exist
  const enabledModuleIds = [...enabledModules]; // Create copy
  const expectedPermissionIds =
    await getPermissionsForModules(enabledModuleIds);

  // Update ALL roles for this tenant, but especially target tenant_admin
  const roles = await Role.find({ tenantId });

  for (const role of roles) {
    if (role.level === "tenant_admin" || role.name === "tenant_admin") {
      // Tenant Admins should have EVERYTHING for enabled modules
      role.permissions = expectedPermissionIds;
      role.modules = enabledModules;
    } else {
      // Other roles should only keep permissions for modules that are still enabled
      const currentPermissions = await Permission.find({
        _id: { $in: role.permissions },
      });

      const validPermissions = currentPermissions.filter((p) =>
        enabledModules.includes(p.module),
      );

      role.permissions = validPermissions.map((p) => p._id);
      role.modules = [...new Set(validPermissions.map((p) => p.module))];
    }

    await role.save();
  }

  
};

/**
 * Create default tenant admin role
 */
const createDefaultTenantAdminRole = async (
  tenantId,
  enabledModules,
  session = null,
) => {
  // Check if tenant_admin role already exists for this tenant
  // Don't use session for the check - we want to see if it exists outside the transaction too
  const existingRole = await Role.findOne({
    name: "tenant_admin",
    tenantId,
    isDeleted: { $ne: true },
  });

  if (existingRole) {
    // Role already exists, return it instead of creating a new one
    
    return existingRole;
  }

  // SAFETY CHECK: Look for any orphaned tenant_admin roles with this exact tenantId
  // This can happen if a previous transaction was aborted
  const orphanedRoles = await Role.find({
    name: "tenant_admin",
    tenantId,
  });

  if (orphanedRoles.length > 0) {
    console.warn(
      `[Tenant] Found ${orphanedRoles.length} orphaned tenant_admin role(s) for tenant ${tenantId}. Cleaning up...`,
    );

    // Delete orphaned roles (not using session - these are outside the transaction)
    await Role.deleteMany({
      name: "tenant_admin",
      tenantId,
    });

    
  }

  // Get all permissions for enabled modules
  const permissionIds = await getPermissionsForModules(enabledModules);

  try {
    // Create role with or without session
    const roleData = {
      name: "tenant_admin",
      displayName: "Organization Admin",
      description: "Full access to all enabled modules in the organization",
      tenantId,
      level: "tenant_admin",
      permissions: permissionIds,
      modules: enabledModules,
      isSystem: true,
      isDefault: true, // Mark as default role for the tenant
    };

    

    let adminRole;
    if (session) {
      // DEBUG: Check if role exists in session before creation
      const existingInSession = await Role.findOne({
        name: "tenant_admin",
        tenantId,
      }).session(session);

      if (existingInSession) {
        console.warn(
          `[Tenant] WARNING: Role ALREADY exists in session! ID: ${existingInSession._id}`,
        );
        // If it exists in session, return it to avoid duplicate error
        return existingInSession;
      }

      // Create within transaction using save()
      
      const role = new Role(roleData);
      adminRole = await role.save({ session });
      
    } else {
      // Create without transaction (for backward compatibility)
      
      adminRole = await Role.create(roleData);
      
    }

    
    return adminRole;
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000 && error.message.includes("tenant_admin")) {
      // If we're in a transaction, the duplicate means something went wrong
      // Let the transaction abort and report the error
      if (session) {
        console.error(
          `[Tenant] Duplicate tenant_admin role detected within transaction for tenant ${tenantId}`,
        );
        throw new Error(
          `A tenant_admin role already exists for this tenant. This should not happen. Please contact support.`,
        );
      }

      // If NOT in a transaction, try to recover by fetching existing role
      console.warn(
        `[Tenant] Duplicate tenant_admin role detected. Fetching existing role...`,
      );

      const existingRole = await Role.findOne({
        name: "tenant_admin",
        tenantId,
        isDeleted: { $ne: true },
      });

      if (existingRole) {
        
        return existingRole;
      }

      throw new Error(
        `Failed to create or find tenant_admin role for tenant ${tenantId}.`,
      );
    }

    // Re-throw other errors
    throw error;
  }
};

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

const createTenant = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    plan,
    enabledModules,
    maxUsers,
    contactEmail,
    contactPhone,
    address,
    settings,
    owner: ownerPayload,
  } = req.body;

  // Validate slug uniqueness
  if (slug) {
    const tenantExists = await Tenant.findOne({ slug });
    if (tenantExists) {
      throw new AppError("Slug already exists", 400);
    }
  }

  // Get plan configuration from database
  const planId = plan || "basic";
  const planConfig = await Plan.findOne({ planId });

  if (!planConfig) {
    throw new AppError(`Plan '${planId}' not found in system database.`, 400);
  }

  // Determine enabled modules
  let modules = enabledModules || planConfig.enabledModules || [];

  // Ensure core modules are always included
  const coreModules = getCoreModuleIds();
  modules = [...new Set([...coreModules, ...modules])];

  // Handle maxUsers and maxStorage
  let finalMaxUsers = maxUsers;
  let finalMaxStorage = planConfig.maxStorage;

  // If it's the custom plan, use provided values or sensible defaults
  if (planConfig.planId === "custom") {
    finalMaxUsers = maxUsers || 50; 
    finalMaxStorage = maxStorage || 5120;
  } else {
    // For predefined plans, use plan config (can be overridden by params)
    finalMaxUsers = maxUsers || planConfig.maxUsers;
    finalMaxStorage = planConfig.maxStorage;
  }

  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create tenant within transaction
    const [tenant] = await Tenant.create(
      [
        {
          name,
          slug,
          plan: planConfig.id,
          enabledModules: modules,
          maxUsers: finalMaxUsers,
          maxStorage: finalMaxStorage,
          contactEmail,
          contactPhone,
          address,
          subscriptionStatus: "trial",
          status: "trialing", // Default status for new tenants
          subscriptionStartDate: new Date(),
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          settings,
          createdBy: req.user?._id,
        },
      ],
      { session },
    );

    

    // Create default tenant admin role within transaction
    const tenantAdminRole = await createDefaultTenantAdminRole(
      tenant._id,
      modules,
      session, // Pass session to helper function
    );

    

    // Create tenant admin user if provided
    let ownerUser = null;
    if (
      ownerPayload &&
      typeof ownerPayload === "object" &&
      ownerPayload.email &&
      ownerPayload.name &&
      ownerPayload.password
    ) {
      // Check if user with this email already exists
      const existingUser = await User.findOne({ email: ownerPayload.email });
      if (existingUser) {
        throw new AppError(
          `A user with email ${ownerPayload.email} already exists. Use a different email for the organization admin.`,
          400,
        );
      }

      // Create owner user within transaction
      [ownerUser] = await User.create(
        [
          {
            name: ownerPayload.name,
            email: ownerPayload.email,
            password: ownerPayload.password,
            role: tenantAdminRole._id,
            mobile: ownerPayload.mobile || "",
            userType: "tenant_admin",
            level: "tenant_admin",
            tenantId: tenant._id,
            permissions: {},
          },
        ],
        { session },
      );

      

      // Update tenant with owner reference
      tenant.owner = ownerUser._id;
      await tenant.save({ session });
    }

    // Commit the transaction
    await session.commitTransaction();
    

    // Fetch populated tenant data
    const populated = await Tenant.findById(tenant._id)
      .populate("owner", "name email")
      .lean();

    res.status(201).json({
      status: "success",
      data: {
        ...populated,
        defaultRole: tenantAdminRole,
      },
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error(`[Tenant] Transaction aborted:`, error.message);

    // Re-throw the error to be handled by asyncHandler
    throw error;
  } finally {
    // End the session
    session.endSession();
  }
});

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private/SystemAdmin
const updateTenant = asyncHandler(async (req, res) => {
  let { owner: ownerInput, ownerUser, ...rest } = req.body;
  const update = { ...rest };
  const tenantId = req.params.id;

  let ownerId = undefined;

  // Polymorphic 'owner' field handling:
  // 1. If 'ownerUser' is explicitly provided, use it.
  // 2. If 'owner' is an object (and not null), treat it as new user details (ownerUser).
  // 3. If 'owner' is a string or null, treat it as an existing user ID (ownerId).

  if (ownerInput && typeof ownerInput === "object") {
    ownerUser = ownerInput;
    ownerId = undefined; // Ensure we don't treat the object as an ID
  } else {
    ownerId = ownerInput;
  }

  // Handle Owner Assignment (Existing User ID)
  if (ownerId !== undefined) {
    if (ownerId === null || ownerId === "") {
      update.$unset = update.$unset || {};
      update.$unset.owner = 1;
    } else {
      const userBelongsToTenant = await User.findOne({
        _id: ownerId,
        tenantId: tenantId,
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

  // Handle New Owner Creation (In Edit Mode)
  if (
    ownerUser &&
    typeof ownerUser === "object" &&
    ownerUser.email &&
    ownerUser.name &&
    ownerUser.password
  ) {
    // 1. Check if user exists
    const existingUser = await User.findOne({ email: ownerUser.email });
    if (existingUser) {
      throw new AppError(
        `A user with email ${ownerUser.email} already exists.`,
        400,
      );
    }

    // 2. Find/Create Tenant Admin Role
    let tenantAdminRole = await Role.findOne({
      name: "tenant_admin",
      tenantId: tenantId,
    });

    if (!tenantAdminRole) {
      // Fallback: Create default role if missing
      tenantAdminRole = await createDefaultTenantAdminRole(
        tenantId,
        update.enabledModules || [], // Might need to fetch existing if not in update
      );
    }

    // 3. Create User
    const [newUser] = await User.create([
      {
        name: ownerUser.name,
        email: ownerUser.email,
        password: ownerUser.password,
        mobile: ownerUser.mobile || "",
        role: tenantAdminRole._id,
        userType: "tenant_admin",
        level: "tenant_admin",
        tenantId: tenantId,
        permissions: new Map(),
        status: "active",
      },
    ]);

    

    // 4. Set as owner
    update.owner = newUser._id;
  }

  const tenant = await Tenant.findByIdAndUpdate(tenantId, update, {
    new: true,
    runValidators: true,
  }).populate("owner", "name email");

  if (!tenant) {
    throw new AppError("No tenant found with that ID", 404);
  }

  // The tenant is already populated with the new owner details due to {new: true}
  // and populate("owner"). No additional fetching needed.

  res.status(200).json({
    status: "success",
    data: tenant,
  });
});

// @desc    Delete tenant
// @route   DELETE /api/tenants/:id
// @access  Private/SystemAdmin
const deleteTenant = asyncHandler(async (req, res) => {
  const tenantId = req.params.id;

  // Verify tenant exists
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new AppError("No tenant found with that ID", 404);
  }

  // Start a transaction for cascade delete
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    

    // 1. Delete all roles associated with this tenant
    const rolesResult = await Role.deleteMany({ tenantId }, { session });
    

    // 2. Delete all users associated with this tenant
    const usersResult = await User.deleteMany({ tenantId }, { session });
    

    // 3. Delete the tenant itself
    await Tenant.findByIdAndDelete(tenantId, { session });
    

    // Commit the transaction
    await session.commitTransaction();
    

    res.status(200).json({
      status: "success",
      message: `Tenant '${tenant.name}' and all associated data deleted successfully`,
      data: {
        deletedRoles: rolesResult.deletedCount,
        deletedUsers: usersResult.deletedCount,
      },
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error(`[Tenant] Cascade delete failed:`, error.message);
    throw error;
  } finally {
    session.endSession();
  }
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
      `Something went very wrong! Your organization has reached the limit of ${tenant.maxUsers} users. Please upgrade your plan. and contact to the provider or something for that`,
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

// @desc    Get available modules
// @route   GET /api/tenants/modules
// @access  Private/SystemAdmin
const getAvailableModules = asyncHandler(async (req, res) => {
  const modules = Object.values(MODULES).map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    category: m.category,
    alwaysEnabled: m.alwaysEnabled || false,
    permissions: m.permissions,
  }));

  res.status(200).json({
    status: "success",
    data: modules,
  });
});

// @desc    Get available plans
// @route   GET /api/tenants/plans
// @access  Private/SystemAdmin
const getAvailablePlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ isActive: true }).sort({ priceMonthlyPaise: 1 });
  
  const mappedPlans = plans.map((p) => ({
    id: p.planId,
    name: p.name,
    description: p.description,
    price: p.priceMonthlyPaise / 100,
    maxUsers: p.maxUsers,
    maxStorage: p.maxStorage,
    enabledModules: p.enabledModules,
  }));

  res.status(200).json({
    status: "success",
    data: mappedPlans,
  });
});

// @desc    Update tenant modules
// @route   PUT /api/tenants/:id/modules
// @access  Private/SystemAdmin
const updateTenantModules = asyncHandler(async (req, res) => {
  const { enabledModules, plan, maxUsers, maxStorage } = req.body;
  const tenantId = req.params.id;

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  // Update modules manually if provided
  if (enabledModules) {
    const coreModules = getCoreModuleIds();
    tenant.enabledModules = [...new Set([...coreModules, ...enabledModules])];
  }

  // Update plan and its associated defaults
  if (plan) {
    const planConfig = await Plan.findOne({ planId: plan });
    if (planConfig) {
      tenant.plan = planConfig.planId;
      
      // Only override if not explicitly providing new limits
      if (maxUsers === undefined) tenant.maxUsers = planConfig.maxUsers;
      if (maxStorage === undefined) tenant.maxStorage = planConfig.maxStorage;

      // If switching to a standard plan (not custom), reset modules to plan defaults
      // unless user explicitly passed enabledModules in the same request
      if (plan !== "custom" && !enabledModules) {
        const coreModules = getCoreModuleIds();
        tenant.enabledModules = [
          ...new Set([...coreModules, ...(planConfig.enabledModules || [])]),
        ];
      }
    }
  }

  // Explicit limit overrides
  if (maxUsers !== undefined) tenant.maxUsers = maxUsers;
  if (maxStorage !== undefined) tenant.maxStorage = maxStorage;

  await tenant.save();

  // Sync role permissions (Robust: Adds new modules, removes disabled ones)
  await syncTenantPermissions(tenantId, tenant.enabledModules);

  res.status(200).json({
    status: "success",
    data: tenant,
  });
});

// @desc    Get tenant's enabled modules
// @route   GET /api/tenants/:id/modules
// @access  Private/SystemAdmin or TenantAdmin
const getTenantModules = asyncHandler(async (req, res) => {
  const tenantId = req.params.id;

  const tenant = await Tenant.findById(tenantId).select("enabledModules plan");
  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  const enabledModuleDetails = tenant.enabledModules
    .map((moduleId) => {
      const module = Object.values(MODULES).find((m) => m.id === moduleId);
      return module
        ? {
            id: module.id,
            name: module.name,
            description: module.description,
            category: module.category,
          }
        : null;
    })
    .filter(Boolean);

  res.status(200).json({
    status: "success",
    data: {
      plan: tenant.plan,
      enabledModules: tenant.enabledModules,
      moduleDetails: enabledModuleDetails,
    },
  });
});

// @desc    Get current user's tenant details
// @route   GET /api/tenants/me
// @access  Private
const getMyTenant = asyncHandler(async (req, res) => {
  if (!req.tenantId) {
    throw new AppError("No organization associated with this account", 404);
  }

  const tenant = await Tenant.findById(req.tenantId).populate(
    "owner",
    "name email",
  );
  if (!tenant) {
    throw new AppError("Organization not found", 404);
  }

  const userCount = await User.countDocuments({ tenantId: req.tenantId });
  const tenantObj = tenant.toObject ? tenant.toObject() : tenant;
  tenantObj.userCount = userCount;

  res.status(200).json({
    status: "success",
    data: tenantObj,
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
  getAvailableModules,
  getAvailablePlans,
  updateTenantModules,
  getTenantModules,
  getMyTenant,
};
