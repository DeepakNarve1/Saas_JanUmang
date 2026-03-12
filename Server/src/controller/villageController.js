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

  const query = { ...req.scopeFilter };
  if (query.tenantId) {
    query.tenantId = { $in: [query.tenantId, null] };
  }

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
  const baseScope = { ...req.scopeFilter };
  if (baseScope.tenantId) {
    baseScope.tenantId = { $in: [baseScope.tenantId, null] };
  }
  let totalCount = await Village.countDocuments(baseScope);

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
  const getQuery = {
    _id: req.params.id,
    ...req.scopeFilter,
  };
  if (getQuery.tenantId) {
    getQuery.tenantId = { $in: [getQuery.tenantId, null] };
  }
  const village = await Village.findOne(getQuery)
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
  // --- Start Hierarchy Resolution ---
  const resolveHierarchy = async (data) => {
    const State = require("../models/stateModel");
    const Division = require("../models/divisionModel");
    const District = require("../models/districtModel");
    const Parliament = require("../models/parliamentModel");
    const Assembly = require("../models/assemblyModel");
    const Block = require("../models/blockModel");
    const Booth = require("../models/boothModel");
    const Panchayat = require("../models/panchayatModel");

    const isId = (val) =>
      mongoose.Types.ObjectId.isValid(val) && /^[0-9a-fA-F]{24}$/.test(val);

    // Resolve Panchayat
    if (data.panchayat && !isId(data.panchayat)) {
      const p = await Panchayat.findOne({
        name: { $regex: `^${data.panchayat}$`, $options: "i" },
      });
      if (p) {
        data.panchayat = p._id;
        // Inherit from panchayat
        if (!data.booth) data.booth = p.booth;
        if (!data.block) data.block = p.block;
        if (!data.assembly) data.assembly = p.assembly;
        if (!data.parliament) data.parliament = p.parliament;
        if (!data.district) data.district = p.district;
        if (!data.division) data.division = p.division;
        if (!data.state) data.state = p.state;
      }
    }

    // Resolve Booth
    if (data.booth && !isId(data.booth)) {
      const b = await Booth.findOne({
        $or: [
          { name: { $regex: `^${data.booth}$`, $options: "i" } },
          { code: { $regex: `^${data.booth}$`, $options: "i" } },
        ],
      });
      if (b) {
        data.booth = b._id;
        if (!data.block) data.block = b.block;
      }
    }

    // Resolve Block
    if (data.block && !isId(data.block)) {
      const bl = await Block.findOne({
        name: { $regex: `^${data.block}$`, $options: "i" },
      });
      if (bl) data.block = bl._id;
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

  const villageData = { ...req.body };
  const mongoose = require("mongoose");
  await resolveHierarchy(villageData);
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
    "panchayat",
  ];
  objectIdFields.forEach((field) => {
    if (villageData[field] === "") {
      delete villageData[field];
    }
  });

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

  const village = await Village.create({
    name: villageData.name,
    tenantId: tenantId || null, // null = global-admin orphan record
    state: villageData.state,
    division: villageData.division,
    district: villageData.district,
    parliament: villageData.parliament,
    assembly: villageData.assembly,
    block: villageData.block,
    booth: villageData.booth,
    panchayat: villageData.panchayat,
    status: villageData.status,
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
  const village = await Village.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
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

  // Clean empty strings for ObjectId fields to prevent Mongoose CastErrors
  const objectIdFields = [
    "state",
    "division",
    "district",
    "parliament",
    "assembly",
    "block",
    "booth",
    "panchayat",
  ];
  objectIdFields.forEach((field) => {
    if (updateData[field] === "") {
      delete updateData[field];
    }
  });

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
  const village = await Village.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
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
