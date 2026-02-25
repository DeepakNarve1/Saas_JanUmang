const asyncHandler = require("express-async-handler");
const InwardRegister = require("../models/inwardRegisterModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all Inward Registers
exports.getInwardRegisters = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = { ...req.scopeFilter };

  if (search) {
    query.$or = [
      { issueNo: { $regex: search, $options: "i" } },
      { letterName: { $regex: search, $options: "i" } },
      { fromWhomReceived: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { fileNo: { $regex: search, $options: "i" } },
      { section: { $regex: search, $options: "i" } },
    ];
  }

  const paginationLimit = parseInt(limit) === -1 ? 0 : parseInt(limit);
  const skip = (page - 1) * paginationLimit;

  // Run queries in parallel for better performance
  const [data, filteredCount, total] = await Promise.all([
    paginationLimit > 0
      ? InwardRegister.find(query)
          .populate("addedBy", "name")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(paginationLimit)
          .lean()
      : InwardRegister.find(query)
          .populate("addedBy", "name")
          .sort({ createdAt: -1 })
          .lean(),
    InwardRegister.countDocuments(query),
    InwardRegister.countDocuments({ ...req.scopeFilter }),
  ]);

  res.status(200).json({
    success: true,
    total,
    count: filteredCount,
    data,
  });
});

// Get single Inward Register
exports.getInwardRegister = asyncHandler(async (req, res) => {
  const inwardRegister = await InwardRegister.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  }).populate("addedBy", "name");

  if (!inwardRegister) {
    res.status(404);
    throw new Error("Inward Register not found");
  }

  res.status(200).json({
    success: true,
    data: inwardRegister,
  });
});

// Create Inward Register
exports.createInwardRegister = asyncHandler(async (req, res) => {
  try {
    const inwardRegister = await InwardRegister.create({
      ...req.body,
      addedBy: req.user._id,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      "InwardRegister",
      `Created inward record: ${inwardRegister.issueNo}`,
      { recordId: inwardRegister._id, newData: inwardRegister },
    );

    res.status(201).json({
      success: true,
      data: inwardRegister,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Duplicate field value entered");
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      res.status(400);
      throw new Error(messages.join(", "));
    }
    throw error;
  }
});

// Update Inward Register
exports.updateInwardRegister = asyncHandler(async (req, res) => {
  let inwardRegister = await InwardRegister.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!inwardRegister) {
    res.status(404);
    throw new Error("Inward Register not found");
  }

  const oldData = inwardRegister.toObject();

  inwardRegister = await InwardRegister.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  await logActivity(
    req,
    "UPDATE",
    "InwardRegister",
    `Updated inward record: ${inwardRegister.issueNo}`,
    { recordId: inwardRegister._id, newData: inwardRegister, oldData },
  );

  res.status(200).json({
    success: true,
    data: inwardRegister,
  });
});

// Delete Inward Register
exports.deleteInwardRegister = asyncHandler(async (req, res) => {
  const inwardRegister = await InwardRegister.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!inwardRegister) {
    res.status(404);
    throw new Error("Inward Register not found");
  }

  await inwardRegister.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "InwardRegister",
    `Deleted inward record: ${inwardRegister.issueNo}`,
    { recordId: inwardRegister._id, oldData: inwardRegister },
  );

  res.status(200).json({
    success: true,
    message: "Inward Register deleted successfully",
  });
});
