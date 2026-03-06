/**
 * uploadMiddleware.js
 *
 * Multer configuration for disk-based file uploads.
 *
 * Files are stored in:   <server-root>/uploads/<tenantId>/<YYYY-MM>/<uuid>-<originalname>
 * Served via:            GET /api/uploads/files/<tenantId>/<YYYY-MM>/<filename>  (auth-protected)
 *
 * Allowed types:  PDF, JPG, PNG, WEBP (documents and photos for avedan)
 * Max size:       10 MB per file
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const UPLOADS_ROOT = path.join(__dirname, "../../uploads");
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// ── Storage engine ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Tenant-scoped sub-directory so files are logically isolated
    const tenantId = req.tenantId?.toString() || "global";
    const now = new Date();
    const monthDir = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dir = path.join(UPLOADS_ROOT, tenantId, monthDir);

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },

  filename: (req, file, cb) => {
    // uuid prefix to guarantee uniqueness even for identical original names
    const uuid = crypto.randomBytes(8).toString("hex");
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${uuid}-${safeOriginal}`);
  },
});

// ── File filter ────────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed: PDF, JPG, PNG, WEBP`,
      ),
      false,
    );
  }
};

// ── Export configured Multer instance ─────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

module.exports = { upload, UPLOADS_ROOT };
