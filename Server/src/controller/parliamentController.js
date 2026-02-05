const asyncHandler = require("express-async-handler");
const Parliament = require("../models/parliamentModel");
const Assembly = require("../models/assemblyModel");
const { logActivity } = require("./activityLogController");

// @desc    Get all parliaments
// @route   GET /api/parliaments
exports.getParliaments = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, division, district } = req.query;

  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  if (division) {
    query.division = division;
  }

  if (district) {
    query.district = district;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let parliaments;
  let filteredCount;
  let totalCount = await Parliament.countDocuments({});

  if (limitNum === -1) {
    parliaments = await Parliament.find(query)
      .populate("division", "name")
      .populate("district", "name")
      .sort({ name: 1 });
    filteredCount = parliaments.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    parliaments = await Parliament.find(query)
      .populate("division", "name")
      .populate("district", "name")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Parliament.countDocuments(query);
  }

  res.json({
    success: true,
    data: parliaments,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single parliament
// @route   GET /api/parliaments/:id
exports.getParliamentById = asyncHandler(async (req, res) => {
  const parliament = await Parliament.findById(req.params.id)
    .populate("division", "name")
    .populate("district", "name");
  if (!parliament) {
    res.status(404);
    throw new Error("Parliament not found");
  }
  const assemblies = await Assembly.find({ parliament: parliament._id });

  res.json({ success: true, data: { ...parliament.toObject(), assemblies } });
});

// @desc    Create a parliament
// @route   POST /api/parliaments
exports.createParliament = asyncHandler(async (req, res) => {
  const { name, division, district, assemblies } = req.body;

  const parliamentData = { name, division };
  if (district && district.trim() !== "") {
    parliamentData.district = district;
  }

  const parliament = await Parliament.create(parliamentData);

  if (assemblies && Array.isArray(assemblies) && assemblies.length > 0) {
    const assembliesToInsert = assemblies
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        parliament: parliament._id,
      }));
    if (assembliesToInsert.length > 0) {
      await Assembly.insertMany(assembliesToInsert);
    }
  }

  await logActivity(
    req,
    "CREATE",
    "Parliament",
    `Created parliament: ${parliament.name}`,
    { recordId: parliament._id, newData: parliament },
  );

  res.status(201).json({ success: true, data: parliament });
});

// @desc    Update a parliament
// @route   PUT /api/parliaments/:id
exports.updateParliament = asyncHandler(async (req, res) => {
  const parliament = await Parliament.findById(req.params.id);
  if (!parliament) {
    res.status(404);
    throw new Error("Parliament not found");
  }

  const updateData = { ...req.body };
  if (updateData.district === "") {
    updateData.district = null;
  }

  const updatedParliament = await Parliament.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true },
  );

  const oldData = parliament.toObject();

  const { assemblies } = req.body;
  if (assemblies && Array.isArray(assemblies) && assemblies.length > 0) {
    const assembliesToInsert = assemblies
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        parliament: updatedParliament._id,
      }));
    if (assembliesToInsert.length > 0) {
      await Assembly.insertMany(assembliesToInsert);
    }
  }

  await logActivity(
    req,
    "UPDATE",
    "Parliament",
    `Updated parliament: ${updatedParliament.name}`,
    { recordId: updatedParliament._id, newData: updatedParliament, oldData },
  );

  res.json({ success: true, data: updatedParliament });
});

// @desc    Delete a parliament
// @route   DELETE /api/parliaments/:id
exports.deleteParliament = asyncHandler(async (req, res) => {
  const parliament = await Parliament.findById(req.params.id);
  if (!parliament) {
    res.status(404);
    throw new Error("Parliament not found");
  }
  await parliament.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Parliament",
    `Deleted parliament: ${parliament.name}`,
    { recordId: parliament._id, oldData: parliament },
  );

  res.json({ success: true, message: "Parliament removed" });
});
