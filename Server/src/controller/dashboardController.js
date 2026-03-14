const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const PublicProblem = require("../models/publicProblemModel");
const Project = require("../models/projectModel");
const AssemblyIssue = require("../models/assemblyIssueModel");
const Event = require("../models/eventModel");
const Department = require("../models/departmentModel");
const Block = require("../models/blockModel");
const Visitor = require("../models/visitorModel");
const Member = require("../models/memberModel");
const InDoc = require("../models/inDocsModel");
// Note: Samiti is a factory function, not a direct model - skip for now
const Village = require("../models/villageModel");
const Panchayat = require("../models/panchayatModel");
const Booth = require("../models/boothModel");

/**
 * @desc    Get dashboard statistics (optimized)
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const tenantFilter = tenantId ? { tenantId } : {};

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Parallel aggregation queries for better performance
  const [
    totalUsers,
    totalRoles,
    publicProblemsStats,
    projectsStats,
    assemblyIssuesCount,
    eventsCount,
    departmentsCount,
    blocksCount,
    visitorsCount,
    membersStats,
    inDocsCount,
    villagesCount,
    panchayatsCount,
    boothsCount,
  ] = await Promise.all([
    // Users
    User.countDocuments(tenantFilter),

    // Roles
    Role.countDocuments(tenantFilter),

    // Public Problems with status breakdown
    PublicProblem.aggregate([
      { $match: tenantFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
          },
        },
      },
    ]),

    // Projects with status breakdown
    Project.aggregate([
      { $match: tenantFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
          },
        },
      },
    ]),

    // Assembly Issues
    AssemblyIssue.countDocuments(tenantFilter),

    // Events
    Event.countDocuments(tenantFilter),

    // Departments
    Department.countDocuments(tenantFilter),

    // Blocks
    Block.countDocuments(tenantFilter),

    // Visitors
    Visitor.countDocuments(tenantFilter),

    // Members with today's count
    Member.aggregate([
      { $match: tenantFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          today: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$createdAt", today] },
                    { $lt: ["$createdAt", tomorrow] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),

    // In Docs
    InDoc.countDocuments(tenantFilter),

    // Villages
    Village.countDocuments(tenantFilter),

    // Panchayats
    Panchayat.countDocuments(tenantFilter),

    // Booths
    Booth.countDocuments(tenantFilter),
  ]);

  // Extract results
  const problemsData = publicProblemsStats[0] || {
    total: 0,
    pending: 0,
    resolved: 0,
    inProgress: 0,
  };
  const projectsData = projectsStats[0] || { total: 0, completed: 0 };
  const membersData = membersStats[0] || { total: 0, today: 0 };

  // Return aggregated stats
  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalRoles,
      totalPublicProblems: problemsData.total,
      pendingProblems: problemsData.pending,
      resolvedProblems: problemsData.resolved,
      inProgressProblems: problemsData.inProgress,
      totalProjects: projectsData.total,
      completedProjects: projectsData.completed,
      totalAssemblyIssues: assemblyIssuesCount,
      totalEvents: eventsCount,
      totalDepartments: departmentsCount,
      totalBlocks: blocksCount,
      totalVisitors: visitorsCount,
      totalMembers: membersData.total,
      todayMembers: membersData.today,
      totalInDocs: inDocsCount,
      totalVillages: villagesCount,
      totalPanchayats: panchayatsCount,
      totalBooths: boothsCount,
    },
  });
});

/**
 * @desc    Get department summary for dashboard
 * @route   GET /api/dashboard/department-summary
 * @access  Private
 */
const getDepartmentSummary = asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const tenantFilter = tenantId ? { tenantId } : {};
  const { block } = req.query;

  const matchFilter = { ...tenantFilter };
  if (block) {
    matchFilter.block = block;
  }

  const summary = await PublicProblem.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$department",
        total: { $sum: 1 },
        complete: {
          $sum: {
            $cond: [
              {
                $in: ["$status", ["Resolved", "Closed", "Completed"]],
              },
              1,
              0,
            ],
          },
        },
        incomplete: {
          $sum: {
            $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
          },
        },
        inProgress: {
          $sum: {
            $cond: [{ $in: ["$status", ["In Progress", "Processing"]] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ["$_id", "Unassigned"] },
        total: 1,
        complete: 1,
        incomplete: 1,
        inProgress: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * @desc    Get block summary for dashboard
 * @route   GET /api/dashboard/block-summary
 * @access  Private
 */
const getBlockSummary = asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const tenantFilter = tenantId ? { tenantId } : {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const summary = await PublicProblem.aggregate([
    { $match: tenantFilter },
    {
      $group: {
        _id: "$block",
        total: { $sum: 1 },
        today: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$submissionDate", today] },
                  { $lt: ["$submissionDate", tomorrow] },
                ],
              },
              1,
              0,
            ],
          },
        },
        complete: {
          $sum: {
            $cond: [
              { $in: ["$status", ["Resolved", "Closed", "Completed"]] },
              1,
              0,
            ],
          },
        },
        incomplete: {
          $sum: {
            $cond: [{ $eq: ["$status", "Pending"] }, 1, 0],
          },
        },
        inProgress: {
          $sum: {
            $cond: [{ $in: ["$status", ["In Progress", "Processing"]] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ["$_id", "Unassigned"] },
        total: 1,
        today: 1,
        complete: 1,
        incomplete: 1,
        inProgress: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * @desc    Get chart data for dashboard
 * @route   GET /api/dashboard/charts
 * @access  Private
 */
const getChartData = asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const tenantFilter = tenantId ? { tenantId } : {};
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }
  if (endDate) {
    dateFilter.$lte = new Date(endDate);
  }

  const matchFilter = { ...tenantFilter };
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.submissionDate = dateFilter;
  }

  // Get problems by department
  const problemsByDepartment = await PublicProblem.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$department",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        department: { $ifNull: ["$_id", "Unassigned"] },
        count: 1,
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Get problems by status
  const problemsByStatus = await PublicProblem.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        status: { $ifNull: ["$_id", "Unknown"] },
        count: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      problemsByDepartment,
      problemsByStatus,
    },
  });
});

