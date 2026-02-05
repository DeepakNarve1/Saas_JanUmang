const asyncHandler = require("express-async-handler");
const getSamitiModel = require("../models/samitiModel");
const { logActivity } = require("./activityLogController");

// Get all items (with pagination, search, etc.)
exports.getAll = asyncHandler(async (req, res) => {
  const samitiType = req.samitiType; // Passed from route middleware
  const SamitiModel = getSamitiModel(samitiType);

  const { page = 1, limit = 10, search } = req.query;

  // No need to filter by samitiType as we are in a specific collection
  const query = {};

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
  const count = await SamitiModel.countDocuments(query); // Total count matching filter

  res.status(200).json({
    success: true,
    count,
    filteredCount: count,
    data,
  });
});

// Get single item
exports.getById = asyncHandler(async (req, res) => {
  const samitiType = req.samitiType;
  const SamitiModel = getSamitiModel(samitiType);

  const item = await SamitiModel.findById(req.params.id);
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
    // req.body should contain the fields. We append samitiType and addedBy
    const newItem = await SamitiModel.create({
      ...req.body,
      samitiType, // Still saving it for reference, though implicit by collection
      addedBy: req.user ? req.user._id : undefined,
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
      throw new Error("Unique ID already exists for this Samiti");
    }
    throw error;
  }
});

// Update item
exports.update = asyncHandler(async (req, res) => {
  const samitiType = req.samitiType;
  const SamitiModel = getSamitiModel(samitiType);

  const oldData = await SamitiModel.findById(req.params.id);

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

  const deletedItem = await SamitiModel.findByIdAndDelete(req.params.id);
  if (!deletedItem) {
    res.status(404);
    throw new Error("Record not found");
  }

  await logActivity(
    req,
    "DELETE",
    `Samiti-${samitiType}`,
    `Deleted: ${deletedItem.uniqueId}`,
    { recordId: deletedItem._id, oldData: deletedItem },
  );

  res
    .status(200)
    .json({ success: true, message: "Record deleted successfully" });
});
