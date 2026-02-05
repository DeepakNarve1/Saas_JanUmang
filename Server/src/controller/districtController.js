const asyncHandler = require("express-async-handler");
const District = require("../models/districtModel");
const { logActivity } = require("./activityLogController");

// @desc    Get all districts
// @route   GET /api/districts
exports.getDistricts = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10, division } = req.query;

  const query = {};

  if (search) {
    query.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  if (division) {
    query.division = division;
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  let districts;
  let filteredCount;
  let totalCount = await District.countDocuments({});

  if (limitNum === -1) {
    districts = await District.find(query)
      .populate({
        path: "division",
        select: "name",
        populate: {
          path: "state",
          select: "name",
        },
      })
      .sort({ name: 1 });
    filteredCount = districts.length;
  } else {
    const skip = (pageNum - 1) * limitNum;
    districts = await District.find(query)
      .populate({
        path: "division",
        select: "name",
        populate: {
          path: "state",
          select: "name",
        },
      })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    filteredCount = await District.countDocuments(query);
  }

  res.json({
    success: true,
    data: districts,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single district
// @route   GET /api/districts/:id
exports.getDistrictById = asyncHandler(async (req, res) => {
  const district = await District.findById(req.params.id).populate({
    path: "division",
    select: "name",
    populate: {
      path: "state",
      select: "name",
    },
  });
  if (!district) {
    res.status(404);
    throw new Error("District not found");
  }
  const Parliament = require("../models/parliamentModel");
  const parliaments = await Parliament.find({ district: district._id });

  res.json({ success: true, data: { ...district.toObject(), parliaments } });
});

// @desc    Create a district
// @route   POST /api/districts
exports.createDistrict = asyncHandler(async (req, res) => {
  const { name, division, parliaments } = req.body;
  const district = await District.create({ name, division });

  if (parliaments && Array.isArray(parliaments) && parliaments.length > 0) {
    const Parliament = require("../models/parliamentModel");
    const parliamentsToInsert = parliaments
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        district: district._id,
      }));
    if (parliamentsToInsert.length > 0) {
      await Parliament.insertMany(parliamentsToInsert);
    }
  }

  await logActivity(
    req,
    "CREATE",
    "District",
    `Created district: ${district.name}`,
    { recordId: district._id, newData: district },
  );

  res.status(201).json({ success: true, data: district });
});

// @desc    Update a district
// @route   PUT /api/districts/:id
exports.updateDistrict = asyncHandler(async (req, res) => {
  const district = await District.findById(req.params.id);
  if (!district) {
    res.status(404);
    throw new Error("District not found");
  }
  const updatedDistrict = await District.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );

  const oldData = district.toObject();

  const { parliaments } = req.body;
  if (parliaments && Array.isArray(parliaments) && parliaments.length > 0) {
    const Parliament = require("../models/parliamentModel");
    const parliamentsToInsert = parliaments
      .filter((d) => d && d.trim() !== "")
      .map((d) => ({
        name: d,
        district: updatedDistrict._id,
      }));
    if (parliamentsToInsert.length > 0) {
      await Parliament.insertMany(parliamentsToInsert);
    }
  }

  await logActivity(
    req,
    "UPDATE",
    "District",
    `Updated district: ${updatedDistrict.name}`,
    { recordId: updatedDistrict._id, newData: updatedDistrict, oldData },
  );

  res.json({ success: true, data: updatedDistrict });
});

// @desc    Delete a district
// @route   DELETE /api/districts/:id
exports.deleteDistrict = asyncHandler(async (req, res) => {
  const district = await District.findById(req.params.id);
  if (!district) {
    res.status(404);
    throw new Error("District not found");
  }
  await district.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "District",
    `Deleted district: ${district.name}`,
    { recordId: district._id, oldData: district },
  );

  res.json({ success: true, message: "District removed" });
});
