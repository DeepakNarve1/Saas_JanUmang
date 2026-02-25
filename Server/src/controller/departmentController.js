const asyncHandler = require("express-async-handler");
const Department = require("../models/departmentModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all Departments
exports.getDepartments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = { ...req.scopeFilter };

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  let paginationLimit = parseInt(limit);
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const total = await Department.countDocuments({ ...req.scopeFilter });
  const count = await Department.countDocuments(query);

  let queryBuilder = Department.find(query).sort({ createdAt: -1 });

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

// Get single Department
exports.getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }
  res.status(200).json({ success: true, data: department });
});

// Create Department
exports.createDepartment = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;

    // Explicit tenant check
    const existingDept = await Department.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      tenantId: getCreateTenantId(req),
    });

    if (existingDept) {
      res.status(400);
      throw new Error("Department already exists in your organization");
    }

    // EMERGENCY: Attempt to drop global unique index if it exists
    try {
      await Department.collection.dropIndex("name_1").catch(() => {});
    } catch (e) {}

    const newDepartment = await Department.create({
      ...req.body,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      "Department",
      `Created department: ${newDepartment.name}`,
      { recordId: newDepartment._id, newData: newDepartment },
    );

    res.status(201).json({ success: true, data: newDepartment });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Department already exists");
    }
    throw error;
  }
});

// Update Department
exports.updateDepartment = asyncHandler(async (req, res) => {
  try {
    const oldData = await Department.findOne({
      _id: req.params.id,
      ...req.scopeFilter,
    });
    if (!oldData) {
      res.status(404);
      throw new Error("Department not found");
    }

    const department = await Department.findOneAndUpdate(
      { _id: req.params.id, ...req.scopeFilter },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    await logActivity(
      req,
      "UPDATE",
      "Department",
      `Updated department: ${department.name}`,
      { recordId: department._id, newData: department, oldData },
    );

    res.status(200).json({ success: true, data: department });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Department already exists");
    }
    throw error;
  }
});

// Delete Department
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!department) {
    res.status(404);
    throw new Error("Department not found");
  }

  await department.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "Department",
    `Deleted department: ${department.name}`,
    { recordId: department._id, oldData: department },
  );

  res
    .status(200)
    .json({ success: true, message: "Department deleted successfully" });
});
