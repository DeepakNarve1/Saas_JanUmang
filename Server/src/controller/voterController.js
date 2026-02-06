const asyncHandler = require("express-async-handler");
const Voter = require("../models/voterModel");
const { logActivity } = require("./activityLogController");

// @desc    Get all voters
// @route   GET /api/voters
exports.getVoters = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 10,
    state,
    division,
    district,
    block,
    blockname,
    panchayat,
    panchayatname,
    village,
    booth,
    voterId,
  } = req.query;

  const query = { isActive: true, ...req.scopeFilter };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { voterId: { $regex: search, $options: "i" } },
      { mobileNumber: { $regex: search, $options: "i" } },
    ];
  }

  // Handle block filter (by name or ID)
  if (blockname) {
    const Block = require("../models/blockModel");
    const blockDoc = await Block.findOne({
      name: { $regex: `^${blockname}$`, $options: "i" },
    });
    if (blockDoc) {
      query.block = blockDoc._id;
    } else {
      // If block not found, return empty results
      return res.json({
        success: true,
        data: [],
        count: 0,
        filteredCount: 0,
      });
    }
  } else if (block) {
    query.block = block;
  }

  // Handle panchayat filter (by name or ID)
  if (panchayatname) {
    const Panchayat = require("../models/panchayatModel");
    const panchayatDoc = await Panchayat.findOne({
      name: { $regex: `^${panchayatname}$`, $options: "i" },
    });
    if (panchayatDoc) {
      query.panchayat = panchayatDoc._id;
    } else {
      // If panchayat not found, return empty results
      return res.json({
        success: true,
        data: [],
        count: 0,
        filteredCount: 0,
      });
    }
  } else if (panchayat) {
    // Check if panchayat is an ObjectId or a name
    const mongoose = require("mongoose");
    if (
      mongoose.Types.ObjectId.isValid(panchayat) &&
      /^[0-9a-fA-F]{24}$/.test(panchayat)
    ) {
      // It's a valid ObjectId
      query.panchayat = panchayat;
    } else {
      // It's a name, look it up
      const Panchayat = require("../models/panchayatModel");
      const panchayatDoc = await Panchayat.findOne({
        name: { $regex: `^${panchayat}$`, $options: "i" },
      });
      if (panchayatDoc) {
        query.panchayat = panchayatDoc._id;
      } else {
        // If panchayat not found, return empty results
        return res.json({
          success: true,
          data: [],
          count: 0,
          filteredCount: 0,
        });
      }
    }
  }

  // Explicit filters from query params
  if (state) query.state = state;
  if (division) query.division = division;
  if (district) query.district = district;
  if (village) query.village = village;
  if (booth) query.booth = booth;
  if (voterId) query.voterId = voterId;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const populateFields = [
    { path: "state", select: "name" },
    { path: "division", select: "name" },
    { path: "district", select: "name" },
    { path: "parliament", select: "name" },
    { path: "assembly", select: "name" },
    { path: "block", select: "name" },
    { path: "panchayat", select: "name" },
    { path: "village", select: "name" },
    { path: "booth", select: "name" },
    { path: "createdBy", select: "name" },
  ];

  let voters;
  let filteredCount;
  let totalCount = await Voter.countDocuments({
    isActive: true,
    ...req.scopeFilter,
  });

  if (limitNum === -1) {
    voters = await Voter.find(query)
      .populate(populateFields)
      .sort({ createdAt: -1 });
    filteredCount = voters.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    voters = await Voter.find(query)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Voter.countDocuments(query);
  }

  res.json({
    success: true,
    data: voters,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single voter
// @route   GET /api/voters/:id
exports.getVoterById = asyncHandler(async (req, res) => {
  const voter = await Voter.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  }).populate("createdBy", "name");

  if (!voter) {
    res.status(404);
    throw new Error("Voter not found");
  }

  res.json({ success: true, data: voter });
});

// @desc    Create a voter
// @route   POST /api/voters
exports.createVoter = asyncHandler(async (req, res) => {
  try {
    const voterData = {
      ...req.body,
      createdBy: req.user ? req.user._id : undefined,
      tenantId: req.tenantId, // SaaS: Link to organization
    };

    const voter = await Voter.create(voterData);

    await logActivity(
      req,
      "CREATE",
      "Voter",
      `Created voter: ${voter.name} - ${voter.voterId}`,
      { recordId: voter._id, newData: voter },
    );

    res.status(201).json({ success: true, data: voter });
  } catch (error) {
    // Manually handle duplicate key here since asyncHandler wraps generic errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      res.status(400);
      throw new Error(`Duplicate value for ${field}`);
    }
    throw error;
  }
});

// @desc    Update a voter
// @route   PUT /api/voters/:id
exports.updateVoter = asyncHandler(async (req, res) => {
  const voter = await Voter.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!voter) {
    res.status(404);
    throw new Error("Voter not found");
  }

  const oldData = voter.toObject();

  const updatedVoter = await Voter.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updatedBy: req.user ? req.user._id : undefined,
    },
    { new: true, runValidators: true },
  );

  await logActivity(
    req,
    "UPDATE",
    "Voter",
    `Updated voter: ${updatedVoter.name} - ${updatedVoter.voterId}`,
    { recordId: updatedVoter._id, newData: updatedVoter, oldData },
  );

  res.json({ success: true, data: updatedVoter });
});

// @desc    Delete a voter
// @route   DELETE /api/voters/:id
exports.deleteVoter = asyncHandler(async (req, res) => {
  const voter = await Voter.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!voter) {
    res.status(404);
    throw new Error("Voter not found");
  }

  // Hard delete for now, or use isActive = false for soft delete if preferred
  await voter.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Voter",
    `Deleted voter: ${voter.name} - ${voter.voterId}`,
    { recordId: voter._id, oldData: voter },
  );

  res.json({ success: true, message: "Voter removed" });
});
