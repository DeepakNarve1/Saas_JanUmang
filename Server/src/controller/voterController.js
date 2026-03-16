const asyncHandler = require("express-async-handler");
const Voter = require("../models/voterModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

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
    boothname,
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
  if (boothname) {
    const Booth = require("../models/boothModel");
    const boothDoc = await Booth.findOne({
      name: { $regex: `^${boothname}$`, $options: "i" },
    });
    if (boothDoc) {
      query.booth = boothDoc._id;
    } else {
      return res.json({ success: true, data: [], count: 0, filteredCount: 0 });
    }
  } else if (booth) {
    const mongoose = require("mongoose");
    if (
      mongoose.Types.ObjectId.isValid(booth) &&
      /^[0-9a-fA-F]{24}$/.test(booth)
    ) {
      query.booth = booth;
    } else {
      const Booth = require("../models/boothModel");
      const boothDoc = await Booth.findOne({
        name: { $regex: `^${booth}$`, $options: "i" },
      });
      if (boothDoc) {
        query.booth = boothDoc._id;
      } else {
        return res.json({
          success: true,
          data: [],
          count: 0,
          filteredCount: 0,
        });
      }
    }
  }
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
    { path: "booth", select: "name" },
    { path: "createdBy", select: "name" },
    { path: "tenantId", select: "name" },
  ];

  const skip = (pageNum - 1) * limitNum;

  // Run queries in parallel for better performance
  const [voters, filteredCount, totalCount] = await Promise.all([
    limitNum === -1
      ? Voter.find(query)
          .populate(populateFields)
          .sort({ createdAt: -1 })
          .lean()
      : Voter.find(query)
          .populate(populateFields)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
    Voter.countDocuments(query),
    Voter.countDocuments({
      isActive: true,
      ...req.scopeFilter,
    }),
  ]);

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
    const mongoose = require("mongoose");
    const voterData = {
      ...req.body,
      createdBy: req.user ? req.user._id : undefined,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    };

    // --- Start Hierarchy Resolution ---
    const resolveHierarchy = async (data) => {
      const State = require("../models/stateModel");
      const Division = require("../models/divisionModel");
      const District = require("../models/districtModel");
      const Parliament = require("../models/parliamentModel");
      const Assembly = require("../models/assemblyModel");
      const Block = require("../models/blockModel");
      const Panchayat = require("../models/panchayatModel");
      const Village = require("../models/villageModel");
      const Booth = require("../models/boothModel");

      const isId = (val) =>
        mongoose.Types.ObjectId.isValid(val) && /^[0-9a-fA-F]{24}$/.test(val);

      // Resolve Booth (Commonly used in imports)
      if (data.booth && !isId(data.booth)) {
        const b = await Booth.findOne({
          $or: [
            { name: { $regex: `^${data.booth}$`, $options: "i" } },
            { code: { $regex: `^${data.booth}$`, $options: "i" } },
          ],
        });
        if (b) {
          data.booth = b._id;
          // Inherit from booth if missing
          if (!data.block) data.block = b.block;
          if (!data.assembly) data.assembly = b.assembly;
          if (!data.state) data.state = b.state;
          if (!data.division) data.division = b.division;
          if (!data.district) data.district = b.district;
          if (!data.parliament) data.parliament = b.parliament;
        }
      }

      // Village is now a string box on frontend, no resolution needed

      // Resolve Panchayat
      if (data.panchayat && !isId(data.panchayat)) {
        const p = await Panchayat.findOne({
          name: { $regex: `^${data.panchayat}$`, $options: "i" },
        });
        if (p) {
          data.panchayat = p._id;
          if (!data.booth) data.booth = p.booth;
          if (!data.block) data.block = p.block;
          if (!data.assembly) data.assembly = p.assembly;
        }
      }

      // Resolve Block
      if (data.block && !isId(data.block)) {
        const bl = await Block.findOne({
          name: { $regex: `^${data.block}$`, $options: "i" },
        });
        if (bl) {
          data.block = bl._id;
          if (!data.state) data.state = bl.state;
          if (!data.division) data.division = bl.division;
          if (!data.district) data.district = bl.district;
          if (!data.parliament) data.parliament = bl.parliament;
          if (!data.assembly) data.assembly = bl.assembly;
        }
      }

      // Resolve Assembly
      if (data.assembly && !isId(data.assembly)) {
        const asm = await Assembly.findOne({
          name: { $regex: `^${data.assembly}$`, $options: "i" },
        });
        if (asm) data.assembly = asm._id;
      }

      // Resolve District
      if (data.district && !isId(data.district)) {
        const d = await District.findOne({
          name: { $regex: `^${data.district}$`, $options: "i" },
        });
        if (d) data.district = d._id;
      }

      // Resolve Division
      if (data.division && !isId(data.division)) {
        const dv = await Division.findOne({
          name: { $regex: `^${data.division}$`, $options: "i" },
        });
        if (dv) data.division = dv._id;
      }

      // Resolve State
      if (data.state && !isId(data.state)) {
        const s = await State.findOne({
          name: { $regex: `^${data.state}$`, $options: "i" },
        });
        if (s) data.state = s._id;
      }
    };

    await resolveHierarchy(voterData);
    // --- End Hierarchy Resolution ---

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

  // Sanitize body to prevent mass-assignment of security fields
  const updateData = { ...req.body };
  delete updateData.tenantId;
  delete updateData._id;

  const updatedVoter = await Voter.findByIdAndUpdate(
    req.params.id,
    {
      ...updateData,
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
