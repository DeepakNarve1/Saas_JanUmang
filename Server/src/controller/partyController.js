const asyncHandler = require("express-async-handler");
const PartyList = require("../models/partyModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all Parties
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

  const total = await PartyList.countDocuments({ ...req.scopeFilter });
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
    total,
    count,
    data,
  });
});

// Get single Party
exports.getById = asyncHandler(async (req, res) => {
  const party = await PartyList.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
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

    // Explicit tenant check
    const existingParty = await PartyList.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      tenantId: getCreateTenantId(req),
    });

    if (existingParty) {
      res.status(400);
      throw new Error("Party already exists in your organization");
    }

    // EMERGENCY: Attempt to drop global unique index if it exists
    try {
      await PartyList.collection.dropIndex("name_1").catch(() => {});
    } catch (e) {}

    const party = await PartyList.create({
      ...req.body,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

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
    const oldData = await PartyList.findOne({
      _id: req.params.id,
      ...req.scopeFilter,
    });

    const party = await PartyList.findOneAndUpdate(
      { _id: req.params.id, ...req.scopeFilter },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

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
  const party = await PartyList.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!party) {
    res.status(404);
    throw new Error("Party not found");
  }

  await party.deleteOne();

  await logActivity(req, "DELETE", "Party", `Deleted party: ${party.name}`, {
    recordId: party._id,
    oldData: party,
  });

  res
    .status(200)
    .json({ success: true, message: "Party deleted successfully" });
});
