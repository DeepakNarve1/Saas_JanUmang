const asyncHandler = require("express-async-handler");
const AssemblyIssue = require("../models/assemblyIssueModel");
const { logActivity } = require("./activityLogController");
const { getCreateTenantId } = require("../utils/authHelpers");

// @desc    Get all assembly issues
// @route   GET /api/assembly-issues
// @access  Private
exports.getAssemblyIssues = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    assembly,
    search,
    page = 1,
    limit,
    issueType,
    block,
    gramPanchayat,
  } = req.query;

  // Build filter query
  const query = { ...req.scopeFilter };

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assembly) query.assembly = assembly;
  if (issueType) query.issueType = issueType;
  if (block) query.block = { $regex: block, $options: "i" };
  if (gramPanchayat)
    query.panchayatName = { $regex: gramPanchayat, $options: "i" };

  if (search) {
    query.$or = [
      { uniqueId: { $regex: search, $options: "i" } },
      { block: { $regex: search, $options: "i" } },
      { village: { $regex: search, $options: "i" } },
      { boothName: { $regex: search, $options: "i" } },
      { panchayatName: { $regex: search, $options: "i" } },
    ];
  }

  const limitNum = parseInt(limit) === -1 ? -1 : parseInt(limit) || 10;
  const pageNum = parseInt(page) || 1;
  const skip = (pageNum - 1) * limitNum;

  // Run queries in parallel for better performance
  const [issues, filteredCount, totalCount] = await Promise.all([
    limitNum === -1
      ? AssemblyIssue.find(query).sort({ createdAt: -1 }).lean()
      : AssemblyIssue.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
    AssemblyIssue.countDocuments(query),
    AssemblyIssue.countDocuments({
      ...(issueType ? { issueType } : {}),
      ...req.scopeFilter,
    }),
  ]);

  res.json({
    success: true,
    data: issues,
    count: totalCount,
    filteredCount: filteredCount,
  });
});

// @desc    Get single assembly issue
// @route   GET /api/assembly-issues/:id
// @access  Private
exports.getAssemblyIssueById = asyncHandler(async (req, res) => {
  const issue = await AssemblyIssue.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!issue) {
    res.status(404);
    throw new Error("Issue not found");
  }
  res.json({ success: true, data: issue });
});

// @desc    Create assembly issue
// @route   POST /api/assembly-issues
// @access  Private
exports.createAssemblyIssue = asyncHandler(async (req, res) => {
  try {
    const issueData = {
      ...req.body,
      addedBy: req.user ? req.user.name || req.user.email : "Unknown",
      registrationDate: req.body.registrationDate || new Date().toISOString(),
      tenantId: getCreateTenantId(req), // SaaS: system admins create orphan records
    };
    const issue = await AssemblyIssue.create(issueData);

    await logActivity(
      req,
      "CREATE",
      "AssemblyIssue",
      `Created issue: ${issue.uniqueId}`,
      { recordId: issue._id, newData: issue },
    );

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Unique ID number already exists");
    }
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Update assembly issue
// @route   PUT /api/assembly-issues/:id
// @access  Private
exports.updateAssemblyIssue = asyncHandler(async (req, res) => {
  try {
    const issue = await AssemblyIssue.findOne({
      _id: req.params.id,
      ...req.scopeFilter,
    });
    if (!issue) {
      res.status(404);
      throw new Error("Issue not found");
    }
    const oldData = issue.toObject();

    const updatedIssue = await AssemblyIssue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    await logActivity(
      req,
      "UPDATE",
      "AssemblyIssue",
      `Updated issue: ${updatedIssue.uniqueId}`,
      { recordId: updatedIssue._id, newData: updatedIssue, oldData },
    );

    res.json({ success: true, data: updatedIssue });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error("Unique ID number already exists");
    }
    throw error;
  }
});

// @desc    Delete assembly issue
// @route   DELETE /api/assembly-issues/:id
// @access  Private
exports.deleteAssemblyIssue = asyncHandler(async (req, res) => {
  const issue = await AssemblyIssue.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  });
  if (!issue) {
    res.status(404);
    throw new Error("Issue not found");
  }
  await issue.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "AssemblyIssue",
    `Deleted issue: ${issue.uniqueId}`,
    { recordId: issue._id, oldData: issue },
  );

  res.json({ success: true, message: "Issue removed" });
});

