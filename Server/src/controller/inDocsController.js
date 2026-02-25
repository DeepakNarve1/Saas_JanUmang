const asyncHandler = require("express-async-handler");
const InDocs = require("../models/inDocsModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all InDocs
exports.getInDocs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = { ...req.scopeFilter };

  if (search) {
    query.$or = [
      { issueNo: { $regex: search, $options: "i" } },
      { nameAddress: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { place: { $regex: search, $options: "i" } },
    ];
  }

  let paginationLimit = parseInt(limit);
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const count = await InDocs.countDocuments({ ...req.scopeFilter });
  const filteredCount = await InDocs.countDocuments(query);

  let queryBuilder = InDocs.find(query)
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

// Get single InDocs
exports.getInDocsById = asyncHandler(async (req, res) => {
  const inDocs = await InDocs.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  }).populate("addedBy", "name");
  if (!inDocs) {
    res.status(404);
    throw new Error("InDocs entry not found");
  }
  res.status(200).json({ success: true, data: inDocs });
});

// Create InDocs
exports.createInDocs = asyncHandler(async (req, res) => {
  try {
    const newInDocs = await InDocs.create({
      ...req.body,
      addedBy: req.user._id,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      "InDocs",
      `Created InDocs entry: ${newInDocs.issueNo}`,
      { recordId: newInDocs._id, newData: newInDocs },
    );

    res.status(201).json({ success: true, data: newInDocs });
  } catch (error) {
    res.status(400); // Bad request for errors during creation like existing ID
    throw new Error(error.message);
  }
});

// Update InDocs
exports.updateInDocs = asyncHandler(async (req, res) => {
  const oldData = await InDocs.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!oldData) {
    res.status(404);
    throw new Error("InDocs entry not found");
  }

  const inDocs = await InDocs.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await logActivity(
    req,
    "UPDATE",
    "InDocs",
    `Updated InDocs entry: ${inDocs.issueNo}`,
    { recordId: inDocs._id, newData: inDocs, oldData },
  );

  res.status(200).json({ success: true, data: inDocs });
});

// Delete InDocs
exports.deleteInDocs = asyncHandler(async (req, res) => {
  const inDocs = await InDocs.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!inDocs) {
    res.status(404);
    throw new Error("InDocs entry not found");
  }

  await logActivity(
    req,
    "DELETE",
    "InDocs",
    `Deleted InDocs entry: ${inDocs.issueNo}`,
    { recordId: inDocs._id, oldData: inDocs },
  );

  res
    .status(200)
    .json({ success: true, message: "InDocs entry deleted successfully" });
});
