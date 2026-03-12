const asyncHandler = require("express-async-handler");
const Panchayat = require("../models/panchayatModel");
const Booth = require("../models/boothModel");
const { logActivity } = require("./activityLogController");
const { isGlobalAdmin } = require("../utils/authHelpers");

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
    boothName,
  } = req.query;

  const query = { ...req.scopeFilter };
  if (query.tenantId) {
    query.tenantId = { $in: [query.tenantId, null] };
  }

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

  // Handle booth filter (by name or ID)
  if (boothName) {
    const Booth = require("../models/boothModel");
    const boothDoc = await Booth.findOne({
      name: { $regex: `^${boothName}$`, $options: "i" },
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
      if (boothDoc) query.booth = boothDoc._id;
      else
        return res.json({
          success: true,
          data: [],
          count: 0,
          filteredCount: 0,
        });
    }
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let panchayats;
  let filteredCount;

  // Total count uses the same scope as the data query
  const baseScope = { ...req.scopeFilter };
  if (baseScope.tenantId) {
    baseScope.tenantId = { $in: [baseScope.tenantId, null] };
  }
  let totalCount = await Panchayat.countDocuments(baseScope);

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
  const getQuery = {
    _id: req.params.id,
    ...req.scopeFilter,
  };
  if (getQuery.tenantId) {
    getQuery.tenantId = { $in: [getQuery.tenantId, null] };
  }
  const panchayat = await Panchayat.findOne(getQuery)
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

  if (!req.tenantId && !isGlobalAdmin(req.user)) {
    res.status(400);
    throw new Error("Tenant ID is missing. Cannot create record.");
  }

  // Robust tenantId resolution:
  // req.tenantId is set by authMiddleware from req.user.tenantId,
  // but after role population (req.user.role = roleDoc) on a Mongoose doc,
  // direct field access can occasionally shadow stored values.
  // We check all three sources to be safe.
  const tenantId =
    req.tenantId || req.user?.tenantId || req.user?._doc?.tenantId;

  if (!tenantId && !isGlobalAdmin(req.user)) {
    res.status(400);
    throw new Error(
      "Your account is not linked to an organisation. Please contact your administrator.",
    );
  }

  // --- Start Hierarchy Resolution ---
  const resolveHierarchy = async (data) => {
    const State = require("../models/stateModel");
    const Division = require("../models/divisionModel");
    const District = require("../models/districtModel");
    const Parliament = require("../models/parliamentModel");
    const Assembly = require("../models/assemblyModel");
    const Block = require("../models/blockModel");
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
        // Inherit from booth
        if (!data.block) data.block = b.block;
        if (!data.assembly) data.assembly = b.assembly;
        if (!data.parliament) data.parliament = b.parliament;
        if (!data.district) data.district = b.district;
        if (!data.division) data.division = b.division;
        if (!data.state) data.state = b.state;
      }
    }

    // Resolve Block
    if (data.block && !isId(data.block)) {
      const bl = await Block.findOne({
        name: { $regex: `^${data.block}$`, $options: "i" },
      });
      if (bl) data.block = bl._id;
      // Inherit from block if booth didn't provide it
      if (bl) {
        if (!data.assembly) data.assembly = bl.assembly;
        if (!data.parliament) data.parliament = bl.parliament;
        if (!data.district) data.district = bl.district;
        if (!data.division) data.division = bl.division;
        if (!data.state) data.state = bl.state;
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

  const panchayatData = { ...req.body };
  const mongoose = require("mongoose");
  await resolveHierarchy(panchayatData);
  // --- End Hierarchy Resolution ---

  // Clean empty strings for ObjectId fields to prevent Mongoose CastErrors
  const objectIdFields = [
    "state",
    "division",
    "district",
    "parliament",
    "assembly",
    "block",
    "booth",
  ];
  objectIdFields.forEach((field) => {
    if (panchayatData[field] === "") {
      delete panchayatData[field];
    }
  });

  const panchayat = await Panchayat.create({
    name: panchayatData.name,
    tenantId: tenantId || null, // null = global-admin orphan record
    state: panchayatData.state,
    division: panchayatData.division,
    district: panchayatData.district,
    parliament: panchayatData.parliament,
    assembly: panchayatData.assembly,
    block: panchayatData.block,
    booth: panchayatData.booth,
    year: panchayatData.year,
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
  const panchayat = await Panchayat.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!panchayat) {
    res.status(404);
    throw new Error("Panchayat not found");
  }

  let updateData = { ...req.body };

  // Prevent changing tenantId via update
  delete updateData.tenantId;

  // Clean empty strings for ObjectId fields to prevent Mongoose CastErrors
  const objectIdFields = [
    "state",
    "division",
    "district",
    "parliament",
    "assembly",
    "block",
    "booth",
  ];
  objectIdFields.forEach((field) => {
    if (updateData[field] === "") {
      delete updateData[field];
    }
  });

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
  const panchayat = await Panchayat.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
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
