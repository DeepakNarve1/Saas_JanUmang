const asyncHandler = require("express-async-handler");
const Block = require("../models/blockModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// @desc    Get all blocks
// @route   GET /api/blocks
exports.getBlocks = asyncHandler(async (req, res) => {
  const {
    search,
    page = 1,
    limit = 10,
    assembly,
    assemblyName,
    district,
  } = req.query;

  // Include global blocks (tenantId: null) alongside tenant-specific blocks.
  // Geographic reference data seeded by system admins has tenantId: null and
  // should be visible to all tenants, just like States and Districts.
  const query = { ...req.scopeFilter };
  if (query.tenantId) {
    query.tenantId = { $in: [query.tenantId, null] };
  }

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  // Handle assembly filter (by name or ID)
  if (assemblyName) {
    const Assembly = require("../models/assemblyModel");
    const assemblyDoc = await Assembly.findOne({
      name: { $regex: `^${assemblyName}$`, $options: "i" },
    });
    if (assemblyDoc) {
      query.assembly = assemblyDoc._id;
    } else {
      // If assembly not found, return empty results
      return res.json({
        success: true,
        data: [],
        count: 0,
        filteredCount: 0,
      });
    }
  } else if (assembly) {
    // Check if assembly is an ObjectId or a name
    const mongoose = require("mongoose");
    if (
      mongoose.Types.ObjectId.isValid(assembly) &&
      /^[0-9a-fA-F]{24}$/.test(assembly)
    ) {
      // It's a valid ObjectId
      query.assembly = assembly;
    } else {
      // It's a name, look it up
      const Assembly = require("../models/assemblyModel");
      const assemblyDoc = await Assembly.findOne({
        name: { $regex: `^${assembly}$`, $options: "i" },
      });
      if (assemblyDoc) {
        query.assembly = assemblyDoc._id;
      } else {
        // If assembly not found, return empty results
        return res.json({
          success: true,
          data: [],
          count: 0,
          filteredCount: 0,
        });
      }
    }
  }

  if (district) {
    query.district = district;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let blocks;
  let filteredCount;
  const baseScope = { ...req.scopeFilter };
  if (baseScope.tenantId) {
    baseScope.tenantId = { $in: [baseScope.tenantId, null] };
  }
  let totalCount = await Block.countDocuments(baseScope);

  if (limitNum === -1) {
    blocks = await Block.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .populate("assembly", "name")
      .sort({ name: 1 });
    filteredCount = blocks.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    blocks = await Block.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .populate("assembly", "name")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Block.countDocuments(query);
  }

  res.json({
    success: true,
    data: blocks,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single block
// @route   GET /api/blocks/:id
exports.getBlockById = asyncHandler(async (req, res) => {
  const getQuery = {
    _id: req.params.id,
    ...req.scopeFilter,
  };
  if (getQuery.tenantId) {
    getQuery.tenantId = { $in: [getQuery.tenantId, null] };
  }
  const block = await Block.findOne(getQuery)
    .populate("state", "name")
    .populate("division", "name")
    .populate("district", "name")
    .populate("parliament", "name")
    .populate("assembly", "name");

  if (!block) {
    res.status(404);
    throw new Error("Block not found");
  }
  const Booth = require("../models/boothModel");
  const booths = await Booth.find({ block: block._id });

  res.json({ success: true, data: { ...block.toObject(), booths } });
});

// @desc    Create a block
// @route   POST /api/blocks
exports.createBlock = asyncHandler(async (req, res) => {
  const {
    name,
    state,
    division,
    district,
    parliament,
    assembly,
    booths,
    year,
  } = req.body;

  const payload = {
    name,
    year,
    ...(state && { state }),
    ...(division && { division }),
    ...(district && { district }),
    ...(parliament && { parliament }),
    ...(assembly && { assembly }),
  };

  const block = await Block.create({
    ...payload,
    tenantId: getCreateTenantId(req),
  });

  if (booths && Array.isArray(booths) && booths.length > 0) {
    const Booth = require("../models/boothModel");
    const boothsToInsert = booths
      .filter((d) => d && (d.name || d.code))
      .map((d) => ({
        name: typeof d === "string" ? d : d.name,
        code: typeof d === "object" ? d.code : undefined,
        state: block.state,
        division: block.division,
        district: block.district,
        parliament: block.parliament,
        assembly: block.assembly,
        block: block._id,
      }));
    if (boothsToInsert.length > 0) {
      await Booth.insertMany(boothsToInsert);
    }
  }

  await logActivity(req, "CREATE", "Block", `Created block: ${block.name}`, {
    recordId: block._id,
    newData: block,
  });

  res.status(201).json({ success: true, data: block });
});

// @desc    Update a block
// @route   PUT /api/blocks/:id
exports.updateBlock = asyncHandler(async (req, res) => {
  const tenantScopeId = req.scopeFilter?.tenantId;
  const block = await Block.findOne({
    _id: req.params.id,
    ...(tenantScopeId ? { tenantId: { $in: [tenantScopeId, null] } } : {}),
  });
  if (!block) {
    res.status(404);
    throw new Error("Block not found");
  }

  const updates = { ...req.body };
  // Remove empty strings for ObjectId fields to avoid CastError
  ["state", "division", "district", "parliament", "assembly"].forEach(
    (field) => {
      if (updates[field] === "") delete updates[field];
    },
  );

  const updatedBlock = await Block.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  const oldData = block.toObject();

  const { booths } = req.body;
  if (booths && Array.isArray(booths) && booths.length > 0) {
    const Booth = require("../models/boothModel");
    const boothsToInsert = booths
      .filter((d) => d && (d.name || d.code || typeof d === "string"))
      .map((d) => ({
        name: typeof d === "string" ? d : d.name,
        code: typeof d === "object" ? d.code : undefined,
        block: updatedBlock._id,
      }));
    if (boothsToInsert.length > 0) {
      await Booth.insertMany(boothsToInsert);
    }
  }

  await logActivity(
    req,
    "UPDATE",
    "Block",
    `Updated block: ${updatedBlock.name}`,
    { recordId: updatedBlock._id, newData: updatedBlock, oldData },
  );

  res.json({ success: true, data: updatedBlock });
});

// @desc    Delete a block
// @route   DELETE /api/blocks/:id
exports.deleteBlock = asyncHandler(async (req, res) => {
  const tenantScopeId = req.scopeFilter?.tenantId;
  const block = await Block.findOne({
    _id: req.params.id,
    ...(tenantScopeId ? { tenantId: { $in: [tenantScopeId, null] } } : {}),
  });
  if (!block) {
    res.status(404);
    throw new Error("Block not found");
  }
  await block.deleteOne();

  await logActivity(req, "DELETE", "Block", `Deleted block: ${block.name}`, {
    recordId: block._id,
    oldData: block,
  });

  res.json({ success: true, message: "Block removed" });
});
