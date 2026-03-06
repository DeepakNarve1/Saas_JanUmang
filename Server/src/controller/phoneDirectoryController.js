const asyncHandler = require("express-async-handler");
const PhoneDirectory = require("../models/phoneDirectoryModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// Get all Phone Directory entries
exports.getPhoneDirectories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    department,
    party,
    district,
    block,
  } = req.query;
  const query = { ...req.scopeFilter };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { number: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { post: { $regex: search, $options: "i" } },
    ];
  }

  // Handle department filter (by name or ID)
  if (req.query.departmentName) {
    const Department = require("../models/departmentModel");
    const deptDoc = await Department.findOne({
      name: { $regex: `^${req.query.departmentName}$`, $options: "i" },
    });
    if (deptDoc) {
      query.department = deptDoc._id;
    } else {
      return res.json({ success: true, data: [], count: 0, filteredCount: 0 });
    }
  } else if (department) {
    const mongoose = require("mongoose");
    if (
      mongoose.Types.ObjectId.isValid(department) &&
      /^[0-9a-fA-F]{24}$/.test(department)
    ) {
      query.department = department;
    } else {
      const Department = require("../models/departmentModel");
      const deptDoc = await Department.findOne({
        name: { $regex: `^${department}$`, $options: "i" },
      });
      if (deptDoc) {
        query.department = deptDoc._id;
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

  // Handle party filter (by name or ID)
  if (req.query.partyName) {
    const Party = require("../models/partyModel");
    const partyDoc = await Party.findOne({
      name: { $regex: `^${req.query.partyName}$`, $options: "i" },
    });
    if (partyDoc) {
      query.party = partyDoc._id;
    } else {
      return res.json({ success: true, data: [], count: 0, filteredCount: 0 });
    }
  } else if (party) {
    const mongoose = require("mongoose");
    if (
      mongoose.Types.ObjectId.isValid(party) &&
      /^[0-9a-fA-F]{24}$/.test(party)
    ) {
      query.party = party;
    } else {
      const Party = require("../models/partyModel");
      const partyDoc = await Party.findOne({
        name: { $regex: `^${party}$`, $options: "i" },
      });
      if (partyDoc) {
        query.party = partyDoc._id;
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

  // Handle block filter (by name or ID)
  if (req.query.blockName) {
    const Block = require("../models/blockModel");
    const blockDoc = await Block.findOne({
      name: { $regex: `^${req.query.blockName}$`, $options: "i" },
    });
    if (blockDoc) {
      query.block = blockDoc._id;
    } else {
      return res.json({ success: true, data: [], count: 0, filteredCount: 0 });
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

  // District filter removed as per user request (unnecessary/redundant)

  let paginationLimit = parseInt(limit);
  if (paginationLimit === -1) {
    paginationLimit = 0;
  }

  const count = await PhoneDirectory.countDocuments({ ...req.scopeFilter });
  const filteredCount = await PhoneDirectory.countDocuments(query);

  let queryBuilder = PhoneDirectory.find(query)
    .populate("department", "name")
    .populate("district", "name")
    .populate("block", "name")
    .populate("party", "name")
    .sort({ createdAt: -1 });

  if (paginationLimit > 0) {
    queryBuilder = queryBuilder
      .limit(paginationLimit)
      .skip((page - 1) * paginationLimit);
  }

  const data = await queryBuilder;

  res.status(200).json({
    success: true,
    total: count,
    count: filteredCount,
    filteredCount,
    data,
  });
});

// Get single Phone Directory entry
exports.getPhoneDirectoryById = asyncHandler(async (req, res) => {
  const phoneDirectory = await PhoneDirectory.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  })
    .populate("department", "name")
    .populate("district", "name")
    .populate("block", "name")
    .populate("party", "name");

  if (!phoneDirectory) {
    res.status(404);
    throw new Error("Phone Directory entry not found");
  }
  res.status(200).json({ success: true, data: phoneDirectory });
});

// Create Phone Directory entry
exports.createPhoneDirectory = asyncHandler(async (req, res) => {
  try {
    const newPhoneDirectory = await PhoneDirectory.create({
      ...req.body,
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    });

    await logActivity(
      req,
      "CREATE",
      "PhoneDirectory",
      `Created phone entry: ${newPhoneDirectory.name}`,
      { recordId: newPhoneDirectory._id, newData: newPhoneDirectory },
    );

    res.status(201).json({ success: true, data: newPhoneDirectory });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Update Phone Directory entry
exports.updatePhoneDirectory = asyncHandler(async (req, res) => {
  const oldData = await PhoneDirectory.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });

  if (!oldData) {
    res.status(404);
    throw new Error("Phone Directory entry not found");
  }

  const phoneDirectory = await PhoneDirectory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  await logActivity(
    req,
    "UPDATE",
    "PhoneDirectory",
    `Updated phone entry: ${phoneDirectory.name}`,
    { recordId: phoneDirectory._id, newData: phoneDirectory, oldData },
  );

  res.status(200).json({ success: true, data: phoneDirectory });
});

// Delete Phone Directory entry
exports.deletePhoneDirectory = asyncHandler(async (req, res) => {
  const phoneDirectory = await PhoneDirectory.findOneAndDelete({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!phoneDirectory) {
    res.status(404);
    throw new Error("Phone Directory entry not found");
  }

  await logActivity(
    req,
    "DELETE",
    "PhoneDirectory",
    `Deleted phone entry: ${phoneDirectory.name}`,
    { recordId: phoneDirectory._id, oldData: phoneDirectory },
  );

  res.status(200).json({
    success: true,
    message: "Phone Directory entry deleted successfully",
  });
});
