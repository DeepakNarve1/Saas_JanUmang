const asyncHandler = require("express-async-handler");
const Visitor = require("../models/visitorModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// @desc    Get all visitors
// @route   GET /api/visitors
exports.getVisitors = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 10,
    district,
    districtName,
    districtId,
    vidhansabha,
    vidhansabhaName,
    vidhanSabha,
    vidhanSabhaName,
    assembly,
    assemblyName,
    block,
    blockName,
    blockId,
  } = req.query;

  const query = { ...req.scopeFilter };

  // Text search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
    ];
  }

  // District filter - check multiple possible parameter names
  const districtFilter = district || districtName;
  if (districtFilter) {
    query.district = { $regex: districtFilter, $options: "i" };
  }

  // Vidhansabha/Assembly filter - check multiple possible parameter names
  const vidhansabhaFilter =
    vidhansabha ||
    vidhansabhaName ||
    vidhanSabha ||
    vidhanSabhaName ||
    assembly ||
    assemblyName;
  if (vidhansabhaFilter) {
    query.vidhansabha = { $regex: vidhansabhaFilter, $options: "i" };
  }

  // Block filter - check multiple possible parameter names
  const blockFilter = block || blockName;
  if (blockFilter) {
    query.block = { $regex: blockFilter, $options: "i" };
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let visitors;
  let filteredCount;
  let totalCount = await Visitor.countDocuments({ ...req.scopeFilter });

  if (limitNum === -1) {
    visitors = await Visitor.find(query)
      .populate("tenantId", "name")
      .sort({ createdAt: -1 });
    filteredCount = visitors.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    visitors = await Visitor.find(query)
      .populate("tenantId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Visitor.countDocuments(query);
  }

  res.json({
    success: true,
    data: visitors,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single visitor
// @route   GET /api/visitors/:id
exports.getVisitorById = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id).populate(
    "tenantId",
    "name",
  );

  if (!visitor) {
    res.status(404);
    throw new Error("Visitor not found");
  }

  res.json({ success: true, data: visitor });
});

// @desc    Create a visitor
// @route   POST /api/visitors
exports.createVisitor = asyncHandler(async (req, res) => {
  const visitorData = {
    ...req.body,
    tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
  };
  const visitor = await Visitor.create(visitorData);

  await logActivity(
    req,
    "CREATE",
    "Visitor",
    `Created visitor: ${visitor.name}`,
    { recordId: visitor._id, newData: visitor },
  );

  res.status(201).json({ success: true, data: visitor });
});

// @desc    Update a visitor
// @route   PUT /api/visitors/:id
exports.updateVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) {
    res.status(404);
    throw new Error("Visitor not found");
  }

  const updatedVisitor = await Visitor.findByIdAndUpdate(
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
    "Visitor",
    `Updated visitor: ${updatedVisitor.name}`,
    { recordId: updatedVisitor._id, newData: updatedVisitor, oldData: visitor },
  );

  res.json({ success: true, data: updatedVisitor });
});

// @desc    Delete a visitor
// @route   DELETE /api/visitors/:id
exports.deleteVisitor = asyncHandler(async (req, res) => {
  const visitor = await Visitor.findById(req.params.id);
  if (!visitor) {
    res.status(404);
    throw new Error("Visitor not found");
  }

  await visitor.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Visitor",
    `Deleted visitor: ${visitor.name}`,
    { recordId: visitor._id, oldData: visitor },
  );

  res.json({ success: true, message: "Visitor removed" });
});
