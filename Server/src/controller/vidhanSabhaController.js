const asyncHandler = require("express-async-handler");
const VidhanSabha = require("../models/vidhanSabhaModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all VidhanSabhas
exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = { ...req.scopeFilter };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  let paginationLimit = parseInt(limit);
  // If limit is -1, return all
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const total = await VidhanSabha.countDocuments({ ...req.scopeFilter });
  const count = await VidhanSabha.countDocuments(query);

  let queryBuilder = VidhanSabha.find(query).sort({ createdAt: -1 });

  if (paginationLimit > 0) {
    queryBuilder = queryBuilder
      .limit(paginationLimit)
      .skip((page - 1) * paginationLimit);
  }

  const data = await queryBuilder;

  res.status(200).json({
    success: true,
    total,
    count,
    data,
  });
});

// Get single VidhanSabha
exports.getById = asyncHandler(async (req, res) => {
  const vidhanSabha = await VidhanSabha.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!vidhanSabha) {
    res.status(404);
    throw new Error("Vidhan Sabha not found");
  }
  res.status(200).json({ success: true, data: vidhanSabha });
});

// Create VidhanSabha
exports.create = asyncHandler(async (req, res) => {
  try {
    const { name, year } = req.body;

    const createdBy = req.user ? req.user.name || req.user.email : "System";
    const addedBy = createdBy;

    const vidhanSabha = await VidhanSabha.create({
      ...req.body,
      createdBy,
      addedBy,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      "VidhanSabha",
      `Created vidhan sabha: ${vidhanSabha.name}`,
      { recordId: vidhanSabha._id, newData: vidhanSabha },
    );

    res.status(201).json({ success: true, data: vidhanSabha });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Vidhan Sabha already exists");
    }
    throw error;
  }
});

// Update VidhanSabha
exports.update = asyncHandler(async (req, res) => {
  try {
    const oldData = await VidhanSabha.findOne({
      _id: req.params.id,
      ...req.scopeFilter,
    });

    const vidhanSabha = await VidhanSabha.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!vidhanSabha) {
      res.status(404);
      throw new Error("Vidhan Sabha not found");
    }

    await logActivity(
      req,
      "UPDATE",
      "VidhanSabha",
      `Updated vidhan sabha: ${vidhanSabha.name}`,
      { recordId: vidhanSabha._id, newData: vidhanSabha, oldData },
    );

    res.status(200).json({ success: true, data: vidhanSabha });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Vidhan Sabha already exists");
    }
    throw error;
  }
});

// Delete VidhanSabha
exports.delete = asyncHandler(async (req, res) => {
  const vidhanSabha = await VidhanSabha.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!vidhanSabha) {
    res.status(404);
    throw new Error("Vidhan Sabha not found");
  }

  await vidhanSabha.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "VidhanSabha",
    `Deleted vidhan sabha: ${vidhanSabha.name}`,
    { recordId: vidhanSabha._id, oldData: vidhanSabha },
  );

  res
    .status(200)
    .json({ success: true, message: "Vidhan Sabha deleted successfully" });
});
