const ActivityLog = require("../models/activityLogModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");

// Get Logs with filtering and pagination
exports.getLogs = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    search,
    user,
    role,
    module,
    action,
    dateFrom,
    dateTo,
  } = req.query;

  const query = { ...req.scopeFilter };

  // Search in description, module, or ip
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { module: { $regex: search, $options: "i" } },
      { ipAddress: { $regex: search, $options: "i" } },
    ];
  }

  if (user && user !== "All Users") query.user = user;
  if (module && module !== "All Modules") query.module = module;
  if (action && action !== "All Actions") query.action = action.toUpperCase();

  // Filter by Role
  if (role && role !== "All Roles") {
    const User = require("../models/userModel");
    const usersWithRole = await User.find({ role: role }).select("_id");
    const userIds = usersWithRole.map((u) => u._id);

    if (!user || user === "All Users") {
      query.user = { $in: userIds };
    }
  }

  // Date Range Filter
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) {
      // Use IST start of day
      query.createdAt.$gte = new Date(`${dateFrom}T00:00:00+05:30`);
    }
    if (dateTo) {
      // Use IST end of day
      query.createdAt.$lte = new Date(`${dateTo}T23:59:59.999+05:30`);
    }
  }

  let paginationLimit = parseInt(limit);
  if (isNaN(paginationLimit)) paginationLimit = 10;
  if (paginationLimit === -1) paginationLimit = 0;

  const pageNum = parseInt(page) || 1;
  const skip = (pageNum - 1) * paginationLimit;

  // Run queries in parallel for better performance
  const [data, count, total] = await Promise.all([
    paginationLimit > 0
      ? ActivityLog.find(query)
          .populate({
            path: "user",
            populate: { path: "role", select: "name displayName" },
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(paginationLimit)
          .lean()
      : ActivityLog.find(query)
          .populate({
            path: "user",
            populate: { path: "role", select: "name displayName" },
          })
          .sort({ createdAt: -1 })
          .lean(),
    ActivityLog.countDocuments(query),
    ActivityLog.countDocuments({ ...req.scopeFilter }),
  ]);

  res.status(200).json({
    success: true,
    count,
    total,
    data,
  });
});

// Get single activity log by ID
exports.getLogById = asyncHandler(async (req, res, next) => {
  const log = await ActivityLog.findOne({
    _id: req.params.id,
    ...req.scopeFilter,
  })
    .populate("user", "name role")
    .populate({
      path: "user",
      populate: { path: "role", select: "name displayName" },
    });

  if (!log) {
    throw new AppError("Activity log not found", 404);
  }

  res.status(200).json({
    success: true,
    data: log,
  });
});

