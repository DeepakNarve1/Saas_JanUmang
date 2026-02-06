const asyncHandler = require("express-async-handler");
const DispatchRegister = require("../models/dispatchRegisterModel");
const { logActivity } = require("./activityLogController");

// Get all Dispatch Registers
exports.getDispatchRegisters = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, district, month } = req.query;
  const query = { ...req.scopeFilter };

  if (search) {
    query.$or = [
      { dispatchNo: { $regex: search, $options: "i" } },
      { portalNo: { $regex: search, $options: "i" } },
      { samitiNo: { $regex: search, $options: "i" } },
      { particulars: { $regex: search, $options: "i" } },
      { reference: { $regex: search, $options: "i" } },
    ];
  }

  if (district && district !== "All Districts") {
    query.district = district;
  }

  if (month && month !== "All Months") {
    query.month = month;
  }

  let paginationLimit = parseInt(limit);
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const count = await DispatchRegister.countDocuments({ ...req.scopeFilter });
  const filteredCount = await DispatchRegister.countDocuments(query);

  let queryBuilder = DispatchRegister.find(query)
    .populate("addedBy", "name")
    .populate("department", "name")
    .populate("district", "name")
    .populate("block", "name")
    .populate("panchayat", "name")
    .populate("village", "name")
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

// Get single Dispatch Register
exports.getDispatchRegister = asyncHandler(async (req, res) => {
  const dispatchRegister = await DispatchRegister.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  })
    .populate("addedBy", "name")
    .populate("department", "name")
    .populate("district", "name")
    .populate("block", "name")
    .populate("panchayat", "name")
    .populate("village", "name");

  if (!dispatchRegister) {
    res.status(404);
    throw new Error("Dispatch Register not found");
  }

  res.status(200).json({
    success: true,
    data: dispatchRegister,
  });
});

// Create Dispatch Register
exports.createDispatchRegister = asyncHandler(async (req, res) => {
  try {
    const dispatchRegister = await DispatchRegister.create({
      ...req.body,
      addedBy: req.user._id,
      tenantId: req.tenantId, // SaaS: Link to organization
    });

    await logActivity(
      req,
      "CREATE",
      "DispatchRegister",
      `Created dispatch record: ${dispatchRegister.dispatchNo}`,
      { recordId: dispatchRegister._id, newData: dispatchRegister },
    );

    res.status(201).json({
      success: true,
      data: dispatchRegister,
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

// Update Dispatch Register
exports.updateDispatchRegister = asyncHandler(async (req, res) => {
  let dispatchRegister = await DispatchRegister.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!dispatchRegister) {
    res.status(404);
    throw new Error("Dispatch Register not found");
  }

  const oldData = dispatchRegister.toObject();

  dispatchRegister = await DispatchRegister.findByIdAndUpdate(
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
    "DispatchRegister",
    `Updated dispatch record: ${dispatchRegister.dispatchNo}`,
    { recordId: dispatchRegister._id, newData: dispatchRegister, oldData },
  );

  res.status(200).json({
    success: true,
    data: dispatchRegister,
  });
});

// Delete Dispatch Register
exports.deleteDispatchRegister = asyncHandler(async (req, res) => {
  const dispatchRegister = await DispatchRegister.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!dispatchRegister) {
    res.status(404);
    throw new Error("Dispatch Register not found");
  }

  await dispatchRegister.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "DispatchRegister",
    `Deleted dispatch record: ${dispatchRegister.dispatchNo}`,
    { recordId: dispatchRegister._id, oldData: dispatchRegister },
  );

  res.status(200).json({
    success: true,
    message: "Dispatch Register deleted successfully",
  });
});
