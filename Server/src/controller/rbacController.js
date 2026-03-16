const asyncHandler = require("express-async-handler");
const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const Tenant = require("../models/tenantModel");
const { logActivity } = require("./activityLogController");
const { MODULES, getModuleById, getCoreModuleIds } = require("../config/modules");
const { validateUserTenant, isGlobalAdmin } = require("../utils/authHelpers");

// ==================== PERMISSION CONTROLLERS ====================

// Get all permissions (system admin only - sees all)
exports.getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find({ isActive: true });
  res.status(200).json({
    success: true,
    data: permissions,
  });
});

// Get available permissions for tenant (filtered by enabled modules)
exports.getAvailablePermissions = asyncHandler(async (req, res) => {
  const tenantId = req.user?.tenantId || req.tenantId;

  // System admins see all permissions
  if (isGlobalAdmin(req.user)) {
    const permissions = await Permission.find({
      isActive: true,
      module: { $in: Object.values(MODULES).map((m) => m.id) },
    }).sort({ module: 1, name: 1 });

    // Group by module using registry order to ensure consistency with sidebar
    const permissionsByModule = {};
    permissions.forEach((perm) => {
      if (!permissionsByModule[perm.module]) {
        permissionsByModule[perm.module] = [];
      }
      permissionsByModule[perm.module].push(perm);
    });

    const orderedPermissions = [];
    Object.values(MODULES).forEach((module) => {
      if (permissionsByModule[module.id]) {
        orderedPermissions.push({
          module: module.id,
          moduleName: module.name,
          moduleDescription: module.description || "",
          permissions: permissionsByModule[module.id],
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        enabledModules: Object.keys(MODULES).map((k) => MODULES[k].id),
        permissions: orderedPermissions,
      },
    });
  }

  // Get tenant's enabled modules
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    res.status(404);
    throw new Error("Tenant not found");
  }

  const Plan = require("../models/planModel");
  const planConfig = await Plan.findOne({ planId: tenant.plan || "basic" });
  const coreModules = getCoreModuleIds();

  const allEnabledModules = [
    ...new Set([
      ...coreModules,
      ...(planConfig?.enabledModules || []),
      ...(tenant.enabledModules || []),
    ]),
  ];

  // Get permissions only for enabled modules
  const permissions = await Permission.find({
    module: { $in: allEnabledModules },
    isActive: true,
  }).sort({ module: 1, name: 1 });

  // Group by module using registry order
  const permissionsByModule = {};
  permissions.forEach((perm) => {
    if (!permissionsByModule[perm.module]) {
      permissionsByModule[perm.module] = [];
    }
    permissionsByModule[perm.module].push(perm);
  });

  const orderedPermissions = [];
  Object.values(MODULES).forEach((module) => {
    if (
      permissionsByModule[module.id] &&
      allEnabledModules.includes(module.id)
    ) {
      orderedPermissions.push({
        module: module.id,
        moduleName: module.name,
        moduleDescription: module.description || "",
        permissions: permissionsByModule[module.id],
      });
    }
  });

  res.status(200).json({
    success: true,
    data: {
      enabledModules: allEnabledModules,
      permissions: orderedPermissions,
    },
  });
});

// Create permission (system admin only)
exports.createPermission = asyncHandler(async (req, res) => {
  const { name, displayName, description, category, module } = req.body;

  if (!name || !displayName) {
    res.status(400);
    throw new Error("Name and displayName are required");
  }

  if (!module) {
    res.status(400);
    throw new Error("Module is required");
  }

  const permission = await Permission.create({
    name,
    displayName,
    description,
    category,
    module,
    isActive: true,
  });

  await logActivity(
    req,
    "CREATE",
    "Permission",
    `Created permission: ${permission.displayName} (${permission.name}) for module: ${module}`,
    { recordId: permission._id, newData: permission },
  );

  res.status(201).json({
    success: true,
    data: permission,
  });
});

// ==================== ROLE CONTROLLERS ====================

// Get all roles
exports.getAllRoles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  // Build query
  const query = { isDeleted: { $ne: true }, ...req.scopeFilter };

  // Hide tenant_admin roles from non-global-admins
  if (!isGlobalAdmin(req.user)) {
    query.level = { $ne: "tenant_admin" };
    // Also hide by name just in case
    query.name = { $ne: "tenant_admin" };
  }

  const pageNum = parseInt(page) || 1;
  let limitNum = parseInt(limit);
  if (isNaN(limitNum)) limitNum = 50;
  const fetchAll = limitNum === -1;

  const total = await Role.countDocuments({
    isDeleted: { $ne: true },
    ...req.scopeFilter,
  });

  let rolesQuery = Role.find(query).populate("permissions");
  if (!fetchAll) {
    rolesQuery = rolesQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
  }

  const roles = await rolesQuery;

  // Format the response to match what the frontend expects
  const formattedRoles = roles.map((role) => ({
    _id: role._id,
    role: role.name,
    type: role.isSystem ? "System" : "Custom",
    createdAt: role.createdAt,
    ...role.toObject(),
  }));

  res.status(200).json({
    success: true,
    total,
    count: formattedRoles.length,
    page: pageNum,
    limit: fetchAll ? -1 : limitNum,
    data: formattedRoles,
  });
});