// Get User Activity Report (Aggregation)
exports.getActivityReport = asyncHandler(async (req, res, next) => {
  const { user, dateFrom, dateTo } = req.query;

  const matchStage = { ...req.scopeFilter };

  if (user && user !== "All Users") {
    if (!mongoose.Types.ObjectId.isValid(user)) {
      throw new AppError("Invalid user ID", 400);
    }
    matchStage.user = new mongoose.Types.ObjectId(user);
  }

  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) {
      matchStage.createdAt.$gte = new Date(`${dateFrom}T00:00:00+05:30`);
    }
    if (dateTo) {
      matchStage.createdAt.$lte = new Date(`${dateTo}T23:59:59.999+05:30`);
    }
  }

  const report = await ActivityLog.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          user: "$user",
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "+05:30",
            },
          },
        },
        total: { $sum: 1 },
        loginCount: {
          $sum: { $cond: [{ $eq: ["$action", "LOGIN"] }, 1, 0] },
        },
        createCount: {
          $sum: { $cond: [{ $eq: ["$action", "CREATE"] }, 1, 0] },
        },
        updateCount: {
          $sum: { $cond: [{ $eq: ["$action", "UPDATE"] }, 1, 0] },
        },
        deleteCount: {
          $sum: { $cond: [{ $eq: ["$action", "DELETE"] }, 1, 0] },
        },
        viewCount: {
          $sum: { $cond: [{ $eq: ["$action", "VIEW"] }, 1, 0] },
        },
        exportCount: {
          $sum: { $cond: [{ $eq: ["$action", "EXPORT"] }, 1, 0] },
        },
        lastActive: { $max: "$createdAt" },
        events: {
          $push: {
            action: "$action",
            time: "$createdAt",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id.user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: {
        path: "$userInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        userName: { $ifNull: ["$userInfo.name", "Unknown User"] },
        date: "$_id.date",
        total: 1,
        loginCount: 1,
        createCount: 1,
        updateCount: 1,
        deleteCount: 1,
        viewCount: 1,
        downloadCount: "$exportCount",
        lastActive: 1,
        events: 1,
      },
    },
  ]);

  // Helper for formatting duration
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatTimeIST = (date) => {
    if (!date) return "--:--:--";
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  // JS Processing for session durations and boundary times
  const processedReport = report.map((row) => {
    let totalDurationMs = 0;
    const sortedEvents = row.events.sort(
      (a, b) => new Date(a.time) - new Date(b.time),
    );

    const loginEvents = sortedEvents.filter((e) => e.action === "LOGIN");
    const logoutEvents = sortedEvents.filter((e) => e.action === "LOGOUT");

    const firstLogin = loginEvents.length > 0 ? loginEvents[0].time : null;
    const lastLogout =
      logoutEvents.length > 0
        ? logoutEvents[logoutEvents.length - 1].time
        : null;

    // Start of day in IST for this row
    const startOfDayIST = new Date(`${row.date}T00:00:00+05:30`);

    // Calculate duration by pairing LOGIN -> LOGOUT
    let currentLogin = null;

    sortedEvents.forEach((ev) => {
      if (ev.action === "LOGIN") {
        // If we were already "logged in" (missing previous logout), close previous session at this new login time?
        // No, that implies they were active the whole time. Better to close it at the *last active* time?
        // For simplicity, if we hit a new LOGIN, we reset the start time.
        currentLogin = ev.time;
      } else if (ev.action === "LOGOUT") {
        if (currentLogin) {
          totalDurationMs += new Date(ev.time) - new Date(currentLogin);
          currentLogin = null;
        }
      }
    });

    // Handle open-ended sessions (Login but no Logout)
    // We add time from Login to the *Last Activity* of the day
    if (currentLogin) {
      const lastActiveTime = new Date(row.lastActive);
      const startTime = new Date(currentLogin);
      // Only add if last active is after login (sanity check)
      if (lastActiveTime > startTime) {
        totalDurationMs += lastActiveTime - startTime;
      }
    }
    return {
      ...row,
      sessionDuration: formatDuration(totalDurationMs),
      loginTime: formatTimeIST(firstLogin),
      logoutTime: formatTimeIST(lastLogout),
      events: undefined,
    };
  });

  // Final sort: Date Desc, then Username Asc
  processedReport.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return a.userName.localeCompare(b.userName);
  });

  res.status(200).json({
    success: true,
    data: processedReport,
  });
});

// Get distinct filter values (modules, actions)
exports.getFilters = asyncHandler(async (req, res, next) => {
  const dbModules = await ActivityLog.distinct("module");
  const dbActions = await ActivityLog.distinct("action");

  // Predefined modules to ensure dropdown is populated even when logs are empty
  const PREDEFINED_MODULES = [
    "Auth",
    "UserManagement",
    "Role",
    "Permission",
    "SidebarAccess",
    "Department",
    "Worktype",
    "Project",
    "Event",
    "Member",
    "Visitor",
    "Voter",
    "District",
    "Division",
    "State",
    "Parliament",
    "Assembly",
    "Block",
    "Panchayat",
    "Village",
    "Booth",
    "Samiti",
    "SamitiList",
    "VidhanSabha",
    "PublicProblem",
    "AssemblyIssue",
    "CallManagement",
    "DispatchRegister",
    "InwardRegister",
    "InDocs",
    "PhoneDirectory",
    "SubTypeOfWork",
    "Party",
  ];

  const PREDEFINED_ACTIONS = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "VIEW",
  ];

  // Merge and unique
  const modules = [...new Set([...PREDEFINED_MODULES, ...dbModules])].sort();
  const actions = [...new Set([...PREDEFINED_ACTIONS, ...dbActions])].sort();

  res.status(200).json({
    success: true,
    data: {
      modules,
      actions,
    },
  });
});

// Internal function available to other controllers
exports.logActivity = async (
  req,
  action,
  moduleName,
  description,
  metadata = null,
) => {
  try {
    const userId = req.user ? req.user._id : null;
    let ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress;

    // Normalize IPv6 loopback to 127.0.0.1 for readability
    if (ip === "::1" || ip === "::ffff:127.0.0.1") {
      ip = "127.0.0.1";
    }

    // Strip IPv6 prefix if present in other addresses
    if (ip && ip.startsWith("::ffff:")) {
      ip = ip.replace("::ffff:", "");
    }
    const userAgent = req.get ? req.get("User-Agent") : "";

    // Robust tenantId resolution
    const tenantId = req.tenantId || (req.user && req.user.tenantId);

    if (!tenantId) {
      console.warn(
        `[ActivityLog] Skipped logging for action ${action}: No tenantId found.`,
      );
      return;
    }

    await ActivityLog.create({
      user: userId,
      tenantId: tenantId, // SaaS: Link to organization
      action: action.toUpperCase(),
      module: moduleName,
      description,
      ipAddress: ip,
      userAgent: userAgent,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error to avoid disrupting main flow
  }
};
