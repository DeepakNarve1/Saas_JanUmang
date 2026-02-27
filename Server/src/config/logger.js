/**
 * logger.js
 *
 * Configures morgan HTTP request logging for development and production.
 *
 * Development:
 *   - Colourised "dev" format to stdout — fast and readable
 *
 * Production:
 *   - "combined" Apache format (method, URL, status, response time, user-agent, IP)
 *   - Written to rotating daily log files under /logs/
 *   - Rotates daily, keeps 14 days of compressed (.gz) history
 *   - Skip logging successful health-check/root pings to reduce noise
 *
 * Log file location:  <project-root>/logs/access-YYYY-MM-DD.log
 *
 * Usage:
 *   const { setupRequestLogging } = require('./config/logger');
 *   setupRequestLogging(app);
 */

const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");

// Ensure the logs directory exists (relative to project root)
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Custom morgan token: real client IP ───────────────────────────────────────
// Respects X-Forwarded-For from reverse proxies (nginx, Cloudflare, etc.)
morgan.token("real-ip", (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.headers["x-real-ip"] ||
    req.socket.remoteAddress ||
    "-"
  );
});

// ── Production log format ─────────────────────────────────────────────────────
// Extended "combined" with real IP + response time in milliseconds
const productionFormat =
  ':real-ip - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// ── Rotating stream: daily rotation, 14-day retention, gzip compression ──────
const createRotatingStream = () => {
  return rfs.createStream(
    (time, index) => {
      if (!time) return "access.log"; // Current (active) log file
      const date = time.toISOString().slice(0, 10); // YYYY-MM-DD
      return `access-${date}.log`;
    },
    {
      interval: "1d", // Rotate daily
      path: logsDir,
      compress: "gzip", // Compress old logs to .gz
      maxFiles: 14, // Keep 14 days of history
      teeToStdout: false, // Don't duplicate to stdout in production
    },
  );
};

// ── Skip logging for noisy low-value requests ─────────────────────────────────
const shouldSkip = (req, res) => {
  // Skip successful health/root pings
  if (req.url === "/" && res.statusCode === 200) return true;
  return false;
};

// ── Main setup function ────────────────────────────────────────────────────────
const setupRequestLogging = (app) => {
  if (process.env.NODE_ENV === "production") {
    const stream = createRotatingStream();

    // File logger — all requests in production
    app.use(
      morgan(productionFormat, {
        stream,
        skip: shouldSkip,
      }),
    );

    // Also log errors (4xx/5xx) to stdout for immediate visibility in cloud logs
    app.use(
      morgan("short", {
        skip: (req, res) => res.statusCode < 400,
        stream: process.stdout,
      }),
    );

    console.log(`📝 Production request logging active → ${logsDir}`);
  } else {
    // Development: colourised, concise, to stdout only
    app.use(morgan("dev"));
  }
};

module.exports = { setupRequestLogging };
