const asyncHandler = require("express-async-handler");
const Worktype = require("../models/worktypeModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all Worktypes
exports.getWorktypes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = { ...req.scopeFilter };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  let paginationLimit = parseInt(limit);
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const total = await Worktype.countDocuments({ ...req.scopeFilter });
  const count = await Worktype.countDocuments(query);

  let queryBuilder = Worktype.find(query).sort({ createdAt: -1 });

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

// Get single Worktype
exports.getWorktypeById = asyncHandler(async (req, res) => {
  const worktype = await Worktype.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!worktype) {
    res.status(404);
    throw new Error("Worktype not found");
  }
  res.status(200).json({ success: true, data: worktype });
});

// Create Worktype
exports.createWorktype = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    // Explicit tenant check
    const existingWorktype = await Worktype.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      tenantId: getCreateTenantId(req),
    });

    if (existingWorktype) {
      res.status(400);
      throw new Error("Worktype already exists in your organization");
    }

    const newWorktype = await Worktype.create({
      ...req.body,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      "Worktype",
      `Created worktype: ${newWorktype.name}`,
      { recordId: newWorktype._id, newData: newWorktype },
    );

    res.status(201).json({ success: true, data: newWorktype });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Worktype already exists");
    }
    throw error;
  }
});

// Update Worktype
exports.updateWorktype = asyncHandler(async (req, res) => {
  try {
    const oldData = await Worktype.findOne({
      _id: req.params.id,
      ...req.scopeFilter,
    });

    const worktype = await Worktype.findOneAndUpdate(
      { _id: req.params.id, ...req.scopeFilter },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!worktype) {
      res.status(404);
      throw new Error("Worktype not found");
    }

    await logActivity(
      req,
      "UPDATE",
      "Worktype",
      `Updated worktype: ${worktype.name}`,
      { recordId: worktype._id, newData: worktype, oldData },
    );

    res.status(200).json({ success: true, data: worktype });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Worktype already exists");
    }
    throw error;
  }
});

// Delete Worktype
exports.deleteWorktype = asyncHandler(async (req, res) => {
  const worktype = await Worktype.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!worktype) {
    res.status(404);
    throw new Error("Worktype not found");
  }

  await worktype.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Worktype",
    `Deleted worktype: ${worktype.name}`,
    { recordId: worktype._id, oldData: worktype },
  );

  res
    .status(200)
    .json({ success: true, message: "Worktype deleted successfully" });
});
