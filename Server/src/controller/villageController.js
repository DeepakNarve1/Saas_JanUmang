const asyncHandler = require("express-async-handler");
const Village = require("../models/villageModel");
const Panchayat = require("../models/panchayatModel");
const { logActivity } = require("./activityLogController");

// @desc    Get all villages
// @route   GET /api/villages
exports.getVillages = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 10,
    state,
    division,
    district,
    parliament,
    assembly,
    block,
    panchayat,
    panchayatName,
    booth,
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  if (state) query.state = state;
  if (division) query.division = division;
  if (district) query.district = district;
  if (parliament) query.parliament = parliament;
  if (assembly) query.assembly = assembly;

  // Handle block filter (by name or ID)
  if (req.query.blockName) {
    const Block = require("../models/blockModel");
    const blockDoc = await Block.findOne({
      name: { $regex: `^${req.query.blockName}$`, $options: "i" },
    });
    if (blockDoc) {
      query.block = blockDoc._id;
    } else {
      return res.json({
        success: true,
        data: [],
        count: 0,
        filteredCount: 0,
      });
    }
  } else if (block) {
    const mongoose = require("mongoose");
    if (
      mongoose.Types.ObjectId.isValid(block) &&
      /^[0-9a-fA-F]{24}$/.test(block)
    ) {
      query.block = block;
    } else {
      const Block = require("../models/blockModel");
      const blockDoc = await Block.findOne({
        name: { $regex: `^${block}$`, $options: "i" },
      });
      if (blockDoc) {
        query.block = blockDoc._id;
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

  // Handle panchayat filter (by name or ID)
  if (panchayatName) {
    const Panchayat = require("../models/panchayatModel");
    const panchayatDoc = await Panchayat.findOne({
      name: { $regex: `^${panchayatName}$`, $options: "i" },
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

  if (booth) query.booth = booth;

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let villages;
  let filteredCount;
  let totalCount = await Village.countDocuments({});

  if (limitNum === -1) {
    villages = await Village.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .populate("assembly", "name")
      .populate("block", "name")
      .populate("panchayat", "name")
      .populate("booth", "name")
      .populate("createdBy", "name")
      .sort({ name: 1 });
    filteredCount = villages.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    villages = await Village.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .populate("assembly", "name")
      .populate("block", "name")
      .populate("panchayat", "name")
      .populate("booth", "name")
      .populate("createdBy", "name")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Village.countDocuments(query);
  }

  res.json({
    success: true,
    data: villages,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single village
// @route   GET /api/villages/:id
exports.getVillageById = asyncHandler(async (req, res) => {
  const village = await Village.findById(req.params.id)
    .populate("state", "name")
    .populate("division", "name")
    .populate("district", "name")
    .populate("parliament", "name")
    .populate("assembly", "name")
    .populate("block", "name")
    .populate("panchayat", "name")
    .populate("booth", "name")
    .populate("createdBy", "name");

  if (!village) {
    res.status(404);
    throw new Error("Village not found");
  }

  res.json({ success: true, data: village });
});

// @desc    Create a village
// @route   POST /api/villages
exports.createVillage = asyncHandler(async (req, res) => {
  let {
    name,
    state,
    division,
    district,
    parliament,
    assembly,
    block,
    booth,
    panchayat,
    status,
  } = req.body;

  if (panchayat) {
    const panchayatData = await Panchayat.findById(panchayat);
    if (panchayatData) {
      if (!state) state = panchayatData.state;
      if (!division) division = panchayatData.division;
      if (!district) district = panchayatData.district;
      if (!parliament) parliament = panchayatData.parliament;
      if (!assembly) assembly = panchayatData.assembly;
      if (!block) block = panchayatData.block;
      if (!booth) booth = panchayatData.booth;
    }
  }

  const village = await Village.create({
    name,
    state,
    division,
    district,
    parliament,
    assembly,
    block,
    booth,
    panchayat,
    status,
    createdBy: req.user ? req.user._id : undefined,
  });

  await logActivity(
    req,
    "CREATE",
    "Village",
    `Created village: ${village.name}`,
    { recordId: village._id, newData: village },
  );

  res.status(201).json({ success: true, data: village });
});

// @desc    Update a village
// @route   PUT /api/villages/:id
exports.updateVillage = asyncHandler(async (req, res) => {
  const village = await Village.findById(req.params.id);
  if (!village) {
    res.status(404);
    throw new Error("Village not found");
  }

  let updateData = { ...req.body };
  if (updateData.panchayat) {
    const panchayatData = await Panchayat.findById(updateData.panchayat);
    if (panchayatData) {
      updateData.state = panchayatData.state;
      updateData.division = panchayatData.division;
      updateData.district = panchayatData.district;
      updateData.parliament = panchayatData.parliament;
      updateData.assembly = panchayatData.assembly;
      updateData.block = panchayatData.block;
      updateData.booth = panchayatData.booth;
    }
  }

  const updatedVillage = await Village.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true },
  );

  await logActivity(
    req,
    "UPDATE",
    "Village",
    `Updated village: ${updatedVillage.name}`,
    { recordId: updatedVillage._id, newData: updatedVillage, oldData: village },
  );

  res.json({ success: true, data: updatedVillage });
});

// @desc    Delete a village
// @route   DELETE /api/villages/:id
exports.deleteVillage = asyncHandler(async (req, res) => {
  const village = await Village.findById(req.params.id);
  if (!village) {
    res.status(404);
    throw new Error("Village not found");
  }
  await village.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Village",
    `Deleted village: ${village.name}`,
    { recordId: village._id, oldData: village },
  );

  res.json({ success: true, message: "Village removed" });
});
