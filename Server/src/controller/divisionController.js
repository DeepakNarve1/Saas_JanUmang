const asyncHandler = require("express-async-handler");
const Division = require("../models/divisionModel");
const District = require("../models/districtModel");
const Parliament = require("../models/parliamentModel");
const { logActivity } = require("./activityLogController");

// @desc    Get all divisions
// @route   GET /api/divisions
exports.getDivisions = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, state } = req.query;

  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  if (state) {
    query.state = state;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let divisions;
  let filteredCount;
  let totalCount = await Division.countDocuments({});

  if (limitNum === -1) {
    divisions = await Division.find(query)
      .populate("state", "name")
      .sort({ name: 1 });
    filteredCount = divisions.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    divisions = await Division.find(query)
      .populate("state", "name")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await Division.countDocuments(query);
  }

  res.json({
    success: true,
    data: divisions,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single division
// @route   GET /api/divisions/:id
exports.getDivisionById = asyncHandler(async (req, res) => {
  const division = await Division.findById(req.params.id).populate(
    "state",
    "name",
  );
  if (!division) {
    res.status(404);
    throw new Error("Division not found");
  }
  const districts = await District.find({ division: division._id });
  const parliaments = await Parliament.find({ division: division._id });

  res.json({
    success: true,
    data: { ...division.toObject(), districts, parliaments },
  });
});

// @desc    Create a division
// @route   POST /api/divisions
exports.createDivision = asyncHandler(async (req, res) => {
  const { name, state, districts, parliaments } = req.body;
  const division = await Division.create({ name, state });

  if (districts && Array.isArray(districts) && districts.length > 0) {
    const districtsToInsert = districts
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        division: division._id,
      }));
    if (districtsToInsert.length > 0) {
      await District.insertMany(districtsToInsert);
    }
  }

  if (parliaments && Array.isArray(parliaments) && parliaments.length > 0) {
    const parliamentsToInsert = parliaments
      .filter((p) => p && p.trim() !== "")
      .map((p) => ({
        name: p,
        division: division._id,
      }));
    if (parliamentsToInsert.length > 0) {
      await Parliament.insertMany(parliamentsToInsert);
    }
  }

  await logActivity(
    req,
    "CREATE",
    "Division",
    `Created division: ${division.name}`,
    { recordId: division._id, newData: division },
  );

  res.status(201).json({ success: true, data: division });
});

// @desc    Update a division
// @route   PUT /api/divisions/:id
exports.updateDivision = asyncHandler(async (req, res) => {
  const division = await Division.findById(req.params.id);
  if (!division) {
    res.status(404);
    throw new Error("Division not found");
  }
  const updatedDivision = await Division.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  const oldData = division.toObject();

  const { districts, parliaments } = req.body;
  if (districts && Array.isArray(districts) && districts.length > 0) {
    const districtsToInsert = districts
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        division: updatedDivision._id,
      }));
    if (districtsToInsert.length > 0) {
      await District.insertMany(districtsToInsert);
    }
  }

  if (parliaments && Array.isArray(parliaments) && parliaments.length > 0) {
    const parliamentsToInsert = parliaments
      .filter((p) => p && p.trim() !== "")
      .map((p) => ({
        name: p,
        division: updatedDivision._id,
      }));
    if (parliamentsToInsert.length > 0) {
      await Parliament.insertMany(parliamentsToInsert);
    }
  }

  await logActivity(
    req,
    "UPDATE",
    "Division",
    `Updated division: ${updatedDivision.name}`,
    { recordId: updatedDivision._id, newData: updatedDivision, oldData },
  );

  res.json({ success: true, data: updatedDivision });
});

// @desc    Delete a division
// @route   DELETE /api/divisions/:id
exports.deleteDivision = asyncHandler(async (req, res) => {
  const division = await Division.findById(req.params.id);
  if (!division) {
    res.status(404);
    throw new Error("Division not found");
  }
  await division.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Division",
    `Deleted division: ${division.name}`,
    { recordId: division._id, oldData: division },
  );

  res.json({ success: true, message: "Division removed" });
});
