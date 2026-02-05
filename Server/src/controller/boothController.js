const Booth = require("../models/boothModel");
const Block = require("../models/blockModel");
const { logActivity } = require("./activityLogController");
const asyncHandler = require("express-async-handler");

// @desc    Get all booths
// @route   GET /api/booths
exports.getBooths = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, block, blockName } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
    ];
  }

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

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let booths;
  let filteredCount;
  let totalCount = await Booth.countDocuments({});

  if (limitNum === -1) {
    booths = await Booth.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .populate("assembly", "name")
      .populate("block", "name year")
      .sort({ name: 1 });
    filteredCount = booths.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    booths = await Booth.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .populate("assembly", "name")
      .populate("block", "name year")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Booth.countDocuments(query);
  }

  res.json({
    success: true,
    data: booths,
    count: totalCount,
    filteredCount: filteredCount,
  });
});
// @desc    Get single booth
// @route   GET /api/booths/:id
exports.getBoothById = asyncHandler(async (req, res) => {
  const booth = await Booth.findById(req.params.id)
    .populate("state", "name")
    .populate("division", "name")
    .populate("district", "name")
    .populate("parliament", "name")
    .populate("assembly", "name")
    .populate("block", "name");
  if (!booth) {
    res.status(404);
    throw new Error("Booth not found");
  }
  res.json({ success: true, data: booth });
});

// @desc    Create a booth
// @route   POST /api/booths
exports.createBooth = asyncHandler(async (req, res) => {
  let {
    name,
    code,
    state,
    division,
    district,
    parliament,
    assembly,
    block,
    year,
  } = req.body;

  if (block && (!state || !assembly)) {
    const blockData = await Block.findById(block);
    if (blockData) {
      state = blockData.state;
      division = blockData.division;
      district = blockData.district;
      parliament = blockData.parliament;
      assembly = blockData.assembly;
    }
  }

  const booth = await Booth.create({
    name,
    code,
    state,
    division,
    ...(district && { district }),
    parliament,
    assembly,
    block,
    year,
  });

  await logActivity(
    req,
    "CREATE",
    "Booth",
    `Created booth: ${booth.name}/${booth.code}`,
    { recordId: booth._id, newData: booth },
  );

  res.status(201).json({ success: true, data: booth });
});

// @desc    Update a booth
// @route   PUT /api/booths/:id
exports.updateBooth = asyncHandler(async (req, res) => {
  const booth = await Booth.findById(req.params.id);
  if (!booth) {
    res.status(404);
    throw new Error("Booth not found");
  }
  let updateData = { ...req.body };

  if (updateData.block) {
    const blockData = await Block.findById(updateData.block);
    if (blockData) {
      updateData.state = blockData.state;
      updateData.division = blockData.division;
      updateData.district = blockData.district;
      updateData.parliament = blockData.parliament;
      updateData.assembly = blockData.assembly;
    }
  }

  const updatedBooth = await Booth.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    },
  );

  const oldData = booth.toObject();

  await logActivity(
    req,
    "UPDATE",
    "Booth",
    `Updated booth: ${updatedBooth.name}/${updatedBooth.code}`,
    { recordId: updatedBooth._id, newData: updatedBooth, oldData },
  );

  res.json({ success: true, data: updatedBooth });
});

// @desc    Delete a booth
// @route   DELETE /api/booths/:id
exports.deleteBooth = asyncHandler(async (req, res) => {
  const booth = await Booth.findById(req.params.id);
  if (!booth) {
    res.status(404);
    throw new Error("Booth not found");
  }
  await booth.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Booth",
    `Deleted booth: ${booth.name}/${booth.code}`,
    { recordId: booth._id, oldData: booth },
  );

  res.json({ success: true, message: "Booth removed" });
});
