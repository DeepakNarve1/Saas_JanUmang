const asyncHandler = require("express-async-handler");
const Panchayat = require("../models/panchayatModel");
const Booth = require("../models/boothModel");
const { logActivity } = require("./activityLogController");

// @desc    Get all panchayats
// @route   GET /api/panchayat
exports.getPanchayats = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 10,
    division,
    district,
    parliament,
    assembly,
    block,
    blockName,
    booth,
  } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (division) query.division = division;
  if (district) query.district = district;
  if (parliament) query.parliament = parliament;
  if (assembly) query.assembly = assembly;

  // Handle block filter (by name or ID)
  if (blockName) {
    const Block = require("../models/blockModel");
    const blockDoc = await Block.findOne({
      name: { $regex: `^${blockName}$`, $options: "i" },
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
    // Check if block is an ObjectId or a name
    const mongoose = require("mongoose");
    if (
      mongoose.Types.ObjectId.isValid(block) &&
      /^[0-9a-fA-F]{24}$/.test(block)
    ) {
      // It's a valid ObjectId
      query.block = block;
    } else {
      // It's a name, look it up
      const Block = require("../models/blockModel");
      const blockDoc = await Block.findOne({
        name: { $regex: `^${block}$`, $options: "i" },
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
    }
  }

  if (booth) query.booth = booth;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let panchayats;
  let filteredCount;
  let totalCount = await Panchayat.countDocuments({});

  if (limitNum === -1) {
    panchayats = await Panchayat.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .populate("assembly", "name")
      .populate("block", "name")
      .populate("booth", "name")
      .sort({ name: 1 });
    filteredCount = panchayats.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    panchayats = await Panchayat.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .populate("assembly", "name")
      .populate("block", "name")
      .populate("booth", "name")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Panchayat.countDocuments(query);
  }

  res.json({
    success: true,
    data: panchayats,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single panchayat
// @route   GET /api/panchayat/:id
exports.getPanchayatById = asyncHandler(async (req, res) => {
  const panchayat = await Panchayat.findById(req.params.id)
    .populate("state", "name")
    .populate("division", "name")
    .populate("district", "name")
    .populate("parliament", "name")
    .populate("assembly", "name")
    .populate("block", "name")
    .populate("booth", "name code");

  if (!panchayat) {
    res.status(404);
    throw new Error("Panchayat not found");
  }
  res.json({ success: true, data: panchayat });
});

// @desc    Create a panchayat
// @route   POST /api/panchayat
exports.createPanchayat = asyncHandler(async (req, res) => {
  let {
    name,
    state,
    division,
    district,
    parliament,
    assembly,
    block,
    booth,
    year,
  } = req.body;

  if (booth) {
    const boothData = await Booth.findById(booth);
    if (boothData) {
      if (!state) state = boothData.state;
      if (!division) division = boothData.division;
      if (!district) district = boothData.district;
      if (!parliament) parliament = boothData.parliament;
      if (!assembly) assembly = boothData.assembly;
      if (!block) block = boothData.block;
    }
  }

  const panchayat = await Panchayat.create({
    name,
    state,
    division,
    ...(district && { district }),
    parliament,
    assembly,
    block,
    booth,
    year,
  });

  await logActivity(
    req,
    "CREATE",
    "Panchayat",
    `Created panchayat: ${panchayat.name}`,
    { recordId: panchayat._id, newData: panchayat },
  );

  res.status(201).json({ success: true, data: panchayat });
});

// @desc    Update a panchayat
// @route   PUT /api/panchayat/:id
exports.updatePanchayat = asyncHandler(async (req, res) => {
  const panchayat = await Panchayat.findById(req.params.id);
  if (!panchayat) {
    res.status(404);
    throw new Error("Panchayat not found");
  }
  let updateData = { ...req.body };
  if (updateData.booth) {
    const boothData = await Booth.findById(updateData.booth);
    if (boothData) {
      updateData.state = boothData.state;
      updateData.division = boothData.division;
      updateData.district = boothData.district;
      updateData.parliament = boothData.parliament;
      updateData.assembly = boothData.assembly;
      updateData.block = boothData.block;
    }
  }

  const updatedPanchayat = await Panchayat.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true },
  );

  const oldData = panchayat.toObject();

  await logActivity(
    req,
    "UPDATE",
    "Panchayat",
    `Updated panchayat: ${updatedPanchayat.name}`,
    { recordId: updatedPanchayat._id, newData: updatedPanchayat, oldData },
  );

  res.json({ success: true, data: updatedPanchayat });
});

// @desc    Delete a panchayat
// @route   DELETE /api/panchayat/:id
exports.deletePanchayat = asyncHandler(async (req, res) => {
  const panchayat = await Panchayat.findById(req.params.id);
  if (!panchayat) {
    res.status(404);
    throw new Error("Panchayat not found");
  }
  await panchayat.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Panchayat",
    `Deleted panchayat: ${panchayat.name}`,
    { recordId: panchayat._id, oldData: panchayat },
  );

  res.json({ success: true, message: "Panchayat removed" });
});
