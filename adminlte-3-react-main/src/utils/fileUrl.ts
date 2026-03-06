/**
 * fileUrl.ts
 *
 * Utility to build fully-qualified, auth-protected file URLs from the
 * relative paths stored in the database.
 *
 * All uploaded files are now served through the authenticated endpoint:
 *   GET /api/uploads/files/<tenantId>/<YYYY-MM>/<filename>
 *
 * This helper normalises both old (/uploads/...) and new (/api/uploads/files/...)
 * URL formats so that existing records in the database continue to work.
 */

import { API_BASE_URL } from "./api";

// Strip /api suffix to get the server base (e.g. http://localhost:5000)
const SERVER_BASE = API_BASE_URL.replace(/\/api$/, "");

/**
 * Converts a stored relative file path to a fully-qualified authenticated URL.
 *
 * Handles three input formats:
 *   1. Legacy:  /uploads/<tenantId>/...
 *   2. New:     /api/uploads/files/<tenantId>/...
 *   3. Already absolute (http/https): returned as-is
 *
 * @example
 *   getFileUrl("/uploads/abc123/2025-01/uuid-photo.jpg")
 *   // → "http://localhost:5000/api/uploads/files/abc123/2025-01/uuid-photo.jpg"
 */
export const getFileUrl = (relativeUrl: string | null | undefined): string => {
  if (!relativeUrl) return "";

  // Already absolute — return as-is (e.g. external CDN URLs)
  if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) {
    return relativeUrl;
  }

  // Already in the new format
  if (relativeUrl.startsWith("/api/uploads/")) {
    return `${SERVER_BASE}${relativeUrl}`;
  }

  // Legacy format: /uploads/<relative-path> → /api/uploads/files/<relative-path>
  if (relativeUrl.startsWith("/uploads/")) {
    const relativePart = relativeUrl.replace(/^\/uploads\//, "");
    return `${SERVER_BASE}/api/uploads/files/${relativePart}`;
  }

  // Fallback — assume it's a bare relative path
  return `${SERVER_BASE}/api/uploads/files/${relativeUrl}`;
};
