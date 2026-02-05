const asyncHandler = require("express-async-handler");
const Role = require("../models/roleModel");
const Permission = require("../models/permissionModel");
const { logActivity } = require("./activityLogController");

// ==================== PERMISSION CONTROLLERS ====================

// Get all permissions
exports.getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find();
  res.status(200).json({
    success: true,
    data: permissions,
  });
});

// Create permission
exports.createPermission = asyncHandler(async (req, res) => {
  const { name, displayName, description, category } = req.body;

  if (!name || !displayName) {
    res.status(400);
    throw new Error("Name and displayName are required");
  }

  const permission = await Permission.create({
    name,
    displayName,
    description,
    category,
  });

  await logActivity(
    req,
    "CREATE",
    "Permission",
    `Created permission: ${permission.displayName} (${permission.name})`,
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
  const roles = await Role.find({ isDeleted: { $ne: true } }).populate(
    "permissions",
  );

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
    data: formattedRoles,
  });
});

// Get single role by id
exports.getRoleById = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id).populate("permissions");

  if (!role || role.isDeleted) {
    res.status(404);
    throw new Error("Role not found");
  }

  res.status(200).json({
    success: true,
    data: role,
  });
});

// Create role
exports.createRole = asyncHandler(async (req, res) => {
  const { name, displayName, description, permissions, sidebarAccess } =
    req.body;

  if (!name || !displayName) {
    res.status(400);
    throw new Error("Name and displayName are required");
  }

  const role = await Role.create({
    name,
    displayName,
    description,
    permissions: permissions || [],
    sidebarAccess: sidebarAccess || [],
    status: req.body.status || "active",
  });

  await logActivity(
    req,
    "CREATE",
    "Role",
    `Created role: ${role.displayName} (${role.name})`,
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

  const role = await Role.findById(req.params.id);

  if (!role || role.isDeleted) {
    res.status(404);
    throw new Error("Role not found");
  }

  // Prevent updating system roles
  if (role.isSystem) {
    res.status(403);
    throw new Error("Cannot update system roles");
  }

  const oldData = role.toObject();

  role.name = name || role.name;
  role.displayName = displayName || role.displayName;
  role.description = description || role.description;
  role.permissions = permissions || role.permissions;
  role.sidebarAccess = sidebarAccess || role.sidebarAccess;
  role.status = status || role.status;

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
  const role = await Role.findById(req.params.id);

  if (!role || role.isDeleted) {
    res.status(404);
    throw new Error("Role not found");
  }

  if (role.isSystem) {
    res.status(400);
    throw new Error("Cannot delete system roles");
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

// ==================== SIDEBAR ACCESS CONTROLLERS ====================

// Get sidebar permissions map
exports.getSidebarAccess = asyncHandler(async (req, res) => {
  const roles = await Role.find({ isDeleted: { $ne: true } }).select(
    "name sidebarAccess",
  );

  const accessMap = {};
  roles.forEach((role) => {
    if (role?.name) {
      accessMap[role.name] = role.sidebarAccess || [];
    }
  });

  // Ensure superadmin always has full access (wildcard)
  // This is server-side protection in case DB is missing it.
  accessMap.superadmin = ["*"];

  res.status(200).json({
    success: true,
    data: accessMap,
  });
});

// Update sidebar permissions map
exports.upsertSidebarAccess = asyncHandler(async (req, res) => {
  const accessMap = req.body; // { roleName: [paths...] }

  if (!accessMap || typeof accessMap !== "object") {
    res.status(400);
    throw new Error("Invalid access map format");
  }

  // Force superadmin wildcard and prevent accidental modification from client
  accessMap.superadmin = ["*"];

  const updates = Object.entries(accessMap).map(([roleName, paths]) =>
    Role.findOneAndUpdate(
      { name: roleName },
      { sidebarAccess: Array.isArray(paths) ? paths : [] },
      { new: true, upsert: false }, // don't create new roles here
    ),
  );

  await Promise.all(updates);

  await logActivity(
    req,
    "UPDATE",
    "SidebarAccess",
    `Updated sidebar permissions for roles: ${Object.keys(accessMap).join(
      ", ",
    )}`,
    { recordId: null, newData: accessMap },
  );

  res.status(200).json({
    success: true,
    message: "Sidebar permissions updated successfully",
    data: accessMap,
  });
});
