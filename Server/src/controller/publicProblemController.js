const asyncHandler = require("express-async-handler");
const PublicProblem = require("../models/publicProblemModel");
const District = require("../models/districtModel");
const Assembly = require("../models/assemblyModel");
const { logActivity } = require("./activityLogController");

// @desc    Get all public problems
// @route   GET /api/public-problems
// @access  Private
exports.getPublicProblems = asyncHandler(async (req, res) => {
  const {
    block,
    assembly,
    year,
    month,
    department,
    status,
    search,
    page = 1,
    limit = 10,
  } = req.query;

  // Build filter query
  const query = { ...req.scopeFilter };

  if (block) query.block = block;
  if (assembly) query.assembly = assembly;
  if (year) query.year = year;
  if (month) query.month = month;
  if (department) query.department = department;
  if (status) query.status = status;

  if (search) {
    query.$or = [
      { regNo: { $regex: search, $options: "i" } },
      { district: { $regex: search, $options: "i" } },
    ];
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;

  // Run queries in parallel for better performance
  const [problems, filteredCount, totalCount] = await Promise.all([
    limitNum === -1
      ? PublicProblem.find(query).sort({ createdAt: -1 }).lean()
      : PublicProblem.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
    PublicProblem.countDocuments(query),
    PublicProblem.countDocuments({ ...req.scopeFilter }),
  ]);

  res.json({
    success: true,
    data: problems,
    count: totalCount, // ← Total records in DB (unfiltered)
    filteredCount: filteredCount, // ← How many match current filters
  });
});

// @desc    Create a public problem
// @route   POST /api/public-problems
exports.createPublicProblem = asyncHandler(async (req, res) => {
  try {
    // Generate regNo if not provided
    if (!req.body.regNo) {
      const lastProblem = await PublicProblem.findOne(
        { tenantId: req.tenantId },
        { regNo: 1 },
      ).sort({
        createdAt: -1,
      });
      let lastNum = 0;
      if (lastProblem && lastProblem.regNo) {
        const match = lastProblem.regNo.match(/\d+$/);
        if (match) {
          lastNum = parseInt(match[0]);
        }
      }
      req.body.regNo = `MP/${lastNum + 1}`;
    }

    // SaaS: Link to organization
    req.body.tenantId = req.tenantId;

    if (req.user) {
      req.body.addedBy = req.user.name || req.user.email || "System";
    }

    const problem = await PublicProblem.create(req.body);

    await logActivity(
      req,
      "CREATE",
      "PublicProblem",
      `Created public problem: ${problem.regNo}`,
      { recordId: problem._id, newData: problem },
    );

    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    if (error.name === "MongoServerError" && error.code === 11000) {
      res.status(400);
      throw new Error(
        "A problem with this registration number already exists.",
      );
    }
    res.status(400);
    throw new Error(error.message);
  }
});

// @desc    Seed initial data
// @route   POST /api/public-problems/seed
exports.seedPublicProblems = asyncHandler(async (req, res) => {
  await PublicProblem.deleteMany();

  const problems = Array.from({ length: 1250 }).map((_, i) => ({
    regNo: `MP/${416 - i}`,
    // Create dates going back 1 day per item to make timer interesting
    submissionDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000 - i * 100000),
    year: "2025",
    month: "November",
    dateString: "2025-11-28",
    district: i % 2 === 0 ? "Betul" : "Panna",
    assembly: "N/A",
    block: i % 3 === 0 ? "Bagh" : "Tanda", // Mix blocks for filtering
    recommendedLetterNo: "N/A",
    boothNo: String(100 + i),
    department: i % 2 === 0 ? "PWD" : "Health",
    status: i % 4 === 0 ? "Resolved" : "Pending",
  }));

  await PublicProblem.insertMany(problems);
  res.json({ success: true, message: "Seeded 25 problems" });
});

// @desc    Get single public problem
// @route   GET /api/public-problems/:id
exports.getPublicProblemById = asyncHandler(async (req, res) => {
  const problem = await PublicProblem.findById(req.params.id).lean();
  if (!problem) {
    res.status(404);
    throw new Error("Problem not found");
  }

  // Optimize: Lookup related IDs for frontend pre-filling
  const related = {
    districtId: null,
    divisionId: null,
    stateId: null,
    assemblyId: null,
  };

  if (problem.district) {
    const distDoc = await District.findOne({ name: problem.district }).populate(
      {
        path: "division",
        populate: { path: "state" },
      },
    );
    if (distDoc) {
      related.districtId = distDoc._id;
      if (distDoc.division) {
        related.divisionId = distDoc.division._id;
        related.divisionName = distDoc.division.name; // Add Name
        if (distDoc.division.state) {
          related.stateId = distDoc.division.state._id;
          related.stateName = distDoc.division.state.name; // Add Name
        }
      }
    }
  }

  if (problem.assembly) {
    const asmDoc = await Assembly.findOne({ name: problem.assembly });
    if (asmDoc) {
      related.assemblyId = asmDoc._id;
    }
  }

  res.json({ success: true, data: { ...problem, related } });
});

// @desc    Update public problem
// @route   PUT /api/public-problems/:id
exports.updatePublicProblem = asyncHandler(async (req, res) => {
  const problem = await PublicProblem.findById(req.params.id);
  if (!problem) {
    res.status(404);
    throw new Error("Problem not found");
  }
  const oldData = problem.toObject();

  const updatedProblem = await PublicProblem.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
  );

  await logActivity(
    req,
    "UPDATE",
    "PublicProblem",
    `Updated public problem: ${updatedProblem.regNo}`,
    { recordId: updatedProblem._id, newData: updatedProblem, oldData },
  );

  res.json({ success: true, data: updatedProblem });
});

// @desc    Delete public problem
// @route   DELETE /api/public-problems/:id
exports.deletePublicProblem = asyncHandler(async (req, res) => {
  const problem = await PublicProblem.findById(req.params.id);
  if (!problem) {
    res.status(404);
    throw new Error("Problem not found");
  }
  await problem.deleteOne();

  await logActivity(
    req,
    "DELETE",
    "PublicProblem",
    `Deleted public problem: ${problem.regNo}`,
    { recordId: problem._id, oldData: problem },
  );

  res.json({ success: true, message: "Problem removed" });
});
