const express = require("express");
const path = require("path");
const fs = require("fs");
const protect = require("../middleware/authMiddleware");
const { upload, UPLOADS_ROOT } = require("../middleware/uploadMiddleware");
const { isGlobalAdmin } = require("../utils/authHelpers");
const asyncHandler = require("express-async-handler");

const router = express.Router();

/**
 * POST /api/upload
 *
 * Uploads a single file and returns the authenticated URL.
 *
 * Request:  multipart/form-data  { file: <binary> }
 * Response: { success: true, url: "/api/uploads/<tenantId>/<month>/<filename>", ... }
 */
router.post(
  "/",
  protect,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded.");
    }

    // Build a relative URL path from the uploads root
    const relativePath = path
      .relative(UPLOADS_ROOT, req.file.path)
      .replace(/\\/g, "/"); // normalise Windows backslashes

    // URL now goes through the auth-protected /api/uploads route
    const fileUrl = `/api/uploads/${relativePath}`;

    res.status(201).json({
      success: true,
      url: fileUrl,
      fileName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  }),
);

/**
 * DELETE /api/upload
 *
 * Deletes a previously uploaded file by its URL path.
 * Only the owning tenant can delete their own files (path must contain their tenantId).
 *
 * Request body: { url: "/api/uploads/<tenantId>/..." }
 */
router.delete(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { url } = req.body;

    // Accept both old (/uploads/) and new (/api/uploads/) URL formats
    const isValidUrl =
      url && (url.startsWith("/uploads/") || url.startsWith("/api/uploads/"));

    if (!isValidUrl) {
      res.status(400);
      throw new Error("Invalid file URL.");
    }

    // Normalise to a relative path regardless of prefix format
    const relativePath = url
      .replace(/^\/api\/uploads\//, "")
      .replace(/^\/uploads\//, "");

    // Tenant isolation: first path segment is the tenantId
    if (!isGlobalAdmin(req.user)) {
      const tenantId = req.tenantId?.toString();
      const pathTenantId = relativePath.split("/")[0];
      if (pathTenantId !== tenantId) {
        res.status(403);
        throw new Error("Not authorised to delete this file.");
      }
    }

    const absolutePath = path.join(UPLOADS_ROOT, relativePath);

    // Prevent path traversal attacks
    if (!absolutePath.startsWith(UPLOADS_ROOT)) {
      res.status(400);
      throw new Error("Invalid file path.");
    }

    if (!fs.existsSync(absolutePath)) {
      res.status(404);
      throw new Error("File not found.");
    }

    fs.unlinkSync(absolutePath);
    res.json({ success: true, message: "File deleted successfully." });
  }),
);

/**
 * GET /api/uploads/:tenantId/:month/:filename
 *
 * Auth-protected file serving endpoint.
 *
 * Security checks:
 *   1. User must be authenticated (protect middleware)
 *   2. Non-global-admin users can only access files in their own tenant's folder
 *   3. Path traversal is blocked (resolved path must stay inside UPLOADS_ROOT)
 *
 * The :tenantId segment is the first part of the path — this is baked in by
 * uploadMiddleware.js at upload time so we can enforce tenant isolation here.
 */
router.get(
  "/files/*filePath",
  protect,
  asyncHandler(async (req, res) => {
    // req.params.filePath captures everything after /files/
    const relativePath = req.params.filePath;

    if (!relativePath) {
      res.status(400);
      throw new Error("File path is required.");
    }

    // Resolve absolute path and verify it stays inside UPLOADS_ROOT (prevents traversal)
    const absolutePath = path.resolve(UPLOADS_ROOT, relativePath);
    if (!absolutePath.startsWith(path.resolve(UPLOADS_ROOT))) {
      res.status(400);
      throw new Error("Invalid file path.");
    }

    // Tenant isolation: the first path segment is the tenantId
    if (!isGlobalAdmin(req.user)) {
      const tenantId = req.tenantId?.toString();
      const pathTenantId = relativePath.split("/")[0];

      // "global" folder is accessible to all authenticated users (no-tenant uploads)
      if (pathTenantId !== tenantId && pathTenantId !== "global") {
        res.status(403);
        throw new Error("Not authorised to access this file.");
      }
    }

    // Check file exists
    if (!fs.existsSync(absolutePath)) {
      res.status(404);
      throw new Error("File not found.");
    }

    // Stream the file with correct Content-Type
    res.sendFile(absolutePath);
  }),
);

module.exports = router;
