const asyncHandler = require("express-async-handler");
const SubTypeOfWork = require("../models/subTypeOfWorkModel");
const { logActivity } = require("./activityLogController");

// Get all SubTypeOfWorks
exports.getSubTypeOfWorks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { typeOfWork: { $regex: search, $options: "i" } },
      { subTypeOfWork: { $regex: search, $options: "i" } },
    ];
  }

  // Support direct filtering by typeOfWork (name) or worktype (to match frontend)
  if (req.query.typeOfWork) {
    query.typeOfWork = req.query.typeOfWork;
  } else if (req.query.worktype) {
    // If worktype is passed, we check if it's an ID or a name.
    // Since our model stores it as a String (name), we might need to handle both if necessary,
    // but for now let's just support it as a name to match what's most likely needed.
    query.typeOfWork = req.query.worktype;
  }

  let paginationLimit = parseInt(limit);
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const count = await SubTypeOfWork.countDocuments(query);

  let queryBuilder = SubTypeOfWork.find(query).sort({ createdAt: -1 });

  if (paginationLimit > 0) {
    queryBuilder = queryBuilder
      .limit(paginationLimit)
      .skip((page - 1) * paginationLimit);
  }

  const data = await queryBuilder;

  res.status(200).json({
    success: true,
    count,
    data,
  });
});

// Get single SubTypeOfWork
exports.getSubTypeOfWorkById = asyncHandler(async (req, res) => {
  const subTypeOfWork = await SubTypeOfWork.findById(req.params.id);
  if (!subTypeOfWork) {
    res.status(404);
    throw new Error("Sub Type Of Work not found");
  }
  res.status(200).json({ success: true, data: subTypeOfWork });
});

// Create SubTypeOfWork
exports.createSubTypeOfWork = asyncHandler(async (req, res) => {
  const { typeOfWork, subTypeOfWork } = req.body;

  const newSubTypeOfWork = await SubTypeOfWork.create({
    typeOfWork,
    subTypeOfWork,
  });

  await logActivity(
    req,
    "CREATE",
    "SubTypeOfWork",
    `Created sub-type work: ${newSubTypeOfWork.subTypeOfWork}`,
    { recordId: newSubTypeOfWork._id, newData: newSubTypeOfWork },
  );

  res.status(201).json({ success: true, data: newSubTypeOfWork });
});

// Update SubTypeOfWork
exports.updateSubTypeOfWork = asyncHandler(async (req, res) => {
  const oldData = await SubTypeOfWork.findById(req.params.id);

  const subTypeOfWork = await SubTypeOfWork.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!subTypeOfWork) {
    res.status(404);
    throw new Error("Sub Type Of Work not found");
  }

  await logActivity(
    req,
    "UPDATE",
    "SubTypeOfWork",
    `Updated sub-type work: ${subTypeOfWork.subTypeOfWork}`,
    { recordId: subTypeOfWork._id, newData: subTypeOfWork, oldData },
  );

  res.status(200).json({ success: true, data: subTypeOfWork });
});

// Delete SubTypeOfWork
exports.deleteSubTypeOfWork = asyncHandler(async (req, res) => {
  const subTypeOfWork = await SubTypeOfWork.findByIdAndDelete(req.params.id);
  if (!subTypeOfWork) {
    res.status(404);
    throw new Error("Sub Type Of Work not found");
  }

  await logActivity(
    req,
    "DELETE",
    "SubTypeOfWork",
    `Deleted sub-type work: ${subTypeOfWork.subTypeOfWork}`,
    { recordId: subTypeOfWork._id, oldData: subTypeOfWork },
  );

  res.status(200).json({
    success: true,
    message: "Sub Type Of Work deleted successfully",
  });
});
