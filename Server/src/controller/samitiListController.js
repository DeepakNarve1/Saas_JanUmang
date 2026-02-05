const asyncHandler = require("express-async-handler");
const SamitiList = require("../models/samitiListModel");
const { logActivity } = require("./activityLogController");

// Get all Samitis
exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  let paginationLimit = parseInt(limit);
  // If limit is -1, return all
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const count = await SamitiList.countDocuments(query);

  let queryBuilder = SamitiList.find(query).sort({ createdAt: -1 });

  if (paginationLimit > 0) {
    queryBuilder = queryBuilder
      .limit(paginationLimit)
      .skip((page - 1) * paginationLimit);
  }

  const data = await queryBuilder;

  res.status(200).json({
    success: true,
    count,
    data,
  });
});

// Get single Samiti
exports.getById = asyncHandler(async (req, res) => {
  const samiti = await SamitiList.findById(req.params.id);
  if (!samiti) {
    res.status(404);
    throw new Error("Samiti not found");
  }
  res.status(200).json({ success: true, data: samiti });
});

// Create Samiti
exports.create = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    const samiti = await SamitiList.create({ name });

    await logActivity(
      req,
      "CREATE",
      "SamitiList",
      `Created samiti type: ${samiti.name}`,
      { recordId: samiti._id, newData: samiti },
    );

    res.status(201).json({ success: true, data: samiti });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Samiti already exists");
    }
    throw error;
  }
});

// Update Samiti
exports.update = asyncHandler(async (req, res) => {
  try {
    const oldData = await SamitiList.findById(req.params.id);

    const samiti = await SamitiList.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!samiti) {
      res.status(404);
      throw new Error("Samiti not found");
    }

    await logActivity(
      req,
      "UPDATE",
      "SamitiList",
      `Updated samiti type: ${samiti.name}`,
      { recordId: samiti._id, newData: samiti, oldData },
    );

    res.status(200).json({ success: true, data: samiti });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Samiti already exists");
    }
    throw error;
  }
});

// Delete Samiti
exports.delete = asyncHandler(async (req, res) => {
  const samiti = await SamitiList.findByIdAndDelete(req.params.id);
  if (!samiti) {
    res.status(404);
    throw new Error("Samiti not found");
  }

  await logActivity(
    req,
    "DELETE",
    "SamitiList",
    `Deleted samiti type: ${samiti.name}`,
    { recordId: samiti._id, oldData: samiti },
  );

  res
    .status(200)
    .json({ success: true, message: "Samiti deleted successfully" });
});
