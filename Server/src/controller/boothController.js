const Booth = require("../models/boothModel");
const Block = require("../models/blockModel");
const { logActivity } = require("./activityLogController");
const asyncHandler = require("express-async-handler");

// @desc    Get all booths
// @route   GET /api/booths
exports.getBooths = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, block, blockName } = req.query;

  const query = { ...req.scopeFilter };
  if (query.tenantId) {
    query.tenantId = { $in: [query.tenantId, null] };
  }

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
  const baseScope = { ...req.scopeFilter };
  if (baseScope.tenantId) {
    baseScope.tenantId = { $in: [baseScope.tenantId, null] };
  }
  let totalCount = await Booth.countDocuments(baseScope);

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
  const getQuery = {
    _id: req.params.id,
    ...req.scopeFilter,
  };
  if (getQuery.tenantId) {
    getQuery.tenantId = { $in: [getQuery.tenantId, null] };
  }
  const booth = await Booth.findOne(getQuery)
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
    const mongoose = require("mongoose");
    let blockData;

    if (
      mongoose.Types.ObjectId.isValid(block) &&
      /^[0-9a-fA-F]{24}$/.test(block)
    ) {
      blockData = await Block.findById(block);
    } else {
      // If not a valid ID, assume it's a name and search
      blockData = await Block.findOne({
        name: { $regex: `^${block}$`, $options: "i" },
      });
      if (blockData) {
        // Update block variable to the found ID for record creation
        block = blockData._id;
      }
    }

    if (blockData) {
      state = blockData.state;
      division = blockData.division;
      district = blockData.district;
      parliament = blockData.parliament;
      assembly = blockData.assembly;
      year = blockData.year || year;
    }
  }

  // Clean empty strings for ObjectId fields to prevent Mongoose CastErrors
  if (state === "") state = undefined;
  if (division === "") division = undefined;
  if (district === "") district = undefined;
  if (parliament === "") parliament = undefined;
  if (assembly === "") assembly = undefined;
  if (block === "") block = undefined;

  const { isGlobalAdmin } = require("../utils/authHelpers");

  // Resolve tenantId — must be set for non-global-admin users
  const tenantId =
    req.tenantId || req.user?.tenantId || req.user?._doc?.tenantId;

  if (!tenantId && !isGlobalAdmin(req.user)) {
    res.status(400);
    throw new Error(
      "Your account is not linked to an organisation. Please contact your administrator.",
    );
  }

  const booth = await Booth.create({
    name,
    code,
    tenantId: tenantId || null, // null = global-admin orphan record
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
  const booth = await Booth.findOne({ _id: req.params.id, ...req.scopeFilter });
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

  // Clean empty strings for ObjectId fields to prevent Mongoose CastErrors
  const objectIdFields = [
    "state",
    "division",
    "district",
    "parliament",
    "assembly",
    "block",
  ];
  objectIdFields.forEach((field) => {
    if (updateData[field] === "") {
      delete updateData[field];
    }
  });

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
  const booth = await Booth.findOne({ _id: req.params.id, ...req.scopeFilter });
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
