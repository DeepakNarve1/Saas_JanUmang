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
const Samiti = require("../models/samitiModel");
const Village = require("../models/villageModel");
const Panchayat = require("../models/panchayatModel");
const Booth = require("../models/boothModel");

/**
 * @desc    Get dashboard statistics (optimized)
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const tenantId = req.user.tenantId;
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
    samitisCount,
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

    // Samitis
    Samiti.countDocuments(tenantFilter),

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
      totalSamitis: samitisCount,
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
  const tenantId = req.user.tenantId;
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
  const tenantId = req.user.tenantId;
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
  const tenantId = req.user.tenantId;
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

module.exports = {
  getDashboardStats,
  getDepartmentSummary,
  getBlockSummary,
  getChartData,
};
