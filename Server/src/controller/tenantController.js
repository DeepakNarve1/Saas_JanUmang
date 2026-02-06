const Tenant = require("../models/tenantModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private/SystemAdmin
const getTenants = asyncHandler(async (req, res) => {
  const tenants = await Tenant.find({}).populate("owner", "name email");
  res.status(200).json({
    status: "success",
    results: tenants.length,
    data: tenants,
  });
});

// @desc    Get single tenant
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
  res.status(200).json({
    status: "success",
    data: tenant,
  });
});

// @desc    Create new tenant
// @route   POST /api/tenants
// @access  Private/SystemAdmin
const createTenant = asyncHandler(async (req, res) => {
  const { name, slug, plan, maxUsers, status } = req.body;

  const tenantExists = await Tenant.findOne({ slug });
  if (tenantExists) {
    throw new AppError("Slug already exists", 400);
  }

  const tenant = await Tenant.create({
    name,
    slug,
    plan,
    maxUsers,
    status,
  });

  res.status(201).json({
    status: "success",
    data: tenant,
  });
});

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private/SystemAdmin
const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

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

module.exports = {
  getTenants,
  getTenant,
  createTenant,
  updateTenant,
  deleteTenant,
};