// Get single role by id
exports.getRoleById = asyncHandler(async (req, res) => {
  const query = {
    _id: req.params.id,
    isDeleted: { $ne: true },
    ...req.scopeFilter,
  };

  // Prevent non-global-admins from accessing tenant_admin roles by ID
  if (!isGlobalAdmin(req.user)) {
    query.level = { $ne: "tenant_admin" };
    query.name = { $ne: "tenant_admin" };
  }

  const role = await Role.findOne(query).populate("permissions");

  if (!role || role.isDeleted) {
    res.status(404);
    throw new Error("Role not found");
  }

  res.status(200).json({
    success: true,
    data: role,
  });
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Validate that permissions belong to tenant's enabled modules
 */
const validatePermissionsForTenant = async (permissionIds, tenantId) => {
  // Input validation
  if (
    !permissionIds ||
    !Array.isArray(permissionIds) ||
    permissionIds.length === 0
  ) {
    return { valid: true, invalidPermissions: [], tenant: null };
  }

  if (!tenantId) {
    return { valid: true, invalidPermissions: [], tenant: null };
  }

  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const permissionDocs = await Permission.find({
    _id: { $in: permissionIds },
  });

  const invalidPerms = permissionDocs.filter(
    (p) => !tenant.enabledModules.includes(p.module),
  );

  return {
    valid: invalidPerms.length === 0,
    invalidPermissions: invalidPerms,
    tenant,
  };
};

// ==================== ROLE CONTROLLERS ====================

// Create role
exports.createRole = asyncHandler(async (req, res) => {
  const { name, displayName, description, permissions, sidebarAccess, level } =
    req.body;

  if (!name || !displayName) {
    res.status(400);
    throw new Error("Name and displayName are required");
  }

  const mongoose = require("mongoose");
  let tenantId;

  if (isGlobalAdmin(req.user)) {
    // Global admins (no tenantId) can target any org via req.body.tenantId
    // or create platform-level roles (tenantId = null) when no org is specified
    if (
      req.body.tenantId &&
      mongoose.Types.ObjectId.isValid(req.body.tenantId)
    ) {
      tenantId = new mongoose.Types.ObjectId(req.body.tenantId);
    } else {
      tenantId = null; // platform-level role
    }
  } else {
    // Tenant users always create roles in their own organisation — no override possible
    if (!req.tenantId) {
      res.status(403);
      throw new Error("Unable to determine organisation context");
    }
    tenantId = req.tenantId;
  }

  // Check for duplicate role name within the same tenant (case-insensitive)
  const existingRole = await Role.findOne({
    name: name.toLowerCase(),
    tenantId,
    isDeleted: { $ne: true },
  });

  if (existingRole) {
    res.status(400);
    throw new Error(
      tenantId
        ? `A role named '${name}' already exists in this organization. Please choose a different name.`
        : `A platform-level role named '${name}' already exists. Please choose a different name.`,
    );
  }

  // Validate permissions belong to enabled modules (for tenant roles)
  if (permissions && permissions.length > 0 && tenantId) {
    const validation = await validatePermissionsForTenant(
      permissions,
      tenantId,
    );
    if (!validation.valid) {
      res.status(400);
      throw new Error(
        `Some permissions are from disabled modules: ${validation.invalidPermissions.map((p) => p.displayName).join(", ")}`,
      );
    }
  }

  // Get modules from permissions
  const permissionDocs = await Permission.find({
    _id: { $in: permissions || [] },
  });
  const modules = [...new Set(permissionDocs.map((p) => p.module))];

  const role = await Role.create({
    name,
    displayName,
    description,
    permissions: permissions || [],
    modules,
    sidebarAccess: sidebarAccess || [],
    level: level || "custom",
    status: req.body.status || "active",
    tenantId,
    createdBy: req.user?._id,
  });

  await logActivity(
    req,
    "CREATE",
    "Role",
    `Created role: ${role.displayName} (${role.name}) with ${modules.length} modules`,
    { recordId: role._id, newData: role },
  );

  res.status(201).json({
    success: true,
    data: role,
  });
});

// Update role
exports.updateRole = asyncHandler(async (req, res) => {
  const { name, displayName, description, permissions, sidebarAccess, status } =
    req.body;

  const role = await Role.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true },
    ...req.scopeFilter,
  });

  if (!role || role.isDeleted) {
    res.status(404);
    throw new Error("Role not found");
  }

  // Prevent updating system roles or organization admin roles unless user is global admin
  const isSystemRole = role.isSystem || role.level === "tenant_admin";
  if (isSystemRole && !isGlobalAdmin(req.user)) {
    res.status(403);
    throw new Error(
      "Unauthorized: Organization Admin and System roles can only be updated by the System Administrator.",
    );
  }

  // Validate permissions if provided
  if (permissions && permissions.length > 0 && role.tenantId) {
    const validation = await validatePermissionsForTenant(
      permissions,
      role.tenantId,
    );

    if (!validation.valid) {
      res.status(400);
      throw new Error(
        `Some permissions are from disabled modules: ${validation.invalidPermissions.map((p) => p.displayName).join(", ")}`,
      );
    }
  }

  const oldData = role.toObject();

  role.name = name || role.name;
  role.displayName = displayName || role.displayName;
  role.description = description || role.description;
  role.permissions = permissions || role.permissions;
  role.sidebarAccess = sidebarAccess || role.sidebarAccess;
  role.status = status || role.status;

  // Update modules based on permissions
  if (permissions) {
    const permissionDocs = await Permission.find({
      _id: { $in: permissions },
    });
    role.modules = [...new Set(permissionDocs.map((p) => p.module))];
  }

  await role.save();

  await logActivity(
    req,
    "UPDATE",
    "Role",
    `Updated role: ${role.displayName} (${role.name})`,
    { recordId: role._id, newData: role, oldData },
  );

  res.status(200).json({
    success: true,
    data: role,
  });
});

