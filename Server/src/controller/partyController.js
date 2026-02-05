const asyncHandler = require("express-async-handler");
const PartyList = require("../models/partyModel");
const { logActivity } = require("./activityLogController");

// Get all Parties
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

  const count = await PartyList.countDocuments(query);

  let queryBuilder = PartyList.find(query).sort({ createdAt: -1 });

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

// Get single Party
exports.getById = asyncHandler(async (req, res) => {
  const party = await PartyList.findById(req.params.id);
  if (!party) {
    res.status(404);
    throw new Error("Party not found");
  }
  res.status(200).json({ success: true, data: party });
});

// Create Party
exports.create = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    const party = await PartyList.create({ name });

    await logActivity(req, "CREATE", "Party", `Created party: ${party.name}`, {
      recordId: party._id,
      newData: party,
    });

    res.status(201).json({ success: true, data: party });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Party already exists");
    }
    throw error;
  }
});

// Update Party
exports.update = asyncHandler(async (req, res) => {
  try {
    const oldData = await PartyList.findById(req.params.id);

    const party = await PartyList.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!party) {
      res.status(404);
      throw new Error("Party not found");
    }

    await logActivity(req, "UPDATE", "Party", `Updated party: ${party.name}`, {
      recordId: party._id,
      newData: party,
      oldData,
    });

    res.status(200).json({ success: true, data: party });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Party already exists");
    }
    throw error;
  }
});

// Delete Party
exports.delete = asyncHandler(async (req, res) => {
  const party = await PartyList.findByIdAndDelete(req.params.id);
  if (!party) {
    res.status(404);
    throw new Error("Party not found");
  }

  await logActivity(req, "DELETE", "Party", `Deleted party: ${party.name}`, {
    recordId: party._id,
    oldData: party,
  });

  res
    .status(200)
    .json({ success: true, message: "Party deleted successfully" });
});