// @desc    Cleanup duplicates
// @route   GET /api/assembly-issues/cleanup
// @access  Private (Admin only ideally, but using view permission for now)
exports.cleanupDuplicates = asyncHandler(async (req, res) => {
  const issues = await AssemblyIssue.find({}).sort({ createdAt: -1 });
  const seen = new Map();
  const toDelete = [];

  for (const issue of issues) {
    if (seen.has(issue.uniqueId)) {
      toDelete.push(issue._id);
    } else {
      seen.set(issue.uniqueId, true);
    }
  }

  if (toDelete.length > 0) {
    await AssemblyIssue.deleteMany({ _id: { $in: toDelete } });
  }

  res.json({
    success: true,
    message: `Cleaned up ${toDelete.length} duplicates.`,
  });
});

// @desc    Seed assembly issues
// @route   GET /api/assembly-issues/seed
// @access  Public (Temporary)
exports.seedAssemblyIssues = asyncHandler(async (req, res) => {
  // Clear only if no issueType provided, or clear all (user's choice, usually all for seeding)
  await AssemblyIssue.deleteMany({});

  const issueTypes = [
    "assembly-issue",
    "myassembly0",
    "myassembly2",
    "myassembly3",
  ];

  const sampleIssues = [];
  const blocks = ["Gandhwani", "Tirla", "Bagh", "Kukshi", "Manawar", "Dhar"];
  const sectors = [
    "GANDHWANI",
    "BILDA",
    "Anjanai",
    "PIPLI",
    "ZEERABAD",
    "BAGH",
  ];
  const microSectors = ["GGR", "GBI", "TA", "GP", "MZ", "BG"];
  const villages = [
    "Kundi",
    "Chikli",
    "Kodi",
    "Soyla",
    "Bori",
    "Pipli",
    "Rehda",
    "Jeerabad",
  ];
  const faliyas = [
    "DavarPura",
    "Khadapura",
    "HanumanPura",
    "Baydipura",
    "Moryapura",
    "PatelPura",
  ];
  const gramPanchayats = [
    "Rehda",
    "Chikli",
    "Pithanpur",
    "Soyla",
    "Bori",
    "Pipli",
  ];
  const boothNames = [
    "Primary School",
    "Middle School",
    "High School",
    "Community Hall",
    "Panchayat Bhavan",
  ];

  for (const type of issueTypes) {
    const prefix =
      type === "assembly-issue"
        ? "GS"
        : type === "myassembly0"
          ? "MY0"
          : type === "myassembly2"
            ? "MY2"
            : "MY3";

    for (let i = 1; i <= 40; i++) {
      const block = blocks[Math.floor(Math.random() * blocks.length)];
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const village = villages[Math.floor(Math.random() * villages.length)];
      const faliya = faliyas[Math.floor(Math.random() * faliyas.length)];
      const gp =
        gramPanchayats[Math.floor(Math.random() * gramPanchayats.length)];
      const booth = boothNames[Math.floor(Math.random() * boothNames.length)];
      const msCode =
        microSectors[Math.floor(Math.random() * microSectors.length)];
      const msNo = `${msCode} ${Math.floor(Math.random() * 20) + 1}`;

      sampleIssues.push({
        uniqueId: `${prefix}/${170 + i}`,
        issueType: type,
        year: Math.random() > 0.3 ? "2025" : "2024",
        month: "January",
        date: `2025-01-${(i % 28) + 1}`,
        recommendedLetterNo: `RL-${1000 + i}`,
        acMpNo: "N/A",
        block: block,
        sectorName: sector,
        microSectorNo: msNo,
        microSectorName: `${sector} MS ${Math.floor(Math.random() * 10) + 1}`,
        boothName: `${booth} ${village}`,
        boothNo: (Math.floor(Math.random() * 300) + 1).toString(),
        panchayatName: gp,
        village: village,
        majraFaliya: faliya,
        totalMembers: Math.floor(Math.random() * 50),
        avedanFile: "",
        status: i % 2 === 0 ? "Pending" : "In Progress",
        addedBy: "Admin",
        latLng: "22.7196, 75.8577",
        registrationDate: new Date().toISOString().split("T")[0],
      });
    }
  }

  await AssemblyIssue.insertMany(sampleIssues);

  res.json({
    success: true,
    message: `Seeded ${sampleIssues.length} issues successfully`,
  });
});