// Delete role
exports.deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findOne({
    _id: req.params.id,
    isDeleted: { $ne: true },
    ...req.scopeFilter,
  });

  if (!role || role.isDeleted) {
    res.status(404);
    throw new Error("Role not found");
  }

  const isSystemRole = role.isSystem || role.level === "tenant_admin";
  if (isSystemRole && !isGlobalAdmin(req.user)) {
    res.status(403);
    throw new Error(
      "Unauthorized: Organization Admin and System roles can only be deleted by the System Administrator.",
    );
  }

  role.isDeleted = true;
  await role.save();

  await logActivity(
    req,
    "DELETE",
    "Role",
    `Deleted role: ${role.displayName} (${role.name})`,
    { recordId: role._id, oldData: role },
  );

  res.status(200).json({
    success: true,
    message: "Role deleted successfully",
  });
});

// ==================== ADMIN / MAINTENANCE ====================

// Rebuild the role unique index so same name is allowed across different tenants
exports.fixRoleIndex = asyncHandler(async (req, res) => {
  if (!isGlobalAdmin(req.user)) {
    res.status(403);
    throw new Error("System administrators only");
  }

  const mongoose = require("mongoose");
  const col = mongoose.connection.db.collection("roles");
  const results = [];

  try {
    const before = await col.indexes();
    results.push(`Found ${before.length} indexes before migration`);

    // Drop any unique index that covers the "name" field
    const toDrop = before.filter(
      (i) => i.name !== "_id_" && i.unique && i.key.name !== undefined,
    );

    for (const idx of toDrop) {
      await col.dropIndex(idx.name);
      results.push(`Dropped index: ${idx.name}`);
    }

    // Recreate the correct partial unique index
    await col.createIndex(
      { name: 1, tenantId: 1 },
      {
        name: "role_name_tenantId_unique",
        unique: true,
        partialFilterExpression: { isDeleted: { $ne: true } },
      },
    );
    results.push("Created new partial unique index: role_name_tenantId_unique");

    const after = await col.indexes();
    results.push(`Final indexes: ${after.map((i) => i.name).join(", ")}`);

    res.json({
      success: true,
      message:
        "Role index rebuilt successfully. Same role names can now exist in different organizations.",
      results,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, results });
  }
});

// Debug: list all roles by name across all tenants
exports.debugRoles = asyncHandler(async (req, res) => {
  if (!isGlobalAdmin(req.user)) {
    res.status(403);
    throw new Error("System administrators only");
  }

  const { name } = req.query;
  const filter = name ? { name: name.toLowerCase() } : {};

  const roles = await Role.find(filter)
    .select("name displayName tenantId level isDeleted isSystem status")
    .populate("tenantId", "name slug");

  res.json({ success: true, count: roles.length, data: roles });
});
