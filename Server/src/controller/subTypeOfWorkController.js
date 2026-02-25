const asyncHandler = require("express-async-handler");
const SubTypeOfWork = require("../models/subTypeOfWorkModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all SubTypeOfWorks
exports.getSubTypeOfWorks = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = { ...req.scopeFilter };

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

  const total = await SubTypeOfWork.countDocuments({ ...req.scopeFilter });
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
    total,
    count,
    data,
  });
});

// Get single SubTypeOfWork
exports.getSubTypeOfWorkById = asyncHandler(async (req, res) => {
  const subTypeOfWork = await SubTypeOfWork.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  }).populate("workType", "name");
  if (!subTypeOfWork) {
    res.status(404);
    throw new Error("Sub Type Of Work not found");
  }
  res.status(200).json({ success: true, data: subTypeOfWork });
});

// Create SubTypeOfWork
exports.createSubTypeOfWork = asyncHandler(async (req, res) => {
  try {
    const { subTypeOfWork, typeOfWork } = req.body;

    // Explicit tenant check
    const existing = await SubTypeOfWork.findOne({
      subTypeOfWork: { $regex: `^${subTypeOfWork}$`, $options: "i" },
      typeOfWork: typeOfWork,
      tenantId: getCreateTenantId(req),
    });

    if (existing) {
      res.status(400);
      throw new Error(
        "Sub Type of Work already exists for this category in your organization",
      );
    }

    const newSubTypeOfWork = await SubTypeOfWork.create({
      ...req.body,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      "SubTypeOfWork",
      `Created sub-type work: ${newSubTypeOfWork.subTypeOfWork}`,
      { recordId: newSubTypeOfWork._id, newData: newSubTypeOfWork },
    );

    res.status(201).json({ success: true, data: newSubTypeOfWork });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Sub Type of Work already exists");
    }
    throw error;
  }
});

// Update SubTypeOfWork
exports.updateSubTypeOfWork = asyncHandler(async (req, res) => {
  try {
    const oldData = await SubTypeOfWork.findOne({
      _id: req.params.id,
      ...req.scopeFilter,
    });

    const subTypeOfWork = await SubTypeOfWork.findOneAndUpdate(
      { _id: req.params.id, ...req.scopeFilter },
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
  } catch (error) {
    // Handle potential errors, e.g., validation errors
    res.status(400);
    throw new Error(error.message);
  }
});

// Delete SubTypeOfWork
exports.deleteSubTypeOfWork = asyncHandler(async (req, res) => {
  const subTypeOfWork = await SubTypeOfWork.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!subTypeOfWork) {
    res.status(404);
    throw new Error("SubType of Work not found");
  }

  await subTypeOfWork.deleteOne();

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
