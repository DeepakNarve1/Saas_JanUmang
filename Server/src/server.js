const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Security & Logging
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

// Error Handling
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./middleware/errorMiddleware");
const { generalApiLimiter } = require("./middleware/rateLimitMiddleware");

// Routes
const authRoutes = require("./routes/authRoute");
const rbacRoutes = require("./routes/rbacRoute");
// ... other routes imported below

// Configuration
dotenv.config();

// Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

connectDB();

const app = express();

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());

// Global rate limiter — broad safety net for all routes
// Specific stricter limiters are applied per-route in authRoute.js
app.use("/api", generalApiLimiter);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3001",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-tenant-id",
  ],
};

app.use(cors(corsOptions));
app.use(compression());

// Body parser — 1mb is plenty for JSON API calls
// 50mb was dangerous: it invited DoS via huge payloads
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Test middleware
app.get("/", (req, res) => {
  res.send("Api is running...");
});

// TEMPORARY FIX ROUTE
app.get("/api/fix-indices", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const db = mongoose.connection.db;
    const results = [];

    // Explicit list of collections likely to have stale indices
    const targets = [
      "samitilists",
      "parties",
      "departments",
      "worktypes",
      "subtypeofworks",
      "vidhasabha.ganesh_samitis",
      "vidhasabha.tenkar_samitis",
      "vidhasabha.dp_samitis",
      "vidhasabha.mandir_samitis",
      "vidhasabha.bhagoria_samitis",
      "vidhasabha.nirman_samitis",
      "vidhasabha.booth_samitis",
      "vidhasabha.block_samitis",
      "vidhasabha.vidhan_sabha_lists",
    ];

    for (const colName of targets) {
      try {
        const collection = db.collection(colName);
        const indexes = await collection.indexes();
        for (const idx of indexes) {
          if (
            idx.unique &&
            (idx.key.name || idx.key.uniqueId || idx.key.code) &&
            !idx.key.tenantId &&
            idx.name !== "_id_"
          ) {
            results.push(`Dropped index ${idx.name} on ${colName}`);
            await collection.dropIndex(idx.name);
          }
        }
      } catch (e) {
        // Skip collections that don't exist yet
      }
    }

    res.json({
      success: true,
      message: "Database cleanup completed.",
      actionTaken:
        results.length > 0 ? results : "No stale global indices found.",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2) ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/rbac", rbacRoutes);

const dashboardRoutes = require("./routes/dashboardRoute");
app.use("/api/dashboard", dashboardRoutes);

const tenantRoutes = require("./routes/tenantRoute");
app.use("/api/tenants", tenantRoutes);

// Legacy support: map /api/roles/* to /api/rbac/roles/*
app.use("/api/roles", (req, res, next) => {
  req.url = "/roles" + req.url;
  rbacRoutes(req, res, next);
});

const publicProblemRoutes = require("./routes/publicProblemRoute");
app.use("/api/public-problems", publicProblemRoutes);

const projectRoutes = require("./routes/projectRoute");
app.use("/api/projects", projectRoutes);

const districtRoutes = require("./routes/districtRoute");
app.use("/api/districts", districtRoutes);

const divisionRoutes = require("./routes/divisionRoute");
app.use("/api/divisions", divisionRoutes);

const stateRoutes = require("./routes/stateRoute");
app.use("/api/states", stateRoutes);

const parliamentRoutes = require("./routes/parliamentRoute");
app.use("/api/parliaments", parliamentRoutes);

const assemblyRoutes = require("./routes/assemblyRoute");
app.use("/api/assemblies", assemblyRoutes);

const blockRoutes = require("./routes/blockRoute");
app.use("/api/blocks", blockRoutes);

const boothRoutes = require("./routes/boothRoute");
app.use("/api/booths", boothRoutes);

const panchayatRoutes = require("./routes/panchayatRoutes");
app.use("/api/panchayat", panchayatRoutes);

const villageRoutes = require("./routes/villageRoute");
app.use("/api/villages", villageRoutes);

const assemblyIssueRoutes = require("./routes/assemblyIssueRoute");
app.use("/api/assembly-issues", assemblyIssueRoutes);

const eventRoutes = require("./routes/eventRoute");
app.use("/api/events", eventRoutes);

const memberRoutes = require("./routes/memberRoute");
app.use("/api/members", memberRoutes);

const voterRoutes = require("./routes/voterRoute");
app.use("/api/voters", voterRoutes);

const visitorRoutes = require("./routes/visitorRoute");
app.use("/api/visitors", visitorRoutes);

const samitiListRoutes = require("./routes/samitiListRoute");
app.use("/api/samiti", samitiListRoutes);

const partyRoutes = require("./routes/partyRoute");
app.use("/api/party", partyRoutes);

const vidhanSabhaRoutes = require("./routes/vidhanSabhaRoute");
app.use("/api/vidhan-sabha", vidhanSabhaRoutes);

const subTypeOfWorkRoutes = require("./routes/subTypeOfWorkRoute");
app.use("/api/sub-type-of-work", subTypeOfWorkRoutes);

const departmentRoutes = require("./routes/departmentRoute");
app.use("/api/departments", departmentRoutes);

const phoneDirectoryRoutes = require("./routes/phoneDirectoryRoute");
app.use("/api/phone-directory", phoneDirectoryRoutes);

const worktypeRoutes = require("./routes/worktypeRoute");
app.use("/api/worktypes", worktypeRoutes);

const inDocsRoutes = require("./routes/inDocsRoute");
app.use("/api/in-docs", inDocsRoutes);

const inwardRegisterRoutes = require("./routes/inwardRegisterRoute");
app.use("/api/inward-register", inwardRegisterRoutes);

const dispatchRegisterRoutes = require("./routes/dispatchRegisterRoute");
app.use("/api/dispatch-register", dispatchRegisterRoutes);

const callManagementRoutes = require("./routes/callManagementRoutes");
app.use("/api/call-management", callManagementRoutes);

const activityLogRoutes = require("./routes/activityLogRoutes");
app.use("/api/activity-logs", activityLogRoutes);

const samitiRoutes = require("./routes/samitiRoute");
const SAMITI_TYPES = [
  "ganesh-samiti",
  "tenkar-samiti",
  "dp-samiti",
  "mandir-samiti",
  "bhagoria-samiti",
  "nirman-samiti",
  "booth-samiti",
  "block-samiti",
  "vidhan-sabha-list",
];

SAMITI_TYPES.forEach((type) => {
  app.use(`/api/${type}`, (req, res, next) => {
    req.samitiType = type;
    samitiRoutes(req, res, next);
  });
});

// 404 Route Handler
// 404 Route Handler
app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle Unhandled Rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