/**
 * @desc    Get member block summary based on code field
 * @route   GET /api/dashboard/member-block-summary
 * @access  Private
 */
const getMemberDistrictSummary = asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const tenantFilter = tenantId ? { tenantId } : {};

  const summary = await Member.aggregate([
    { $match: tenantFilter },
    {
      $group: {
        _id: "$district",
        bc: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)BC(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        pp: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)PP(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        ip: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)IP(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        fh: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)FH(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        smm: {
          $sum: {
            $cond: [
              {
                $regexMatch: { input: "$code", regex: /(^|,\s*)SMM(\s*,|$)/i },
              },
              1,
              0,
            ],
          },
        },
        ms: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)MS(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        fp: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)FP(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        er: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)ER(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        ak: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)AK(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        fm: {
          $sum: {
            $cond: [
              { $regexMatch: { input: "$code", regex: /(^|,\s*)FM(\s*,|$)/i } },
              1,
              0,
            ],
          },
        },
        varist: {
          $sum: {
            $cond: [
              {
                $regexMatch: {
                  input: "$code",
                  regex: /(^|,\s*)(Varist|वरिष्ठ)(\s*,|$)/i,
                },
              },
              1,
              0,
            ],
          },
        },
        yuva: {
          $sum: {
            $cond: [
              {
                $regexMatch: {
                  input: "$code",
                  regex: /(^|,\s*)(Yuva|युवा)(\s*,|$)/i,
                },
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ["$_id", "Unassigned"] },
        bc: 1,
        pp: 1,
        ip: 1,
        fh: 1,
        smm: 1,
        ms: 1,
        fp: 1,
        er: 1,
        ak: 1,
        fm: 1,
        varist: 1,
        yuva: 1,
      },
    },
    { $sort: { name: 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * @desc    Get MP public problems department summary
 * @route   GET /api/dashboard/mp-department-summary
 * @access  Private
 */
const getMpDepartmentSummary = asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const tenantFilter = tenantId ? { tenantId } : {};
  const { block } = req.query;

  // MP problems are identified by their MP/ regNo prefix
  const matchFilter = {
    ...tenantFilter,
    regNo: { $regex: /^MP\//i },
  };
  if (block) matchFilter.block = block;

  const summary = await PublicProblem.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$department",
        total: { $sum: 1 },
        complete: {
          $sum: {
            $cond: [
              { $in: ["$status", ["Resolved", "Closed", "Completed"]] },
              1,
              0,
            ],
          },
        },
        incomplete: {
          $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
        },
        inProgress: {
          $sum: {
            $cond: [{ $in: ["$status", ["In Progress", "Processing"]] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ["$_id", "Unassigned"] },
        total: 1,
        complete: 1,
        incomplete: 1,
        inProgress: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({ success: true, data: summary });
});

/**
 * @desc    Get MP public problems block summary
 * @route   GET /api/dashboard/mp-block-summary
 * @access  Private
 */
const getMpBlockSummary = asyncHandler(async (req, res) => {
  const tenantId = req.tenantId;
  const tenantFilter = tenantId ? { tenantId } : {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const matchFilter = {
    ...tenantFilter,
    regNo: { $regex: /^MP\//i },
  };

  const summary = await PublicProblem.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$block",
        total: { $sum: 1 },
        today: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ["$submissionDate", today] },
                  { $lt: ["$submissionDate", tomorrow] },
                ],
              },
              1,
              0,
            ],
          },
        },
        complete: {
          $sum: {
            $cond: [
              { $in: ["$status", ["Resolved", "Closed", "Completed"]] },
              1,
              0,
            ],
          },
        },
        incomplete: {
          $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
        },
        inProgress: {
          $sum: {
            $cond: [{ $in: ["$status", ["In Progress", "Processing"]] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ["$_id", "Unassigned"] },
        total: 1,
        today: 1,
        complete: 1,
        incomplete: 1,
        inProgress: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  res.status(200).json({ success: true, data: summary });
});

module.exports = {
  getDashboardStats,
  getDepartmentSummary,
  getBlockSummary,
  getChartData,
  getMemberDistrictSummary,
  getMpDepartmentSummary,
  getMpBlockSummary,
};
