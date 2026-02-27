const express = require("express");
const path = require("path");
const protect = require("../middleware/authMiddleware");
const { upload, UPLOADS_ROOT } = require("../middleware/uploadMiddleware");
const asyncHandler = require("express-async-handler");

const router = express.Router();

/**
 * POST /api/upload
 *
 * Uploads a single file and returns the publicly accessible URL.
 *
 * Request:  multipart/form-data  { file: <binary> }
 * Response: { success: true, url: "/uploads/<tenantId>/<month>/<filename>", fileName: "..." }
 *
 * The returned URL is relative — prepend your API base URL if serving from
 * a different origin (e.g. http://localhost:5000/uploads/...).
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

    const fileUrl = `/uploads/${relativePath}`;

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
 * Request body: { url: "/uploads/<tenantId>/..." }
 */
router.delete(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const { url } = req.body;

    if (!url || !url.startsWith("/uploads/")) {
      res.status(400);
      throw new Error("Invalid file URL.");
    }

    // Tenant isolation: ensure the URL belongs to the requesting tenant
    const { isGlobalAdmin } = require("../utils/authHelpers");
    if (!isGlobalAdmin(req.user)) {
      const tenantId = req.tenantId?.toString();
      if (!url.includes(`/uploads/${tenantId}/`)) {
        res.status(403);
        throw new Error("Not authorised to delete this file.");
      }
    }

    const fs = require("fs");
    const absolutePath = path.join(UPLOADS_ROOT, url.replace("/uploads/", ""));

    if (!fs.existsSync(absolutePath)) {
      res.status(404);
      throw new Error("File not found.");
    }

    fs.unlinkSync(absolutePath);
    res.json({ success: true, message: "File deleted successfully." });
  }),
);

module.exports = router;
