const asyncHandler = require("express-async-handler");
const CallManagement = require("../models/callManagementModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all Call Records
exports.getCalls = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;
  const query = { ...req.scopeFilter };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { address: { $regex: search, $options: "i" } },
    ];
  }

  if (category && category !== "All Categories") {
    query.category = category;
  }

  let paginationLimit = parseInt(limit);
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const count = await CallManagement.countDocuments({ ...req.scopeFilter });
  const filteredCount = await CallManagement.countDocuments(query);

  let queryBuilder = CallManagement.find(query)
    .populate("addedBy", "name")
    .sort({ createdAt: -1 });

  if (paginationLimit > 0) {
    queryBuilder = queryBuilder
      .limit(paginationLimit)
      .skip((page - 1) * paginationLimit);
  }

  const data = await queryBuilder;

  res.status(200).json({
    success: true,
    total: count,
    count: filteredCount,
    data,
  });
});

// Get single Call Record
exports.getCall = asyncHandler(async (req, res) => {
  const call = await CallManagement.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  }).populate("addedBy", "name");

  if (!call) {
    res.status(404);
    throw new Error("Call record not found");
  }

  res.status(200).json({
    success: true,
    data: call,
  });
});

// Create Call Record
exports.createCall = asyncHandler(async (req, res) => {
  try {
    const call = await CallManagement.create({
      ...req.body,
      addedBy: req.user._id,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      "CallManagement",
      `Created call record: ${call.subject} (ID: ${call._id})`,
      { recordId: call._id, newData: call },
    );

    res.status(201).json({
      success: true,
      data: call,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      res.status(400);
      throw new Error(messages.join(", "));
    }
    throw error;
  }
});

// Update Call Record
exports.updateCall = asyncHandler(async (req, res) => {
  let call = await CallManagement.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!call) {
    res.status(404);
    throw new Error("Call record not found");
  }

  const oldData = call.toObject();

  call = await CallManagement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await logActivity(
    req,
    "UPDATE",
    "CallManagement",
    `Updated call record: ${call.subject} (ID: ${call._id})`,
    { recordId: call._id, newData: call, oldData },
  );

  res.status(200).json({
    success: true,
    data: call,
  });
});

// Delete Call Record
exports.deleteCall = asyncHandler(async (req, res) => {
  const call = await CallManagement.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!call) {
    res.status(404);
    throw new Error("Call record not found");
  }

  await call.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "CallManagement",
    `Deleted call record: ${call.subject} (ID: ${call._id})`,
    { recordId: call._id, oldData: call },
  );

  res.status(200).json({
    success: true,
    message: "Call record deleted successfully",
  });
});
