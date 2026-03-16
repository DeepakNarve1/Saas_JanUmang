const dotenv = require("dotenv");
dotenv.config();

const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  // Sample 10% of traces in production to control quota costs.
  // Use 100% in development for full visibility during debugging.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
});

const express = require("express");
const cors = require("cors");
const path = require("path");

// Security & Logging
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const { setupRequestLogging } = require("./config/logger");

// Error Handling
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./middleware/errorMiddleware");
const { generalApiLimiter } = require("./middleware/rateLimitMiddleware");
const sanitizeQuery = require("./middleware/sanitizeQuery");

// Routes
const authRoutes = require("./routes/authRoute");
const rbacRoutes = require("./routes/rbacRoute");
const uploadRoutes = require("./routes/uploadRoute");
const tenantRoutes = require("./routes/tenantRoute");
const stateRoutes = require("./routes/stateRoute");
const districtRoutes = require("./routes/districtRoute");
const divisionRoutes = require("./routes/divisionRoute");
const assemblyRoutes = require("./routes/assemblyRoute");
const blockRoutes = require("./routes/blockRoute");
const panchayatRoutes = require("./routes/panchayatRoutes");
const boothRoutes = require("./routes/boothRoute");
const voterRoutes = require("./routes/voterRoute");
const visitorRoutes = require("./routes/visitorRoute");
const samitiListRoutes = require("./routes/samitiListRoute");
const partyRoutes = require("./routes/partyRoute");
const vidhanSabhaRoutes = require("./routes/vidhanSabhaRoute");
const subTypeOfWorkRoutes = require("./routes/subTypeOfWorkRoute");
const departmentRoutes = require("./routes/departmentRoute");
const phoneDirectoryRoutes = require("./routes/phoneDirectoryRoute");
const worktypeRoutes = require("./routes/worktypeRoute");
const inDocsRoutes = require("./routes/inDocsRoute");
const inwardRegisterRoutes = require("./routes/inwardRegisterRoute");
const dispatchRegisterRoutes = require("./routes/dispatchRegisterRoute");
const callManagementRoutes = require("./routes/callManagementRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const samitiRoutes = require("./routes/samitiRoute");

// Additional Routes
const dashboardRoutes = require("./routes/dashboardRoute");
const assemblyIssueRoutes = require("./routes/assemblyIssueRoute");
const eventRoutes = require("./routes/eventRoute");
const memberRoutes = require("./routes/memberRoute");
const parliamentRoutes = require("./routes/parliamentRoute");
const projectRoutes = require("./routes/projectRoute");
const publicProblemRoutes = require("./routes/publicProblemRoute");
const villageRoutes = require("./routes/villageRoute");
const paymentRoutes = require("./routes/paymentRoute");
const planRoutes = require("./routes/planRoute");

const app = express();

// 0) HELPER MIDDLEWARES
// Express 5: req.query is a getter by default and often read-only.
// We make it writable so middlewares like mongo-sanitize can work.
app.use((req, res, next) => {
  Object.defineProperty(req, "query", {
    value: { ...req.query },
    writable: true,
    enumerable: true,
    configurable: true,
  });
  next();
});

// 1) GLOBAL MIDDLEWARES
app.use(helmet());
app.use("/api", generalApiLimiter);
app.use("/api", sanitizeQuery(1000));
setupRequestLogging(app);

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
app.use(cookieParser()); // Must be before payment routes so protect() can read cookies
app.use(mongoSanitize()); // Prevent NoSQL injection BEFORE ANY routes run

// ⚠️  Razorpay webhook MUST be registered before global express.json() might limit it.
//    The payment route handles its own JSON parsing.
app.use("/api/payment", paymentRoutes);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// req.query writability fix already applied above (0)

// cookieParser already applied above (before payment routes)

// 2) ROUTES
app.get("/health", async (req, res) => {
  const mongoose = require("mongoose");
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

app.get("/", (req, res) => {
  res.send("Api is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/rbac", rbacRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/districts", districtRoutes);
app.use("/api/divisions", divisionRoutes);
app.use("/api/assemblies", assemblyRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/panchayat", panchayatRoutes); // matches frontend /api/panchayat
app.use("/api/panchayats", panchayatRoutes); // alias for backwards compatibility
app.use("/api/booths", boothRoutes);
app.use("/api/voters", voterRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/samiti", samitiListRoutes);
app.use("/api/party", partyRoutes);
app.use("/api/vidhan-sabha", vidhanSabhaRoutes);
app.use("/api/sub-type-of-work", subTypeOfWorkRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/phone-directory", phoneDirectoryRoutes);
app.use("/api/worktypes", worktypeRoutes);
app.use("/api/in-docs", inDocsRoutes);
app.use("/api/inward-register", inwardRegisterRoutes);
app.use("/api/dispatch-register", dispatchRegisterRoutes);
app.use("/api/call-management", callManagementRoutes);
app.use("/api/activity-logs", activityLogRoutes);

// Additional Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assembly-issues", assemblyIssueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/parliaments", parliamentRoutes); // matches frontend /api/parliaments
app.use("/api/parliament", parliamentRoutes); // alias for backwards compatibility
app.use("/api/projects", projectRoutes);
app.use("/api/public-problems", publicProblemRoutes);
app.use("/api/villages", villageRoutes);
app.use("/api/plans", planRoutes);

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

app.all(/(.*)/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
Sentry.setupExpressErrorHandler(app);
app.use(globalErrorHandler);

module.exports = app;
