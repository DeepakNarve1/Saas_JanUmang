const asyncHandler = require("express-async-handler");
const Assembly = require("../models/assemblyModel");
const Block = require("../models/blockModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// @desc    Get all assemblies
// @route   GET /api/assemblies
exports.getAssemblies = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, parliament, district } = req.query;

  // Always start from the tenant-scoped filter
  const query = { ...req.scopeFilter };

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  if (parliament) {
    query.parliament = parliament;
  }

  if (district) {
    query.district = district;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let assemblies;
  let filteredCount;
  let totalCount = await Assembly.countDocuments({ ...req.scopeFilter });

  if (limitNum === -1) {
    assemblies = await Assembly.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .sort({ name: 1 });
    filteredCount = assemblies.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    assemblies = await Assembly.find(query)
      .populate("state", "name")
      .populate("division", "name")
      .populate("district", "name")
      .populate("parliament", "name")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Assembly.countDocuments(query);
  }

  res.json({
    success: true,
    data: assemblies,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single assembly
// @route   GET /api/assemblies/:id
exports.getAssemblyById = asyncHandler(async (req, res) => {
  const assembly = await Assembly.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  })
    .populate("state", "name")
    .populate("division", "name")
    .populate("district", "name")
    .populate("parliament", "name");
  if (!assembly) {
    res.status(404);
    throw new Error("Assembly not found");
  }
  const blocks = await Block.find({ assembly: assembly._id });

  res.json({ success: true, data: { ...assembly.toObject(), blocks } });
});

// @desc    Create an assembly
// @route   POST /api/assemblies
exports.createAssembly = asyncHandler(async (req, res) => {
  const { name, state, division, district, parliament, blocks } = req.body;
  const assembly = await Assembly.create({
    name,
    state,
    division,
    ...(district && { district }),
    parliament,
    tenantId: getCreateTenantId(req),
  });

  if (blocks && Array.isArray(blocks) && blocks.length > 0) {
    const blocksToInsert = blocks
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        state: assembly.state,
        division: assembly.division,
        district: assembly.district,
        parliament: assembly.parliament,
        assembly: assembly._id,
      }));
    if (blocksToInsert.length > 0) {
      await Block.insertMany(blocksToInsert);
    }
  }

  await logActivity(
    req,
    "CREATE",
    "Assembly",
    `Created assembly: ${assembly.name}`,
    { recordId: assembly._id, newData: assembly },
  );

  res.status(201).json({ success: true, data: assembly });
});

// @desc    Update an assembly
// @route   PUT /api/assemblies/:id
exports.updateAssembly = asyncHandler(async (req, res) => {
  const assembly = await Assembly.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!assembly) {
    res.status(404);
    throw new Error("Assembly not found");
  }
  const updateData = { ...req.body };
  if (updateData.district === "") {
    updateData.district = null;
  }

  const updatedAssembly = await Assembly.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true },
  );

  const oldData = assembly.toObject();

  const { blocks } = req.body;
  if (blocks && Array.isArray(blocks) && blocks.length > 0) {
    const blocksToInsert = blocks
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        state: updatedAssembly.state,
        division: updatedAssembly.division,
        district: updatedAssembly.district,
        parliament: updatedAssembly.parliament,
        assembly: updatedAssembly._id,
      }));
    if (blocksToInsert.length > 0) {
      await Block.insertMany(blocksToInsert);
    }
  }

  await logActivity(
    req,
    "UPDATE",
    "Assembly",
    `Updated assembly: ${updatedAssembly.name}`,
    { recordId: updatedAssembly._id, newData: updatedAssembly, oldData },
  );

  res.json({ success: true, data: updatedAssembly });
});

// @desc    Delete an assembly
// @route   DELETE /api/assemblies/:id
exports.deleteAssembly = asyncHandler(async (req, res) => {
  const assembly = await Assembly.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!assembly) {
    res.status(404);
    throw new Error("Assembly not found");
  }
  await assembly.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Assembly",
    `Deleted assembly: ${assembly.name}`,
    { recordId: assembly._id, oldData: assembly },
  );

  res.json({ success: true, message: "Assembly removed" });
});
