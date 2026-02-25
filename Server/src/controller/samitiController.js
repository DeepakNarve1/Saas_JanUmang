const asyncHandler = require("express-async-handler");
const getSamitiModel = require("../models/samitiModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all items (with pagination, search, etc.)
exports.getAll = asyncHandler(async (req, res) => {
  const samitiType = req.samitiType; // Passed from route middleware
  const SamitiModel = getSamitiModel(samitiType);

  const { page = 1, limit = 10, search } = req.query;

  // No need to filter by samitiType as we are in a specific collection
  const query = { ...req.scopeFilter };

  if (search) {
    query.$or = [
      { uniqueId: { $regex: search, $options: "i" } },
      { block: { $regex: search, $options: "i" } },
      { village: { $regex: search, $options: "i" } },
      { gramPanchayat: { $regex: search, $options: "i" } },
      { sector: { $regex: search, $options: "i" } },
      // Add Bhagoria search if needed, but generic search usually covers common fields
      { inChargeName: { $regex: search, $options: "i" } },
    ];
  }

  // Handle "All" entries (limit = -1)
  let paginationLimit = parseInt(limit);
  if (paginationLimit === -1) {
    paginationLimit = 0; // 0 means no limit in Mongoose
  }

  let queryBuilder = SamitiModel.find(query).sort({ createdAt: -1 });

  if (paginationLimit > 0) {
    queryBuilder = queryBuilder
      .limit(paginationLimit)
      .skip((page - 1) * paginationLimit);
  }

  const data = await queryBuilder;
  const total = await SamitiModel.countDocuments({ ...req.scopeFilter });
  const count = await SamitiModel.countDocuments(query); // Total count matching filter

  res.status(200).json({
    success: true,
    total,
    count,
    data,
  });
});

// Get single item
exports.getById = asyncHandler(async (req, res) => {
  const samitiType = req.samitiType;
  const SamitiModel = getSamitiModel(samitiType);

  const item = await SamitiModel.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!item) {
    res.status(404);
    throw new Error("Record not found");
  }
  res.status(200).json({ success: true, data: item });
});

// Create item
exports.create = asyncHandler(async (req, res) => {
  const samitiType = req.samitiType;
  const SamitiModel = getSamitiModel(samitiType);

  try {
    // EMERGENCY: Attempt to drop global unique index if it exists
    try {
      await SamitiModel.collection.dropIndex("uniqueId_1").catch(() => {});
    } catch (e) {}

    // req.body should contain the fields. We append samitiType and addedBy
    const newItem = await SamitiModel.create({
      ...req.body,
      samitiType,
      addedBy: req.user ? req.user._id : undefined,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      `Samiti-${samitiType}`,
      `Created: ${newItem.uniqueId}`,
      { recordId: newItem._id, newData: newItem },
    );

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error(
        "This Unique ID (or Serial No) already exists for this type of Samiti. If you are seeing this across different organizations, please restart the server to trigger the database cleanup.",
      );
    }
    throw error;
  }
});

// Update item
exports.update = asyncHandler(async (req, res) => {
  const samitiType = req.samitiType;
  const SamitiModel = getSamitiModel(samitiType);

  const oldData = await SamitiModel.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  const updatedItem = await SamitiModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  if (!updatedItem) {
    res.status(404);
    throw new Error("Record not found");
  }

  await logActivity(
    req,
    "UPDATE",
    `Samiti-${samitiType}`,
    `Updated: ${updatedItem.uniqueId}`,
    { recordId: updatedItem._id, newData: updatedItem, oldData },
  );

  res.status(200).json({ success: true, data: updatedItem });
});

// Delete item
exports.delete = asyncHandler(async (req, res) => {
  const samitiType = req.samitiType;
  const SamitiModel = getSamitiModel(samitiType);

  const item = await SamitiModel.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!item) {
    res.status(404);
    throw new Error("Record not found");
  }
  await item.deleteOne();

  await logActivity(
    req,
    "DELETE",
    `Samiti-${samitiType}`,
    `Deleted: ${item.uniqueId}`,
    { recordId: item._id, oldData: item },
  );

  res
    .status(200)
    .json({ success: true, message: "Record deleted successfully" });
});
